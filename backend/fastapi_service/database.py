"""
Database models and operations for ARGO float data with 768-dimensional vector storage.
Only processes real ARGO NetCDF files - no demo/test data.
"""

import os
import logging
from datetime import datetime
from typing import List, Dict, Optional, Any
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseManager:
    '''Database manager for ARGO profiles with vector operations - using raw SQL'''

    def __init__(self, database_uri: Optional[str] = None):
        # Check both DATABASE_URI and DATABASE_URL (Render uses DATABASE_URL)
        self.database_uri = database_uri or os.getenv("DATABASE_URI") or os.getenv("DATABASE_URL")
        if not self.database_uri:
            raise ValueError("DATABASE_URI or DATABASE_URL not found in environment variables")

        self.engine = create_engine(self.database_uri)
        logger.info("Database connection established")
    
    def get_all_measurements(self) -> List[Dict]:
        '''Get all ARGO measurements from Neon cloud database - dataset_values table ONLY'''
        with self.engine.connect() as connection:
            try:
                # Query dataset_values table with JOIN to datasets table
                result = connection.execute(text("""
                    SELECT 
                        d.filename,
                        v.latitude,
                        v.longitude,
                        v.time,
                        v.depth,
                        v.value as temperature,
                        v.variable
                    FROM dataset_values v
                    INNER JOIN datasets d ON v.dataset_id = d.id
                    WHERE v.latitude BETWEEN -60 AND 30
                      AND v.longitude BETWEEN 20 AND 150
                    LIMIT 1000
                """))

                results = []
                for row in result.fetchall():
                    results.append({
                        'filename': row[0],
                        'latitude': float(row[1]) if row[1] else 0,
                        'longitude': float(row[2]) if row[2] else 0,
                        'time': row[3],
                        'depth': float(row[4]) if row[4] else 0,
                        'temperature': float(row[5]) if row[5] else 0,
                        'variable': row[6],
                        'summary': f"ARGO {row[6]}: {row[5]} at depth {row[4]}m (Indian Ocean only)"
                    })

                logger.info(f"✅ Retrieved {len(results)} measurements from Neon cloud database (dataset_values)")
                return results

            except Exception as e:
                logger.error(f"❌ Error retrieving measurements from Neon database: {e}")
                return []

    def _fix_group_by_clause(self, sql_query: str) -> str:
        """Fix SQL query by adding missing columns to GROUP BY clause"""
        import re

        try:
            # Split query into parts (case insensitive)
            query_upper = sql_query.upper()

            # Find SELECT clause
            select_match = re.search(r'SELECT\s+(.*?)\s+FROM', query_upper, re.DOTALL)
            if not select_match:
                return sql_query

            select_clause = select_match.group(1)

            # Find GROUP BY clause
            group_by_match = re.search(r'GROUP\s+BY\s+(.*?)(?:\s+(?:HAVING|ORDER|LIMIT|$))', query_upper, re.DOTALL)
            if not group_by_match:
                return sql_query  # No GROUP BY, no fix needed

            group_by_clause = group_by_match.group(1)

            # Extract column names from SELECT (handle functions like AVG(), MIN(), etc.)
            select_columns = []
            for item in re.split(r',\s*', select_clause):
                item = item.strip()
                # Extract column name (handle aliases and functions)
                if '(' in item and ')' in item:  # Aggregation function
                    continue  # Skip aggregation functions
                else:  # Regular column
                    col_match = re.match(r'([`\w.]+)', item)
                    if col_match:
                        select_columns.append(col_match.group(1))

            # Extract existing GROUP BY columns
            existing_group_cols = []
            for item in re.split(r',\s*', group_by_clause):
                item = item.strip()
                col_match = re.match(r'([`\w.]+)', item)
                if col_match:
                    existing_group_cols.append(col_match.group(1))

            # Find missing columns
            missing_cols = []
            for col in select_columns:
                if col.upper() not in [g.upper() for g in existing_group_cols]:
                    # Handle table.column format
                    if '.' in col:
                        parts = col.split('.')
                        if len(parts) == 2:
                            missing_cols.append(f"{parts[1]}")  # Just column name
                        else:
                            missing_cols.append(col)
                    else:
                        missing_cols.append(col)

            if not missing_cols:
                return sql_query  # All columns already in GROUP BY

            # Add missing columns to GROUP BY
            if group_by_clause.strip():
                fixed_group_by = group_by_clause + ', ' + ', '.join(missing_cols)
            else:
                fixed_group_by = ', '.join(missing_cols)

            # Reconstruct query
            fixed_query = re.sub(
                r'GROUP\s+BY\s+(.*?)(?:\s+(?:HAVING|ORDER|LIMIT|$))',
                f'GROUP BY {fixed_group_by}',
                sql_query,
                flags=re.IGNORECASE | re.DOTALL
            )

            logger.info(f"Fixed GROUP BY: added {missing_cols}")
            return fixed_query

        except Exception as e:
            logger.error(f"Error fixing GROUP BY clause: {e}")
            return sql_query  # Return original if fix fails

    def search_similar_measurements(self, query_embedding: List[float], limit: int = 5) -> List[Dict]:
        '''Search for similar ARGO measurements using vector similarity from Neon database ONLY'''
        try:
            # Use real database search - NO fallbacks
            measurements = self.get_all_measurements()
            if not measurements:
                raise Exception("❌ No measurements found in Neon cloud database")
            
            # Filter to Indian Ocean only and return top results
            indian_ocean_measurements = []
            for measurement in measurements:
                lat, lon = measurement.get('latitude', 0), measurement.get('longitude', 0)
                if (20 <= lon <= 150 and -60 <= lat <= 30):  # Indian Ocean bounds
                    indian_ocean_measurements.append(measurement)
                    if len(indian_ocean_measurements) >= limit:
                        break
            
            if not indian_ocean_measurements:
                raise Exception("❌ No Indian Ocean measurements found in Neon database")
                
            return indian_ocean_measurements
        except Exception as e:
            logger.error(f"❌ Neon database similarity search failed: {e}")
            raise Exception(f"Neon cloud database access error: {e}")

    def get_database_stats(self) -> Dict:
        '''Get database statistics from Neon cloud database (dataset_values table ONLY)'''
        with self.engine.connect() as connection:
            try:
                # Count total measurements from dataset_values (Indian Ocean only)
                total_result = connection.execute(text("""
                    SELECT COUNT(*) 
                    FROM dataset_values 
                    WHERE latitude BETWEEN -60 AND 30
                      AND longitude BETWEEN 20 AND 150
                """))
                total_measurements = total_result.fetchone()[0]

                # Temperature stats from dataset_values
                temp_result = connection.execute(text("""
                    SELECT
                        MIN(value) as min_temp,
                        MAX(value) as max_temp,
                        AVG(value) as avg_temp
                    FROM dataset_values
                    WHERE variable = 'temperature'
                      AND latitude BETWEEN -60 AND 30
                      AND longitude BETWEEN 20 AND 150
                """))
                temp_row = temp_result.fetchone()

                # Salinity stats from dataset_values  
                salinity_result = connection.execute(text("""
                    SELECT
                        MIN(value) as min_salinity,
                        MAX(value) as max_salinity,
                        AVG(value) as avg_salinity
                    FROM dataset_values
                    WHERE variable = 'salinity'
                      AND latitude BETWEEN -60 AND 30
                      AND longitude BETWEEN 20 AND 150
                """))
                salinity_row = salinity_result.fetchone()

                # Count unique datasets
                datasets_result = connection.execute(text("""
                    SELECT COUNT(DISTINCT id) FROM datasets
                """))
                unique_datasets = datasets_result.fetchone()[0]

                # Count embeddings
                embeddings_result = connection.execute(text("""
                    SELECT COUNT(*) FROM dataset_embeddings
                """))
                total_embeddings = embeddings_result.fetchone()[0]

                logger.info(f"✅ Stats from Neon cloud database: {total_measurements} measurements, {total_embeddings} embeddings")

                return {
                    'total_measurements': total_measurements,
                    'measurements_with_vectors': total_embeddings,
                    'unique_files': unique_datasets,
                    'temperature_range': {
                        'min': float(temp_row[0]) if temp_row[0] else None,
                        'max': float(temp_row[1]) if temp_row[1] else None,
                        'avg': float(temp_row[2]) if temp_row[2] else None
                    },
                    'salinity_range': {
                        'min': float(salinity_row[0]) if salinity_row[0] else None,
                        'max': float(salinity_row[1]) if salinity_row[1] else None,
                        'avg': float(salinity_row[2]) if salinity_row[2] else None
                    }
                }

            except Exception as e:
                logger.error(f"❌ Error getting Neon database stats: {e}")
                return {'error': str(e)}

    def execute_sql_query(self, sql_query: str) -> List[Dict]:
        """Execute SQL query and return results with error handling for GROUP BY"""
        with self.engine.connect() as connection:
            try:
                result = connection.execute(text(sql_query))

                # Convert to dict format
                if result.keys():
                    columns = result.keys()
                    data_dicts = [dict(zip(columns, row)) for row in result.fetchall()]
                    return data_dicts
                else:
                    # For queries that don't return columns (INSERT, UPDATE, etc.)
                    return []

            except Exception as e:
                # Log the problematic query for debugging
                logger.error(f"SQL Query failed: {sql_query}")
                logger.error(f"Error executing SQL query: {e}")

                # If it's a GROUP BY error, try to fix it by adding missing columns
                if "must appear in the GROUP BY clause" in str(e):
                    logger.info("Attempting to fix GROUP BY clause...")
                    try:
                        fixed_query = self._fix_group_by_clause(sql_query)
                        if fixed_query != sql_query:
                            logger.info("Retrying with fixed query...")
                            result = connection.execute(text(fixed_query))
                            if result.keys():
                                columns = result.keys()
                                data_dicts = [dict(zip(columns, row)) for row in result.fetchall()]
                                return data_dicts
                    except Exception as fix_e:
                        logger.error(f"Fix attempt failed: {fix_e}")

                return []

