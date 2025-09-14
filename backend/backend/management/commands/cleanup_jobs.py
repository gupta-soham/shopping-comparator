from django.core.management.base import BaseCommand
from backend.tasks import cleanup_expired_jobs


class Command(BaseCommand):
    help = 'Run cleanup of expired search jobs'

    def handle(self, *args, **options):
        self.stdout.write('Starting cleanup of expired search jobs...')
        result = cleanup_expired_jobs()
        self.stdout.write(
            self.style.SUCCESS(f'Successfully cleaned up {result} expired search jobs')
        )
