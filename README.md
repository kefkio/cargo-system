# Cargo System

A full-stack cargo and shipment management platform for shipping goods from the USA to Kenya. Built with **Django REST Framework** (backend) and **React + Vite** (frontend).

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [User Roles & Permissions](#user-roles--permissions)
- [Authentication](#authentication)
- [Frontend Routes](#frontend-routes)
- [Database Models](#database-models)
- [Pagination](#pagination)
- [Security](#security)
- [Management Commands](#management-commands)

---

## Overview

The Cargo System enables:

- **Clients** to request pickups and track their shipments through a 7-stage lifecycle
- **Admin/Staff** to create shipments, manage warehouses, assign dispatchers (riders, Wells Fargo, Super Metro, etc.), and monitor operations
- **Super Admins** to manage all users (admins, staff, clients), approve delete requests, and have global visibility over dispatch and delivery operations
- **Public visitors** to explore services, calculate shipping costs, and register

Shipment lifecycle stages:

1. Pickup Requested
2. Shipment Created
3. Processing at Origin
4. In Transit
5. Arrived Nairobi Hub
6. Dispatched
7. Delivered

---

## Architecture

```
┌─────────────────┐         ┌──────────────────────┐
│   React + Vite  │  CORS   │  Django REST Framework│
│   (port 5173)   │ ──────► │     (port 8000)       │
│                 │  JWT    │                        │
│  Tailwind CSS   │ ◄────── │  PostgreSQL Database   │
└─────────────────┘         └──────────────────────┘
```

- Frontend makes direct cross-origin requests (no Vite proxy)
- Authentication via JWT (access + refresh tokens)
- CORS configured for development origins

---

## Project Structure

```
cargo-system/
├── backend/                     # Django REST Framework API
│   ├── manage.py
│   ├── .env                     # Backend environment variables
│   ├── cargo_backend/           # Django project settings
│   │   ├── settings.py          # Main configuration
│   │   ├── urls.py              # Root URL routing
│   │   ├── wsgi.py / asgi.py    # Server entrypoints
│   │   └── __init__.py
│   ├── accounts/                # User management & auth
│   │   ├── models.py            # User model (roles, profiles)
│   │   ├── api_views.py         # REST API endpoints
│   │   ├── views.py             # Template-based views
│   │   ├── serializers.py       # DRF serializers
│   │   ├── urls.py              # Account routes
│   │   ├── validators.py        # Password validators
│   │   ├── decorators.py        # Role-based decorators
│   │   ├── signals.py           # User creation signals
│   │   ├── forms.py             # Django forms
│   │   └── management/commands/ # Custom management commands
│   └── shipments/               # Shipment & warehouse management
│       ├── models.py            # Cargo, Warehouse models
│       ├── views.py             # Shipment CRUD API
│       ├── serializers.py       # Cargo/Warehouse serializers
│       ├── urls.py              # Shipment routes
│       └── fixtures/            # Seed data
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── App.jsx              # Root component + routing
│   │   ├── App.css              # Centralized styles
│   │   ├── main.jsx             # React entry point
│   │   ├── api/                 # API client layer
│   │   │   ├── client.js        # HTTP client with JWT auto-refresh
│   │   │   └── api.js           # Auth API functions
│   │   ├── auth/                # Auth context & providers
│   │   ├── hooks/               # Custom React hooks
│   │   ├── routes/              # Protected route wrappers
│   │   ├── components/
│   │   │   ├── admin/           # Admin dashboard & management
│   │   │   ├── super-admin/     # Super admin panels (dispatch, cancellations, reports)
│   │   │   ├── client/          # Client dashboard
│   │   │   ├── staff/           # Staff dashboard, invoicing, dispatch center
│   │   │   ├── shared/          # Shared components (InvoicesPanel, PrintableInvoice)
│   │   │   ├── auth/            # Login, register, password forms
│   │   │   ├── marketing/       # Landing page sections
│   │   │   ├── shipment/        # Track, calculate, pickup, sticker
│   │   │   ├── layout/          # Navbars, footer, header
│   │   │   ├── common/          # Shared components
│   │   │   └── dashboards/      # Reusable dashboard cards
│   │   ├── pages/               # Page-level components
│   │   │   └── seo/             # SEO landing pages
│   │   └── assets/              # Images, icons, logos
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env                     # Frontend environment variables
└── cleanup.sh                   # Utility script for cleanup
```

---

## Tech Stack

### Backend

| Technology            | Purpose             |
| --------------------- | ------------------- |
| Django 5.x            | Web framework       |
| Django REST Framework | REST API            |
| Simple JWT            | JWT authentication  |
| Djoser                | Auth helpers        |
| PostgreSQL            | Database            |
| django-corsheaders    | CORS support        |
| python-decouple       | Environment config  |
| Pillow                | Image field support |

### Frontend

| Technology          | Purpose             |
| ------------------- | ------------------- |
| React 19            | UI framework        |
| Vite 7              | Build tool          |
| Tailwind CSS 3.4    | Styling             |
| React Router DOM 7  | Client-side routing |
| Recharts            | Dashboard charts    |
| react-toastify      | Notifications       |
| react-phone-input-2 | Phone number inputs |
| qrcode.react        | QR code generation  |
| react-icons         | Icon library        |
| react-helmet-async  | SEO meta tags       |

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL

### Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt  # or install from your lock file

# Configure environment
cp .env.example .env  # Edit with your database credentials

# Run migrations
python manage.py migrate

# (Optional) Create test users
python manage.py create_test_users

# Start server
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env  # Set VITE_API_URL and VITE_BASE_URL

# Start development server
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:8000`.

---

## Environment Variables

### Backend (.env)

| Variable                      | Description       | Example                                       |
| ----------------------------- | ----------------- | --------------------------------------------- |
| `DJANGO_SECRET_KEY`           | Django secret key | `your-secret-key-here`                        |
| `DJANGO_DEBUG`                | Debug mode        | `True`                                        |
| `DJANGO_ALLOWED_HOSTS`        | Allowed hosts     | `127.0.0.1,localhost`                         |
| `DJANGO_CORS_ALLOWED_ORIGINS` | CORS origins      | `http://localhost:5173,http://127.0.0.1:5173` |
| `POSTGRES_DB`                 | Database name     | `cargo_db`                                    |
| `POSTGRES_USER`               | Database user     | `cargo_user`                                  |
| `POSTGRES_PASSWORD`           | Database password | `your-password`                               |
| `POSTGRES_HOST`               | Database host     | `localhost`                                   |
| `POSTGRES_PORT`               | Database port     | `5432`                                        |

### Frontend (.env)

| Variable         | Description                                          | Example                              |
| ---------------- | ---------------------------------------------------- | ------------------------------------ |
| `VITE_API_URL`   | Accounts API base URL (`/profile/`, auth endpoints)  | `http://localhost:8000/api/accounts` |
| `VITE_BASE_URL`  | General API base URL (shipments, invoices, etc.)     | `http://localhost:8000/api`          |

---

## API Reference

### Authentication (`/api/accounts/`)

| Method | Endpoint                   | Auth | Description                             |
| ------ | -------------------------- | ---- | --------------------------------------- |
| POST   | `/register/`               | No   | Register a new user                     |
| POST   | `/login/`                  | No   | Login, returns JWT tokens               |
| GET    | `/profile/`                | Yes  | Get current user's profile              |
| POST   | `/token/refresh/`          | No   | Refresh access token                    |
| POST   | `/password-change/`        | Yes  | Change password (logged-in user)        |
| POST   | `/password-reset-request/` | No   | Request password reset email            |
| POST   | `/password-reset-confirm/` | No   | Confirm password reset with UID + token |

### User Management (`/api/accounts/`)

| Method    | Endpoint           | Auth       | Description                               |
| --------- | ------------------ | ---------- | ----------------------------------------- |
| GET       | `/admins/`         | Yes        | List all admin users                      |
| GET       | `/clients/`        | Yes        | List all client users                     |
| GET       | `/staff/`          | Yes        | List all staff users                      |
| PUT/PATCH | `/staff/<id>/`     | Yes        | Update a staff user                       |
| PUT/PATCH | `/clients/<id>/`   | Yes        | Update a client user                      |
| POST      | `/request-delete/` | Yes        | Request deletion (CARGOADMIN/CLIENTADMIN) |
| POST      | `/approve-delete/` | SuperAdmin | Approve and execute a delete request      |

### Dashboard (`/api/accounts/` and `/api/`)

| Method | Endpoint               | Auth | Description           |
| ------ | ---------------------- | ---- | --------------------- |
| GET    | `/dashboard/stats/`    | Yes  | User count statistics |
| GET    | `/dashboard/activity/` | Yes  | Recent activity feed  |
| GET    | `/dashboard/services/` | Yes  | Service breakdown     |

### Shipments (`/api/shipments/`)

| Method | Endpoint                         | Auth | Permission | Description                      |
| ------ | -------------------------------- | ---- | ---------- | -------------------------------- |
| GET    | `/`                              | Yes  | Admin      | List all shipments (paginated)   |
| GET    | `/client/`                       | Yes  | Client     | List client's own shipments      |
| POST   | `/create/`                       | Yes  | Admin      | Create a new shipment            |
| GET    | `/warehouses/search/?q=`         | Yes  | Admin      | Search warehouses                |
| GET    | `/clients/search/?q=`            | Yes  | Admin      | Search clients                   |
| GET    | `/admin/recent-shipments/`       | Yes  | Admin      | Last 10 shipments                |
| GET    | `/admin/pickup-requests/`        | Yes  | Admin      | Pending pickup requests (paginated) |
| GET    | `/admin/clients/`                | Yes  | Admin      | Client list with shipment counts |
| GET    | `/admin/stats/`                  | Yes  | Admin      | Shipment dashboard statistics    |
| GET    | `/admin/pipeline/`               | Yes  | Auth       | Active shipments pipeline (paginated) |
| GET    | `/admin/shipments-report/`       | Yes  | Auth       | Filterable shipments report      |
| GET    | `/admin/reports/`                | Yes  | Auth       | Staff/admin consolidated reports |
| PATCH  | `/admin/update-dispatcher/<id>/` | Yes  | Admin      | Assign dispatcher to shipment    |
| PATCH  | `/admin/update-status/<id>/`     | Yes  | Admin      | Advance shipment lifecycle       |
| PATCH  | `/admin/receive-shipment/<id>/`  | Yes  | Admin      | Receive a pickup into a shipment |

### Tracking & Pickup (`/api/shipments/`)

| Method | Endpoint                    | Auth | Description                                |
| ------ | --------------------------- | ---- | ------------------------------------------ |
| GET    | `/track/<tracking_number>/` | No   | Public parcel tracking (limited data)      |
| POST   | `/pickup-request/`          | No   | Public pickup request from landing page    |
| GET    | `/scan/<tracking_number>/`  | Yes  | QR scan lookup (returns full shipment)     |
| POST   | `/scan/<tracking_number>/update-status/` | Yes | QR scan status update (staff/admin) |

### Invoices (`/api/shipments/`)

| Method | Endpoint                                    | Auth | Permission         | Description                           |
| ------ | ------------------------------------------- | ---- | ------------------ | ------------------------------------- |
| GET    | `/invoices/`                                | Yes  | Admin              | List all invoices (paginated)         |
| POST   | `/invoices/create-proforma/`                | Yes  | Admin              | Manually create proforma invoice      |
| GET    | `/invoices/<id>/`                           | Yes  | Admin              | Get single invoice                    |
| PATCH  | `/invoices/<id>/update/`                    | Yes  | Admin              | Update invoice charges/status         |
| POST   | `/invoices/<id>/confirm-clearance/`         | Yes  | SuperAdmin/Cargo   | Confirm clearance & issue final inv   |
| PATCH  | `/invoices/<id>/update-insurance/`          | Yes  | SuperAdmin/Cargo   | Update insurance at dispatch          |
| POST   | `/invoices/<id>/record-payment/`            | Yes  | ClientAdmin/Staff  | Record payment on proforma            |
| GET    | `/<shipment_id>/invoices/`                  | Yes  | Auth               | Get invoices for a shipment           |
| GET    | `/client/invoices/`                         | Yes  | Client             | Client's own invoices                 |

### Cancellations & Credit Notes (`/api/shipments/`)

| Method | Endpoint                                         | Auth | Permission       | Description                    |
| ------ | ------------------------------------------------ | ---- | ---------------- | ------------------------------ |
| GET    | `/cancellations/`                                | Yes  | Admin            | List cancellation requests     |
| POST   | `/admin/cancel-shipment/<id>/`                   | Yes  | CargoAdmin       | Request shipment cancellation  |
| POST   | `/invoices/<id>/request-cancellation/`           | Yes  | ClientAdmin      | Request invoice cancellation   |
| POST   | `/cancellations/<id>/approve/`                   | Yes  | SuperAdmin       | Approve cancellation           |
| POST   | `/cancellations/<id>/reject/`                    | Yes  | SuperAdmin       | Reject cancellation            |
| POST   | `/invoices/<id>/request-credit-note/`            | Yes  | ClientAdmin/Cargo| Request credit note            |
| GET    | `/credit-notes/`                                 | Yes  | Admin            | List credit notes              |
| POST   | `/credit-notes/<id>/approve/`                    | Yes  | SuperAdmin       | Approve credit note            |

---

## User Roles & Permissions

| Role         | Code          | is_staff | is_superuser | Description                                     |
| ------------ | ------------- | -------- | ------------ | ----------------------------------------------- |
| Super Admin  | `SUPERADMIN`  | Yes      | Yes          | Full system access, approves deletes            |
| Cargo Admin  | `CARGOADMIN`  | Yes      | No           | Manages shipments, warehouses, requests deletes |
| Client Admin | `CLIENTADMIN` | Yes      | No           | Manages client operations, requests deletes     |
| Staff        | `STAFF`       | Yes      | No           | Handles pickups, basic dashboard access         |
| Client       | `CLIENT`      | No       | No           | Views own shipments, requests pickups           |

### Permission Matrix

| Action               | SuperAdmin | CargoAdmin | ClientAdmin | Staff | Client | Public |
| -------------------- | ---------- | ---------- | ----------- | ----- | ------ | ------ |
| View all shipments   | ✅         | ✅         | ✅          | ✅    | —      | —      |
| View own shipments   | ✅         | ✅         | ✅          | ✅    | ✅     | —      |
| Create shipment      | ✅         | ✅         | —           | ✅    | —      | —      |
| Assign dispatcher    | ✅         | ✅         | ✅          | ✅    | —      | —      |
| Dispatch shipments   | ✅         | ✅         | ✅          | ✅    | —      | —      |
| View dispatch status | ✅ (global)| ✅         | ✅          | ✅    | —      | —      |
| Manage users         | ✅         | —          | —           | —     | —      | —      |
| Update staff         | ✅         | —          | —           | —     | —      | —      |
| Update clients       | ✅         | ✅         | ✅          | —     | —      | —      |
| Request deletion     | —          | ✅         | ✅          | —     | —      | —      |
| Approve deletion     | ✅         | —          | —           | —     | —      | —      |
| Track parcel         | ✅ (full)  | ✅ (full)  | ✅ (full)   | ✅ (full) | ✅ (own, full) | ✅ (limited) |
| Request pickup       | —          | —          | —           | —     | —      | ✅     |
| View reports         | ✅ (+rev)  | ✅ (+rev)  | ✅          | ✅    | —      | —      |
| Confirm clearance    | ✅         | ✅         | —           | —     | —      | —      |
| Record payment       | ✅         | —          | ✅          | ✅    | —      | —      |
| Request cancellation | —          | ✅ (ship)  | ✅ (inv)    | ✅ (proforma) | —  | —      |
| Approve cancellation | ✅         | —          | —           | —     | —      | —      |
| Request credit note  | —          | ✅         | ✅          | ✅    | —      | —      |

---

## Authentication

### Flow

1. **Register**: `POST /api/accounts/register/` → returns `{ access, refresh, email, role }`
2. **Login**: `POST /api/accounts/login/` → returns `{ access, refresh, email, role }`
3. **Authenticated requests**: `Authorization: Bearer <access_token>`
4. **Token refresh**: `POST /api/accounts/token/refresh/` with `{ refresh }` → returns new `{ access }`
5. **Auto-refresh**: The frontend API client automatically refreshes on 401 responses

### JWT Configuration

| Setting                  | Value      |
| ------------------------ | ---------- |
| Access token lifetime    | 30 minutes |
| Refresh token lifetime   | 12 hours   |
| Rotate refresh tokens    | Yes        |
| Blacklist after rotation | Yes        |
| Algorithm                | HS256      |

### Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 digit
- At least 1 special character
- Not too similar to user attributes
- Not a common password

---

## Frontend Routes

### Public Routes

| Path                          | Component          | Description            |
| ----------------------------- | ------------------ | ---------------------- |
| `/`                           | LandingPage        | Marketing landing page |
| `/login`                      | LoginForm          | User login             |
| `/register`                   | RegisterForm       | User registration      |
| `/forgot-password`            | ForgotPasswordForm | Password reset request |
| `/reset-password/:uid/:token` | ResetPasswordPage  | Password reset form    |
| `/terms-privacy`              | TermsPrivacy       | Legal pages            |
| `/track`                      | TrackShipmentPage  | Public parcel tracking |

### SEO Pages (Public)

| Path                              | Description             |
| --------------------------------- | ----------------------- |
| `/seo/ship-from-amazon-to-kenya`  | Amazon shipping guide   |
| `/seo/ship-from-ebay-to-kenya`    | eBay shipping guide     |
| `/seo/ship-from-walmart-to-kenya` | Walmart shipping guide  |
| `/seo/ship-from-bestbuy-to-kenya` | Best Buy shipping guide |
| `/seo/air-freight-usa-to-kenya`   | Air freight guide       |
| `/seo/sea-freight-usa-to-kenya`   | Sea freight guide       |

### Protected Routes

| Path                     | Component           | Allowed Roles                              |
| ------------------------ | ------------------- | ------------------------------------------ |
| `/dashboard/super-admin` | SuperAdminDashboard | SUPERADMIN                                 |
| `/super-admin/reports`   | SuperAdminReports   | SUPERADMIN                                 |
| `/dashboard/admin`       | AdminDashboard      | CARGOADMIN                                 |
| `/admin/create-shipment` | CreateShipment      | CARGOADMIN                                 |
| `/admin/warehouses`      | WarehouseManagement | CARGOADMIN                                 |
| `/dashboard/staff`       | StaffDashboard      | CLIENTADMIN, STAFF                         |
| `/staff/dispatch`        | StaffDispatch       | CLIENTADMIN, CARGOADMIN, SUPERADMIN, STAFF |
| `/dashboard/client`      | ClientDashboard     | CLIENT                                     |
| `/staff/create-shipment` | CreateShipment      | CARGOADMIN, STAFF                          |
| `/staff/pickups`         | PickupRequest       | CLIENTADMIN, CARGOADMIN, SUPERADMIN, STAFF |
| `/staff/invoicing`       | StaffInvoicing      | CLIENTADMIN, CARGOADMIN, SUPERADMIN, STAFF |
| `/staff/reports`         | StaffReports        | CLIENTADMIN, CARGOADMIN, SUPERADMIN, STAFF |
| `/scan/:trackingNumber`  | ScanUpdate          | All authenticated roles                    |

---

## Database Models

### User (`accounts.User`)

Extends Django's `AbstractUser`. Uses **email** as the login field.

| Field         | Type           | Notes                                                  |
| ------------- | -------------- | ------------------------------------------------------ |
| email         | EmailField     | Unique, used as USERNAME_FIELD                         |
| username      | CharField      | Required                                               |
| first_name    | CharField      | Inherited                                              |
| last_name     | CharField      | Inherited                                              |
| role          | CharField(20)  | SUPERADMIN / CARGOADMIN / CLIENTADMIN / STAFF / CLIENT |
| phone_number  | CharField(20)  | Regex validated: `^\+?1?\d{9,15}$`                     |
| address       | CharField(255) | Optional                                               |
| date_of_birth | DateField      | Optional                                               |
| created_at    | DateTimeField  | Auto-set on creation                                   |
| updated_at    | DateTimeField  | Auto-set on save                                       |

### DeleteRequest (`accounts.DeleteRequest`)

| Field       | Type          | Notes                     |
| ----------- | ------------- | ------------------------- |
| user        | FK → User     | Requester                 |
| target_type | CharField(32) | staff / client / shipment |
| target_id   | IntegerField  | ID of target              |
| reason      | TextField     | Optional                  |
| approved    | BooleanField  | Default: False            |
| rejected    | BooleanField  | Default: False            |
| created_at  | DateTimeField | Auto-set                  |
| approved_at | DateTimeField | Set on approval           |

### Warehouse (`shipments.Warehouse`)

| Field    | Type           | Notes                         |
| -------- | -------------- | ----------------------------- |
| code     | CharField(10)  | Unique (e.g., SI-NY01, NBO01) |
| name     | CharField(255) | Warehouse name                |
| location | TextField      | Full address / city           |

### Cargo (`shipments.Cargo`)

| Field                         | Type           | Notes                                                  |
| ----------------------------- | -------------- | ------------------------------------------------------ |
| **Identity**                  |                |                                                        |
| tracking_number               | CharField(50)  | Unique, auto-generated: `FPC-{origin}-{date}-{random}` |
| qr_code                       | ImageField     | Auto-generated QR code                                 |
| **Routing**                   |                |                                                        |
| client                        | FK → User      | Restricted to CLIENT role                              |
| origin                        | FK → Warehouse | Origin warehouse                                       |
| destination                   | FK → Warehouse | Destination warehouse                                  |
| cargo_type                    | CharField(100) | Package type description                               |
| transport_mode                | CharField(10)  | Air / Sea                                              |
| priority                      | CharField(20)  | Standard / Express                                     |
| expected_delivery_date        | DateField      | Optional                                               |
| **Physical**                  |                |                                                        |
| weight_kg                     | Decimal(10,2)  | Weight in kilograms                                    |
| volume_cbm                    | Decimal(10,3)  | Volume in cubic meters                                 |
| length_m / width_m / height_m | Decimal(6,3)   | Dimensions                                             |
| handling_instructions         | TextField      | Special handling notes                                 |
| **Destination Contact**       |                |                                                        |
| dest_contact_person           | CharField(255) | Recipient name                                         |
| dest_contact_phone            | CharField(20)  | Recipient phone                                        |
| dest_contact_email            | EmailField     | Recipient email                                        |
| **Lifecycle Timestamps**      |                |                                                        |
| pickup_requested_at           | DateTimeField  | When pickup was requested                              |
| shipment_created_at           | DateTimeField  | When shipment was created                              |
| processing_at_origin_at       | DateTimeField  | Processing start                                       |
| in_transit_at                 | DateTimeField  | Transit start                                          |
| arrived_nairobi_at            | DateTimeField  | Arrival at hub                                         |
| dispatched_at                 | DateTimeField  | Dispatch time                                          |
| delivered_at                  | DateTimeField  | Delivery time                                          |
| **Dispatch Info**             |                |                                                        |
| dispatcher_name               | CharField(255) | Assigned dispatcher / rider name                       |
| dispatcher_phone              | CharField(20)  | Dispatcher contact phone number                        |
| dispatcher_service            | CharField(255) | Service type (rider, wells_fargo, super_metro, other)  |
| dispatched_datetime           | DateTimeField  | When shipment was dispatched                           |
| delivered_datetime            | DateTimeField  | When shipment was delivered                            |
| **Status**                    |                |                                                        |
| status                        | CharField(50)  | Current lifecycle stage (indexed)                      |
| intake_date                   | DateTimeField  | Auto-set on creation (indexed)                         |

**Status values**: Pickup Requested → Shipment Created → Processing at Origin → In Transit → Arrived Nairobi Hub → Dispatched → Delivered

### Notification (`shipments.Notification`)

| Field             | Type          | Notes                                              |
| ----------------- | ------------- | -------------------------------------------------- |
| user              | FK → User     | Recipient                                          |
| notification_type | CharField(50) | `credit_note_requested`, `cancellation_requested`, etc. |
| title             | CharField     | Notification title                                 |
| message           | TextField     | Notification body                                  |
| is_read           | BooleanField  | Default: False                                     |
| created_at        | DateTimeField | Auto-set                                           |

---

## Management Commands

### create_test_users

Creates three test users for development:

```bash
python manage.py create_test_users
```

| Email               | Password       | Role       |
| ------------------- | -------------- | ---------- |
| admin@example.com   | AdminPass123!  | SUPERADMIN |
| staff1@example.com  | StaffPass123!  | CARGOADMIN |
| client1@example.com | ClientPass123! | CLIENT     |

### expire_proformas

Expires stale proforma invoices and retires superseded proformas. Can be run manually or via cron:

```bash
python manage.py expire_proformas
```

- **Expires** proformas older than 14 days that are still `issued`
- **Retires** proformas whose cargo already has an active final invoice
- Also runs lazily on invoice list/client invoice API calls

### Shipping Sticker

The `ShipmentSticker` component generates a printable cargo label with:

- Company header, tracking number, shipment details grid
- QR code linking to `/scan/<tracking_number>` for status updates
- DELIVER TO section with recipient contact info
- Print count tracking (ORIGINAL / REPRINT labels)
- Mandatory sticker attachment confirmation flow (print → photo upload → confirm)
- **Print size**: 4 × 6 inches (standard thermal label)

### Dispatch Center

Staff can assign dispatch handlers via `/staff/dispatch`:

| Service      | Description                     |
| ------------ | ------------------------------- |
| `rider`      | Motorcycle rider for delivery   |
| `wells_fargo`| Wells Fargo courier service     |
| `super_metro`| Super Metro parcel handler      |
| `other`      | Custom service (user-specified) |

Dispatch requires: final invoice paid + clearance charges confirmed. Each dispatch records the handler name, phone number, and service type.

### Invoice (`shipments.Invoice`)

| Field                       | Type           | Notes                                                |
| --------------------------- | -------------- | ---------------------------------------------------- |
| invoice_number              | CharField(50)  | Unique, sequential: `FPC-{PRO|INV}-{date}-{0001}`     |
| cargo                       | FK → Cargo     | Related shipment                                     |
| user                        | FK → User      | Client this invoice belongs to                       |
| invoice_type                | CharField(10)  | `proforma` / `final` (indexed)                       |
| status                      | CharField(10)  | `draft` / `issued` / `paid` / `cancelled` / `expired` / `retired` (indexed) |
| **Taxable Services (VAT)**  |                |                                                      |
| freight_charge              | Decimal(12,2)  | Freight cost                                         |
| handling_fee                | Decimal(12,2)  | Handling fee                                         |
| insurance                   | Decimal(12,2)  | Insurance cost                                       |
| other_charges               | Decimal(12,2)  | Miscellaneous charges                                |
| **Disbursements (non-VAT)** |                |                                                      |
| customs_duty                | Decimal(12,2)  | Import duty                                          |
| excise_duty                 | Decimal(12,2)  | Excise duty                                          |
| import_vat                  | Decimal(12,2)  | Import VAT paid at KRA                               |
| port_charges                | Decimal(12,2)  | Port/terminal charges                                |
| clearance_fee               | Decimal(12,2)  | Third-party clearance fees                           |
| rdl                         | Decimal(12,2)  | Railway Development Levy                             |
| idf                         | Decimal(12,2)  | Import Declaration Fee                               |
| **Tax & Totals**            |                |                                                      |
| tax_rate                    | Decimal(5,2)   | VAT rate (default 16%)                               |
| currency                    | CharField(3)   | Default: USD                                         |
| **Payment**                 |                |                                                      |
| payment_method              | CharField(10)  | `cash` / `bank` / `mpesa` / `visa`                   |
| payment_reference           | CharField(255) | Bank reference or receipt number                     |
| **Clearance Workflow**      |                |                                                      |
| clearance_charges_confirmed | BooleanField   | Must be true before final invoice can be issued      |
| clearance_submitted         | BooleanField   | Staff has submitted charges for admin review         |
| **Timestamps**              |                |                                                      |
| created_at                  | DateTimeField  | Auto-set                                             |
| updated_at                  | DateTimeField  | Auto-set                                             |
| issued_at                   | DateTimeField  | When invoice was issued                              |
| paid_at                     | DateTimeField  | When payment was recorded                            |

**Computed properties**: `taxable_subtotal`, `disbursements_subtotal`, `tax_amount` (VAT on taxable services only), `total_amount`

**Invoice lifecycle**:
- **Proforma** → auto-generated when shipment is created. Expires after 14 days if unpaid. Retired automatically when a final invoice is created for the same cargo.
- **Final** → generated when clearance charges are confirmed at Nairobi Hub. Must be paid before dispatch.
- **Cancellation**: Proformas are cancelled immediately by staff; final invoices require SuperAdmin approval.
- **Credit Notes**: Can only be requested against final invoices (not proformas). SuperAdmin notified and must approve.

### CancellationRequest (`shipments.CancellationRequest`)

| Field        | Type          | Notes                                     |
| ------------ | ------------- | ----------------------------------------- |
| request_type | CharField(20) | `shipment` / `invoice`                    |
| cargo        | FK → Cargo    | Nullable, set for shipment cancellations  |
| invoice      | FK → Invoice  | Nullable, set for invoice cancellations   |
| requested_by | FK → User     | Admin who requested                       |
| reason       | TextField     | Required                                  |
| status       | CharField(20) | `pending` / `approved` / `rejected`       |
| reviewed_by  | FK → User     | SuperAdmin who reviewed                   |
| reviewed_at  | DateTimeField | When reviewed                             |
| created_at   | DateTimeField | Auto-set                                  |

### CreditNote (`shipments.CreditNote`)

| Field       | Type           | Notes                         |
| ----------- | -------------- | ----------------------------- |
| invoice     | FK → Invoice   | Invoice being credited        |
| amount      | Decimal(12,2)  | Credit amount                 |
| reason      | TextField      | Required                      |
| issued_by   | FK → User      | Admin who requested           |
| approved_by | FK → User      | SuperAdmin who approved       |
| approved_at | DateTimeField  | When approved                 |
| created_at  | DateTimeField  | Auto-set                      |

---

## Pagination

List endpoints return paginated responses with the following envelope:

```json
{
  "count": 150,
  "num_pages": 3,
  "page": 1,
  "page_size": 50,
  "results": [...]
}
```

| Parameter   | Default | Max | Description                |
| ----------- | ------- | --- | -------------------------- |
| `page`      | 1       | —   | Page number (1-indexed)    |
| `page_size` | 50      | 200 | Items per page             |

Paginated endpoints: all shipments, pipeline, pickup requests, invoices list.

---

## Security

### Authentication & Authorization

- **JWT tokens** with short-lived access (30 min) and rotating refresh tokens (12 hr)
- **Token blacklisting** on rotation prevents replay attacks
- **Role-based access control** enforced server-side on every endpoint
- **Public registration** is restricted to `CLIENT` role — admin/staff accounts can only be created internally
- **Staff/client updates** require appropriate admin roles (`SUPERADMIN` for staff, `SUPERADMIN`/`CARGOADMIN`/`CLIENTADMIN` for clients)
- **Delete operations** require two-step approval: admin requests → SuperAdmin approves

### Rate Limiting

| Scope            | Limit      |
| ---------------- | ---------- |
| Anonymous users  | 100/hour   |
| Authenticated    | 1000/hour  |
| Auth endpoints   | 10/minute  |

### Data Protection

- **Public tracking** returns only status and timeline; full shipment details require authentication as owner or staff/admin
- **Generic error messages** on tracking — does not reveal whether a tracking number exists
- **Password reset** does not reveal whether an email is registered
- **Strong passwords** required: 8+ chars, uppercase, lowercase, digit, special character
- **CORS** restricted to configured origins via environment variables
- **SECRET_KEY** loaded from environment, never hardcoded

### Database Performance

- **Indexed fields**: `Cargo.status`, `Cargo.intake_date`, `Cargo.tracking_number`, `Invoice.status`, `Invoice.invoice_type`
- **`select_related`** used on queryset joins to prevent N+1 queries
- **Paginated list endpoints** prevent unbounded response sizes
