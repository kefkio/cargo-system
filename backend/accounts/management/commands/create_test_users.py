# accounts/management/commands/create_test_users.py

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()  # uses your custom User model

class Command(BaseCommand):
    help = "Create test users: superuser, staff, client"

    def handle(self, *args, **options):
        users = [
            {
                "username": "admin",
                "email": "admin@example.com",
                "password": "AdminPass123!",
                "is_superuser": True,
                "is_staff": True,
                # Role values must match User.ROLE_CHOICES
                "role": "SUPERADMIN",
            },
            {
                "username": "staff1",
                "email": "staff1@example.com",
                "password": "StaffPass123!",
                "is_superuser": False,
                "is_staff": True,
                # This user is intended to be a cargo admin user
                "role": "CARGOADMIN",
            },
            {
                "username": "client1",
                "email": "client1@example.com",
                "password": "ClientPass123!",
                "is_superuser": False,
                "is_staff": False,
                "role": "CLIENT",
            },
        ]

        for u in users:
            if User.objects.filter(username=u["username"]).exists() or User.objects.filter(email=u["email"]).exists():
                self.stdout.write(self.style.WARNING(
                    f"User {u['username']} or email {u['email']} already exists. Skipping."
                ))
                continue

            user = User.objects.create_user(
                username=u["username"],
                email=u["email"],
                password=u["password"]
            )
            user.is_superuser = u["is_superuser"]
            user.is_staff = u["is_staff"]

            # Set role if your custom User model has it
            if hasattr(user, "role"):
                user.role = u["role"]

            user.save()
            self.stdout.write(self.style.SUCCESS(f"Created user {u['username']} ({u['role']})"))