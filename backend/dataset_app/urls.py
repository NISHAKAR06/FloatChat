from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    NetCDFDatasetViewSet, 
    upload_netcdf_file, 
    upload_netcdf_file_public,
    get_dataset_status, 
    get_dataset_metadata
)

router = DefaultRouter()
router.register(r'datasets', NetCDFDatasetViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('upload-netcdf/', upload_netcdf_file, name='upload-netcdf'),
    path('upload-netcdf-public/', upload_netcdf_file_public, name='upload-netcdf-public'),
    path('dataset-status/<uuid:dataset_id>/', get_dataset_status, name='dataset-status'),
    path('dataset-metadata/<uuid:dataset_id>/', get_dataset_metadata, name='dataset-metadata'),
]
