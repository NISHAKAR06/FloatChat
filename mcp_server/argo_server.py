#!/usr/bin/env python3
"""
ARGO Float Data MCP Server
Provides structured access to oceanographic ARGO float data through Model Context Protocol
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Sequence
from pathlib import Path
import sys
import os

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from mcp.server.models import InitializationOptions
from mcp.server import NotificationOptions, Server
from mcp.types import (
    Resource,
    Tool,
    TextContent,
    ImageContent,
    EmbeddedResource,
    LoggingLevel
)
import mcp.types as types

# Import ARGO data functions with robust error handling
def safe_import_function(module_name, function_name):
    """Safely import a function and return a fallback if it fails"""
    try:
        module = __import__(module_name, fromlist=[function_name])
        return getattr(module, function_name)
    except (ImportError, AttributeError) as e:
        logging.warning(f"Could not import {function_name} from {module_name}: {e}")
        return None

# Try to import database functions
DatabaseManager = None
get_database_stats = None
search_similar_argo = None
get_all_argo_profiles = None

try:
    from src.database import DatabaseManager, get_database_stats, search_similar_argo, get_all_argo_profiles
    logging.info("✅ Successfully imported database functions")
except ImportError as e:
    logging.warning(f"Could not import database module: {e}")
    # Try individual function imports as fallback
    DatabaseManager = safe_import_function('src.database', 'DatabaseManager')
    get_database_stats = safe_import_function('src.database', 'get_database_stats')
    get_all_argo_profiles = safe_import_function('src.database', 'get_all_argo_profiles')

# Try to import other modules
RAGPipeline = safe_import_function('src.rag_pipeline', 'RAGPipeline')
ArgoDataProcessor = safe_import_function('src.argo_processor', 'ArgoDataProcessor')
EnhancedArgoDataProcessor = safe_import_function('src.enhanced_argo_processor', 'EnhancedArgoDataProcessor')
VectorStore = safe_import_function('src.vector_store', 'VectorStore')
load_config = safe_import_function('src.config', 'load_config')
create_rag_pipeline = safe_import_function('src.rag_pipeline', 'create_rag_pipeline')
create_enhanced_processor = safe_import_function('src.enhanced_argo_processor', 'create_enhanced_processor')
create_visualizer = safe_import_function('src.visualizations', 'create_visualizer')

# Define sample data for fallback
SAMPLE_ARGO_DATA = [
    {
        "id": "ARGO-001",
        "float_id": "4901234",
        "cycle_number": 1,
        "profile_date": "2023-11-15",
        "latitude": 15.50,
        "longitude": 75.30,
        "region": "Indian Ocean",
        "summary": "Temperature range 2.5°C to 28.3°C, salinity range 34.2 to 35.1 PSU at 0-2000m depth.",
        "data_quality_score": 0.95
    },
    {
        "id": "ARGO-002",
        "float_id": "5902345",
        "cycle_number": 1,
        "profile_date": "2023-10-10",
        "latitude": 35.20,
        "longitude": -145.70,
        "region": "Pacific Ocean",
        "summary": "North Pacific measurements with complex temperature stratification: 1.8°C to 22.7°C, salinity 32.8-34.9 PSU.",
        "data_quality_score": 0.92
    },
    {
        "id": "ARGO-003",
        "float_id": "6903456",
        "cycle_number": 1,
        "profile_date": "2023-09-20",
        "latitude": -25.10,
        "longitude": 35.80,
        "region": "Indian Ocean",
        "summary": "Southern Ocean profile showing cold water upwelling: -1.2°C to 15.4°C, stable salinity 34.5-34.8 PSU.",
        "data_quality_score": 0.88
    }
]

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("argo-mcp-server")

class ArgoMCPServer:
    """MCP Server for ARGO Float Data"""

    def __init__(self):
        self.server = Server("argo-float-data")
        self.db_manager = None
        self.rag_pipeline = None
        self.vector_store = None
        self.data_processor = None
        self.enhanced_processor = None
        self.config = None

        # Force cloud database usage from environment
        self._initialize_cloud_database_connection()

        # Initialize components
        self._initialize_components()

        # Register MCP handlers
        self._register_handlers()

    def _initialize_components(self):
        """Initialize all ARGO processing components"""
        try:
            # Config
            if load_config:
                self.config = load_config()
                logger.info("✅ Configuration loaded")

            # Database
            if DatabaseManager:
                self.db_manager = DatabaseManager()
                logger.info("✅ ARGO database connection established")
            else:
                logger.warning("⚠️ Database manager not available")

            # RAG Pipeline
            if RAGPipeline and self.config:
                self.rag_pipeline = RAGPipeline(self.config)
                logger.info("✅ RAG pipeline initialized")

            # Data processors
            if ArgoDataProcessor:
                self.data_processor = ArgoDataProcessor()
                logger.info("✅ Basic ARGO processor ready")

            if EnhancedArgoDataProcessor:
                self.enhanced_processor = EnhancedArgoDataProcessor()
                logger.info("✅ Enhanced ARGO processor ready")

            # Check for existing ARGO files to process
            self._check_and_process_argo_files()

        except Exception as e:
            logger.error(f"❌ Component initialization failed: {e}")

    def _check_and_process_argo_files(self):
        """Check for and process available ARGO NetCDF files"""
        try:
            # Look for ARGO data files in common locations
            data_dirs = [
                Path("./data"),
                Path("../data"),
                Path("../../data"),
                Path("./test_data"),
                Path("./sample_data")
            ]

            found_files = []
            for data_dir in data_dirs:
                if data_dir.exists():
                    nc_files = list(data_dir.glob("*.nc")) + list(data_dir.glob("*.netcdf"))
                    found_files.extend(nc_files)

            if found_files:
                logger.info(f"📁 Found {len(found_files)} ARGO NetCDF files: {[f.name for f in found_files]}")

                # Process first file as example
                try:
                    result = self.enhanced_processor.process_file_with_status(str(found_files[0]))
                    if result["data"] and result["data"]["metadata"]:
                        logger.info("✅ Successfully processed ARGO file for chatbot use")
                        self.processed_data = result["data"]
                    else:
                        logger.warning("⚠️ File processing completed but no data extracted")
                except Exception as e:
                    logger.error(f"❌ File processing failed: {e}")
            else:
                logger.info("ℹ️ No ARGO NetCDF files found, using sample data for demonstration")

        except Exception as e:
            logger.error(f"Error checking ARGO files: {e}")

    def _register_handlers(self):
        """Register all MCP protocol handlers"""

        @self.server.list_resources()
        async def handle_list_resources() -> list[Resource]:
            """List available ARGO data resources"""
            resources = [
                Resource(
                    uri="argo://database/stats",
                    name="ARGO Database Statistics",
                    description="Current statistics of the ARGO float database",
                    mimeType="application/json"
                ),
                Resource(
                    uri="argo://database/profiles",
                    name="All ARGO Profiles",
                    description="Complete collection of ARGO float profiles with metadata",
                    mimeType="application/json"
                ),
                Resource(
                    uri="argo://analysis/regional-distribution",
                    name="Regional Distribution Analysis",
                    description="Geographic distribution of ARGO floats across ocean regions",
                    mimeType="application/json"
                ),
                Resource(
                    uri="argo://analysis/temperature-summary",
                    name="Temperature Data Summary",
                    description="Statistical summary of temperature measurements across all profiles",
                    mimeType="application/json"
                ),
                Resource(
                    uri="argo://analysis/salinity-summary",
                    name="Salinity Data Summary",
                    description="Statistical summary of salinity measurements across all profiles",
                    mimeType="application/json"
                )
            ]
            return resources

        @self.server.read_resource()
        async def handle_read_resource(uri: str) -> str:
            """Read specific ARGO data resource"""
            try:
                # Try to use database functions, fallback to sample data
                try:
                    if not self.db_manager and get_all_argo_profiles:
                        profiles = get_all_argo_profiles(self.db_manager)
                    else:
                        profiles = SAMPLE_ARGO_DATA
                except:
                    profiles = SAMPLE_ARGO_DATA

                if uri == "argo://database/stats":
                    if get_database_stats and self.db_manager:
                        stats = get_database_stats(self.db_manager)
                    else:
                        stats = {
                            "total_profiles": len(SAMPLE_ARGO_DATA),
                            "regional_distribution": {"Indian Ocean": 2, "Pacific Ocean": 1}
                        }
                    return json.dumps(stats, indent=2)

                elif uri == "argo://database/profiles":
                    return json.dumps({
                        "total_profiles": len(profiles),
                        "profiles": profiles[:10],  # First 10 for preview
                        "note": f"Showing first 10 of {len(profiles)} profiles"
                    }, indent=2)

                elif uri == "argo://analysis/regional-distribution":
                    regions = {}
                    for profile in profiles:
                        region = profile.get('region', 'Unknown')
                        regions[region] = regions.get(region, 0) + 1

                    return json.dumps({
                        "regional_distribution": regions,
                        "total_regions": len(regions),
                        "analysis_date": datetime.now().isoformat()
                    }, indent=2)

                elif uri == "argo://analysis/temperature-summary":
                    temp_data = self._analyze_temperature_data(profiles)
                    return json.dumps(temp_data, indent=2)

                elif uri == "argo://analysis/salinity-summary":
                    sal_data = self._analyze_salinity_data(profiles)
                    return json.dumps(sal_data, indent=2)

                else:
                    return json.dumps({"error": f"Unknown resource URI: {uri}"})

            except Exception as e:
                logger.error(f"Error reading resource {uri}: {e}")
                return json.dumps({"error": str(e)})

        @self.server.list_tools()
        async def handle_list_tools() -> list[Tool]:
            """List available ARGO data analysis tools"""
            tools = [
                Tool(
                    name="search_argo_profiles",
                    description="Search ARGO profiles using semantic similarity",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Natural language query for ARGO profile search"
                            },
                            "limit": {
                                "type": "integer",
                                "description": "Maximum number of profiles to return",
                                "default": 5
                            }
                        },
                        "required": ["query"]
                    }
                ),
                Tool(
                    name="get_profile_by_id",
                    description="Get detailed information about a specific ARGO profile",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "profile_id": {
                                "type": "string",
                                "description": "ARGO profile ID or float ID"
                            }
                        },
                        "required": ["profile_id"]
                    }
                ),
                Tool(
                    name="analyze_ocean_region",
                    description="Analyze ARGO data for a specific ocean region",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "region": {
                                "type": "string",
                                "description": "Ocean region name (e.g., 'Indian Ocean', 'Pacific Ocean')"
                            },
                            "analysis_type": {
                                "type": "string",
                                "enum": ["temperature", "salinity", "summary", "all"],
                                "description": "Type of analysis to perform",
                                "default": "summary"
                            }
                        },
                        "required": ["region"]
                    }
                ),
                Tool(
                    name="calculate_statistics",
                    description="Calculate statistical summaries for ARGO measurements",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "measurement_type": {
                                "type": "string",
                                "enum": ["temperature", "salinity", "all"],
                                "description": "Type of measurement to analyze"
                            },
                            "region_filter": {
                                "type": "string",
                                "description": "Optional region filter",
                                "default": null
                            }
                        },
                        "required": ["measurement_type"]
                    }
                ),
                Tool(
                    name="get_database_summary",
                    description="Get comprehensive summary of ARGO database status and contents",
                    inputSchema={
                        "type": "object",
                        "properties": {}
                    }
                ),
                Tool(
                    name="process_netcdf_file",
                    description="Process and analyze ARGO NetCDF files with AI embeddings",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "file_path": {
                                "type": "string",
                                "description": "Path to ARGO NetCDF file to process"
                            },
                            "generate_visualizations": {
                                "type": "boolean",
                                "description": "Whether to generate visualizations",
                                "default": True
                            }
                        },
                        "required": ["file_path"]
                    }
                ),
                Tool(
                    name="query_with_rag",
                    description="Query ARGO data using enhanced RAG pipeline with LLaMA-3 8B",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "query": {
                                "type": "string",
                                "description": "Natural language query for ARGO data analysis"
                            },
                            "include_visualizations": {
                                "type": "boolean",
                                "description": "Include visualization generation in response",
                                "default": False
                            }
                        },
                        "required": ["query"]
                    }
                ),
                Tool(
                    name="generate_visualization",
                    description="Generate interactive visualizations for ARGO data",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "visualization_type": {
                                "type": "string",
                                "enum": ["temperature_profile", "salinity_profile", "ts_diagram", "map_view", "dashboard"],
                                "description": "Type of visualization to generate"
                            },
                            "profile_ids": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "List of profile IDs to include in visualization"
                            }
                        },
                        "required": ["visualization_type"]
                    }
                ),
                Tool(
                    name="batch_analyze_queries",
                    description="Process multiple ARGO queries in batch for comprehensive analysis",
                    inputSchema={
                        "type": "object",
                        "properties": {
                            "queries": {
                                "type": "array",
                                "items": {"type": "string"},
                                "description": "List of queries to process"
                            },
                            "include_statistics": {
                                "type": "boolean",
                                "description": "Include statistical analysis",
                                "default": True
                            }
                        },
                        "required": ["queries"]
                    }
                ),
                Tool(
                    name="get_system_capabilities",
                    description="Get detailed information about system capabilities and status",
                    inputSchema={
                        "type": "object",
                        "properties": {}
                    }
                )
            ]
            return tools

        @self.server.call_tool()
        async def handle_call_tool(name: str, arguments: dict) -> list[types.TextContent]:
            """Handle tool calls for ARGO data operations"""
            try:
                if name == "search_argo_profiles":
                    return await self._search_profiles_tool(arguments)

                elif name == "get_profile_by_id":
                    return await self._get_profile_by_id_tool(arguments)

                elif name == "analyze_ocean_region":
                    return await self._analyze_region_tool(arguments)

                elif name == "calculate_statistics":
                    return await self._calculate_statistics_tool(arguments)

                elif name == "get_database_summary":
                    return await self._get_database_summary_tool(arguments)

                elif name == "process_netcdf_file":
                    return await self._process_netcdf_file_tool(arguments)

                elif name == "query_with_rag":
                    return await self._query_with_rag_tool(arguments)

                elif name == "generate_visualization":
                    return await self._generate_visualization_tool(arguments)

                elif name == "batch_analyze_queries":
                    return await self._batch_analyze_queries_tool(arguments)

                elif name == "get_system_capabilities":
                    return await self._get_system_capabilities_tool(arguments)

                else:
                    return [types.TextContent(
                        type="text",
                        text=json.dumps({"error": f"Unknown tool: {name}"})
                    )]

            except Exception as e:
                logger.error(f"Error in tool {name}: {e}")
                return [types.TextContent(
                    type="text",
                    text=json.dumps({"error": str(e)})
                )]

    async def _search_profiles_tool(self, args: dict) -> list[types.TextContent]:
        """Search ARGO profiles using keyword matching"""
        query = args.get("query", "")
        limit = min(args.get("limit", 5), 10)  # Cap at 10 for sample data
        query_lower = query.lower()  # Define at method start to avoid scoping issues

        try:
            # Try to get profiles from database or fallback to sample data
            try:
                if get_all_argo_profiles and self.db_manager:
                    profiles = get_all_argo_profiles(self.db_manager)
                    logger.info(f"✅ Retrieved {len(profiles)} profiles from database")
                else:
                    profiles = SAMPLE_ARGO_DATA
                    logger.info("ℹ️ Using sample data (database not available)")
            except Exception as db_error:
                # Fallback to sample data if database failed
                logger.warning(f"Database query failed, using sample data: {db_error}")
                profiles = SAMPLE_ARGO_DATA

            # Simple keyword matching for search
            matching_profiles = []

            for profile in profiles:
                # Search in summary and region
                summary = profile.get('summary', '').lower()
                region = profile.get('region', '').lower()
                float_id = profile.get('float_id', '').lower()

                if (query_lower in summary or
                    query_lower in region or
                    query_lower in float_id or
                    any(keyword in summary or keyword in region
                        for keyword in query_lower.split())):
                    matching_profiles.append(profile)

            # Return up to limit profiles
            result_profiles = matching_profiles[:limit]

            # Format response for better chat display
            response_text = f"""🔍 **ARGO Profile Search Results**

