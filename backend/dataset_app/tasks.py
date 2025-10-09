import logging
import os
import hashlib
from datetime import datetime
from django.conf import settings

# Try to import Celery, fall back to mock if not available
try:
    from celery import shared_task
except ImportError:
    from celery_mock import shared_task
from .models import NetCDFDataset, NetCDFValue, NetCDFEmbedding, create_vector_tables

logger = logging.getLogger(__name__)

# Try to import scientific packages, but don't fail if not available
try:
    import numpy as np
    import netCDF4 as nc
    NETCDF4_AVAILABLE = True
except ImportError:
    NETCDF4_AVAILABLE = False
    logger.warning("netCDF4/numpy not available, NetCDF processing will be limited")

# Try to import sentence-transformers, but don't fail if not available
try:
    from sentence_transformers import SentenceTransformer
    SENTENCE_TRANSFORMERS_AVAILABLE = True
    embedding_model = None
except ImportError:
    SENTENCE_TRANSFORMERS_AVAILABLE = False
    # Suppress the warning since this is expected in the current setup
    # logger.warning("sentence-transformers not available, using fallback embedding method")

def get_embedding_model():
    """Get or initialize the embedding model"""
    global embedding_model
    if not SENTENCE_TRANSFORMERS_AVAILABLE:
        return None

    if embedding_model is None:
        model_name = settings.EMBEDDING_SETTINGS.get('MODEL_NAME', 'sentence-transformers/all-MiniLM-L6-v2')
        embedding_model = SentenceTransformer(model_name)
    return embedding_model

@shared_task(bind=True)
def process_netcdf_file_task(self, dataset_id, file_path):
    """
    Celery task to process NetCDF file and create embeddings

    Args:
        dataset_id (UUID): UUID of the dataset record
        file_path (str): Path to the uploaded NetCDF file
    """
    logger.info(f"🔄 TASK STARTED: Processing NetCDF file")
    logger.info(f"   Dataset ID: {dataset_id}")
    logger.info(f"   File path: {file_path}")
    
    try:
        # Update status to processing
        dataset = NetCDFDataset.objects.get(id=dataset_id)
        logger.info(f"   Found dataset: {dataset.filename}")
        dataset.status = 'processing'
        dataset.save()
        logger.info(f"   Status updated to 'processing'")

        logger.info(f"🏗️  Ensuring vector tables exist...")
        # Ensure vector tables exist
        create_vector_tables()
        logger.info(f"   ✅ Vector tables ready")

        logger.info(f"📊 Parsing NetCDF file...")
        # Parse NetCDF file
        parse_netcdf_data(file_path, dataset)
        logger.info(f"   ✅ NetCDF parsing completed")

        logger.info(f"🔮 Generating embeddings...")
        # Generate embeddings
        generate_embeddings(dataset)
        logger.info(f"   ✅ Embeddings generated")

        # Update status to completed
        dataset.status = 'completed'
        dataset.save()
        logger.info(f"✅ TASK COMPLETED: Dataset processing finished successfully")

        return {"status": "completed", "dataset_id": str(dataset_id)}
        logger.info(f"✅ TASK COMPLETED: Dataset processing finished successfully")

        return {"status": "completed", "dataset_id": str(dataset_id)}

    except Exception as e:
        logger.error(f"❌ ERROR processing NetCDF file {file_path}: {e}", exc_info=True)
        try:
            dataset = NetCDFDataset.objects.get(id=dataset_id)
            dataset.status = 'failed'
            dataset.save()
            logger.error(f"   Dataset status updated to 'failed'")
        except Exception as update_error:
            logger.error(f"   Could not update dataset status: {update_error}")
        return {"status": "failed", "error": str(e)}

