# cargo_backend/settings.py

from pathlib import Path
from dotenv import load_dotenv
import os

# -------------------------
# PROJECT ROOTS
# -------------------------
# BASE_DIR points to backend/
BASE_DIR = Path(__file__).resolve().parent.parent
# PROJECT_ROOT points to the project root (cargo-system/cargo-system/)
PROJECT_ROOT = BASE_DIR.parent

# Load environment variables from .env
load_dotenv(PROJECT_ROOT / ".env")

# -------------------------
# SECURITY
# -------------------------
SECRET_KEY = os.getenv("SECRET_KEY", "replace-me-in-production")
DEBUG = True
ALLOWED_HOSTS = ["*"]

# -------------------------
# INSTALLED APPS
# -------------------------
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third-party
    "rest_framework",
    "corsheaders",

    # Local apps
    "accounts",
    "shipments",
    "audit",
    "tracking",
    "warehouse",
    "notifications",
]

# -------------------------
# MIDDLEWARE
# -------------------------
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # static files in prod
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "corsheaders.middleware.CorsMiddleware",
]

# -------------------------
# CORS
# -------------------------
CORS_ALLOWED_ORIGINS = [
    # Example:
    # "http://localhost:41813",
    # "https://yourdomain.com"
]

# -------------------------
# URL CONFIGURATION
# -------------------------
ROOT_URLCONF = "cargo_backend.urls"

# -------------------------
# TEMPLATES (React integration)
# -------------------------
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [PROJECT_ROOT / "frontend" / "build"],  # React build directory
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# -------------------------
# DATABASE (PostgreSQL)
# -------------------------
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME", "cargo_db"),
        "USER": os.getenv("DB_USER", "kalwak"),
        "PASSWORD": os.getenv("DB_PASSWORD", "kalwak"),
        "HOST": os.getenv("DB_HOST", "localhost"),
        "PORT": os.getenv("DB_PORT", "5432"),
    }
}

# -------------------------
# AUTH PASSWORD VALIDATION
# -------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# -------------------------
# INTERNATIONALIZATION
# -------------------------
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# -------------------------
# STATIC FILES
# -------------------------
STATIC_URL = "/static/"
STATICFILES_DIRS = [
    PROJECT_ROOT / "frontend" / "build" / "static",  # React static files
]
STATIC_ROOT = BASE_DIR / "staticfiles"

# Enable Whitenoise to serve static in production
WHITENOISE_USE_FINDERS = True

# -------------------------
# MEDIA FILES
# -------------------------
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# -------------------------
# DEFAULT AUTO FIELD
# -------------------------
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"