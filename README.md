# 🛍️ Shopping Comparator

A modern, real-time shopping comparison platform that aggregates product data from multiple Indian e-commerce sites using Google Shopping API via SerpAPI.

## 🎯 Overview

Shopping Comparator is a full-stack web application that allows users to search for products across multiple Indian e-commerce platforms simultaneously. The platform provides real-time price comparison, filtering options and a clean, modern interface for making informed shopping decisions.

### Key Highlights

- **Multi-site Search**: Search across Myntra, Meesho, Nykaa and Fab India simultaneously
- **Real-time Updates**: WebSocket-powered live search progress updates
- **Advanced Filtering**: Price range, category, material and website-specific filters
- **Modern UI**: Clean, responsive React frontend with shadcn/ui components
- **Scalable Backend**: Django REST API with Celery async processing
- **Professional Admin**: Comprehensive backend management interface

## 🛠️ Technology Stack

### Frontend

- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **shadcn/ui** - Beautiful, accessible UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Framer Motion** - Smooth animations and transitions

### Backend

- **Django 5.2** - High-level Python web framework
- **Django REST Framework** - Powerful API toolkit
- **PostgreSQL** - Robust database (development: SQLite)
- **Redis** - Caching and Celery broker
- **Celery** - Asynchronous task processing
- **Channels** - WebSocket support for real-time updates

### External Services

- **SerpAPI** - Google Shopping API integration
- **Google Shopping** - Product data source
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

### Testing & Quality

- **Playwright** - End-to-end browser testing
- **Vitest** - Frontend unit testing
- **Django Test Framework** - Backend testing
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🚀 Development Journey

### Phase 1: Initial Setup & Browser Automation

**Challenge**: Building a web scraper for multiple e-commerce sites

- Explored browser automation with Playwright
- Installed multiple browsers (Chrome, Firefox, WebKit)
- Created initial scraping scripts for Myntra, Meesho, etc.
- **Learning**: Browser automation is complex and fragile
- **Decision**: Pivot to API-based approach for reliability

### Phase 2: API Integration with SerpAPI

**Challenge**: Finding reliable product data sources

- Discovered SerpAPI as Google Shopping API wrapper
- Implemented SerpAPI integration for product search
- Created unified product data structure
- **Learning**: API-based approach is more reliable than scraping
- **Achievement**: Successfully fetching products from all target sites

### Phase 3: Backend Architecture

**Challenge**: Building scalable backend for async processing

- Set up Django project with proper structure
- Implemented Celery for background task processing
- Added Redis for caching and message broker
- Created WebSocket support for real-time updates
- **Learning**: Async processing is crucial for good UX
- **Achievement**: Robust backend handling concurrent searches

### Phase 4: Frontend Development

**Challenge**: Creating modern, responsive UI

- Built React application with TypeScript
- Integrated shadcn/ui component library
- Implemented real-time search with WebSocket
- Added advanced filtering and sorting
- **Learning**: Component composition and state management
- **Achievement**: Professional, user-friendly interface

### Phase 5: Multi-Site Search Logic

**Challenge**: Searching multiple sites efficiently

- **Bug**: Only first site was being searched
- **Root Cause**: Incorrect loop implementation in search service
- **Fix**: Modified to make separate API calls per site
- **Optimization**: Reduced results per site to maintain performance
- **Testing**: Comprehensive Playwright E2E tests
- **Achievement**: All 4 sites searched simultaneously

### Phase 6: UI/UX Improvements

**Challenge**: Backend UI was basic and unprofessional

- Created modern dashboard with system monitoring
- Built comprehensive API documentation interface
- Enhanced Django admin with custom branding
- Added responsive design and animations
- **Learning**: Professional UI matters for developer experience
- **Achievement**: Clean, minimal backend management interface

### Phase 7: Code Quality & Testing

**Challenge**: Ensuring reliability and maintainability

- Implemented comprehensive test suite
- Added error handling and logging
- Code cleanup and documentation
- Performance optimizations
- **Learning**: Testing is crucial for complex async systems
- **Achievement**: Robust, well-tested application

## ✨ Features