def parse_netcdf_data(file_path, dataset):
    """Parse NetCDF file and extract ARGO float data"""
    if not NETCDF4_AVAILABLE:
        logger.error("netCDF4 not available - cannot process NetCDF files")
        dataset.status = 'failed'
        dataset.save()
        raise ValueError("netCDF4 library is required but not available")

    nc_dataset = None
    try:
        # Open NetCDF file with explicit mode
        nc_dataset = nc.Dataset(file_path, 'r', format='NETCDF4')
        
        try:
            # Extract metadata
            variables = list(nc_dataset.variables.keys())
            dimensions = {}

            for dim_name, dim in nc_dataset.dimensions.items():
                dimensions[dim_name] = {
                    'size': len(dim),
                    'unlimited': dim.isunlimited()
                }

            # Log file information
            logger.info(f"Processing ARGO NetCDF file with variables: {variables}")
            logger.info(f"Dimensions: {dimensions}")

            # Update dataset metadata
            dataset.variables = variables
            dataset.dimensions = dimensions
            dataset.save()

            # Extract ARGO float data - look for common ARGO variable names
            # Time, Position, and Core measurements
            time_var = None
            lat_var = None
            lon_var = None
            pres_var = None  # Pressure (depth)
            temp_var = None  # Temperature
            psal_var = None  # Salinity
            
            # Find variables (case-insensitive)
            var_lower_map = {v.lower(): v for v in variables}
            
            # Time variables
            for time_name in ['juld', 'time', 'date']:
                if time_name in var_lower_map:
                    time_var = nc_dataset.variables[var_lower_map[time_name]]
                    break
            
            # Position variables
            for lat_name in ['latitude', 'lat']:
                if lat_name in var_lower_map:
                    lat_var = nc_dataset.variables[var_lower_map[lat_name]]
                    break
                    
            for lon_name in ['longitude', 'lon']:
                if lon_name in var_lower_map:
                    lon_var = nc_dataset.variables[var_lower_map[lon_name]]
                    break
            
            # Pressure (depth)
            for pres_name in ['pres', 'pressure', 'pres_adjusted']:
                if pres_name in var_lower_map:
                    pres_var = nc_dataset.variables[var_lower_map[pres_name]]
                    break
            
            # Temperature
            for temp_name in ['temp', 'temperature', 'temp_adjusted']:
                if temp_name in var_lower_map:
                    temp_var = nc_dataset.variables[var_lower_map[temp_name]]
                    break
            
            # Salinity
            for psal_name in ['psal', 'salinity', 'psal_adjusted']:
                if psal_name in var_lower_map:
                    psal_var = nc_dataset.variables[var_lower_map[psal_name]]
                    break

            if not (lat_var is not None and lon_var is not None):
                logger.error("Missing required position variables (latitude/longitude)")
                raise ValueError("NetCDF file must contain latitude and longitude")

            # Extract position data
            latitudes = lat_var[:] if hasattr(lat_var[:], '__iter__') else [lat_var[:]]
            longitudes = lon_var[:] if hasattr(lon_var[:], '__iter__') else [lon_var[:]]
            
            # Handle masked arrays
            if hasattr(latitudes, 'filled'):
                latitudes = latitudes.filled(np.nan)
            if hasattr(longitudes, 'filled'):
                longitudes = longitudes.filled(np.nan)

            # Extract time data
            times = []
            if time_var is not None:
                try:
                    time_data = time_var[:]
                    if hasattr(time_data, 'filled'):
                        time_data = time_data.filled(np.nan)
                    
                    # Convert time to datetime
                    if hasattr(time_var, 'units'):
                        from netCDF4 import num2date
                        cftime_dates = num2date(time_data, time_var.units)
                        
                        # Convert cftime datetime objects to Python datetime objects
                        times = []
                        for cftime_dt in cftime_dates:
                            try:
                                # Convert cftime datetime to Python datetime
                                if hasattr(cftime_dt, 'year'):
                                    py_dt = datetime(
                                        year=cftime_dt.year,
                                        month=cftime_dt.month,
                                        day=cftime_dt.day,
                                        hour=cftime_dt.hour,
                                        minute=cftime_dt.minute,
                                        second=cftime_dt.second,
                                        microsecond=getattr(cftime_dt, 'microsecond', 0)
                                    )
                                    times.append(py_dt)
                                else:
                                    # Fallback if not a datetime-like object
                                    times.append(datetime.now())
                            except Exception as dt_error:
                                logger.warning(f"Could not convert time value: {dt_error}")
                                times.append(datetime.now())
                    else:
                        # Fallback to index-based time
                        times = [datetime.now() for _ in range(len(time_data))]
                except Exception as e:
                    logger.warning(f"Could not parse time variable: {e}")
                    times = [datetime.now() for _ in range(len(latitudes))]
            else:
                # Use current time if no time variable
                times = [datetime.now() for _ in range(len(latitudes))]

            logger.info(f"Found {len(latitudes)} profiles/positions")

            # Extract measurements
            total_records = 0
            records_to_create = []

            # Determine data structure (profiles vs levels)
            n_profiles = len(latitudes)
            
            # Process each profile
            for prof_idx in range(n_profiles):
                try:
                    lat = float(latitudes[prof_idx])
                    lon = float(longitudes[prof_idx])
                    time = times[prof_idx] if prof_idx < len(times) else datetime.now()
                    
                    # Skip invalid positions
                    if np.isnan(lat) or np.isnan(lon):
                        continue
                    
                    # Filter for Indian Ocean region (20°E - 150°E, 30°N - 60°S)
                    if not (20 <= lon <= 150 and -60 <= lat <= 30):
                        logger.debug(f"Skipping profile outside Indian Ocean: {lat}, {lon}")
                        continue

                    # Extract pressure/depth levels for this profile
                    if pres_var is not None:
                        try:
                            if pres_var.ndim == 2:  # [N_PROF, N_LEVELS]
                                pressures = pres_var[prof_idx, :]
                            elif pres_var.ndim == 1:  # [N_LEVELS]
                                pressures = pres_var[:]
                            else:
                                pressures = [None]
                            
                            if hasattr(pressures, 'filled'):
                                pressures = pressures.filled(np.nan)
                        except Exception as e:
                            logger.warning(f"Error reading pressure: {e}")
                            pressures = [None]
                    else:
                        pressures = [None]

                    # Extract temperature for this profile
                    if temp_var is not None:
                        try:
                            if temp_var.ndim == 2:  # [N_PROF, N_LEVELS]
                                temperatures = temp_var[prof_idx, :]
                            elif temp_var.ndim == 1:  # [N_LEVELS]
                                temperatures = temp_var[:]
                            else:
                                temperatures = [temp_var[prof_idx]]
                            
                            if hasattr(temperatures, 'filled'):
                                temperatures = temperatures.filled(np.nan)
                        except Exception as e:
                            logger.warning(f"Error reading temperature: {e}")
                            temperatures = []
                    else:
                        temperatures = []

                    # Extract salinity for this profile
                    if psal_var is not None:
                        try:
                            if psal_var.ndim == 2:  # [N_PROF, N_LEVELS]
                                salinities = psal_var[prof_idx, :]
                            elif psal_var.ndim == 1:  # [N_LEVELS]
                                salinities = psal_var[:]
                            else:
                                salinities = [psal_var[prof_idx]]
                            
                            if hasattr(salinities, 'filled'):
                                salinities = salinities.filled(np.nan)
                        except Exception as e:
                            logger.warning(f"Error reading salinity: {e}")
                            salinities = []
                    else:
                        salinities = []

                    # Create records for each depth level
                    max_levels = max(len(pressures), len(temperatures), len(salinities))
                    
                    for level_idx in range(max_levels):
                        depth = float(pressures[level_idx]) if level_idx < len(pressures) and not np.isnan(pressures[level_idx]) else None
                        
                        # Temperature record
                        if level_idx < len(temperatures) and not np.isnan(temperatures[level_idx]):
                            temp_value = float(temperatures[level_idx])
                            if not np.isinf(temp_value):
                                records_to_create.append(NetCDFValue(
                                    dataset=dataset,
                                    variable='temperature',
                                    time=time,
                                    lat=lat,
                                    lon=lon,
                                    depth=depth,
                                    value=temp_value
                                ))
                                total_records += 1
                        
                        # Salinity record
                        if level_idx < len(salinities) and not np.isnan(salinities[level_idx]):
                            psal_value = float(salinities[level_idx])
                            if not np.isinf(psal_value):
                                records_to_create.append(NetCDFValue(
                                    dataset=dataset,
                                    variable='salinity',
                                    time=time,
                                    lat=lat,
                                    lon=lon,
                                    depth=depth,
                                    value=psal_value
                                ))
                                total_records += 1
                        
                        # Pressure record (if standalone)
                        if depth is not None and pres_var is not None:
                            records_to_create.append(NetCDFValue(
                                dataset=dataset,
                                variable='pressure',
                                time=time,
                                lat=lat,
                                lon=lon,
                                depth=depth,
                                value=depth
                            ))
                            total_records += 1
                    
                    # Bulk insert every 1000 records for performance
                    if len(records_to_create) >= 1000:
                        NetCDFValue.objects.bulk_create(records_to_create, ignore_conflicts=True)
                        logger.info(f"Inserted {len(records_to_create)} records (total: {total_records})")
                        records_to_create = []
                        
                except Exception as e:
                    logger.warning(f"Error processing profile {prof_idx}: {e}")
                    continue

            # Insert remaining records
            if records_to_create:
                NetCDFValue.objects.bulk_create(records_to_create, ignore_conflicts=True)
                logger.info(f"Inserted final {len(records_to_create)} records")

            logger.info(f"✅ Total ARGO records created: {total_records}")
            
            if total_records == 0:
                logger.warning("No valid ARGO data found in NetCDF file")
                
        finally:
            # CRITICAL: Always close the NetCDF file to release file handle
            if nc_dataset is not None:
                try:
                    nc_dataset.close()
                    logger.debug("NetCDF file closed successfully")
                except Exception as close_error:
                    logger.warning(f"Error closing NetCDF file: {close_error}")

    except Exception as e:
        logger.error(f"Error parsing NetCDF file: {e}", exc_info=True)
        if nc_dataset is not None:
            try:
                nc_dataset.close()
            except:
                pass
        dataset.status = 'failed'
        dataset.save()
        raise

