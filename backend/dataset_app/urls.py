from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NetCDFDatasetViewSet, upload_netcdf_file, get_dataset_metadata

router = DefaultRouter()
router.register(r'datasets', NetCDFDatasetViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('upload/', upload_netcdf_file, name='upload-netcdf'),
    path('datasets/<uuid:dataset_id>/metadata/', get_dataset_metadata, name='dataset-metadata'),
]
