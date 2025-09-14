from django.core.management.base import BaseCommand
from ...models import Site


class Command(BaseCommand):
    help = 'Populate initial site data'

    def handle(self, *args, **options):
        sites_data = [
            {
                'name': 'meesho',
                'base_url': 'https://www.meesho.com',
                'search_path': '/search?q={query}&searchType=POPULAR_SEARCHES',
            },
            {
                'name': 'nykaa',
                'base_url': 'https://www.nykaa.com',
                'search_path': '/search/result/?q={query}',
            },
            {
                'name': 'myntra',
                'base_url': 'https://www.myntra.com',
                'search_path': '/{query}',
            },
            {
                'name': 'fabindia',
                'base_url': 'https://www.fabindia.com',
                'search_path': '/search?text={query}',
            },
        ]

        for site_data in sites_data:
            site, created = Site.objects.get_or_create(
                name=site_data['name'],
                defaults={
                    'base_url': site_data['base_url'],
                    'search_path': site_data['search_path'],
                    'active': True,
                }
            )

            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully created site "{site.name}"')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Site "{site.name}" already exists')
                )
