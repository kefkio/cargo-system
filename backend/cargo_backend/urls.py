# cargo_backend/urls.py

from django.contrib import admin
from django.urls import path, re_path, include
from django.views.generic import TemplateView

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),

    # API endpoints
    path('api/users/', include('accounts.urls')),        # renamed app
    path('api/shipments/', include('shipments.urls')),
    path('api/audit/', include('audit.urls')),
    path('api/tracking/', include('tracking.urls')),
    path('api/warehouse/', include('warehouse.urls')),
    path('api/notifications/', include('notifications.urls')),
]

# Catch-all route to serve React frontend (index.html)
urlpatterns += [
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]