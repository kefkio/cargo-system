# backend/shipments/models.py
import random
from datetime import datetime, timedelta
from django.db import models
from django.db.models import Exists, OuterRef
from django.conf import settings  # for AUTH_USER_MODEL
from django.utils import timezone


# -----------------------------
# Tracking number generator
# -----------------------------
def generate_tracking_number(origin_code="NY"):
    date_part = datetime.now().strftime("%Y%m%d")
    random_part = random.randint(1000, 9999)
    return f"FPC-{origin_code}-{date_part}-{random_part}"


# -----------------------------
# Warehouse model
# -----------------------------
class Warehouse(models.Model):
    code = models.CharField(max_length=10, unique=True)  # e.g., NBO01
    name = models.CharField(max_length=255, blank=True, null=True)
    location = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.code} - {self.name or 'Unnamed'}"


# -----------------------------
# Cargo model
# -----------------------------
class Cargo(models.Model):
    STATUS_CHOICES = [
        ("Pickup Requested", "Pickup Requested"),
        ("Pickup Assigned", "Pickup Assigned"),
        ("Pickup Closed", "Pickup Closed"),
        ("Received at Warehouse", "Received at Warehouse"),
        ("Shipment Created", "Shipment Created"),
        ("Processing at Origin", "Processing at Origin"),
        ("In Transit", "In Transit"),
        ("Arrived Nairobi Hub", "Arrived Nairobi Hub"),
        ("Dispatched", "Dispatched"),
        ("Delivered", "Delivered"),
        ("Cancelled", "Cancelled"),
        ("Lost", "Lost"),
        ("Delayed", "Delayed"),
        ("Not Picked Up", "Not Picked Up"),
        ("Compensated", "Compensated"),
    ]
    # Pickup assignment and warehouse receipt tracking
    pickup_assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_pickups",
        help_text="Staff assigned to pick up the cargo"
    )
    pickup_assigned_at = models.DateTimeField(blank=True, null=True)
    pickup_closed_at = models.DateTimeField(blank=True, null=True)
    warehouse_received_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="warehouse_received_cargos",
        help_text="Staff who received the cargo at warehouse"
    )
    warehouse_received_at = models.DateTimeField(blank=True, null=True)

    # Core identifiers
    tracking_number = models.CharField(max_length=50, unique=True, editable=False)
    qr_code = models.ImageField(upload_to="qr_codes/", blank=True, null=True)

    # Client & shipment info
    client = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        limit_choices_to={"role": "CLIENT"},
        related_name="cargos"
    )
    origin = models.ForeignKey(
        Warehouse,
        on_delete=models.SET_NULL,
        null=True,
        related_name="cargo_origins"
    )
    destination = models.ForeignKey(
        Warehouse,
        on_delete=models.SET_NULL,
        null=True,
        related_name="cargo_destinations"
    )
    cargo_type = models.CharField(max_length=100, blank=True, null=True)

    # Transport & priority
    TRANSPORT_MODE_CHOICES = [
        ("Air", "Air Freight"),
        ("Sea", "Sea Freight"),
    ]
    PRIORITY_CHOICES = [
        ("Standard", "Standard"),
        ("Express", "Express"),
    ]
    transport_mode = models.CharField(max_length=10, choices=TRANSPORT_MODE_CHOICES, blank=True, null=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="Standard")
    expected_delivery_date = models.DateField(blank=True, null=True)

    # Physical attributes
    weight_kg = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    volume_cbm = models.DecimalField(max_digits=10, decimal_places=3, blank=True, null=True)
    length_m = models.DecimalField(max_digits=6, decimal_places=3, blank=True, null=True)
    width_m = models.DecimalField(max_digits=6, decimal_places=3, blank=True, null=True)
    height_m = models.DecimalField(max_digits=6, decimal_places=3, blank=True, null=True)

    @property
    def cbm(self):
        """Compute volume in cubic meters."""
        if self.volume_cbm:
            return float(self.volume_cbm)
        if self.length_m and self.width_m and self.height_m:
            return round(self.length_m * self.width_m * self.height_m, 3)
        return None

    handling_instructions = models.TextField(blank=True, null=True)

    # Destination contact
    dest_contact_person = models.CharField(max_length=255, blank=True, null=True)
    dest_contact_phone = models.CharField(max_length=20, blank=True, null=True)
    dest_contact_email = models.EmailField(blank=True, null=True)

    # Destination address
    dest_address_line = models.CharField(max_length=255, blank=True, null=True, help_text="e.g. House 12, Riverside Drive")
    dest_area = models.CharField(max_length=255, blank=True, null=True, help_text="e.g. Westlands")
    dest_city = models.CharField(max_length=100, blank=True, null=True, help_text="e.g. Nairobi")
    dest_postal_code = models.CharField(max_length=20, blank=True, null=True, help_text="e.g. 00100")

    # Lifecycle timestamps
    pickup_requested_at = models.DateTimeField(blank=True, null=True)
    shipment_created_at = models.DateTimeField(blank=True, null=True)
    processing_at_origin_at = models.DateTimeField(blank=True, null=True)
    in_transit_at = models.DateTimeField(blank=True, null=True)
    arrived_nairobi_at = models.DateTimeField(blank=True, null=True)
    dispatched_at = models.DateTimeField(blank=True, null=True)
    delivered_at = models.DateTimeField(blank=True, null=True)

    # Dispatch info
    dispatcher_name = models.CharField(max_length=255, blank=True, null=True)
    dispatcher_phone = models.CharField(max_length=20, blank=True, null=True)
    dispatcher_service = models.CharField(max_length=255, blank=True, null=True)
    dispatch_cost = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Dispatch charges for finance reporting")
    dispatched_datetime = models.DateTimeField(blank=True, null=True)
    delivered_datetime = models.DateTimeField(blank=True, null=True)

    # Package images
    pickup_image = models.ImageField(upload_to="cargo/pickups/", blank=True, null=True)
    dispatch_image = models.ImageField(upload_to="cargo/dispatches/", blank=True, null=True)

    # Sticker attachment confirmation
    sticker_attached = models.BooleanField(default=False)
    sticker_photo = models.ImageField(upload_to="cargo/stickers/", blank=True, null=True)
    sticker_attached_at = models.DateTimeField(blank=True, null=True)
    sticker_attached_by = models.CharField(max_length=255, blank=True, null=True)
    sticker_print_count = models.PositiveIntegerField(default=0, help_text="Number of times the sticker has been printed")

    # Metadata
    created_by = models.CharField(max_length=255, blank=True, null=True)
    intake_date = models.DateTimeField(auto_now_add=True, db_index=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="Pickup Requested", db_index=True)

    # Incident tracking
    incident_status = models.CharField(max_length=20, blank=True, null=True, help_text="Lost, Delayed, Not Picked Up, Compensated")
    incident_location = models.CharField(max_length=255, blank=True, null=True, help_text="Where cargo was declared lost or incident occurred")
    incident_declared_at = models.DateTimeField(blank=True, null=True)
    incident_notes = models.TextField(blank=True, null=True, help_text="Details about the incident")
    incident_declared_by = models.CharField(max_length=255, blank=True, null=True)
    compensation_amount = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    compensation_date = models.DateField(blank=True, null=True)
    compensation_reference = models.CharField(max_length=255, blank=True, null=True, help_text="Insurance claim or payment reference")

    def save(self, *args, **kwargs):
        """Generate tracking number if missing."""
        if not self.tracking_number:
            origin_code = self.origin.code if self.origin else "NY"
            self.tracking_number = generate_tracking_number(origin_code)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.tracking_number


