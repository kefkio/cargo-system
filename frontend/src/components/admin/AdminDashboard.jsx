import React, { useEffect, useState } from "react";
import { FaUsers, FaBox, FaDollarSign, FaChartLine, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ShipmentLifecycle from "./charts/ShipmentLifecycle";
import PickupRequestsPanel from "./PickupRequestsPanel";
import InvoicesPanel from "../shared/InvoicesPanel";
import QRCode from "react-qr-code";
import ShipmentSticker from "../shipment/ShipmentSticker";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [pickupRequests, setPickupRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(null); // { shipmentId, trackingNumber }
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [stickerShipment, setStickerShipment] = useState(null);
  const qrValue = "https://firstpointcargo.com";
  const token = localStorage.getItem("access");

  const API_URL = import.meta.env.VITE_API_URL;
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return navigate("/login");

    async function fetchData() {
      try {
        const profileRes = await fetch(`${API_URL}/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!profileRes.ok) throw new Error("Failed to fetch profile");
        const profile = await profileRes.json();
        setUser(profile);

        if (profile.role !== "CARGOADMIN") {
          navigate("/login");
          return;
        }

        const [statsRes, shipmentsRes, pickupRes] = await Promise.all([
          fetch(`${BASE_URL}/shipments/admin/stats/`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${BASE_URL}/shipments/admin/recent-shipments/`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${BASE_URL}/shipments/admin/pickup-requests/`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (statsRes.ok) {
          setStats(await statsRes.json());
        }

        if (shipmentsRes.ok) {
          setShipments(await shipmentsRes.json());
        }

        if (pickupRes.ok) {
          const pickupData = await pickupRes.json();
          setPickupRequests(Array.isArray(pickupData) ? pickupData : pickupData.results || []);
        }
      } catch (err) {
        console.error("Admin data fetch failed:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [navigate, API_URL]);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  async function handleCancelShipment() {
    if (!cancelModal || !cancelReason.trim()) return;
    setCancelLoading(true);
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`${BASE_URL}/shipments/admin/cancel-shipment/${cancelModal.shipmentId}/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to request cancellation");
        return;
      }
      alert("Cancellation request submitted. Awaiting SuperAdmin approval.");
      setCancelModal(null);
      setCancelReason("");
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setCancelLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold text-primary">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          {user && <span className="font-medium text-gray-700">Hello, {user.first_name || user.username}</span>}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </nav>

      {/* Dashboard content */}
      <main className="flex-1 p-6 space-y-6">
        {loading ? (
          <div className="text-center py-20">Loading admin dashboard...</div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white shadow p-4 rounded flex items-center gap-3">
                <FaUsers className="text-2xl text-primary" />
                <div>
                  <p className="text-sm text-gray-500">Clients</p>
                  <p className="text-lg font-bold">{stats?.totalClients ?? "—"}</p>
                </div>
              </div>
              <div className="bg-white shadow p-4 rounded flex items-center gap-3">
                <FaBox className="text-2xl text-primary" />
                <div>
                  <p className="text-sm text-gray-500">Shipments</p>
                  <p className="text-lg font-bold">{stats?.totalShipments ?? shipments.length}</p>
                </div>
              </div>
              <div className="bg-white shadow p-4 rounded flex items-center gap-3">
                <FaDollarSign className="text-2xl text-primary" />
                <div>
                  <p className="text-sm text-gray-500">Total Weight (kg)</p>
                  <p className="text-lg font-bold">{stats?.totalRevenue ?? "—"}</p>
                </div>
              </div>
              <div className="bg-white shadow p-4 rounded flex items-center gap-3">
                <FaChartLine className="text-2xl text-primary" />
                <div>
                  <p className="text-sm text-gray-500">Active Shipments</p>
                  <p className="text-lg font-bold">{stats?.activeShipments ?? "—"}</p>
                </div>
              </div>
            </div>

            {/* Recent Shipments */}
            <section className="bg-white shadow p-6 rounded">
              <h2 className="text-lg font-semibold mb-4">Recent Shipments</h2>
              {shipments.length === 0 ? (
                <p className="text-gray-500">No recent shipments found.</p>
              ) : (
                shipments.map((s) => {
                  const ts = {
                    "Pickup Requested": s.pickup_requested_at,
                    "Shipment Created": s.shipment_created_at,
                    "Processing at Origin": s.processing_at_origin_at,
                    "In Transit": s.in_transit_at,
                    "Arrived Nairobi Hub": s.arrived_nairobi_at,
                    "Dispatched": s.dispatched_at,
                    "Delivered": s.delivered_at,
                  };
                  const canCancel = s.status !== "Delivered" && s.status !== "Cancelled";
                  return (
                    <div key={s.id} className="mb-4 border rounded p-4">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <p className="font-semibold">Tracking ID: {s.tracking_number || s.id}</p>
                          <p>Status: {s.status}</p>
                        </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => setStickerShipment(s)}
                          className="px-3 py-1 text-xs font-medium rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                        >
                          {s.sticker_print_count > 0 ? `🖨 Reprint Sticker (${s.sticker_print_count})` : "🖨 Print Sticker"}
                        </button>
                        {canCancel && (
                          <button
                            onClick={() => setCancelModal({ shipmentId: s.id, trackingNumber: s.tracking_number || s.id })}
                            className="px-3 py-1 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-700 transition"
                          >
                            Request Cancellation
                          </button>
                        )}
                      </div>
                      </div>
                      <ShipmentLifecycle status={s.status} timestamps={ts} />
                    </div>
                  );
                })
              )}
            </section>

            {/* Pickup Requests */}
            <section className="bg-white shadow p-6 rounded">
              <h2 className="text-lg font-semibold mb-4">Pickup Requests</h2>
              <PickupRequestsPanel token={token} />
            </section>

            {/* QR Code */}
            <section className="bg-white shadow p-6 rounded flex flex-col items-center">
              <h2 className="text-lg font-semibold mb-4">Company QR Code</h2>
              <QRCode value={qrValue} size={128} />
            </section>

            {/* Invoices */}
            <section className="bg-white shadow p-6 rounded">
              <h2 className="text-lg font-semibold mb-4">Invoices</h2>
              <InvoicesPanel role="CARGOADMIN" />
            </section>
          </>
        )}
      </main>

      {cancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Request Shipment Cancellation</h3>
            <p className="text-sm text-gray-600 mb-4">
              Shipment: <strong>{cancelModal.trackingNumber}</strong>
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for cancellation</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Provide a reason..."
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => { setCancelModal(null); setCancelReason(""); }}
                className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCancelShipment}
                disabled={cancelLoading || !cancelReason.trim()}
                className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {cancelLoading ? "Submitting..." : "Submit Request"}
              </button>
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