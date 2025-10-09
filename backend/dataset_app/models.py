from django.db import models
import uuid
from auth_app.models import CustomUser

class NetCDFDataset(models.Model):
    """Model for storing NetCDF dataset metadata"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    filename = models.CharField(max_length=255)
    file_path = models.CharField(max_length=500, blank=True)  # Path to the uploaded file
    upload_time = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=[
        ('uploaded', 'Uploaded'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed')
    ], default='uploaded')
    variables = models.JSONField(default=list)  # List of variables in the file
    dimensions = models.JSONField(null=True, blank=True)  # Dimensions info
    uploaded_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    class Meta:
        ordering = ['-upload_time']
        db_table = 'datasets'

    def __str__(self):
        return self.filename

class NetCDFValue(models.Model):
    """Model for storing flattened NetCDF data values"""
    id = models.BigAutoField(primary_key=True)
    dataset = models.ForeignKey(NetCDFDataset, on_delete=models.CASCADE)
    variable = models.CharField(max_length=100)
    time = models.DateTimeField()
    lat = models.FloatField()
    lon = models.FloatField()
    depth = models.FloatField(null=True, blank=True)
    value = models.FloatField()

    class Meta:
        db_table = 'dataset_values'
        indexes = [
            models.Index(fields=['dataset', 'variable', 'time']),
            models.Index(fields=['lat', 'lon']),
        ]

    def __str__(self):
        return f"{self.variable} - {self.time} - ({self.lat}, {self.lon})"

class NetCDFEmbedding(models.Model):
    """Model for storing NetCDF embeddings with pgvector"""
    id = models.AutoField(primary_key=True)
    dataset = models.ForeignKey(NetCDFDataset, on_delete=models.CASCADE)
    variable = models.CharField(max_length=100)
    time = models.DateTimeField()
    region = models.CharField(max_length=100)
    embedding = models.TextField()  # Store as text for now, will use vector field in raw SQL
    summary = models.TextField()

    class Meta:
        db_table = 'dataset_embeddings'
        indexes = [
            models.Index(fields=['dataset', 'variable', 'time']),
            models.Index(fields=['region']),
        ]

    def __str__(self):
        return f"{self.variable} - {self.region} - {self.time}"

def create_vector_tables():
    """Create the database tables for NetCDF data storage"""
    from django.db import connection

    # Check if we're using PostgreSQL or SQLite
    is_postgres = connection.vendor == 'postgresql'

    try:
        with connection.cursor() as cursor:
            if is_postgres:
                # PostgreSQL with pgvector support
                # Create vector extension if not exists
                cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")

                # Create datasets table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS datasets (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        filename TEXT NOT NULL,
                        file_path TEXT,
                        upload_time TIMESTAMP DEFAULT now(),
                        status TEXT DEFAULT 'uploaded',
                        variables TEXT[],
                        dimensions JSONB,
                        uploaded_by_id UUID REFERENCES auth_app_customuser(id) ON DELETE CASCADE
                    );
                """)

                # Create dataset_values table for flattened data
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS dataset_values (
                        id BIGSERIAL PRIMARY KEY,
                        dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
                        variable TEXT NOT NULL,
                        time TIMESTAMP NOT NULL,
                        lat REAL NOT NULL,
                        lon REAL NOT NULL,
                        depth REAL,
                        value REAL NOT NULL
                    );
                """)

                # Create dataset_embeddings table for vector storage
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS dataset_embeddings (
                        id SERIAL PRIMARY KEY,
                        dataset_id UUID REFERENCES datasets(id) ON DELETE CASCADE,
                        variable TEXT NOT NULL,
                        time TIMESTAMP NOT NULL,
                        region TEXT NOT NULL,
                        embedding vector(768) NOT NULL,
                        summary TEXT NOT NULL
                    );
                """)

                # Create indexes for performance
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_datasets_upload_time
                    ON datasets(upload_time);
                """)

                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_dataset_values_dataset_variable_time
                    ON dataset_values(dataset_id, variable, time);
                """)

                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_dataset_values_spatial
                    ON dataset_values(lat, lon);
                """)

                # Create vector similarity index
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_dataset_embeddings_vector
                    ON dataset_embeddings USING ivfflat (embedding vector_cosine_ops)
                    WITH (lists = 100);
                """)

                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_dataset_embeddings_dataset_variable
                    ON dataset_embeddings(dataset_id, variable);
                """)
            else:
                # SQLite fallback - simplified table structure
                logger.warning("⚠️ Using SQLite - pgvector extensions not available")
                logger.warning("⚠️ Data will be stored LOCALLY, not in cloud!")
                logger.warning("💡 Set DATABASE_URL in .env to use Neon PostgreSQL cloud database")

                # Note: Tables are created via Django migrations, so we just ensure
                # they're set up correctly. No need for raw SQL here since Django
                # models handle table creation in SQLite.

    except Exception as e:
        print(f"Error creating vector tables: {e}")
        # Don't raise error - NetCDF processing can continue without raw table creation
        # Django migrations already handle table creation
