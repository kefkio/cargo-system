# backend/shipments/admin.py
from django.contrib import admin
from django.utils.html import format_html
from django.conf import settings  # for AUTH_USER_MODEL

from .models import Warehouse, Cargo, Invoice, generate_tracking_number, DispatchHandler
from accounts.models import User  # custom User model

# -----------------------------
# Unregister default User admin if already registered
# -----------------------------
if admin.site.is_registered(User):
    admin.site.unregister(User)


# -----------------------------
# Client Admin (Users with role='CLIENT')
# -----------------------------
@admin.register(User)
class ClientAdmin(admin.ModelAdmin):
    list_display = ('get_name', 'email', 'phone_number', 'role', 'created_at')
    search_fields = ('username', 'email', 'phone_number')
    list_filter = ('role', 'created_at')
    actions = ['approve_clients']

    def get_queryset(self, request):
        """Only show CLIENT users in this admin."""
        qs = super().get_queryset(request)
        return qs.filter(role='CLIENT')

    def get_name(self, obj):
        return obj.get_full_name() or obj.username
    get_name.short_description = 'Name'

    def approve_clients(self, request, queryset):
        updated_count = queryset.update(is_active=True)
        self.message_user(request, f"{updated_count} client(s) successfully approved.")
    approve_clients.short_description = "Approve selected clients"


# -----------------------------
# Warehouse Admin
# -----------------------------
@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'location')
    search_fields = ('code', 'name', 'location')


# -----------------------------
# Cargo Admin
# -----------------------------
@admin.register(Cargo)
class CargoAdmin(admin.ModelAdmin):
    list_display = ('tracking_number', 'get_client_name', 'origin', 'destination', 'status', 'intake_date', 'track_popup')
    list_filter = ('status', 'origin', 'destination')
    search_fields = ('tracking_number', 'client__email', 'origin__code', 'destination__code')
    readonly_fields = ('tracking_number', 'intake_date')

    def save_model(self, request, obj, form, change):
        """Automatically generate tracking number if missing."""
        if not obj.tracking_number and generate_tracking_number:
            origin_code = obj.origin.code if obj.origin else "NY"
            obj.tracking_number = generate_tracking_number(origin_code)
        super().save_model(request, obj, form, change)

    def get_client_name(self, obj):
        return obj.client.get_full_name() or obj.client.email
    get_client_name.short_description = 'Client'

    def track_popup(self, obj):
        """Open popup showing cargo details with color-coded status."""
        status_colors = {
            "Pickup Requested": "orange",
            "Shipment Created": "blue",
            "Processing at Origin": "purple",
            "In Transit": "blue",
            "Arrived Nairobi Hub": "orange",
            "Dispatched": "brown",
            "Delivered": "green",
        }
        color = status_colors.get(obj.status, "black")

        html_content = f"""
        <html>
        <head>
            <title>Track Cargo {obj.tracking_number}</title>
        </head>
        <body style="font-family:Arial, sans-serif; padding:20px;">
            <h2>Cargo Tracking</h2>
            <p><strong>Tracking Number:</strong> {obj.tracking_number}</p>
            <p><strong>Client:</strong> {self.get_client_name(obj)}</p>
            <p><strong>Origin:</strong> {obj.origin.name if obj.origin else 'N/A'}</p>
            <p><strong>Destination:</strong> {obj.destination.name if obj.destination else 'N/A'}</p>
            <p><strong>Status:</strong> <span style="color:{color}; font-weight:bold;">{obj.status}</span></p>
            <p><strong>Cargo Type:</strong> {obj.cargo_type or 'N/A'}</p>
            <p><strong>Weight:</strong> {obj.weight_kg or 'N/A'} kg</p>
            <p><strong>Dimensions (L×W×H):</strong> {f'{obj.length_m}×{obj.width_m}×{obj.height_m}' if obj.length_m else 'N/A'}</p>
            <p><strong>Handling Instructions:</strong> {obj.handling_instructions or 'N/A'}</p>
            <p><strong>Intake Date:</strong> {obj.intake_date.strftime('%Y-%m-%d %H:%M:%S') if obj.intake_date else 'N/A'}</p>
        </body>
        </html>
        """
        return format_html(
            '<a href="#" onclick="var w = window.open(\'\', \'popup\', \'width=450,height=550,scrollbars=yes\'); w.document.write(`{}`); return false;">Track</a>',
            html_content.replace("`", "\\`")
        )

    track_popup.short_description = 'Track Cargo'


# -----------------------------
# Invoice Admin
# -----------------------------
@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_number', 'get_tracking', 'invoice_type', 'status', 'total_display', 'created_at')
    list_filter = ('invoice_type', 'status', 'currency')
    search_fields = ('invoice_number', 'cargo__tracking_number', 'cargo__client__email')
    readonly_fields = ('invoice_number', 'created_at', 'updated_at')

    def get_tracking(self, obj):
        return obj.cargo.tracking_number
    get_tracking.short_description = 'Shipment'

    def total_display(self, obj):
        return f"{obj.currency} {obj.total_amount:,.2f}"
    total_display.short_description = 'Total'


# -----------------------------
# Dispatch Handler Admin
# -----------------------------
@admin.register(DispatchHandler)
class DispatchHandlerAdmin(admin.ModelAdmin):
    list_display = ('service_name', 'contact_name', 'contact_phone', 'usage_count', 'last_used')
    search_fields = ('service_name', 'contact_name')
    list_filter = ('service_name',)