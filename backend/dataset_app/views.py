import os
import json
import logging
import uuid
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from django.db import models
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import NetCDFDataset, NetCDFValue, NetCDFEmbedding
from .serializers import NetCDFDatasetSerializer, NetCDFValueSerializer, NetCDFEmbeddingSerializer
from .tasks import process_netcdf_file_task
from datetime import datetime, timedelta
import requests
from django.conf import settings

# Try to import netCDF4, but don't fail if not available
try:
    import netCDF4 as nc
    import numpy as np
    NETCDF4_AVAILABLE = True
except ImportError:
    NETCDF4_AVAILABLE = False
    logger = logging.getLogger(__name__)
    logger.warning("netCDF4 not available, NetCDF processing will be limited")

logger = logging.getLogger(__name__)

class NetCDFDatasetViewSet(viewsets.ModelViewSet):
    queryset = NetCDFDataset.objects.all()
    serializer_class = NetCDFDatasetSerializer
    permission_classes = [IsAuthenticated]  # Require authentication for dataset operations

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

    @action(detail=True, methods=['post'])
    def process(self, request, pk=None):
        """Trigger preprocessing of uploaded NetCDF file"""
        dataset = self.get_object()

        if dataset.status != 'uploaded':
            return Response(
                {'error': 'Dataset is not in uploaded status'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Update status to processing
            dataset.status = 'processing'
            dataset.save()

            # Get the file path from the dataset
            file_path = dataset.file_path if hasattr(dataset, 'file_path') else None

            if not file_path:
                return Response(
                    {'error': 'File path not found for dataset'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Process the file asynchronously
            process_netcdf_file_task.delay(dataset.id, file_path)

            return Response({'message': 'Processing started'})

        except Exception as e:
            logger.error(f"Error starting processing: {e}")
            dataset.status = 'failed'
            dataset.error_message = str(e)
            dataset.save()
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def upload_netcdf_file(request):
    """Upload and validate NetCDF file (Admin only)"""
    logger.info(f"Upload request received - User: {request.user}, Is Admin: {request.user.is_staff if request.user.is_authenticated else False}")
    logger.info(f"Files in request: {list(request.FILES.keys())}")
    logger.info(f"Content type: {request.content_type}")
    
    if 'file' not in request.FILES:
        logger.error("No 'file' field in request.FILES")
        return Response(
            {
                'error': 'No file provided',
                'detail': 'Expected a file with field name "file"',
                'received_fields': list(request.FILES.keys())
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    file_obj = request.FILES['file']

    # Validate file extension
    if not file_obj.name.endswith('.nc'):
        return Response(
            {'error': 'Only NetCDF (.nc) files are supported'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Create unique filename to avoid conflicts
    file_extension = os.path.splitext(file_obj.name)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"

    # Save file to media/netcdf directory
    netcdf_dir = os.path.join(settings.MEDIA_ROOT, 'netcdf')
    os.makedirs(netcdf_dir, exist_ok=True)
    file_path = os.path.join(netcdf_dir, unique_filename)

    try:
        # Save the uploaded file
        with open(file_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)

        # Validate and extract metadata from NetCDF file
        if not NETCDF4_AVAILABLE:
            # Clean up file and return error if netCDF4 not available
            if os.path.exists(file_path):
                os.remove(file_path)
            return Response(
                {'error': 'NetCDF processing libraries are not available on this server'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        try:
            # IMPORTANT: Use a context manager and ensure file is fully closed before processing
            dataset = nc.Dataset(file_path, 'r')
            try:
                # Extract basic metadata
                variables = list(dataset.variables.keys())
                dimensions = {}

                for dim_name, dim in dataset.dimensions.items():
                    dimensions[dim_name] = {
                        'size': len(dim),
                        'unlimited': dim.isunlimited()
                    }

                # Validate that file has required dimensions and variables
                has_time = any(dim in ['time', 'TIME'] for dim in dataset.dimensions.keys())
                has_lat = any(var in ['lat', 'latitude', 'LAT', 'LATITUDE'] for var in dataset.variables.keys())
                has_lon = any(var in ['lon', 'longitude', 'LON', 'LONGITUDE'] for var in dataset.variables.keys())

                if not (has_lat and has_lon):
                    # Clean up invalid file
                    dataset.close()  # Ensure file is closed before deletion
                    if os.path.exists(file_path):
                        os.remove(file_path)
                    return Response(
                        {'error': 'NetCDF file must contain latitude and longitude variables'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
            finally:
                # CRITICAL: Always close the dataset to release file handle
                dataset.close()
                
            # Add a small delay to ensure Windows releases the file handle
            import time
            time.sleep(0.1)

        except Exception as e:
            logger.error(f"Error validating NetCDF file: {e}")
            # Clean up invalid file
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception as remove_error:
                    logger.warning(f"Could not remove invalid file: {remove_error}")
            return Response(
                {'error': f'Invalid NetCDF file: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create dataset record
        dataset_obj = NetCDFDataset.objects.create(
            filename=file_obj.name,
            file_path=file_path,
            status='uploaded',
            variables=variables,
            dimensions=dimensions,
            uploaded_by=request.user
        )
        logger.info(f"✅ Dataset record created: {dataset_obj.id}")
        logger.info(f"   Filename: {file_obj.name}")
        logger.info(f"   File path: {file_path}")
        logger.info(f"   Variables: {len(variables)}")

        # Trigger async processing
        logger.info(f"🚀 Triggering background processing task...")
        try:
            result = process_netcdf_file_task.delay(dataset_obj.id, file_path)
            logger.info(f"✅ Task dispatched successfully")
        except Exception as task_error:
            logger.error(f"❌ Error dispatching task: {task_error}")
            logger.info(f"🔄 Attempting synchronous processing as fallback...")
            try:
                # Fallback to synchronous processing
                process_netcdf_file_task(dataset_obj.id, file_path)
                logger.info(f"✅ Synchronous processing completed")
            except Exception as sync_error:
                logger.error(f"❌ Synchronous processing failed: {sync_error}", exc_info=True)

        return Response({
            'message': 'File uploaded successfully',
            'dataset_id': dataset_obj.id,
            'status': 'uploaded',
            'variables': variables,
            'dimensions': dimensions,
            'note': 'Processing started in background'
        })

    except Exception as e:
        logger.error(f"Error processing uploaded file: {e}")
        # Clean up file if it was saved
        if os.path.exists(file_path):
            os.remove(file_path)
        return Response(
            {'error': f'Error processing file: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def extract_time_coverage(dataset):
    """Extract time coverage from NetCDF dataset"""
    try:
        if 'time' in dataset.variables:
            time_var = dataset.variables['time']
            if hasattr(time_var, 'units') and time_var.units:
                # Handle different time units
                if 'days since' in time_var.units.lower():
                    start_time = nc.num2date(time_var[0], time_var.units)
                    end_time = nc.num2date(time_var[-1], time_var.units)
                    return {
                        'start': start_time.isoformat() if start_time else None,
                        'end': end_time.isoformat() if end_time else None,
                        'units': time_var.units
                    }
    except Exception as e:
        logger.warning(f"Could not extract time coverage: {e}")
    return None

def extract_spatial_coverage(dataset):
    """Extract spatial coverage from NetCDF dataset"""
    try:
        lat_range = None
        lon_range = None

        if 'lat' in dataset.variables or 'latitude' in dataset.variables:
            lat_var = dataset.variables.get('lat') or dataset.variables.get('latitude')
            if lat_var.shape:
                lat_range = [float(lat_var[0]), float(lat_var[-1])]

        if 'lon' in dataset.variables or 'longitude' in dataset.variables:
            lon_var = dataset.variables.get('lon') or dataset.variables.get('longitude')
            if lon_var.shape:
                lon_range = [float(lon_var[0]), float(lon_var[-1])]

        if lat_range and lon_range:
            return {
                'latitude': lat_range,
                'longitude': lon_range
            }
    except Exception as e:
        logger.warning(f"Could not extract spatial coverage: {e}")
    return None

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dataset_status(request, dataset_id):
    """Get dataset processing status"""
    try:
        dataset = NetCDFDataset.objects.get(id=dataset_id)

        # Get counts for dashboard
        value_count = NetCDFValue.objects.filter(dataset=dataset).count()
        embedding_count = NetCDFEmbedding.objects.filter(dataset=dataset).count()

        status_data = {
            'id': dataset.id,
            'filename': dataset.filename,
            'status': dataset.status,
            'upload_time': dataset.upload_time,
            'variables': dataset.variables,
            'dimensions': dataset.dimensions,
            'value_count': value_count,
            'embedding_count': embedding_count,
            'uploaded_by': dataset.uploaded_by.username if dataset.uploaded_by else None
        }

        return Response(status_data)
    except NetCDFDataset.DoesNotExist:
        return Response(
            {'error': 'Dataset not found'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dataset_metadata(request, dataset_id):
    """Get detailed metadata for a dataset"""
    try:
        dataset = NetCDFDataset.objects.get(id=dataset_id)

        # Get sample data for preview
        sample_values = NetCDFValue.objects.filter(dataset=dataset)[:100]
        sample_embeddings = NetCDFEmbedding.objects.filter(dataset=dataset)[:10]

        metadata = {
            'dataset': {
                'id': dataset.id,
                'filename': dataset.filename,
                'status': dataset.status,
                'upload_time': dataset.upload_time,
                'variables': dataset.variables,
                'dimensions': dataset.dimensions,
                'uploaded_by': dataset.uploaded_by.username if dataset.uploaded_by else None
            },
            'statistics': {
                'total_values': NetCDFValue.objects.filter(dataset=dataset).count(),
                'total_embeddings': NetCDFEmbedding.objects.filter(dataset=dataset).count(),
                'unique_variables': len(set(NetCDFValue.objects.filter(dataset=dataset).values_list('variable', flat=True))),
                'time_range': get_time_range(dataset)
            },
            'sample_data': {
                'values': list(sample_values.values('variable', 'time', 'lat', 'lon', 'value')[:20]),
                'embeddings': list(sample_embeddings.values('variable', 'time', 'region', 'summary')[:5])
            }
        }

        return Response(metadata)
    except NetCDFDataset.DoesNotExist:
        return Response(
            {'error': 'Dataset not found'},
            status=status.HTTP_404_NOT_FOUND
        )

def get_time_range(dataset):
    """Get the time range for a dataset"""
    try:
        time_values = NetCDFValue.objects.filter(dataset=dataset).aggregate(
            min_time=models.Min('time'),
            max_time=models.Max('time')
        )
        if time_values['min_time'] and time_values['max_time']:
            return {
                'start': time_values['min_time'].isoformat(),
                'end': time_values['max_time'].isoformat()
            }
    except:
        pass
    return None

# Note: Processing functions moved to tasks.py for better organization
# The actual processing is handled by the Celery tasks in tasks.py

def initialize_database():
    """Initialize database tables and extensions"""
    from django.db import connection
    from .models import create_vector_table

    try:
        # Create vector extension and tables
        create_vector_table()
        print("✅ Database initialized successfully")
        return True
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return False


@api_view(['POST'])
def upload_netcdf_file_public(request):
    """
    Upload NetCDF file without authentication (Development only)
    For production, use upload_netcdf_file with admin authentication
    """
    logger.info(f"Public upload request received")
    logger.info(f"Files in request: {list(request.FILES.keys())}")
    logger.info(f"Content type: {request.content_type}")
    
    if 'file' not in request.FILES:
        logger.error("No 'file' field in request.FILES")
        return Response(
            {
                'error': 'No file provided',
                'detail': 'Please upload a file with field name "file"',
                'received_fields': list(request.FILES.keys()),
                'hint': 'Use form-data with key "file" and select a .nc file'
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    file_obj = request.FILES['file']
    logger.info(f"Processing file: {file_obj.name}, size: {file_obj.size} bytes")

    # Validate file extension
    if not file_obj.name.endswith('.nc'):
        return Response(
            {'error': f'Only NetCDF (.nc) files are supported. Received: {file_obj.name}'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Create unique filename to avoid conflicts
    file_extension = os.path.splitext(file_obj.name)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"

    # Save file to media/netcdf directory
    netcdf_dir = os.path.join(settings.MEDIA_ROOT, 'netcdf')
    os.makedirs(netcdf_dir, exist_ok=True)
    file_path = os.path.join(netcdf_dir, unique_filename)

    try:
        # Save the uploaded file
        logger.info(f"Saving file to: {file_path}")
        with open(file_path, 'wb+') as destination:
            for chunk in file_obj.chunks():
                destination.write(chunk)
        logger.info(f"File saved successfully: {file_path}")

        # Validate and extract metadata from NetCDF file
        if not NETCDF4_AVAILABLE:
            logger.error("netCDF4 library not available")
            if os.path.exists(file_path):
                os.remove(file_path)
            return Response(
                {'error': 'NetCDF processing libraries are not available on this server'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        try:
            with nc.Dataset(file_path, 'r') as dataset:
                # Extract basic metadata
                variables = list(dataset.variables.keys())
                dimensions = {}

                for dim_name, dim in dataset.dimensions.items():
                    dimensions[dim_name] = {
                        'size': len(dim),
                        'unlimited': dim.isunlimited()
                    }

                logger.info(f"NetCDF variables: {variables}")
                logger.info(f"NetCDF dimensions: {dimensions}")

                # Validate that file has required variables (more flexible check)
                var_lower = [v.lower() for v in dataset.variables.keys()]
                has_lat = any(lat_name in var_lower for lat_name in ['lat', 'latitude'])
                has_lon = any(lon_name in var_lower for lon_name in ['lon', 'longitude'])

                if not (has_lat and has_lon):
                    logger.error(f"Missing required variables. Has lat: {has_lat}, Has lon: {has_lon}")
                    if os.path.exists(file_path):
                        os.remove(file_path)
                    return Response(
                        {
                            'error': 'NetCDF file must contain latitude and longitude variables',
                            'found_variables': variables
                        },
                        status=status.HTTP_400_BAD_REQUEST
                    )

        except Exception as e:
            logger.error(f"Error validating NetCDF file: {e}", exc_info=True)
            if os.path.exists(file_path):
                os.remove(file_path)
            return Response(
                {'error': f'Invalid NetCDF file: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get or create a default user for public uploads
        from auth_app.models import CustomUser
        try:
            default_user = CustomUser.objects.filter(is_staff=True).first()
            if not default_user:
                default_user = CustomUser.objects.create_user(
                    username='admin',
                    email='admin@floatchat.local',
                    password='admin123',
                    is_staff=True,
                    is_superuser=True
                )
                logger.info("Created default admin user")
        except Exception as e:
            logger.error(f"Error getting default user: {e}")
            default_user = None

        if not default_user:
            return Response(
                {'error': 'Could not create dataset record - no admin user available'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Create dataset record
        dataset_obj = NetCDFDataset.objects.create(
            filename=file_obj.name,
            file_path=file_path,
            status='uploaded',
            variables=variables,
            dimensions=dimensions,
            uploaded_by=default_user
        )

        logger.info(f"Dataset created: {dataset_obj.id}")

        # Trigger async processing
        try:
            process_netcdf_file_task.delay(dataset_obj.id, file_path)
            logger.info(f"Processing task queued for dataset {dataset_obj.id}")
        except Exception as e:
            logger.warning(f"Could not queue async task (Celery may not be running): {e}")
            logger.info("Processing will happen synchronously")
            # Process synchronously if Celery is not available
            try:
                from .tasks import process_netcdf_file_task
                process_netcdf_file_task(dataset_obj.id, file_path)
            except Exception as sync_error:
                logger.error(f"Synchronous processing failed: {sync_error}")

        return Response({
            'message': 'File uploaded successfully',
            'dataset_id': str(dataset_obj.id),
            'status': 'uploaded',
            'filename': file_obj.name,
            'variables': variables,
            'dimensions': dimensions,
            'file_size': file_obj.size,
            'note': 'Processing started in background'
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f"Error processing uploaded file: {e}", exc_info=True)
        # Clean up file if it was saved
        if os.path.exists(file_path):
            os.remove(file_path)
        return Response(
            {'error': f'Error processing file: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
