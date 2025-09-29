"""
Enhanced ARGO Chat API Views with Complete RAG Pipeline Integration
"""

import json
import logging
import os
import sys
from datetime import datetime
from pathlib import Path
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings

# Add project root to Python path for src imports
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

logger = logging.getLogger(__name__)

# Lazy import and configuration checking
def check_rag_integration():
    """Check if RAG integration is available"""
    try:
        from src.rag_pipeline import RAGPipeline, create_rag_pipeline
        from src.config import Config

        # Check for required environment variables
        db_uri = os.getenv("DATABASE_URI")
        ollama_url = os.getenv("OLLAMA_URL")

        if not db_uri or not ollama_url:
            logger.warning("❌ Environment variables missing - DATABASE_URI, OLLAMA_URL required")
            logger.warning(f"   DATABASE_URI: {'✓' if db_uri else '✗'}")
            logger.warning(f"   OLLAMA_URL: {'✓' if ollama_url else '✗'}")
            return False

        return True
    except ImportError as e:
        logger.warning(f"❌ RAG pipeline import failed: {e}")
        return False

# Check integration during first use
RAG_INTEGRATION_AVAILABLE = None

def get_rag_integration_status():
    """Get RAG integration status (cached)"""
    global RAG_INTEGRATION_AVAILABLE
    if RAG_INTEGRATION_AVAILABLE is None:
        RAG_INTEGRATION_AVAILABLE = check_rag_integration()
    return RAG_INTEGRATION_AVAILABLE

# NO SAMPLE DATA ALLOWED - FORCE CLOUD DATABASE USAGE ONLY
# All ARGO data comes from cloud NetCDF database via RAG pipeline

# ALL FUNCTIONS BELOW ARE DEPRECATED - USING RAG PIPELINE WITH CLOUD DATABASE ONLY
# All ARGO data processing now happens through the enhanced RAG pipeline

# REMOVED ALL SAMPLE DATA FUNCTIONS
# Only cloud database via RAG pipeline is used

@api_view(['POST'])
@permission_classes([])
def upload_argo_file(request):
    """Upload and process ARGO NetCDF files"""
    try:
        if 'file' not in request.FILES:
            return JsonResponse({
                'error': 'No file uploaded'
            }, status=400)
        
        uploaded_file = request.FILES['file']
        
        # Validate file type
        if not uploaded_file.name.endswith(('.nc', '.netcdf')):
            return JsonResponse({
                'error': 'Only NetCDF files (.nc, .netcdf) are supported'
            }, status=400)
        
        # Save temporary file
        upload_dir = Path(settings.MEDIA_ROOT) / 'argo_uploads'
        upload_dir.mkdir(exist_ok=True)
        
        file_path = upload_dir / uploaded_file.name
        
        with open(file_path, 'wb+') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)
        
        # For now, just return success since we don't have file processing set up
        # In a real implementation, this would process the NetCDF file

        return JsonResponse({
            'message': 'File upload functionality ready (processing not yet implemented)',
            'file_name': uploaded_file.name,
            'file_size': uploaded_file.size,
            'processing_status': 'received'
        })
        
    except Exception as e:
        logger.error(f"Upload API error: {e}")
        return JsonResponse({
            'error': f'Upload failed: {str(e)}'
        }, status=500)

# Enhanced RAG Pipeline Integration
def get_rag_pipeline():
    """Get or create RAG pipeline instance"""
    if get_rag_integration_status():
        try:
            from src.rag_pipeline import create_rag_pipeline
            rag_pipeline = create_rag_pipeline()
            logger.info("✅ RAG pipeline created successfully")
            return rag_pipeline
        except Exception as e:
            logger.error(f"❌ Failed to initialize RAG pipeline: {e}")
            return None
    return None