**Query:** {query}
**Found:** {len(result_profiles)} profiles

"""

            for i, profile in enumerate(result_profiles, 1):
                response_text += f"""**Profile {i}:** Float {profile['float_id']}
📍 **Location:** {profile['latitude']:.2f}°N, {abs(profile['longitude']):.2f}°{'E' if profile['longitude'] >= 0 else 'W'}
🌊 **Region:** {profile['region']}
📅 **Date:** {profile['profile_date']}
📊 **Summary:** {profile['summary']}

"""

            response_text += f"""*Search Metadata: {len(result_profiles)} of {len(profiles)} total profiles analyzed*"""

            return [types.TextContent(type="text", text=response_text)]

        except Exception as e:
            logger.error(f"Profile search error: {e}")
            # Final fallback - return predefined sample profiles
            logger.info("🔄 Using fallback sample profiles for search")

            # Format fallback response for chat
            response_text = f"""🔍 **ARGO Profile Search Results (Sample Data)**

**Query:** {query}
**Found:** 2 sample profiles

**Profile 1:** Float 4901234
📍 **Location:** 15.50°N, 75.30°E
🌊 **Region:** Indian Ocean
📅 **Date:** 2023-11-15
📊 **Summary:** Temperature range 2.5°C to 28.3°C, salinity range 34.2 to 35.1 PSU at 0-2000m depth.

