# ARGO Float Data MCP Server

A Model Context Protocol (MCP) server that provides structured access to ARGO float oceanographic data.

## Overview

This MCP server enables AI assistants like Claude to directly interact with ARGO float data through standardized tools and resources. It provides semantic search, statistical analysis, and structured data access for oceanographic research.

## Features

### 🔍 **Resources**
- **Database Statistics**: Real-time stats of ARGO profile collection
- **Profile Collection**: Access to all 78+ ARGO float profiles
- **Regional Analysis**: Geographic distribution across ocean regions
- **Temperature/Salinity Summaries**: Statistical analysis of measurements

### 🛠️ **Tools**
- `search_argo_profiles`: Semantic search using vector embeddings
- `get_profile_by_id`: Detailed profile information by ID
- `analyze_ocean_region`: Regional oceanographic analysis
- `calculate_statistics`: Comprehensive statistical summaries
- `get_database_summary`: Complete database status and health

## Installation

1. **Install MCP Python SDK**:
   ```bash
   pip install mcp
   ```

2. **Install Required Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Claude Desktop**:
   Copy the configuration to Claude Desktop's config file:
   ```json
   {
     "mcpServers": {
       "argo-float-data": {
         "command": "python",
         "args": ["-m", "mcp_server.argo_server"],
         "cwd": "d:\\SIH-25\\FC_new\\Float_Chat",
         "env": {
           "PYTHONPATH": "d:\\SIH-25\\FC_new\\Float_Chat"
         }
       }
     }
   }
   ```

## Usage Examples

### Search ARGO Profiles
```python
# Tool: search_argo_profiles
{
  "query": "temperature anomalies in Indian Ocean",
  "limit": 10
}
```

### Analyze Ocean Region
```python
# Tool: analyze_ocean_region
{
  "region": "Indian Ocean",
  "analysis_type": "temperature"
}
```

### Get Database Statistics
```python
# Resource: argo://database/stats
# Returns comprehensive database metrics
```

## Data Structure

The MCP server provides structured JSON responses:

```json
{
  "profiles": [
    {
      "id": "float_12345",
      "latitude": -21.3,
      "longitude": 102.7,
      "region": "Southern Indian Ocean",
      "summary": "Temperature range 2.5°C to 28.3°C...",
      "profile_date": "2023-05-15",
      "coordinate_analysis": {
        "approximate_region": "Indian Ocean",
        "hemisphere": "S/E"
      },
      "data_quality_score": 1.0
    }
  ],
  "search_metadata": {
    "embedding_model": "ollama_embedgemma",
    "similarity_metric": "cosine_similarity",
    "total_found": 25
  }
}
```

## Configuration

Server configuration is managed in `config.py`:

```python
MCP_CONFIG = {
    "database_config": {
        "host": "localhost",
        "port": 5432,
        "database": "argo_data"
    },
    "embedding_config": {
        "model": "ollama_embedgemma",
        "dimensions": 768
    },
    "analysis_config": {
        "max_profiles_per_query": 50,
        "default_profile_limit": 5
    }
}
```

## Development

### Running the Server
```bash
# Direct execution
python -m mcp_server.argo_server

# With logging
python -m mcp_server.argo_server --log-level DEBUG
```

### Testing Tools
```bash
# Test specific tool
python -c "
import asyncio
from mcp_server.argo_server import ArgoMCPServer
server = ArgoMCPServer()
result = asyncio.run(server._search_profiles_tool({'query': 'temperature', 'limit': 5}))
print(result)
"
```

## Architecture

```
MCP Server Architecture
├── argo_server.py      # Main MCP server implementation
├── config.py           # Configuration management
├── __init__.py         # Package initialization
└── claude_desktop_config.json  # Claude Desktop integration
```

### Integration with Existing System

The MCP server integrates with your existing ARGO infrastructure:

- **Database**: Uses existing PostgreSQL with vector embeddings
- **RAG Pipeline**: Leverages existing Ollama embeddings
- **Vector Store**: Connects to existing 768-dimensional embeddings

## Benefits

### 🎯 **Structured Data Access**
- Standardized JSON responses
- Consistent data schemas
- Rich metadata inclusion

### 🚀 **Enhanced Performance**
- Direct database access (bypasses Django overhead)
- Efficient vector search
- Optimized for AI consumption

### 🔧 **Tool Integration**
- Native MCP protocol support
- Claude Desktop integration
- Extensible tool framework

### 📊 **Rich Analytics**
- Statistical summaries
- Regional analysis
- Quality scoring

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check PostgreSQL status
   pg_ctl status
   
   # Verify credentials in config.py
   ```

2. **Import Errors**
   ```bash
   # Ensure PYTHONPATH is set correctly
   export PYTHONPATH="d:\\SIH-25\\FC_new\\Float_Chat"
   ```

3. **Claude Desktop Integration**
   - Verify config file location: `%APPDATA%\\Claude\\claude_desktop_config.json`
   - Check command path and working directory
   - Restart Claude Desktop after config changes

### Logging

Enable debug logging for troubleshooting:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Future Enhancements

- [ ] Real-time data streaming
- [ ] Advanced statistical modeling
- [ ] Integration with external oceanographic APIs
- [ ] Custom visualization generation
- [ ] Machine learning model integration

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Submit pull request

## License

This project is part of the ARGO Float Chat system for oceanographic data analysis.