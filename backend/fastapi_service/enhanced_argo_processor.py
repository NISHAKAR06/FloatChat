"""
Enhanced ARGO NetCDF processor with database integration and 768-dimensional embeddings.
Processes real ARGO NetCDF files and stores them in PostgreSQL with vector embeddings.
"""

import os
import xarray as xr
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
import logging
import json
from pathlib import Path
from dataclasses import dataclass
import requests

from .database import DatabaseManager
from .vector_store import VectorStore
from .config import Config

logger = logging.getLogger(__name__)

@dataclass
class NetCDFSlice:
    """Represents a processed slice of NetCDF data"""
    float_id: str
    cycle_number: int
    profile_date: datetime
    latitude: float
    longitude: float
    temperature_data: List[float]
    salinity_data: List[float]
    pressure_data: List[float]
    temp_qc: List[int]
    sal_qc: List[int]
    institution: str
    platform_type: str
    data_mode: str
    region: str
    summary: str
    embedding: Optional[List[float]] = None

class EnhancedArgoProcessor:
    """Enhanced ARGO processor with database integration and embeddings"""

    def __init__(self, config: Config, db_manager: Optional[DatabaseManager] = None):
        self.config = config
        self.db_manager = db_manager or DatabaseManager(config.database_uri)
        self.vector_store = VectorStore(config.database_uri, config.ollama_embedding_model, config.ollama_url)
        self.quality_flags = config.quality_flags
        self.max_depth = config.max_depth
        self.min_profiles = config.min_profiles

        logger.info("Enhanced ARGO processor initialized with database integration")

    def process_netcdf_file(self, file_path: str) -> Dict[str, Any]:
        """Process a single NetCDF file and store in database"""
        try:
            logger.info(f"Processing NetCDF file: {file_path}")

            # Validate file
            if not self._validate_netcdf_file(file_path):
                raise ValueError(f"Invalid NetCDF file: {file_path}")

            # Load and parse NetCDF
            with xr.open_dataset(file_path) as ds:
                metadata = self._extract_metadata(ds)
                slices_data = self._extract_slices_data(ds, metadata)

            # Process and store slices
            stored_slices = []
            for slice_data in slices_data:
                try:
                    # Generate embedding for the slice
                    summary_text = self._generate_slice_summary(slice_data)
                    embedding = self.vector_store.generate_embedding(summary_text)

                    # Store in database
                    profile_data = {
                        'float_id': slice_data.float_id,
                        'profile_date': slice_data.profile_date.isoformat() if isinstance(slice_data.profile_date, datetime) else str(slice_data.profile_date),
                        'cycle_number': slice_data.cycle_number,
                        'latitude': slice_data.latitude,
                        'longitude': slice_data.longitude,
                        'temperature_data': slice_data.temperature_data,
                        'salinity_data': slice_data.salinity_data,
                        'pressure_data': slice_data.pressure_data,
                        'summary': summary_text,
                        'region': slice_data.region,
                        'advanced_features': self._extract_advanced_features(slice_data),
                        'data_quality': 'processed'
                    }

                    profile_id = self.db_manager.store_argo_profile(profile_data, embedding)
                    slice_data.embedding = embedding

                    stored_slices.append({
                        'profile_id': profile_id,
                        'slice_data': slice_data,
                        'summary': summary_text
                    })

                    logger.info(f"Stored slice for float {slice_data.float_id}, cycle {slice_data.cycle_number}")

                except Exception as e:
                    logger.error(f"Error processing slice: {e}")
                    continue

            return {
                'file_path': file_path,
                'total_slices': len(slices_data),
                'stored_slices': len(stored_slices),
                'metadata': metadata,
                'slices': stored_slices
            }

        except Exception as e:
            logger.error(f"Error processing NetCDF file {file_path}: {e}")
            raise

    def process_netcdf_directory(self, directory_path: str, pattern: str = "*.nc") -> Dict[str, Any]:
        """Process all NetCDF files in a directory"""
        directory = Path(directory_path)
        if not directory.exists():
            raise ValueError(f"Directory does not exist: {directory_path}")

        nc_files = list(directory.glob(pattern))
        if not nc_files:
            logger.warning(f"No NetCDF files found in {directory_path}")
            return {'processed_files': 0, 'total_slices': 0}

        logger.info(f"Found {len(nc_files)} NetCDF files in {directory_path}")

        results = {
            'processed_files': 0,
            'total_slices': 0,
            'file_results': []
        }

        for nc_file in nc_files:
            try:
                file_result = self.process_netcdf_file(str(nc_file))
                results['file_results'].append(file_result)
                results['processed_files'] += 1
                results['total_slices'] += file_result.get('stored_slices', 0)
                logger.info(f"Successfully processed: {nc_file}")
            except Exception as e:
                logger.error(f"Failed to process {nc_file}: {e}")
                continue

        return results

    def _validate_netcdf_file(self, file_path: str) -> bool:
        """Validate NetCDF file"""
        try:
            with xr.open_dataset(file_path) as ds:
                # Check for required ARGO variables
                required_vars = ['PLATFORM_NUMBER', 'CYCLE_NUMBER', 'LATITUDE', 'LONGITUDE']
                return all(var in ds.variables for var in required_vars)
        except Exception as e:
            logger.error(f"Validation failed for {file_path}: {e}")
            return False

    def _extract_metadata(self, ds: xr.Dataset) -> Dict[str, Any]:
        """Extract metadata from NetCDF dataset"""
        metadata = {}

        # Platform information
        if 'PLATFORM_NUMBER' in ds.variables:
            metadata['float_id'] = str(ds.PLATFORM_NUMBER.values.item()).strip()

        if 'INST_REFERENCE' in ds.variables:
            metadata['institution'] = str(ds.INST_REFERENCE.values.item()).strip()

        if 'PLATFORM_TYPE' in ds.variables:
            metadata['platform_type'] = str(ds.PLATFORM_TYPE.values.item()).strip()

        if 'DATA_MODE' in ds.variables:
            metadata['data_mode'] = str(ds.DATA_MODE.values.item()).strip()

        return metadata

    def _extract_slices_data(self, ds: xr.Dataset, metadata: Dict[str, Any]) -> List[NetCDFSlice]:
        """Extract slice data from NetCDF dataset"""
        slices = []

        try:
            n_prof = ds.dims.get('N_PROF', 1)

            for prof_idx in range(n_prof):
                try:
                    slice_data = self._extract_single_slice(ds, prof_idx, metadata)
                    if slice_data:
                        slices.append(slice_data)
                except Exception as e:
                    logger.warning(f"Error extracting slice {prof_idx}: {e}")
                    continue

        except Exception as e:
            logger.error(f"Error extracting slices: {e}")

        return slices

    def _extract_single_slice(self, ds: xr.Dataset, prof_idx: int, metadata: Dict[str, Any]) -> Optional[NetCDFSlice]:
        """Extract a single slice from the dataset"""
        try:
            # Basic information
            float_id = metadata['float_id']
            cycle_number = int(ds.CYCLE_NUMBER.isel(N_PROF=prof_idx).values.item())

            # Date - use reference date + time from file
            if 'REFERENCE_DATE_TIME' in ds.variables and 'JULD' in ds.variables:
                ref_date_str = str(ds.REFERENCE_DATE_TIME.values.item()).strip()
                juld = float(ds.JULD.isel(N_PROF=prof_idx).values.item())

                try:
                    ref_date = datetime.strptime(ref_date_str, '%Y%m%d%H%M%S')
                    profile_date = ref_date + timedelta(days=juld)
                except:
                    profile_date = datetime.now()  # Fallback
            else:
                profile_date = datetime.now()

            # Position
            latitude = float(ds.LATITUDE.isel(N_PROF=prof_idx).values.item())
            longitude = float(ds.LONGITUDE.isel(N_PROF=prof_idx).values.item())

            # Extract measurement data
            temp_data, temp_qc = self._extract_temperature_data(ds, prof_idx)
            sal_data, sal_qc = self._extract_salinity_data(ds, prof_idx)
            pres_data = self._extract_pressure_data(ds, prof_idx)

            # Skip if no valid data
            if not any([temp_data, sal_data, pres_data]):
                return None

            # Additional metadata
            institution = metadata.get('institution', 'Unknown')
            platform_type = metadata.get('platform_type', 'Unknown')
            data_mode = metadata.get('data_mode', 'Unknown')

            # Determine region
            region = self._determine_region(latitude, longitude)

            # Create slice object
            slice_obj = NetCDFSlice(
                float_id=float_id,
                cycle_number=cycle_number,
                profile_date=profile_date,
                latitude=latitude,
                longitude=longitude,
                temperature_data=temp_data,
                salinity_data=sal_data,
                pressure_data=pres_data,
                temp_qc=temp_qc,
                sal_qc=sal_qc,
                institution=institution,
                platform_type=platform_type,
                data_mode=data_mode,
                region=region,
                summary=""  # Will be generated later
            )

            return slice_obj

        except Exception as e:
            logger.error(f"Error extracting single slice: {e}")
            return None

    def _extract_temperature_data(self, ds: xr.Dataset, prof_idx: int) -> Tuple[List[float], List[int]]:
        """Extract temperature data with quality control"""
        try:
            if 'TEMP' not in ds.variables:
                return [], []

            temp = ds.TEMP.isel(N_PROF=prof_idx).values
            temp_qc = []

            # Apply quality control
            if 'TEMP_QC' in ds.variables:
                temp_qc = ds.TEMP_QC.isel(N_PROF=prof_idx).values.astype(int).tolist()
                valid_mask = np.isin(temp_qc, self.quality_flags)
                temp = temp[valid_mask]
                temp_qc = [qc for qc, valid in zip(temp_qc, valid_mask) if valid]

            # Remove NaN and apply depth filter
            if 'PRES' in ds.variables:
                pres = ds.PRES.isel(N_PROF=prof_idx).values
                if 'PRES_QC' in ds.variables:
                    pres_qc = ds.PRES_QC.isel(N_PROF=prof_idx).values.astype(int)
                    pres_valid = np.isin(pres_qc, self.quality_flags)
                    pres = pres[pres_valid]

                valid_mask = ~np.isnan(temp) & ~np.isnan(pres) & (pres <= self.max_depth)
                temp = temp[valid_mask]
                if temp_qc:
                    temp_qc = [qc for qc, valid in zip(temp_qc, valid_mask) if valid]

            temp_list = temp.tolist() if hasattr(temp, 'tolist') else list(temp)
            return temp_list, temp_qc

        except Exception as e:
            logger.error(f"Error extracting temperature data: {e}")
            return [], []

    def _extract_salinity_data(self, ds: xr.Dataset, prof_idx: int) -> Tuple[List[float], List[int]]:
        """Extract salinity data with quality control"""
        try:
            if 'PSAL' not in ds.variables:
                return [], []

            sal = ds.PSAL.isel(N_PROF=prof_idx).values
            sal_qc = []

            # Apply quality control
            if 'PSAL_QC' in ds.variables:
                sal_qc = ds.PSAL_QC.isel(N_PROF=prof_idx).values.astype(int).tolist()
                valid_mask = np.isin(sal_qc, self.quality_flags)
                sal = sal[valid_mask]
                sal_qc = [qc for qc, valid in zip(sal_qc, valid_mask) if valid]

            # Remove NaN and apply depth filter
            if 'PRES' in ds.variables:
                pres = ds.PRES.isel(N_PROF=prof_idx).values
                valid_mask = ~np.isnan(sal) & ~np.isnan(pres) & (pres <= self.max_depth)
                sal = sal[valid_mask]
                if sal_qc:
                    sal_qc = [qc for qc, valid in zip(sal_qc, valid_mask) if valid]

            sal_list = sal.tolist() if hasattr(sal, 'tolist') else list(sal)
            return sal_list, sal_qc

        except Exception as e:
            logger.error(f"Error extracting salinity data: {e}")
            return [], []

    def _extract_pressure_data(self, ds: xr.Dataset, prof_idx: int) -> List[float]:
        """Extract pressure data"""
        try:
            if 'PRES' not in ds.variables:
                return []

            pres = ds.PRES.isel(N_PROF=prof_idx).values

            # Apply quality control if available
            if 'PRES_QC' in ds.variables:
                pres_qc = ds.PRES_QC.isel(N_PROF=prof_idx).values.astype(int)
                valid_mask = np.isin(pres_qc, self.quality_flags)
                pres = pres[valid_mask]

            # Remove NaN and apply depth filter
            valid_mask = ~np.isnan(pres) & (pres <= self.max_depth)
            pres = pres[valid_mask]

            pres_list = pres.tolist() if hasattr(pres, 'tolist') else list(pres)
            return pres_list

        except Exception as e:
            logger.error(f"Error extracting pressure data: {e}")
            return []

    def _determine_region(self, latitude: float, longitude: float) -> str:
        """Determine ocean region based on coordinates for this project (focused on Indian Ocean)"""
        # Project-specific region classification - treating dataset as Indian Ocean data
        if latitude >= -60 and latitude < 30 and longitude >= 20 and longitude < 150:
            return "Indian Ocean"
        elif latitude < -60:
            return "Southern Ocean"  # Fallback for current Southern Ocean dataset coordinates
        else:
            return "Indian Ocean"  # Default to Indian Ocean for this project

    def _generate_slice_summary(self, slice_data: NetCDFSlice) -> str:
        """Generate text summary for a slice"""
        summary_parts = [
            f"ARGO float {slice_data.float_id}",
            f"Cycle {slice_data.cycle_number}",
            f"Date: {slice_data.profile_date.strftime('%Y-%m-%d %H:%M')} UTC",
            f"Location: {slice_data.latitude:.2f}°N, {slice_data.longitude:.2f}°E",
            f"Region: {slice_data.region}",
            f"Institution: {slice_data.institution}",
            f"Platform: {slice_data.platform_type}"
        ]

        # Add data statistics
        if slice_data.temperature_data:
            temp_stats = f"Temperature range: {min(slice_data.temperature_data):.2f}°C to {max(slice_data.temperature_data):.2f}°C"
            summary_parts.append(temp_stats)

        if slice_data.salinity_data:
            sal_stats = f"Salinity range: {min(slice_data.salinity_data):.2f} to {max(slice_data.salinity_data):.2f} PSU"
            summary_parts.append(sal_stats)

        if slice_data.pressure_data:
            depth_stats = f"Depth range: 0 to {max(slice_data.pressure_data):.1f} dbar"
            summary_parts.append(depth_stats)

        return ". ".join(summary_parts)

    def _extract_advanced_features(self, slice_data: NetCDFSlice) -> Dict[str, Any]:
        """Extract advanced features for analysis"""
        features = {
            'data_points': {
                'temperature': len(slice_data.temperature_data),
                'salinity': len(slice_data.salinity_data),
                'pressure': len(slice_data.pressure_data)
            },
            'quality_metrics': {
                'temp_qc_flags': slice_data.temp_qc,
                'sal_qc_flags': slice_data.sal_qc
            },
            'statistical_features': {}
        }

        # Statistical features
        if slice_data.temperature_data:
            features['statistical_features']['temperature'] = {
                'mean': float(np.mean(slice_data.temperature_data)),
                'std': float(np.std(slice_data.temperature_data)),
                'min': float(min(slice_data.temperature_data)),
                'max': float(max(slice_data.temperature_data))
            }

        if slice_data.salinity_data:
            features['statistical_features']['salinity'] = {
                'mean': float(np.mean(slice_data.salinity_data)),
                'std': float(np.std(slice_data.salinity_data)),
                'min': float(min(slice_data.salinity_data)),
                'max': float(max(slice_data.salinity_data))
            }

        if slice_data.pressure_data:
            features['statistical_features']['pressure'] = {
                'mean': float(np.mean(slice_data.pressure_data)),
                'std': float(np.std(slice_data.pressure_data)),
                'min': float(min(slice_data.pressure_data)),
                'max': float(max(slice_data.pressure_data))
            }

        return features

    def get_database_stats(self) -> Dict[str, Any]:
        """Get database statistics"""
        return self.db_manager.get_database_stats()

    def search_similar_profiles(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search for similar profiles using vector similarity"""
        return self.db_manager.search_similar_profiles(
            self.vector_store.generate_embedding(query), limit
        )

def create_enhanced_processor(config_path: Optional[str] = None) -> EnhancedArgoProcessor:
    """Create enhanced processor with configuration"""
    config = Config.load_config() if hasattr(Config, 'load_config') else Config(
        database_uri=os.getenv("DATABASE_URI", "postgresql://postgres:postgres@localhost:5432/vectordb"),
        groq_api_key=os.getenv("GROQ_API", ""),
        ollama_url=os.getenv("OLLAMA_URL", "http://localhost:11434"),
        ollama_embedding_model=os.getenv("OLLAMA_EMBEDDING_MODEL", "embeddinggemma")
    )
    return EnhancedArgoProcessor(config)

# ALIASES FOR COMPATIBILITY WITH MCP SERVER IMPORTS
# These aliases resolve the import warnings in Django/MCP
EnhancedArgoDataProcessor = EnhancedArgoProcessor

if __name__ == "__main__":
    # Example usage
    processor = create_enhanced_processor()

    # Process a single file
    file_path = "path/to/your/argo_file.nc"
    if processor._validate_netcdf_file(file_path):
        result = processor.process_netcdf_file(file_path)
        print(f"Processed {result['stored_slices']} slices from {file_path}")
    else:
        print("Invalid NetCDF file")
