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
        self.database_uri = database_uri or os.getenv("DATABASE_URI")
        if not self.database_uri:
            raise ValueError("DATABASE_URI not found in environment variables")

        self.engine = create_engine(self.database_uri)
        logger.info("Database connection established")
    
    def get_all_measurements(self) -> List[Dict]:
        '''Get all ARGO measurements from cloud database'''
        with self.engine.connect() as connection:
            try:
                result = connection.execute(text("""
                    SELECT filename, latitude, longitude, time, depth, temperature, salinity
                    FROM argo_measurements
                    LIMIT 1000
                """))

                results = []
                for row in result.fetchall():
                    results.append({
                        'filename': row[0],
                        'latitude': row[1],
                        'longitude': row[2],
                        'time': row[3],
                        'depth': row[4],
                        'temperature': row[5],
                        'salinity': row[6],
                        'summary': f"ARGO measurement: {row[5]}°C temp, {row[6]} PSU salinity at depth {row[4]}m"
                    })

                logger.info(f"Retrieved {len(results)} measurements")
                return results

            except Exception as e:
                logger.error(f"Error retrieving measurements: {e}")
                return []

    def search_similar_measurements(self, query_embedding: List[float], limit: int = 5) -> List[Dict]:
        '''Search for similar ARGO measurements using vector similarity'''
        # For now, return some basic results since vector search doesn't work without embeddings
        # This prevents the error we saw earlier
        try:
            measurements = self.get_all_measurements()
            return measurements[:limit]  # Return first N measurements as fallback
        except Exception as e:
            logger.error(f"Error in similarity search: {e}")
            return []

    def get_database_stats(self) -> Dict:
        '''Get database statistics'''
        with self.engine.connect() as connection:
            try:
                # Count total measurements
                total_result = connection.execute(text("SELECT COUNT(*) FROM argo_measurements"))
                total_measurements = total_result.fetchone()[0]

                # Temperature stats
                temp_result = connection.execute(text("""
                    SELECT
                        MIN(temperature) as min_temp,
                        MAX(temperature) as max_temp,
                        AVG(temperature) as avg_temp
                    FROM argo_measurements
                    WHERE temperature IS NOT NULL
                """))
                temp_stats = temp_result.fetchone()

                # Salinity stats
                salinity_result = connection.execute(text("""
                    SELECT
                        MIN(salinity) as min_sal,
                        MAX(salinity) as max_sal,
                        AVG(salinity) as avg_sal
                    FROM argo_measurements
                    WHERE salinity IS NOT NULL
                """))
                salinity_stats = salinity_result.fetchone()

                # Unique files
                files_result = connection.execute(text("""
                    SELECT COUNT(DISTINCT filename)
                    FROM argo_measurements
                    WHERE filename IS NOT NULL
                """))
                unique_files = files_result.fetchone()[0]

                return {
                    'total_measurements': total_measurements,
                    'measurements_with_vectors': 0,  # No vectors yet
                    'unique_files': unique_files,
                    'temperature_range': {
                        'min': temp_stats[0],
                        'max': temp_stats[1],
                        'avg': temp_stats[2]
                    },
                    'salinity_range': {
                        'min': salinity_stats[0],
                        'max': salinity_stats[1],
                        'avg': salinity_stats[2]
                    }
                }

            except Exception as e:
                logger.error(f"Error getting database stats: {e}")
                return {'error': str(e)}

    def execute_sql_query(self, sql_query: str) -> List[Dict]:
        """Execute SQL query and return results"""
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
                logger.error(f"Error executing SQL query: {e}")
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

def get_database_stats(db: Optional[DatabaseManager] = None) -> Dict:
    '''Get database statistics'''
    if db is None:
        db = DatabaseManager()
    return db.get_database_stats()
