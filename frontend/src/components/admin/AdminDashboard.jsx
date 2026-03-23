import React, { useEffect, useState } from "react";
import { FaUsers, FaBox, FaDollarSign, FaChartLine, FaSignOutAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Correct imports relative to AdminDashboard.jsx
import ShipmentLifecycle from "./charts/ShipmentLifecycle";
import PickupRequestsPanel from "./PickupRequestsPanel";
import QRCode from "react-qr-code";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [pickupRequests, setPickupRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const qrValue = "https://firstpointcargo.com";

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return navigate("/login");

    async function fetchData() {
      try {
        const profileRes = await fetch(`${API_URL}/accounts/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!profileRes.ok) throw new Error("Failed to fetch profile");
        const profile = await profileRes.json();
        setUser(profile);

        const [statsRes, shipmentsRes, pickupRes] = await Promise.all([
          fetch(`${API_URL}/shipments/admin/stats/`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/shipments/admin/recent-shipments/`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/shipments/admin/pickup-requests/`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (statsRes.ok) {
          setStats(await statsRes.json());
        }

        if (shipmentsRes.ok) {
          setShipments(await shipmentsRes.json());
        }

        if (pickupRes.ok) {
          setPickupRequests(await pickupRes.json());
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
                shipments.map((s) => (
                  <div key={s.id} className="mb-4 border rounded p-4">
                    <p className="font-semibold">Tracking ID: {s.tracking_number || s.id}</p>
                    <p>Status: {s.status}</p>
                    <ShipmentLifecycle status={s.status} timestamps={s.timestamps || {}} />
                  </div>
                ))
              )}
            </section>

            {/* Pickup Requests */}
            <section className="bg-white shadow p-6 rounded">
              <h2 className="text-lg font-semibold mb-4">Pickup Requests</h2>
              <PickupRequestsPanel token={localStorage.getItem("access")} />
            </section>
          </>
        )}


        {/* Shipments */}
        <section className="bg-white shadow p-6 rounded">
          <h2 className="text-lg font-semibold mb-4">Shipment Lifecycle</h2>
          {shipments.map((s) => (
            <ShipmentLifecycle key={s.id} status={s.status} timestamps={s.timestamps} />
          ))}
        </section>

        {/* Pickup Requests */}
        <section className="bg-white shadow p-6 rounded">
          <h2 className="text-lg font-semibold mb-4">Pickup Requests</h2>
          <PickupRequestsPanel requests={pickupRequests} />
        </section>

        {/* QR Code */}
        <section className="bg-white shadow p-6 rounded flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4">Company QR Code</h2>
          <QRCode value={qrValue} size={128} />
        </section>
      </main>
    </div>
  );
}