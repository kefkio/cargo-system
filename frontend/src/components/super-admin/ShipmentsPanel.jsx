// src/components/super-admin/ShipmentsPanel.jsx
import React, { useEffect, useState } from "react";
import ShipmentLifecycle from "../admin/charts/ShipmentLifecycle";

const STATUS_ORDER = [
  "Pickup Requested",
  "Shipment Created",
  "Processing at Origin",
  "In Transit",
  "Arrived Nairobi Hub",
  "Dispatched",
  "Delivered",
];

function nextStatus(current) {
  const idx = STATUS_ORDER.indexOf(current);
  if (idx >= 0 && idx < STATUS_ORDER.length - 1) return STATUS_ORDER[idx + 1];
  return null;
}

export default function ShipmentsPanel() {
  const [shipments, setShipments] = useState([]);
  const [invoices, setInvoices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedInvoice, setExpandedInvoice] = useState(null);
  const [clearanceForm, setClearanceForm] = useState({});
  const [clearanceLoading, setClearanceLoading] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL.replace(/\/accounts\/?$/, '');
  const token = localStorage.getItem("access");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  useEffect(() => {
    fetchShipments();
  }, []);

  async function fetchShipments() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/shipments/admin/recent-shipments/`, { headers });
      if (!res.ok) throw new Error("Failed to fetch shipments");
      const data = await res.json();
      setShipments(data);
      // Preload invoices for shipments at "Arrived Nairobi Hub" to check payment status
      data
        .filter((s) => s.status === "Arrived Nairobi Hub")
        .forEach((s) => fetchInvoices(s.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchInvoices(shipmentId) {
    try {
      const res = await fetch(`${API_URL}/shipments/${shipmentId}/invoices/`, { headers });
      if (!res.ok) return;
      const data = await res.json();
      setInvoices((prev) => ({ ...prev, [shipmentId]: data }));
    } catch (err) {
      console.error("Error fetching invoices:", err);
    }
  }

  async function handleAdvanceStatus(shipmentId, newStatus) {
    try {
      const res = await fetch(`${API_URL}/shipments/admin/update-status/${shipmentId}/`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to update status");
        return;
      }
      // Refresh shipments and invoices for this shipment
      await fetchShipments();
      await fetchInvoices(shipmentId);
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  }

  function toggleInvoices(shipmentId) {
    if (expandedInvoice === shipmentId) {
      setExpandedInvoice(null);
    } else {
      setExpandedInvoice(shipmentId);
      if (!invoices[shipmentId]) {
        fetchInvoices(shipmentId);
      }
    }
  }

  function initClearanceForm(inv) {
    setClearanceForm({
      [inv.id]: {
        customs_duty: inv.customs_duty || "",
        excise_duty: inv.excise_duty || "",
        import_vat: inv.import_vat || "",
        reimbursable_vat: inv.reimbursable_vat || "",
        rdl: inv.rdl || "",
        idf: inv.idf || "",
        clearance_fee: inv.clearance_fee || "",
        other_charges: inv.other_charges || "",
        tax_rate: inv.tax_rate || 16,
      },
    });
  }

  function handleClearanceFieldChange(invoiceId, field, value) {
    setClearanceForm((prev) => ({
      ...prev,
      [invoiceId]: { ...prev[invoiceId], [field]: value },
    }));
  }

  async function handleConfirmClearance(invoiceId, shipmentId) {
    const formData = clearanceForm[invoiceId];
    if (!formData) return;

    setClearanceLoading(invoiceId);
    try {
      const res = await fetch(`${API_URL}/shipments/invoices/${invoiceId}/confirm-clearance/`, {
        method: "POST",
        headers,
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to confirm clearance charges");
        return;
      }
      await fetchInvoices(shipmentId);
      setClearanceForm({});
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setClearanceLoading(null);
    }
  }

  async function handleUpdateInsurance(invoiceId, shipmentId, insurance) {
    try {
      const res = await fetch(`${API_URL}/shipments/invoices/${invoiceId}/update-insurance/`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ insurance }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to update insurance");
        return;
      }
      await fetchInvoices(shipmentId);
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  async function handleRecordPayment(invoiceId, shipmentId) {
    if (!confirm("Confirm that payment has been received for this proforma invoice?")) return;
    setPaymentLoading(invoiceId);
    try {
      const res = await fetch(`${API_URL}/shipments/invoices/${invoiceId}/record-payment/`, {
        method: "POST",
        headers,
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to record payment");
        return;
      }
      await fetchInvoices(shipmentId);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setPaymentLoading(null);
    }
  }

  if (loading) return <p className="text-gray-500 py-4">Loading shipments...</p>;
  if (error) return <p className="text-red-500 py-4">{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Shipments</h2>
      {shipments.length === 0 && <p className="text-gray-500">No shipments found.</p>}
      {shipments.map((shipment) => {
        const timestamps = {
          "Pickup Requested": shipment.pickup_requested_at,
          "Shipment Created": shipment.shipment_created_at,
          "Processing at Origin": shipment.processing_at_origin_at,
          "In Transit": shipment.in_transit_at,
          "Arrived Nairobi Hub": shipment.arrived_nairobi_at,
          "Dispatched": shipment.dispatched_at,
          "Delivered": shipment.delivered_at,
        };
        const next = nextStatus(shipment.status);
        const shipInvoices = invoices[shipment.id] || [];
        const isExpanded = expandedInvoice === shipment.id;
        const proformaPaid = shipInvoices.some(
          (inv) => inv.invoice_type === "proforma" && inv.status === "paid"
        );
        const dispatchBlocked = next === "Dispatched" && !proformaPaid;

        return (
          <div key={shipment.id} className="mb-6 border rounded-lg bg-white shadow-sm overflow-hidden">
            {/* Shipment Header */}
            <div className="p-4 border-b bg-gray-50">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <p className="font-semibold text-gray-900">
                    {shipment.tracking_number}
                  </p>
                  <p className="text-sm text-gray-600">Client: {shipment.client_name}</p>
                  {shipment.dispatcher_name && (
                    <p className="text-xs text-gray-500 mt-1">
                      🚚 {shipment.dispatcher_service} — {shipment.dispatcher_name}
                      {shipment.dispatcher_phone && (
                        <span className="ml-1">📞 {shipment.dispatcher_phone}</span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {shipment.status}
                  </span>
                  {next && !dispatchBlocked && (
                    <button
                      onClick={() => handleAdvanceStatus(shipment.id, next)}
                      className="px-3 py-1 text-xs font-medium rounded bg-green-600 text-white hover:bg-green-700 transition"
                    >
                      Advance → {next}
                    </button>
                  )}
                  {dispatchBlocked && (
                    <span className="px-3 py-1 text-xs font-medium rounded bg-yellow-100 text-yellow-800 border border-yellow-300">
                      ⚠ Payment required before dispatch
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Lifecycle Tracker */}
            <div className="p-4">
              <ShipmentLifecycle status={shipment.status} timestamps={timestamps} />
            </div>

            {/* Invoice Section */}
            <div className="border-t">
              <button
                onClick={() => toggleInvoices(shipment.id)}
                className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 flex justify-between items-center"
              >
                <span>📄 Invoices</span>
                <span className="text-gray-400">{isExpanded ? "▲" : "▼"}</span>
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  {shipInvoices.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      No invoices yet. Invoices are generated automatically:
                      <br />• <strong>Proforma</strong> — when shipment is created
                      <br />• <strong>Final</strong> — when goods arrive at Nairobi Hub (clearance done)
                    </p>
                  ) : (
                    shipInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        className={`border rounded-lg p-4 ${
                          inv.invoice_type === "proforma"
                            ? "bg-amber-50 border-amber-200"
                            : "bg-emerald-50 border-emerald-200"
                        }`}
                      >
                        <div className="flex justify-between items-start flex-wrap gap-2 mb-3">
                          <div>
                            <p className="font-semibold text-sm">
                              {inv.invoice_number}
                            </p>
                            <span
                              className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded ${
                                inv.invoice_type === "proforma"
                                  ? "bg-amber-200 text-amber-800"
                                  : "bg-emerald-200 text-emerald-800"
                              }`}
                            >
                              {inv.invoice_type === "proforma" ? "Proforma Invoice" : "Final Invoice"}
                            </span>
                          </div>
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${
                              inv.status === "paid"
                                ? "bg-green-200 text-green-800"
                                : inv.status === "issued"
                                ? "bg-blue-200 text-blue-800"
                                : inv.status === "draft"
                                ? "bg-yellow-200 text-yellow-800"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {inv.status.toUpperCase()}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-gray-700">
                          <div>
                            <span className="text-gray-500">Freight:</span>{" "}
                            {inv.currency} {Number(inv.freight_charge).toFixed(2)}
                          </div>
                          <div>
                            <span className="text-gray-500">Handling:</span>{" "}
                            {inv.currency} {Number(inv.handling_fee).toFixed(2)}
                          </div>
                          <div>
                            <span className="text-gray-500">Insurance:</span>{" "}
                            {inv.currency} {Number(inv.insurance).toFixed(2)}
                          </div>
                          {(Number(inv.customs_duty) > 0 || inv.invoice_type === "final") && (
                            <div>
                              <span className="text-gray-500">Customs Duty:</span>{" "}
                              {inv.currency} {Number(inv.customs_duty).toFixed(2)}
                            </div>
                          )}
                          {(Number(inv.excise_duty) > 0 || inv.invoice_type === "final") && (
                            <div>
                              <span className="text-gray-500">Excise Duty:</span>{" "}
                              {inv.currency} {Number(inv.excise_duty).toFixed(2)}
                            </div>
                          )}
                          {(Number(inv.import_vat) > 0 || inv.invoice_type === "final") && (
                            <div>
                              <span className="text-gray-500">Import VAT (Firm-Paid):</span>{" "}
                              {inv.currency} {Number(inv.import_vat).toFixed(2)}
                            </div>
                          )}
                          {(Number(inv.reimbursable_vat) > 0 || inv.invoice_type === "final") && (
                            <div>
                              <span className="text-gray-500">Reimbursable VAT:</span>{" "}
                              {inv.currency} {Number(inv.reimbursable_vat).toFixed(2)}
                            </div>
                          )}
                          {(Number(inv.rdl) > 0 || inv.invoice_type === "final") && (
                            <div>
                              <span className="text-gray-500">RDL:</span>{" "}
                              {inv.currency} {Number(inv.rdl).toFixed(2)}
                            </div>
                          )}
                          {(Number(inv.idf) > 0 || inv.invoice_type === "final") && (
                            <div>
                              <span className="text-gray-500">IDF:</span>{" "}
                              {inv.currency} {Number(inv.idf).toFixed(2)}
                            </div>
                          )}
                          {(Number(inv.clearance_fee) > 0 || inv.invoice_type === "final") && (
                            <div>
                              <span className="text-gray-500">Clearance:</span>{" "}
                              {inv.currency} {Number(inv.clearance_fee).toFixed(2)}
                            </div>
                          )}
                          {Number(inv.other_charges) > 0 && (
                            <div>
                              <span className="text-gray-500">Other:</span>{" "}
                              {inv.currency} {Number(inv.other_charges).toFixed(2)}
                            </div>
                          )}
                          {Number(inv.tax_rate) > 0 && (
                            <div>
                              <span className="text-gray-500">Tax ({inv.tax_rate}%):</span>{" "}
                              {inv.currency} {Number(inv.tax_amount).toFixed(2)}
                            </div>
                          )}
                        </div>

                        <div className="mt-3 pt-2 border-t flex justify-between items-center">
                          <span className="text-sm font-bold text-gray-900">
                            Total: {inv.currency} {Number(inv.total_amount).toFixed(2)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(inv.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        {inv.notes && (
                          <p className="mt-2 text-xs text-gray-500 italic">{inv.notes}</p>
                        )}

                        {/* Insurance update for proforma invoices (at dispatch) */}
                        {inv.invoice_type === "proforma" && Number(inv.insurance) === 0 && (
                          <div className="mt-3 pt-3 border-t border-amber-300">
                            <p className="text-xs font-semibold text-amber-800 mb-2">
                              Update Insurance Cost (at dispatch)
                            </p>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Insurance amount"
                                className="flex-1 px-3 py-1.5 text-sm border border-amber-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                                id={`insurance-${inv.id}`}
                              />
                              <button
                                onClick={() => {
                                  const val = document.getElementById(`insurance-${inv.id}`).value;
                                  if (val) handleUpdateInsurance(inv.id, shipment.id, parseFloat(val));
                                }}
                                className="px-3 py-1.5 text-xs font-medium rounded bg-amber-600 text-white hover:bg-amber-700 transition"
                              >
                                Update
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Record Payment for issued proforma invoices (required before dispatch) */}
                        {inv.invoice_type === "proforma" && inv.status === "issued" && (
                          <div className="mt-3 pt-3 border-t border-green-300">
                            <p className="text-xs font-semibold text-green-800 mb-2">
                              Payment Required Before Dispatch
                            </p>
                            <button
                              disabled={paymentLoading === inv.id}
                              onClick={() => handleRecordPayment(inv.id, shipment.id)}
                              className="px-4 py-2 text-xs font-semibold rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition"
                            >
                              {paymentLoading === inv.id ? "Recording..." : "Record Payment"}
                            </button>
                          </div>
                        )}

                        {/* Clearance charges form for draft final invoices */}
                        {inv.invoice_type === "final" && !inv.clearance_charges_confirmed && (
                          <div className="mt-3 pt-3 border-t border-emerald-300">
                            <p className="text-xs font-semibold text-emerald-800 mb-1">
                              Confirm Clearance Charges
                            </p>
                            <p className="text-xs text-gray-500 mb-3">
                              All clearance charges must be entered before this invoice can be issued.
                            </p>
                            {!clearanceForm[inv.id] ? (
                              <button
                                onClick={() => initClearanceForm(inv)}
                                className="px-3 py-1.5 text-xs font-medium rounded bg-emerald-600 text-white hover:bg-emerald-700 transition"
                              >
                                Enter Clearance Charges
                              </button>
                            ) : (
                              <div className="space-y-2">
                                <div className="grid grid-cols-2 gap-2">
                                  {[
                                    { key: "customs_duty", label: "Customs Duty" },
                                    { key: "excise_duty", label: "Excise Duty" },
                                    { key: "import_vat", label: "Import VAT (Firm-Paid)" },
                                    { key: "reimbursable_vat", label: "Reimbursable VAT" },
                                    { key: "rdl", label: "RDL" },
                                    { key: "idf", label: "IDF" },
                                    { key: "clearance_fee", label: "Clearance Fee" },
                                    { key: "other_charges", label: "Other Charges" },
                                  ].map(({ key, label }) => (
                                    <div key={key}>
                                      <label className="block text-xs text-gray-600 mb-0.5">{label}</label>
                                      <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={clearanceForm[inv.id]?.[key] ?? ""}
                                        onChange={(e) => handleClearanceFieldChange(inv.id, key, e.target.value)}
                                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                      />
                                    </div>
                                  ))}
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-0.5">VAT Rate (%)</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={clearanceForm[inv.id]?.tax_rate ?? 16}
                                    onChange={(e) => handleClearanceFieldChange(inv.id, "tax_rate", e.target.value)}
                                    className="w-32 px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                  />
                                </div>
                                <div className="flex gap-2 pt-1">
                                  <button
                                    onClick={() => handleConfirmClearance(inv.id, shipment.id)}
                                    disabled={clearanceLoading === inv.id}
                                    className="px-4 py-2 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition"
                                  >
                                    {clearanceLoading === inv.id ? "Confirming..." : "Confirm & Issue Invoice"}
                                  </button>
                                  <button
                                    onClick={() => setClearanceForm({})}
                                    className="px-3 py-2 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Confirmed badge */}
                        {inv.invoice_type === "final" && inv.clearance_charges_confirmed && (
                          <div className="mt-2">
                            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded bg-green-100 text-green-700">
                              ✓ Clearance Charges Confirmed
                            </span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}