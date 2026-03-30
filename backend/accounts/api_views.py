
# =========================================================
# Imports
# =========================================================
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.utils import timezone
from .models import DeleteRequest
from .serializers import AdminListSerializer, RegisterSerializer

# =========================================================
# Permissions (must be at the very top before any usage)
# =========================================================
class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == "SUPERADMIN"

# =========================================================
# CREATE SUPERADMIN (API)
# =========================================================
@api_view(["POST"])
@permission_classes([IsSuperAdmin, IsAuthenticated])
def create_superadmin(request):
    data = request.data.copy()
    data["role"] = "SUPERADMIN"  # Force role
    serializer = RegisterSerializer(data=data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "message": "SuperAdmin created successfully."
        }, status=201)
    return Response(serializer.errors, status=400)

# accounts/api_views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission

from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.utils import timezone


from .models import DeleteRequest
from .serializers import AdminListSerializer

# =========================================================
# Permissions (move to top so IsSuperAdmin is defined before use)
# =========================================================
class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == "SUPERADMIN"

# =========================================================
# DASHBOARD ACTIVITY & SERVICES (PLACEHOLDER)
# =========================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_activity(request):
    # TODO: Replace with real activity data
    return Response({"activity": []})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_services(request):
    # TODO: Replace with real services data
    return Response({"services": []})

# =========================================================
# CLIENT UPDATE
# =========================================================
@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def update_client(request, user_id):
    if request.user.role not in ("SUPERADMIN", "CARGOADMIN", "CLIENTADMIN"):
        return Response({"error": "Not allowed"}, status=403)

    try:
        client = User.objects.get(id=user_id, role="CLIENT")
    except User.DoesNotExist:
        return Response({"error": "Client not found"}, status=404)

    data = request.data
    # Update allowed fields
    if "name" in data:
        if hasattr(client, 'full_name'):
            client.full_name = data["name"]
        elif hasattr(client, 'first_name') and hasattr(client, 'last_name'):
            names = data["name"].split(" ", 1)
            client.first_name = names[0]
            if len(names) > 1:
                client.last_name = names[1]
        else:
            client.username = data["name"]
    if "email" in data:
        client.email = data["email"]
    if "isActive" in data:
        client.is_active = data["isActive"]

    # Handle role change to STAFF
    if "role" in data and data["role"] == "STAFF" and client.role == "CLIENT":
        # Only allow immediate conversion if superadmin
        if hasattr(request.user, "role") and request.user.role == "SUPERADMIN":
            client.role = "STAFF"
            client.is_active = True
            client.save()
            return Response({"message": "Client converted to staff"})
        else:
            # Create approval request for superadmin
            from .models import DeleteRequest
            if not DeleteRequest.objects.filter(target_type="client", target_id=client.id, approved=False, rejected=False).exists():
                DeleteRequest.objects.create(
                    user=request.user,
                    target_type="client",
                    target_id=client.id,
                    reason="Request to convert client to staff"
                )
            client.save()
            return Response({"message": "Approval request sent to superadmin"}, status=202)

    client.save()
    return Response({"message": "Client updated"})

# =========================================================
# STAFF UPDATE
# =========================================================
@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def update_staff(request, user_id):
    if request.user.role not in ("SUPERADMIN",):
        return Response({"error": "Not allowed"}, status=403)

    try:
        staff = User.objects.get(id=user_id, role__in=["STAFF", "CARGOADMIN", "CLIENTADMIN"])
    except User.DoesNotExist:
        return Response({"error": "Staff not found"}, status=404)

    data = request.data
    # Update allowed fields
    if "name" in data:
        if hasattr(staff, 'full_name'):
            staff.full_name = data["name"]
        elif hasattr(staff, 'first_name') and hasattr(staff, 'last_name'):
            names = data["name"].split(" ", 1)
            staff.first_name = names[0]
            if len(names) > 1:
                staff.last_name = names[1]
        else:
            staff.username = data["name"]
    if "email" in data:
        staff.email = data["email"]
    if "isActive" in data:
        staff.is_active = data["isActive"]
    if "role" in data:
        staff.role = data["role"]
    staff.save()
    return Response({"message": "Staff updated"})

