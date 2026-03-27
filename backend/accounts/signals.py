# accounts/signals.py
# No UserProfile needed anymore

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User

# Optional: add signals here if you want to trigger something after a User is created
@receiver(post_save, sender=User)
def user_post_save(sender, instance, created, **kwargs):
    if created:
        # Example: log user creation, send welcome email, etc.
        print(f"New user created: {instance.username}")