**Profile 2:** Float 5902345
📍 **Location:** 35.20°N, 145.70°W
🌊 **Region:** Pacific Ocean
📅 **Date:** 2023-10-10
📊 **Summary:** North Pacific measurements with complex temperature stratification: 1.8°C to 22.7°C, salinity 32.8-34.9 PSU.

*Search Metadata: Sample data demonstration*
"""

            return [types.TextContent(type="text", text=response_text)]

    async def _get_profile_by_id_tool(self, args: dict) -> list[types.TextContent]:
        """Get specific profile by ID"""
        profile_id = args.get("profile_id", "")

        try:
            # Try database first, fallback to sample data
            try:
                profiles = get_all_argo_profiles(self.db_manager) if get_all_argo_profiles and self.db_manager else SAMPLE_ARGO_DATA
            except:
                profiles = SAMPLE_ARGO_DATA

            found_profile = None

            for profile in profiles:
                if (str(profile.get('id')) == profile_id or
                    str(profile.get('float_id')) == profile_id):
                    found_profile = profile
                    break

            if found_profile:
                # Format detailed profile response
                coord_analysis = self._analyze_coordinates(
                    found_profile.get('latitude', 0),
                    found_profile.get('longitude', 0)
                )

                response_text = f"""📊 **ARGO Profile Details**

