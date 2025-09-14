import uuid
import logging
from typing import List, Dict, Any, Optional
from django.utils import timezone
from django.db import transaction
from ..models import Search, Product, Site
from .google_search_service import GoogleSearchService

logger = logging.getLogger(__name__)


class SearchService:
    """Service for managing search jobs using Google Shopping"""

    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.google_service = GoogleSearchService()

    def create_search_job(self, prompt: str, sites: List[str], filters: Optional[Dict[str, Any]] = None) -> str:
        """
        Create a new search job

        Args:
            prompt: User's natural language search prompt
            sites: List of site names to search
            filters: Optional filters dictionary (size, material, min_price, max_price)

        Returns:
            Job ID as string

        Raises:
            ValueError: If validation fails
        """
        # Validate inputs
        if not prompt or not prompt.strip():
            raise ValueError("Prompt is required")

        if not sites or len(sites) == 0:
            raise ValueError("At least one site must be specified")

        # Validate sites exist and are active
        valid_sites = set(Site.objects.filter(name__in=sites, active=True).values_list('name', flat=True))
        invalid_sites = set(sites) - valid_sites

        if invalid_sites:
            raise ValueError(f"Invalid or inactive sites: {', '.join(invalid_sites)}")

        # Create search job
        with transaction.atomic():
            search = Search.objects.create(
                prompt=prompt.strip(),
                sites=list(valid_sites),  # Only include valid sites
                filters=filters or {}
            )

        job_id = str(search.id)
        self.logger.info(f"Created search job {job_id} for prompt: {prompt[:50]}...")

        return job_id

    def execute_search(self, job_id: str) -> bool:
        """Execute the search using Google Shopping API"""
        try:
            search = Search.objects.get(id=job_id)
        except Search.DoesNotExist:
            return False

        try:
            # Update status to running
            search.status = 'running'
            search.save()
            
            self.logger.info(f"Executing search {job_id}: {search.prompt}")
            
            # Perform Google Shopping search
            product_results = self.google_service.search_products(
                query=search.prompt,
                sites=search.sites,
                filters=search.filters
            )
            
            # Save products to database
            saved_count = 0
            with transaction.atomic():
                for product_result in product_results:
                    try:
                        Product.objects.create(
                            search=search,
                            title=product_result.title,
                            price=product_result.price,
                            size=product_result.size or '',
                            material=product_result.material or '',
                            image_url=product_result.image_url,
                            product_url=product_result.product_url,
                            site=product_result.site,
                            confidence=product_result.confidence,
                            rating=product_result.rating,
                            reviews_count=product_result.reviews_count
                        )
                        saved_count += 1
                    except Exception as e:
                        self.logger.error(f"Error saving product: {e}")
                        continue
            
            # Update search status
            if saved_count > 0:
                search.status = 'completed'
                self.logger.info(f"Search {job_id} completed with {saved_count} products")
            else:
                search.status = 'failed'
                self.logger.warning(f"Search {job_id} failed - no products found")
            
            search.save()
            return True
            
        except Exception as e:
            self.logger.error(f"Error executing search {job_id}: {e}")
            search.status = 'failed'
            search.save()
            return False

    def get_search_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        """
        Get search job status and results

        Args:
            job_id: Search job ID

        Returns:
            Dictionary with status, results, and logs, or None if not found
        """
        try:
            search = Search.objects.select_related().get(id=job_id)
        except Search.DoesNotExist:
            return None

        # Get products for this search
        products = Product.objects.filter(search=search).order_by('-confidence', 'price')

        results = []
        for product in products:
            results.append({
                'title': product.title,
                'price': float(product.price),
                'size': product.size,
                'material': product.material,
                'image_url': product.image_url,
                'product_url': product.product_url,
                'site': product.site,
                'confidence': product.confidence,
                'rating': product.rating,
                'reviews_count': product.reviews_count,
            })

        # Generate logs based on status
        logs = self._generate_logs(search, results)

        return {
            'status': search.status,
            'results': results,
            'logs': logs,
        }

    def update_search_status(self, job_id: str, status: str, error_message: Optional[str] = None) -> bool:
        """
        Update search job status

        Args:
            job_id: Search job ID
            status: New status ('running', 'completed', 'failed')
            error_message: Optional error message for failed status

        Returns:
            True if updated, False if job not found
        """
        try:
            search = Search.objects.get(id=job_id)
            search.status = status
            search.save()

            if status == 'failed' and error_message:
                self.logger.error(f"Search job {job_id} failed: {error_message}")
            else:
                self.logger.info(f"Search job {job_id} status updated to: {status}")

            return True
        except Search.DoesNotExist:
            return False

    def add_search_results(self, job_id: str, products: List[Dict[str, Any]]) -> bool:
        """
        Add products to a search job

        Args:
            job_id: Search job ID
            products: List of product dictionaries

        Returns:
            True if added successfully, False if job not found
        """
        try:
            search = Search.objects.get(id=job_id)
        except Search.DoesNotExist:
            return False

        with transaction.atomic():
            for product_data in products:
                Product.objects.create(
                    search=search,
                    title=product_data['title'],
                    price=product_data['price'],
                    size=product_data.get('size', ''),
                    material=product_data.get('material', ''),
                    image_url=product_data['image_url'],
                    product_url=product_data['product_url'],
                    site=product_data['site'],
                    confidence=product_data.get('confidence', 1.0),
                    rating=product_data.get('rating'),
                    reviews_count=product_data.get('reviews_count'),
                )

        self.logger.info(f"Added {len(products)} products to search job {job_id}")
        return True

    def cleanup_expired_searches(self) -> int:
        """
        Clean up expired search jobs and their products

        Returns:
            Number of searches deleted
        """
        expired_searches = Search.objects.filter(expires_at__lt=timezone.now())

        deleted_count = 0
        for search in expired_searches:
            # Products will be deleted automatically due to CASCADE
            search.delete()
            deleted_count += 1

        if deleted_count > 0:
            self.logger.info(f"Cleaned up {deleted_count} expired search jobs")

        return deleted_count

    def _generate_logs(self, search: Search, results: List[Dict[str, Any]]) -> List[str]:
        """Generate logs based on search status and results"""
        logs = []

        if search.status == 'pending':
            logs.append("Search job created and queued for processing")
        elif search.status == 'running':
            logs.append("Search in progress using Google Shopping")
            for site in search.sites:
                logs.append(f"Searching {site}...")
        elif search.status == 'completed':
            logs.append(f"Search completed successfully. Found {len(results)} products")
            if results:
                # Group by site
                site_counts = {}
                for result in results:
                    site = result['site']
                    site_counts[site] = site_counts.get(site, 0) + 1

                for site, count in site_counts.items():
                    logs.append(f"Found {count} products on {site}")
        elif search.status == 'failed':
            logs.append("Search failed. Please try again.")

        return logs