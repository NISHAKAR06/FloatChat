"""
ASGI config for backend project with FastAPI integration.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from django.conf import settings

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

# Get Django ASGI application
django_application = get_asgi_application()

# Import and integrate FastAPI for AI chat features
try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    from starlette.middleware.base import BaseHTTPMiddleware

    # Import our FastAPI service
    from fastapi_service.main import app as fastapi_app
    from fastapi_service.main import chatbot

    # Create integrated application
    from starlette.applications import Starlette
    from starlette.routing import Mount
    from starlette.middleware import Middleware

    # Django CORS settings as list
    django_cors_origins = getattr(settings, 'CORS_ALLOWED_ORIGINS', ['*'])

    # FastAPI app with CORS (for chat endpoints)
    fastapi_app.add_middleware(
        CORSMiddleware,
        allow_origins=django_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Mount FastAPI under /api/chat path to avoid conflicts
    application = Starlette(
        routes=[
            Mount("/api/chat", fastapi_app, name="fastapi-chat"),
            Mount("/", django_application, name="django"),
        ]
    )

    print("✓ ASGI: Successfully integrated FastAPI with Django (Single deployment)")

except ImportError as e:
    print(f"⚠️  ASGI: FastAPI not available ({e}), running Django only")
    application = django_application
except Exception as e:
    print(f"⚠️  ASGI: Error integrating FastAPI ({e}), running Django only")
    application = django_application
