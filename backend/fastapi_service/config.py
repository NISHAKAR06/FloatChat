import os
from dataclasses idef load_config() -> Config:
    """Load configuration from environment variables"""
    # Check both DATABASE_URI and DATABASE_URL (Render uses DATABASE_URL)
    db_uri = os.getenv("DATABASE_URI") or os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/vectordb")
    
    return Config(
        database_uri=db_uri,
        groq_api_key=os.getenv("GROQ_API", ""),
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        ollama_url=os.getenv("OLLAMA_URL", "http://localhost:11434"),
        ollama_embedding_model=os.getenv("OLLAMA_EMBEDDING_MODEL", "embeddinggemma"),
        vector_dimension=int(os.getenv("VECTOR_DIMENSION", "768")),
        chunk_size=int(os.getenv("CHUNK_SIZE", "1000")),
        chunk_overlap=int(os.getenv("CHUNK_OVERLAP", "200")),
        max_depth=float(os.getenv("MAX_DEPTH", "2000.0")),
        min_profiles=int(os.getenv("MIN_PROFILES", "10"))
    )s
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

@dataclass
class Config:
    """Application configuration"""
    database_uri: str
    groq_api_key: str
    openai_api_key: Optional[str] = None
    ollama_url: str = "http://localhost:11434"
    ollama_embedding_model: str = "embeddinggemma"
    vector_dimension: int = 768  # Updated for embeddinggemma
    chunk_size: int = 1000
    chunk_overlap: int = 200
    
    # ARGO specific settings
    max_depth: float = 2000.0
    min_profiles: int = 10
    quality_flags: list = None
    
    def __post_init__(self):
        if self.quality_flags is None:
            self.quality_flags = [1, 2]  # Good and probably good data

def load_config() -> Config:
    """Load configuration from environment variables"""
    return Config(
        database_uri=os.getenv("DATABASE_URI", "postgresql://postgres:postgres@localhost:5432/vectordb"),
        groq_api_key=os.getenv("GROQ_API", ""),
        openai_api_key=os.getenv("OPENAI_API_KEY"),
        ollama_url=os.getenv("OLLAMA_URL", "http://localhost:11434"),
        ollama_embedding_model=os.getenv("OLLAMA_EMBEDDING_MODEL", "embeddinggemma"),
        vector_dimension=int(os.getenv("VECTOR_DIMENSION", "768")),
        chunk_size=int(os.getenv("CHUNK_SIZE", "1000")),
        chunk_overlap=int(os.getenv("CHUNK_OVERLAP", "200")),
        max_depth=float(os.getenv("MAX_DEPTH", "2000.0")),
        min_profiles=int(os.getenv("MIN_PROFILES", "10"))
    )