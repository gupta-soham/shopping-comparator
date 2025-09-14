import logging
import os
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from serpapi import GoogleSearch
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)


@dataclass
class ProductResult:
    title: str
    price: float
    image_url: str
    product_url: str
    site: str
    confidence: float
    size: Optional[str] = None
    material: Optional[str] = None
    rating: Optional[float] = None
    reviews_count: Optional[int] = None


class GoogleSearchService:
    """Simplified search service using SerpApi for Google Shopping results"""
    
    def __init__(self):
        # Get SerpApi key from environment or settings
        self.api_key = getattr(settings, 'SERPAPI_KEY', os.environ.get('SERPAPI_KEY'))
        if not self.api_key:
            logger.warning("SERPAPI_KEY not configured. Search functionality will be limited.")
    
    def build_search_query(self, query: str, filters: Dict[str, Any], site: Optional[str] = None) -> str:
        """Build enhanced search query with filters and site-specific terms"""
        search_parts = [query]
        
        # Add site name naturally (no site: operator for Google Shopping)
        if site:
            # Add site name to search query to improve relevance
            search_parts.append(site)
        
        # Add size filter
        if filters.get('size'):
            sizes = filters['size'] if isinstance(filters['size'], list) else [filters['size']]
            for size in sizes:
                search_parts.append(f"size {size}")
        
        # Add material filter
        if filters.get('material'):
            materials = filters['material'] if isinstance(filters['material'], list) else [filters['material']]
            material_query = " OR ".join([f'"{mat}"' for mat in materials])
            search_parts.append(f"({material_query})")
        
        return " ".join(search_parts)
    
    def extract_price(self, price_str: str) -> float:
        """Extract numeric price from price string, handling Indian currency format"""
        if not price_str:
            return 0.0
        
        try:
            # Handle extracted_price field from API response
            if isinstance(price_str, (int, float)):
                return float(price_str)
            
            # Remove currency symbols and extract numbers
            import re
            # Handle Indian currency format: ₹1,999 or ₹15,399
            price_match = re.search(r'[\d,]+\.?\d*', str(price_str).replace(',', ''))
            if price_match:
                return float(price_match.group())
        except (ValueError, AttributeError) as e:
            logger.debug(f"Failed to extract price from '{price_str}': {e}")
            pass
        
        return 0.0
    
    def parse_shopping_results(self, results: Dict, site_filter: Optional[str] = None) -> List[ProductResult]:
        """Parse SerpApi shopping results into ProductResult objects"""
        products = []
        
        # Check for shopping results
        shopping_results = results.get('shopping_results', [])
        logger.info(f"Processing {len(shopping_results)} shopping results")
        
        for item in shopping_results:
            try:
                title = item.get('title', '')
                price_str = item.get('price', '')
                price = self.extract_price(price_str)
                
                # Skip if no price found and log it
                if not price:
                    logger.debug(f"Skipping item without price: {title}")
                    continue
                
                # Extract site from source or link
                site = item.get('source', '')  # Use 'source' field from API response
                if not site:
                    # Fallback to extracting from link
                    link = item.get('product_link', item.get('link', ''))
                    site = self.extract_site_from_url(link)
                
                # Apply site filter if specified
                if site_filter and site_filter.lower() not in site.lower():
                    continue
                
                # Extract rating and reviews
                rating = None
                reviews_count = None
                if 'rating' in item and item['rating']:
                    try:
                        rating = float(item['rating'])
                    except (ValueError, TypeError):
                        pass
                if 'reviews' in item and item['reviews']:
                    try:
                        reviews_count = int(item['reviews'])
                    except (ValueError, TypeError):
                        pass
                
                # Use product_link instead of link
                product_url = item.get('product_link', item.get('link', ''))
                
                product = ProductResult(
                    title=title,
                    price=price,
                    image_url=item.get('thumbnail', item.get('serpapi_thumbnail', '')),
                    product_url=product_url,
                    site=site.lower(),
                    confidence=0.9,  # High confidence for Google Shopping results
                    rating=rating,
                    reviews_count=reviews_count
                )
                
                products.append(product)
                logger.debug(f"Added product: {title} - {site} - ₹{price}")
                
            except Exception as e:
                logger.error(f"Error parsing shopping result: {e}")
                logger.debug(f"Problematic item: {item}")
                continue
        
        # Also check for inline products (less common in Google Shopping)
        inline_products = results.get('inline_products', [])
        logger.info(f"Processing {len(inline_products)} inline products")
        
        for item in inline_products:
            try:
                title = item.get('title', '')
                price_str = item.get('price', '')
                price = self.extract_price(price_str)
                
                if not price:
                    continue
                
                link = item.get('link', '')
                site = self.extract_site_from_url(link)
                
                if site_filter and site_filter.lower() not in site.lower():
                    continue
                
                product = ProductResult(
                    title=title,
                    price=price,
                    image_url=item.get('thumbnail', ''),
                    product_url=link,
                    site=site.lower(),
                    confidence=0.8
                )
                
                products.append(product)
                
            except Exception as e:
                logger.error(f"Error parsing inline product: {e}")
                continue
        
        logger.info(f"Successfully parsed {len(products)} products from API response")
        return products
    
    def extract_site_from_url(self, url: str) -> str:
        """Extract site name from URL"""
        try:
            from urllib.parse import urlparse
            domain = urlparse(url).netloc.lower()
            
            if 'meesho' in domain:
                return 'meesho'
            elif 'nykaa' in domain:
                return 'nykaa'
            elif 'myntra' in domain:
                return 'myntra'
            elif 'fabindia' in domain:
                return 'fabindia'
            else:
                return domain.replace('www.', '')
        except:
            return 'unknown'
    
    def filter_by_price(self, products: List[ProductResult], min_price: Optional[float] = None, max_price: Optional[float] = None) -> List[ProductResult]:
        """Filter products by price range"""
        filtered = []
        for product in products:
            if min_price and product.price < min_price:
                continue
            if max_price and product.price > max_price:
                continue
            filtered.append(product)
        return filtered
    
    def search_products(self, query: str, sites: List[str], filters: Dict[str, Any]) -> List[ProductResult]:
        """Search for products using Google Shopping via SerpApi (multiple calls for all selected sites)"""
        if not self.api_key:
            logger.error("SerpApi key not configured")
            return []
        
        cache_key = f"google_search:{hash(query + str(sorted(sites)) + str(sorted(filters.items())))}"
        cached_results = cache.get(cache_key)
        
        if cached_results:
            logger.info(f"Returning cached Google search results for query: {query}")
            return cached_results
        
        all_products = []
        
        try:
            # Make API calls for each selected site to ensure we get results from all sites
            for site in sites:
                logger.info(f"Making Google Shopping API call for: {query} (site: {site})")
                
                search_query = self.build_search_query(query, filters, site)
                
                params = {
                    "engine": "google_shopping",
                    "q": search_query,
                    "location": "India",
                    "hl": "en",
                    "gl": "in",
                    "api_key": self.api_key,
                    "num": 15,  # Get fewer results per site since we're calling multiple times
                    "tbm": "shop"
                }
                
                # Add price filter if specified
                if filters.get('min_price') or filters.get('max_price'):
                    if filters.get('min_price'):
                        params['min_price'] = filters['min_price']
                    if filters.get('max_price'):
                        params['max_price'] = filters['max_price']
                
                search = GoogleSearch(params)
                results = search.get_dict()
                
                logger.info(f"API Response received for {site}. Status: {results.get('search_metadata', {}).get('status', 'Unknown')}")
                logger.info(f"Shopping results count for {site}: {len(results.get('shopping_results', []))}")
                
                # Parse results from this site
                site_products = self.parse_shopping_results(results, site_filter=site)
                all_products.extend(site_products)
                
                logger.info(f"Added {len(site_products)} products from {site}")
            
            # Apply additional price filtering
            if filters.get('min_price') or filters.get('max_price'):
                all_products = self.filter_by_price(
                    all_products, 
                    filters.get('min_price'), 
                    filters.get('max_price')
                )
            
            logger.info(f"Found {len(all_products)} products total after filtering")
        
        except Exception as e:
            logger.error(f"Error in Google Shopping search: {e}")
            return []
        
        # Sort by confidence and price
        all_products.sort(key=lambda x: (x.confidence, -x.price), reverse=True)
        
        # Cache results for 1 hour
        cache.set(cache_key, all_products, 3600)
        
        logger.info(f"Google Shopping search completed: {len(all_products)} total products found")
        return all_products