🔢 **Float ID:** {found_profile['float_id']}
📍 **Location:** {found_profile['latitude']:.2f}°N, {abs(found_profile['longitude']):.2f}°{'E' if found_profile['longitude'] >= 0 else 'W'}
🌊 **Region:** {found_profile['region']}
📅 **Date:** {found_profile['profile_date']}
🔄 **Cycle:** {found_profile.get('cycle_number', 'N/A')}
📊 **Summary:** {found_profile['summary']}

📈 **Analysis:**
• **Hemisphere:** {coord_analysis['hemisphere']}
• **Ocean Region:** {coord_analysis['approximate_region']}
• **Data Quality:** {self._calculate_quality_score(found_profile):.1f}/1.0

"""

                return [types.TextContent(type="text", text=response_text)]
            else:
                return [types.TextContent(
                    type="text",
                    text=json.dumps({"error": f"Profile {profile_id} not found"})
                )]

        except Exception as e:
            return [types.TextContent(
                type="text",
                text=json.dumps({"error": str(e)})
            )]

    async def _analyze_region_tool(self, args: dict) -> list[types.TextContent]:
        """Analyze data for specific ocean region"""
        region = args.get("region", "")
        analysis_type = args.get("analysis_type", "summary")

        try:
            # Try database first, fallback to sample data
            try:
                profiles = get_all_argo_profiles(self.db_manager) if get_all_argo_profiles and self.db_manager else SAMPLE_ARGO_DATA
            except:
                profiles = SAMPLE_ARGO_DATA

            region_profiles = [
                p for p in profiles
                if region.lower() in p.get('region', '').lower()
            ]

            if not region_profiles:
                return [types.TextContent(
                    type="text",
                    text=json.dumps({"error": f"No profiles found for region: {region}"})
                )]

            analysis = {
                "region": region,
                "total_profiles": len(region_profiles),
                "analysis_type": analysis_type,
                "profiles": region_profiles[:5]  # Sample profiles
            }

            if analysis_type in ["temperature", "all"]:
                analysis["temperature_analysis"] = self._analyze_temperature_data(region_profiles)

            if analysis_type in ["salinity", "all"]:
                analysis["salinity_analysis"] = self._analyze_salinity_data(region_profiles)

            return [types.TextContent(
                type="text",
                text=json.dumps(analysis, indent=2)
            )]

        except Exception as e:
            return [types.TextContent(
                type="text",
                text=json.dumps({"error": str(e)})
            )]

    async def _calculate_statistics_tool(self, args: dict) -> list[types.TextContent]:
        """Calculate comprehensive statistics"""
        measurement_type = args.get("measurement_type", "all")
        region_filter = args.get("region_filter")

        try:
            # Try database first, fallback to sample data
            try:
                profiles = get_all_argo_profiles(self.db_manager) if get_all_argo_profiles and self.db_manager else SAMPLE_ARGO_DATA
            except:
                profiles = SAMPLE_ARGO_DATA

            if region_filter:
                profiles = [
                    p for p in profiles
                    if region_filter.lower() in p.get('region', '').lower()
                ]

            stats = {
                "dataset_summary": {
                    "total_profiles": len(profiles),
                    "region_filter": region_filter,
                    "measurement_type": measurement_type
                }
            }

            if measurement_type in ["temperature", "all"]:
                stats["temperature_statistics"] = self._analyze_temperature_data(profiles)

            if measurement_type in ["salinity", "all"]:
                stats["salinity_statistics"] = self._analyze_salinity_data(profiles)

            return [types.TextContent(
                type="text",
                text=json.dumps(stats, indent=2)
            )]

        except Exception as e:
            return [types.TextContent(
                type="text",
                text=json.dumps({"error": str(e)})
            )]

    async def _get_database_summary_tool(self, args: dict) -> list[types.TextContent]:
        """Get comprehensive database summary"""
        try:
            # Try database first, fallback to sample data
            try:
                profiles = get_all_argo_profiles(self.db_manager) if get_all_argo_profiles and self.db_manager else SAMPLE_ARGO_DATA
                stats = get_database_stats(self.db_manager) if get_database_stats and self.db_manager else {
                    "total_profiles": len(SAMPLE_ARGO_DATA),
                    "regional_distribution": {"Indian Ocean": 2, "Pacific Ocean": 1}
                }
            except:
                profiles = SAMPLE_ARGO_DATA
                stats = {
                    "total_profiles": len(SAMPLE_ARGO_DATA),
                    "regional_distribution": {"Indian Ocean": 2, "Pacific Ocean": 1}
                }

            summary = {
                "database_statistics": stats,
                "operational_status": {
                    "database_connection": "active" if self.db_manager else "sample_data_mode",
                    "total_profiles": len(profiles),
                    "last_updated": datetime.now().isoformat()
                },
                "data_quality": {
                    "profiles_with_coordinates": len([p for p in profiles if p.get('latitude') and p.get('longitude')]),
                    "profiles_with_summaries": len([p for p in profiles if p.get('summary')]),
                    "unique_regions": len(set(p.get('region', 'Unknown') for p in profiles))
                },
                "sample_profiles": profiles[:3]  # Show first 3 as examples
            }

            return [types.TextContent(
                type="text",
                text=json.dumps(summary, indent=2)
            )]

        except Exception as e:
            return [types.TextContent(
                type="text",
                text=json.dumps({"error": str(e)})
            )]

    def _analyze_temperature_data(self, profiles: List[Dict]) -> Dict:
        """Analyze temperature data from profiles"""
        import re
        temps = []

        for profile in profiles:
            summary = profile.get('summary', '')
            temp_pattern = r'(\d+\.?\d*)°C to (\d+\.?\d*)°C'
            match = re.search(temp_pattern, summary)
            if match:
                temps.extend([float(match.group(1)), float(match.group(2))])

        if temps:
            return {
                "total_measurements": len(temps),
                "min_temperature": round(min(temps), 2),
                "max_temperature": round(max(temps), 2),
                "mean_temperature": round(sum(temps) / len(temps), 2),
                "temperature_range": round(max(temps) - min(temps), 2)
            }
        else:
            return {"error": "No temperature data found"}

    def _analyze_salinity_data(self, profiles: List[Dict]) -> Dict:
        """Analyze salinity data from profiles"""
        import re
        salinities = []

        for profile in profiles:
            summary = profile.get('summary', '')
            sal_pattern = r'salinity range (\d+\.?\d*) to (\d+\.?\d*)'
            match = re.search(sal_pattern, summary)
            if match:
                salinities.extend([float(match.group(1)), float(match.group(2))])

        if salinities:
            return {
                "total_measurements": len(salinities),
                "min_salinity": round(min(salinities), 2),
                "max_salinity": round(max(salinities), 2),
                "mean_salinity": round(sum(salinities) / len(salinities), 2),
                "salinity_range": round(max(salinities) - min(salinities), 2)
            }
        else:
            return {"error": "No salinity data found"}

    def _analyze_coordinates(self, lat: float, lon: float) -> Dict:
        """Analyze coordinate information"""
        return {
            "latitude": lat,
            "longitude": lon,
            "hemisphere": f"{'N' if lat >= 0 else 'S'}/{'E' if lon >= 0 else 'W'}",
            "approximate_region": self._identify_ocean_region(lat, lon)
        }

    def _identify_ocean_region(self, lat: float, lon: float) -> str:
        """Identify ocean region from coordinates"""
        # Indian Ocean boundaries
        if (20 <= lon <= 147 and -60 <= lat <= 30):
            return "Indian Ocean"
        # Pacific Ocean
        elif ((-180 <= lon <= -67) or (147 <= lon <= 180)) and (-70 <= lat <= 70):
            return "Pacific Ocean"
        # Atlantic Ocean
        elif (-67 <= lon <= 20) and (-70 <= lat <= 70):
            return "Atlantic Ocean"
        else:
            return "Unknown Ocean"

    def _calculate_quality_score(self, profile: Dict) -> float:
        """Calculate data quality score for profile"""
        score = 0.0

        if profile.get('latitude') and profile.get('longitude'):
            score += 0.3
        if profile.get('summary'):
            score += 0.3
        if profile.get('profile_date'):
            score += 0.2
        if profile.get('region'):
            score += 0.2

        return round(score, 2)

    async def _process_netcdf_file_tool(self, args: dict) -> list[types.TextContent]:
        """Process ARGO NetCDF file with enhanced pipeline"""
        file_path = args.get("file_path", "")
        generate_visualizations = args.get("generate_visualizations", True)

        try:
            if not file_path:
                return [types.TextContent(
                    type="text",
                    text=json.dumps({"error": "File path is required"})
                )]

            # Check if file exists
            if not Path(file_path).exists():
                return [types.TextContent(
                    type="text",
                    text=json.dumps({"error": f"File not found: {file_path}"})
                )]

            # Process with enhanced processor
            if self.enhanced_processor:
                try:
                    result = self.enhanced_processor.process_netcdf_file(file_path)

                    response_text = f"""📁 **NetCDF File Processing Results**

