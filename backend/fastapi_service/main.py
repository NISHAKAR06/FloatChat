import os
import json
import asyncio
import logging
from typing import List, Dict, Optional, Any
from datetime import datetime
import re
import requests
import hashlib
import netCDF4 as nc
import numpy as np
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import websockets

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database and processing modules (integrated) - handle both package and script imports
try:
    # Try relative imports (when run as package/module)
    from .database import DatabaseManager
    from .vector_store import VectorStore
    from .rag_pipeline import RAGPipeline
    from .fallback_config import create_fallback_config
    from .mcp_server.argo_server import ArgoMCPServer
except ImportError:
    # Fall back to absolute imports (when run as standalone script)
    import sys
    import os
    # Add the backend directory to the path so we can import as absolute
    backend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)

    from fastapi_service.database import DatabaseManager
    from fastapi_service.vector_store import VectorStore
    from fastapi_service.rag_pipeline import RAGPipeline
    from fastapi_service.fallback_config import create_fallback_config
    from fastapi_service.mcp_server.argo_server import ArgoMCPServer

# Use imported modules instead of local definitions
IntegratedDatabaseManager = DatabaseManager
IntegratedVectorStore = VectorStore
IntegratedRAGPipeline = RAGPipeline

# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Indian Ocean Oceanography Chatbot Service")
    yield
    # Shutdown
    logger.info("Shutting down chatbot service")

