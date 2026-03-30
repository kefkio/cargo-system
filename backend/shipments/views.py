# -----------------------------
# Client Reports (on-demand, detailed)
# -----------------------------
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from django.db.models import Count, Sum, Q

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def client_reports(request):
    """
    Detailed, on-demand report for the authenticated client.
    Query params:
      - period: day | week | month | year | custom  (default: month)
      - date_from / date_to: for custom range (YYYY-MM-DD)
    """
    if getattr(request.user, "role", None) != "CLIENT":
        return Response({"error": "Not a client user"}, status=403)

    now = timezone.now()
    period = request.query_params.get("period", "month")
    date_from = request.query_params.get("date_from")
    date_to = request.query_params.get("date_to")

    # Determine date range
    if period == "custom" and date_from:
        from datetime import datetime as dt
        start = timezone.make_aware(dt.strptime(date_from, "%Y-%m-%d"))
        end = timezone.make_aware(dt.strptime(date_to, "%Y-%m-%d").replace(hour=23, minute=59, second=59)) if date_to else now
    elif period == "day":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end = now
    elif period == "week":
        start = now - timedelta(days=7)
        end = now
    elif period == "year":
        start = now - timedelta(days=365)
        end = now
    else:  # month
        start = now - timedelta(days=30)
        end = now

    # ── Shipment metrics ──
    all_shipments_qs = Cargo.objects.filter(client=request.user)
    period_shipments = all_shipments_qs.filter(intake_date__range=(start, end))

    shipments_by_status = dict(
        period_shipments.values_list("status").annotate(c=Count("id")).values_list("status", "c")
    )
    shipments_by_mode = dict(
        period_shipments.exclude(transport_mode__isnull=True)
        .values_list("transport_mode").annotate(c=Count("id")).values_list("transport_mode", "c")
    )
    total_weight = period_shipments.aggregate(w=Sum("weight_kg"))["w"] or Decimal("0")

    delivered_count = period_shipments.filter(status="Delivered").count()
    total_period = period_shipments.count()

    # Daily shipment trend
    from django.db.models.functions import TruncDate
    daily_trend = list(
        period_shipments.annotate(day=TruncDate("intake_date"))
        .values("day")
        .annotate(count=Count("id"))
        .order_by("day")
        .values("day", "count")
    )

    # ── Invoice metrics ──
    all_invoices_qs = Invoice.objects.filter(user=request.user)
    period_invoices = all_invoices_qs.filter(created_at__range=(start, end))

    paid_invoices = period_invoices.filter(status="paid")
    outstanding_invoices = period_invoices.filter(status="issued", invoice_type="proforma")

    invoices_by_status = dict(
        period_invoices.values_list("status").annotate(c=Count("id")).values_list("status", "c")
    )
    invoices_by_type = dict(
        period_invoices.values_list("invoice_type").annotate(c=Count("id")).values_list("invoice_type", "c")
    )
    payment_methods = dict(
        paid_invoices.exclude(payment_method__isnull=True)
        .values_list("payment_method").annotate(c=Count("id")).values_list("payment_method", "c")
    )

    response_data = {
        "period": period,
        "date_range": {"from": start.isoformat(), "to": end.isoformat()},
        "shipments": {
            "total": total_period,
            "delivered": delivered_count,
            "delivery_rate": round(delivered_count / total_period * 100, 1) if total_period else 0,
            "total_weight_kg": float(total_weight),
            "by_status": shipments_by_status,
            "by_mode": shipments_by_mode,
            "daily_trend": [{"day": str(d["day"]), "count": d["count"]} for d in daily_trend],
        },
        "invoices": {
            "total": period_invoices.count(),
            "by_status": invoices_by_status,
            "by_type": invoices_by_type,
            "payment_methods": payment_methods,
            "paid_count": paid_invoices.count(),
            "outstanding_count": outstanding_invoices.count(),
        },
    }

    return Response(response_data)
# =============================
# Imports
# =============================
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Count, Sum, Q, F, DecimalField
from django.db.models.functions import TruncDate, TruncMonth
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
from django.core.paginator import Paginator, EmptyPage

from .models import Cargo, Warehouse, Invoice, CancellationRequest, CreditNote, Notification, DispatchHandler
from accounts.models import User
from .serializers import CargoSerializer, CargoCreateSerializer, WarehouseSerializer, InvoiceSerializer, CancellationRequestSerializer, CreditNoteSerializer, DispatchHandlerSerializer

DEFAULT_PAGE_SIZE = 50


def _paginate(request, queryset, serializer_class, context=None, extra=None):
    """Helper: paginate a queryset and return a standard envelope."""
    page_num = int(request.query_params.get("page", 1))
    page_size = min(int(request.query_params.get("page_size", DEFAULT_PAGE_SIZE)), 200)
    paginator = Paginator(queryset, page_size)
    try:
        page = paginator.page(page_num)
    except EmptyPage:
        page = paginator.page(paginator.num_pages)
    data = serializer_class(page.object_list, many=True, **(context or {})).data
    result = {
        "count": paginator.count,
        "num_pages": paginator.num_pages,
        "page": page.number,
        "page_size": page_size,
        "results": data,
    }
    if extra:
        result.update(extra)
    return result

# -----------------------------
# All Shipments (Admin)
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAdminUser])
def all_shipments(request):
    shipments = Cargo.objects.select_related(
        "client", "origin", "destination"
    ).order_by("-intake_date")
    return Response(_paginate(request, shipments, CargoSerializer, context={"context": {"request": request}}))

# -----------------------------
# Shipments Report (filterable)
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def shipments_report(request):
    from datetime import timedelta

    qs = Cargo.objects.select_related(
        "client", "origin", "destination"
    ).order_by("-intake_date")

    # --- Status filter ---
    status = request.query_params.get("status")
    if status:
        qs = qs.filter(status=status)

    # --- Transport mode filter ---
    mode = request.query_params.get("transport_mode")
    if mode:
        qs = qs.filter(transport_mode=mode)

    # --- Origin warehouse filter ---
    origin = request.query_params.get("origin")
    if origin:
        qs = qs.filter(origin__code=origin)

    # --- Destination warehouse filter ---
    destination = request.query_params.get("destination")
    if destination:
        qs = qs.filter(destination__code=destination)

    # --- Time period filter ---
    period = request.query_params.get("period")  # day, week, month
    now = timezone.now()
    if period == "day":
        qs = qs.filter(intake_date__date=now.date())
    elif period == "week":
        qs = qs.filter(intake_date__gte=now - timedelta(days=7))
    elif period == "month":
        qs = qs.filter(intake_date__gte=now - timedelta(days=30))

    # --- Custom date range ---
    date_from = request.query_params.get("date_from")
    date_to = request.query_params.get("date_to")
    if date_from:
        qs = qs.filter(intake_date__date__gte=date_from)
    if date_to:
        qs = qs.filter(intake_date__date__lte=date_to)

    # --- Summary counts ---
    total = qs.count()
    status_counts = dict(qs.values_list("status").annotate(c=Count("id")).values_list("status", "c"))

    serializer = CargoSerializer(qs, many=True, context={"request": request})
    return Response({
        "total": total,
        "status_counts": status_counts,
        "shipments": serializer.data,
    })

# -----------------------------
# Recent Shipments (Admin)
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAdminUser])
def recent_shipments(request):
    shipments = Cargo.objects.select_related(
        "client", "origin", "destination"
    ).order_by("-intake_date")[:10]
    serializer = CargoSerializer(shipments, many=True, context={"request": request})
    return Response(serializer.data)

