// src/components/staff/StaffDispatch.jsx
import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaSearch,
  FaTruck,
  FaCheckCircle,
  FaPhone,
  FaUser,
  FaTimes,
  FaSync,
} from "react-icons/fa";

export default function StaffDispatch() {
  const navigate = useNavigate();

  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("ready"); // ready | dispatched

  // Dispatch modal state
  const [dispatchModal, setDispatchModal] = useState(null); // shipment object
  const [dispatchService, setDispatchService] = useState("");
  const [dispatcherName, setDispatcherName] = useState("");
  const [dispatcherPhone, setDispatcherPhone] = useState("");
  const [dispatchCost, setDispatchCost] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Autocomplete state
  const [handlers, setHandlers] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const BASE_URL =
    import.meta.env.VITE_BASE_URL || API_URL.replace(/\/accounts\/?$/, "");

  const fetchShipments = useCallback(async () => {
    const token = localStorage.getItem("access");
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/shipments/admin/pipeline/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        navigate("/login");
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setShipments(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) {
      console.error("Failed to load shipments", err);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return navigate("/login");
    fetchShipments();
  }, [navigate, fetchShipments]);

  // Shipments ready for dispatch (Arrived Nairobi Hub)
  const readyShipments = useMemo(
    () => shipments.filter((s) => s.status === "Arrived Nairobi Hub"),
    [shipments]
  );

  // Dispatched shipments (for reference)
  const dispatchedShipments = useMemo(
    () => shipments.filter((s) => s.status === "Dispatched"),
    [shipments]
  );

  const activeList = tab === "ready" ? readyShipments : dispatchedShipments;

  const filtered = useMemo(() => {
    if (!search.trim()) return activeList;
    const q = search.toLowerCase();
    return activeList.filter(
      (s) =>
        (s.tracking_number || "").toLowerCase().includes(q) ||
        (s.client_name || "").toLowerCase().includes(q) ||
        (s.dest_contact_person || "").toLowerCase().includes(q) ||
        (s.dispatcher_name || "").toLowerCase().includes(q)
    );
  }, [activeList, search]);

  const openDispatchModal = (shipment) => {
    setDispatchModal(shipment);
    setDispatchService("");
    setDispatcherName("");
    setDispatcherPhone("");
    setDispatchCost("");
    setShowSuggestions(false);
    fetchHandlers("");
  };

  // Fetch saved dispatch handlers for autocomplete
  const fetchHandlers = async (q) => {
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(
        `${BASE_URL}/shipments/admin/dispatch-handlers/?q=${encodeURIComponent(q)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.ok) {
        const data = await res.json();
        setHandlers(data);
      }
    } catch {
      // ignore
    }
  };

  const handleServiceInput = (val) => {
    setDispatchService(val);
    fetchHandlers(val);
    setShowSuggestions(true);
  };

  const selectHandler = (handler) => {
    setDispatchService(handler.service_name);
    setDispatcherName(handler.contact_name);
    setDispatcherPhone(handler.contact_phone || "");
    setShowSuggestions(false);
  };

  const handleDispatch = async () => {
    if (!dispatchModal || !dispatchService.trim() || !dispatcherName.trim()) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(
        `${BASE_URL}/shipments/admin/update-dispatcher/${dispatchModal.id}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            dispatcher_name: dispatcherName.trim(),
            dispatcher_phone: dispatcherPhone.trim(),
            dispatcher_service: dispatchService.trim(),
            dispatch_cost: dispatchCost ? parseFloat(dispatchCost) : 0,
          }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to dispatch shipment");
        return;
      }
      setDispatchModal(null);
      await fetchShipments();
    } catch {
      alert("Network error dispatching shipment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow px-8 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate("/dashboard/staff")}
          className="text-gray-500 hover:text-gray-700"
        >
          <FaArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dispatch Center</h1>
          <p className="text-sm text-gray-500">
            Assign riders or parcel handlers for Nairobi delivery
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-teal-600">
              {readyShipments.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Ready for Dispatch</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {dispatchedShipments.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Dispatched</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {shipments.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Total in Pipeline</p>
          </div>
        </div>

        {/* Tabs & Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex gap-2">
            <button
              onClick={() => setTab("ready")}
              className={`px-4 py-2 text-xs font-semibold rounded-full transition ${
                tab === "ready"
                  ? "bg-teal-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Ready ({readyShipments.length})
            </button>
            <button
              onClick={() => setTab("dispatched")}
              className={`px-4 py-2 text-xs font-semibold rounded-full transition ${
                tab === "dispatched"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Dispatched ({dispatchedShipments.length})
            </button>
          </div>
          <div className="flex-1 relative">
            <FaSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={12}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tracking number, client, or contact..."
              className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={fetchShipments}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition disabled:opacity-50"
          >
            <FaSync className={loading ? "animate-spin" : ""} size={12} />
            Refresh
          </button>
        </div>

        {/* Shipment List */}
        {loading ? (
          <p className="text-gray-500 py-8 text-center">
            Loading shipments...
          </p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <FaTruck className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 italic">
              {search
                ? "No shipments match your search."
                : tab === "ready"
                ? "No shipments ready for dispatch."
                : "No dispatched shipments in the pipeline."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((shipment) => (
              <div
                key={shipment.id}
                className={`bg-white border rounded-lg p-4 shadow-sm ${
                  tab === "dispatched"
                    ? "border-orange-200"
                    : "border-teal-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Status badge */}
                  <div className="flex-shrink-0">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${
                        shipment.status === "Dispatched"
                          ? "bg-orange-200 text-orange-800"
                          : "bg-teal-200 text-teal-800"
                      }`}
                    >
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
                          <span className="text-gray-400">Client:</span>{" "}
                          {shipment.client_name}
                        </p>
                      )}
                      {shipment.weight_kg && (
                        <p className="text-sm text-gray-600">
                          <span className="text-gray-400">Wt:</span>{" "}
                          {shipment.weight_kg}kg
                        </p>
                      )}
                      {shipment.number_of_pieces && (
                        <p className="text-sm text-gray-600">
                          <span className="text-gray-400">Pcs:</span>{" "}
                          {shipment.number_of_pieces}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      {shipment.dest_contact_person && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <FaUser size={10} />
                          {shipment.dest_contact_person}
                          {shipment.dest_contact_phone && (
                            <span className="flex items-center gap-0.5 ml-1">
                              <FaPhone size={9} />
                              {shipment.dest_contact_phone}
                            </span>
                          )}
                        </p>
                      )}
                      {shipment.destination_name && (
                        <p className="text-xs text-gray-500">
                          Dest: {shipment.destination_name}
                        </p>
                      )}
                      {shipment.dispatcher_name && (
                        <p className="text-xs text-gray-500">
                          Dispatcher: {shipment.dispatcher_name}
                          {shipment.dispatcher_phone && ` (${shipment.dispatcher_phone})`}
                          {" "}— {shipment.dispatcher_service}
                        </p>
                      )}
                      {shipment.dispatched_datetime && (
                        <p className="text-xs text-gray-500">
                          Dispatched:{" "}
                          {new Date(shipment.dispatched_datetime).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    {shipment.status === "Arrived Nairobi Hub" ? (
                      <button
                        onClick={() => openDispatchModal(shipment)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded bg-teal-600 text-white hover:bg-teal-700 transition"
                      >
                        <FaTruck size={12} />
                        Assign &amp; Dispatch
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-orange-600 font-semibold">
                        <FaCheckCircle size={10} /> Dispatched
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ═══ Dispatch Assignment Modal ═══ */}
      {dispatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FaTruck /> Dispatch Shipment
              </h3>
              <p className="text-teal-100 text-sm mt-0.5">
                {dispatchModal.tracking_number}
                {dispatchModal.client_name &&
                  ` — ${dispatchModal.client_name}`}
              </p>
            </div>

            <div className="p-6 space-y-5">
              {/* Shipment summary */}
              <div className="bg-gray-50 rounded-lg p-3 text-xs space-y-1">
                {dispatchModal.dest_contact_person && (
                  <p>
                    <span className="text-gray-400">Deliver to:</span>{" "}
                    <span className="font-medium text-gray-900">
                      {dispatchModal.dest_contact_person}
                    </span>
                    {dispatchModal.dest_contact_phone && (
                      <span className="ml-2 text-gray-500">
                        ({dispatchModal.dest_contact_phone})
                      </span>
                    )}
                  </p>
                )}
                {dispatchModal.dest_contact_email && (
                  <p>
                    <span className="text-gray-400">Email:</span>{" "}
                    <span className="font-medium text-gray-900">
                      {dispatchModal.dest_contact_email}
                    </span>
                  </p>
                )}
                {dispatchModal.destination_name && (
                  <p>
                    <span className="text-gray-400">Destination:</span>{" "}
                    <span className="font-medium text-gray-900">
                      {dispatchModal.destination_name}
                    </span>
                  </p>
                )}
                {dispatchModal.weight_kg && (
                  <p>
                    <span className="text-gray-400">Weight:</span>{" "}
                    <span className="font-medium text-gray-900">
                      {dispatchModal.weight_kg}kg
                    </span>
                    {dispatchModal.number_of_pieces && (
                      <span className="ml-2 text-gray-500">
                        ({dispatchModal.number_of_pieces} pcs)
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Dispatch Service - free text with autocomplete */}
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Dispatch Service / Handler <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={dispatchService}
                  onChange={(e) => handleServiceInput(e.target.value)}
                  onFocus={() => { if (handlers.length) setShowSuggestions(true); }}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="e.g. Wells Fargo, Super Metro, Rider..."
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  autoComplete="off"
                />
                {showSuggestions && handlers.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                  >
                    {handlers.map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onMouseDown={() => selectHandler(h)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-teal-50 border-b border-gray-100 last:border-0"
                      >
                        <span className="font-medium text-gray-800">{h.service_name}</span>
                        <span className="text-gray-500"> — {h.contact_name}</span>
                        {h.contact_phone && (
                          <span className="text-gray-400 ml-1">({h.contact_phone})</span>
                        )}
                        <span className="float-right text-xs text-gray-400">
                          used {h.usage_count}×
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Handler / Driver Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Handler / Driver Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={dispatcherName}
                  onChange={(e) => setDispatcherName(e.target.value)}
                  placeholder="e.g. John Kamau"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Handler Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Handler Phone{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={dispatcherPhone}
                  onChange={(e) => setDispatcherPhone(e.target.value)}
                  placeholder="e.g. 0712 345 678"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Dispatch Cost */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Dispatch Charges (KES){" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={dispatchCost}
                  onChange={(e) => setDispatchCost(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setDispatchModal(null)}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDispatch}
                  disabled={
                    submitting ||
                    !dispatchService.trim() ||
                    !dispatcherName.trim()
                  }
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <FaTruck size={14} />
                  {submitting ? "Dispatching..." : "Confirm Dispatch"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
