import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaSearch,
  FaSpinner,
  FaPlane,
  FaShip,
  FaTruck,
  FaCheckCircle,
  FaCircle,
  FaRegCircle,
  FaBoxOpen,
  FaCalendarAlt,
  FaWeightHanging,
  FaMapMarkerAlt,
  FaArrowRight,
  FaArrowLeft,
  FaTimesCircle,
} from "react-icons/fa";

const STATUS_ORDER = [
  "Pickup Requested",
  "Shipment Created",
  "Processing at Origin",
  "In Transit",
  "Arrived Nairobi Hub",
  "Dispatched",
  "Delivered",
];

const STATUS_ICONS = {
  "Pickup Requested": "📦",
  "Shipment Created": "📋",
  "Processing at Origin": "⚙️",
  "In Transit": "✈️",
  "Arrived Nairobi Hub": "🏢",
  "Dispatched": "🚚",
  "Delivered": "✅",
};

export default function TrackShipment({ embedded = false }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState(
    searchParams.get("tn") || ""
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const BASE_URL = API_URL.replace(/\/accounts\/?$/, "");

  const handleTrack = async (e) => {
    if (e) e.preventDefault();
    const tn = trackingNumber.trim();
    if (!tn) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const headers = {};
      const token = localStorage.getItem("access");
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${BASE_URL}/shipments/track/${encodeURIComponent(tn)}/`, { headers });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "We couldn't retrieve any tracking information. Please verify your tracking number and try again.");
        return;
      }
      setResult(data);

      // Update URL if on dedicated track page (not embedded)
      if (!embedded) {
        navigate(`/track?tn=${encodeURIComponent(tn)}`, { replace: true });
      }
    } catch {
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if tn query param is present on mount
  React.useEffect(() => {
    const tn = searchParams.get("tn");
    if (tn && !result && !loading) {
      setTrackingNumber(tn);
      handleTrack();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentIdx = result
    ? STATUS_ORDER.indexOf(result.status)
    : -1;

  const isCancelled = result?.status === "Cancelled";

  const fmtDate = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={embedded ? "" : "min-h-screen bg-gray-50"}>
      {/* ── Search Bar ── */}
      <div
        className={
          embedded
            ? ""
            : "bg-[#0B3D91] text-white py-12 px-4"
        }
      >
        <div className={embedded ? "" : "max-w-2xl mx-auto text-center"}>
          {!embedded && (
            <>
              <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-blue-200 hover:text-white text-sm font-medium mb-4 transition group"
              >
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" size={14} />
                Back to Home
              </button>
              <h1 className="text-3xl font-bold mb-2">Track Your Parcel</h1>
              <p className="text-blue-200 text-sm mb-6">
                Enter your FPC tracking number to see real-time shipment status
              </p>
            </>
          )}

          <form
            onSubmit={handleTrack}
            className={`flex items-center gap-2 ${
              embedded
                ? "bg-white rounded-lg shadow-sm border border-gray-200 p-1"
                : "bg-white/10 backdrop-blur rounded-xl p-2"
            }`}
          >
            <div className="relative flex-1">
              <FaSearch
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                  embedded ? "text-gray-400" : "text-blue-200"
                }`}
                size={14}
              />
              <input
                type="text"
                placeholder="e.g. FPC-NY-20260315-1234"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 rounded-lg text-sm focus:outline-none ${
                  embedded
                    ? "bg-white text-gray-800 placeholder-gray-400"
                    : "bg-transparent text-white placeholder-blue-200 focus:bg-white/10"
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !trackingNumber.trim()}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50 ${
                embedded
                  ? "bg-[#0B3D91] text-white hover:bg-[#092e6e]"
                  : "bg-white text-[#0B3D91] hover:bg-blue-50"
              }`}
            >
              {loading ? (
                <FaSpinner className="animate-spin" size={14} />
              ) : (
                <FaSearch size={14} />
              )}
              Track
            </button>
          </form>
        </div>
      </div>

      {/* ── Results Area ── */}
      <div className={embedded ? "mt-4" : "max-w-3xl mx-auto px-4 py-8"}>
        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
            <FaTimesCircle className="text-red-400 flex-shrink-0" size={18} />
            <div>
              <p className="font-semibold">Tracking Unavailable</p>
              <p className="text-red-600 text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-5">
            {/* Status Header Card */}
            <div
              className={`rounded-xl border p-5 ${
                isCancelled
                  ? "bg-red-50 border-red-200"
                  : result.status === "Delivered"
                  ? "bg-green-50 border-green-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                    Tracking Number
                  </p>
                  <p className="text-xl font-bold text-gray-900 font-mono mt-0.5">
                    {result.tracking_number}
                  </p>
                </div>
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
                    isCancelled
                      ? "bg-red-100 text-red-700"
                      : result.status === "Delivered"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-[#0B3D91]"
                  }`}
                >
                  {isCancelled ? (
                    <FaTimesCircle />
                  ) : result.status === "Delivered" ? (
                    <FaCheckCircle />
                  ) : (
                    <FaCircle className="text-xs animate-pulse" />
                  )}
                  {result.status}
                </div>
              </div>

              {/* Quick Info Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-200/60">
                {result.origin && (
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-gray-400" size={12} />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase">Origin</p>
                      <p className="text-xs font-semibold text-gray-700">
                        {result.origin}
                      </p>
                    </div>
                  </div>
                )}
                {result.destination && (
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-[#0B3D91]" size={12} />
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase">
                        Destination
                      </p>
                      <p className="text-xs font-semibold text-gray-700">
                        {result.destination}
                      </p>
                    </div>
                  </div>
                )}
                {result.transport_mode && (
                  <div className="flex items-center gap-2">
                    {result.transport_mode === "Air" ? (
                      <FaPlane className="text-blue-500" size={12} />
                    ) : (
                      <FaShip className="text-teal-500" size={12} />
                    )}
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase">Mode</p>
                      <p className="text-xs font-semibold text-gray-700">
                        {result.transport_mode} Freight
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            {!isCancelled && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FaTruck className="text-[#0B3D91]" size={14} /> Shipment
                  Timeline
                </h3>

                {/* Progress bar */}
                <div className="relative mb-6">
                  <div className="flex items-center justify-between mb-2">
                    {STATUS_ORDER.map((s, i) => {
                      const step = result.timeline.find((t) => t.status === s);
                      const done = step?.completed;
                      const isCurrent = i === currentIdx;
                      return (
                        <div
                          key={s}
                          className="flex flex-col items-center flex-1"
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                              done
                                ? "bg-green-500 text-white"
                                : isCurrent
                                ? "bg-[#0B3D91] text-white ring-4 ring-blue-200"
                                : "bg-gray-200 text-gray-400"
                            }`}
                          >
                            {done ? "✓" : i + 1}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="h-1.5 bg-gray-200 rounded-full mx-6">
                    <div
                      className="h-1.5 bg-green-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          currentIdx >= 0
                            ? ((currentIdx + 1) / STATUS_ORDER.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 mx-0">
                    {STATUS_ORDER.map((s) => (
                      <span
                        key={s}
                        className="text-[8px] sm:text-[9px] text-gray-400 text-center flex-1 leading-tight"
                      >
                        {s.replace("Arrived Nairobi Hub", "Arrived NBI")}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Detailed timeline */}
                <div className="space-y-0 ml-3 border-l-2 border-gray-200">
                  {result.timeline.map((step, i) => {
                    const done = step.completed;
                    const isCurrent =
                      STATUS_ORDER.indexOf(step.status) === currentIdx;

                    return (
                      <div key={step.status} className="relative pl-6 pb-5">
                        {/* Dot */}
                        <div
                          className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full border-2 ${
                            done
                              ? "bg-green-500 border-green-500"
                              : isCurrent
                              ? "bg-[#0B3D91] border-[#0B3D91] ring-4 ring-blue-100"
                              : "bg-white border-gray-300"
                          }`}
                        />

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{STATUS_ICONS[step.status]}</span>
                            <span
                              className={`text-sm font-medium ${
                                done || isCurrent
                                  ? "text-gray-900"
                                  : "text-gray-400"
                              }`}
                            >
                              {step.status}
                            </span>
                            {isCurrent && !done && (
                              <span className="text-[10px] bg-blue-100 text-[#0B3D91] px-2 py-0.5 rounded-full font-semibold">
                                CURRENT
                              </span>
                            )}
                          </div>
                          {step.timestamp && (
                            <span className="text-xs text-gray-500">
                              {fmtDate(step.timestamp)}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cancelled notice */}
            {isCancelled && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
                <FaTimesCircle className="text-red-400 mx-auto mb-2" size={32} />
                <p className="text-red-700 font-semibold">
                  This shipment has been cancelled.
                </p>
                <p className="text-red-500 text-sm mt-1">
                  Please contact support if you have questions.
                </p>
              </div>
            )}

            {/* Shipment Details — only shown to authenticated owner/staff */}
            {(result.cargo_type || result.priority || result.weight_kg || result.expected_delivery_date || result.dispatcher_name) && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FaBoxOpen className="text-[#0B3D91]" size={14} /> Shipment Details
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                {result.cargo_type && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Cargo Type</p>
                    <p className="font-medium text-gray-800">{result.cargo_type}</p>
                  </div>
                )}
                {result.weight_kg && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Weight</p>
                    <p className="font-medium text-gray-800">{result.weight_kg} kg</p>
                  </div>
                )}
                {result.priority && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Priority</p>
                    <p className="font-medium text-gray-800">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                          result.priority === "Express"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {result.priority}
                      </span>
                    </p>
                  </div>
                )}
                {result.expected_delivery_date && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase">
                      Expected Delivery
                    </p>
                    <p className="font-medium text-gray-800 flex items-center gap-1">
                      <FaCalendarAlt className="text-gray-400" size={11} />
                      {new Date(result.expected_delivery_date).toLocaleDateString(
                        "en-GB",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}
                    </p>
                  </div>
                )}
                {result.intake_date && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Created</p>
                    <p className="font-medium text-gray-800">
                      {fmtDate(result.intake_date)}
                    </p>
                  </div>
                )}
                {result.dispatcher_service && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase">
                      Dispatcher Service
                    </p>
                    <p className="font-medium text-gray-800">
                      {result.dispatcher_service}
                    </p>
                  </div>
                )}
                {result.dispatcher_name && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase">
                      Dispatcher
                    </p>
                    <p className="font-medium text-gray-800">
                      {result.dispatcher_name}
                    </p>
                  </div>
                )}
              </div>
            </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!result && !error && !loading && !embedded && (
          <div className="text-center py-16">
            <FaSearch className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 text-lg font-medium">
              Enter a tracking number to get started
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Your tracking number starts with <span className="font-mono font-semibold">FPC-</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}