# -----------------------------
# Pipeline Shipments (active, non-delivered)
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def pipeline_shipments(request):
    active_statuses = [
        "Shipment Created",
        "Processing at Origin",
        "In Transit",
        "Arrived Nairobi Hub",
        "Dispatched",
    ]
    shipments = Cargo.objects.filter(status__in=active_statuses).select_related(
        "client", "origin", "destination"
    ).order_by("-intake_date")
    return Response(_paginate(request, shipments, CargoSerializer, context={"context": {"request": request}}))

# -----------------------------
# Pickup Requests Panel (Admin)
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAdminUser])
def pickup_requests(request):
    pickups = Cargo.objects.filter(status__in=["Pickup Requested", "Shipment Created"]).select_related(
        "client", "origin", "destination"
    )
    return Response(_paginate(request, pickups, CargoSerializer, context={"context": {"request": request}}))

# -----------------------------
# Clients List (Admin)
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAdminUser])
def clients_list(request):
    clients = User.objects.filter(role="CLIENT").annotate(
        shipments_count=Count("cargos")
    ).order_by("-created_at")

    data = [
        {
            "id": c.id,
            "name": c.get_full_name() or c.username,
            "email": c.email,
            "phone": c.phone_number,
            "shipments": c.shipments_count,
        }
        for c in clients
    ]
    return Response(data)

# -----------------------------
# Dashboard Stats (Admin)
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAdminUser])
def dashboard_stats(request):
    stats = {
        "totalClients": User.objects.filter(role="CLIENT").count(),
        "totalShipments": Cargo.objects.count(),
        "activeShipments": Cargo.objects.exclude(status="Delivered").count(),
        "totalRevenue": Cargo.objects.aggregate(total=Sum("weight_kg"))["total"] or 0,
        "pendingPickups": Cargo.objects.filter(status="Pickup Requested").count(),
        "totalExpenses": 0,  # placeholder for future Expenses model
    }
    return Response(stats)

# -----------------------------
# Assign Dispatcher (Admin, PATCH)
# -----------------------------
@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def update_dispatcher(request, shipment_id):
    try:
        cargo = Cargo.objects.get(id=shipment_id)
    except Cargo.DoesNotExist:
        return Response({"error": "Shipment not found"}, status=404)

    dispatcher_name = request.data.get("dispatcher_name")
    dispatcher_phone = request.data.get("dispatcher_phone", "")
    dispatcher_service = request.data.get("dispatcher_service")

    if not dispatcher_name or not dispatcher_service:
        return Response(
            {"error": "dispatcher_name and dispatcher_service are required"},
            status=400,
        )

    # Final invoice must have clearance confirmed and be fully paid before dispatch
    final_inv = Invoice.objects.filter(cargo=cargo, invoice_type="final").exclude(status="cancelled").first()
    if not final_inv:
        return Response(
            {"error": "A final invoice must be generated before dispatch."},
            status=400,
        )
    if not final_inv.clearance_charges_confirmed:
        return Response(
            {"error": "Clearance charges (taxes & disbursements) must be captured on the final invoice before dispatch."},
            status=400,
        )
    if final_inv.status != "paid":
        return Response(
            {"error": "The final invoice must be fully paid before dispatch."},
            status=400,
        )

    from django.utils import timezone
    user = request.user if request.user.is_authenticated else None
    cargo.dispatcher_name = dispatcher_name
    cargo.dispatcher_phone = dispatcher_phone.strip() if dispatcher_phone else ""
    cargo.dispatcher_service = dispatcher_service
    # New: assign pickup fields
    cargo.pickup_assigned_to = user
    cargo.pickup_assigned_at = timezone.now()
    cargo.status = "Pickup Assigned"
    cargo.save()
# Close Pickup (Admin, PATCH)
@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def close_pickup(request, shipment_id):
    """
    Mark a pickup as closed (picked up by dispatcher, ready for warehouse receipt).
    """
    from django.utils import timezone
    try:
        cargo = Cargo.objects.get(id=shipment_id)
    except Cargo.DoesNotExist:
        return Response({"error": "Shipment not found"}, status=404)
    if cargo.status != "Pickup Assigned":
        return Response({"error": f"Can only close pickups with 'Pickup Assigned' status. Current: '{cargo.status}'"}, status=400)
    cargo.pickup_closed_at = timezone.now()
    cargo.status = "Pickup Closed"
    cargo.save()
    serializer = CargoSerializer(cargo, context={"request": request})
    return Response(serializer.data)

# Mark Warehouse Receipt (Admin, PATCH)
@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def mark_warehouse_received(request, shipment_id):
    """
    Mark a shipment as received at the warehouse.
    """
    from django.utils import timezone
    try:
        cargo = Cargo.objects.get(id=shipment_id)
    except Cargo.DoesNotExist:
        return Response({"error": "Shipment not found"}, status=404)
    if cargo.status != "Pickup Closed":
        return Response({"error": f"Can only receive at warehouse from 'Pickup Closed' status. Current: '{cargo.status}'"}, status=400)
    user = request.user if request.user.is_authenticated else None
    cargo.warehouse_received_by = user
    cargo.warehouse_received_at = timezone.now()
    cargo.status = "Received at Warehouse"
    cargo.save()
    serializer = CargoSerializer(cargo, context={"request": request})
    return Response(serializer.data)

    # Upsert DispatchHandler for future autocomplete
    handler, created = DispatchHandler.objects.get_or_create(
        service_name=dispatcher_service,
        contact_name=dispatcher_name,
        defaults={"contact_phone": cargo.dispatcher_phone},
    )
    if not created:
        handler.usage_count = F("usage_count") + 1
        handler.contact_phone = cargo.dispatcher_phone or handler.contact_phone
        handler.save(update_fields=["usage_count", "contact_phone", "last_used"])

    serializer = CargoSerializer(cargo, context={"request": request})
    return Response(serializer.data)

# -----------------------------
# Dispatch Handlers (autocomplete)
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAdminUser])
def list_dispatch_handlers(request):
    q = request.query_params.get("q", "").strip()
    handlers = DispatchHandler.objects.all()
    if q:
        handlers = handlers.filter(
            Q(service_name__icontains=q) | Q(contact_name__icontains=q)
        )
    handlers = handlers[:20]
    serializer = DispatchHandlerSerializer(handlers, many=True)
    return Response(serializer.data)

# -----------------------------
# Client-specific Shipments
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_shipments(request):
    """
    Returns shipments for the authenticated client.
    Only works if request.user.role == 'CLIENT'.
    """
    if request.user.role != "CLIENT":
        return Response({"error": "Not a client user"}, status=403)

    shipments = Cargo.objects.filter(client=request.user).order_by("-intake_date")
    serializer = CargoSerializer(shipments, many=True, context={"request": request})
    return Response(serializer.data)


# -----------------------------
# Create Shipment (Admin, POST)
# -----------------------------
@api_view(["POST"])
@permission_classes([IsAdminUser])
def create_shipment(request):
    serializer = CargoCreateSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({"error": serializer.errors}, status=400)

    data = serializer.validated_data

    # Find or create client
    client = User.objects.filter(email=data["clientEmail"], role="CLIENT").first()
    if not client:
        names = data["clientName"].split(" ", 1)
        client = User.objects.create_user(
            username=data["clientEmail"],
            email=data["clientEmail"],
            first_name=names[0],
            last_name=names[1] if len(names) > 1 else "",
            role="CLIENT",
            phone_number=data.get("clientPhone", ""),
            password=User.objects.make_random_password(),
        )

    # Resolve origin warehouse
    origin = Warehouse.objects.filter(
        Q(code__iexact=data["origin"]) | Q(name__icontains=data["origin"]) | Q(location__icontains=data["origin"])
    ).first()

    # Resolve destination warehouse
    destination = Warehouse.objects.filter(
        Q(code__iexact=data["destination"]) | Q(name__icontains=data["destination"]) | Q(location__icontains=data["destination"])
    ).first()

    cargo = Cargo.objects.create(
        client=client,
        origin=origin,
        destination=destination,
        cargo_type=data.get("packageType", ""),
        transport_mode=data.get("transportMode", ""),
        priority=data.get("priority", "Standard"),
        weight_kg=data.get("weight"),
        volume_cbm=data.get("volume"),
        handling_instructions=data.get("description", ""),
        expected_delivery_date=data.get("deliveryDate"),
        dest_contact_person=data.get("destContactPerson", ""),
        dest_contact_phone=data.get("destContactPhone", ""),
        dest_contact_email=data.get("destContactEmail", ""),
        dest_address_line=data.get("destAddressLine", ""),
        dest_area=data.get("destArea", ""),
        dest_city=data.get("destCity", ""),
        dest_postal_code=data.get("destPostalCode", ""),
        created_by=request.user.email,
        status="Shipment Created",
        shipment_created_at=timezone.now(),
    )

    # Auto-generate proforma invoice for the new shipment
    _create_proforma_invoice(cargo, request.user.email)

    result = CargoSerializer(cargo, context={"request": request})
    return Response(result.data, status=201)