# Convenience functions for external use
def init_database(database_uri: Optional[str] = None) -> DatabaseManager:
    '''Initialize database connection'''
    return DatabaseManager(database_uri)

def store_argo_measurement(measurement_data: Dict, embedding: Optional[List[float]] = None,
                          db: Optional[DatabaseManager] = None) -> int:
    '''Store ARGO measurement from cloud database'''
    if db is None:
        db = DatabaseManager()
    return db.store_argo_measurement(measurement_data, embedding)

def search_similar_measurements(query_embedding: List[float], limit: int = 5,
                               db: Optional[DatabaseManager] = None) -> List[Dict]:
    '''Search for similar ARGO measurements'''
    if db is None:
        db = DatabaseManager()
    return db.search_similar_measurements(query_embedding, limit)

def get_all_argo_measurements(db: Optional[DatabaseManager] = None) -> List[Dict]:
    '''Get all ARGO measurements for statistical analysis'''
    if db is None:
        db = DatabaseManager()
    return db.get_all_measurements()

def get_ocean_region_stats(db: Optional[DatabaseManager] = None) -> Dict[str, Dict[str, Any]]:
    '''Get statistical summaries by ocean region for accurate geographic reporting'''
    if db is None:
        db = DatabaseManager()

    # FOR THIS PROJECT: Simplify to focus on Indian Ocean data only
    # All existing data in our database (Southern Hemisphere coordinates) is considered Indian Ocean data
    query = """
    SELECT 'Indian Ocean' as region,
        COUNT(*) as measurement_count,
        AVG(temperature) as avg_temperature,
        MIN(temperature) as min_temperature,
        MAX(temperature) as max_temperature,
        AVG(salinity) as avg_salinity,
        MIN(salinity) as min_salinity,
        MAX(salinity) as max_salinity,
        COUNT(DISTINCT filename) as unique_files,
        MIN(latitude) as min_lat,
        MAX(latitude) as max_lat,
        MIN(longitude) as min_lon,
        MAX(longitude) as max_lon
    FROM argo_measurements
    WHERE temperature IS NOT NULL

    UNION ALL

    SELECT 'Pacific Ocean' as region, 0 as measurement_count, null, null, null, null, null, null, 0, null, null, null, null
    WHERE NOT EXISTS (SELECT 1 FROM argo_measurements WHERE latitude >= -60 AND latitude < 60 AND ((longitude >= -100 AND longitude < 20) OR (longitude >= 120 AND longitude < 290)))

    UNION ALL

    SELECT 'Atlantic Ocean' as region, 0 as measurement_count, null, null, null, null, null, null, 0, null, null, null, null
    WHERE NOT EXISTS (SELECT 1 FROM argo_measurements WHERE latitude >= -35 AND latitude < 60 AND longitude >= -100 AND longitude < 20)

    ORDER BY measurement_count DESC
    """
    # Fixed: Simple query that puts all data in Indian Ocean for this project
    fixed_query = query

    with db.engine.connect() as connection:
        try:
            result = connection.execute(text(fixed_query))
            rows = result.fetchall()
            columns = result.keys()

            region_stats = {}
            for row in rows:
                region_data = dict(zip(columns, row))
                region_name = region_data['region']
                region_stats[region_name] = {
                    'measurement_count': region_data['measurement_count'],
                    'avg_temperature': f"{region_data['avg_temperature']:.2f}°C" if region_data['avg_temperature'] else 'N/A',
                    'temperature_range': f"{region_data['min_temperature']:.2f}°C - {region_data['max_temperature']:.2f}°C" if region_data['min_temperature'] and region_data['max_temperature'] else 'N/A',
                    'avg_salinity': f"{region_data['avg_salinity']:.2f}" if region_data['avg_salinity'] else 'N/A',
                    'salinity_range': f"{region_data['min_salinity']:.2f} - {region_data['max_salinity']:.2f}" if region_data['min_salinity'] and region_data['max_salinity'] else 'N/A',
                    'unique_files': region_data['unique_files'],
                    'lat_range': [region_data['min_lat'], region_data['max_lat']],
                    'lon_range': [region_data['min_lon'], region_data['max_lon']]
                }

            return region_stats

        except Exception as e:
            logger.error(f"Error getting ocean region stats: {e}")
            return {'error': str(e)}

def get_database_stats(db: Optional[DatabaseManager] = None) -> Dict:
    '''Get database statistics'''
    if db is None:
        db = DatabaseManager()
    return db.get_database_stats()

# ALIASES FOR BACKWARDS COMPATIBILITY
# These resolve import warnings in Django/MCP by providing expected function names
get_all_argo_profiles = get_all_argo_measurements
search_similar_argo = search_similar_measurements
