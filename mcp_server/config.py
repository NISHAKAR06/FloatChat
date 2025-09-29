"""
MCP Server Configuration for ARGO Float Data
"""

import json
from pathlib import Path

# MCP Server Configuration
MCP_CONFIG = {
    "server_info": {
        "name": "argo-float-data",
        "version": "1.0.0",
        "description": "MCP Server for ARGO Float oceanographic data analysis",
        "author": "ARGO Float Chat Team",
        "homepage": "https://github.com/your-repo/argo-float-chat"
    },
    
    "capabilities": {
        "resources": True,
        "tools": True,
        "prompts": False,
        "logging": True
    },
    
    "database_config": {
        "host": "localhost",
        "port": 5432,
        "database": "argo_data",
        "timeout": 30
    },
    
    "embedding_config": {
        "model": "ollama_embedgemma",
        "dimensions": 768,
        "similarity_threshold": 0.7
    },
    
    "analysis_config": {
        "max_profiles_per_query": 50,
        "default_profile_limit": 5,
        "statistical_precision": 2,
        "coordinate_precision": 4
    }
}

def get_config() -> dict:
    """Get MCP server configuration"""
    return MCP_CONFIG

def save_config_file(config_path: str = None):
    """Save configuration to JSON file"""
    if not config_path:
        config_path = Path(__file__).parent / "mcp_config.json"
    
    with open(config_path, 'w') as f:
        json.dump(MCP_CONFIG, f, indent=2)

def load_config_file(config_path: str = None) -> dict:
    """Load configuration from JSON file"""
    if not config_path:
        config_path = Path(__file__).parent / "mcp_config.json"
    
    try:
        with open(config_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        # Return default config if file doesn't exist
        return MCP_CONFIG