# -----------------------------
# Receive Shipment (update existing pickup request)
# -----------------------------
@api_view(["PATCH"])
@permission_classes([IsAdminUser])
@transaction.atomic
def receive_shipment(request, shipment_id):
    """
    Update an existing Pickup Requested cargo with shipment details
    and advance it to 'Shipment Created', keeping the original tracking number.
    """
    try:
        cargo = Cargo.objects.select_for_update().get(id=shipment_id)
    except Cargo.DoesNotExist:
        return Response({"error": "Shipment not found"}, status=404)

    if cargo.status != "Pickup Requested":
        return Response(
            {"error": f"Can only receive shipments with 'Pickup Requested' status. Current: '{cargo.status}'"},
            status=400,
        )

    data = request.data

    # Update origin warehouse
    origin_str = data.get("origin", "")
    if origin_str:
        origin = Warehouse.objects.filter(
            Q(code__iexact=origin_str) | Q(name__icontains=origin_str) | Q(location__icontains=origin_str)
        ).first()
        if origin:
            cargo.origin = origin

    # Update destination warehouse
    dest_str = data.get("destination", "")
    if dest_str:
        destination = Warehouse.objects.filter(
            Q(code__iexact=dest_str) | Q(name__icontains=dest_str) | Q(location__icontains=dest_str)
        ).first()
        if destination:
            cargo.destination = destination

    # Update shipment details
    if data.get("transportMode"):
        cargo.transport_mode = data["transportMode"]
    if data.get("weight"):
        cargo.weight_kg = data["weight"]
    if data.get("volume"):
        cargo.volume_cbm = data["volume"]
    if data.get("packageType"):
        cargo.cargo_type = data["packageType"]
    if data.get("priority"):
        cargo.priority = data["priority"]
    if data.get("description"):
        cargo.handling_instructions = data["description"]
    if data.get("deliveryDate"):
        cargo.expected_delivery_date = data["deliveryDate"]

    # Update destination contact
    if data.get("destContactPerson"):
        cargo.dest_contact_person = data["destContactPerson"]
    if data.get("destContactPhone"):
        cargo.dest_contact_phone = data["destContactPhone"]
    if data.get("destContactEmail"):
        cargo.dest_contact_email = data["destContactEmail"]
    if data.get("destAddressLine"):
        cargo.dest_address_line = data["destAddressLine"]
    if data.get("destArea"):
        cargo.dest_area = data["destArea"]
    if data.get("destCity"):
        cargo.dest_city = data["destCity"]
    if data.get("destPostalCode"):
        cargo.dest_postal_code = data["destPostalCode"]

    # Advance status
    cargo.status = "Shipment Created"
    cargo.shipment_created_at = timezone.now()
    cargo.created_by = request.user.email
    cargo.save()

    # Auto-generate proforma invoice
    _create_proforma_invoice(cargo, request.user.email)

    result = CargoSerializer(cargo, context={"request": request})
    return Response(result.data)


# -----------------------------
# Confirm Sticker Attachment (Admin/Staff, POST)
# -----------------------------
@api_view(["POST"])
@permission_classes([IsAdminUser])
def confirm_sticker_attachment(request, shipment_id):
    """
    Confirm that the shipping sticker has been printed and physically attached.
    Requires a photo upload of the attached sticker.
    """

    try:
        cargo = Cargo.objects.get(id=shipment_id)
    except Cargo.DoesNotExist:
        return Response({"error": "Shipment not found"}, status=404)

    photo = request.FILES.get("sticker_photo")
    if not photo:
        return Response({"error": "Photo of attached sticker is required"}, status=400)

    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if photo.content_type not in allowed_types:
        return Response({"error": "Only JPEG, PNG, or WebP images are accepted"}, status=400)

    # Validate file size (max 10MB)
    if photo.size > 10 * 1024 * 1024:
        return Response({"error": "Image must be under 10MB"}, status=400)

    cargo.sticker_attached = True
    cargo.sticker_photo = photo
    cargo.sticker_attached_at = timezone.now()
    cargo.sticker_attached_by = request.user.email
    cargo.save()

    result = CargoSerializer(cargo, context={"request": request})
    return Response(result.data)


# -----------------------------
# Record Sticker Print (Admin)
# -----------------------------
@api_view(["POST"])
@permission_classes([IsAdminUser])
def record_sticker_print(request, shipment_id):
    """
    Increment the sticker print count each time a sticker is printed.
    Returns the updated shipment with the new print count.
    """
    try:
        cargo = Cargo.objects.get(id=shipment_id)
    except Cargo.DoesNotExist:
        return Response({"error": "Shipment not found"}, status=404)

    cargo.sticker_print_count = (cargo.sticker_print_count or 0) + 1
    cargo.save(update_fields=["sticker_print_count"])

    result = CargoSerializer(cargo, context={"request": request})
    return Response(result.data)


# -----------------------------
# Search Warehouses (Admin)
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAdminUser])
def search_warehouses(request):
    q = request.query_params.get("q", "").strip()
    if not q:
        return Response([])
    warehouses = Warehouse.objects.filter(
        Q(code__icontains=q) | Q(name__icontains=q) | Q(location__icontains=q)
    )[:10]
    serializer = WarehouseSerializer(warehouses, many=True)
    return Response(serializer.data)


# -----------------------------
# Search Clients (Admin)
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAdminUser])
def search_clients(request):
    q = request.query_params.get("q", "").strip()
    if not q:
        return Response([])
    clients = User.objects.filter(
        role="CLIENT"
    ).filter(
        Q(email__icontains=q) | Q(first_name__icontains=q) | Q(last_name__icontains=q) | Q(phone_number__icontains=q)
    )[:10]
    return Response([
        {
            "id": c.id,
            "name": c.full_name(),
            "email": c.email,
            "phone": c.phone_number or "",
        }
        for c in clients
    ])


# =============================================================
# Status Transition (Admin)
# =============================================================
VALID_TRANSITIONS = {
    "Pickup Requested": ["Shipment Created"],
    "Shipment Created": ["Processing at Origin"],
    "Processing at Origin": ["In Transit"],
    "In Transit": ["Arrived Nairobi Hub"],
    "Arrived Nairobi Hub": ["Dispatched"],
    "Dispatched": ["Delivered"],
}

STATUS_TIMESTAMP_MAP = {
    "Pickup Requested": "pickup_requested_at",
    "Shipment Created": "shipment_created_at",
    "Processing at Origin": "processing_at_origin_at",
    "In Transit": "in_transit_at",
    "Arrived Nairobi Hub": "arrived_nairobi_at",
    "Dispatched": "dispatched_at",
    "Delivered": "delivered_at",
}


