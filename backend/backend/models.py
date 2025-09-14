from django.db import models
from django.utils import timezone
from datetime import timedelta


class Site(models.Model):
    """Represents supported e-commerce platforms"""

    name = models.CharField(max_length=50, unique=True)
    base_url = models.URLField()
    search_path = models.CharField(max_length=100)  # URL pattern for search
    active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    class Meta:
        indexes = [
            models.Index(fields=['name']),
        ]


class Search(models.Model):
    """Represents a user-initiated search query"""

    id = models.AutoField(primary_key=True)

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    prompt = models.CharField(max_length=500)
    sites = models.JSONField()  # List of site names
    filters = models.JSONField(default=dict, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def save(self, *args, **kwargs):
        # Auto-set expires_at to 24 hours from creation
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=24)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Search {self.id}: {self.prompt[:50]}..."

    class Meta:
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['status']),
        ]


class Product(models.Model):
    """Represents an individual clothing item from a site"""

    search = models.ForeignKey(Search, on_delete=models.CASCADE, related_name='products')
    title = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    size = models.CharField(max_length=50, blank=True)
    material = models.CharField(max_length=100, blank=True)
    image_url = models.URLField()
    product_url = models.URLField()
    site = models.CharField(max_length=50)
    confidence = models.FloatField(default=1.0)
    rating = models.FloatField(null=True, blank=True)
    reviews_count = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.title} - {self.site}"

    class Meta:
        indexes = [
            models.Index(fields=['search']),
            models.Index(fields=['site']),
            models.Index(fields=['price']),
            models.Index(fields=['rating']),
        ]