User = get_user_model()

# =========================================================
# Permissions
# =========================================================
class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.role == "SUPERADMIN"

# =========================================================
# AUTHENTICATION
# =========================================================
@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    data = request.data

    if User.objects.filter(email=data.get("email")).exists():
        return Response({"error": "User already exists"}, status=400)

    if data.get("password") != data.get("confirm_password"):
        return Response({"error": "Passwords do not match"}, status=400)

    try:
        validate_password(data.get("password"))
    except ValidationError as e:
        return Response({"error": list(e.messages)}, status=400)

    user = User.objects.create_user(
        username=data.get("email"),
        email=data.get("email"),
        password=data.get("password"),
        first_name=data.get("first_name", ""),
        last_name=data.get("last_name", ""),
        role="CLIENT",  # Public registration is always CLIENT — admins create other roles internally
    )

    refresh = RefreshToken.for_user(user)

    return Response({
        "email": user.email,
        "role": user.role,
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    })


@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    email = request.data.get("email")
    password = request.data.get("password")

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"error": "Invalid credentials"}, status=401)

    if not user.check_password(password):
        return Response({"error": "Invalid credentials"}, status=401)

    refresh = RefreshToken.for_user(user)

    return Response({
        "email": user.email,
        "role": user.role,
        "access": str(refresh.access_token),
        "refresh": str(refresh),
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    return Response({
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "role": user.role,
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    old_password = request.data.get("old_password")
    new_password = request.data.get("new_password")
    confirm_password = request.data.get("confirm_password")

    if not all([old_password, new_password, confirm_password]):
        return Response({"error": "All fields are required"}, status=400)

    if new_password != confirm_password:
        return Response({"error": "Passwords do not match"}, status=400)

    if not user.check_password(old_password):
        return Response({"error": "Old password is incorrect"}, status=400)

    try:
        validate_password(new_password, user)
    except ValidationError as e:
        return Response({"error": list(e.messages)}, status=400)

    user.set_password(new_password)
    user.save()
    return Response({"message": "Password changed successfully"})


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_request(request):
    email = request.data.get("email")
    if not email:
        return Response({"error": "Email is required"}, status=400)

    try:
        user = User.objects.get(email=email)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f"http://localhost:5173/reset-password/{uid}/{token}/"

        send_mail(
            "Password Reset Request",
            f"Use this link to reset your password: {reset_url}",
            "no-reply@example.com",
            [email],
        )
    except User.DoesNotExist:
        pass  # Do not reveal whether the email exists

    return Response({"message": "If the email exists, a password reset link has been sent"})


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    uidb64 = request.data.get("uid")
    token = request.data.get("token")
    new_password = request.data.get("new_password")
    confirm_password = request.data.get("confirm_password")

    if not all([uidb64, token, new_password, confirm_password]):
        return Response({"error": "All fields are required"}, status=400)

    if new_password != confirm_password:
        return Response({"error": "Passwords do not match"}, status=400)

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
        if not default_token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired token"}, status=400)

        validate_password(new_password, user)
        user.set_password(new_password)
        user.save()
        return Response({"message": "Password has been reset successfully"})
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({"error": "Invalid uid"}, status=400)


# =========================================================
# DELETE REQUEST WORKFLOW
# =========================================================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def request_delete(request):
    user = request.user
    target_type = request.data.get("target_type")
    target_id = request.data.get("target_id")
    reason = request.data.get("reason", "")

    if user.role not in ["CARGOADMIN", "CLIENTADMIN"]:
        return Response({"error": "Not allowed"}, status=403)

    if target_type not in ["staff", "client", "shipment"]:
        return Response({"error": "Invalid target type"}, status=400)

    if DeleteRequest.objects.filter(target_type=target_type, target_id=target_id, approved=False, rejected=False).exists():
        return Response({"error": "Request already exists"}, status=400)

    dr = DeleteRequest.objects.create(
        user=user,
        target_type=target_type,
        target_id=target_id,
        reason=reason
    )
    return Response({"message": "Request submitted", "id": dr.id})


@api_view(["POST"])
@permission_classes([IsSuperAdmin])
def approve_delete(request):
    req_id = request.data.get("request_id")
    try:
        dr = DeleteRequest.objects.get(id=req_id, approved=False, rejected=False)
    except DeleteRequest.DoesNotExist:
        return Response({"error": "Request not found"}, status=404)

    if dr.target_type == "staff":
        User.objects.filter(id=dr.target_id).delete()
    elif dr.target_type == "client":
        User.objects.filter(id=dr.target_id).delete()
    elif dr.target_type == "shipment":
        from shipments.models import Cargo
        Cargo.objects.filter(id=dr.target_id).delete()

    dr.approved = True
    dr.approved_at = timezone.now()
    dr.save()
    return Response({"message": "Deletion approved"})


@api_view(["POST"])
@permission_classes([IsSuperAdmin])
def reject_delete(request):
    req_id = request.data.get("request_id")
    try:
        dr = DeleteRequest.objects.get(id=req_id, approved=False, rejected=False)
    except DeleteRequest.DoesNotExist:
        return Response({"error": "Request not found"}, status=404)

    dr.rejected = True
    dr.approved_at = timezone.now()
    dr.save()
    return Response({"message": "Request rejected"})


@api_view(["GET"])
@permission_classes([IsSuperAdmin])
def list_delete_requests(request):
    requests = DeleteRequest.objects.all().order_by("-created_at")
    data = [
        {
            "id": r.id,
            "user": r.user.email,
            "target_type": r.target_type,
            "target_id": r.target_id,
            "reason": r.reason,
            "status": "approved" if r.approved else "rejected" if r.rejected else "pending",
            "created_at": r.created_at,
        }
        for r in requests
    ]
    return Response(data)


# =========================================================
# DASHBOARD STATS
# =========================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    return Response({
        "totalClients": User.objects.filter(role="CLIENT").count(),
        "totalAdmins": User.objects.filter(role__in=["SUPERADMIN", "CARGOADMIN", "CLIENTADMIN"]).count(),
        "totalStaff": User.objects.filter(role="STAFF").count(),
    })


# =========================================================
# LIST USERS
# =========================================================
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_admins(request):
    admins = User.objects.filter(role__in=["SUPERADMIN", "CARGOADMIN", "CLIENTADMIN"])
    serializer = AdminListSerializer(admins, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_clients(request):
    clients = User.objects.filter(role="CLIENT")
    return Response([
        {
            "id": c.id,
            "name": c.full_name() if hasattr(c, 'full_name') else c.get_full_name() if hasattr(c, 'get_full_name') else c.username,
            "email": c.email,
            "phone": getattr(c, 'phone_number', ''),
            "isActive": c.is_active,
        }
        for c in clients
    ])


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_staff(request):
    # Superadmin sees all staff, cargo admins, and client admins
    if hasattr(request.user, 'role') and request.user.role == "SUPERADMIN":
        users = User.objects.filter(role__in=["STAFF", "CARGOADMIN", "CLIENTADMIN"])
    else:
        users = User.objects.filter(role="STAFF")
    return Response([
        {
            "id": u.id,
            "name": u.full_name() if hasattr(u, 'full_name') else u.get_full_name() if hasattr(u, 'get_full_name') else u.username,
            "email": u.email,
            "role": getattr(u, 'role', ''),
            "isActive": u.is_active,
        }
        for u in users
    ])