@api_view(["PATCH"])
@permission_classes([IsAdminUser])
@transaction.atomic
def update_status(request, shipment_id):
    """
    Advance a shipment to the next lifecycle status.
    Auto-generates proforma invoice on 'Shipment Created'
    and final invoice on 'Arrived Nairobi Hub'.
    """
    try:
        cargo = Cargo.objects.select_for_update().get(id=shipment_id)
    except Cargo.DoesNotExist:
        return Response({"error": "Shipment not found"}, status=404)

    new_status = request.data.get("status")
    if not new_status:
        return Response({"error": "status is required"}, status=400)

    allowed = VALID_TRANSITIONS.get(cargo.status, [])
    if new_status not in allowed:
        return Response(
            {"error": f"Cannot transition from '{cargo.status}' to '{new_status}'. Allowed: {allowed}"},
            status=400,
        )

    # Final invoice must have clearance confirmed and be fully paid before dispatch
    if new_status == "Dispatched":
        final_inv = Invoice.objects.filter(cargo=cargo, invoice_type="final").exclude(status="cancelled").first()
        if not final_inv:
            return Response(
                {"error": "A final invoice must be generated before dispatch."},
                status=400,
            )
        if not final_inv.clearance_charges_confirmed:
            return Response(
                {"error": "Clearance charges (taxes & disbursements) must be captured on the final invoice before dispatch."},
                status=400,
            )
        if final_inv.status != "paid":
            return Response(
                {"error": "The final invoice must be fully paid before dispatch."},
                status=400,
            )

    cargo.status = new_status
    ts_field = STATUS_TIMESTAMP_MAP.get(new_status)
    if ts_field:
        setattr(cargo, ts_field, timezone.now())
    cargo.save()

    # Auto-generate proforma invoice when shipment is created
    if new_status == "Shipment Created":
        _create_proforma_invoice(cargo, request.user.email)

    # Auto-generate final invoice when goods arrive at Nairobi
    if new_status == "Arrived Nairobi Hub":
        _create_final_invoice(cargo, request.user.email)

    serializer = CargoSerializer(cargo, context={"request": request})
    return Response(serializer.data)


def _create_proforma_invoice(cargo, created_by_email):
    """Create a proforma invoice with preset freight rates. Insurance is zero until dispatch."""
    existing = Invoice.objects.filter(cargo=cargo, invoice_type="proforma").exclude(status="cancelled").first()
    if existing:
        return existing

    weight = float(cargo.weight_kg or 0)
    if cargo.transport_mode == "Air":
        freight = round(weight * 12.0, 2)   # Preset: $12/kg air freight
    else:
        freight = round(weight * 3.5, 2)    # Preset: $3.5/kg sea freight

    handling = round(weight * 0.5, 2) if weight else 15.00

    invoice = Invoice.objects.create(
        cargo=cargo,
        user=cargo.client,
        invoice_type="proforma",
        status="issued",
        freight_charge=freight,
        handling_fee=handling,
        insurance=0,          # Updated manually at dispatch
        customs_duty=0,
        excise_duty=0,
        reimbursable_vat=0,
        rdl=0,
        idf=0,
        clearance_fee=0,
        other_charges=0,
        tax_rate=0,
        currency="USD",
        notes="Proforma invoice — estimated freight charges. Insurance will be updated at dispatch. Customs/duties updated at clearance.",
        created_by=created_by_email,
        issued_at=timezone.now(),
    )
    return invoice


def _create_final_invoice(cargo, created_by_email):
    """
    Create a DRAFT final invoice when goods arrive at Nairobi hub.
    Clearance charges (customs_duty, excise_duty, RDL, IDF, clearance_fee)
    must be filled in manually and confirmed before the invoice can be issued.
    """
    existing = Invoice.objects.filter(cargo=cargo, invoice_type="final").exclude(status="cancelled").first()
    if existing:
        return existing

    proforma = Invoice.objects.filter(cargo=cargo, invoice_type="proforma").first()

    weight = float(cargo.weight_kg or 0)
    if cargo.transport_mode == "Air":
        freight = round(weight * 12.0, 2)
    else:
        freight = round(weight * 3.5, 2)

    handling = round(weight * 0.5, 2) if weight else 15.00

    invoice = Invoice.objects.create(
        cargo=cargo,
        user=cargo.client,
        invoice_type="final",
        status="draft",  # Draft until clearance charges are confirmed
        freight_charge=proforma.freight_charge if proforma else freight,
        handling_fee=proforma.handling_fee if proforma else handling,
        insurance=proforma.insurance if proforma else 0,
        other_charges=0,
        customs_duty=0,       # To be filled at clearance
        excise_duty=0,        # To be filled at clearance
        import_vat=0,         # To be filled at clearance
        reimbursable_vat=0,   # Manually entered reimbursable VAT for cargo owner
        port_charges=0,       # To be filled at clearance
        clearance_fee=0,      # To be filled at clearance
        rdl=0,                # To be filled at clearance
        idf=0,                # To be filled at clearance
        tax_rate=16,          # 16% VAT Kenya (on taxable services only)
        clearance_charges_confirmed=False,
        currency="USD",
        notes="Final invoice — DRAFT. Disbursement charges (import duty, excise, import VAT, port charges, clearance fees) must be confirmed before issue. VAT applies only to taxable services.",
        created_by=created_by_email,
    )

    # Retire the proforma now that a final invoice has been generated
    if proforma and proforma.status not in ("cancelled", "retired", "expired"):
        proforma.status = "retired"
        proforma.save(update_fields=["status", "updated_at"])

    return invoice


# =============================================================
# Manual Proforma Invoice Creation
# =============================================================
@api_view(["POST"])
@permission_classes([IsAdminUser])
def create_manual_proforma(request):
    """
    Manually create a proforma invoice for a given cargo.
    Pulls client details and calculates freight/handling from DB.
    Accepts optional overrides for freight_charge, handling_fee, insurance, other_charges.
    """
    cargo_id = request.data.get("cargo_id")
    if not cargo_id:
        return Response({"error": "cargo_id is required"}, status=400)

    try:
        cargo = Cargo.objects.select_related("client", "origin", "destination").get(id=cargo_id)
    except Cargo.DoesNotExist:
        return Response({"error": "Shipment not found"}, status=404)

    # Check for existing active proforma
    existing = Invoice.objects.filter(
        cargo=cargo, invoice_type="proforma"
    ).exclude(status="cancelled").first()
    if existing:
        return Response(
            {"error": f"An active proforma ({existing.invoice_number}) already exists for this shipment."},
            status=400,
        )

    # Calculate default rates from cargo data
    weight = float(cargo.weight_kg or 0)
    if cargo.transport_mode == "Air":
        default_freight = round(weight * 12.0, 2)
    else:
        default_freight = round(weight * 3.5, 2)
    default_handling = round(weight * 0.5, 2) if weight else 15.00

    # Allow overrides from request body
    freight = float(request.data.get("freight_charge", default_freight))
    handling = float(request.data.get("handling_fee", default_handling))
    insurance = float(request.data.get("insurance", 0))
    other = float(request.data.get("other_charges", 0))

    invoice = Invoice.objects.create(
        cargo=cargo,
        user=cargo.client,
        invoice_type="proforma",
        status="issued",
        freight_charge=freight,
        handling_fee=handling,
        insurance=insurance,
        other_charges=other,
        customs_duty=0,
        excise_duty=0,
        import_vat=0,
        reimbursable_vat=0,
        port_charges=0,
        clearance_fee=0,
        rdl=0,
        idf=0,
        tax_rate=0,
        currency="USD",
        notes="Proforma invoice — estimated charges only. This is NOT a final invoice. Actual amounts may vary upon clearance.",
        created_by=request.user.email,
        issued_at=timezone.now(),
    )

    serializer = InvoiceSerializer(invoice)
    return Response(serializer.data, status=201)


