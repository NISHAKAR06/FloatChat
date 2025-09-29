
import os
import json
import re
import requests
from datetime import datetime
from typing import Dict, List, Optional, Any
from src.vector_store import VectorStore
from src.database import DatabaseManager
from src.enhanced_argo_processor import EnhancedArgoProcessor
from src.visualizations import ArgoVisualizer
from src.config import Config
import logging

logger = logging.getLogger(__name__)

class RAGPipeline:
    """Enhanced Retrieval-Augmented Generation pipeline for ARGO data queries using ONLY Ollama LLaMA model"""

    def __init__(self, config: Config, vector_store: Optional[VectorStore] = None,
                 db_manager: Optional[DatabaseManager] = None):
        self.config = config
        # Ollama endpoint for local LLaMA model
        self.ollama_url = config.ollama_url
        self.db_manager = db_manager or DatabaseManager(config.database_uri)
        self.vector_store = vector_store or VectorStore(config.database_uri,
                                                       config.ollama_embedding_model,
                                                       config.ollama_url)
        self.processor = EnhancedArgoProcessor(config, self.db_manager)
        self.visualizer = ArgoVisualizer()

        # Enhanced model configuration
        self.model_name = "llama3.2:3b"  # Local Ollama LLaMA model
        self.embedding_model = config.ollama_embedding_model

        logger.info("Enhanced RAG Pipeline initialized with Ollama LLaMA + 768-dim embeddings using real cloud data")

    def _ollama_generate(self, prompt: str, temperature: float = 0.1, max_tokens: int = 500) -> str:
        """Generate text using local Ollama LLaMA model"""
        try:
            url = f"{self.ollama_url}/api/generate"
            payload = {
                "model": self.model_name,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens,
                    "top_k": 40,
                    "top_p": 0.9
                }
            }

            response = requests.post(url, json=payload, timeout=60)  # Increased timeout
            response.raise_for_status()

            result = response.json()
            return result.get("response", "").strip()

        except Exception as e:
            logger.error(f"Ollama generation error: {e}")
            return f"Error: {str(e)}"

    def process_query(self, user_query: str, filters: Optional[Dict] = None) -> Dict:
        """Process natural language query using RAG pipeline"""
        try:
            # Step 1: Extract intent and parameters from query
            query_analysis = self._analyze_query(user_query)
            
            # Step 2: Retrieve relevant context from vector store
            context = self._retrieve_context(user_query, filters, query_analysis)
            
            # Step 3: Generate SQL query if needed
            sql_query = None
            if query_analysis.get('needs_sql', False):
                sql_query = self._generate_sql_query(user_query, query_analysis, context)
            
            # Step 4: Execute query and get data
            data_results = self._execute_data_query(sql_query, context)
            
            # Step 5: Generate final answer
            answer = self._generate_answer(user_query, context, data_results, query_analysis)
            
            return {
                'answer': answer,
                'sql_query': sql_query,
                'data': data_results,
                'context': context,
                'query_analysis': query_analysis
            }
            
        except Exception as e:
            logger.error(f"Error in RAG pipeline: {e}")
            return {
                'answer': f"I apologize, but I encountered an error processing your query: {str(e)}",
                'error': str(e)
            }
    
    def _analyze_query(self, query: str) -> Dict:
        """Analyze user query to extract intent and parameters"""
        analysis_prompt = f"""
        Analyze this ARGO oceanographic data query and extract key information:
        
        Query: "{query}"
        
        Please identify:
        1. Query type (search, comparison, statistics, visualization, specific_data)
        2. Geographic constraints (latitude/longitude ranges)
        3. Temporal constraints (date ranges)
        4. Data types requested (temperature, salinity, pressure, trajectories)
        5. Statistical operations needed (mean, max, min, trends)
        6. Whether SQL query generation is needed
        7. Visualization requirements
        
        Respond in JSON format:
        {{
            "query_type": "search|comparison|statistics|visualization|specific_data",
            "geographic_filters": {{"lat_range": [min, max], "lon_range": [min, max]}},
            "temporal_filters": {{"start_date": "YYYY-MM-DD", "end_date": "YYYY-MM-DD"}},
            "data_types": ["temperature", "salinity", "pressure", "trajectories"],
            "operations": ["mean", "max", "min", "count", "trend"],
            "needs_sql": true/false,
            "needs_visualization": true/false,
            "specific_constraints": ["any other specific requirements"]
        }}
        """
        
        try:
            analysis_text = self._ollama_generate(
                analysis_prompt,
                temperature=0.1,
                max_tokens=500
            )
            
            # Extract JSON from response (in case there's extra text)
            json_match = re.search(r'\{.*\}', analysis_text, re.DOTALL)
            if json_match:
                analysis = json.loads(json_match.group())
            else:
                # Fallback analysis
                analysis = self._fallback_query_analysis(query)
            
            return analysis
            
        except Exception as e:
            logger.error(f"Error analyzing query: {e}")
            return self._fallback_query_analysis(query)
    
    def _fallback_query_analysis(self, query: str) -> Dict:
        """Simple fallback query analysis"""
        query_lower = query.lower()
        
        # Basic keyword detection
        needs_sql = any(word in query_lower for word in ['show', 'find', 'get', 'count', 'average'])
        needs_viz = any(word in query_lower for word in ['plot', 'chart', 'map', 'visualize', 'graph'])
        
        data_types = []
        if 'temperature' in query_lower or 'temp' in query_lower:
            data_types.append('temperature')
        if 'salinity' in query_lower or 'salt' in query_lower:
            data_types.append('salinity')
        if 'pressure' in query_lower or 'depth' in query_lower:
            data_types.append('pressure')
        if 'trajectory' in query_lower or 'path' in query_lower:
            data_types.append('trajectories')
        
        return {
            'query_type': 'search',
            'geographic_filters': {},
            'temporal_filters': {},
            'data_types': data_types,
            'operations': [],
            'needs_sql': needs_sql,
            'needs_visualization': needs_viz,
            'specific_constraints': []
        }
    
    def _retrieve_context(self, query: str, filters: Optional[Dict], 
                         analysis: Dict) -> List[Dict]:
        """Retrieve relevant context from vector store"""
        try:
            # Combine user filters with analysis filters
            combined_filters = filters or {}
            
            if analysis.get('geographic_filters'):
                geo_filters = analysis['geographic_filters']
                if 'lat_range' in geo_filters:
                    combined_filters['lat_range'] = geo_filters['lat_range']
                if 'lon_range' in geo_filters:
                    combined_filters['lon_range'] = geo_filters['lon_range']
            
            if analysis.get('temporal_filters'):
                temp_filters = analysis['temporal_filters']
                if 'start_date' in temp_filters and 'end_date' in temp_filters:
                    combined_filters['date_range'] = [
                        temp_filters['start_date'], 
                        temp_filters['end_date']
                    ]
            
            # Perform similarity search
            context = self.vector_store.similarity_search(
                query, 
                limit=10, 
                filters=combined_filters
            )
            
            return context
            
        except Exception as e:
            logger.error(f"Error retrieving context: {e}")
            return []
    
    def _generate_sql_query(self, user_query: str, analysis: Dict, 
                           context: List[Dict]) -> str:
        """Generate SQL query for data retrieval"""
        try:
            # Build context information
            context_info = self._build_context_info(context)
            
            sql_prompt = f"""
            You are an expert in ARGO oceanographic data and SQL. Generate a SQL query to answer this question:

            User Query: "{user_query}"

            Query Analysis: {json.dumps(analysis, indent=2)}

            Database Schema:
            - Table: argo_measurements
            - Columns: id, filename, latitude, longitude, time, depth, temperature, salinity,
                      embedding (vector), summary, region, data_quality, processing_date

            The table contains individual measurement points from ARGO floats.

            Available Context: {context_info}

            Generate a PostgreSQL query that:
            1. Filters data based on geographic (latitude/longitude) and temporal (time) constraints
            2. Groups measurements by filename to get float-level data if needed
            3. Returns relevant columns (latitude, longitude, depth, temperature, salinity, time)
            4. Uses appropriate aggregations (AVG, MIN, MAX) if statistical analysis is requested
            5. Limits results appropriately to avoid large datasets

            Return only the SQL query, no explanation:
            """
            
            sql_query = self._ollama_generate(
                sql_prompt,
                temperature=0.1,
                max_tokens=500
            )
            
            # Clean up the SQL query
            sql_query = re.sub(r'^```sql\s*', '', sql_query)
            sql_query = re.sub(r'\s*```$', '', sql_query)
            
            return sql_query
            
        except Exception as e:
            logger.error(f"Error generating SQL query: {e}")
            return ""
    
    def _execute_data_query(self, sql_query: Optional[str],
                           context: List[Dict]) -> Optional[Any]:
        """Execute data query and return results"""
        try:
            if sql_query:
                # Execute SQL query using raw database connection
                return self.db_manager.execute_sql_query(sql_query)
            else:
                # Return context data if no SQL query
                return context

        except Exception as e:
            logger.error(f"Error executing data query: {e}")
            return context  # Fallback to context
    
    def _generate_answer(self, user_query: str, context: List[Dict], 
                        data_results: Any, analysis: Dict) -> str:
        """Generate final answer using retrieved context and data"""
        try:
            # Prepare context summary
            context_summary = self._summarize_context(context)
            data_summary = self._summarize_data_results(data_results)
            
            answer_prompt = f"""
            You are an expert oceanographer analyzing ARGO float data. Answer this question based on the provided context and data:
            
            User Question: "{user_query}"
            
            Query Analysis: {json.dumps(analysis, indent=2)}
            
            Retrieved Context:
            {context_summary}
            
            Data Results:
            {data_summary}
            
            Please provide a clear, informative answer that:
            1. Directly addresses the user's question
            2. Uses the retrieved data and context
            3. Includes relevant statistics or findings
            4. Mentions data quality and limitations if relevant
            5. Suggests follow-up analyses if appropriate
            
            Keep the answer concise but comprehensive, suitable for both scientists and general users.
            """
            
            return self._ollama_generate(
                answer_prompt,
                temperature=0.3,
                max_tokens=1000
            )
            
        except Exception as e:
            logger.error(f"Error generating answer: {e}")
            return "I apologize, but I encountered an error generating the response. Please try rephrasing your question."
    
    def _build_context_info(self, context: List[Dict]) -> str:
        """Build context information string"""
        if not context:
            return "No relevant profiles found."
        
        info_parts = [f"Found {len(context)} relevant profiles:"]
        
        for i, profile in enumerate(context[:5]):  # Show first 5
            info_parts.append(
                f"- Profile {i+1}: Float {profile.get('float_id', 'N/A')}, "
                f"Cycle {profile.get('cycle_number', 'N/A')}, "
                f"Date: {profile.get('profile_date', 'N/A')}, "
                f"Location: ({profile.get('latitude', 'N/A'):.2f}, {profile.get('longitude', 'N/A'):.2f})"
            )
        
        if len(context) > 5:
            info_parts.append(f"... and {len(context) - 5} more profiles")
        
        return "\n".join(info_parts)
    
    def _summarize_context(self, context: List[Dict]) -> str:
        """Summarize context for answer generation"""
        if not context:
            return "No relevant data found."
        
        summaries = []
        for profile in context[:3]:  # Use top 3 profiles
            if profile.get('summary'):
                summaries.append(profile['summary'])
        
        return "\n".join(summaries)
    
    def _summarize_data_results(self, data_results: Any) -> str:
        """Summarize data results for answer generation"""
        if not data_results:
            return "No data results available."

        if isinstance(data_results, list):
            if len(data_results) == 0:
                return "Query returned no results."
            else:
                return f"Query returned {len(data_results)} records."

        return "Data results available for analysis."

    def process_query_with_visualization(self, user_query: str, filters: Optional[Dict] = None) -> Dict:
        """Process query and generate visualizations if requested"""
        try:
            # Get base response
            base_response = self.process_query(user_query, filters)

            # Check if visualization is needed
            analysis = base_response.get('query_analysis', {})
            if not analysis.get('needs_visualization', False):
                return base_response

            # Generate visualizations based on query type and available data
            visualizations = self._generate_visualizations(
                base_response.get('context', []),
                analysis
            )

            # Add visualizations to response
            base_response['visualizations'] = visualizations

            return base_response

        except Exception as e:
            logger.error(f"Error in visualization pipeline: {e}")
            return {
                'answer': f"Error generating visualizations: {str(e)}",
                'error': str(e)
            }

    def _generate_visualizations(self, context: List[Dict], analysis: Dict) -> Dict[str, str]:
        """Generate visualizations based on context and analysis"""
        visualizations = {}

        try:
            # Temperature profile visualization
            if 'temperature' in analysis.get('data_types', []):
                temp_plot = self.visualizer.create_temperature_profile_plot(context)
                if temp_plot:
                    visualizations['temperature_profile'] = temp_plot

            # Salinity profile visualization
            if 'salinity' in analysis.get('data_types', []):
                sal_plot = self.visualizer.create_salinity_profile_plot(context)
                if sal_plot:
                    visualizations['salinity_profile'] = sal_plot

            # T-S diagram
            if 'temperature' in analysis.get('data_types', []) and 'salinity' in analysis.get('data_types', []):
                ts_plot = self.visualizer.create_ts_diagram(context)
                if ts_plot:
                    visualizations['ts_diagram'] = ts_plot

            # Geographic map
            if analysis.get('query_type') == 'search' or 'geographic' in str(analysis).lower():
                map_plot = self.visualizer.create_map_view(context)
                if map_plot:
                    visualizations['geographic_map'] = map_plot

            # Time series if temporal data available
            if analysis.get('temporal_filters') or 'time' in str(analysis).lower():
                ts_plot = self.visualizer.create_time_series_plot(context)
                if ts_plot:
                    visualizations['time_series'] = ts_plot

            # Comprehensive dashboard for complex queries
            if len(visualizations) >= 2:
                dashboard = self.visualizer.create_comprehensive_dashboard(context)
                if dashboard:
                    visualizations['dashboard'] = dashboard

        except Exception as e:
            logger.error(f"Error generating visualizations: {e}")

        return visualizations

    def generate_structured_response(self, user_query: str, filters: Optional[Dict] = None) -> Dict:
        """Generate structured JSON response for AI assistants"""
        try:
            # Process the query
            response = self.process_query_with_visualization(user_query, filters)

            # Structure the response
            structured_response = {
                'query': user_query,
                'timestamp': datetime.now().isoformat(),
                'response_type': 'argo_data_analysis',
                'answer': response.get('answer', ''),
                'data_summary': {
                    'context_profiles': len(response.get('context', [])),
                    'sql_executed': response.get('sql_query') is not None,
                    'visualizations_generated': len(response.get('visualizations', {}))
                },
                'analysis': response.get('query_analysis', {}),
                'data': {
                    'profiles': response.get('context', []),
                    'statistics': self._extract_statistics(response.get('context', []))
                },
                'visualizations': response.get('visualizations', {}),
                'metadata': {
                    'model_used': self.model_name,
                    'embedding_model': self.embedding_model,
                    'vector_dimension': 768,
                    'database_records': self.db_manager.get_database_stats()
                }
            }

            return structured_response

        except Exception as e:
            logger.error(f"Error generating structured response: {e}")
            return {
                'query': user_query,
                'timestamp': datetime.now().isoformat(),
                'response_type': 'error',
                'error': str(e),
                'answer': f"I apologize, but I encountered an error: {str(e)}"
            }

    def _extract_statistics(self, profiles: List[Dict]) -> Dict:
        """Extract statistical information from profiles"""
        if not profiles:
            return {}

        stats = {
            'total_profiles': len(profiles),
            'floats': list(set(p.get('float_id', 'N/A') for p in profiles)),
            'geographic_coverage': {},
            'temporal_coverage': {},
            'data_quality': {}
        }

        # Geographic statistics
        latitudes = [p.get('latitude') for p in profiles if p.get('latitude') is not None]
        longitudes = [p.get('longitude') for p in profiles if p.get('longitude') is not None]

        if latitudes:
            stats['geographic_coverage'] = {
                'lat_range': [min(latitudes), max(latitudes)],
                'lon_range': [min(longitudes), max(longitudes)],
                'center_point': [sum(latitudes)/len(latitudes), sum(longitudes)/len(longitudes)]
            }

        # Data availability
        temp_available = sum(1 for p in profiles if p.get('temperature_data'))
        sal_available = sum(1 for p in profiles if p.get('salinity_data'))
        pres_available = sum(1 for p in profiles if p.get('pressure_data'))

        stats['data_quality'] = {
            'temperature_profiles': temp_available,
            'salinity_profiles': sal_available,
            'pressure_profiles': pres_available,
            'complete_profiles': sum(1 for p in profiles
                                   if all(k in p for k in ['temperature_data', 'salinity_data', 'pressure_data']))
        }

        return stats

    def batch_process_queries(self, queries: List[str], filters: Optional[Dict] = None) -> List[Dict]:
        """Process multiple queries in batch"""
        results = []

        for query in queries:
            try:
                result = self.generate_structured_response(query, filters)
                results.append(result)
            except Exception as e:
                logger.error(f"Error processing query '{query}': {e}")
                results.append({
                    'query': query,
                    'error': str(e),
                    'response_type': 'error'
                })

        return results

    def get_system_status(self) -> Dict:
        """Get system status and capabilities"""
        try:
            db_stats = self.db_manager.get_database_stats()

            return {
                'system_status': 'operational',
                'components': {
                    'database': 'connected' if db_stats else 'disconnected',
                    'vector_store': 'operational',
                    'llm_model': self.model_name,
                    'embedding_model': self.embedding_model
                },
                'capabilities': [
                    'natural_language_queries',
                    'vector_similarity_search',
                    '768_dimensional_embeddings',
                    'interactive_visualizations',
                    'structured_json_responses',
                    'real_time_data_analysis'
                ],
                'database_stats': db_stats,
                'model_info': {
                    'llm': f'{self.model_name} via Ollama',
                    'embedding': f'{self.embedding_model} (768-dim)',
                    'vector_db': 'PostgreSQL with pgvector'
                }
            }

        except Exception as e:
            logger.error(f"Error getting system status: {e}")
            return {
                'system_status': 'error',
                'error': str(e)
            }

def create_rag_pipeline(config_path: Optional[str] = None) -> RAGPipeline:
    """Create RAG pipeline with configuration"""
    # Use fallback configuration for robust operation
    from src.fallback_config import create_fallback_config
    config = create_fallback_config()

    # Override with environment variables if available
    if os.getenv("GROQ_API"):
        config.groq_api_key = os.getenv("GROQ_API")
    if os.getenv("OLLAMA_URL"):
        config.ollama_url = os.getenv("OLLAMA_URL")
    if os.getenv("OLLAMA_EMBEDDING_MODEL"):
        config.ollama_embedding_model = os.getenv("OLLAMA_EMBEDDING_MODEL")

    # Use cloud database URI if available (FORCE cloud usage)
    if os.getenv("DATABASE_URI"):
        config.database_uri = os.getenv("DATABASE_URI")
        print(f"🌥️ Using cloud database: {config.database_uri[:50]}...")

    return RAGPipeline(config)