### 🔍 Core Search Features

- **Multi-site Search**: Search across 4 major Indian e-commerce platforms
- **Real-time Results**: Live progress updates via WebSocket
- **Advanced Filters**: Price range, category, material, website filters
- **Smart Sorting**: Sort by price, name, rating, or site
- **Product Details**: Comprehensive product information display

### 🎨 User Interface

- **Modern Design**: Clean, professional interface with animations
- **Responsive Layout**: Works perfectly on all device sizes
- **Loading States**: Smooth loading animations and skeletons
- **Error Handling**: User-friendly error messages and recovery

### ⚙️ Backend Management

- **Admin Dashboard**: System monitoring and quick actions
- **API Documentation**: Interactive API reference
- **Django Admin**: Professional data management interface
- **Health Checks**: System status monitoring
- **Logs & Analytics**: Comprehensive logging and monitoring

### 🔧 Technical Features

- **Async Processing**: Celery-powered background tasks
- **Caching**: Redis-based response caching
- **WebSocket**: Real-time communication
- **Docker Support**: Containerized deployment
- **API-First**: RESTful API design

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Django Backend │    │   External APIs │
│                 │    │                 │    │                 │
│  • Search Form  │◄──►│  • REST API     │◄──►│  • SerpAPI      │
│  • Results Table│    │  • WebSocket    │    │  • Google       │
│  • Real-time UI │    │  • Celery Tasks │    │    Shopping     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   WebSocket     │    │     Redis       │    │   PostgreSQL    │
│   Updates       │    │  • Cache        │    │  • Product Data │
│                 │    │  • Celery Broker│    │  • Search Jobs  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow

1. **User Search** → Frontend sends search request
2. **Job Creation** → Backend creates Celery task
3. **API Calls** → SerpAPI fetches data from Google Shopping
4. **Processing** → Results parsed and stored
5. **Real-time Updates** → WebSocket broadcasts progress
6. **Display** → Frontend shows results with filtering

## 🔧 Production Configuration

### Docker Production Features

- **Optimized Builds**: Multi-stage Docker builds for smaller production images
- **Health Monitoring**: Built-in health checks for all services
- **Environment Security**: Centralized configuration with secure Redis authentication
- **Production Frontend**: Nginx serving optimized React build with proper caching
- **Service Dependencies**: Proper startup order and health-based service dependencies
- **Resource Limits**: Configured memory and CPU limits for production stability

### Environment Architecture

```text
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Root .env     │    │  Docker Compose │    │   Services      │
│                 │    │                 │    │                 │
│  • All configs  │───►│  • Environment  │───►│  • Frontend     │
│  • VITE vars    │    │    variables    │    │    (nginx)      │
│  • Secrets      │    │  • Service deps │    │  • Backend      │
└─────────────────┘    └─────────────────┘    │    (Django)     │
                                              │  • Redis        │
                                              │  • Celery       │
                                              └─────────────────┘
```

### Security Enhancements

- **Redis Authentication**: Password-protected Redis instance
- **Environment Variables**: All sensitive data externalized
- **CORS Configuration**: Properly configured for production domains
- **Secret Management**: Secure key management for production deployments

## 🚀 Setup & Installation

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for frontend development)
- Python 3.11+ (for backend development)

### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/gupta-soham/shopping-comparator
cd shopping-comparator

# Copy environment file
cp .env.example .env

# Edit environment variables (add your SerpAPI key)
# nano .env  # or your preferred editor

# Build and start all services
docker-compose up --build -d

# Access the application
# Frontend: http://localhost (port 80)
# Backend API: http://localhost:8000
# Admin: http://localhost:8000/admin
# API Docs: http://localhost:8000/api/docs/
```

### Production Deployment

For production deployment, update your `.env` file with production values:

```env
# Production settings
DEBUG=False
SECRET_KEY=your-secure-production-secret-key-here
ALLOWED_HOSTS=your-production-domain.com
CORS_ALLOWED_ORIGINS=https://your-production-domain.com
VITE_API_BASE_URL=https://your-production-domain.com
VITE_WS_BASE_URL=wss://your-production-domain.com
```

Then deploy with:

```bash
docker-compose up -d --build
```

### Manual Development Setup

#### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start Redis (if not using Docker)
redis-server

# Start Celery worker
celery -A backend worker -l info

# Start Django server
python manage.py runserver
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

#### Root .env Configuration

Copy `.env.example` to `.env` and configure the following variables:

```env
# SerpApi Configuration
SERPAPI_KEY=your-serpapi-key-here