# =============================================================
# Invoice endpoints
# =============================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_invoices(request):
    """List all invoices, optionally filtered by cargo or type. Accessible to admin and staff."""
    if not (hasattr(request.user, "role") and request.user.role in ("ADMIN", "STAFF")):
        return Response({"error": "Only admin or staff can view all invoices."}, status=403)

    # Lazily expire/retire stale proformas before returning data
    Invoice.expire_stale_proformas()

    invoices = Invoice.objects.select_related("cargo", "cargo__client", "user").all()

    cargo_id = request.query_params.get("cargo")
    if cargo_id:
        invoices = invoices.filter(cargo_id=cargo_id)

    invoice_type = request.query_params.get("type")
    if invoice_type in ("proforma", "final"):
        invoices = invoices.filter(invoice_type=invoice_type)

    return Response(_paginate(request, invoices, InvoiceSerializer))


@api_view(["GET"])
@permission_classes([IsAdminUser])
def get_invoice(request, invoice_id):
    """Get a single invoice by ID."""
    try:
        invoice = Invoice.objects.select_related("cargo", "cargo__client").get(id=invoice_id)
    except Invoice.DoesNotExist:
        return Response({"error": "Invoice not found"}, status=404)

    serializer = InvoiceSerializer(invoice)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_invoices(request):
    """Return all invoices for the authenticated client's shipments."""
    if request.user.role != "CLIENT":
        return Response({"error": "Not a client user"}, status=403)

    # Lazily expire/retire stale proformas before returning data
    Invoice.expire_stale_proformas()

    invoices = Invoice.objects.filter(
        cargo__client=request.user
    ).select_related("cargo", "cargo__client").order_by("-created_at")

    serializer = InvoiceSerializer(invoices, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def shipment_invoices(request, shipment_id):
    """Get all invoices for a specific shipment."""
    try:
        cargo = Cargo.objects.get(id=shipment_id)
    except Cargo.DoesNotExist:
        return Response({"error": "Shipment not found"}, status=404)

    # Clients can only see their own
    if request.user.role == "CLIENT" and cargo.client != request.user:
        return Response({"error": "Access denied"}, status=403)

    invoices = Invoice.objects.filter(cargo=cargo)
    serializer = InvoiceSerializer(invoices, many=True)
    return Response(serializer.data)


@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def update_invoice(request, invoice_id):
    """Update invoice charges or status (e.g., mark as paid, update clearance fees)."""
    try:
        invoice = Invoice.objects.get(id=invoice_id)
    except Invoice.DoesNotExist:
        return Response({"error": "Invoice not found"}, status=404)

    updatable_fields = [
        "freight_charge", "handling_fee", "insurance", "other_charges",
        "customs_duty", "excise_duty", "import_vat", "reimbursable_vat", "port_charges",
        "clearance_fee", "rdl", "idf",
        "tax_rate", "currency", "notes", "status",
    ]
    for field in updatable_fields:
        if field in request.data:
            setattr(invoice, field, request.data[field])

    if request.data.get("status") == "paid" and not invoice.paid_at:
        invoice.paid_at = timezone.now()

    invoice.save()
    serializer = InvoiceSerializer(invoice)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def confirm_clearance_charges(request, invoice_id):
    """
    Confirm clearance charges on a final invoice draft, then issue it.
    Requires customs_duty, excise_duty, rdl, idf, clearance_fee to be set.
    Only SUPERADMIN and CARGOADMIN roles can perform this.
    """
    if request.user.role not in ("SUPERADMIN", "CARGOADMIN"):
        return Response({"error": "Only Super Admin or Cargo Admin can confirm clearance charges."}, status=403)

    try:
        invoice = Invoice.objects.get(id=invoice_id)
    except Invoice.DoesNotExist:
        return Response({"error": "Invoice not found"}, status=404)

    if invoice.invoice_type != "final":
        return Response({"error": "Only final invoices require clearance confirmation."}, status=400)

    if invoice.clearance_charges_confirmed:
        return Response({"error": "Clearance charges already confirmed."}, status=400)

    # Update clearance charge fields from request
    charge_fields = ["customs_duty", "excise_duty", "import_vat", "reimbursable_vat", "port_charges", "rdl", "idf", "clearance_fee", "other_charges"]
    for field in charge_fields:
        if field in request.data:
            setattr(invoice, field, request.data[field])

    if "tax_rate" in request.data:
        invoice.tax_rate = request.data["tax_rate"]
    if "notes" in request.data:
        invoice.notes = request.data["notes"]

    invoice.clearance_charges_confirmed = True
    invoice.status = "issued"
    invoice.issued_at = timezone.now()
    invoice.save()

    serializer = InvoiceSerializer(invoice)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def record_payment(request, invoice_id):
    """
    Record a payment on an invoice (final or proforma).
    CLIENTADMIN, SUPERADMIN and STAFF roles can post payments.
    For final invoices, clearance charges must be confirmed first.
    """
    if request.user.role not in ("SUPERADMIN", "CLIENTADMIN", "STAFF"):
        return Response({"error": "Only Client Admin, Staff or Super Admin can record payments."}, status=403)

    try:
        invoice = Invoice.objects.get(id=invoice_id)
    except Invoice.DoesNotExist:
        return Response({"error": "Invoice not found"}, status=404)

    # Final invoices must have clearance charges confirmed before payment
    if invoice.invoice_type == "final" and not invoice.clearance_charges_confirmed:
        return Response({"error": "Clearance charges must be confirmed before recording payment."}, status=400)

    if invoice.status == "paid":
        return Response({"error": "This invoice has already been paid."}, status=400)

    if invoice.status == "cancelled":
        return Response({"error": "Cannot record payment on a cancelled invoice."}, status=400)

    payment_method = request.data.get("payment_method")
    if payment_method not in ("cash", "bank", "mpesa", "visa"):
        return Response({"error": "payment_method is required. Must be 'cash', 'bank', 'mpesa' or 'visa'."}, status=400)

    invoice.status = "paid"
    invoice.paid_at = timezone.now()
    invoice.payment_method = payment_method
    invoice.payment_reference = request.data.get("payment_reference", "") or ""
    invoice.save()

    serializer = InvoiceSerializer(invoice)
    return Response(serializer.data)


@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def update_insurance_at_dispatch(request, invoice_id):
    """
    Update insurance cost on a proforma invoice at dispatch time.
    Only SUPERADMIN and CARGOADMIN roles can perform this.
    """
    if request.user.role not in ("SUPERADMIN", "CARGOADMIN"):
        return Response({"error": "Only Super Admin or Cargo Admin can update insurance."}, status=403)

    try:
        invoice = Invoice.objects.get(id=invoice_id)
    except Invoice.DoesNotExist:
        return Response({"error": "Invoice not found"}, status=404)

    insurance = request.data.get("insurance")
    if insurance is None:
        return Response({"error": "insurance field is required."}, status=400)

    invoice.insurance = insurance
    invoice.save()

    serializer = InvoiceSerializer(invoice)
    return Response(serializer.data)


# =============================================================
# Cancellation & Credit Note endpoints
# =============================================================

@api_view(["POST"])
@permission_classes([IsAdminUser])
def request_shipment_cancellation(request, shipment_id):
    """
    CARGOADMIN requests cancellation of a shipment. Requires SuperAdmin approval.
    """
    if request.user.role not in ("CARGOADMIN",):
        return Response({"error": "Only Cargo Admin can request shipment cancellations."}, status=403)

    try:
        cargo = Cargo.objects.get(id=shipment_id)
    except Cargo.DoesNotExist:
        return Response({"error": "Shipment not found"}, status=404)

    if cargo.status in ("Delivered", "Cancelled"):
        return Response({"error": f"Cannot cancel a shipment with status '{cargo.status}'."}, status=400)

    reason = (request.data.get("reason") or "").strip()
    if not reason:
        return Response({"error": "A reason is required for cancellation."}, status=400)

    # Check for existing pending request
    existing = CancellationRequest.objects.filter(cargo=cargo, request_type="shipment", status="pending").first()
    if existing:
        return Response({"error": "A cancellation request is already pending for this shipment."}, status=400)

    cr = CancellationRequest.objects.create(
        request_type="shipment",
        cargo=cargo,
        requested_by=request.user,
        reason=reason,
    )
    serializer = CancellationRequestSerializer(cr)
    return Response(serializer.data, status=201)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def request_invoice_cancellation(request, invoice_id):
    """
    Cancel a proforma invoice immediately (no SuperAdmin approval required).
    Allowed for CLIENTADMIN and STAFF.
    """
    if request.user.role not in ("CLIENTADMIN", "STAFF"):
        return Response({"error": "Only Client Admin or Staff can cancel proforma invoices."}, status=403)

    try:
        invoice = Invoice.objects.get(id=invoice_id)
    except Invoice.DoesNotExist:
        return Response({"error": "Invoice not found"}, status=404)

    if invoice.invoice_type != "proforma":
        return Response({"error": "Only proforma invoices can be cancelled directly. Use credit notes for issued/final invoices."}, status=400)

    if invoice.status in ("cancelled", "retired", "expired"):
        return Response({"error": f"Invoice is already {invoice.status}."}, status=400)

    reason = (request.data.get("reason") or "").strip()
    if not reason:
        return Response({"error": "A reason is required for cancellation."}, status=400)

    invoice.status = "cancelled"
    invoice.notes = (invoice.notes or "") + f"\nCancelled by {request.user.email}: {reason}"
    invoice.save(update_fields=["status", "notes", "updated_at"])

    serializer = InvoiceSerializer(invoice)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def list_cancellation_requests(request):
    """List all cancellation requests. SuperAdmin sees all; others see their own."""
    if request.user.role == "SUPERADMIN":
        qs = CancellationRequest.objects.all()
    else:
        qs = CancellationRequest.objects.filter(requested_by=request.user)

    status_filter = request.query_params.get("status")
    if status_filter in ("pending", "approved", "rejected"):
        qs = qs.filter(status=status_filter)

    serializer = CancellationRequestSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def approve_cancellation(request, request_id):
    """SuperAdmin approves a cancellation request, executing the cancellation."""
    if request.user.role != "SUPERADMIN":
        return Response({"error": "Only Super Admin can approve cancellations."}, status=403)

    try:
        cr = CancellationRequest.objects.get(id=request_id)
    except CancellationRequest.DoesNotExist:
        return Response({"error": "Cancellation request not found"}, status=404)

    if cr.status != "pending":
        return Response({"error": f"Request is already {cr.status}."}, status=400)

    # Execute the cancellation
    if cr.request_type == "shipment" and cr.cargo:
        cr.cargo.status = "Cancelled"
        cr.cargo.save()
        # Cancel any draft/issued invoices for this shipment
        Invoice.objects.filter(cargo=cr.cargo, status__in=["draft", "issued"]).update(status="cancelled")

    elif cr.request_type == "invoice" and cr.invoice:
        cr.invoice.status = "cancelled"
        cr.invoice.save()

    cr.status = "approved"
    cr.reviewed_by = request.user
    cr.reviewed_at = timezone.now()
    cr.save()

    serializer = CancellationRequestSerializer(cr)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def reject_cancellation(request, request_id):
    """SuperAdmin rejects a cancellation request."""
    if request.user.role != "SUPERADMIN":
        return Response({"error": "Only Super Admin can reject cancellations."}, status=403)

    try:
        cr = CancellationRequest.objects.get(id=request_id)
    except CancellationRequest.DoesNotExist:
        return Response({"error": "Cancellation request not found"}, status=404)

    if cr.status != "pending":
        return Response({"error": f"Request is already {cr.status}."}, status=400)

    cr.status = "rejected"
    cr.reviewed_by = request.user
    cr.reviewed_at = timezone.now()
    cr.save()

    serializer = CancellationRequestSerializer(cr)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def request_credit_note(request, invoice_id):
    """
    Request a credit note to reverse an issued/paid invoice.
    Can be requested by CLIENTADMIN or CARGOADMIN. Requires SuperAdmin approval.
    """
    if request.user.role not in ("CLIENTADMIN", "CARGOADMIN", "STAFF"):
        return Response({"error": "Only Client Admin, Cargo Admin, or Staff can request credit notes."}, status=403)

    try:
        invoice = Invoice.objects.get(id=invoice_id)
    except Invoice.DoesNotExist:
        return Response({"error": "Invoice not found"}, status=404)

    if invoice.invoice_type == "proforma":
        return Response({"error": "Credit notes cannot be issued against proforma invoices. Proformas are quotations only — cancel them instead."}, status=400)

    if invoice.status not in ("issued", "paid"):
        return Response({"error": "Credit notes can only be issued against issued or paid invoices."}, status=400)

    amount = request.data.get("amount")
    reason = (request.data.get("reason") or "").strip()

    if not reason:
        return Response({"error": "A reason is required."}, status=400)
    if amount is None:
        return Response({"error": "Amount is required."}, status=400)

    try:
        amount = float(amount)
    except (ValueError, TypeError):
        return Response({"error": "Invalid amount."}, status=400)

    if amount <= 0:
        return Response({"error": "Amount must be positive."}, status=400)

    if amount > float(invoice.total_amount):
        return Response({"error": "Credit note amount cannot exceed invoice total."}, status=400)

    cn = CreditNote.objects.create(
        invoice=invoice,
        amount=amount,
        reason=reason,
        issued_by=request.user,
    )

    # Notify all SuperAdmins
    superadmins = User.objects.filter(role="SUPERADMIN", is_active=True)
    Notification.objects.bulk_create([
        Notification(
            recipient=sa,
            notification_type="credit_note_requested",
            title=f"Credit Note Pending Approval — {invoice.invoice_number}",
            message=(
                f"{request.user.email} has requested a credit note of "
                f"{invoice.currency} {amount:.2f} against invoice "
                f"{invoice.invoice_number} (cargo {invoice.cargo.tracking_number}).\n"
                f"Reason: {reason}"
            ),
            invoice=invoice,
        )
        for sa in superadmins
    ])

    serializer = CreditNoteSerializer(cn)
    return Response(serializer.data, status=201)


@api_view(["GET"])
@permission_classes([IsAdminUser])
def list_credit_notes(request):
    """List all credit notes."""
    qs = CreditNote.objects.select_related("invoice", "issued_by", "approved_by").all()

    invoice_id = request.query_params.get("invoice")
    if invoice_id:
        qs = qs.filter(invoice_id=invoice_id)

    serializer = CreditNoteSerializer(qs, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAdminUser])
