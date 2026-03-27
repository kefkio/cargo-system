# cargo_backend/urls.py

from django.contrib import admin
from django.urls import path, include
from accounts import api_views as accounts_api
from shipments import views as shipments_views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # ------------------------------
    # Django Admin
    # ------------------------------
    path('admin/', admin.site.urls),

    # ------------------------------
    # Accounts / Authentication APIs
    # ------------------------------
    path('api/accounts/', include('accounts.urls', namespace='accounts')),

    # ------------------------------
    # Shipments app APIs
    # ------------------------------
    path('api/shipments/', include('shipments.urls', namespace='shipments')),

    # ------------------------------
    # Direct API endpoints for frontend compatibility
    # ------------------------------
    path('api/admins/', accounts_api.list_admins, name='direct_api_admins'),
    path('api/clients/', accounts_api.list_clients, name='direct_api_clients'),
    path('api/staff/', accounts_api.list_staff, name='direct_api_staff'),
    path('api/dashboard/stats/', accounts_api.dashboard_stats, name='direct_dashboard_stats'),
    path('api/dashboard/activity/', accounts_api.dashboard_activity, name='direct_dashboard_activity'),
    path('api/dashboard/services/', accounts_api.dashboard_services, name='direct_dashboard_services'),

    # ------------------------------
    # Public pickup request
    # ------------------------------
    path('api/pickup-request', shipments_views.pickup_request_create, name='pickup_request_create'),

    # ------------------------------
    # Optional landing pages / frontend fallback
    # ------------------------------
    # You can serve your React index.html here if needed
]

# ------------------------------
# Serve media and static files in development
# ------------------------------
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)