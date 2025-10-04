import os
from celery import Celery
from django.conf import settings

# Set the default Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')

# Celery Configuration
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