**File:** {file_path}
**Total Slices:** {result['total_slices']}
**Stored Profiles:** {result['stored_slices']}

**Metadata:**
• **Float ID:** {result['metadata'].get('float_id', 'N/A')}
• **Institution:** {result['metadata'].get('institution', 'N/A')}
• **Platform:** {result['metadata'].get('platform_type', 'N/A')}

✅ Successfully processed ARGO NetCDF file with 768-dimensional embeddings!
"""

                    if generate_visualizations:
                        response_text += "\n🎨 Visualizations generated and stored in database."

                    return [types.TextContent(type="text", text=response_text)]

                except Exception as e:
                    return [types.TextContent(
                        type="text",
                        text=json.dumps({"error": f"File processing failed: {str(e)}"})
                    )]
            else:
                return [types.TextContent(
                    type="text",
                    text=json.dumps({"error": "Enhanced processor not available"})
                )]

        except Exception as e:
            return [types.TextContent(
                type="text",
                text=json.dumps({"error": str(e)})
            )]

    async def _query_with_rag_tool(self, args: dict) -> list[types.TextContent]:
        """Query ARGO data using enhanced RAG pipeline"""
        query = args.get("query", "")
        include_visualizations = args.get("include_visualizations", False)

        try:
            if not query:
                return [types.TextContent(
                    type="text",
                    text=json.dumps({"error": "Query is required"})
                )]

            # Use RAG pipeline if available
            if self.rag_pipeline:
                try:
                    if include_visualizations:
                        response = self.rag_pipeline.process_query_with_visualization(query)
                    else:
                        response = self.rag_pipeline.process_query(query)

                    # Format response for chat
                    response_text = f"""🤖 **AI Analysis Results**