def approve_credit_note(request, credit_note_id):
    """SuperAdmin approves a credit note, posting it to the client's account."""
    if request.user.role != "SUPERADMIN":
        return Response({"error": "Only Super Admin can approve credit notes."}, status=403)

    try:
        cn = CreditNote.objects.get(id=credit_note_id)
    except CreditNote.DoesNotExist:
        return Response({"error": "Credit note not found"}, status=404)

    if cn.approved_by:
        return Response({"error": "This credit note has already been approved."}, status=400)

    cn.approved_by = request.user
    cn.approved_at = timezone.now()
    cn.save()

    # If the credit note fully covers the invoice, mark invoice as cancelled
    total_credits = sum(
        float(c.amount)
        for c in CreditNote.objects.filter(invoice=cn.invoice, approved_by__isnull=False)
    )
    if total_credits >= float(cn.invoice.total_amount):
        cn.invoice.status = "cancelled"
        cn.invoice.save()

    serializer = CreditNoteSerializer(cn)
    return Response(serializer.data)


# =============================================================
# Public Track Parcel endpoint (no auth required)
# =============================================================
@api_view(["GET"])
@permission_classes([AllowAny])
def track_parcel(request, tracking_number):
    """
    Track a parcel by tracking number.

    Public visitors see only: tracking number, current status, transport mode,
    origin/destination (city-level), and the timeline.

    Authenticated users who own the shipment (or are staff/admin) also get
    detailed fields like weight, cargo type, dispatcher info, etc.
    """
    try:
        cargo = Cargo.objects.select_related("origin", "destination", "client").get(
            tracking_number=tracking_number
        )
    except Cargo.DoesNotExist:
        return Response({"error": "We couldn't retrieve any tracking information. Please verify your tracking number and try again."}, status=404)

    # Build timeline from lifecycle timestamps
    TIMELINE_STEPS = [
        ("Pickup Requested", "pickup_requested_at"),
        ("Shipment Created", "shipment_created_at"),
        ("Processing at Origin", "processing_at_origin_at"),
        ("In Transit", "in_transit_at"),
        ("Arrived Nairobi Hub", "arrived_nairobi_at"),
        ("Dispatched", "dispatched_at"),
        ("Delivered", "delivered_at"),
    ]

    timeline = []
    for label, field in TIMELINE_STEPS:
        ts = getattr(cargo, field, None)
        timeline.append({
            "status": label,
            "timestamp": ts.isoformat() if ts else None,
            "completed": ts is not None,
        })

    # Public-safe data: status + timeline only
    data = {
        "tracking_number": cargo.tracking_number,
        "status": cargo.status,
        "origin": cargo.origin.name or cargo.origin.code if cargo.origin else None,
        "destination": cargo.destination.name or cargo.destination.code if cargo.destination else None,
        "transport_mode": cargo.transport_mode,
        "timeline": timeline,
    }

    # Authenticated owner or staff/admin gets full details
    user = request.user
    is_authenticated = user and user.is_authenticated
    is_owner = is_authenticated and cargo.client_id == user.id
    is_staff_or_admin = is_authenticated and user.role in (
        "SUPERADMIN", "CARGOADMIN", "ADMIN", "CLIENTADMIN", "STAFF",
    )

    if is_owner or is_staff_or_admin:
        data.update({
            "priority": cargo.priority,
            "cargo_type": cargo.cargo_type,
            "weight_kg": float(cargo.weight_kg) if cargo.weight_kg else None,
            "expected_delivery_date": cargo.expected_delivery_date.isoformat() if cargo.expected_delivery_date else None,
            "intake_date": cargo.intake_date.isoformat() if cargo.intake_date else None,
            "dispatcher_name": cargo.dispatcher_name,
            "dispatcher_service": cargo.dispatcher_service,
        })

    return Response(data)


