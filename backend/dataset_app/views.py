import os
import json
import logging
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .models import NetCDFDataset, NetCDFSlice
from .serializers import NetCDFDatasetSerializer, NetCDFSliceSerializer
import netCDF4 as nc
import numpy as np
from datetime import datetime, timedelta
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

class NetCDFDatasetViewSet(viewsets.ModelViewSet):
    queryset = NetCDFDataset.objects.all()
    serializer_class = NetCDFDatasetSerializer
    permission_classes = [IsAuthenticated]

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

            # Process the file asynchronously
            process_netcdf_file.delay(dataset.id)

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
@permission_classes([IsAuthenticated])
def upload_netcdf_file(request):
    """Upload and validate NetCDF file"""
    if 'file' not in request.FILES:
        return Response(
            {'error': 'No file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )

    file_obj = request.FILES['file']
    name = request.data.get('name', file_obj.name)
    description = request.data.get('description', '')

    # Validate file extension
    if not file_obj.name.endswith('.nc'):
        return Response(
            {'error': 'Only NetCDF (.nc) files are supported'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Save file temporarily for processing
    temp_path = os.path.join(settings.MEDIA_ROOT, 'temp', file_obj.name)
    os.makedirs(os.path.dirname(temp_path), exist_ok=True)

    with open(temp_path, 'wb+') as destination:
        for chunk in file_obj.chunks():
            destination.write(chunk)

    try:
        # Validate NetCDF file
        with nc.Dataset(temp_path, 'r') as dataset:
            # Extract basic metadata
            variable_names = list(dataset.variables.keys())
            time_coverage = extract_time_coverage(dataset)
            spatial_coverage = extract_spatial_coverage(dataset)

        # Create dataset record
        dataset_obj = NetCDFDataset.objects.create(
            name=name,
            description=description,
            file_path=temp_path,
            file_size=file_obj.size,
            uploaded_by=request.user,
            variable_names=variable_names,
            time_coverage=time_coverage,
            spatial_coverage=spatial_coverage,
            status='uploaded'
        )

        return Response({
            'message': 'File uploaded successfully',
            'dataset_id': dataset_obj.id,
            'metadata': {
                'variables': variable_names,
                'time_coverage': time_coverage,
                'spatial_coverage': spatial_coverage
            }
        })

    except Exception as e:
        logger.error(f"Error processing uploaded file: {e}")
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
def get_dataset_metadata(request, dataset_id):
    """Get detailed metadata for a dataset"""
    try:
        dataset = NetCDFDataset.objects.get(id=dataset_id)
        slices = NetCDFSlice.objects.filter(dataset=dataset)

        metadata = {
            'dataset': NetCDFDatasetSerializer(dataset).data,
            'slice_count': slices.count(),
            'variables': dataset.variable_names,
            'time_coverage': dataset.time_coverage,
            'spatial_coverage': dataset.spatial_coverage,
            'slices': NetCDFSliceSerializer(slices[:10], many=True).data  # First 10 slices
        }

        return Response(metadata)
    except NetCDFDataset.DoesNotExist:
        return Response(
            {'error': 'Dataset not found'},
            status=status.HTTP_404_NOT_FOUND
        )

# Celery task for async processing (if Celery is configured)
try:
    from celery import shared_task

    @shared_task
    def process_netcdf_file(dataset_id):
        """Async task to process NetCDF file and create slices"""
        try:
            dataset = NetCDFDataset.objects.get(id=dataset_id)
            process_netcdf_slices(dataset)
            dataset.status = 'completed'
            dataset.save()
        except Exception as e:
            logger.error(f"Error in async processing: {e}")
            if 'dataset' in locals():
                dataset.status = 'failed'
                dataset.error_message = str(e)
                dataset.save()

except ImportError:
    # Celery not available, create sync function
    def process_netcdf_file(dataset_id):
        """Sync processing of NetCDF file"""
        try:
            dataset = NetCDFDataset.objects.get(id=dataset_id)
            process_netcdf_slices(dataset)
            dataset.status = 'completed'
            dataset.save()
        except Exception as e:
            logger.error(f"Error in sync processing: {e}")
            if 'dataset' in locals():
                dataset.status = 'failed'
                dataset.error_message = str(e)
                dataset.save()

def process_netcdf_slices(dataset):
    """Process NetCDF file and create slices with embeddings"""
    try:
        with nc.Dataset(dataset.file_path, 'r') as nc_dataset:
            # Get coordinate variables
            lat_var = nc_dataset.variables.get('lat') or nc_dataset.variables.get('latitude')
            lon_var = nc_dataset.variables.get('lon') or nc_dataset.variables.get('longitude')
            time_var = nc_dataset.variables.get('time')
            depth_var = nc_dataset.variables.get('depth') or nc_dataset.variables.get('z')

            if not lat_var or not lon_var or not time_var:
                raise ValueError("Required coordinate variables (lat, lon, time) not found")

            # Process each variable
            for var_name in dataset.variable_names:
                if var_name in ['lat', 'lon', 'latitude', 'longitude', 'time', 'depth', 'z']:
                    continue  # Skip coordinate variables

                var = nc_dataset.variables[var_name]

                # Determine dimensions
                if len(var.dimensions) < 3:
                    logger.warning(f"Variable {var_name} has insufficient dimensions")
                    continue

                # Process each time slice
                for t_idx in range(len(time_var)):
                    try:
                        # Extract time
                        if hasattr(time_var, 'units') and time_var.units:
                            current_time = nc.num2date(time_var[t_idx], time_var.units)
                        else:
                            current_time = datetime.now()  # Fallback

                        # Extract slice data
                        if len(var.dimensions) == 3:  # time, lat, lon
                            slice_data = var[t_idx, :, :].filled(np.nan).tolist()
                        elif len(var.dimensions) == 4 and depth_var is not None:  # time, depth, lat, lon
                            # For now, take surface layer (first depth)
                            slice_data = var[t_idx, 0, :, :].filled(np.nan).tolist()
                            current_depth = float(depth_var[0]) if len(depth_var) > 0 else None
                        else:
                            logger.warning(f"Unsupported dimensions for variable {var_name}")
                            continue

                        # Calculate spatial bounds
                        lat_min, lat_max = float(lat_var[0]), float(lat_var[-1])
                        lon_min, lon_max = float(lon_var[0]), float(lon_var[-1])

                        # Generate region name based on spatial coverage
                        region = determine_region(lat_min, lat_max, lon_min, lon_max)

                        # Generate summary
                        valid_data = [val for val in np.array(slice_data).flatten() if not np.isnan(val)]
                        if valid_data:
                            summary = f"{var_name} values in {region} region: min={min(valid_data):.2f}, max={max(valid_data):.2f}, mean={np.mean(valid_data):.2f}"
                        else:
                            summary = f"{var_name} data in {region} region (no valid values)"

                        # Generate embedding (placeholder - would use actual embedding model)
                        embedding = generate_embedding(summary)

                        # Create slice record
                        NetCDFSlice.objects.create(
                            dataset=dataset,
                            variable=var_name,
                            region=region,
                            time=current_time,
                            depth=current_depth,
                            lat_min=lat_min,
                            lat_max=lat_max,
                            lon_min=lon_min,
                            lon_max=lon_max,
                            slice_data=slice_data,
                            embedding=embedding,
                            summary=summary,
                            source_file=dataset.file_path
                        )

                    except Exception as e:
                        logger.error(f"Error processing slice for {var_name} at time {t_idx}: {e}")
                        continue

    except Exception as e:
        logger.error(f"Error processing NetCDF file: {e}")
        raise

def determine_region(lat_min, lat_max, lon_min, lon_max):
    """Determine ocean region based on coordinates"""
    # Indian Ocean region (simplified)
    if (20 <= lon_min <= 150 and lon_min <= 150 and
        -90 <= lat_min <= 30 and lat_max <= 30):
        return "Indian Ocean"

    # More specific regions within Indian Ocean
    if lat_min >= -10 and lat_max <= 25 and lon_min >= 40 and lon_max <= 100:
        return "Northern Indian Ocean"
    elif lat_min >= -60 and lat_max <= -10 and lon_min >= 20 and lon_max <= 150:
        return "Southern Indian Ocean"
    elif lat_min >= -20 and lat_max <= 10 and lon_min >= 50 and lon_max <= 90:
        return "Bay of Bengal"
    elif lat_min >= -30 and lat_max <= -10 and lon_min >= 50 and lon_max <= 80:
        return "Southern Indian Ocean"

    return "Indian Ocean"

def generate_embedding(text):
    """Generate embedding vector for text (placeholder implementation)"""
    # In production, this would use a proper embedding model like sentence-transformers
    # For now, return a dummy 768-dimensional vector
    import hashlib

    # Create a simple hash-based embedding
    hash_obj = hashlib.md5(text.encode())
    hash_bytes = hash_obj.digest()

    # Convert to 768-dimensional vector (normalize to unit length)
    embedding = []
    for i in range(768):
        # Use hash bytes to generate pseudo-random values
        byte_val = hash_bytes[i % len(hash_bytes)]
        # Normalize to [-1, 1] range
        normalized_val = (byte_val - 128) / 128.0
        embedding.append(normalized_val)

    return embedding

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
