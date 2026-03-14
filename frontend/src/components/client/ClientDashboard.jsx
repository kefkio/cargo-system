// src/components/client/ClientDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ShipmentLifecycle from "../admin/charts/ShipmentLifecycle"; // reuse
import PickupRequestsPanel from "../admin/PickupRequestsPanel";
import { FaBox, FaTruck, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch profile and shipments
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    const token = localStorage.getItem("access");
    if (!token) return navigate("/login");

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/accounts/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    const fetchShipments = async () => {
      try {
        const res = await fetch(`${API_URL}/shipments/client/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setShipments(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    fetchShipments();
  }, [navigate]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading dashboard...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-inter text-gray-800">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Welcome, {profile?.first_name || profile?.username}
        </h1>
        <button
          onClick={() => {
            localStorage.removeItem("access");
            localStorage.removeItem("refresh");
            navigate("/");
          }}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </header>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow flex items-center gap-3">
          <FaBox className="text-blue-500 text-2xl" />
          <div>
            <p>Total Shipments</p>
            <p className="font-bold">{shipments.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow flex items-center gap-3">
          <FaTruck className="text-yellow-500 text-2xl" />
          <div>
            <p>Pending</p>
            <p className="font-bold">
              {shipments.filter((s) => s.status !== "Delivered").length}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow flex items-center gap-3">
          <FaCheckCircle className="text-green-500 text-2xl" />
          <div>
            <p>Delivered</p>
            <p className="font-bold">
              {shipments.filter((s) => s.status === "Delivered").length}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow flex items-center gap-3">
          <FaTimesCircle className="text-red-500 text-2xl" />
          <div>
            <p>Delayed</p>
            <p className="font-bold">
              {shipments.filter((s) => s.status === "Delayed").length}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Shipments */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Recent Shipments</h2>
        {shipments.slice(0, 5).map((s) => (
          <div key={s.id} className="bg-white p-4 rounded shadow mb-2">
            <p>
              <span className="font-bold">Tracking:</span> {s.tracking_number}
            </p>
            <p>
              <span className="font-bold">Status:</span> {s.status}
            </p>
            <ShipmentLifecycle status={s.status} timestamps={s.timestamps} />
          </div>
        ))}
      </section>

      {/* Pickup Requests */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Pickup Requests</h2>
        <PickupRequestsPanel clientView />
      </section>
    </div>
  );
}