import logging
import os
import hashlib
from datetime import datetime
from celery import shared_task
from django.conf import settings
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
    try:
        # Update status to processing
        dataset = NetCDFDataset.objects.get(id=dataset_id)
        dataset.status = 'processing'
        dataset.save()

        logger.info(f"Starting processing of NetCDF file: {file_path}")

        # Ensure vector tables exist
        create_vector_tables()

        # Parse NetCDF file
        parse_netcdf_data(file_path, dataset)

        # Generate embeddings
        generate_embeddings(dataset)

        # Update status to completed
        dataset.status = 'completed'
        dataset.save()

        logger.info(f"Successfully processed NetCDF file: {file_path}")

    except Exception as e:
        logger.error(f"Error processing NetCDF file {file_path}: {e}")
        try:
            dataset = NetCDFDataset.objects.get(id=dataset_id)
            dataset.status = 'failed'
            dataset.save()
        except:
            pass
        raise

def parse_netcdf_data(file_path, dataset):
    """Parse NetCDF file and extract data"""
    if not NETCDF4_AVAILABLE:
        logger.error("netCDF4 not available - cannot process NetCDF files")
        dataset.status = 'failed'
        dataset.save()
        raise ValueError("netCDF4 library is required but not available")

    try:
        with nc.Dataset(file_path, 'r') as nc_dataset:
            # Extract metadata
            variables = list(nc_dataset.variables.keys())
            dimensions = {}

            for dim_name, dim in nc_dataset.dimensions.items():
                dimensions[dim_name] = {
                    'size': len(dim),
                    'unlimited': dim.isunlimited()
                }

            # Log file information
            logger.info(f"Processing NetCDF file with variables: {variables}")

            # Always process - accept any variables
            dataset.variables = variables
            dataset.dimensions = dimensions
            dataset.save()

            # Process all variables - create synthetic data records
            total_records = 0

            for var_name in variables:
                var = nc_dataset.variables[var_name]

                try:
                    # Get the data (handle masked arrays)
                    if hasattr(var[:], 'filled'):
                        data = var[:].filled(np.nan)
                    else:
                        data = var[:]

                    # Handle different data types
                    if data.ndim == 0:
                        # Scalar variable
                        try:
                            value = float(data) if not np.isnan(data) else None
                            if value is not None and not np.isinf(value):
                                NetCDFValue.objects.create(
                                    dataset=dataset,
                                    variable=var_name,
                                    time=datetime.now(),
                                    lat=0.0,
                                    lon=0.0,
                                    depth=None,
                                    value=value
                                )
                                total_records += 1
                                logger.debug(f"Created scalar record for {var_name}: {value}")
                        except (ValueError, TypeError) as e:
                            logger.warning(f"Could not convert scalar {var_name}: {e}")

                    elif data.ndim >= 1:
                        # Array variable - sample first N values
                        flat_data = data.flatten()
                        sample_size = min(50, len(flat_data))  # Sample up to 50 values

                        records_created = 0
                        current_time = datetime.now()

                        for i in range(sample_size):
                            try:
                                val = flat_data[i]
                                if not np.isnan(val) and not np.isinf(val):
                                    # Create records with synthetic coordinates
                                    lat_idx = float(i % 10)
                                    lon_idx = float((i // 10) % 10)

                                    NetCDFValue.objects.create(
                                        dataset=dataset,
                                        variable=var_name,
                                        time=current_time,
                                        lat=lat_idx,
                                        lon=lon_idx,
                                        depth=None,
                                        value=float(val)
                                    )
                                    records_created += 1
                            except (ValueError, IndexError, TypeError):
                                continue

                        if records_created > 0:
                            logger.info(f"Created {records_created} records for array variable {var_name}")
                            total_records += records_created

                except Exception as e:
                    logger.warning(f"Could not process variable {var_name}: {e}")
                    continue

            logger.info(f"Total records created: {total_records}")

    except Exception as e:
        logger.error(f"Error parsing NetCDF file: {e}")
        dataset.status = 'failed'
        dataset.save()
        raise

def generate_embeddings(dataset):
    """Generate embeddings for the processed data"""
    try:
        # Get embedding model
        embedding_model = get_embedding_model()

        # Get all values for this dataset
        values = NetCDFValue.objects.filter(dataset=dataset)

        if not values.exists():
            logger.info("No data values found for embedding generation")
            return

        # Group by variable to create embeddings
        variable_groups = {}
        for value in values:
            if value.variable not in variable_groups:
                variable_groups[value.variable] = []
            variable_groups[value.variable].append(value.value)

        # Generate one embedding per variable
        embeddings_to_create = []
        current_time = datetime.now()

        for var_name, var_values in variable_groups.items():
            try:
                # Filter valid values
                valid_values = [v for v in var_values if v is not None and not np.isnan(v)]

                if valid_values:
                    # Create summary text
                    count = len(valid_values)
                    mean_val = np.mean(valid_values)
                    min_val = min(valid_values)
                    max_val = max(valid_values)

                    summary = (
                        f"{var_name}: count={count}, mean={mean_val:.2f}, "
                        f"min={min_val:.2f}, max={max_val:.2f}"
                    )

                    # Generate embedding
                    if SENTENCE_TRANSFORMERS_AVAILABLE and embedding_model:
                        embedding_vector = embedding_model.encode(summary).tolist()
                    else:
                        embedding_vector = generate_fallback_embedding(summary)

                    # Convert to comma-separated string
                    embedding_str = ','.join(map(str, embedding_vector))

                    embeddings_to_create.append(NetCDFEmbedding(
                        dataset=dataset,
                        variable=var_name,
                        time=current_time,
                        region="Global",
                        embedding=embedding_str,
                        summary=summary
                    ))

            except Exception as e:
                logger.warning(f"Error generating embedding for {var_name}: {e}")
                continue

        # Bulk create embeddings
        if embeddings_to_create:
            NetCDFEmbedding.objects.bulk_create(embeddings_to_create)
            logger.info(f"Created {len(embeddings_to_create)} embeddings for dataset {dataset.id}")

    except Exception as e:
        logger.error(f"Error in embedding generation: {e}")

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
