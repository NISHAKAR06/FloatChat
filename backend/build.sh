#!/bin/bash
# Clean Python cache files to avoid null byte issues
echo "Cleaning Python cache files..."
find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true
find . -type f -name "*.pyo" -delete 2>/dev/null || true

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Build complete!"
