from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

def health_check(request):
    """Simple health check endpoint"""
    return JsonResponse({
        'status': 'healthy',
        'service': 'Django Backend',
        'timestamp': '2025-10-01T12:45:00Z'
    })

def create_admin_user(request):
    """Create default admin user - ONE TIME SETUP ONLY"""
    from auth_app.models import CustomUser
    try:
        # Check if any admin already exists
        if CustomUser.objects.filter(email='admin@floatchat.in').exists():
            return JsonResponse({
                'status': 'error',
                'message': 'Admin user already exists'
            }, status=400)
        
        admin_user = CustomUser.objects.create_superuser(
            username='admin',
            email='admin@floatchat.in',
            password='admin123'
        )
        admin_user.role = 'admin'
        admin_user.save()
        
        return JsonResponse({
            'status': 'success',
            'message': 'Admin user created successfully',
            'credentials': {
                'username': 'admin',
                'email': 'admin@floatchat.in',
                'password': 'admin123'
            }
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)

def create_demo_user(request):
    """Create default demo user - ONE TIME SETUP ONLY"""
    from auth_app.models import CustomUser
    try:
        # Delete existing user with this email if exists
        CustomUser.objects.filter(email='user@floatchat.in').delete()
        
        demo_user = CustomUser.objects.create_user(
            username='demo_user',
            email='user@floatchat.in',
            password='user123'
        )
        demo_user.role = 'user'
        demo_user.save()
        
        return JsonResponse({
            'status': 'success',
            'message': 'Demo user created successfully',
            'credentials': {
                'username': 'demo_user',
                'email': 'user@floatchat.in',
                'password': 'user123'
            }
        })
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)

def list_users(request):
    """List all users - DEBUGGING ONLY"""
    from auth_app.models import CustomUser
    users = CustomUser.objects.all()
    users_data = [{
        'username': u.username,
        'email': u.email,
        'role': u.role,
        'is_active': u.is_active
    } for u in users]
    return JsonResponse({
        'total': users.count(),
        'users': users_data
    })

urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health_check),
    path("setup-admin/", create_admin_user),
    path("setup-user/", create_demo_user),
    path("list-users/", list_users),  # Debug endpoint
    path("api/auth/", include("auth_app.urls")),
    path("api/admin/", include("admin_app.urls")),
    path("api/chat/", include("chat_app.urls")),
    path("api/datasets/", include("dataset_app.urls")),
    # path("api/jobs/", include("jobs_app.urls")),  # Commented out - Job model not implemented
]