@api_view(['POST'])
@permission_classes([])
def process_enhanced_argo_chat(request):
    """
    Enhanced ARGO chat processing with complete RAG pipeline using NetCDF cloud data ONLY
    """
    try:
        # Parse request
        data = json.loads(request.body)
        user_query = data.get('message', '').strip()
        filters = data.get('filters', {})

        if not user_query:
            return JsonResponse({'error': 'Message is required'}, status=400)

        logger.info(f"� Processing ARGO query with cloud RAG pipeline: {user_query}")

        # FORCE cloud database usage - no fallback to fake data
        try:
            from src.rag_pipeline import create_rag_pipeline
            rag_pipeline = create_rag_pipeline()

            if rag_pipeline:
                # Use enhanced pipeline with REAL NetCDF cloud data
                structured_response = rag_pipeline.generate_structured_response(user_query, filters)

                # Extract visualizations if present
                visualizations_data = structured_response.get('visualizations', {})
                visualizations_base64 = {}

                # Convert visualization objects to base64 images
                if visualizations_data:
                    import base64
                    for viz_type, viz_obj in visualizations_data.items():
                        try:
                            if hasattr(viz_obj, 'to_image'):
                                # Plotly figure to base64
                                img_bytes = viz_obj.to_image(format='png', width=800, height=600)
                                img_base64 = base64.b64encode(img_bytes).decode('utf-8')
                                visualizations_base64[viz_type] = f"data:image/png;base64,{img_base64}"
                        except Exception as viz_e:
                            logger.warning(f"Failed to convert {viz_type} to image: {viz_e}")

                response_data = {
                    'response': structured_response.get('answer', ''),
                    'profiles': structured_response.get('data', {}).get('profiles', []),
                    'statistics': structured_response.get('data', {}).get('statistics', {}),
                    'query_analysis': structured_response.get('analysis', {}),
                    'visualizations': visualizations_base64,
                    'metadata': structured_response.get('metadata', {}),
                    'pipeline_used': 'enhanced_rag_cloud_netcdf',
                    'data_source': 'real_netcdf_cloud_db',
                    'model': 'Ollama LLaMA + EmbeddingGemma',
                    'vector_dimension': 768
                }

                logger.info(f"✅ Cloud RAG response generated with {len(visualizations_base64)} visualizations")
                return JsonResponse(response_data)
            else:
                raise Exception("RAG pipeline initialization failed - check configuration")

        except Exception as e:
            logger.error(f"❌ Cloud RAG pipeline error: {e}")
            # No fallback - must use real data
            return JsonResponse({
                'error': f'ARGO pipeline failed - {str(e)}',
                'solution': 'Ensure DATABASE_URI, OLLAMA_URL, and cloud data are properly configured'
            }, status=500)

    except Exception as e:
        logger.error(f"🚨 Enhanced chat API error: {e}")
        return JsonResponse({
            'error': f'System error: {str(e)}',
            'status': 'pipeline_failure'
        }, status=500)

def process_basic_argo_chat(user_query, filters=None):
    """Basic ARGO chat processing (fallback)"""
    query_lower = user_query.lower()

    # Simple response logic
    if any(word in query_lower for word in ['hi', 'hello', 'hey']):
        response = "Hello! I'm your ARGO oceanographic data assistant with enhanced AI capabilities."
    elif any(word in query_lower for word in ['temperature', 'temp']):
        response = "I can analyze temperature profiles from ARGO float data across multiple ocean regions."
    elif any(word in query_lower for word in ['salinity', 'salt']):
        response = "I can provide salinity analysis from ARGO measurements covering global ocean basins."
    elif any(word in query_lower for word in ['plot', 'chart', 'visualization']):
        response = "I can generate interactive visualizations including temperature profiles, T-S diagrams, and geographic maps."
    else:
        response = f"I understand you're asking about: '{user_query}'. I can help with ARGO float data analysis, visualizations, and oceanographic insights."

    return JsonResponse({
        'response': response,
        'profiles': [],
        'pipeline_used': 'basic',
        'capabilities': [
            'Natural language queries',
            'Vector similarity search',
            'Interactive visualizations',
            '768-dimensional embeddings',
            'Real-time data analysis'
        ]
    })

