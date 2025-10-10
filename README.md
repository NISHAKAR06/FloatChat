# 🌊 FloatChat - Indian Ocean ARGO Float Data Analysis Platform

<div align="center">

![FloatChat Logo](https://img.shields.io/badge/FloatChat-v2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Python](https://img.shields.io/badge/python-3.11+-blue.svg)
![React](https://img.shields.io/badge/react-18.3+-61dafb.svg)
![Status](https://img.shields.io/badge/status-production-success.svg)

**AI-Powered Oceanographic Data Analysis with Real-Time Chat, RAG Pipeline, and MCP Integration**

🌐 [Live Demo](https://float-chat-vyuga.vercel.app) | 📚 [Documentation](#documentation) | 🚀 [Quick Start](#quick-start)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Servers](#running-the-servers)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Usage Examples](#usage-examples)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## 🎯 Overview

FloatChat is a comprehensive AI-powered platform for analyzing ARGO float oceanographic data from the Indian Ocean region. It combines advanced machine learning techniques including RAG (Retrieval-Augmented Generation), vector embeddings, and Model Context Protocol (MCP) to provide intelligent, context-aware responses to oceanographic queries.

### Key Capabilities

- **🤖 Intelligent Chatbot**: Natural language queries powered by Groq LLaMA-3 8B
- **📊 Real-Time Data Processing**: Upload and process NetCDF files with automatic embedding generation
- **🔍 Semantic Search**: 768-dimensional vector embeddings with pgvector
- **🌊 Indian Ocean Focus**: Specialized for Arabian Sea, Bay of Bengal, and Southern Indian Ocean
- **📈 Statistical Analysis**: Comprehensive temperature, salinity, and depth analysis
- **🎨 Interactive Visualizations**: Real-time charts and maps using Plotly
- **🔐 Secure Authentication**: JWT-based user authentication and role management
- **☁️ Cloud Database**: Neon PostgreSQL with 644,031+ measurements

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FloatChat Platform                        │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│   Django     │────▶│  PostgreSQL  │
│   (React)    │     │   Backend    │     │   (Neon)     │
│  Port 5173   │     │  Port 8000   │     │  Cloud DB    │
└──────────────┘     └──────────────┘     └──────────────┘
       │                     │                    ▲
       │                     │                    │
       ▼                     ▼                    │
┌──────────────┐      ┌──────────────┐            │
│   FastAPI    │────▶│  Celery      │────────────┘
│   Chatbot    │      │  Worker      │
│  Port 8001   │      │  Background  │
└──────────────┘      └──────────────┘
       │                     
       ▼                     
┌──────────────────────────────┐
│      MCP Server              │
│  • RAG Pipeline              │
│  • Vector Store (pgvector)   │
│  • Groq AI (LLaMA-3)         │
│  • 644,031+ Measurements     │
└──────────────────────────────┘
```

### Component Details

**Frontend Layer:**
- React 18.3+ with TypeScript
- Vite for fast builds
- Tailwind CSS for styling
- Real-time WebSocket communication
- shadcn/ui component library

**Backend Layer:**
- **Django 4.2.25**: REST API, admin panel, authentication
- **FastAPI**: Real-time chatbot with WebSocket support
- **Celery**: Async task processing for NetCDF files
- **Redis**: Message broker for Celery

**Data Layer:**
- **Neon PostgreSQL**: Cloud database with pgvector extension
- **Vector Embeddings**: 768-dimensional embeddings for semantic search
- **NetCDF Processing**: Automatic extraction and storage

**AI/ML Layer:**
- **Groq API**: LLaMA-3 8B instant model
- **RAG Pipeline**: Context-aware query processing
- **MCP Server**: Statistical aggregations and data analysis
- **Vector Search**: Semantic similarity matching

---

---

## ✨ Features

### 🤖 AI-Powered Chatbot
- ✅ Natural language query processing
- ✅ Real-time WebSocket streaming responses
- ✅ Context-aware conversations with memory
- ✅ RAG (Retrieval-Augmented Generation) pipeline
- ✅ MCP (Model Context Protocol) integration
- ✅ Groq LLaMA-3 8B Instant model
- ✅ Intelligent query analysis and routing
- ✅ Indian Ocean region validation

### 📊 Data Processing & Management
- ✅ NetCDF file upload and processing
- ✅ Automatic metadata extraction
- ✅ 768-dimensional vector embeddings
- ✅ Background task processing with Celery
- ✅ Real-time upload status tracking
- ✅ Data validation and error handling
- ✅ Support for TEMP_ADJUSTED, PSAL_ADJUSTED, PRES_ADJUSTED variables

### 🔍 Advanced Search & Analysis
- ✅ Semantic similarity search with pgvector
- ✅ Temperature and salinity statistical analysis
- ✅ Geographic filtering (Arabian Sea, Bay of Bengal, Southern Indian Ocean)
- ✅ Depth-based profile queries
- ✅ Time-series analysis
- ✅ Multi-variable comparisons
- ✅ Anomaly detection

### 📈 Visualizations
- ✅ Interactive temperature profiles
- ✅ Salinity distribution maps
- ✅ T-S (Temperature-Salinity) diagrams
- ✅ Geographic coverage maps
- ✅ Depth profiles
- ✅ Statistical dashboards
- ✅ Real-time data updates

### 🔐 Security & Authentication
- ✅ JWT token-based authentication
- ✅ Role-based access control (Admin/User)
- ✅ Secure API endpoints
- ✅ CORS configuration for cross-origin requests
- ✅ File upload validation
- ✅ SQL injection protection

### ☁️ Cloud Infrastructure
- ✅ Neon PostgreSQL cloud database
- ✅ 644,031+ stored measurements
- ✅ Scalable architecture
- ✅ Automatic backups
- ✅ High availability
- ✅ Connection pooling

---

## 🛠️ Technology Stack

### Frontend
```
├── React 18.3.1          # UI framework
├── TypeScript 5.5.3      # Type safety
├── Vite 5.4.2           # Build tool
├── Tailwind CSS 3.4.1   # Styling
├── shadcn/ui            # Component library
├── Lucide React         # Icons
├── React Router 6.26.2  # Routing
└── Axios               # HTTP client
```

### Backend - Django
```
├── Django 4.2.25        # Web framework
├── Django REST Framework # API development
├── Celery 5.4.0        # Task queue
├── Redis              # Message broker
├── psycopg2 2.9.10    # PostgreSQL adapter
├── netCDF4 1.7.2      # NetCDF file handling
└── PyJWT              # JWT authentication
```

### Backend - FastAPI
```
├── FastAPI 0.115.6      # Async web framework
├── Uvicorn 0.34.0      # ASGI server
├── WebSockets 14.1     # Real-time communication
├── Pydantic 2.10.5     # Data validation
├── SQLAlchemy 2.0.36   # ORM
└── python-multipart    # File uploads
```

### AI/ML Stack
```
├── Groq API            # LLaMA-3 8B Instant
├── pgvector 0.3.7      # Vector similarity search
├── NumPy 2.2.1         # Numerical computing
├── Pandas 2.2.3        # Data manipulation
└── Plotly 5.24.1       # Interactive visualizations
```

### Database
```
├── PostgreSQL 16+       # Primary database
├── pgvector extension   # Vector operations
├── Neon Cloud Platform  # Managed PostgreSQL
└── Redis 7.0+          # Caching & queuing
```

---

## 📋 Prerequisites

Before installing FloatChat, ensure you have the following installed:

- **Python 3.11+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** ([Download](https://nodejs.org/))
- **PostgreSQL 16+** with pgvector extension ([Download](https://www.postgresql.org/download/))
- **Redis 7.0+** (for Celery) ([Download](https://redis.io/download))
- **Git** ([Download](https://git-scm.com/downloads))

### Optional Tools
- **Docker** for containerized deployment
- **Anaconda** for Python environment management
- **Bun** as an alternative to npm (faster)

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/NISHAKAR06/FloatChat.git
cd FloatChat
```

### 2. Environment Setup

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env  # If example exists, otherwise create new
```

Edit `.env` with your credentials (see [Environment Variables](#environment-variables))

### 3. Install Dependencies

#### Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Frontend Dependencies
```bash
cd frontend
npm install
# or
bun install
```

### 4. Database Initialization

```bash
cd backend
python manage.py migrate
python manage.py init_db
```

### 5. Create Admin User

```bash
python setup_demo_users.py
```

**Demo Credentials:**
- **Admin**: admin@float****.in / ******
- **User**: user@float****.in / *******

### 6. Start All Servers

You need **4 terminal windows**:

**Terminal 1 - Django Backend:**
```bash
cd backend
python manage.py runserver 8000
```

**Terminal 2 - FastAPI Chatbot:**
```bash
cd backend/fastapi_service
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 3 - Celery Worker:**
```bash
cd backend
celery -A backend worker -l info --pool=solo
```

**Terminal 4 - Frontend:**
```bash
cd frontend
npm run dev
# or
bun run dev
```

### 7. Access the Application

- 🌐 **Frontend**: http://localhost:5173
- 🔧 **Django Admin**: http://localhost:8000/admin
- 📡 **FastAPI Docs**: http://localhost:8001/docs
- 💬 **Chat WebSocket**: ws://localhost:8001/ws/chat

---

---

## 🔐 Environment Variables (Detailed)

Create a `.env` file in the `backend` directory with the following variables:

### Required Variables

```bash
# Database Configuration (Neon PostgreSQL)
DATABASE_URI=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/floatchat?sslmode=require

# AI Configuration
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxx  # Get from https://console.groq.com

# Django Configuration
SECRET_KEY=django-insecure-xxxxxxxxxxxxxxxxxxxxx
DEBUG=True  # Set to False in production
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Celery Configuration
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# FastAPI Configuration
FASTAPI_HOST=0.0.0.0
FASTAPI_PORT=8001
```

### Optional Variables

```bash
# Embedding Configuration
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSION=768

# File Upload Configuration
MAX_FILE_SIZE=524288000  # 500MB in bytes
ALLOWED_FILE_EXTENSIONS=.nc,.netcdf

# MCP Server Configuration
MCP_SERVER_NAME=argo-analysis
MCP_SERVER_VERSION=1.0.0

# Logging Configuration
LOG_LEVEL=INFO
LOG_FILE=logs/floatchat.log
```

### Getting API Keys

1. **Groq API Key**: 
   - Visit https://console.groq.com
   - Sign up for a free account
   - Navigate to API Keys section
   - Create new API key

2. **Neon PostgreSQL**:
   - Visit https://neon.tech
   - Create a new project
   - Copy the connection string from dashboard
   - Enable pgvector extension in SQL editor:
     ```sql
     CREATE EXTENSION IF NOT EXISTS vector;
     ```

---

## 📡 API Documentation (Detailed)

### Django REST API (Port 8000)

#### Authentication Endpoints

**POST** `/api/auth/register/`
```json
{
  "username": "user",
  "email": "user@example.com",
  "password": "password123",
  "role": "user"  // "admin" or "user"
}
```

**POST** `/api/auth/login/`
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### Dataset Endpoints

**GET** `/api/datasets/`
```json
[
  {
    "id": 1,
    "file_name": "argo_profile_2024.nc",
    "upload_date": "2024-01-15T10:30:00Z",
    "region": "Bay of Bengal",
    "status": "completed",
    "measurement_count": 125000
  }
]
```

**POST** `/api/datasets/upload/`
- Content-Type: `multipart/form-data`
- Body: `file=@argo_profile.nc`
- Returns: Upload status and background task ID

**GET** `/api/datasets/{id}/status/`
```json
{
  "status": "processing",  // "pending", "processing", "completed", "failed"
  "progress": 75,
  "measurements_processed": 95000,
  "estimated_time_remaining": "2 minutes"
}
```

#### Measurement Endpoints

**GET** `/api/measurements/?lat=10.5&lon=85.2&depth=100`
```json
{
  "count": 500,
  "results": [
    {
      "latitude": 10.5,
      "longitude": 85.2,
      "depth": 100.0,
      "temperature": 28.5,
      "salinity": 35.2,
      "date": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### FastAPI Chatbot API (Port 8001)

#### WebSocket Chat Endpoint

**WebSocket** `ws://localhost:8001/ws/chat`

**Send Message:**
```json
{
  "message": "Show me temperature profiles in the Arabian Sea",
  "conversation_id": "conv_123"
}
```

**Receive Stream Response:**
```json
{
  "type": "token",
  "content": "Based on the ARGO float data...",
  "token_count": 125
}
```

**Final Response:**
```json
{
  "type": "complete",
  "content": "Full response text...",
  "sources": [
    {
      "file_name": "argo_profile_2024.nc",
      "measurement_count": 500,
      "region": "Arabian Sea"
    }
  ],
  "statistics": {
    "avg_temperature": 28.5,
    "min_temperature": 18.2,
    "max_temperature": 30.1,
    "total_measurements": 644031
  }
}
```

#### MCP Tools (10 Available)

1. **search_argo_profiles** - Search by location/time/depth
2. **calculate_statistics** - Compute statistical aggregates
3. **query_with_rag** - Semantic similarity search
4. **analyze_ocean_region** - Region-specific analysis
5. **get_database_summary** - Database statistics
6. **get_temperature_profiles** - Temperature depth profiles
7. **get_salinity_profiles** - Salinity depth profiles
8. **compare_variables** - Multi-variable comparison
9. **detect_anomalies** - Statistical anomaly detection
10. **export_data** - Data export functionality

---

## 💡 Usage Examples (Detailed)

### Example 1: Temperature Analysis
```
User: "What's the average temperature in the Bay of Bengal?"

Response: Based on 215,430 measurements in the Bay of Bengal region:
- Average Temperature: 27.8°C
- Minimum: 4.2°C (at 2000m depth)
- Maximum: 30.5°C (surface)
- Standard Deviation: 5.3°C
```

### Example 2: Profile Query
```
User: "Show me temperature profiles near coordinates 15°N, 85°E"

Response: Found 5 ARGO float locations near 15°N, 85°E:
[Returns 500 measurements with depth profiles from surface to 2000m]
```

### Example 3: Comparative Analysis
```
User: "Compare salinity between Arabian Sea and Bay of Bengal"

Response: Salinity Comparison:
Arabian Sea: 35.8 PSU (avg), Range: 34.5-36.9 PSU
Bay of Bengal: 34.2 PSU (avg), Range: 32.1-35.8 PSU
The Arabian Sea shows higher salinity due to higher evaporation rates.
```

### Example 4: Anomaly Detection
```
User: "Find temperature anomalies at 1000m depth"

Response: Detected 12 anomalous measurements at 1000m:
- 8 warmer than expected (>2 std dev)
- 4 colder than expected (<-2 std dev)
[Shows specific locations and values]
```

---

## 📂 Project Structure (Detailed)

```
FloatChat/
│
├── backend/                      # Django + FastAPI Backend
│   ├── manage.py                 # Django management script
│   ├── requirements.txt          # Python dependencies
│   ├── Procfile                  # Production server config
│   ├── build.sh                  # Build script
│   ├── render.yaml               # Render deployment config
│   │
│   ├── backend/                  # Django project settings
│   │   ├── settings.py           # Django configuration
│   │   ├── urls.py               # Main URL routing
│   │   ├── wsgi.py               # WSGI server config
│   │   └── celery.py             # Celery configuration
│   │
│   ├── auth_app/                 # Authentication module
│   │   ├── models.py             # User model
│   │   ├── serializers.py        # JWT serializers
│   │   ├── views.py              # Auth endpoints
│   │   └── urls.py               # Auth routes
│   │
│   ├── dataset_app/              # Dataset management module
│   │   ├── models.py             # Dataset & DatasetValue models
│   │   ├── tasks.py              # Celery background tasks
│   │   ├── views.py              # Upload & query endpoints
│   │   └── management/           # Custom Django commands
│   │       └── commands/
│   │           └── init_db.py    # Database initialization
│   │
│   ├── chat_app/                 # Chat history module
│   │   ├── models.py             # Conversation & Message models
│   │   ├── views.py              # Chat API endpoints
│   │   └── argo_chat_views.py    # ARGO-specific chat handlers
│   │
│   ├── fastapi_service/          # FastAPI Chatbot Service
│   │   ├── main.py               # FastAPI app entry point
│   │   ├── config.py             # Configuration loader
│   │   ├── database.py           # Database manager (PostgreSQL)
│   │   ├── vector_store.py       # Vector similarity search
│   │   ├── rag_pipeline.py       # RAG query processing
│   │   ├── enhanced_argo_processor.py  # ARGO data processor
│   │   ├── visualizations.py     # Plotly chart generation
│   │   │
│   │   └── mcp_server/           # MCP Server Implementation
│   │       ├── argo_server.py    # MCP tool definitions
│   │       └── __init__.py
│   │
│   ├── admin_app/                # Admin panel customizations
│   ├── jobs_app/                 # Background job tracking
│   ├── viz_app/                  # Visualization endpoints
│   └── netcdf/                   # Uploaded NetCDF files storage
│
├── frontend/                     # React Frontend
│   ├── package.json              # Node.js dependencies
│   ├── vite.config.ts            # Vite configuration
│   ├── tailwind.config.ts        # Tailwind CSS config
│   ├── tsconfig.json             # TypeScript config
│   │
│   ├── src/
│   │   ├── main.tsx              # React entry point
│   │   ├── App.tsx               # Main app component
│   │   │
│   │   ├── pages/                # Page components
│   │   │   ├── Login.tsx         # Login page
│   │   │   ├── Register.tsx      # Registration page
│   │   │   ├── Dashboard.tsx     # Main dashboard
│   │   │   ├── Chat.tsx          # Chat interface
│   │   │   └── Admin.tsx         # Admin panel
│   │   │
│   │   ├── components/           # Reusable UI components
│   │   │   ├── ui/               # shadcn/ui components
│   │   │   ├── ChatInterface.tsx # Chat UI
│   │   │   ├── DataUpload.tsx    # File upload component
│   │   │   └── Visualizations.tsx # Chart components
│   │   │
│   │   ├── contexts/             # React contexts
│   │   │   └── AuthContext.tsx   # Authentication state
│   │   │
│   │   ├── hooks/                # Custom React hooks
│   │   │   └── useWebSocket.ts   # WebSocket hook
│   │   │
│   │   └── lib/                  # Utilities
│   │       └── api.ts            # API client
│   │
│   └── public/                   # Static assets
│
└── README.md                     # This file
```

---

## 🚢 Deployment (Detailed)

### Render.com Deployment (Recommended)

FloatChat is configured for one-click deployment on Render.com:

1. **Fork this repository** to your GitHub account

2. **Connect to Render**:
   - Visit https://render.com
   - Sign in with GitHub
   - Click "New" → "Blueprint"
   - Select your forked repository

3. **Configure Environment Variables**:
   - Add all variables from [Environment Variables](#environment-variables-detailed)
   - Set `DEBUG=False`
   - Update `ALLOWED_HOSTS` with your Render domain

4. **Deploy**:
   - Render will automatically:
     - Build the backend (Django + FastAPI)
     - Deploy the frontend (static site)
     - Set up PostgreSQL database
     - Configure Redis for Celery

5. **Post-Deployment**:
   ```bash
   # SSH into Render shell
   python manage.py migrate
   python setup_demo_users.py
   ```

### Docker Deployment

```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate
docker-compose exec backend python setup_demo_users.py
```

### Manual Production Deployment

#### Backend (Gunicorn + Uvicorn)

```bash
# Install production dependencies
pip install gunicorn uvicorn[standard]

# Start Django (port 8000)
gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 4

# Start FastAPI (port 8001)
uvicorn fastapi_service.main:app --host 0.0.0.0 --port 8001 --workers 4

# Start Celery worker
celery -A backend worker -l info --concurrency=4

# Start Celery beat (scheduler)
celery -A backend beat -l info
```

#### Frontend (Nginx)

```bash
# Build production bundle
cd frontend
npm run build

# Serve with Nginx
# Copy dist/ folder to /var/www/floatchat
# Configure Nginx to serve static files
```

---

## 🐛 Troubleshooting (Detailed)

### Common Issues & Solutions

#### 1. Database Connection Failed
```
Error: could not connect to server: Connection refused
```
**Solution:**
- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URI` in `.env`
- Ensure pgvector extension is installed:
  ```sql
  CREATE EXTENSION IF NOT EXISTS vector;
  ```

#### 2. Celery Worker Not Starting
```
Error: Cannot connect to redis://localhost:6379/0
```
**Solution:**
- Install and start Redis:
  ```bash
  # Windows (with Chocolatey)
  choco install redis-64
  redis-server
  
  # Linux/Mac
  sudo apt install redis-server  # or brew install redis
  sudo systemctl start redis
  ```

#### 3. FastAPI CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:**
- Update `CORS_ALLOWED_ORIGINS` in `.env`:
  ```bash
  CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
  ```
- Restart FastAPI server

#### 4. NetCDF Upload Fails
```
Error: Invalid NetCDF file format
```
**Solution:**
- Verify file has required variables: `TEMP_ADJUSTED`, `PSAL_ADJUSTED`, `PRES_ADJUSTED`
- Check file size < 500MB
- Ensure Celery worker is running

#### 5. Groq API Rate Limit
```
Error: Rate limit exceeded
```
**Solution:**
- Wait 60 seconds before retrying
- Upgrade Groq API plan for higher limits
- Implement request throttling in frontend

#### 6. WebSocket Connection Closed
```
WebSocket connection to 'ws://localhost:8001/ws/chat' failed
```
**Solution:**
- Verify FastAPI server is running on port 8001
- Check firewall settings
- Use `ws://` for local, `wss://` for production

#### 7. No Data Found in Chatbot
```
⚠️ Cloud database connected but no data found
```
**Solution:**
- Upload NetCDF files via Django admin panel
- Wait for Celery processing to complete
- Check upload status: `GET /api/datasets/{id}/status/`
- Verify measurements exist:
  ```bash
  python manage.py shell
  >>> from dataset_app.models import DatasetValue
  >>> DatasetValue.objects.count()
  ```

---

##  Contributing

We welcome contributions from the community! Here's how you can help:

### Reporting Issues
- Open a GitHub issue with detailed description
- Include error messages, logs, and screenshots
- Specify your environment (OS, Python version, Node version)

### Submitting Pull Requests
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use TypeScript for frontend code
- Write unit tests for new features
- Update documentation for API changes
- Run tests before submitting: `pytest backend/tests/`

---


##  License

This project is licensed under the **MIT License**.

````nMIT License

Copyright (c) 2024 FloatChat Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
````

---


##  Contact & Support

- **GitHub Issues**: https://github.com/NISHAKAR06/FloatChat/issues

---


##  Acknowledgements

- **ARGO Float Program** for providing oceanographic data
- **Groq** for LLaMA-3 API access
- **Neon** for PostgreSQL cloud hosting
- **Anthropic** for Model Context Protocol (MCP)
- **shadcn/ui** for beautiful React components
- **FastAPI** and **Django** communities

---

<div align="center">

**Built with  by the FloatChat Team**

 Star us on GitHub if you find this project useful!

[Report Bug](https://github.com/NISHAKAR06/FloatChat/issues)  [Request Feature](https://github.com/NISHAKAR06/FloatChat/issues)  [Documentation](https://github.com/NISHAKAR06/FloatChat/wiki)

</div>