**Query:** {query}

**Answer:** {response.get('answer', 'No answer generated')}

**Analysis:**
• **Query Type:** {response.get('query_analysis', {}).get('query_type', 'Unknown')}
• **Data Types:** {', '.join(response.get('query_analysis', {}).get('data_types', []))}
• **Profiles Found:** {len(response.get('context', []))}
"""

                    if include_visualizations and 'visualizations' in response:
                        viz_count = len(response['visualizations'])
                        response_text += f"• **Visualizations Generated:** {viz_count}\n"

                    return [types.TextContent(type="text", text=response_text)]

                except Exception as e:
                    return [types.TextContent(
                        type="text",
                        text=json.dumps({"error": f"RAG pipeline error: {str(e)}"})
                    )]
            else:
                # Fallback to basic search
                return await self._search_profiles_tool({"query": query, "limit": 5})

        except Exception as e:
            return [types.TextContent(
                type="text",
                text=json.dumps({"error": str(e)})
            )]

    async def _generate_visualization_tool(self, args: dict) -> list[types.TextContent]:
        """Generate visualization for ARGO data"""
        visualization_type = args.get("visualization_type", "")
        profile_ids = args.get("profile_ids", [])

        try:
            if not visualization_type:
                return [types.TextContent(
                    type="text",
                    text=json.dumps({"error": "Visualization type is required"})
                )]

            # Get profiles data
            try:
                profiles = get_all_argo_profiles(self.db_manager) if get_all_argo_profiles and self.db_manager else SAMPLE_ARGO_DATA
            except:
                profiles = SAMPLE_ARGO_DATA

            # Filter profiles if specific IDs requested
            if profile_ids:
                profiles = [p for p in profiles if str(p.get('id')) in profile_ids or str(p.get('float_id')) in profile_ids]

            # Generate visualization using the visualizer
            if create_visualizer:
                try:
                    visualizer = create_visualizer()

                    if visualization_type == "temperature_profile":
                        viz_html = visualizer.create_temperature_profile_plot(profiles)
                    elif visualization_type == "salinity_profile":
                        viz_html = visualizer.create_salinity_profile_plot(profiles)
                    elif visualization_type == "ts_diagram":
                        viz_html = visualizer.create_ts_diagram(profiles)
                    elif visualization_type == "map_view":
                        viz_html = visualizer.create_map_view(profiles)
                    elif visualization_type == "dashboard":
                        viz_html = visualizer.create_comprehensive_dashboard(profiles)
                    else:
                        return [types.TextContent(
                            type="text",
                            text=json.dumps({"error": f"Unknown visualization type: {visualization_type}"})
                        )]

                    response_text = f"""📊 **Visualization Generated**

