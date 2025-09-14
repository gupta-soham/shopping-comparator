import json
import logging
from typing import Dict, Any
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.views import View
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services.search_service import SearchService

logger = logging.getLogger(__name__)


class SearchView(APIView):
    """API view for search operations"""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.search_service = SearchService()

    def post(self, request):
        """Create a new search job"""
        try:
            data = request.data

            # Validate required fields
            if 'prompt' not in data:
                return Response(
                    {'error': 'prompt is required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            prompt = data['prompt']
            sites = data.get('sites', ['google_shopping'])  # Default to Google Shopping
            filters = data.get('filters', {})

            # Validate prompt
            if not isinstance(prompt, str) or not prompt.strip():
                return Response(
                    {'error': 'prompt must be a non-empty string'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Validate and process filters
            validated_filters = self._validate_filters(filters)

            # Create search job
            job_id = self.search_service.create_search_job(prompt, sites, validated_filters)

            # Start searching asynchronously
            self._start_search_async(job_id, prompt, sites, validated_filters)

            return Response(
                {'job_id': job_id},
                status=status.HTTP_202_ACCEPTED
            )

        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Error creating search job: {str(e)}")
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _validate_filters(self, filters: dict) -> dict:
        """Validate and normalize filter parameters"""
        validated = {}

        # Size filter (XS, S, M, L, XL, XXL)
        if 'size' in filters:
            size = filters['size']
            valid_sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL']
            if isinstance(size, str) and size.upper() in valid_sizes:
                validated['size'] = size.upper()
            elif isinstance(size, list):
                valid_selected_sizes = [s.upper() for s in size if isinstance(s, str) and s.upper() in valid_sizes]
                if valid_selected_sizes:
                    validated['size'] = valid_selected_sizes

        # Price filter (min_price, max_price)
        if 'min_price' in filters:
            try:
                min_price = float(filters['min_price'])
                if min_price >= 0:
                    validated['min_price'] = min_price
            except (ValueError, TypeError):
                pass

        if 'max_price' in filters:
            try:
                max_price = float(filters['max_price'])
                if max_price >= 0:
                    validated['max_price'] = max_price
            except (ValueError, TypeError):
                pass

        # Material filter (cotton, silk, polyester, linen, denim)
        if 'material' in filters:
            material = filters['material']
            valid_materials = ['cotton', 'silk', 'polyester', 'linen', 'denim']
            if isinstance(material, str) and material.lower() in valid_materials:
                validated['material'] = material.lower()
            elif isinstance(material, list):
                valid_selected_materials = [m.lower() for m in material if isinstance(m, str) and m.lower() in valid_materials]
                if valid_selected_materials:
                    validated['material'] = valid_selected_materials

        # Rating filter (minimum rating)
        if 'min_rating' in filters:
            try:
                min_rating = float(filters['min_rating'])
                if 0 <= min_rating <= 5:
                    validated['min_rating'] = min_rating
            except (ValueError, TypeError):
                pass

        return validated

    def _start_search_async(self, job_id: str, prompt: str, sites: list, filters: Dict[str, Any]):
        """Start searching using Celery task"""
        from .tasks import scrape_products_task

        # Start Celery task
        scrape_products_task.delay(job_id, prompt, sites, filters)  # type: ignore


class SearchDetailView(APIView):
    """API view for getting search job status"""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.search_service = SearchService()

    def get(self, request, job_id):
        """Get search job status and results"""
        try:
            result = self.search_service.get_search_status(job_id)

            if result is None:
                return Response(
                    {'error': 'Job not found'},
                    status=status.HTTP_404_NOT_FOUND
                )

            return Response(result, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error getting search status for job {job_id}: {str(e)}")
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class HealthCheckView(APIView):
    """API view for health check"""

    def get(self, request):
        """Return health status"""
        return Response(
            {
                'status': 'healthy',
                'timestamp': timezone.now().isoformat(),
                'service': 'shopping-comparator-backend'
            },
            status=status.HTTP_200_OK
        )


class APIDocsView(APIView):
    """API documentation view"""

    def get(self, request):
        """Return API documentation page"""
        context = {
            'timestamp': timezone.now().isoformat(),
            'service': 'shopping-comparator-backend',
            'version': '1.0.0'
        }
        return render(request, 'api_docs.html', context)


class HomeView(APIView):
    """Home view for the root URL"""

    def get(self, request):
        """Return dashboard page"""
        context = {
            'timestamp': timezone.now().isoformat(),
            'service': 'shopping-comparator-backend',
            'version': '1.0.0',
            'endpoints': {
                'api_search': '/api/search/',
                'api_health': '/api/health/',
                'admin': '/admin/',
                'websocket': 'ws://localhost:8000/ws/search/{job_id}/'
            }
        }
        return render(request, 'dashboard.html', context)