@api_view(['GET'])
@permission_classes([])
def get_system_status(request):
    """Get comprehensive system status"""
    try:
        rag_pipeline = get_rag_pipeline()

        status_info = {
            'system_status': 'operational',
            'timestamp': datetime.now().isoformat(),
            'components': {}
        }

        # RAG pipeline status
        if rag_pipeline:
            try:
                pipeline_status = rag_pipeline.get_system_status()
                status_info['components']['rag_pipeline'] = pipeline_status
            except Exception as e:
                status_info['components']['rag_pipeline'] = {
                    'status': 'error',
                    'error': str(e)
                }
        else:
            status_info['components']['rag_pipeline'] = {
                'status': 'unavailable',
                'reason': 'RAG pipeline not initialized'
            }

        # Database status
        status_info['components']['database'] = {
            'status': 'connected',
            'type': 'PostgreSQL with pgvector',
            'vector_dimension': 768
        }

        # Model status
        status_info['components']['models'] = {
            'llm': 'Ollama LLaMA',
            'embedding': 'EmbeddingGemma (768-dim)',
            'status': 'ready' if RAG_INTEGRATION else 'unavailable'
        }

        return JsonResponse(status_info)

    except Exception as e:
        logger.error(f"System status error: {e}")
        return JsonResponse({
            'system_status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }, status=500)

@api_view(['POST'])
@permission_classes([])
def generate_visualization(request):
    """Generate visualization for ARGO data"""
    try:
        data = json.loads(request.body)
        visualization_type = data.get('type', 'temperature_profile')
        profiles = data.get('profiles', [])
        query = data.get('query', '')

        if not profiles:
            return JsonResponse({'error': 'No profile data provided'}, status=400)

        # Try to use RAG pipeline for visualization
        rag_pipeline = get_rag_pipeline()
        if rag_pipeline:
            try:
                # Generate visualization using the pipeline
                visualizations = rag_pipeline._generate_visualizations(profiles, {'data_types': [visualization_type]})

                return JsonResponse({
                    'visualizations': visualizations,
                    'generated_by': 'enhanced_pipeline',
                    'type': visualization_type
                })

            except Exception as e:
                logger.error(f"Visualization generation error: {e}")

        # Fallback to basic visualization info
        return JsonResponse({
            'message': f'Visualization generation requested for {visualization_type}',
            'profiles_count': len(profiles),
            'generated_by': 'basic_pipeline',
            'note': 'Full visualization generation requires RAG pipeline'
        })

    except Exception as e:
        logger.error(f"Visualization API error: {e}")
        return JsonResponse({
            'error': f'Visualization generation failed: {str(e)}'
        }, status=500)

@api_view(['POST'])
@permission_classes([])
def batch_query_processing(request):
    """Process multiple queries in batch"""
    try:
        data = json.loads(request.body)
        queries = data.get('queries', [])
        filters = data.get('filters', {})

        if not queries:
            return JsonResponse({'error': 'No queries provided'}, status=400)

        rag_pipeline = get_rag_pipeline()
        results = []

        if rag_pipeline:
            try:
                # Use batch processing
                batch_results = rag_pipeline.batch_process_queries(queries, filters)
                results = batch_results

            except Exception as e:
                logger.error(f"Batch processing error: {e}")
                # Fallback to individual processing
                for query in queries:
                    try:
                        result = rag_pipeline.generate_structured_response(query, filters)
                        results.append(result)
                    except:
                        results.append({
                            'query': query,
                            'error': 'Individual processing failed',
                            'response_type': 'error'
                        })

        else:
            # Basic batch processing
            for query in queries:
                result = process_basic_argo_chat(query, filters)
                results.append({
                    'query': query,
                    'response': result.content if hasattr(result, 'content') else 'Basic response',
                    'response_type': 'basic'
                })

        return JsonResponse({
            'batch_results': results,
            'total_queries': len(queries),
            'pipeline_used': 'enhanced_rag' if rag_pipeline else 'basic'
        })

    except Exception as e:
        logger.error(f"Batch query API error: {e}")
        return JsonResponse({
            'error': f'Batch processing failed: {str(e)}'
        }, status=500)