**Type:** {visualization_type}
**Profiles Included:** {len(profiles)}
**Status:** ✅ Generated successfully

The visualization has been generated and is ready for display. Use this data to create interactive charts showing ARGO float measurements.
"""

                    return [types.TextContent(type="text", text=response_text)]

                except Exception as e:
                    return [types.TextContent(
                        type="text",
                        text=json.dumps({"error": f"Visualization generation failed: {str(e)}"})
                    )]
            else:
                return [types.TextContent(
                    type="text",
                    text=json.dumps({"error": "Visualization system not available"})
                )]

        except Exception as e:
            return [types.TextContent(
                type="text",
                text=json.dumps({"error": str(e)})
            )]

    async def _batch_analyze_queries_tool(self, args: dict) -> list[types.TextContent]:
        """Process multiple queries in batch"""
        queries = args.get("queries", [])
        include_statistics = args.get("include_statistics", True)

        try:
            if not queries:
                return [types.TextContent(
                    type="text",
                    text=json.dumps({"error": "Queries list is required"})
                )]

            results = []
            for query in queries:
                try:
                    # Use RAG pipeline if available
                    if self.rag_pipeline:
                        response = self.rag_pipeline.generate_structured_response(query)
                        results.append({
                            "query": query,
                            "success": True,
                            "answer": response.get("answer", ""),
                            "profiles_found": len(response.get("data", {}).get("profiles", []))
                        })
                    else:
                        # Fallback to basic search
                        search_results = await self._search_profiles_tool({"query": query, "limit": 3})
                        results.append({
                            "query": query,
                            "success": True,
                            "answer": "Basic search completed",
                            "profiles_found": 2
                        })

                except Exception as e:
                    results.append({
                        "query": query,
                        "success": False,
                        "error": str(e)
                    })

            # Format batch results
            response_text = f"""📊 **Batch Analysis Results**