# -----------------------------
# Invoice model
# -----------------------------
class Invoice(models.Model):
    INVOICE_TYPE_CHOICES = [
        ("proforma", "Proforma Invoice"),
        ("final", "Final Invoice"),
    ]

    INVOICE_STATUS_CHOICES = [
        ("draft", "Draft"),
        ("issued", "Issued"),
        ("paid", "Paid"),
        ("cancelled", "Cancelled"),
        ("retired", "Retired"),
        ("expired", "Expired"),
    ]

    invoice_number = models.CharField(max_length=50, unique=True, editable=False)
    cargo = models.ForeignKey(Cargo, on_delete=models.CASCADE, related_name="invoices")
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="invoices",
        help_text="Client this invoice belongs to",
    )
    invoice_type = models.CharField(max_length=10, choices=INVOICE_TYPE_CHOICES, db_index=True)
    status = models.CharField(max_length=10, choices=INVOICE_STATUS_CHOICES, default="draft", db_index=True)

    # ── A. Taxable Services (subject to VAT) ──
    freight_charge = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    handling_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    insurance = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    other_charges = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    # ── B. Disbursements (Non-VATable, costs incurred on behalf of client) ──
    customs_duty = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Import Duty")
    excise_duty = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    import_vat = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Import VAT paid at KRA")
    reimbursable_vat = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Reimbursable VAT charged to cargo owner")
    port_charges = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Port/terminal charges")
    clearance_fee = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Clearance fees paid to third parties")
    rdl = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Railway Development Levy")
    idf = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Import Declaration Fee")

    # Clearance charges must be confirmed before final invoice can be issued
    clearance_charges_confirmed = models.BooleanField(default=False)

    # Staff submits charges for admin approval
    clearance_submitted = models.BooleanField(default=False, help_text="Staff has submitted charges for admin review")
    clearance_submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name="submitted_clearances",
        help_text="Staff member who submitted the charges",
    )
    clearance_submitted_at = models.DateTimeField(blank=True, null=True)

    # ── Computed totals ──
    @property
    def taxable_subtotal(self):
        """Sum of service charges that are subject to VAT."""
        return self.freight_charge + self.handling_fee + self.insurance + self.other_charges

    @property
    def disbursements_subtotal(self):
        """Sum of costs incurred on behalf of client — NOT subject to VAT."""
        return (
            self.customs_duty + self.excise_duty + self.import_vat + self.reimbursable_vat
            + self.port_charges + self.clearance_fee + self.rdl + self.idf
        )

    @property
    def subtotal(self):
        return self.taxable_subtotal + self.disbursements_subtotal

    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=16)

    @property
    def tax_amount(self):
        """VAT applies ONLY to taxable services, NOT disbursements."""
        return round(self.taxable_subtotal * self.tax_rate / 100, 2)

    @property
    def total_amount(self):
        return self.taxable_subtotal + self.tax_amount + self.disbursements_subtotal

    currency = models.CharField(max_length=3, default="USD")
    notes = models.TextField(blank=True, null=True)

    # Payment details
    PAYMENT_METHOD_CHOICES = [
        ("cash", "Cash"),
        ("bank", "Bank Transfer"),
        ("mpesa", "M-Pesa"),
        ("visa", "Visa"),
    ]
    payment_method = models.CharField(max_length=10, choices=PAYMENT_METHOD_CHOICES, blank=True, null=True)
    payment_reference = models.CharField(max_length=255, blank=True, null=True, help_text="Bank reference or receipt number")

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    issued_at = models.DateTimeField(blank=True, null=True)
    paid_at = models.DateTimeField(blank=True, null=True)
    created_by = models.CharField(max_length=255, blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.invoice_number:
            self.invoice_number = self._generate_invoice_number()
        super().save(*args, **kwargs)

    def _generate_invoice_number(self):
        prefix = "PRO" if self.invoice_type == "proforma" else "INV"
        date_part = datetime.now().strftime("%Y%m%d")

        # Find the highest sequence ever used across ALL dates for this prefix type,
        # so the counter is continuous and never resets between days.
        last = (
            Invoice.objects
            .filter(invoice_number__startswith=f"FPC-{prefix}-")
            .order_by("-invoice_number")
            .values_list("invoice_number", flat=True)
            .first()
        )
        if last:
            try:
                seq = int(last.rsplit("-", 1)[-1]) + 1
            except (ValueError, IndexError):
                seq = 1
        else:
            seq = 1
        return f"FPC-{prefix}-{date_part}-{seq:04d}"

    def __str__(self):
        return f"{self.invoice_number} ({self.get_invoice_type_display()})"

    @classmethod
    def expire_stale_proformas(cls, days=14):
        """
        Expire and retire stale proforma invoices. Safe to call on every request.

        Rule 1 — Time-based expiry:
            Issued proformas whose issued_at is older than `days` days → status = "expired".

        Rule 2 — Superseded retirement:
            Issued or draft proformas whose cargo already has a non-cancelled final
            invoice → status = "retired" (the final invoice supersedes the proforma).

        Returns (expired_count, retired_count).
        """
        cutoff = timezone.now() - timedelta(days=days)

        # Rule 1: time-based expiry
        expired = cls.objects.filter(
            invoice_type="proforma",
            status="issued",
            issued_at__lt=cutoff,
        ).update(status="expired")

        # Rule 2: retire proformas superseded by a final invoice on the same cargo
        has_active_final = cls.objects.filter(
            cargo=OuterRef("cargo"),
            invoice_type="final",
        ).exclude(status="cancelled")

        retired = (
            cls.objects
            .filter(invoice_type="proforma", status__in=("draft", "issued"))
            .filter(Exists(has_active_final))
            .update(status="retired")
        )

        return expired, retired

    class Meta:
        ordering = ["-created_at"]


# -----------------------------
# Cancellation Request model
# -----------------------------
class CancellationRequest(models.Model):
    REQUEST_TYPE_CHOICES = [
        ("shipment", "Shipment Cancellation"),
        ("invoice", "Invoice Cancellation"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending Approval"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    request_type = models.CharField(max_length=10, choices=REQUEST_TYPE_CHOICES)
    cargo = models.ForeignKey(Cargo, on_delete=models.CASCADE, null=True, blank=True, related_name="cancellation_requests")
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, null=True, blank=True, related_name="cancellation_requests")
    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="cancellation_requests")
    reason = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="reviewed_cancellations"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        target = self.cargo.tracking_number if self.cargo else self.invoice.invoice_number if self.invoice else "N/A"
        return f"{self.get_request_type_display()} — {target} ({self.status})"

    class Meta:
        ordering = ["-created_at"]


# -----------------------------
# Credit Note model
# -----------------------------
class CreditNote(models.Model):
    credit_note_number = models.CharField(max_length=50, unique=True, editable=False)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, related_name="credit_notes")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.TextField()
    issued_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="issued_credit_notes")
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
        null=True, blank=True, related_name="approved_credit_notes"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.credit_note_number:
            date_part = datetime.now().strftime("%Y%m%d")
            random_part = random.randint(1000, 9999)
            self.credit_note_number = f"FPC-CN-{date_part}-{random_part}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.credit_note_number} → {self.invoice.invoice_number}"

    class Meta:
        ordering = ["-created_at"]


# -----------------------------
# Notification model
# -----------------------------
class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ("clearance_submitted", "Clearance Charges Submitted"),
        ("clearance_approved", "Clearance Charges Approved"),
        ("clearance_rejected", "Clearance Charges Rejected"),
        ("invoice_paid", "Invoice Paid"),
        ("credit_note_requested", "Credit Note Requested"),
        ("general", "General"),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES, default="general")
    title = models.CharField(max_length=255)
    message = models.TextField()
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE, null=True, blank=True, related_name="notifications")
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} → {self.recipient.email}"

    class Meta:
        ordering = ["-created_at"]


# -----------------------------
# Dispatch Handler (reusable dispatch contacts)
# -----------------------------
class DispatchHandler(models.Model):
    service_name = models.CharField(max_length=255, help_text="e.g. Wells Fargo, Super Metro, rider name")
    contact_name = models.CharField(max_length=255)
    contact_phone = models.CharField(max_length=20, blank=True, default="")
    usage_count = models.PositiveIntegerField(default=1)
    last_used = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-usage_count", "-last_used"]
        unique_together = ["service_name", "contact_name"]

    def __str__(self):
        return f"{self.service_name} — {self.contact_name}"