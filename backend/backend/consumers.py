import json
import logging
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

logger = logging.getLogger(__name__)


class SearchConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for search job updates"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.job_id = None
        self.monitoring = False

    async def connect(self):
        """Handle WebSocket connection"""
        from .services.search_service import SearchService
        
        self.job_id = self.scope['url_route']['kwargs']['job_id']
        self.room_group_name = f'search_{self.job_id}'
        self.search_service = SearchService()

        await self.accept()
        logger.info(f"WebSocket connected for job {self.job_id}")

        # Start monitoring for updates
        self.monitoring = True
        asyncio.create_task(self.monitor_search_updates())

    async def disconnect(self, code):
        """Handle WebSocket disconnection"""
        self.monitoring = False
        logger.info(f"WebSocket disconnected for job {self.job_id}")

    async def monitor_search_updates(self):
        """Monitor search job for updates and send them to client"""
        if not self.job_id:
            logger.error("No job_id available for monitoring")
            return
            
        last_status = None
        last_results_count = 0

        while self.monitoring:
            try:
                # Get current search status using sync_to_async
                result = await database_sync_to_async(self.search_service.get_search_status)(self.job_id)

                if result:
                    current_status = result['status']
                    current_results = result['results']

                    # Send update if status changed
                    if current_status != last_status:
                        await self.send(text_data=json.dumps({
                            'status': current_status,
                            'results': current_results,
                        }))
                        last_status = current_status
                        logger.info(f"Sent status update for job {self.job_id}: {current_status}")

                        # Stop monitoring if job is finished
                        if current_status in ['completed', 'failed']:
                            logger.info(f"Job {self.job_id} finished with status {current_status}, stopping monitoring")
                            self.monitoring = False
                            await self.close()
                            break

                    # Send update if results count changed
                    elif len(current_results) != last_results_count:
                        await self.send(text_data=json.dumps({
                            'status': current_status,
                            'results': current_results,
                        }))
                        last_results_count = len(current_results)
                        logger.info(f"Sent results update for job {self.job_id}: {len(current_results)} products")

                else:
                    # Job not found - stop monitoring
                    logger.warning(f"Job {self.job_id} not found, stopping monitoring")
                    self.monitoring = False
                    await self.close()
                    break

                # Wait before checking again
                await asyncio.sleep(1)

            except Exception as e:
                logger.error(f"Error monitoring search updates for job {self.job_id}: {str(e)}")
                await asyncio.sleep(2)  # Wait longer on error
