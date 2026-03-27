// src/components/shipment/ScanUpdate.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../auth/AuthContext";

const STATUS_ORDER = [
  "Pickup Requested",
  "Shipment Created",
  "Processing at Origin",
  "In Transit",
  "Arrived Nairobi Hub",
  "Dispatched",
  "Delivered",
];

const STATUS_LABELS = {
  "Pickup Requested": { icon: "📋", color: "bg-gray-200 text-gray-700" },
  "Shipment Created": { icon: "📦", color: "bg-blue-100 text-blue-800" },
  "Processing at Origin": { icon: "⚙️", color: "bg-yellow-100 text-yellow-800" },
  "In Transit": { icon: "✈️", color: "bg-indigo-100 text-indigo-800" },
  "Arrived Nairobi Hub": { icon: "🏢", color: "bg-purple-100 text-purple-800" },
  "Dispatched": { icon: "🚚", color: "bg-orange-100 text-orange-800" },
  "Delivered": { icon: "✅", color: "bg-green-100 text-green-800" },
  "Cancelled": { icon: "❌", color: "bg-red-100 text-red-800" },
};

export default function ScanUpdate() {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);

  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const API_URL = import.meta.env.VITE_API_URL.replace(/\/accounts\/?$/, "");
  const token = localStorage.getItem("access");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // Redirect to login, preserving the return URL
      navigate(`/login?redirect=/scan/${trackingNumber}`);
      return;
    }

    fetchShipment();
  }, [trackingNumber, user, authLoading]);

  async function fetchShipment() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_URL}/shipments/scan/${trackingNumber}/`, { headers });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load shipment");
      }
      setShipment(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdvanceStatus(newStatus) {
    if (!confirm(`Update shipment to "${newStatus}"?`)) return;
    setUpdating(true);
    setSuccessMsg("");
    try {
      const res = await fetch(`${API_URL}/shipments/scan/update/${trackingNumber}/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update");
        return;
      }
      const updated = await res.json();
      setShipment(updated);
      setSuccessMsg(`Status updated to "${newStatus}"`);
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setUpdating(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading shipment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Shipment Not Found</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <Link to="/" className="text-blue-600 text-sm hover:underline">Go to Home</Link>
        </div>
      </div>
    );
  }

  if (!shipment) return null;

  const currentIdx = STATUS_ORDER.indexOf(shipment.status);
  const nextStatus = currentIdx >= 0 && currentIdx < STATUS_ORDER.length - 1
    ? STATUS_ORDER[currentIdx + 1]
    : null;
  const isCancelled = shipment.status === "Cancelled";
  const isDelivered = shipment.status === "Delivered";
  const statusInfo = STATUS_LABELS[shipment.status] || { icon: "📦", color: "bg-gray-100 text-gray-700" };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">FPC</span>
          <span className="text-xs text-gray-400">Scan Update</span>
        </div>
        <div className="text-xs text-gray-500">
          Logged in as <strong>{user?.first_name || user?.username || "User"}</strong>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Tracking Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Tracking Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-700 text-white px-6 py-5 text-center">
            <div className="text-xs font-semibold tracking-widest opacity-60 mb-1">TRACKING</div>
            <div className="text-2xl font-bold tracking-wider">{shipment.tracking_number}</div>
          </div>

          {/* Current Status */}
          <div className="px-6 py-5 border-b">
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">{statusInfo.icon}</span>
              <div>
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Current Status</div>
                <span className={`inline-block mt-1 px-3 py-1 text-sm font-bold rounded-full ${statusInfo.color}`}>
                  {shipment.status}
                </span>
              </div>
            </div>
          </div>

          {/* Lifecycle Progress */}
          <div className="px-6 py-5 border-b">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Shipment Progress</div>
            <div className="space-y-2">
              {STATUS_ORDER.map((status, idx) => {
                const isActive = idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                const ts = shipment[TIMESTAMP_KEYS[status]];
                return (
                  <div key={status} className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isCurrent
                        ? "bg-blue-600 text-white ring-2 ring-blue-200"
                        : isActive
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 text-gray-400"
                    }`}>
                      {isActive ? "✓" : idx + 1}
                    </div>
                    <div className="flex-1">
                      <span className={`text-sm ${isCurrent ? "font-bold text-gray-900" : isActive ? "text-gray-700" : "text-gray-400"}`}>
                        {status}
                      </span>
                      {ts && (
                        <span className="text-xs text-gray-400 ml-2">
                          {new Date(ts).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shipment Details */}
          <div className="px-6 py-5 border-b">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Details</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {shipment.client_name && (
                <InfoItem label="Client" value={shipment.client_name} />
              )}
              {shipment.transport_mode && (
                <InfoItem label="Mode" value={shipment.transport_mode} />
              )}
              {shipment.weight_kg && (
                <InfoItem label="Weight" value={`${shipment.weight_kg} kg`} />
              )}
              {shipment.priority && (
                <InfoItem label="Priority" value={shipment.priority} />
              )}
              {shipment.dest_contact_person && (
                <InfoItem label="Contact" value={shipment.dest_contact_person} />
              )}
              {shipment.dest_contact_phone && (
                <InfoItem label="Phone" value={shipment.dest_contact_phone} />
              )}
            </div>
          </div>

          {/* Update Action */}
          <div className="px-6 py-5">
            {successMsg && (
              <div className="mb-4 px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 text-center">
                ✓ {successMsg}
              </div>
            )}

            {isCancelled && (
              <div className="text-center py-2">
                <span className="text-sm text-red-600 font-semibold">This shipment has been cancelled.</span>
              </div>
            )}

            {isDelivered && !isCancelled && (
              <div className="text-center py-2">
                <span className="text-sm text-green-600 font-semibold">✓ Shipment delivered successfully!</span>
              </div>
            )}

            {nextStatus && !isCancelled && (
              <button
                onClick={() => handleAdvanceStatus(nextStatus)}
                disabled={updating}
                className="w-full py-3 rounded-lg text-white font-semibold text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {updating ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Updating...
                  </span>
                ) : (
                  `Update to: ${nextStatus}`
                )}
              </button>
            )}
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

const TIMESTAMP_KEYS = {
  "Pickup Requested": "pickup_requested_at",
  "Shipment Created": "shipment_created_at",
  "Processing at Origin": "processing_at_origin_at",
  "In Transit": "in_transit_at",
  "Arrived Nairobi Hub": "arrived_nairobi_at",
  "Dispatched": "dispatched_at",
  "Delivered": "delivered_at",
};

function InfoItem({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-400">{label}</div>
      <div className="font-medium text-gray-800">{value}</div>
    </div>
  );
}
