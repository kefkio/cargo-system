# accounts/urls.py
# accounts/urls.py
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from django.contrib.auth import views as auth_views
from . import api_views

# Required for namespacing in include()

app_name = "accounts"

urlpatterns = [
    # =============================
    # React API endpoints (JSON)
    # =============================
    path("register/", api_views.register_user, name="api_register"),
    path("login/", api_views.login_user, name="api_login"),
    path("profile/", api_views.get_profile, name="api_profile"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("admins/", api_views.list_admins, name="api_admins"),
    path("clients/", api_views.list_clients, name="api_clients"),
    path("staff/", api_views.list_staff, name="api_staff"),
    path("staff/<int:user_id>/", api_views.update_staff, name="update_staff"),
    path("clients/<int:user_id>/", api_views.update_client, name="update_client"),
    path("request-delete/", api_views.request_delete, name="request_delete"),

    path("approve-delete/", api_views.approve_delete, name="approve_delete"),
    path("create-superadmin/", api_views.create_superadmin, name="create_superadmin"),

    # Dashboard endpoints
    path("dashboard/stats/", api_views.dashboard_stats, name="dashboard_stats"),
    path("dashboard/activity/", api_views.dashboard_activity, name="dashboard_activity"),
    path("dashboard/services/", api_views.dashboard_services, name="dashboard_services"),

    # =============================
    # Password Reset APIs (JSON)
    # =============================
    path(
        "password-reset-request/",
        api_views.password_reset_request,
        name="api_password_reset_request"
    ),
    path(
        "password-reset-confirm/",
        api_views.password_reset_confirm,
        name="api_password_reset_confirm"
    ),

    # =============================
    # Password Reset Flow (HTML)
    # =============================
    path(
        "password-reset/",
        auth_views.PasswordResetView.as_view(
            template_name="accounts/password_reset_form.html",
            email_template_name="accounts/password_reset_email.html",
            subject_template_name="accounts/password_reset_subject.txt",
            success_url="/accounts/password-reset/done/"
        ),
        name="password_reset",
    ),
    path(
        "password-reset/done/",
        auth_views.PasswordResetDoneView.as_view(
            template_name="accounts/password_reset_done.html"
        ),
        name="password_reset_done",
    ),
    path(
        "reset/<uidb64>/<token>/",
        auth_views.PasswordResetConfirmView.as_view(
            template_name="accounts/password_reset_confirm.html",
            success_url="/accounts/reset/done/"
        ),
        name="password_reset_confirm",
    ),
    path(
        "reset/done/",
        auth_views.PasswordResetCompleteView.as_view(
            template_name="accounts/password_reset_complete.html"
        ),
        name="password_reset_complete",
    ),

    # =============================
    # Password change for logged-in users
    # =============================
    path(
        "password-change/",
        api_views.change_password,
        name="api_password_change"
    ),
]