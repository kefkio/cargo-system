from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
from django.utils import timezone


# =========================================================
# Custom User Model
# =========================================================
class User(AbstractUser):
    ROLE_CHOICES = [
        ('SUPERADMIN', 'Super Admin'),
        ('CARGOADMIN', 'Cargo Admin'),
        ('CLIENTADMIN', 'Client Admin'),
        ('STAFF', 'Staff'),
        ('CLIENT', 'Client'),
    ]

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='CLIENT'
    )

    phone_validator = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be in format: '+254712345678'"
    )

    phone_number = models.CharField(
        validators=[phone_validator],
        max_length=20,
        blank=True,
        null=True
    )

    address = models.CharField(max_length=255, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    kra_pin = models.CharField(max_length=20, blank=True, null=True, help_text="KRA PIN e.g. P051234567X")

    email = models.EmailField(unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"

    # ---------- ROLE HELPERS ----------
    def is_superadmin(self):
        return self.role == 'SUPERADMIN'

    def is_cargoadmin(self):
        return self.role == 'CARGOADMIN'

    def is_clientadmin(self):
        return self.role == 'CLIENTADMIN'

    def is_staff_user(self):
        return self.role in ['SUPERADMIN', 'CARGOADMIN', 'CLIENTADMIN', 'STAFF']

    def is_client_user(self):
        return self.role == 'CLIENT'

    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip() or self.username

    def save(self, *args, **kwargs):
        if self.role == 'SUPERADMIN':
            self.is_staff = True
            self.is_superuser = True
        elif self.role in ['CARGOADMIN', 'CLIENTADMIN', 'STAFF']:
            self.is_staff = True
            self.is_superuser = False
        else:
            self.is_staff = False
            self.is_superuser = False

        super().save(*args, **kwargs)


# =========================================================
# Delete Request Model (Approval Workflow)
# =========================================================
class DeleteRequest(models.Model):
    TARGET_CHOICES = [
        ("staff", "Staff"),
        ("client", "Client"),
        ("shipment", "Shipment"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="delete_requests")
    target_type = models.CharField(max_length=32, choices=TARGET_CHOICES)
    target_id = models.IntegerField()

    reason = models.TextField(blank=True, null=True)

    approved = models.BooleanField(default=False)
    rejected = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(blank=True, null=True)

    def approve(self):
        self.approved = True
        self.rejected = False
        self.approved_at = timezone.now()
        self.save()

    def reject(self):
        self.rejected = True
        self.approved = False
        self.save()

    def __str__(self):
        status = "Approved" if self.approved else "Rejected" if self.rejected else "Pending"
        return f"{self.target_type}:{self.target_id} by {self.user.email} ({status})"