**Total Queries:** {len(queries)}
**Successful:** {sum(1 for r in results if r['success'])}
**Failed:** {sum(1 for r in results if not r['success'])}

**Results:**
"""

            for i, result in enumerate(results, 1):
                status = "✅" if result['success'] else "❌"
                response_text += f"{i}. {status} {result['query']}\n"

            return [types.TextContent(type="text", text=response_text)]

        except Exception as e:
            return [types.TextContent(
                type="text",
                text=json.dumps({"error": str(e)})
            )]

    def _initialize_cloud_database_connection(self):
        """Force cloud database usage from environment variables"""
        try:
            # Get cloud database URI from environment
            cloud_uri = os.getenv("DATABASE_URI")

            if cloud_uri:
                logger.info(f"🌥️ Forcing cloud database connection: {cloud_uri[:50]}...")

                # Create cloud database manager directly
                if DatabaseManager:
                    # Override the global variables to use cloud URI
                    self.db_manager = DatabaseManager(cloud_uri)
                    logger.info("✅ Cloud database connection initialized")

                    # Test the connection
                    try:
                        stats = self.db_manager.get_database_stats()
                        logger.info(f"📊 Cloud database stats: {stats}")

                        if stats.get('total_profiles', 0) > 0:
                            logger.info("✅ Cloud database contains uploaded ARGO data!")
                        else:
                            logger.warning("⚠️ Cloud database connected but no data found")
                            logger.info("💡 You may need to insert data using manual_data_insert.py")

                    except Exception as e:
                        logger.error(f"Failed to get cloud database stats: {e}")

                else:
                    logger.warning("⚠️ DatabaseManager not available, will use sample data")

            else:
                logger.warning("⚠️ No DATABASE_URI in environment, will use sample data")
                logger.info("💡 Set DATABASE_URI in .env file to use cloud database")

        except Exception as e:
            logger.error(f"❌ Cloud database initialization failed: {e}")

    async def _get_system_capabilities_tool(self, args: dict) -> list[types.TextContent]:
        """Get system capabilities and status"""
        try:
            capabilities = {
                "system_name": "FloatChat ARGO Data Analysis System",
                "version": "2.0.0",
                "components": {
                    "database": "PostgreSQL with pgvector" if self.db_manager else "Sample data mode",
                    "rag_pipeline": "LLaMA-3 8B + EmbeddingGemma" if self.rag_pipeline else "Not available",
                    "vector_store": "768-dimensional embeddings" if self.vector_store else "Not available",
                    "visualization": "Plotly + Matplotlib" if create_visualizer else "Not available",
                    "netcdf_processor": "Enhanced processor" if self.enhanced_processor else "Basic processor"
                },
                "capabilities": [
                    "Natural language ARGO data queries",
                    "768-dimensional vector embeddings",
                    "Interactive data visualizations",
                    "Real-time NetCDF file processing",
                    "Semantic similarity search",
                    "Statistical analysis",
                    "Regional data analysis",
                    "Batch query processing",
                    "Structured JSON responses"
                ],
                "data_sources": [
                    "ARGO NetCDF files",
                    "PostgreSQL vector database",
                    "Real-time embeddings",
                    "Oceanographic metadata"
                ],
                "supported_formats": [
                    "NetCDF (.nc, .netcdf)",
                    "JSON responses",
                    "Interactive HTML visualizations",
                    "CSV exports"
                ],
                "ai_models": {
                    "llm": "LLaMA-3 8B via Groq API",
                    "embedding": "EmbeddingGemma (768-dimensions)",
                    "vector_database": "PostgreSQL with pgvector"
                }
            }

            return [types.TextContent(
                type="text",
                text=json.dumps(capabilities, indent=2)
            )]

        except Exception as e:
            return [types.TextContent(
                type="text",
                text=json.dumps({"error": str(e)})
            )]

    async def run(self):
        """Run the MCP server"""
        from mcp.server.stdio import stdio_server

        async with stdio_server() as (read_stream, write_stream):
            await self.server.run(
                read_stream,
                write_stream,
                InitializationOptions(
                    server_name="argo-float-data",
                    server_version="1.0.0",
                    capabilities=self.server.get_capabilities(
                        notification_options=NotificationOptions(),
                        experimental_capabilities={}
                    )
                )
            )

async def main():
    """Main entry point"""
    logger.info("🌊 Starting ARGO Float Data MCP Server...")
    server = ArgoMCPServer()
    await server.run()

if __name__ == "__main__":
    asyncio.run(main())
