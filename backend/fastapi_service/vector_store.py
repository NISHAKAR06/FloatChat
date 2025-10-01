import numpy as np
from typing import List, Dict, Optional, Tuple
import requests
import json
from .database import DatabaseManager
import logging

logger = logging.getLogger(__name__)

class VectorStore:
    """Vector storage and retrieval using pgvector with Ollama embeddings"""

    def __init__(self, database_uri: str, ollama_model: str = "embeddinggemma", ollama_url: str = "http://localhost:11434"):
        self.db_manager = DatabaseManager(database_uri)
        self.ollama_model = ollama_model
        self.ollama_url = ollama_url
        self.embedding_dim = 768  # Dimension for embeddinggemma (may vary)
        
    def generate_embedding(self, text: str) -> List[float]:
        """Generate vector embedding for text using Ollama"""
        try:
            # Make request to Ollama embeddings API
            response = requests.post(
                f"{self.ollama_url}/api/embeddings",
                json={
                    "model": self.ollama_model,
                    "prompt": text
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                embedding = result.get("embedding", [])
                
                if not embedding:
                    raise ValueError("Empty embedding returned from Ollama")
                
                # Update embedding dimension if needed
                if len(embedding) != self.embedding_dim:
                    self.embedding_dim = len(embedding)
                    logger.info(f"Updated embedding dimension to {self.embedding_dim}")
                
                return embedding
            else:
                raise Exception(f"Ollama API error: {response.status_code} - {response.text}")
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Error connecting to Ollama: {e}")
            raise Exception(f"Ollama connection failed: {e}")
        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise
    
    def store_measurement_embedding(self, measurement_id: int) -> bool:
        """Generate and store embedding for ARGO measurement"""
        try:
            with self.db_manager.Session() as session:
                measurement = session.query(ArgoMeasurement).filter(
                    ArgoMeasurement.id == measurement_id
                ).first()

                if not measurement or not measurement.summary:
                    logger.warning(f"Measurement {measurement_id} not found or has no summary")
                    return False

                # Generate embedding from existing summary
                embedding = self.generate_embedding(measurement.summary)
                measurement.embedding = embedding
                session.commit()
                logger.info(f"Added embedding for measurement {measurement_id}")
                return True

        except Exception as e:
            logger.error(f"Error storing embedding for measurement {measurement_id}: {e}")
            return False

    def similarity_search(self, query: str, limit: int = 10,
                         filters: Optional[Dict] = None) -> List[Dict]:
        """Perform semantic similarity search on ARGO measurements"""
        try:
            # Generate query embedding
            query_embedding = self.generate_embedding(query)

            # Perform vector search using the new method
            results = self.db_manager.search_similar_measurements(query_embedding, limit)

            # Apply additional filters if provided
            if filters:
                filtered_results = []
                for result in results:
                    include = True
                    if 'lat_range' in filters:
                        lat_min, lat_max = filters['lat_range']
                        if not (lat_min <= result['latitude'] <= lat_max):
                            include = False
                    if 'lon_range' in filters:
                        lon_min, lon_max = filters['lon_range']
                        if not (lon_min <= result['longitude'] <= lon_max):
                            include = False
                    if 'time_range' in filters and result.get('time'):
                        start_time, end_time = filters['time_range']
                        if not (start_time <= result['time'] <= end_time):
                            include = False
                    if include:
                        filtered_results.append(result)
                results = filtered_results[:limit]

            return results

        except Exception as e:
            logger.error(f"Error in similarity search: {e}")
            return []
    

    
    def get_measurement_statistics(self) -> Dict:
        """Get statistics about stored ARGO measurements"""
        return self.db_manager.get_database_stats()

    def reindex_measurements_without_embeddings(self) -> bool:
        """Generate embeddings for measurements that don't have them"""
        try:
            with self.db_manager.Session() as session:
                measurements = session.query(ArgoMeasurement).filter(
                    ArgoMeasurement.summary.isnot(None),
                    ArgoMeasurement.embedding.is_(None)
                ).limit(100).all()  # Process in batches

                logger.info(f"Reindexing {len(measurements)} measurements")

                for measurement in measurements:
                    try:
                        embedding = self.generate_embedding(measurement.summary)
                        measurement.embedding = embedding
                        session.commit()
                        logger.info(f"Embedded measurement {measurement.id}")
                    except Exception as e:
                        logger.error(f"Error reindexing measurement {measurement.id}: {e}")
                        continue

                logger.info("Reindexing batch completed")
                return True

        except Exception as e:
            logger.error(f"Error during reindexing: {e}")
            return False

    def create_embeddings_for_all_measurements(self) -> bool:
        """Create embeddings for all measurements in the database"""
        try:
            # This would be used to generate embeddings for the entire cloud dataset
            measurements = self.db_manager.get_all_measurements()
            logger.info(f"Creating embeddings for {len(measurements)} measurements")

            success_count = 0
            for measurement in measurements:
                try:
                    embedding = self.generate_embedding(measurement['summary'])
                    # Store the embedding
                    with self.db_manager.Session() as session:
                        meas = session.query(ArgoMeasurement).filter(
                            ArgoMeasurement.id == measurement['id']
                        ).first()
                        if meas:
                            meas.embedding = embedding
                            session.commit()
                            success_count += 1
                except Exception as e:
                    logger.error(f"Error embedding measurement {measurement['id']}: {e}")
                    continue

            logger.info(f"Successfully embedded {success_count} measurements")
            return True

        except Exception as e:
            logger.error(f"Error in batch embedding: {e}")
            return False
