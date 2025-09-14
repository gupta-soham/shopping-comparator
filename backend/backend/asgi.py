"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application
from django.urls import re_path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.
django_asgi_app = get_asgi_application()

from .consumers import SearchConsumer

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    # WebSocket handler  
    "websocket": AuthMiddlewareStack(
        URLRouter([
            re_path(r"ws/search/(?P<job_id>\w+)/?$", SearchConsumer.as_asgi()),
        ])
    ),
})
