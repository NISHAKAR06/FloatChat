from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

def health_check(request):
    """Health check endpoint for Django backend"""
    return JsonResponse({
        'status': 'healthy',
        'service': 'Django Backend',
        'timestamp': '2025-10-01T12:45:00Z'
    })

urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health_check),
    path("api/auth/", include("auth_app.urls")),
    path("api/admin/", include("admin_app.urls")),
    path("api/datasets/", include("dataset_app.urls")),
    path("api/viz/", include("viz_app.urls")),
    # path("api/jobs/", include("jobs_app.urls")),
    path("api/chat/", include("chat_app.urls")),
]