# =============================================================
# QR Scan Endpoints (requires authentication)
# =============================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def scan_shipment(request, tracking_number):
    """Look up a shipment by tracking number (scanned from QR code)."""
    try:
        cargo = Cargo.objects.get(tracking_number=tracking_number)
    except Cargo.DoesNotExist:
        return Response({"error": "Shipment not found"}, status=404)

    serializer = CargoSerializer(cargo, context={"request": request})
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@transaction.atomic
def scan_update_status(request, tracking_number):
    """
    Update shipment status via QR scan. Requires the user to be logged in.
    Only staff/admin roles can update status.
    """
    if request.user.role not in ("SUPERADMIN", "CARGOADMIN", "ADMIN", "CLIENTADMIN", "STAFF"):
        return Response({"error": "You do not have permission to update shipment status."}, status=403)

    try:
        cargo = Cargo.objects.select_for_update().get(tracking_number=tracking_number)
    except Cargo.DoesNotExist:
        return Response({"error": "Shipment not found"}, status=404)

    new_status = request.data.get("status")
    if not new_status:
        return Response({"error": "status is required"}, status=400)

    allowed = VALID_TRANSITIONS.get(cargo.status, [])
    if new_status not in allowed:
        return Response(
            {"error": f"Cannot transition from '{cargo.status}' to '{new_status}'. Allowed: {allowed}"},
            status=400,
        )

    # Final invoice must have clearance confirmed and be fully paid before dispatch
    if new_status == "Dispatched":
        final_inv = Invoice.objects.filter(cargo=cargo, invoice_type="final").exclude(status="cancelled").first()
        if not final_inv:
            return Response(
                {"error": "A final invoice must be generated before dispatch."},
                status=400,
            )
        if not final_inv.clearance_charges_confirmed:
            return Response(
                {"error": "Clearance charges (taxes & disbursements) must be captured on the final invoice before dispatch."},
                status=400,
            )
        if final_inv.status != "paid":
            return Response(
                {"error": "The final invoice must be fully paid before dispatch."},
                status=400,
            )

    cargo.status = new_status
    ts_field = STATUS_TIMESTAMP_MAP.get(new_status)
    if ts_field:
        setattr(cargo, ts_field, timezone.now())
    cargo.save()

    # Auto-generate proforma invoice when shipment is created
    if new_status == "Shipment Created":
        _create_proforma_invoice(cargo, request.user.email)

    # Auto-generate final invoice when goods arrive at Nairobi
    if new_status == "Arrived Nairobi Hub":
        _create_final_invoice(cargo, request.user.email)

    serializer = CargoSerializer(cargo, context={"request": request})
    return Response(serializer.data)


# =============================================================
# Public Pickup Request (no auth required)
# =============================================================
@api_view(["POST"])
@permission_classes([AllowAny])
def pickup_request_create(request):
    """
    Public endpoint for clients to request a pickup from the landing page.
    Creates a Cargo record with "Pickup Requested" status.
    """
    data = request.data
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    phone = (data.get("phone") or "").strip()

    if not name or not email:
        return Response({"error": "Name and email are required."}, status=400)

    # Validate email format
    from django.core.validators import validate_email
    from django.core.exceptions import ValidationError as DjValidationError
    try:
        validate_email(email)
    except DjValidationError:
        return Response({"error": "Invalid email address."}, status=400)

    # Find or create the client user
    client = User.objects.filter(email=email, role="CLIENT").first()
    if not client:
        names = name.split(" ", 1)
        client = User.objects.create_user(
            username=email,
            email=email,
            first_name=names[0],
            last_name=names[1] if len(names) > 1 else "",
            role="CLIENT",
            phone_number=phone,
            password=User.objects.make_random_password(),
        )

    # Build address from form fields
    street = data.get("street", "")
    city = data.get("city", "")
    state = data.get("state", "")
    zipcode = data.get("zip", "")
    address_parts = [p for p in [street, city, state, zipcode] if p]
    address = ", ".join(address_parts)

    cargo = Cargo.objects.create(
        client=client,
        status="Pickup Requested",
        pickup_requested_at=timezone.now(),
        handling_instructions=data.get("packageDetails", ""),
        dest_contact_person=data.get("contactPerson", ""),
        dest_contact_phone=data.get("contactPhone", ""),
        dest_contact_email=email,
        created_by=f"pickup-form:{email}",
    )

    return Response({
        "message": "Pickup request submitted successfully.",
        "tracking_number": cargo.tracking_number,
    }, status=201)