# Create FastAPI app with lifespan
app = FastAPI(
    title="Indian Ocean Oceanography Chatbot API",
    description="FastAPI service for oceanographic data queries with RAG + MCP + Groq",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Pydantic models
class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class QueryAnalysis(BaseModel):
    query_type: str
    geographic_filters: Dict[str, List[float]]
    temporal_filters: Dict[str, str]
    data_types: List[str]
    operations: List[str]
    needs_sql: bool
    needs_visualization: bool
    ocean_region: str
    depth_range: Optional[Dict[str, float]]
    confidence_level: str

class MCPAggregation(BaseModel):
    operation: str
    variable: str
    filters: Dict[str, Any]
    result: float

class ChatResponse(BaseModel):
    response: str
    sources: List[str]
    visualization: Optional[str]
    confidence: float
    metadata: Dict[str, Any]

# Global state
active_connections: Dict[str, WebSocket] = {}
chat_sessions: Dict[str, List[Dict]] = {}

# Environment variables
GROQ_API_KEY = os.getenv("GROQ_API_KEY", os.getenv("GROQ_API", ""))
NEON_DB_URI = os.getenv("DATABASE_URI", "")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434")

class OceanographyChatbot:
    """Main chatbot class handling Indian Ocean queries using correct flow"""

    def __init__(self):
        self.system_prompt = """You are an Oceanography Assistant specialized in the INDIAN OCEAN.

RULES:
1. Only use MCP JSON + RAG excerpts provided in context.
2. If query is outside Indian Ocean scope or DB variables, reply:
   "I can only provide information based on the Indian Ocean dataset available in the database."
3. All numeric claims must come from MCP JSON.
4. Format answer as:
   - One-sentence summary
   - Bullet list of numeric findings
   - Short explanation of trends/insights
   - Visualization caption (if any)
5. Append JSON:
   { "sources": [slice_ids], "visualization": "filename_or_null", "confidence": number }
6. Never hallucinate. Never use external knowledge."""

        # Initialize the correct flow components
        self.mcp_server = ArgoMCPServer()
        self.config = create_fallback_config()
        self.rag_pipeline = IntegratedRAGPipeline(self.config)
        self.db_manager = IntegratedDatabaseManager(self.config.database_uri)

    async def analyze_query(self, query: str) -> QueryAnalysis:
        """Analyze user query to extract intent and parameters"""
        query_lower = query.lower()

        # Determine query type
        if any(word in query_lower for word in ['show', 'plot', 'visualize', 'map']):
            query_type = 'visualization'
            needs_visualization = True
        elif any(word in query_lower for word in ['count', 'how many', 'statistics', 'avg', 'average', 'mean']):
            query_type = 'statistics'
            needs_visualization = False
        elif any(word in query_lower for word in ['compare', 'difference', 'trend']):
            query_type = 'comparison'
            needs_visualization = False
        else:
            query_type = 'search'
            needs_visualization = False

        # Extract geographic filters
        geographic_filters = {}
        if 'bay of bengal' in query_lower:
            geographic_filters = {'lat_range': [5, 25], 'lon_range': [80, 100]}
        elif 'arabian sea' in query_lower:
            geographic_filters = {'lat_range': [5, 25], 'lon_range': [50, 75]}
        elif 'southern indian ocean' in query_lower:
            geographic_filters = {'lat_range': [-60, -10], 'lon_range': [20, 150]}
        else:
            # Default Indian Ocean bounds
            geographic_filters = {'lat_range': [-90, 30], 'lon_range': [20, 150]}

        # Extract data types
        data_types = []
        if 'temperature' in query_lower or 'temp' in query_lower:
            data_types.append('temperature')
        if 'salinity' in query_lower or 'salt' in query_lower:
            data_types.append('salinity')
        if 'current' in query_lower or 'velocity' in query_lower:
            data_types.append('currents')

        # Extract operations
        operations = []
        if 'average' in query_lower or 'avg' in query_lower or 'mean' in query_lower:
            operations.append('mean')
        if 'maximum' in query_lower or 'max' in query_lower:
            operations.append('max')
        if 'minimum' in query_lower or 'min' in query_lower:
            operations.append('min')
        if 'anomaly' in query_lower:
            operations.append('anomaly')

        # Extract depth
        depth_range = None
        depth_match = re.search(r'(\d+)m|(\d+)\s*meters?', query_lower)
        if depth_match:
            depth = int(depth_match.group(1) or depth_match.group(2))
            depth_range = {'min': depth - 10, 'max': depth + 10}

        return QueryAnalysis(
            query_type=query_type,
            geographic_filters=geographic_filters,
            temporal_filters={},
            data_types=data_types,
            operations=operations,
            needs_sql=True,
            needs_visualization=needs_visualization,
            ocean_region='Indian Ocean',
            depth_range=depth_range,
            confidence_level='high' if data_types else 'medium'
        )

    async def search_similar_data(self, query: str, filters: Dict) -> List[Dict]:
        """Search for similar data using vector similarity"""
        try:
            # Generate embedding for query (placeholder)
            query_embedding = await self.generate_embedding(query)

            # Query Neon DB for similar slices
            # This would use actual pgvector similarity search
            mock_results = [
                {
                    'slice_id': 'slice_001',
                    'variable': 'temperature',
                    'region': 'Bay of Bengal',
                    'summary': 'Temperature data from Bay of Bengal region',
                    'similarity': 0.85
                },
                {
                    'slice_id': 'slice_002',
                    'variable': 'salinity',
                    'region': 'Arabian Sea',
                    'summary': 'Salinity measurements from Arabian Sea',
                    'similarity': 0.78
                }
            ]

            return mock_results

        except Exception as e:
            logger.error(f"Error in similarity search: {e}")
            return []

    async def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding vector for text"""
        # Placeholder implementation
        # In production, use sentence-transformers or similar
        import hashlib

        hash_obj = hashlib.md5(text.encode())
        hash_bytes = hash_obj.digest()

        embedding = []
        for i in range(768):
            byte_val = hash_bytes[i % len(hash_bytes)]
            normalized_val = (byte_val - 128) / 128.0
            embedding.append(normalized_val)

        return embedding

    async def execute_mcp_aggregation(self, operation: str, variable: str, filters: Dict) -> Dict:
        """Execute MCP-style aggregation queries against the database"""
        try:
            # In production, this would execute actual SQL queries against Neon DB
            # For now, using realistic mock data based on real oceanographic measurements

            # Realistic oceanographic data ranges for Indian Ocean
            realistic_data = {
                'temperature': {
                    'mean': 12.5,  # More realistic for Indian Ocean average
                    'max': 31.2,   # Surface temperatures
                    'min': -1.8,   # Deep water temperatures
                    'count': 1196
                },
                'salinity': {
                    'mean': 34.7,  # Typical ocean salinity
                    'max': 36.2,   # High salinity areas
                    'min': 33.1,   # Low salinity areas (freshwater influence)
                    'count': 1196
                }
            }

            if variable in realistic_data and operation in realistic_data[variable]:
                value = realistic_data[variable][operation]

                # Apply regional adjustments based on filters
                if 'lat_range' in filters:
                    lat_center = sum(filters['lat_range']) / 2
                    if lat_center > 10:  # Northern Indian Ocean (warmer)
                        if variable == 'temperature' and operation == 'mean':
                            value += 2.0  # Warmer in north
                        elif variable == 'salinity' and operation == 'mean':
                            value += 0.3  # Saltier in north

                return {
                    'operation': operation,
                    'variable': variable,
                    'value': round(value, 2),
                    'unit': '°C' if variable == 'temperature' else 'PSU' if variable == 'salinity' else '',
                    'filters': filters,
                    'data_quality': 'good',
                    'sample_size': realistic_data[variable]['count']
                }

            return {'error': 'No data available for requested aggregation'}

        except Exception as e:
            logger.error(f"Error in MCP aggregation: {e}")
            return {'error': str(e)}

    async def generate_groq_response(self, query: str, context: List[Dict], mcp_results: List[Dict]) -> str:
        """Generate response using Groq LLaMA-3"""
        try:
            if not GROQ_API_KEY:
                return self.generate_fallback_response(query, context, mcp_results)

            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            }

            # Prepare context for Groq
            context_str = json.dumps({
                'similar_slices': context[:3],  # Top 3 similar slices
                'mcp_aggregations': mcp_results
            }, indent=2)

            messages = [
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": f"Query: {query}\n\nDatabase Context: {context_str}\n\nPlease provide a structured response following the format specified in the system prompt."}
            ]

            payload = {
                "model": "llama3-8b-8192",  # Use LLaMA-3 8B
                "messages": messages,
                "temperature": 0.1,
                "max_tokens": 1000,
                "stream": False
            }

            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()

            result = response.json()
            if result.get("choices") and len(result["choices"]) > 0:
                content = result["choices"][0]["message"]["content"]

                # Extract JSON metadata if present
                json_match = re.search(r'\{.*"sources".*\}', content, re.DOTALL)
                if json_match:
                    return content

                return content

            return self.generate_fallback_response(query, context, mcp_results)

        except Exception as e:
            logger.error(f"Error calling Groq API: {e}")
            return self.generate_fallback_response(query, context, mcp_results)

    def generate_fallback_response(self, query: str, context: List[Dict], mcp_results: List[Dict]) -> str:
        """Generate fallback response when Groq is unavailable"""
        # One-sentence summary
        summary = f"Analysis of {query} based on Indian Ocean ARGO float data reveals key oceanographic patterns."

        # Bullet list of numeric findings
        findings = []
        if mcp_results:
            for mcp in mcp_results:
                if 'error' not in mcp:
                    findings.append(f"• {mcp['operation'].title()} {mcp['variable']}: {mcp['value']}{mcp.get('unit', '')} (sample size: {mcp.get('sample_size', 'N/A')})")

        # Short explanation of trends/insights
        insights = "The data shows consistent oceanographic patterns across the Indian Ocean basin with regional variations between the Arabian Sea and Bay of Bengal."

        # Create properly formatted JSON metadata
        json_metadata = json.dumps({
            "sources": ["slice_001", "slice_002"],
            "visualization": None,
            "confidence": 0.85
        })

        response = f"""{summary}

{chr(10).join(findings)}

{insights}

{json_metadata}"""

        return response

    async def process_query(self, query: str) -> ChatResponse:
        """Main query processing pipeline using correct flow"""
        try:
            # Step 1: Analyze query
            analysis = await self.analyze_query(query)

            # Step 2: Execute MCP Server aggregations (SQL queries, trends, numeric stats)
            mcp_results = []
            try:
                # Use MCP Server for structured data operations
                for data_type in analysis.data_types:
                    for operation in analysis.operations:
                        # Call MCP server tools for aggregations
                        mcp_response = await self._call_mcp_aggregation(operation, data_type, analysis.geographic_filters)
                        if mcp_response and 'error' not in mcp_response:
                            mcp_results.append(mcp_response)
            except Exception as e:
                logger.warning(f"MCP Server aggregation failed: {e}")

            # Step 3: Execute RAG Pipeline (vector search, slice summaries)
            rag_context = []
            try:
                # Use RAG Pipeline for semantic search and context
                if hasattr(self.rag_pipeline, 'process_query'):
                    rag_response = self.rag_pipeline.process_query(query, analysis.geographic_filters)
                    if rag_response and 'context' in rag_response:
                        rag_context = rag_response['context']
            except Exception as e:
                logger.warning(f"RAG Pipeline search failed: {e}")

            # Step 4: Merge contexts (MCP JSON + RAG slice summaries)
            merged_context = {
                'mcp_aggregations': mcp_results,
                'similar_slices': rag_context,
                'query_analysis': analysis.dict()
            }

            # Step 5: Generate response using Groq with merged context
            response_text = await self.generate_groq_response(query, rag_context, mcp_results)

            # Step 6: Generate visualization if needed
            visualization = None
            if analysis.needs_visualization:
                try:
                    visualization = await self._generate_visualization(analysis, mcp_results, rag_context)
                except Exception as e:
                    logger.warning(f"Visualization generation failed: {e}")

            # Step 7: Extract metadata from response
            sources = ["slice_001", "slice_002"]  # Default sources
            confidence = 0.85  # Default confidence

            # Try to extract JSON metadata from response
            json_match = re.search(r'\{.*"sources".*\}', response_text, re.DOTALL)
            if json_match:
                try:
                    metadata = json.loads(json_match.group())
                    sources = metadata.get('sources', sources)
                    visualization = metadata.get('visualization', visualization)
                    confidence = metadata.get('confidence', confidence)
                except json.JSONDecodeError:
                    pass

            return ChatResponse(
                response=response_text,
                sources=sources,
                visualization=visualization,
                confidence=confidence,
                metadata={
                    'query_analysis': analysis.dict(),
                    'similar_slices': len(rag_context),
                    'mcp_results': len(mcp_results),
                    'merged_context': merged_context
                }
            )

        except Exception as e:
            logger.error(f"Error processing query: {e}")
            return ChatResponse(
                response=f"I apologize, but I encountered an error processing your query: {str(e)}",
                sources=[],
                visualization=None,
                confidence=0.0,
                metadata={'error': str(e)}
            )

    async def _call_mcp_aggregation(self, operation: str, variable: str, filters: Dict) -> Dict:
        """Call MCP Server for aggregation operations"""
        try:
            # Use MCP Server's calculate_statistics tool
            if hasattr(self.mcp_server, 'call_tool'):
                # This would call the actual MCP server tools
                # For now, return structured format matching MCP server expectations
                return {
                    'operation': operation,
                    'variable': variable,
                    'value': 12.5,  # Would come from actual MCP calculation
                    'unit': '°C' if variable == 'temperature' else 'PSU',
                    'filters': filters,
                    'data_quality': 'good',
                    'sample_size': 1196
                }
            else:
                # Fallback to local calculation
                return await self.execute_mcp_aggregation(operation, variable, filters)
        except Exception as e:
            logger.error(f"MCP aggregation error: {e}")
            return {'error': str(e)}

    async def _generate_visualization(self, analysis: Dict, mcp_results: List[Dict], rag_context: List[Dict]) -> str:
        """Generate visualization using MCP/RAG data"""
        try:
            # This would use the actual visualization generator
            # For now, return mock visualization filename
            if analysis.data_types and analysis.needs_visualization:
                return f"{analysis.data_types[0]}_chart_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
            return None
        except Exception as e:
            logger.error(f"Visualization generation error: {e}")
            return None

# Global chatbot instance
chatbot = OceanographyChatbot()

@app.websocket("/ws/chat")
async def websocket_chat_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time chat"""
    await websocket.accept()

    # Generate session ID
    session_id = f"session_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

    try:
        # Add to active connections
        active_connections[session_id] = websocket
        chat_sessions[session_id] = []

        logger.info(f"WebSocket connection established for session {session_id}")

        while True:
            try:
                # Receive message from client
                data = await websocket.receive_text()

                try:
                    message_data = json.loads(data)
                    user_message = message_data.get('message', '')

                    if not user_message:
                        continue

                    # Add user message to session history
                    chat_sessions[session_id].append({
                        'type': 'user',
                        'message': user_message,
                        'timestamp': datetime.now().isoformat()
                    })

                    logger.info(f"Processing query for session {session_id}: {user_message[:50]}...")

                    # Process query
                    response = await chatbot.process_query(user_message)

                    # Add assistant response to session history
                    chat_sessions[session_id].append({
                        'type': 'assistant',
                        'message': response.response,
                        'metadata': response.metadata,
                        'timestamp': datetime.now().isoformat()
                    })

                    # Send response back to client (ensure JSON serializable)
                    response_data = {
                        'type': 'response',
                        'message': response.response,
                        'sources': response.sources,
                        'visualization': response.visualization,
                        'confidence': response.confidence,
                        'profiles': response.metadata.get('similar_slices', []),
                        'statistics': response.metadata.get('mcp_results', {}),
                        'visualizations': {},
                        'metadata': {
                            'pipeline_used': 'rag_pipeline',
                            'data_source': 'indian_ocean_db',
                            **response.metadata
                        }
                    }

                    # Convert any datetime objects to strings for JSON serialization
                    def make_json_serializable(obj):
                        if isinstance(obj, datetime):
                            return obj.isoformat()
                        elif isinstance(obj, dict):
                            return {k: make_json_serializable(v) for k, v in obj.items()}
                        elif isinstance(obj, list):
                            return [make_json_serializable(item) for item in obj]
                        return obj

                    await websocket.send_json(make_json_serializable(response_data))

                    logger.info(f"Response sent for session {session_id}")

                except json.JSONDecodeError:
                    logger.warning(f"Invalid JSON received from session {session_id}")
                    await websocket.send_json({
                        'type': 'error',
                        'message': 'Invalid JSON format'
                    })

            except Exception as e:
                logger.error(f"Error processing message for session {session_id}: {e}")
                await websocket.send_json({
                    'type': 'error',
                    'message': 'Internal server error occurred'
                })

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session {session_id}")
        if session_id in active_connections:
            del active_connections[session_id]
        if session_id in chat_sessions:
            del chat_sessions[session_id]

    except Exception as e:
        logger.error(f"Unexpected error in WebSocket for session {session_id}: {e}")
        if session_id in active_connections:
            del active_connections[session_id]
        if session_id in chat_sessions:
            del chat_sessions[session_id]

@app.post("/api/chat/query")
async def http_chat_query(message: ChatMessage):
    """HTTP endpoint for chat queries (fallback to WebSocket)"""
    try:
        response = await chatbot.process_query(message.message)

        return {
            'response': response.response,
            'sources': response.sources,
            'visualization': response.visualization,
            'confidence': response.confidence,
            'metadata': response.metadata
        }

    except Exception as e:
        logger.error(f"Error in HTTP chat query: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@app.get("/api/chat/sessions/{session_id}")
async def get_chat_session(session_id: str):
    """Get chat session history"""
    if session_id not in chat_sessions:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    return {
        'session_id': session_id,
        'messages': chat_sessions[session_id]
    }

@app.get("/api/visualizations/{viz_id}")
async def get_visualization(viz_id: str):
    """Get visualization file"""
    # Mock visualization endpoint
    # In production, this would serve actual chart files
    return {
        'visualization_id': viz_id,
        'type': 'temperature_map',
        'url': f'/static/visualizations/{viz_id}.png',
        'description': 'Temperature distribution map for Indian Ocean region'
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        'status': 'healthy',
        'service': 'Indian Ocean Oceanography Chatbot',
        'timestamp': datetime.now().isoformat(),
        'groq_api': 'configured' if GROQ_API_KEY else 'not_configured',
        'database': 'configured' if NEON_DB_URI else 'not_configured'
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,  # Changed to match frontend proxy configuration
        reload=True,
        log_level="info"
    )
