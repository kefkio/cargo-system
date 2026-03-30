# backend/shipments/urls.py
from django.urls import path
from . import views

app_name = "shipments"  # <-- ADD THIS

urlpatterns = [
    # -----------------------------
    # Client-specific endpoints
    # -----------------------------
    path('client/', views.my_shipments, name='client_shipments'),
    path('client/invoices/', views.my_invoices, name='client_invoices'),
    path('client/reports/', views.client_reports, name='client_reports'),
    path('', views.all_shipments, name='all_shipments'),

    # -----------------------------
    # Create shipment
    # -----------------------------
    path('create/', views.create_shipment, name='create_shipment'),

    # -----------------------------
    # Search endpoints
    # -----------------------------
    path('warehouses/search/', views.search_warehouses, name='search_warehouses'),
    path('clients/search/', views.search_clients, name='search_clients'),

    # -----------------------------
    # Admin dashboard endpoints
    # -----------------------------
    path('admin/shipments-report/', views.shipments_report, name='shipments_report'),
    path('admin/recent-shipments/', views.recent_shipments, name='recent_shipments'),
    path('admin/pipeline/', views.pipeline_shipments, name='pipeline_shipments'),
    path('admin/pickup-requests/', views.pickup_requests, name='pickup_requests'),
    path('admin/clients/', views.clients_list, name='clients_list'),
    path('admin/stats/', views.dashboard_stats, name='dashboard_stats'),
    path('admin/reports/', views.staff_reports, name='staff_reports'),
    path('admin/update-dispatcher/<int:shipment_id>/', views.update_dispatcher, name='update_dispatcher'),
    path('admin/close-pickup/<int:shipment_id>/', views.close_pickup, name='close_pickup'),
    path('admin/warehouse-receipt/<int:shipment_id>/', views.mark_warehouse_received, name='warehouse_receipt'),
    path('admin/dispatch-handlers/', views.list_dispatch_handlers, name='dispatch_handlers'),
    path('admin/update-status/<int:shipment_id>/', views.update_status, name='update_status'),
    path('admin/receive-shipment/<int:shipment_id>/', views.receive_shipment, name='receive_shipment'),
    path('admin/confirm-sticker/<int:shipment_id>/', views.confirm_sticker_attachment, name='confirm_sticker'),
    path('admin/record-print/<int:shipment_id>/', views.record_sticker_print, name='record_sticker_print'),

    # -----------------------------
    # Invoice endpoints
    # -----------------------------
    path('invoices/', views.list_invoices, name='list_invoices'),
    path('invoices/create-proforma/', views.create_manual_proforma, name='create_manual_proforma'),
    path('invoices/<int:invoice_id>/', views.get_invoice, name='get_invoice'),
    path('invoices/<int:invoice_id>/update/', views.update_invoice, name='update_invoice'),
    path('invoices/<int:invoice_id>/confirm-clearance/', views.confirm_clearance_charges, name='confirm_clearance'),
    path('invoices/<int:invoice_id>/update-insurance/', views.update_insurance_at_dispatch, name='update_insurance'),
    path('invoices/<int:invoice_id>/record-payment/', views.record_payment, name='record_payment'),
    path('<int:shipment_id>/invoices/', views.shipment_invoices, name='shipment_invoices'),

    # -----------------------------
    # Cancellation & Credit Note endpoints
    # -----------------------------
    path('cancellations/', views.list_cancellation_requests, name='list_cancellations'),
    path('cancellations/<int:request_id>/approve/', views.approve_cancellation, name='approve_cancellation'),
    path('cancellations/<int:request_id>/reject/', views.reject_cancellation, name='reject_cancellation'),
    path('admin/cancel-shipment/<int:shipment_id>/', views.request_shipment_cancellation, name='request_shipment_cancellation'),
    path('invoices/<int:invoice_id>/request-cancellation/', views.request_invoice_cancellation, name='request_invoice_cancellation'),
    path('invoices/<int:invoice_id>/request-credit-note/', views.request_credit_note, name='request_credit_note'),
    path('credit-notes/', views.list_credit_notes, name='list_credit_notes'),
    path('credit-notes/<int:credit_note_id>/approve/', views.approve_credit_note, name='approve_credit_note'),

    # -----------------------------
    # Public tracking endpoint
    # -----------------------------
    path('track/<str:tracking_number>/', views.track_parcel, name='track_parcel'),

    # -----------------------------
    # QR Scan endpoints
    # -----------------------------
    path('scan/update/<str:tracking_number>/', views.scan_update_status, name='scan_update_status'),
    path('scan/<str:tracking_number>/', views.scan_shipment, name='scan_shipment'),
]