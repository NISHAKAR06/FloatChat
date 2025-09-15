from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VisualizationViewSet

router = DefaultRouter()
router.register(r'visualizations', VisualizationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
