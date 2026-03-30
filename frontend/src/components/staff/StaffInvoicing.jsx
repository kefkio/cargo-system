// src/components/staff/StaffInvoicing.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFileInvoiceDollar,
  FaArrowLeft,
  FaSearch,
  FaCheckCircle,
  FaChevronDown,
  FaChevronUp,
  FaEdit,
  FaMoneyBillWave,
  FaPlus,
  FaTimes,
  FaPrint,
} from "react-icons/fa";
import PrintableInvoice from "../shared/PrintableInvoice";

const TAX_FIELDS = [
  { key: "customs_duty", label: "Customs Duty" },
  { key: "excise_duty", label: "Excise Duty" },
  { key: "import_vat", label: "Import VAT (Firm-Paid)" },
  { key: "reimbursable_vat", label: "Reimbursable VAT" },
  { key: "rdl", label: "RDL (Railway Development Levy)" },
  { key: "idf", label: "IDF (Import Declaration Fee)" },
  { key: "clearance_fee", label: "Clearance Fee" },
  { key: "other_charges", label: "Other Charges" },
];

export default function StaffInvoicing() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("action-needed"); // action-needed | all | proforma | final
  const [expandedId, setExpandedId] = useState(null);

  // Clearance form state (for the invoice currently being edited)
  const [editingInvoiceId, setEditingInvoiceId] = useState(null);
  const [clearanceForm, setClearanceForm] = useState(null);
  const [saving, setSaving] = useState(false);

  // Payment modal state
  const [paymentModal, setPaymentModal] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [recordingPayment, setRecordingPayment] = useState(false);

  // Create Proforma modal state
  const [showCreateProforma, setShowCreateProforma] = useState(false);
  const [shipments, setShipments] = useState([]);
  const [shipmentsLoading, setShipmentsLoading] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [proformaForm, setProformaForm] = useState({
    freight_charge: "",
    handling_fee: "",
    insurance: "",
    other_charges: "",
  });
  const [creatingProforma, setCreatingProforma] = useState(false);

  // Print invoice state
  const [printInvoice, setPrintInvoice] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const BASE_URL = API_URL.replace(/\/accounts\/?$/, "");

  const fetchInvoices = useCallback(async () => {
    const token = localStorage.getItem("access");
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/shipments/invoices/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error("Failed to load invoices", err);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL]);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return navigate("/login");
    fetchInvoices();
  }, [navigate, fetchInvoices]);

  /* --------- Computed --------- */
  const actionNeeded = invoices.filter(
    (inv) =>
      (inv.invoice_type === "final" && inv.status === "draft" && !inv.clearance_charges_confirmed) ||
      (inv.invoice_type === "proforma" && inv.status === "issued")
  );

  const filtered = invoices
    .filter((inv) => {
      if (tab === "action-needed") {
        return (
          (inv.invoice_type === "final" && inv.status === "draft" && !inv.clearance_charges_confirmed) ||
          (inv.invoice_type === "proforma" && inv.status === "issued")
        );
      }
      if (tab === "proforma") return inv.invoice_type === "proforma";
      if (tab === "final") return inv.invoice_type === "final";
      return true;
    })
    .filter((inv) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        (inv.invoice_number || "").toLowerCase().includes(q) ||
        (inv.cargo_tracking || "").toLowerCase().includes(q) ||
        (inv.client_name || "").toLowerCase().includes(q)
      );
    });

  /* --------- Clearance form helpers --------- */
  const openClearanceForm = (inv) => {
    setEditingInvoiceId(inv.id);
    setClearanceForm({
      customs_duty: inv.customs_duty || "",
      excise_duty: inv.excise_duty || "",
      import_vat: inv.import_vat || "",
      reimbursable_vat: inv.reimbursable_vat || "",
      rdl: inv.rdl || "",
      idf: inv.idf || "",
      clearance_fee: inv.clearance_fee || "",
      other_charges: inv.other_charges || "",
      tax_rate: inv.tax_rate || 16,
    });
    setExpandedId(inv.id);
  };

  const submitClearance = async (invoiceId) => {
    if (!clearanceForm) return;
    setSaving(true);
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`${BASE_URL}/shipments/invoices/${invoiceId}/confirm-clearance/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(clearanceForm),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to confirm clearance charges");
        return;
      }
      setClearanceForm(null);
      setEditingInvoiceId(null);
      await fetchInvoices();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  /* --------- Payment helpers --------- */
  const openPaymentModal = (inv) => {
    setPaymentModal({ invoiceId: inv.id, invoiceNumber: inv.invoice_number, total: inv.total_amount, currency: inv.currency });
    setPaymentMethod("");
    setPaymentReference("");
  };

  const submitPayment = async () => {
    if (!paymentModal || !paymentMethod) return;
    setRecordingPayment(true);
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`${BASE_URL}/shipments/invoices/${paymentModal.invoiceId}/record-payment/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          payment_method: paymentMethod,
          payment_reference: paymentReference.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to record payment");
        return;
      }
      setPaymentModal(null);
      await fetchInvoices();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setRecordingPayment(false);
    }
  };

  /* --------- Summary stats --------- */
  const draftFinals = invoices.filter((i) => i.invoice_type === "final" && !i.clearance_charges_confirmed).length;
  const outstandingProformas = invoices.filter((i) => i.invoice_type === "proforma" && i.status === "issued").length;
  const paidCount = invoices.filter((i) => i.status === "paid").length;
  const totalCount = invoices.length;

  /* --------- Create Proforma helpers --------- */
  const openCreateProforma = async () => {
    setShowCreateProforma(true);
    setSelectedShipment(null);
    setProformaForm({ freight_charge: "", handling_fee: "", insurance: "", other_charges: "" });

    // Fetch all shipments so user can pick one
    const token = localStorage.getItem("access");
    if (!token) return;
    setShipmentsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/shipments/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.results || [];
        // Filter out shipments that already have an active proforma
        const existingCargos = new Set(
          invoices
            .filter((inv) => inv.invoice_type === "proforma" && inv.status !== "cancelled")
            .map((inv) => inv.cargo)
        );
        setShipments(list.filter((s) => !existingCargos.has(s.id)));
      }
    } catch (err) {
      console.error("Failed to load shipments", err);
    } finally {
      setShipmentsLoading(false);
    }
  };

  const selectShipment = (shipment) => {
    setSelectedShipment(shipment);
    // Auto-calculate default rates
    const weight = parseFloat(shipment.weight_kg) || 0;
    const freight =
      shipment.transport_mode === "Air"
        ? (weight * 12.0).toFixed(2)
        : (weight * 3.5).toFixed(2);
    const handling = weight > 0 ? (weight * 0.5).toFixed(2) : "15.00";
    setProformaForm({
      freight_charge: freight,
      handling_fee: handling,
      insurance: "",
      other_charges: "",
    });
  };

  const submitCreateProforma = async () => {
    if (!selectedShipment) return;
    setCreatingProforma(true);
    try {
      const token = localStorage.getItem("access");
      const body = { cargo_id: selectedShipment.id };
      if (proformaForm.freight_charge) body.freight_charge = proformaForm.freight_charge;
      if (proformaForm.handling_fee) body.handling_fee = proformaForm.handling_fee;
      if (proformaForm.insurance) body.insurance = proformaForm.insurance;
      if (proformaForm.other_charges) body.other_charges = proformaForm.other_charges;

      const res = await fetch(`${BASE_URL}/shipments/invoices/create-proforma/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to create proforma invoice");
        return;
      }

      setShowCreateProforma(false);
      await fetchInvoices();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setCreatingProforma(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/staff")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
          >
            <FaArrowLeft size={14} />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
          <div className="h-6 w-px bg-gray-300" />
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaFileInvoiceDollar className="text-indigo-600" />
            Invoicing
          </h1>
        </div>
        <button
          onClick={openCreateProforma}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
        >
          <FaPlus size={12} />
          Create Proforma
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{draftFinals}</p>
            <p className="text-xs text-gray-500 mt-1">Final Invoices Pending Taxes</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{outstandingProformas}</p>
            <p className="text-xs text-gray-500 mt-1">Proformas Awaiting Payment</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{paidCount}</p>
            <p className="text-xs text-gray-500 mt-1">Paid Invoices</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{totalCount}</p>
            <p className="text-xs text-gray-500 mt-1">Total Invoices</p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "action-needed", label: "Action Needed", count: actionNeeded.length },
                { key: "all", label: "All", count: totalCount },
                { key: "proforma", label: "Proforma", count: invoices.filter((i) => i.invoice_type === "proforma").length },
                { key: "final", label: "Final", count: invoices.filter((i) => i.invoice_type === "final").length },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`px-4 py-2 text-xs font-semibold rounded-full transition ${
                    tab === key
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by tracking number, invoice, or client..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Invoice List */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Loading invoices...
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <FaFileInvoiceDollar className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-gray-500 italic">
                {search
                  ? "No invoices match your search."
                  : tab === "action-needed"
                  ? "No invoices need attention right now."
                  : "No invoices found."}
              </p>
            </div>
          ) : (
            filtered.map((inv) => {
              const isExpanded = expandedId === inv.id;
              const isProforma = inv.invoice_type === "proforma";
              const isFinalDraft = inv.invoice_type === "final" && !inv.clearance_charges_confirmed;
              const needsPayment = isProforma && inv.status === "issued";
              const isEditing = editingInvoiceId === inv.id;

              return (
                <div
                  key={inv.id}
                  className={`bg-white rounded-lg shadow border overflow-hidden transition ${
                    isFinalDraft
                      ? "border-amber-300"
                      : needsPayment
                      ? "border-orange-300"
                      : inv.status === "paid"
                      ? "border-green-200"
                      : "border-gray-200"
                  }`}
                >
                  {/* Header row */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : inv.id)}
                    className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-3 flex-wrap min-w-0">
                      {/* Status dot */}
                      <span
                        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          inv.status === "paid"
                            ? "bg-green-500"
                            : inv.status === "issued"
                            ? "bg-blue-500"
                            : inv.status === "draft"
                            ? "bg-amber-400"
                            : "bg-red-400"
                        }`}
                      />
                      <span className="text-sm font-bold text-gray-900">{inv.invoice_number}</span>
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded ${
                          isProforma ? "bg-amber-100 text-amber-800" : "bg-indigo-100 text-indigo-800"
                        }`}
                      >
                        {isProforma ? "Proforma" : "Final"}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs font-semibold rounded ${
                          inv.status === "paid"
                            ? "bg-green-100 text-green-700"
                            : inv.status === "issued"
                            ? "bg-blue-100 text-blue-700"
                            : inv.status === "draft"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {inv.status.toUpperCase()}
                      </span>
                      {inv.cargo_tracking && (
                        <span className="text-xs text-gray-500">{inv.cargo_tracking}</span>
                      )}
                      {inv.client_name && (
                        <span className="text-xs text-gray-400">| {inv.client_name}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-bold text-gray-900">
                        {inv.currency} {Number(inv.total_amount).toFixed(2)}
                      </span>

                      {/* Quick action badges */}
                      {isFinalDraft && (
                        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-amber-100 text-amber-800">
                          <FaEdit size={10} /> Enter Taxes
                        </span>
                      )}
                      {needsPayment && (
                        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-orange-100 text-orange-800">
                          <FaMoneyBillWave size={10} /> Awaiting Payment
                        </span>
                      )}
                      {inv.status === "paid" && (
                        <span className="hidden sm:flex items-center gap-1 text-xs text-green-600 font-semibold">
                          <FaCheckCircle size={10} /> Paid
                        </span>
                      )}

                      {isExpanded ? (
                        <FaChevronUp className="text-gray-400" size={12} />
                      ) : (
                        <FaChevronDown className="text-gray-400" size={12} />
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="px-5 pb-5 border-t border-gray-100">
                      {/* Shipment & Client Info */}
                      <div className="flex flex-wrap gap-x-6 gap-y-1 mt-4 text-xs">
                        {inv.client_name && (
                          <div><span className="text-gray-400">Client: </span><span className="font-medium text-gray-900">{inv.client_name}</span></div>
                        )}
                        {inv.cargo_tracking && (
                          <div><span className="text-gray-400">Tracking: </span><span className="font-medium text-gray-900">{inv.cargo_tracking}</span></div>
                        )}
                        <div><span className="text-gray-400">Created: </span><span className="font-medium text-gray-900">{new Date(inv.created_at).toLocaleDateString()}</span></div>
                        {inv.issued_at && (
                          <div><span className="text-gray-400">Issued: </span><span className="font-medium text-gray-900">{new Date(inv.issued_at).toLocaleDateString()}</span></div>
                        )}
                        {inv.paid_at && (
                          <div><span className="text-gray-400">Paid: </span><span className="font-medium text-gray-900">{new Date(inv.paid_at).toLocaleDateString()}</span></div>
                        )}
                        {inv.payment_method && (
                          <div><span className="text-gray-400">Via: </span><span className="font-medium text-gray-900">{{ cash: "Cash", bank: "Bank Transfer", mpesa: "M-Pesa", visa: "Visa" }[inv.payment_method] || inv.payment_method}</span></div>
                        )}
                        {inv.payment_reference && (
                          <div><span className="text-gray-400">Ref: </span><span className="font-medium text-gray-900">{inv.payment_reference}</span></div>
                        )}
                      </div>

                      {/* ---- Charges breakdown (read-only from workflow) ---- */}
                      <div className="mt-4">
                        <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                          Charges from Workflow
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-xs">
                          {[
                            { label: "Freight Charge", value: inv.freight_charge },
                            { label: "Handling Fee", value: inv.handling_fee },
                            { label: "Insurance", value: inv.insurance },
                          ].map(({ label, value }) => (
                            <div key={label} className="flex justify-between">
                              <span className="text-gray-400">{label}</span>
                              <span className="text-gray-900 font-medium">{inv.currency} {Number(value).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ---- Variable Taxes Section ---- */}
                      <div className="mt-4">
                        <h4 className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                          Variable Taxes & Duties
                          {isFinalDraft && !isEditing && (
                            <span className="ml-2 text-amber-600 font-normal normal-case">(pending entry)</span>
                          )}
                        </h4>

                        {/* If editing (form mode) */}
                        {isEditing && clearanceForm ? (
                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                            <p className="text-xs text-amber-800 font-medium">
                              Enter the actual tax and duty amounts. These values are variable and may change per shipment.
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                              {TAX_FIELDS.map(({ key, label }) => (
                                <div key={key}>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={clearanceForm[key] ?? ""}
                                    onChange={(e) =>
                                      setClearanceForm((prev) => ({ ...prev, [key]: e.target.value }))
                                    }
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="0.00"
                                  />
                                </div>
                              ))}
                            </div>

                            {/* VAT Rate */}
                            <div className="max-w-xs">
                              <label className="block text-xs font-medium text-gray-600 mb-1">VAT Rate (%)</label>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={clearanceForm.tax_rate ?? 16}
                                onChange={(e) =>
                                  setClearanceForm((prev) => ({ ...prev, tax_rate: e.target.value }))
                                }
                                className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                              <button
                                onClick={() => submitClearance(inv.id)}
                                disabled={saving}
                                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition"
                              >
                                <FaCheckCircle size={12} />
                                {saving ? "Confirming..." : "Confirm & Issue Final Invoice"}
                              </button>
                              <button
                                onClick={() => {
                                  setClearanceForm(null);
                                  setEditingInvoiceId(null);
                                }}
                                className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Read-only tax display */
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-xs">
                            {TAX_FIELDS.map(({ key, label }) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-gray-400">{label.split(" (")[0]}</span>
                                <span className={`font-medium ${Number(inv[key]) > 0 ? "text-gray-900" : "text-gray-300"}`}>
                                  {inv.currency} {Number(inv[key]).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Enter Taxes button for draft final invoices */}
                        {isFinalDraft && !isEditing && (
                          <button
                            onClick={() => openClearanceForm(inv)}
                            className="mt-3 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition"
                          >
                            <FaEdit size={12} />
                            Enter Tax & Duty Amounts
                          </button>
                        )}

                        {/* Clearance confirmed badge */}
                        {inv.invoice_type === "final" && inv.clearance_charges_confirmed && (
                          <div className="mt-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded bg-green-100 text-green-700">
                              <FaCheckCircle size={10} /> Clearance Charges Confirmed
                            </span>
                          </div>
                        )}
                      </div>

                      {/* ---- Totals ---- */}
                      <div className="mt-4 pt-3 border-t border-gray-200 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Subtotal</span>
                          <span className="text-gray-900">{inv.currency} {Number(inv.subtotal).toFixed(2)}</span>
                        </div>
                        {Number(inv.tax_rate) > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">VAT ({inv.tax_rate}%)</span>
                            <span className="text-gray-900">{inv.currency} {Number(inv.tax_amount).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold text-sm pt-1">
                          <span className="text-gray-900">Total</span>
                          <span className="text-gray-900">{inv.currency} {Number(inv.total_amount).toFixed(2)}</span>
                        </div>
                      </div>

                      {/* ---- Payment Action (for outstanding proformas) ---- */}
                      {needsPayment && (
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-orange-700 font-medium">
                              Payment required before shipment can be dispatched
                            </p>
                            <button
                              onClick={() => openPaymentModal(inv)}
                              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                            >
                              <FaMoneyBillWave size={14} />
                              Record Payment
                            </button>
                          </div>
                        </div>
                      )}

                      {inv.notes && (
                        <div className="mt-3 text-xs text-gray-500 italic">
                          {inv.notes}
                        </div>
                      )}

                      {/* Print / Send Quote button */}
                      <div className="mt-4 pt-3 border-t border-gray-200 flex gap-2">
                        <button
                          onClick={() => setPrintInvoice(inv)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-gray-700 text-white hover:bg-gray-800 transition"
                        >
                          <FaPrint size={12} />
                          {inv.invoice_type === "proforma" ? "Print / Send Quote" : "Print Invoice"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ═══ Payment Modal ═══ */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FaMoneyBillWave /> Record Payment
              </h3>
              <p className="text-emerald-100 text-sm mt-0.5">
                {paymentModal.invoiceNumber} — {paymentModal.currency} {Number(paymentModal.total).toFixed(2)}
              </p>
            </div>

            <div className="p-6 space-y-5">
              {/* Payment Method */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { key: "cash", label: "Cash", icon: "💵" },
                    { key: "bank", label: "Bank Transfer", icon: "🏦" },
                  ].map(({ key, label, icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setPaymentMethod(key)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition ${
                        paymentMethod === key
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <span className="text-2xl">{icon}</span>
                      <span className="text-sm font-semibold">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Reference / Receipt No. <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder={paymentMethod === "bank" ? "Bank transaction ID" : "Receipt number"}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setPaymentModal(null)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={submitPayment}
                  disabled={!paymentMethod || recordingPayment}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <FaCheckCircle size={14} />
                  {recordingPayment ? "Recording..." : "Confirm Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Create Proforma Modal ═══ */}
      {showCreateProforma && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FaFileInvoiceDollar /> Create Proforma Invoice
                </h3>
                <p className="text-indigo-200 text-sm mt-0.5">
                  Invoice number will be generated automatically
                </p>
              </div>
              <button
                onClick={() => setShowCreateProforma(false)}
                className="text-white/70 hover:text-white transition"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Disclaimer */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800 font-medium">
                  ⚠ This is a <strong>Proforma Invoice</strong> only — it serves as a preliminary estimate
                  of charges and is <strong>not a final tax invoice</strong>. Actual amounts may vary
                  upon clearance and dispatch. No VAT is applied on proforma invoices.
                </p>
              </div>

              {/* Select Shipment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Shipment <span className="text-red-500">*</span>
                </label>
                {shipmentsLoading ? (
                  <p className="text-sm text-gray-400">Loading shipments...</p>
                ) : shipments.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    All shipments already have an active proforma invoice.
                  </p>
                ) : (
                  <select
                    value={selectedShipment?.id || ""}
                    onChange={(e) => {
                      const s = shipments.find((sh) => sh.id === Number(e.target.value));
                      if (s) selectShipment(s);
                    }}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">-- Choose a shipment --</option>
                    {shipments.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.tracking_number} — {s.client_name || "Unknown client"} ({s.weight_kg || 0} kg, {s.transport_mode || "N/A"})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Auto-filled client & shipment details */}
              {selectedShipment && (
                <>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Shipment & Client Details (from database)
                    </h4>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                      <div>
                        <span className="text-gray-400">Client: </span>
                        <span className="font-medium text-gray-900">{selectedShipment.client_name || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Email: </span>
                        <span className="font-medium text-gray-900">{selectedShipment.client_email || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Tracking: </span>
                        <span className="font-medium text-gray-900">{selectedShipment.tracking_number}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Status: </span>
                        <span className="font-medium text-gray-900">{selectedShipment.status}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Weight: </span>
                        <span className="font-medium text-gray-900">{selectedShipment.weight_kg || 0} kg</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Mode: </span>
                        <span className="font-medium text-gray-900">{selectedShipment.transport_mode || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Origin: </span>
                        <span className="font-medium text-gray-900">{selectedShipment.origin_name || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Destination: </span>
                        <span className="font-medium text-gray-900">{selectedShipment.destination_name || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Cargo type: </span>
                        <span className="font-medium text-gray-900">{selectedShipment.cargo_type || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">FX Rate: </span>
                        <span className="font-medium text-gray-900">
                          {selectedShipment.transport_mode === "Air" ? "$12.00/kg" : "$3.50/kg"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Editable charge fields */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Estimated Charges (editable)
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: "freight_charge", label: "Freight Charge (USD)" },
                        { key: "handling_fee", label: "Handling Fee (USD)" },
                        { key: "insurance", label: "Insurance (USD)" },
                        { key: "other_charges", label: "Other Charges (USD)" },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={proformaForm[key]}
                            onChange={(e) =>
                              setProformaForm((prev) => ({ ...prev, [key]: e.target.value }))
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="0.00"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowCreateProforma(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={submitCreateProforma}
                  disabled={!selectedShipment || creatingProforma}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <FaPlus size={12} />
                  {creatingProforma ? "Creating..." : "Create Proforma Invoice"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Print Invoice Overlay ═══ */}
      {printInvoice && (
        <PrintableInvoice
          invoice={printInvoice}
          onClose={() => setPrintInvoice(null)}
        />
      )}
    </div>
  );
}
