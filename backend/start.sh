#!/bin/bash

# Run Django migrations
echo "Running migrations..."
python manage.py migrate

# Start the application
echo "Starting Django application..."
exec daphne -b 0.0.0.0 -p 8000 backend.asgi:application
