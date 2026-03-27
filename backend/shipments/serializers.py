# backend/shipments/serializers.py
from rest_framework import serializers
from .models import Cargo, Warehouse, Invoice, CancellationRequest, CreditNote, DispatchHandler
from django.conf import settings
import os

class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = ["id", "code", "name", "location"]

class CargoSerializer(serializers.ModelSerializer):
    client_name = serializers.SerializerMethodField()
    client_email = serializers.SerializerMethodField()
    client_phone = serializers.SerializerMethodField()
    origin_name = serializers.SerializerMethodField()
    destination_name = serializers.SerializerMethodField()
    cbm = serializers.SerializerMethodField()
    qr_code = serializers.SerializerMethodField()
    pickup_image = serializers.SerializerMethodField()
    dispatch_image = serializers.SerializerMethodField()
    sticker_photo = serializers.SerializerMethodField()
    proforma_paid = serializers.SerializerMethodField()

    class Meta:
        model = Cargo
        fields = [
            "id",
            "tracking_number",
            "qr_code",
            "client_name",
            "client_email",
            "client_phone",
            "origin",
            "origin_name",
            "destination",
            "destination_name",
            "cargo_type",
            "transport_mode",
            "priority",
            "expected_delivery_date",
            "weight_kg",
            "volume_cbm",
            "length_m",
            "width_m",
            "height_m",
            "cbm",
            "handling_instructions",
            "dest_contact_person",
            "dest_contact_phone",
            "dest_contact_email",
            "dest_address_line",
            "dest_area",
            "dest_city",
            "dest_postal_code",
            "status",
            "created_by",
            "intake_date",
            # Lifecycle timestamps
            "pickup_requested_at",
            "shipment_created_at",
            "processing_at_origin_at",
            "in_transit_at",
            "arrived_nairobi_at",
            "dispatched_at",
            "delivered_at",
            # Dispatch info
            "dispatcher_name",
            "dispatcher_phone",
            "dispatcher_service",
            "dispatch_cost",
            "dispatched_datetime",
            "delivered_datetime",
            # Images
            "pickup_image",
            "dispatch_image",
            # Sticker
            "sticker_attached",
            "sticker_photo",
            "sticker_attached_at",
            "sticker_attached_by",
            "sticker_print_count",
            # Payment status
            "proforma_paid",
        ]

    def get_client_name(self, obj):
        if obj.client:
            return obj.client.full_name()
        return None

    def get_client_email(self, obj):
        if obj.client:
            return obj.client.email
        return None

    def get_client_phone(self, obj):
        if obj.client:
            return obj.client.phone_number or ''
        return ''

    def get_origin_name(self, obj):
        if obj.origin:
            return obj.origin.name or obj.origin.code
        return None

    def get_destination_name(self, obj):
        if obj.destination:
            return obj.destination.name or obj.destination.code
        return None

    def get_proforma_paid(self, obj):
        from .models import Invoice
        proforma = Invoice.objects.filter(cargo=obj, invoice_type="proforma").exclude(status="cancelled").first()
        return proforma.status == "paid" if proforma else False

    def get_cbm(self, obj):
        if obj.length_m and obj.width_m and obj.height_m:
            return round(obj.length_m * obj.width_m * obj.height_m, 3)
        return None

    def get_qr_code(self, obj):
        # Placeholder: frontend can generate QR
        return obj.tracking_number

    def get_pickup_image(self, obj):
        if obj.pickup_image:
            return self.build_full_url(obj.pickup_image.url)
        return None

    def get_dispatch_image(self, obj):
        if obj.dispatch_image:
            return self.build_full_url(obj.dispatch_image.url)
        return None

    def get_sticker_photo(self, obj):
        if obj.sticker_photo:
            return self.build_full_url(obj.sticker_photo.url)
        return None

    def build_full_url(self, path):
        request = self.context.get("request")
        if request:
            return request.build_absolute_uri(path)
        return f"{settings.MEDIA_URL}{os.path.basename(path)}"


class CargoCreateSerializer(serializers.Serializer):
    """Serializer for creating a new shipment from the admin form."""
    clientEmail = serializers.EmailField()
    clientName = serializers.CharField(max_length=255)
    clientPhone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    origin = serializers.CharField(max_length=255)
    destination = serializers.CharField(max_length=255)
    transportMode = serializers.ChoiceField(choices=["Air", "Sea"])
    weight = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, allow_null=True)
    volume = serializers.DecimalField(max_digits=10, decimal_places=3, required=False, allow_null=True)
    packageType = serializers.CharField(max_length=100, required=False, allow_blank=True)
    priority = serializers.ChoiceField(choices=["Standard", "Express"], required=False)
    description = serializers.CharField(required=False, allow_blank=True)
    deliveryDate = serializers.DateField(required=False, allow_null=True)
    destContactPerson = serializers.CharField(max_length=255)
    destContactPhone = serializers.CharField(max_length=20)
    destContactEmail = serializers.EmailField(required=False, allow_blank=True)
    destAddressLine = serializers.CharField(max_length=255, required=False, allow_blank=True)
    destArea = serializers.CharField(max_length=255, required=False, allow_blank=True)
    destCity = serializers.CharField(max_length=100, required=False, allow_blank=True)
    destPostalCode = serializers.CharField(max_length=20, required=False, allow_blank=True)


class InvoiceSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    taxable_subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    disbursements_subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    tax_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    cargo_tracking = serializers.CharField(source="cargo.tracking_number", read_only=True)
    client_name = serializers.SerializerMethodField()
    client_kra_pin = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()
    days_unpaid = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            "id", "invoice_number", "cargo", "cargo_tracking", "user", "client_name", "client_kra_pin",
            "invoice_type", "status", "payment_status", "days_unpaid",
            "freight_charge", "handling_fee", "insurance", "other_charges",
            "customs_duty", "excise_duty", "import_vat", "port_charges",
            "clearance_fee", "rdl", "idf",
            "clearance_charges_confirmed",
            "taxable_subtotal", "disbursements_subtotal",
            "subtotal", "tax_rate", "tax_amount", "total_amount",
            "currency", "notes",
            "payment_method", "payment_reference",
            "created_at", "updated_at", "issued_at", "paid_at", "created_by",
        ]
        read_only_fields = ["invoice_number", "created_at", "updated_at"]

    def get_payment_status(self, obj):
        """Computed payment status: paid / unpaid / n/a."""
        if obj.status == "paid":
            return "paid"
        if obj.status in ("cancelled", "retired", "expired"):
            return "n/a"
        # draft or issued → unpaid
        if obj.invoice_type == "final" and obj.status in ("draft", "issued"):
            return "unpaid"
        # issued proformas are quotations, not billable
        if obj.invoice_type == "proforma":
            return "n/a"
        return "unpaid"

    def get_days_unpaid(self, obj):
        """Number of days since the invoice was issued but not yet paid."""
        if obj.status in ("paid", "cancelled", "retired", "expired"):
            return None
        if obj.invoice_type == "proforma":
            return None
        ref_date = obj.issued_at or obj.created_at
        if not ref_date:
            return None
        from django.utils import timezone
        delta = timezone.now() - ref_date
        return delta.days

    def get_client_name(self, obj):
        if obj.cargo and obj.cargo.client:
            return obj.cargo.client.full_name()
        return None

    def get_client_kra_pin(self, obj):
        if obj.cargo and obj.cargo.client:
            return obj.cargo.client.kra_pin or None
        return None

    def to_representation(self, instance):
        # Auto-expire issued proformas older than 14 days on read
        if (
            instance.invoice_type == "proforma"
            and instance.status == "issued"
            and instance.issued_at
        ):
            from django.utils import timezone
            from datetime import timedelta
            if instance.issued_at < timezone.now() - timedelta(days=14):
                instance.status = "expired"
                instance.save(update_fields=["status", "updated_at"])
        return super().to_representation(instance)


class CancellationRequestSerializer(serializers.ModelSerializer):
    requested_by_name = serializers.SerializerMethodField()
    reviewed_by_name = serializers.SerializerMethodField()
    target_display = serializers.SerializerMethodField()

    class Meta:
        model = CancellationRequest
        fields = [
            "id", "request_type", "cargo", "invoice",
            "requested_by", "requested_by_name",
            "reason", "status",
            "reviewed_by", "reviewed_by_name", "reviewed_at",
            "target_display", "created_at",
        ]
        read_only_fields = ["id", "requested_by", "status", "reviewed_by", "reviewed_at", "created_at"]

    def get_requested_by_name(self, obj):
        return obj.requested_by.full_name() if obj.requested_by else None

    def get_reviewed_by_name(self, obj):
        return obj.reviewed_by.full_name() if obj.reviewed_by else None

    def get_target_display(self, obj):
        if obj.request_type == "shipment" and obj.cargo:
            return obj.cargo.tracking_number
        if obj.request_type == "invoice" and obj.invoice:
            return obj.invoice.invoice_number
        return "N/A"


class CreditNoteSerializer(serializers.ModelSerializer):
    invoice_number = serializers.CharField(source="invoice.invoice_number", read_only=True)
    issued_by_name = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()

    class Meta:
        model = CreditNote
        fields = [
            "id", "credit_note_number", "invoice", "invoice_number",
            "amount", "reason",
            "issued_by", "issued_by_name",
            "approved_by", "approved_by_name", "approved_at",
            "created_at",
        ]
        read_only_fields = ["id", "credit_note_number", "issued_by", "approved_by", "approved_at", "created_at"]

    def get_issued_by_name(self, obj):
        return obj.issued_by.full_name() if obj.issued_by else None

    def get_approved_by_name(self, obj):
        return obj.approved_by.full_name() if obj.approved_by else None


class DispatchHandlerSerializer(serializers.ModelSerializer):
    class Meta:
        model = DispatchHandler
        fields = ["id", "service_name", "contact_name", "contact_phone", "usage_count", "last_used"]
        read_only_fields = ["id", "usage_count", "last_used"]