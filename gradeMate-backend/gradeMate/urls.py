"""
Main URL configuration for gradeMate project.

Includes versioned API endpoints under /api/v1/ as well as legacy route paths.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse


def api_health_check(request):
    """Health check endpoint returning 200 OK status."""
    return JsonResponse({
        "status": "ok",
        "service": "GradeMate API",
        "version": "v1"
    }, status=200)


urlpatterns = [
    path('', api_health_check, name='health_check_root'),
    path('api/v1/', api_health_check, name='health_check_v1'),
    path('admin/', admin.site.urls),

    # Standard Versioned API v1 Endpoints (REST API Rules)
    path('api/v1/auth/', include('accounts.urls')),
    path('api/v1/quizzes/', include('quize.urls')),

    # Legacy Backward-Compatible Endpoints
    path('account/', include('accounts.urls')),
    path('api/', include('quize.urls')),
]

# Serve user uploaded media files during development
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )