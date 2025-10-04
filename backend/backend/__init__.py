# Optional Celery import - only if celery is installed
try:
    # This will make sure the app is always imported when
    # Django starts so that shared_task will use this app.
    from .celery import app as celery_app
    __all__ = ('celery_app',)
except ImportError:
    # Celery not installed - skip import
    celery_app = None
    __all__ = ()
