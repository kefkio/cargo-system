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
  const [shipments] = useState(() => [
    { id: 1, status: "In Transit", timestamps: { "Pickup Requested": "2026-03-10 09:00" } },
    { id: 2, status: "Delivered", timestamps: { "Delivered": "2026-03-09 14:00" } },
  ]);
  const [pickupRequests] = useState(() => [
    { id: 1, client: "John Doe", address: "Nairobi", requestedAt: "2026-03-10 08:00" },
    { id: 2, client: "Jane Smith", address: "Mombasa", requestedAt: "2026-03-10 09:30" },
  ]);
  const [qrValue] = useState("https://firstpointcargo.com");

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch admin profile
  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return navigate("/login");

    fetch(`${API_URL}/auth/profile/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setUser)
      .catch((err) => {
        console.error("Failed to fetch profile:", err);
        navigate("/login");
      });
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
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white shadow p-4 rounded flex items-center gap-3">
            <FaUsers className="text-2xl text-primary" />
            <div>
              <p className="text-sm text-gray-500">Clients</p>
              <p className="text-lg font-bold">42</p>
            </div>
          </div>
          <div className="bg-white shadow p-4 rounded flex items-center gap-3">
            <FaBox className="text-2xl text-primary" />
            <div>
              <p className="text-sm text-gray-500">Shipments</p>
              <p className="text-lg font-bold">{shipments.length}</p>
            </div>
          </div>
          <div className="bg-white shadow p-4 rounded flex items-center gap-3">
            <FaDollarSign className="text-2xl text-primary" />
            <div>
              <p className="text-sm text-gray-500">Revenue</p>
              <p className="text-lg font-bold">$12,430</p>
            </div>
          </div>
          <div className="bg-white shadow p-4 rounded flex items-center gap-3">
            <FaChartLine className="text-2xl text-primary" />
            <div>
              <p className="text-sm text-gray-500">Performance</p>
              <p className="text-lg font-bold">85%</p>
            </div>
          </div>
        </div>

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