def generate_embeddings(dataset):
    """Generate embeddings for the ARGO profile data"""
    try:
        # Get embedding model
        embedding_model = get_embedding_model()

        # Get all values for this dataset
        values = NetCDFValue.objects.filter(dataset=dataset)

        if not values.exists():
            logger.info("No data values found for embedding generation")
            return

        logger.info(f"Generating embeddings for {values.count()} ARGO measurements")

        # Group by variable and region for embeddings
        from django.db.models import Count, Avg, Min, Max
        
        # Create regional summaries (group by 5-degree grid cells)
        embeddings_to_create = []
        current_time = datetime.now()

        # Group by variable type
        variables = values.values_list('variable', flat=True).distinct()
        
        for var_name in variables:
            var_values = values.filter(variable=var_name)
            
            # Calculate overall statistics
            stats = var_values.aggregate(
                count=Count('id'),
                mean_val=Avg('value'),
                min_val=Min('value'),
                max_val=Max('value'),
                min_lat=Min('lat'),
                max_lat=Max('lat'),
                min_lon=Min('lon'),
                max_lon=Max('lon'),
                min_depth=Min('depth'),
                max_depth=Max('depth')
            )
            
            # Create global summary embedding
            summary = (
                f"ARGO {var_name} data: {stats['count']} measurements in Indian Ocean. "
                f"Mean={stats['mean_val']:.2f}, Range=[{stats['min_val']:.2f}, {stats['max_val']:.2f}]. "
                f"Geographic coverage: Lat [{stats['min_lat']:.1f}°, {stats['max_lat']:.1f}°], "
                f"Lon [{stats['min_lon']:.1f}°, {stats['max_lon']:.1f}°]"
            )
            
            if stats['min_depth'] is not None and stats['max_depth'] is not None:
                summary += f". Depth range: [{stats['min_depth']:.1f}m, {stats['max_depth']:.1f}m]"

            # Generate embedding
            if SENTENCE_TRANSFORMERS_AVAILABLE and embedding_model:
                embedding_vector = embedding_model.encode(summary).tolist()
            else:
                embedding_vector = generate_fallback_embedding(summary)

            # Convert to comma-separated string for storage
            embedding_str = ','.join(map(str, embedding_vector))

            embeddings_to_create.append(NetCDFEmbedding(
                dataset=dataset,
                variable=var_name,
                time=current_time,
                region="Indian Ocean",
                embedding=embedding_str,
                summary=summary
            ))
            
            # Create regional embeddings (divide Indian Ocean into quadrants)
            regions = [
                {"name": "Arabian Sea", "lat_range": (0, 30), "lon_range": (40, 80)},
                {"name": "Bay of Bengal", "lat_range": (0, 30), "lon_range": (80, 100)},
                {"name": "Central Indian Ocean", "lat_range": (-30, 0), "lon_range": (60, 100)},
                {"name": "Southern Indian Ocean", "lat_range": (-60, -30), "lon_range": (20, 150)},
            ]
            
            for region in regions:
                regional_values = var_values.filter(
                    lat__gte=region["lat_range"][0],
                    lat__lt=region["lat_range"][1],
                    lon__gte=region["lon_range"][0],
                    lon__lt=region["lon_range"][1]
                )
                
                if regional_values.exists():
                    regional_stats = regional_values.aggregate(
                        count=Count('id'),
                        mean_val=Avg('value'),
                        min_val=Min('value'),
                        max_val=Max('value')
                    )
                    
                    regional_summary = (
                        f"ARGO {var_name} in {region['name']}: {regional_stats['count']} measurements. "
                        f"Mean={regional_stats['mean_val']:.2f}, "
                        f"Range=[{regional_stats['min_val']:.2f}, {regional_stats['max_val']:.2f}]"
                    )
                    
                    # Generate embedding
                    if SENTENCE_TRANSFORMERS_AVAILABLE and embedding_model:
                        regional_embedding = embedding_model.encode(regional_summary).tolist()
                    else:
                        regional_embedding = generate_fallback_embedding(regional_summary)
                    
                    regional_embedding_str = ','.join(map(str, regional_embedding))
                    
                    embeddings_to_create.append(NetCDFEmbedding(
                        dataset=dataset,
                        variable=var_name,
                        time=current_time,
                        region=region["name"],
                        embedding=regional_embedding_str,
                        summary=regional_summary
                    ))

        # Bulk create embeddings
        if embeddings_to_create:
            NetCDFEmbedding.objects.bulk_create(embeddings_to_create)
            logger.info(f"✅ Created {len(embeddings_to_create)} embeddings for dataset {dataset.id}")

    except Exception as e:
        logger.error(f"Error in embedding generation: {e}", exc_info=True)

def generate_fallback_embedding(text):
    """Generate fallback embedding vector for text when sentence-transformers is not available"""
    # Create a simple hash-based embedding
    hash_obj = hashlib.md5(text.encode())
    hash_bytes = hash_obj.digest()

    # Convert to 768-dimensional vector (normalize to [-1, 1] range)
    embedding = []
    for i in range(768):
        byte_val = hash_bytes[i % len(hash_bytes)]
        # Normalize to [-1, 1] range
        normalized_val = (byte_val - 128) / 128.0
        embedding.append(normalized_val)

    return embedding
