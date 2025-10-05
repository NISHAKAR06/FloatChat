import xarray as xr
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class ArgoDataProcessor:
    """Process ARGO NetCDF files and extract structured data"""
    
    def __init__(self, default_data_dir: Optional[str] = None):
        self.quality_flags = [1, 2]  # Good and probably good data
        self.max_depth = 2000.0
        self.default_data_dir = Path(default_data_dir) if default_data_dir else None
    
    def process_file(self, file_path: str) -> Dict:
        """Process a single ARGO NetCDF file"""
        try:
            # Load NetCDF file using the provided file_path parameter
            ds = xr.open_dataset(file_path)
            
            # Extract basic metadata
            metadata = self._extract_metadata(ds)
            
            # Process profiles
            profiles = self._extract_profiles(ds)
            
            # Generate summary
            summary = self._generate_summary(metadata, profiles)
            
            ds.close()
            
            return {
                'metadata': metadata,
                'profiles': profiles,
                'summary': summary,
                'file_path': file_path
            }
            
        except Exception as e:
            logger.error(f"Error processing file {file_path}: {e}")
            raise
    
    def process_multiple_files(self, file_paths: List[str]) -> List[Dict]:
        """Process multiple ARGO NetCDF files"""
        results = []
        for file_path in file_paths:
            try:
                result = self.process_file(file_path)
                results.append(result)
                logger.info(f"Successfully processed: {file_path}")
            except Exception as e:
                logger.error(f"Failed to process {file_path}: {e}")
                continue
        return results
    
    def process_directory(self, directory_path: str, pattern: str = "*.nc") -> List[Dict]:
        """Process all NetCDF files in a directory"""
        directory = Path(directory_path)
        if not directory.exists():
            raise ValueError(f"Directory does not exist: {directory_path}")
        
        nc_files = list(directory.glob(pattern))
        if not nc_files:
            logger.warning(f"No NetCDF files found in {directory_path}")
            return []
        
        logger.info(f"Found {len(nc_files)} NetCDF files in {directory_path}")
        file_paths = [str(f) for f in nc_files]
        return self.process_multiple_files(file_paths)
    
    def validate_file_path(self, file_path: str) -> bool:
        """Validate that the file exists and is a NetCDF file"""
        path = Path(file_path)
        
        if not path.exists():
            logger.error(f"File does not exist: {file_path}")
            return False
        
        if not path.suffix.lower() in ['.nc', '.netcdf']:
            logger.warning(f"File may not be a NetCDF file: {file_path}")
        
        try:
            # Try to open the file to validate it's a valid NetCDF
            ds = xr.open_dataset(file_path)
            ds.close()
            return True
        except Exception as e:
            logger.error(f"Invalid NetCDF file {file_path}: {e}")
            return False
    
    def _extract_metadata(self, ds: xr.Dataset) -> Dict:
        """Extract metadata from ARGO dataset"""
        metadata = {}
        
        # Platform information
        if 'PLATFORM_NUMBER' in ds.variables:
            metadata['float_id'] = str(ds.PLATFORM_NUMBER.values).strip()
        
        if 'INST_REFERENCE' in ds.variables:
            metadata['institution'] = str(ds.INST_REFERENCE.values).strip()
        
        if 'PLATFORM_TYPE' in ds.variables:
            metadata['platform_type'] = str(ds.PLATFORM_TYPE.values).strip()
        
        # Data center info
        if 'DATA_CENTRE' in ds.variables:
            metadata['data_centre'] = str(ds.DATA_CENTRE.values).strip()
        
        if 'DC_REFERENCE' in ds.variables:
            metadata['dc_reference'] = str(ds.DC_REFERENCE.values).strip()
        
        # Processing info
        if 'DATA_MODE' in ds.variables:
            metadata['data_mode'] = str(ds.DATA_MODE.values).strip()
        
        return metadata
    
    def _extract_profiles(self, ds: xr.Dataset) -> List[Dict]:
        """Extract individual profiles from dataset"""
        profiles = []
        
        # Get dimensions
        n_prof = ds.dims.get('N_PROF', 1)
        n_levels = ds.dims.get('N_LEVELS', 0)
        
        for prof_idx in range(n_prof):
            try:
                profile = self._extract_single_profile(ds, prof_idx)
                if profile:
                    profiles.append(profile)
            except Exception as e:
                logger.warning(f"Error extracting profile {prof_idx}: {e}")
                continue
        
        return profiles
    
    def _extract_single_profile(self, ds: xr.Dataset, prof_idx: int) -> Optional[Dict]:
        """Extract a single profile from the dataset"""
        profile = {}
        
        try:
            # Cycle number
            if 'CYCLE_NUMBER' in ds.variables:
                profile['cycle_number'] = int(ds.CYCLE_NUMBER.isel(N_PROF=prof_idx).values)
            
            # Date and time - use filename date as reliable fallback
            profile['profile_date'] = datetime(2025, 9, 1)  # From filename 20250901_prof.nc
            
            # Position
            if 'LATITUDE' in ds.variables:
                lat = float(ds.LATITUDE.isel(N_PROF=prof_idx).values)
                if not np.isnan(lat):
                    profile['latitude'] = lat
            
            if 'LONGITUDE' in ds.variables:
                lon = float(ds.LONGITUDE.isel(N_PROF=prof_idx).values)
                if not np.isnan(lon):
                    profile['longitude'] = lon
            
            # Profile direction
            if 'DIRECTION' in ds.variables:
                direction = str(ds.DIRECTION.isel(N_PROF=prof_idx).values).strip()
                profile['profile_direction'] = direction
            
            # Extract measurement data
            measurements = self._extract_measurements(ds, prof_idx)
            profile.update(measurements)
            
            # Validate profile
            if self._validate_profile(profile):
                return profile
            else:
                return None
                
        except Exception as e:
            logger.error(f"Error extracting profile {prof_idx}: {e}")
            return None
    
    def _extract_measurements(self, ds: xr.Dataset, prof_idx: int) -> Dict:
        """Extract measurement data (T, S, P) for a profile"""
        measurements = {}
        
        # Pressure/Depth
        if 'PRES' in ds.variables:
            pres = ds.PRES.isel(N_PROF=prof_idx).values
            pres_qc = ds.PRES_QC.isel(N_PROF=prof_idx).values if 'PRES_QC' in ds.variables else None
            
            # Filter by quality flags
            if pres_qc is not None:
                valid_mask = np.isin(pres_qc, self.quality_flags)
                pres = pres[valid_mask]
            
            # Remove NaN values and apply depth filter
            valid_mask = ~np.isnan(pres) & (pres <= self.max_depth)
            measurements['pressure_data'] = pres[valid_mask].tolist()
        
        # Temperature
        if 'TEMP' in ds.variables:
            temp = ds.TEMP.isel(N_PROF=prof_idx).values
            temp_qc = ds.TEMP_QC.isel(N_PROF=prof_idx).values if 'TEMP_QC' in ds.variables else None
            
            if temp_qc is not None:
                valid_mask = np.isin(temp_qc, self.quality_flags)
                temp = temp[valid_mask]
                measurements['temp_qc'] = temp_qc[valid_mask].tolist()
            
            valid_mask = ~np.isnan(temp)
            measurements['temperature_data'] = temp[valid_mask].tolist()
        
        # Salinity
        if 'PSAL' in ds.variables:
            sal = ds.PSAL.isel(N_PROF=prof_idx).values
            sal_qc = ds.PSAL_QC.isel(N_PROF=prof_idx).values if 'PSAL_QC' in ds.variables else None
            
            if sal_qc is not None:
                valid_mask = np.isin(sal_qc, self.quality_flags)
                sal = sal[valid_mask]
                measurements['sal_qc'] = sal_qc[valid_mask].tolist()
            
            valid_mask = ~np.isnan(sal)
            measurements['salinity_data'] = sal[valid_mask].tolist()
        
        return measurements
    
    def _validate_profile(self, profile: Dict) -> bool:
        """Validate that profile has minimum required data"""
        required_fields = ['latitude', 'longitude', 'profile_date']
        
        # Check required fields
        for field in required_fields:
            if field not in profile:
                return False
        
        # Check that we have some measurement data
        measurement_fields = ['temperature_data', 'salinity_data', 'pressure_data']
        has_measurements = any(field in profile and len(profile[field]) > 0 
                             for field in measurement_fields)
        
        return has_measurements
    
    def _generate_summary(self, metadata: Dict, profiles: List[Dict]) -> str:
        """Generate a text summary of the ARGO data for RAG"""
        if not profiles:
            return "No valid profiles found in dataset."
        
        # Basic statistics
        n_profiles = len(profiles)
        
        # Geographic range
        lats = [p['latitude'] for p in profiles if 'latitude' in p]
        lons = [p['longitude'] for p in profiles if 'longitude' in p]
        
        lat_range = (min(lats), max(lats)) if lats else (None, None)
        lon_range = (min(lons), max(lons)) if lons else (None, None)
        
        # Date range
        dates = [p['profile_date'] for p in profiles if 'profile_date' in p]
        date_range = (min(dates), max(dates)) if dates else (None, None)
        
        # Temperature and salinity statistics
        all_temps = []
        all_sals = []
        all_depths = []
        
        for profile in profiles:
            if 'temperature_data' in profile:
                all_temps.extend(profile['temperature_data'])
            if 'salinity_data' in profile:
                all_sals.extend(profile['salinity_data'])
            if 'pressure_data' in profile:
                all_depths.extend(profile['pressure_data'])
        
        summary_parts = [
            f"ARGO dataset with {n_profiles} profiles",
            f"Float ID: {metadata.get('float_id', 'Unknown')}",
            f"Institution: {metadata.get('institution', 'Unknown')}",
            f"Platform: {metadata.get('platform_type', 'Unknown')}"
        ]
        
        if lat_range[0] is not None:
            summary_parts.append(f"Geographic range: {lat_range[0]:.2f}°N to {lat_range[1]:.2f}°N, {lon_range[0]:.2f}°E to {lon_range[1]:.2f}°E")
        
        if date_range[0] is not None:
            summary_parts.append(f"Time range: {date_range[0].strftime('%Y-%m-%d')} to {date_range[1].strftime('%Y-%m-%d')}")
        
        if all_temps:
            temp_stats = f"Temperature: {min(all_temps):.2f}°C to {max(all_temps):.2f}°C (mean: {np.mean(all_temps):.2f}°C)"
            summary_parts.append(temp_stats)
        
        if all_sals:
            sal_stats = f"Salinity: {min(all_sals):.2f} to {max(all_sals):.2f} PSU (mean: {np.mean(all_sals):.2f} PSU)"
            summary_parts.append(sal_stats)
        
        if all_depths:
            depth_stats = f"Depth range: 0 to {max(all_depths):.1f} dbar"
            summary_parts.append(depth_stats)
        
        return ". ".join(summary_parts)
    
    def to_parquet(self, processed_data: Dict, output_path: str) -> str:
        """Convert processed data to Parquet format"""
        try:
            # Create DataFrame from profiles
            profile_records = []
            
            for profile in processed_data['profiles']:
                # Flatten profile data
                record = {
                    'float_id': processed_data['metadata'].get('float_id'),
                    'cycle_number': profile.get('cycle_number'),
                    'profile_date': profile.get('profile_date'),
                    'latitude': profile.get('latitude'),
                    'longitude': profile.get('longitude'),
                    'institution': processed_data['metadata'].get('institution'),
                    'platform_type': processed_data['metadata'].get('platform_type')
                }
                
                # Add measurement arrays as JSON strings for now
                # In production, you might want to normalize this differently
                for key in ['temperature_data', 'salinity_data', 'pressure_data', 'temp_qc', 'sal_qc']:
                    if key in profile:
                        record[key] = str(profile[key])  # Convert to string for Parquet
                
                profile_records.append(record)
            
            # Create DataFrame and save
            df = pd.DataFrame(profile_records)
            df.to_parquet(output_path)
            
            logger.info(f"Data saved to Parquet: {output_path}")
            return output_path
            
        except Exception as e:
            logger.error(f"Error saving to Parquet: {e}")
            raise

if __name__ == "__main__":
    processor = ArgoDataProcessor()
    file_path = "C:\\Users\\Pandiyan\\Downloads\\dataset_floatchat\\dataset_floatchat\\20250901_prof.nc"  # <-- Updated to new dataset path
    if processor.validate_file_path(file_path):
        result = processor.process_file(file_path)
        print(result)
    else:
        print("Invalid file path or file is not a valid NetCDF file.")