# backend/accounts/views.py
from django.shortcuts import render, redirect
from django.contrib.auth import get_user_model
from django.contrib import messages
from django.contrib.auth.forms import PasswordResetForm, SetPasswordForm
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.template.loader import render_to_string
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from .forms import UserSignupForm  # Assuming ClientSignupForm is optional
from shipments.models import Client  # Link client profile

User = get_user_model()


# -----------------------------
# General User Signup View
# -----------------------------
def user_signup(request):
    """
    Signup flow for all roles:
    - Creates a User
    - Creates a Client profile if role='CLIENT'
    """
    if request.method == "POST":
        form = UserSignupForm(request.POST)
        if form.is_valid():
            # Split full name
            names = form.cleaned_data['full_name'].split()
            first_name = names[0]
            last_name = ' '.join(names[1:]) if len(names) > 1 else ''

            # Create the User
            user = User.objects.create_user(
                username=form.cleaned_data['email'],
                email=form.cleaned_data['email'],
                first_name=first_name,
                last_name=last_name,
                password=form.cleaned_data['password'],
                role=form.cleaned_data['role'],
                phone_number=form.cleaned_data['phone_number'],
                address=form.cleaned_data['address'],
                date_of_birth=form.cleaned_data['date_of_birth'],
            )

            # If role is CLIENT, create a Client profile for admin approval
            if user.role == 'CLIENT':
                Client.objects.create(
                    user=user,
                    phone=form.cleaned_data['phone_number'],
                    address=form.cleaned_data['address'],
                    is_approved=False
                )

            messages.success(request, f"Account created for {user.email}. Await admin approval.")
            return render(request, 'signup_success.html', {"email": user.email})
    else:
        form = UserSignupForm()
    return render(request, 'user_signup.html', {"form": form})


# -----------------------------
# Password Reset Request View
# -----------------------------
def password_reset_request(request):
    """
    Allows any user to request a password reset via email.
    """
    if request.method == "POST":
        form = PasswordResetForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data["email"]
            associated_users = User.objects.filter(email=email)
            if associated_users.exists():
                for user in associated_users:
                    subject = "Password Reset Requested"
                    email_template_name = "accounts/password_reset_email.html"
                    context = {
                        "email": user.email,
                        "domain": request.get_host(),
                        "site_name": "Your Site Name",
                        "uid": urlsafe_base64_encode(force_bytes(user.pk)),
                        "user": user,
                        "token": default_token_generator.make_token(user),
                        "protocol": "https" if request.is_secure() else "http",
                    }
                    email_body = render_to_string(email_template_name, context)
                    send_mail(subject, email_body, settings.DEFAULT_FROM_EMAIL, [user.email])
                messages.success(request, "Password reset email has been sent.")
                return redirect("password_reset_done")
            else:
                messages.error(request, "No user is associated with this email address.")
    else:
        form = PasswordResetForm()
    return render(request, "accounts/password_reset_form.html", {"form": form})


# -----------------------------
# Password Reset Confirm View
# -----------------------------
def password_reset_confirm(request, uidb64, token):
    """
    Allow user to reset password after clicking email link.
    """
    user = None
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None

    if user is not None and default_token_generator.check_token(user, token):
        if request.method == "POST":
            form = SetPasswordForm(user, request.POST)
            if form.is_valid():
                form.save()
                messages.success(request, "Password has been reset successfully.")
                return redirect("login")
        else:
            form = SetPasswordForm(user)
        return render(request, "accounts/password_reset_confirm.html", {"form": form})
    else:
        messages.error(request, "The reset link is invalid or has expired.")
        return redirect("password_reset")