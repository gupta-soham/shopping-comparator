import logging
import asyncio
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .services.search_service import SearchService

logger = logging.getLogger(__name__)


@shared_task
def scrape_products_task(job_id: str, prompt: str, sites: list, filters: dict):
    """Celery task for searching products using Google Shopping API"""
    import django
    from django.conf import settings

    # Ensure Django is properly set up for Celery worker
    django.setup()

    search_service = SearchService()

    # Update status to running
    search_service.update_search_status(job_id, 'running')

    logger.info(f"Starting Google Shopping search for job {job_id}")

    try:
        # Execute search using Google Shopping API (now synchronous)
        success = search_service.execute_search(job_id)

        if success:
            logger.info(f"Google Shopping search completed for job {job_id}")
        else:
            logger.warning(f"Google Shopping search failed for job {job_id}")

    except Exception as e:
        logger.error(f"Search task failed for job {job_id}: {str(e)}")
        try:
            search_service = SearchService()
            search_service.update_search_status(job_id, 'failed', str(e))
        except:
            pass


def _send_websocket_update(job_id: str, status: str, results: list):
    """Send WebSocket update to clients - DEPRECATED: Using polling instead"""
    # This function is no longer used since we switched to polling-based updates
    pass


@shared_task
def cleanup_expired_jobs():
    """Periodic task to clean up expired search jobs and products"""
    try:
        search_service = SearchService()

        # Clean up expired jobs (older than 24 hours)
        deleted_count = search_service.cleanup_expired_searches()

        logger.info(f"Cleaned up {deleted_count} expired search jobs")

    except Exception as e:
        logger.error(f"Failed to cleanup expired jobs: {str(e)}")
