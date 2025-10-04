"""
Fallback configuration for FloatChat when external databases are not accessible
"""

import os
import logging
from .config import Config

logger = logging.getLogger(__name__)

def create_fallback_config() -> Config:
    """Create configuration with fallback database settings"""

    # Try to use environment database first
    db_uri = os.getenv("DATABASE_URI")

    if db_uri:
        try:
            # Test if the database URI is accessible
            # Try psycopg2cffi first (for Python 3.13 compatibility), then psycopg2
            try:
                from psycopg2cffi import compat
                compat.register()
                import psycopg2cffi as psycopg2
            except ImportError:
                import psycopg2
            # Parse connection parameters
            parts = db_uri.replace("postgresql://", "").split("@")
            if len(parts) >= 2:
                user_pass = parts[0].split(":")
                host_db = parts[1].split("/")

                conn_params = {
                    'host': host_db[0].split(":")[0],
                    'port': host_db[0].split(":")[1] if ":" in host_db[0] else '5432',
                    'user': user_pass[0],
                    'password': user_pass[1] if len(user_pass) > 1 else '',
                    'database': host_db[1].split("?")[0] if len(host_db) > 1 else 'postgres'
                }

                # Try to connect
                conn = psycopg2.connect(**conn_params)
                conn.close()
                logger.info("✅ External database connection successful")
                return Config(
                    database_uri=db_uri,
                    groq_api_key=os.getenv("GROQ_API", ""),
                    ollama_url=os.getenv("OLLAMA_URL", "http://localhost:11434"),
                    ollama_embedding_model=os.getenv("OLLAMA_EMBEDDING_MODEL", "nomic-embed-text")
                )

        except Exception as e:
            logger.warning(f"⚠️ External database not accessible: {e}")
            logger.info("🔄 Falling back to local SQLite database")

    # Fallback to local SQLite
    fallback_db_path = "fallback_vectordb.db"
    fallback_uri = f"sqlite:///{fallback_db_path}"

    logger.info(f"📁 Using fallback SQLite database: {fallback_db_path}")

    return Config(
        database_uri=fallback_uri,
        groq_api_key=os.getenv("GROQ_API", ""),
        ollama_url=os.getenv("OLLAMA_URL", "http://localhost:11434"),
        ollama_embedding_model=os.getenv("OLLAMA_EMBEDDING_MODEL", "nomic-embed-text")
    )

def setup_fallback_database():
    """Set up fallback SQLite database with vector support"""
    try:
        from .database import DatabaseManager

        config = create_fallback_config()
        db_manager = DatabaseManager(config.database_uri)

        logger.info("✅ Fallback database setup completed")
        return db_manager

    except Exception as e:
        logger.error(f"❌ Fallback database setup failed: {e}")
        raise

def test_database_connectivity():
    """Test database connectivity and provide helpful error messages"""
    print("🔍 Testing database connectivity...")

    try:
        config = create_fallback_config()
        print(f"📡 Database URI: {config.database_uri.split('@')[1] if '@' in config.database_uri else config.database_uri}")

        from .database import DatabaseManager
        db_manager = DatabaseManager(config.database_uri)

        stats = db_manager.get_database_stats()
        print("✅ Database connected successfully!")
        print(f"📊 Database stats: {stats}")

        return True, config

    except Exception as e:
        print(f"❌ Database connection failed: {e}")

        if "could not translate host name" in str(e):
            print("\n💡 Network connectivity issue detected!")
            print("🔧 Solutions:")
            print("1. Check your internet connection")
            print("2. Whitelist your IP in Neon Console (Dashboard → Settings → IP Allowlist)")
            print("3. Use local PostgreSQL database for testing")
            print("4. Run: python -c 'from .fallback_config import setup_fallback_database; setup_fallback_database()'")

        return False, None

if __name__ == "__main__":
    success, config = test_database_connectivity()
    if success:
        print("\n🎉 Database connectivity test passed!")
    else:
        print("\n⚠️ Database connectivity test failed, but fallback options are available.")
