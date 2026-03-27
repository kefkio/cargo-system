# accounts/validators.py
import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class StrongPasswordValidator:
    """
    Enforces a strong password policy:
    - Minimum 8 characters
    - At least 1 uppercase letter
    - At least 1 lowercase letter
    - At least 1 number
    - At least 1 special character
    """
    def validate(self, password, user=None):
        if len(password) < 8:
            raise ValidationError(_("Password must be at least 8 characters long."))
        if not re.search(r"[A-Z]", password):
            raise ValidationError(_("Password must contain at least 1 uppercase letter."))
        if not re.search(r"[a-z]", password):
            raise ValidationError(_("Password must contain at least 1 lowercase letter."))
        if not re.search(r"[0-9]", password):
            raise ValidationError(_("Password must contain at least 1 number."))
        if not re.search(r"[^A-Za-z0-9]", password):
            raise ValidationError(_("Password must contain at least 1 special character."))

    def get_help_text(self):
        return _(
            "Your password must be at least 8 characters long, contain uppercase, "
            "lowercase letters, a number, and a special character."
        )