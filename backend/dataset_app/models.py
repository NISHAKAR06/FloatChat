from django.db import models
import uuid
from auth_app.models import CustomUser

class NetCDFDataset(models.Model):
    """Model for storing NetCDF dataset metadata"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file_path = models.CharField(max_length=500)
    file_size = models.BigIntegerField()  # Size in bytes
    uploaded_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    upload_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=[
        ('uploaded', 'Uploaded'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed')
    ], default='uploaded')
    variable_names = models.JSONField(default=list)  # List of variables in the file
    time_coverage = models.JSONField(null=True, blank=True)  # Time range
    spatial_coverage = models.JSONField(null=True, blank=True)  # Lat/lon bounds
    error_message = models.TextField(blank=True)

    class Meta:
        ordering = ['-upload_date']

    def __str__(self):
        return self.name

class NetCDFSlice(models.Model):
    """Model for storing preprocessed NetCDF slices with embeddings"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dataset = models.ForeignKey(NetCDFDataset, on_delete=models.CASCADE)
    variable = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    time = models.DateTimeField()
    depth = models.FloatField(null=True, blank=True)
    lat_min = models.FloatField()
    lat_max = models.FloatField()
    lon_min = models.FloatField()
    lon_max = models.FloatField()
    slice_data = models.JSONField()  # Array of values
    embedding = models.JSONField()  # 768-dimensional embedding vector
    summary = models.TextField()
    source_file = models.CharField(max_length=255)

    class Meta:
        indexes = [
            models.Index(fields=['variable', 'region', 'time']),
            models.Index(fields=['lat_min', 'lat_max', 'lon_min', 'lon_max']),
        ]

    def __str__(self):
        return f"{self.variable} - {self.region} - {self.time}"

# Create the database table for vector storage (for Neon DB)
def create_vector_table():
    """Create the vector table for storing embeddings"""
    from django.db import connection

    with connection.cursor() as cursor:
        # Create extension if not exists
        cursor.execute("CREATE EXTENSION IF NOT EXISTS vector;")

        # Create the main slices table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS netcdf_slices (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                dataset_id UUID REFERENCES dataset_app_netcdfdataset(id) ON DELETE CASCADE,
                variable VARCHAR(100) NOT NULL,
                region VARCHAR(100) NOT NULL,
                time TIMESTAMP NOT NULL,
                depth FLOAT,
                lat_min FLOAT NOT NULL,
                lat_max FLOAT NOT NULL,
                lon_min FLOAT NOT NULL,
                lon_max FLOAT NOT NULL,
                slice_data JSONB NOT NULL,
                embedding vector(768),
                summary TEXT NOT NULL,
                source_file VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Create indexes for performance
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_netcdf_slices_variable_region_time
            ON netcdf_slices(variable, region, time);
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_netcdf_slices_spatial
            ON netcdf_slices(lat_min, lat_max, lon_min, lon_max);
        """)

        # Create vector similarity index
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_netcdf_slices_embedding
            ON netcdf_slices USING ivfflat (embedding vector_cosine_ops)
            WITH (lists = 100);
        """)
