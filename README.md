# Shopping Comparator AI

A real-time AI-powered shopping comparison tool that scrapes multiple e-commerce sites to find the best deals on clothing and fashion items.

## Features

- **Real-time Search**: Instant product search across multiple e-commerce platforms
- **AI-Powered**: Intelligent product matching and filtering
- **WebSocket Integration**: Live progress updates during searches
- **Asynchronous Processing**: Fast, non-blocking search operations using Celery
- **Performance Optimized**: Parallel scraping with caching for <5s response times
- **Modern UI**: React-based frontend with responsive design
- **Docker Ready**: Complete containerized deployment

## Architecture

### Backend (Django + Channels)

- **Django 5.2.6**: REST API with WebSocket support
- **Channels**: Real-time WebSocket communication
- **Celery + Redis**: Asynchronous task processing
- **Playwright**: Headless browser automation for scraping
- **SQLite**: Database for development (easily configurable for production)

### Frontend (React + TypeScript)

- **React 19**: Modern component-based UI
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Native WebSocket**: Real-time updates without external libraries

### Infrastructure

- **Docker Compose**: Complete development and production setup
- **Redis**: Caching and message broker
- **Nginx**: Reverse proxy for production

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd shopping-comparator
   ```

2. **Start the development environment**

   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin/

### Manual Setup (Without Docker)

If you prefer to run locally without Docker, follow these steps:

#### Prerequisites

- Python 3.11+
- Node.js 18+
- Redis Server
- Git

#### 1. Install Redis

**Windows:**

```bash
# Using Chocolatey
choco install redis-64

# Or download from: https://redis.io/download
# Start Redis server
redis-server
```

**macOS:**

```bash
brew install redis
brew services start redis
```

**Linux:**

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from existing or create new)
cp .env.example .env  # If you have an example file
# Or create manually with the content shown below

# Run database migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start Django server
python manage.py runserver 8000
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

#### 4. Start Celery Worker (in separate terminal)

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
celery -A backend worker --pool=solo --loglevel=info
```

#### Environment Configuration (.env file)

Create a `.env` file in the `backend` directory:

```env
# Django Configuration
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CORS_ALLOW_CREDENTIALS=True

# Redis Configuration (for local Redis)
REDIS_URL=redis://localhost:6379

# Celery Configuration
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

#### Services Overview

- **Database**: SQLite (automatic, no setup required)
- **Redis**: Required for task queuing (Celery) and WebSocket connections
- **Celery**: Handles asynchronous scraping tasks
- **Django Channels**: Provides WebSocket support for real-time updates

#### Running All Services

You'll need **4 terminals** to run everything locally:

1. **Terminal 1 - Backend**: `cd backend && source venv/bin/activate && python manage.py runserver`
2. **Terminal 2 - Frontend**: `cd frontend && npm run dev`
3. **Terminal 3 - Celery**: `cd backend && source venv/bin/activate && celery -A backend worker --loglevel=info`
4. **Terminal 4 - Redis**: `redis-server` (if not running as service)

#### Access Points

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Django Admin: http://localhost:8000/admin/

## API Documentation

### REST Endpoints

#### POST /api/search

Initiate a new product search.

**Request Body:**

```json
{
  "prompt": "Find red cotton shirts for men",
  "sites": ["meesho", "myntra", "fabindia"],
  "filters": {
    "price_min": 20,
    "price_max": 100,
    "size": "M"
  }
}
```

**Response:**

```json
{
  "job_id": "abc123",
  "status": "running",
  "message": "Search initiated successfully"
}
```

#### GET /api/search/{job_id}

Get search results and status.

**Response:**

```json
{
  "status": "completed",
  "results": [
    {
      "title": "Red Cotton Shirt",
      "price": 29.99,
      "size": "M",
      "material": "cotton",
      "image_url": "https://example.com/image.jpg",
      "product_url": "https://example.com/product/123",
      "site": "amazon",
      "confidence": 0.95
    }
  ],
  "logs": [
    "Search job created and queued for processing",
    "Searching amazon...",
    "Found 15 products on amazon"
  ]
}
```

### WebSocket Integration

Connect to `ws://localhost:8000/ws/search/{job_id}/` for real-time updates.

**Message Format:**

```json
{
  "type": "search_update",
  "data": {
    "status": "running",
    "progress": 75,
    "message": "Scraping completed for amazon"
  }
}
```

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=sqlite:///db.sqlite3

# Redis
REDIS_URL=redis://redis:6379

# Celery
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
```

### Supported Sites

Add new e-commerce sites by creating Site objects in the admin panel:

- **Name**: Unique identifier (e.g., "amazon")
- **Base URL**: Site domain (e.g., "https://amazon.com")
- **Search Path**: URL pattern with {query} placeholder (e.g., "/s?k={query}")
- **Active**: Enable/disable the site

## Development

### Code Quality

```bash
# Backend linting
cd backend
python -m flake8 .

# Frontend linting
cd frontend
npm run lint
```

### Database Management

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

## Deployment

### Production Setup

1. **Update settings for production**

   ```python
   DEBUG = False
   ALLOWED_HOSTS = ['your-domain.com']
   ```

2. **Use PostgreSQL for production**

   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': 'shopping_comparator',
           'USER': 'db_user',
           'PASSWORD': 'db_password',
           'HOST': 'localhost',
           'PORT': '5432',
       }
   }
   ```

3. **Build and deploy**
   ```bash
   docker-compose -f docker-compose.prod.yml up --build
   ```

### Docker Production Configuration

```yaml
# docker-compose.prod.yml
version: "3.8"
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - DEBUG=False
      - SECRET_KEY=your-production-secret
    volumes:
      - static:/app/static
      - media:/app/media

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    volumes:
      - static:/app/static

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - static:/app/static
    depends_on:
      - backend
      - frontend
```

## Performance Optimization

### Caching Strategy

- Search results cached for 10 minutes
- Browser connections reused within 5-minute windows
- Parallel scraping limited to 3 concurrent sites

### Monitoring

- Celery Flower: http://localhost:5555 (development)
- Django Admin: Real-time job monitoring
- WebSocket: Live progress tracking

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failed**

   - Ensure Redis is running
   - Check ASGI configuration
   - Verify firewall settings

2. **Scraping Timeout**

   - Increase timeout in scraping service
   - Check network connectivity
   - Verify site availability

3. **Database Connection Error**
   - Ensure database service is running
   - Check connection credentials
   - Verify database migrations

### Logs

```bash
# View backend logs
docker-compose logs backend

# View Celery logs
docker-compose logs celery

# View Redis logs
docker-compose logs redis
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes

4. Submit a pull request

### Code Style

- Backend: PEP 8
- Frontend: ESLint configuration
- Commit messages: Conventional commits

## License

MIT License - see LICENSE file for details.

## Support

For support and questions:

- Create an issue on GitHub
- Check the documentation
- Review the troubleshooting section
