import os
from django.conf import settings

# Try to import Celery, but don't fail if not available
try:
    from celery import Celery
    CELERY_AVAILABLE = True
except ImportError:
    CELERY_AVAILABLE = False
    
    # Create a mock Celery class
    class Celery:
        """Mock Celery app for when Celery is not installed"""
        def __init__(self, *args, **kwargs):
            self.conf = self
            
        def update(self, **kwargs):
            """Mock config update"""
            pass
            
        def autodiscover_tasks(self):
            """Mock task discovery"""
            pass

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')

if CELERY_AVAILABLE:
    # Celery Configuration - only if Celery is actually installed
    app.conf.update(
        # Broker settings
        broker_url=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
        result_backend=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),

        # Worker settings - reduce concurrency to avoid resource issues
        worker_concurrency=2,  # Reduced from default (usually 4-8)
        worker_prefetch_multiplier=1,

        # Task settings
        task_serializer='json',
        accept_content=['json'],
        result_serializer='json',
        timezone='UTC',

        # Task execution settings
        task_acks_late=True,
        task_reject_on_worker_lost=True,

        # Worker settings
        worker_max_tasks_per_child=100,
        worker_disable_rate_limits=False
    )

    # Load task modules from all registered Django apps.
    app.autodiscover_tasks()
