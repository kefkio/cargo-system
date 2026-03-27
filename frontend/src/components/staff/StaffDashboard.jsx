// src/components/staff/StaffDashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBox,
  FaTruck,
  FaSearch,
  FaClipboardList,
  FaSignOutAlt,
  FaCogs,
  FaPlane,
  FaShip,
  FaCheckCircle,
  FaArrowRight,
  FaMoneyBillWave,
  FaFileInvoiceDollar,
  FaChevronDown,
  FaChevronUp,
  FaChartBar,
} from "react-icons/fa";
import InvoicesPanel from "../shared/InvoicesPanel";
import ShipmentSticker from "../shipment/ShipmentSticker";

const PIPELINE_STATUSES = [
  "Shipment Created",
  "Processing at Origin",
  "In Transit",
  "Arrived Nairobi Hub",
  "Dispatched",
];

const NEXT_STATUS = {
  "Shipment Created": "Processing at Origin",
  "Processing at Origin": "In Transit",
  "In Transit": "Arrived Nairobi Hub",
  "Arrived Nairobi Hub": "Dispatched",
  "Dispatched": "Delivered",
};

const STATUS_COLORS = {
  "Shipment Created": { bg: "bg-blue-50", border: "border-blue-200", badge: "bg-blue-200 text-blue-800" },
  "Processing at Origin": { bg: "bg-indigo-50", border: "border-indigo-200", badge: "bg-indigo-200 text-indigo-800" },
  "In Transit": { bg: "bg-purple-50", border: "border-purple-200", badge: "bg-purple-200 text-purple-800" },
  "Arrived Nairobi Hub": { bg: "bg-teal-50", border: "border-teal-200", badge: "bg-teal-200 text-teal-800" },
  "Dispatched": { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-200 text-orange-800" },
};

export default function StaffDashboard() {
  const navigate = useNavigate();

  const [pickupRequests, setPickupRequests] = useState([]);
  const [pipelineShipments, setPipelineShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("STAFF");
  const [advancingId, setAdvancingId] = useState(null);
  const [pipelineFilter, setPipelineFilter] = useState("all");

  /* Payment panel state */
  const [paymentInvoices, setPaymentInvoices] = useState([]);
  const [paymentLoading, setPaymentLoading] = useState(true);
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentTab, setPaymentTab] = useState("outstanding"); // outstanding | paid | all
  const [expandedInvoice, setExpandedInvoice] = useState(null);
  const [recordingId, setRecordingId] = useState(null);

  /* Payment modal state */
  const [paymentModal, setPaymentModal] = useState(null); // { invoiceId, invoiceNumber }
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentReference, setPaymentReference] = useState("");

  /* Sticker reprint state */
  const [stickerShipment, setStickerShipment] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const BASE_URL = API_URL.replace(/\/accounts\/?$/, '');

  const fetchShipments = useCallback(async () => {
    const token = localStorage.getItem("access");
    if (!token) return;
    try {
      const [pickupRes, shipmentsRes] = await Promise.all([
        fetch(`${BASE_URL}/shipments/admin/pickup-requests/`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${BASE_URL}/shipments/admin/pipeline/`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (pickupRes.ok) {
        const pickupData = await pickupRes.json();
        setPickupRequests(Array.isArray(pickupData) ? pickupData : pickupData.results || []);
      }
      if (shipmentsRes.ok) {
        const pipelineData = await shipmentsRes.json();
        setPipelineShipments(Array.isArray(pipelineData) ? pipelineData : pipelineData.results || []);
      }
    } catch (err) {
      console.error("Failed to load shipments", err);
    }
  }, [BASE_URL]);

  const fetchInvoices = useCallback(async () => {
    const token = localStorage.getItem("access");
    if (!token) return;
    try {
      setPaymentLoading(true);
      const res = await fetch(`${BASE_URL}/shipments/invoices/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPaymentInvoices(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error("Failed to load invoices", err);
    } finally {
      setPaymentLoading(false);
    }
  }, [BASE_URL]);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return navigate("/login");

    async function fetchData() {
      try {
        const profileRes = await fetch(`${API_URL}/profile/`, { headers: { Authorization: `Bearer ${token}` } });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          setUserRole(profile.role || "STAFF");
        }
        await Promise.all([fetchShipments(), fetchInvoices()]);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [navigate, API_URL, fetchShipments, fetchInvoices]);

  const advanceStatus = async (shipment) => {
    const next = NEXT_STATUS[shipment.status];
    if (!next) return;
    setAdvancingId(shipment.id);
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`${BASE_URL}/shipments/admin/update-status/${shipment.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to update status");
        return;
      }
      await fetchShipments();
    } catch (err) {
      alert("Network error updating status");
    } finally {
      setAdvancingId(null);
    }
  };

  const openPaymentModal = (invoice) => {
    setPaymentModal({ invoiceId: invoice.id, invoiceNumber: invoice.invoice_number });
    setPaymentMethod("");
    setPaymentReference("");
  };

  const recordPayment = async () => {
    if (!paymentModal || !paymentMethod) return;
    setRecordingId(paymentModal.invoiceId);
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`${BASE_URL}/shipments/invoices/${paymentModal.invoiceId}/record-payment/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
      await Promise.all([fetchInvoices(), fetchShipments()]);
    } catch (err) {
      alert("Network error recording payment");
    } finally {
      setRecordingId(null);
    }
  };

  /* Payment panel computed values */
  const outstandingInvoices = paymentInvoices.filter(
    (inv) => inv.status === "issued" && inv.invoice_type === "proforma"
  );
  const paidInvoices = paymentInvoices.filter((inv) => inv.status === "paid");
  const totalOutstanding = outstandingInvoices.reduce(
    (sum, inv) => sum + Number(inv.total_amount || 0), 0
  );
  const totalCollected = paidInvoices.reduce(
    (sum, inv) => sum + Number(inv.total_amount || 0), 0
  );

  const paymentFiltered = paymentInvoices
    .filter((inv) => {
      if (paymentTab === "outstanding") return inv.status === "issued" && inv.invoice_type === "proforma";
      if (paymentTab === "paid") return inv.status === "paid";
      return true;
    })
    .filter((inv) => {
      if (!paymentSearch.trim()) return true;
      const q = paymentSearch.toLowerCase();
      return (
        (inv.invoice_number || "").toLowerCase().includes(q) ||
        (inv.cargo_tracking || "").toLowerCase().includes(q) ||
        (inv.client_name || "").toLowerCase().includes(q)
      );
    });

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/");
    window.location.reload();
  };

  const cards = [
    {
      title: "Pickup Requests",
      icon: <FaTruck size={28} />,
      description: "View and schedule pickups",
      action: () => navigate("/staff/pickups"),
    },
    {
      title: "Create Shipment",
      icon: <FaBox size={28} />,
      description: "Register new shipment from client",
      action: () => navigate("/staff/create-shipment"),
    },
    {
      title: "Invoicing",
      icon: <FaFileInvoiceDollar size={28} />,
      description: "Manage invoices, enter taxes & duties",
      action: () => navigate("/staff/invoicing"),
    },
    {
      title: "Dispatch Center",
      icon: <FaClipboardList size={28} />,
      description: "Manage shipments ready for dispatch",
      action: () => navigate("/staff/dispatch"),
    },
    {
      title: "Reports",
      icon: <FaChartBar size={28} />,
      description: "Shipment, revenue & client analytics",
      action: () => navigate("/staff/reports"),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Header */}
      <div className="bg-white shadow px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          Staff Operations Dashboard
        </h1>

        <button
          onClick={logout}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          <FaSignOutAlt />
          Logout
        </button>
      </div>

      {/* Dashboard cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 p-8">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={card.action}
            className="cursor-pointer bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
          >
            <div className="text-primary mb-3">{card.icon}</div>

            <h2 className="text-lg font-semibold mb-2">{card.title}</h2>

            <p className="text-sm text-gray-600">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Pickup Requests List */}
      <div className="px-8 pb-2">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FaTruck className="text-primary" /> Pickup Requests
            </h2>
            <span className="text-sm text-gray-500">
              {pickupRequests.length} request{pickupRequests.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <p className="text-gray-500 py-4">Loading pickup requests...</p>
          ) : pickupRequests.length === 0 ? (
            <p className="text-gray-500 italic py-4">No pickup requests at the moment.</p>
          ) : (
            <div className="space-y-3">
              {pickupRequests.map((req) => {
                const isPickedUp = req.status !== "Pickup Requested";
                return (
                  <div
                    key={req.id}
                    className={`border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${
                      isPickedUp
                        ? "bg-green-50 border-green-200"
                        : "bg-amber-50 border-amber-200"
                    }`}
                  >
                    {/* Status badge */}
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                          isPickedUp
                            ? "bg-green-200 text-green-800"
                            : "bg-amber-200 text-amber-800"
                        }`}
                      >
                        {req.status === "Pickup Requested"
                          ? "Requested"
                          : req.status === "Shipment Created"
                          ? "Picked Up"
                          : req.status}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                        <p className="text-sm font-semibold text-gray-900">
                          {req.tracking_number}
                        </p>
                        {req.client_name && (
                          <p className="text-sm text-gray-600">
                            <span className="text-gray-400">By:</span> {req.client_name}
                          </p>
                        )}
                        {req.cargo_type && (
                          <p className="text-sm text-gray-600">
                            <span className="text-gray-400">Type:</span> {req.cargo_type}
                          </p>
                        )}
                        {req.transport_mode && (
                          <p className="text-sm text-gray-600">
                            <span className="text-gray-400">Mode:</span> {req.transport_mode}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        {(req.origin || req.destination) && (
                          <p className="text-xs text-gray-500">
                            Route: {req.origin || "—"} → {req.destination || "—"}
                          </p>
                        )}
                        {req.pickup_requested_at && (
                          <p className="text-xs text-gray-500">
                            Requested: {new Date(req.pickup_requested_at).toLocaleString()}
                          </p>
                        )}
                        {req.dest_contact_person && (
                          <p className="text-xs text-gray-500">
                            Contact: {req.dest_contact_person}
                            {req.dest_contact_phone ? ` (${req.dest_contact_phone})` : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    {!isPickedUp && (
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => navigate("/staff/create-shipment", { state: { pickupRequest: req } })}
                          className="px-4 py-2 text-xs font-semibold rounded bg-primary text-white hover:bg-primary-dark transition"
                        >
                          Create Shipment
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Processing Pipeline */}
      <div className="px-8 pb-2 pt-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FaCogs className="text-indigo-600" /> Processing Pipeline
            </h2>
            <span className="text-sm text-gray-500">
              {pipelineShipments.length} active shipment{pipelineShipments.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Status filter tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setPipelineFilter("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition ${
                pipelineFilter === "all"
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All ({pipelineShipments.length})
            </button>
            {PIPELINE_STATUSES.map((st) => {
              const count = pipelineShipments.filter((s) => s.status === st).length;
              return (
                <button
                  key={st}
                  onClick={() => setPipelineFilter(st)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition ${
                    pipelineFilter === st
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {st} ({count})
                </button>
              );
            })}
          </div>

          {loading ? (
            <p className="text-gray-500 py-4">Loading pipeline...</p>
          ) : pipelineShipments.length === 0 ? (
            <p className="text-gray-500 italic py-4">No shipments in the pipeline.</p>
          ) : (
            <div className="space-y-3">
              {pipelineShipments
                .filter((s) => pipelineFilter === "all" || s.status === pipelineFilter)
                .map((shipment) => {
                  const colors = STATUS_COLORS[shipment.status] || {};
                  const next = NEXT_STATUS[shipment.status];
                  const isAdvancing = advancingId === shipment.id;
                  return (
                    <div
                      key={shipment.id}
                      className={`border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-3 ${colors.bg} ${colors.border}`}
                    >
                      {/* Status badge */}
                      <div className="flex-shrink-0">
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${colors.badge}`}>
                          {shipment.status}
                        </span>
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {shipment.tracking_number}
                          </p>
                          {shipment.client_name && (
                            <p className="text-sm text-gray-600">
                              <span className="text-gray-400">Client:</span> {shipment.client_name}
                            </p>
                          )}
                          {shipment.transport_mode && (
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              {shipment.transport_mode === "Air" ? <FaPlane className="text-blue-500" size={12} /> : <FaShip className="text-teal-500" size={12} />}
                              {shipment.transport_mode}
                            </p>
                          )}
                          {shipment.weight_kg && (
                            <p className="text-sm text-gray-600">
                              <span className="text-gray-400">Wt:</span> {shipment.weight_kg}kg
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                          {(shipment.origin_name || shipment.destination_name) && (
                            <p className="text-xs text-gray-500">
                              Route: {shipment.origin_name || "—"} → {shipment.destination_name || "—"}
                            </p>
                          )}
                          {shipment.priority && shipment.priority !== "Standard" && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                              {shipment.priority}
                            </span>
                          )}
                          {shipment.dest_contact_person && (
                            <p className="text-xs text-gray-500">
                              Contact: {shipment.dest_contact_person}
                              {shipment.dest_contact_phone ? ` (${shipment.dest_contact_phone})` : ""}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex items-center gap-2">
                        <button
                          onClick={() => setStickerShipment(shipment)}
                          className="flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300 transition"
                        >
                          🖨 {shipment.sticker_print_count > 0 ? `Reprint (${shipment.sticker_print_count})` : "Print Sticker"}
                        </button>
                      {next && (() => {
                        const needsPayment = next === "Dispatched" && !shipment.proforma_paid;
                        return (
                          <div className="flex-shrink-0">
                            {needsPayment ? (
                              <span className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded bg-amber-100 text-amber-800 border border-amber-300">
                                <FaMoneyBillWave size={12} />
                                Payment required before dispatch
                              </span>
                            ) : (
                              <button
                                onClick={() => advanceStatus(shipment)}
                                disabled={isAdvancing}
                                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded transition ${
                                  isAdvancing
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                                }`}
                              >
                                {isAdvancing ? (
                                  "Updating..."
                                ) : (
                                  <>
                                    <FaArrowRight size={10} />
                                    {next}
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        );
                      })()}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* ═══ Payment Management Panel ═══ */}
      <div className="px-8 pb-2 pt-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Panel Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaMoneyBillWave /> Payment Management
            </h2>
            <p className="text-emerald-100 text-sm mt-1">
              Track and record payments for shipment invoices
            </p>
          </div>

          <div className="p-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {outstandingInvoices.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Outstanding</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-red-600">
                  ${totalOutstanding.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Amount Due</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">
                  {paidInvoices.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">Paid</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  ${totalCollected.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Collected</p>
              </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="flex gap-2">
                {[
                  { key: "outstanding", label: "Outstanding", count: outstandingInvoices.length },
                  { key: "paid", label: "Paid", count: paidInvoices.length },
                  { key: "all", label: "All", count: paymentInvoices.length },
                ].map(({ key, label, count }) => (
                  <button
                    key={key}
                    onClick={() => setPaymentTab(key)}
                    className={`px-4 py-2 text-xs font-semibold rounded-full transition ${
                      paymentTab === key
                        ? "bg-emerald-600 text-white"
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
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  placeholder="Search by tracking number, invoice, or client..."
                  className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Invoice List */}
            {paymentLoading ? (
              <p className="text-gray-500 py-6 text-center">Loading invoices...</p>
            ) : paymentFiltered.length === 0 ? (
              <div className="text-center py-8">
                <FaFileInvoiceDollar className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-gray-500 italic">
                  {paymentSearch
                    ? "No invoices match your search."
                    : paymentTab === "outstanding"
                    ? "No outstanding payments — all caught up!"
                    : paymentTab === "paid"
                    ? "No payments recorded yet."
                    : "No invoices found."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentFiltered.map((inv) => {
                  const isExpanded = expandedInvoice === inv.id;
                  const isProforma = inv.invoice_type === "proforma";
                  const isRecording = recordingId === inv.id;
                  const canPay = inv.status === "issued" && isProforma;

                  return (
                    <div
                      key={inv.id}
                      className={`border rounded-lg overflow-hidden transition ${
                        canPay
                          ? "border-orange-200 bg-orange-50/50"
                          : inv.status === "paid"
                          ? "border-green-200 bg-green-50/50"
                          : "border-gray-200 bg-gray-50/50"
                      }`}
                    >
                      {/* Invoice Header Row */}
                      <div
                        onClick={() => setExpandedInvoice(isExpanded ? null : inv.id)}
                        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/60 transition"
                      >
                        <div className="flex items-center gap-3 flex-wrap min-w-0">
                          {/* Status indicator */}
                          <span
                            className={`w-2 h-2 rounded-full flex-shrink-0 ${
                              inv.status === "paid"
                                ? "bg-green-500"
                                : inv.status === "issued"
                                ? "bg-orange-500"
                                : inv.status === "draft"
                                ? "bg-gray-400"
                                : "bg-red-400"
                            }`}
                          />
                          <span className="text-sm font-semibold text-gray-900">
                            {inv.invoice_number}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded ${
                              isProforma
                                ? "bg-amber-100 text-amber-800"
                                : "bg-emerald-100 text-emerald-800"
                            }`}
                          >
                            {isProforma ? "Proforma" : "Final"}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded ${
                              inv.status === "paid"
                                ? "bg-green-100 text-green-700"
                                : inv.status === "issued"
                                ? "bg-blue-100 text-blue-700"
                                : inv.status === "draft"
                                ? "bg-gray-200 text-gray-600"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {inv.status.toUpperCase()}
                          </span>
                          {inv.cargo_tracking && (
                            <span className="text-xs text-gray-500">
                              {inv.cargo_tracking}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-sm font-bold text-gray-900">
                            {inv.currency} {Number(inv.total_amount).toFixed(2)}
                          </span>
                          {canPay && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openPaymentModal(inv);
                              }}
                              disabled={isRecording}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition"
                            >
                              <FaCheckCircle size={10} />
                              {isRecording ? "Recording..." : "Record Payment"}
                            </button>
                          )}
                          {inv.status === "paid" && (
                            <span className="flex items-center gap-1 text-xs text-green-600 font-semibold">
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

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-gray-200">
                          {/* Client & Shipment Info */}
                          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-xs">
                            {inv.client_name && (
                              <div>
                                <span className="text-gray-400">Client: </span>
                                <span className="font-medium text-gray-900">
                                  {inv.client_name}
                                </span>
                              </div>
                            )}
                            <div>
                              <span className="text-gray-400">Created: </span>
                              <span className="font-medium text-gray-900">
                                {new Date(inv.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            {inv.issued_at && (
                              <div>
                                <span className="text-gray-400">Issued: </span>
                                <span className="font-medium text-gray-900">
                                  {new Date(inv.issued_at).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {inv.paid_at && (
                              <div>
                                <span className="text-gray-400">Paid: </span>
                                <span className="font-medium text-gray-900">
                                  {new Date(inv.paid_at).toLocaleDateString()}
                                </span>
                              </div>
                            )}
                            {inv.payment_method && (
                              <div>
                                <span className="text-gray-400">Via: </span>
                                <span className="font-medium text-gray-900">
                                  {{ cash: "💵 Cash", bank: "🏦 Bank", mpesa: "📱 M-Pesa", visa: "💳 Visa" }[inv.payment_method] || inv.payment_method}
                                </span>
                              </div>
                            )}
                            {inv.payment_reference && (
                              <div>
                                <span className="text-gray-400">Ref: </span>
                                <span className="font-medium text-gray-900">
                                  {inv.payment_reference}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Charges Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 mt-3 text-xs">
                            {[
                              { label: "Freight", value: inv.freight_charge },
                              { label: "Handling", value: inv.handling_fee },
                              { label: "Insurance", value: inv.insurance },
                              ...(Number(inv.customs_duty) > 0 || inv.invoice_type === "final"
                                ? [{ label: "Customs Duty", value: inv.customs_duty }]
                                : []),
                              ...(Number(inv.excise_duty) > 0 || inv.invoice_type === "final"
                                ? [{ label: "Excise Duty", value: inv.excise_duty }]
                                : []),
                              ...(Number(inv.rdl) > 0 || inv.invoice_type === "final"
                                ? [{ label: "RDL", value: inv.rdl }]
                                : []),
                              ...(Number(inv.idf) > 0 || inv.invoice_type === "final"
                                ? [{ label: "IDF", value: inv.idf }]
                                : []),
                              ...(Number(inv.clearance_fee) > 0 || inv.invoice_type === "final"
                                ? [{ label: "Clearance", value: inv.clearance_fee }]
                                : []),
                              ...(Number(inv.other_charges) > 0
                                ? [{ label: "Other", value: inv.other_charges }]
                                : []),
                            ].map(({ label, value }) => (
                              <div key={label} className="flex justify-between">
                                <span className="text-gray-400">{label}</span>
                                <span className="text-gray-900">
                                  {inv.currency} {Number(value).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Totals */}
                          <div className="mt-3 pt-2 border-t border-gray-200 text-xs space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-400">Subtotal</span>
                              <span className="text-gray-900">
                                {inv.currency} {Number(inv.subtotal).toFixed(2)}
                              </span>
                            </div>
                            {Number(inv.tax_rate) > 0 && (
                              <div className="flex justify-between">
                                <span className="text-gray-400">
                                  Tax ({inv.tax_rate}%)
                                </span>
                                <span className="text-gray-900">
                                  {inv.currency} {Number(inv.tax_amount).toFixed(2)}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between font-bold text-sm pt-1">
                              <span className="text-gray-900">Total</span>
                              <span className="text-gray-900">
                                {inv.currency} {Number(inv.total_amount).toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Payment action in expanded view */}
                          {canPay && (
                            <div className="mt-4 pt-3 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-orange-700 font-medium">
                                  Payment required before dispatch
                                </p>
                                <button
                                  onClick={() => openPaymentModal(inv)}
                                  disabled={isRecording}
                                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition"
                                >
                                  <FaMoneyBillWave size={14} />
                                  {isRecording ? "Recording..." : "Record Payment"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reports Section */}
      <div className="p-8">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Invoice Reports</h2>
          <p className="text-sm text-gray-500 mt-1">
            Reports are not loaded automatically. Click <strong>Run Report</strong> inside the panel to fetch invoice data on demand.
          </p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <InvoicesPanel role={userRole} lazy />
        </div>
      </div>

      {/* ═══ Payment Method Modal ═══ */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FaMoneyBillWave /> Record Payment
              </h3>
              <p className="text-emerald-100 text-sm mt-0.5">
                {paymentModal.invoiceNumber}
              </p>
            </div>

            <div className="p-6 space-y-5">
              {/* Payment Method Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition ${
                      paymentMethod === "cash"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-2xl">💵</span>
                    <span className="text-sm font-semibold">Cash</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bank")}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition ${
                      paymentMethod === "bank"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span className="text-2xl">🏦</span>
                    <span className="text-sm font-semibold">Bank Transfer</span>
                  </button>
                </div>
              </div>

              {/* Payment Reference */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Reference / Receipt No.{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder={
                    paymentMethod === "bank"
                      ? "e.g. Bank transaction ID"
                      : "e.g. Cash receipt number"
                  }
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
                  onClick={recordPayment}
                  disabled={!paymentMethod || recordingId === paymentModal.invoiceId}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <FaCheckCircle size={14} />
                  {recordingId === paymentModal.invoiceId
                    ? "Recording..."
                    : "Confirm Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sticker Reprint Modal */}
      {stickerShipment && (
        <ShipmentSticker
          shipment={stickerShipment}
          requireConfirmation={false}
          onClose={() => setStickerShipment(null)}
        />
      )}
    </div>
  );
}