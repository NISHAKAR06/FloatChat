"""
Mock Celery for Production Deployment
======================================
This module provides a fake Celery implementation for when Celery is not installed.
Tasks decorated with @shared_task will execute synchronously instead of async.

This is useful for:
1. Production deployments where async task processing isn't needed
2. Render free tier where background workers aren't available
3. Testing and development without Celery infrastructure
"""

class MockSharedTask:
    """Mock decorator for Celery's shared_task"""
    
    def __init__(self, *args, **kwargs):
        self.bind = kwargs.get('bind', False)
    
    def __call__(self, func):
        """
        Decorator that makes the function execute synchronously.
        The original function signature is preserved.
        Adds .delay() and .apply_async() methods for compatibility.
        """
        if self.bind:
            # If bind=True, the first argument is 'self' (the task instance)
            # For synchronous execution, we just pass None as self
            def wrapper(*args, **kwargs):
                # Call with None as the first 'self' argument
                return func(None, *args, **kwargs)
            
            # Add Celery-compatible methods
            wrapper.delay = wrapper  # .delay() just calls the function
            wrapper.apply_async = lambda args=(), kwargs={}: wrapper(*args, **kwargs)
            return wrapper
        else:
            # Normal function - just return it as-is with Celery methods
            func.delay = func  # .delay() just calls the function
            func.apply_async = lambda args=(), kwargs={}: func(*args, **kwargs)
            return func


def shared_task(*args, **kwargs):
    """
    Mock version of celery.shared_task
    
    Usage:
        @shared_task
        def my_task(arg1, arg2):
            return arg1 + arg2
        
        @shared_task(bind=True)
        def my_bound_task(self, arg1, arg2):
            return arg1 + arg2
    """
    # If called with a function directly: @shared_task
    if len(args) == 1 and callable(args[0]) and not kwargs:
        func = args[0]
        return MockSharedTask()(func)
    
    # If called with arguments: @shared_task(bind=True)
    return MockSharedTask(*args, **kwargs)