# Redis Configuration
REDIS_PASSWORD=your_secure_redis_password

# Django Configuration
SECRET_KEY=your-secret-key-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost,http://127.0.0.1
CORS_ALLOW_CREDENTIALS=True
CORS_ALLOWED_METHODS=GET,POST,PUT,PATCH,DELETE,OPTIONS

# Frontend Configuration (passed to React app)
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000

# Database Configuration (SQLite for dev, PostgreSQL for prod)
# DATABASE_URL=postgresql://user:password@localhost:5432/shopping_comparator
```

**Important Notes:**

- Get your free SerpAPI key from [serpapi.com](https://serpapi.com/)
- Change `SECRET_KEY` to a secure random string in production
- Update `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` for your production domain
- `VITE_API_BASE_URL` and `VITE_WS_BASE_URL` are automatically passed to the frontend container
- Redis password is used internally by Docker Compose for service communication

## 📚 API Documentation

### Search Endpoints

#### POST /api/search/

Create a new search job

```json
{
  "prompt": "cotton kurta",
  "sites": ["myntra", "meesho", "nykaa", "fabindia"],
  "filters": {
    "min_price": 500,
    "max_price": 2000,
    "category": "clothing"
  }
}
```

#### GET /api/search/{job_id}/

Get search results and status

```json
{
  "status": "completed",
  "results": [...],
  "logs": [...]
}
```

### WebSocket Events

- `search_started`: Search job initiated
- `progress`: Search progress updates
- `search_completed`: Search finished with results

## 🧪 Testing

### End-to-End Testing with Playwright

```bash
# Install browsers
npx playwright install

# Run E2E tests
npx playwright test

# Run with UI
npx playwright test --ui
```

### Frontend Unit Tests

```bash
cd frontend
npm run test
```

### Backend Tests

```bash
cd backend
python manage.py test
```

### Test Coverage

- Multi-site search functionality
- Real-time WebSocket updates
- Filter and sort operations
- Error handling scenarios
- API endpoint validation

## 🚢 Deployment

### Production Docker Setup

The application is fully containerized and production-ready with:

- **Multi-stage builds** for optimized frontend images
- **Health checks** for all services
- **Environment-based configuration** via single .env file
- **Nginx production server** for frontend static files
- **Redis authentication** for security
- **Proper service dependencies** and networking

```bash
# For production deployment, update your .env file:
# DEBUG=False
# ALLOWED_HOSTS=your-production-domain.com
# CORS_ALLOWED_ORIGINS=https://your-production-domain.com
# VITE_API_BASE_URL=https://your-production-domain.com
# VITE_WS_BASE_URL=wss://your-production-domain.com
# SECRET_KEY=your-secure-production-secret-key

# Build and start all services
docker-compose up -d --build

# Or for a specific environment
docker-compose -f docker-compose.yml up -d
```

### Environment Setup for Production

```env
# Production .env settings
DEBUG=False
SECRET_KEY=your-secure-production-secret-key
ALLOWED_HOSTS=your-app-name.com,your-custom-domain.com
CORS_ALLOWED_ORIGINS=https://your-app-name.com,https://your-custom-domain.com
VITE_API_BASE_URL=https://your-app-name.com
VITE_WS_BASE_URL=wss://your-app-name.com
```

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

### Code Standards

- **Backend**: Follow Django best practices
- **Frontend**: Use TypeScript and React best practices
- **Testing**: Maintain >80% test coverage
- **Documentation**: Update docs for API changes

### Commit Convention

```bash
feat: add new search filter
fix: resolve multi-site search bug
docs: update API documentation
test: add E2E test for search functionality
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ using Django, React and modern web technologies