# ═══════════════════════════════════════
# Staff Reports
# ═══════════════════════════════════════
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def staff_reports(request):
    """
    Consolidated reports endpoint for the staff dashboard.
    Query params:
      - period: day | week | month | year | custom  (default: month)
      - date_from / date_to: for custom range (YYYY-MM-DD)
    """
    now = timezone.now()
    period = request.query_params.get("period", "month")
    date_from = request.query_params.get("date_from")
    date_to = request.query_params.get("date_to")

    # Determine date range
    if period == "custom" and date_from:
        from datetime import datetime as dt
        start = timezone.make_aware(dt.strptime(date_from, "%Y-%m-%d"))
        end = timezone.make_aware(dt.strptime(date_to, "%Y-%m-%d").replace(hour=23, minute=59, second=59)) if date_to else now
    elif period == "day":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end = now
    elif period == "week":
        start = now - timedelta(days=7)
        end = now
    elif period == "year":
        start = now - timedelta(days=365)
        end = now
    else:  # month
        start = now - timedelta(days=30)
        end = now

    # ── Shipment metrics ──
    all_shipments_qs = Cargo.objects.all()
    period_shipments = all_shipments_qs.filter(intake_date__range=(start, end))

    shipments_by_status = dict(
        period_shipments.values_list("status").annotate(c=Count("id")).values_list("status", "c")
    )
    shipments_by_mode = dict(
        period_shipments.exclude(transport_mode__isnull=True)
        .values_list("transport_mode").annotate(c=Count("id")).values_list("transport_mode", "c")
    )
    total_weight = period_shipments.aggregate(w=Sum("weight_kg"))["w"] or Decimal("0")

    delivered_count = period_shipments.filter(status="Delivered").count()
    total_period = period_shipments.count()

    # Daily shipment trend
    daily_trend = list(
        period_shipments.annotate(day=TruncDate("intake_date"))
        .values("day")
        .annotate(count=Count("id"))
        .order_by("day")
        .values("day", "count")
    )

    # ── Invoice / Revenue metrics ──
    all_invoices_qs = Invoice.objects.all()
    period_invoices = all_invoices_qs.filter(created_at__range=(start, end))

    # We need to compute revenue from paid invoices in the period
    paid_invoices = period_invoices.filter(status="paid")
    # Sum taxable fields individually since total_amount is a property
    paid_agg = paid_invoices.aggregate(
        freight=Sum("freight_charge"),
        handling=Sum("handling_fee"),
        insurance=Sum("insurance"),
        other=Sum("other_charges"),
        customs=Sum("customs_duty"),
        excise=Sum("excise_duty"),
        imp_vat=Sum("import_vat"),
        reimb_vat=Sum("reimbursable_vat"),
        port=Sum("port_charges"),
        clearance=Sum("clearance_fee"),
        rdl_sum=Sum("rdl"),
        idf_sum=Sum("idf"),
    )
    z = Decimal("0")
    taxable_total = (paid_agg["freight"] or z) + (paid_agg["handling"] or z) + (paid_agg["insurance"] or z) + (paid_agg["other"] or z)
    disbursements_total = ((paid_agg["customs"] or z) + (paid_agg["excise"] or z) + (paid_agg["imp_vat"] or z) + (paid_agg["reimb_vat"] or z)
                          + (paid_agg["port"] or z) + (paid_agg["clearance"] or z)
                          + (paid_agg["rdl_sum"] or z) + (paid_agg["idf_sum"] or z))

    # Compute vat from each paid invoice
    vat_collected = z
    for inv in paid_invoices:
        vat_collected += inv.tax_amount

    revenue_collected = taxable_total + vat_collected + disbursements_total

    # Outstanding (issued proformas)
    outstanding_invoices = period_invoices.filter(status="issued", invoice_type="proforma")
    outstanding_total = z
    for inv in outstanding_invoices:
        outstanding_total += inv.total_amount

    invoices_by_status = dict(
        period_invoices.values_list("status").annotate(c=Count("id")).values_list("status", "c")
    )
    invoices_by_type = dict(
        period_invoices.values_list("invoice_type").annotate(c=Count("id")).values_list("invoice_type", "c")
    )

    # Payment method breakdown
    payment_methods = dict(
        paid_invoices.exclude(payment_method__isnull=True)
        .values_list("payment_method").annotate(c=Count("id")).values_list("payment_method", "c")
    )

    # Revenue trend by day
    # Since total_amount is a property, we compute as sum of fields + approx tax
    revenue_by_day = []
    daily_paid = (
        paid_invoices.annotate(day=TruncDate("paid_at"))
        .values("day")
        .annotate(
            day_freight=Sum("freight_charge"),
            day_handling=Sum("handling_fee"),
            day_insurance=Sum("insurance"),
            day_other=Sum("other_charges"),
            day_customs=Sum("customs_duty"),
            day_excise=Sum("excise_duty"),
            day_imp_vat=Sum("import_vat"),
            day_reimb_vat=Sum("reimbursable_vat"),
            day_port=Sum("port_charges"),
            day_clearance=Sum("clearance_fee"),
            day_rdl=Sum("rdl"),
            day_idf=Sum("idf"),
            count=Count("id"),
        )
        .order_by("day")
    )
    for row in daily_paid:
        day_taxable = (row["day_freight"] or z) + (row["day_handling"] or z) + (row["day_insurance"] or z) + (row["day_other"] or z)
        day_disb = ((row["day_customs"] or z) + (row["day_excise"] or z) + (row["day_imp_vat"] or z) + (row["day_reimb_vat"] or z)
                    + (row["day_port"] or z) + (row["day_clearance"] or z) + (row["day_rdl"] or z) + (row["day_idf"] or z))
        day_vat = round(day_taxable * Decimal("0.16"), 2)  # approximate with default rate
        revenue_by_day.append({
            "day": row["day"],
            "amount": float(day_taxable + day_vat + day_disb),
            "count": row["count"],
        })

    # ── Client metrics ──
    active_clients = User.objects.filter(role="CLIENT", cargos__intake_date__range=(start, end)).distinct().count()
    top_clients = list(
        User.objects.filter(role="CLIENT", cargos__intake_date__range=(start, end))
        .annotate(shipment_count=Count("cargos", filter=Q(cargos__intake_date__range=(start, end))))
        .order_by("-shipment_count")[:10]
        .values("id", "first_name", "last_name", "email", "shipment_count")
    )
    for c in top_clients:
        c["name"] = f"{c['first_name']} {c['last_name']}".strip() or c["email"]

    # ── Pipeline snapshot ──
    pipeline_counts = dict(
        all_shipments_qs.exclude(status__in=["Delivered", "Cancelled"])
        .values_list("status").annotate(c=Count("id")).values_list("status", "c")
    )

    # ── Determine if user has revenue visibility ──
    user_role = getattr(request.user, "role", "")
    show_revenue = user_role in ("SUPERADMIN", "CARGOADMIN")

    response_data = {
        "period": period,
        "date_range": {"from": start.isoformat(), "to": end.isoformat()},

        "shipments": {
            "total": total_period,
            "delivered": delivered_count,
            "delivery_rate": round(delivered_count / total_period * 100, 1) if total_period else 0,
            "total_weight_kg": float(total_weight),
            "by_status": shipments_by_status,
            "by_mode": shipments_by_mode,
            "daily_trend": [{"day": str(d["day"]), "count": d["count"]} for d in daily_trend],
        },

        "invoices": {
            "total": period_invoices.count(),
            "by_status": invoices_by_status,
            "by_type": invoices_by_type,
            "payment_methods": payment_methods,
            "paid_count": paid_invoices.count(),
            "outstanding_count": outstanding_invoices.count(),
        },

        "clients": {
            "active": active_clients,
            "total": User.objects.filter(role="CLIENT").count(),
            "top": top_clients,
        },

        "pipeline": pipeline_counts,
    }

    if show_revenue:
        response_data["revenue"] = {
            "collected": float(revenue_collected),
            "outstanding": float(outstanding_total),
            "taxable_services": float(taxable_total),
            "vat_collected": float(vat_collected),
            "disbursements": float(disbursements_total),
            "by_day": revenue_by_day,
        }

    return Response(response_data)