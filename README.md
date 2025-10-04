# 🌊 Indian Ocean Oceanography Chatbot

A comprehensive oceanographic data analysis platform powered by AI, featuring real-time chat, NetCDF processing, and vector search capabilities.

## 🚀 Quick Start

### 1. Automated Setup (Recommended)

Run the complete setup script:

```bash
python setup_oceanography_system.py
```

This will:
- Install all dependencies
- Initialize the database
- Create configuration templates
- Verify service functionality

### 2. Manual Setup

#### Backend Setup (Django + FastAPI)

```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Set up Django
cd backend
python manage.py migrate
python manage.py init_db

# Start Django server
python manage.py runserver 8000

# Start FastAPI chatbot (in new terminal)
cd fastapi_service
python main.py
```

#### Frontend Setup (React)

```bash
# Install Node.js dependencies
cd frontend
npm install

# Start development server
npm run dev
```

## 🌐 Access Points

- **Frontend Chat Interface**: http://localhost:5173
- **Django Admin Panel**: http://localhost:8000/admin/
- **FastAPI Health Check**: http://localhost:8001/health
- **Django Health Check**: http://localhost:8000/health/

## 🎯 Features

### 🤖 AI-Powered Chat
- **Real-time WebSocket communication**
- **Natural language query processing**
- **RAG (Retrieval-Augmented Generation) search**
- **MCP statistical aggregations**
- **Groq LLaMA-3 integration**

### 📊 NetCDF Data Processing
- **Admin panel for file uploads**
- **Automatic metadata extraction**
- **Vector embedding generation**
- **Spatial and temporal filtering**
- **Region classification (Bay of Bengal, Arabian Sea, etc.)**

### 🔍 Advanced Analytics
- **Vector similarity search**
- **Statistical operations (mean, min, max, anomalies)**
- **Multi-variable analysis**
- **Temporal trend analysis**

## 📝 Configuration

### Environment Variables (.env)

```bash
# Django Configuration
DJANGO_SECRET_KEY=your-secret-key-here
DJANGO_DEBUG=True

# Database Configuration (PostgreSQL/Neon)
DATABASE_URL=postgresql://username:password@hostname:5432/database_name
VECTOR_DB_NAME=oceanography_vectordb
VECTOR_DB_USER=postgres
VECTOR_DB_PASSWORD=your_password
VECTOR_DB_HOST=your_host.neon.tech
VECTOR_DB_PORT=5432

# AI/LLM Configuration
GROQ_API_KEY=gsk_your_groq_api_key_here
OLLAMA_URL=http://localhost:11434
OLLAMA_EMBEDDING_MODEL=embeddinggemma

# Redis Configuration (for Celery)
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/0
```

## 💬 Example Queries

Try these queries in the chat interface:

- *"Show me temperature profiles in the Indian Ocean"*
- *"Compare salinity between Arabian Sea and Bay of Bengal"*
- *"Find ARGO floats near the equator in Indian Ocean"*
- *"What are the latest ocean temperature trends?"*
- *"Show me dissolved oxygen levels at 1000m depth"*
- *"Analyze seasonal variations in the Indian Ocean"*

## 🏗️ Architecture

### Microservice Design
- **Django Backend** (Port 8000): Data management, admin panel, authentication
- **FastAPI Service** (Port 8001): Real-time chatbot with WebSocket support
- **React Frontend** (Port 5173): Modern chat interface with streaming responses

### Database Schema
- **PostgreSQL with pgvector**: Vector embeddings and metadata storage
- **NetCDF Slices**: Preprocessed oceanographic data with embeddings
- **User Management**: Authentication and authorization

## 🔧 Development

### Adding New Features

1. **NetCDF Processing**: Extend `dataset_app/views.py` for new data types
2. **Chatbot Logic**: Modify `fastapi_service/main.py` for enhanced query processing
3. **UI Components**: Add new features in `frontend/src/pages/`

### Database Management

```bash
# Initialize database
python manage.py init_db

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

## 🚢 Deployment

### Production Deployment

1. **Set Environment Variables**:
   ```bash
   DJANGO_DEBUG=False
   DJANGO_SECRET_KEY=your-production-secret
   ```

2. **Database Setup**:
   - Use PostgreSQL with pgvector extension
   - Configure connection in `.env`

3. **Web Server**:
   - Use Gunicorn for Django
   - Use Uvicorn for FastAPI
   - Configure reverse proxy (nginx)

### Docker Deployment

```dockerfile
# Multi-stage build for complete system
FROM python:3.11-slim as backend
# ... backend setup

FROM node:18-alpine as frontend
# ... frontend setup

FROM python:3.11-slim
# ... production container
```

## 📚 API Documentation

### Django REST API
- **Datasets**: `/api/datasets/` - CRUD operations for NetCDF files
- **Authentication**: `/api/auth/` - JWT token management
- **Admin**: `/admin/` - Django admin interface

### FastAPI Endpoints
- **WebSocket Chat**: `ws://localhost:8001/ws/chat`
- **HTTP Chat**: `POST /api/chat/query`
- **Visualizations**: `GET /api/visualizations/{id}`
- **Health Check**: `GET /health`

## 🔒 Security

- **JWT Authentication**: Token-based auth for API access
- **CORS Configuration**: Cross-origin request handling
- **File Upload Validation**: NetCDF file type checking
- **SQL Injection Protection**: Parameterized queries

## 📈 Monitoring

- **Health Endpoints**: Monitor service availability
- **Database Metrics**: Query performance and storage stats
- **Error Logging**: Comprehensive error tracking
- **Performance Monitoring**: Response time tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the troubleshooting guide
- Review the API documentation
- Open an issue on GitHub

---

**Built with ❤️ for Oceanographic Research** 🌊
