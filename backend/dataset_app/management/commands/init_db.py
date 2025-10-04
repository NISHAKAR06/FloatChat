from django.core.management.base import BaseCommand
from django.db import connection
from dataset_app.models import create_vector_tables

class Command(BaseCommand):
    help = 'Initialize database tables and extensions for NetCDF processing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Force recreation of tables even if they exist',
        )

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS('Initializing database for NetCDF processing...')
        )

        try:
            # Create vector extension and tables
            create_vector_tables()

            self.stdout.write(
                self.style.SUCCESS('✅ Database initialized successfully!')
            )
            self.stdout.write(
                self.style.SUCCESS('Created tables:')
            )
            self.stdout.write(
                self.style.SUCCESS('  - datasets (metadata storage)')
            )
            self.stdout.write(
                self.style.SUCCESS('  - dataset_values (flattened data)')
            )
            self.stdout.write(
                self.style.SUCCESS('  - dataset_embeddings (vector storage)')
            )
            self.stdout.write(
                self.style.SUCCESS('  - Indexes for performance optimization')
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Database initialization failed: {e}')
            )
            raise
