from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SystemMetricViewSet

router = DefaultRouter()
router.register(r'metrics', SystemMetricViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
