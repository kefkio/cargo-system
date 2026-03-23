// src/components/staff/StaffDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBox,
  FaTruck,
  FaSearch,
  FaClipboardList,
  FaSignOutAlt
} from "react-icons/fa";

export default function StaffDashboard() {
  const navigate = useNavigate();

  const [pickupRequests, setPickupRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return navigate("/login");

    async function fetchPickups() {
      try {
        const res = await fetch(`${API_URL}/shipments/admin/pickup-requests/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          setPickupRequests(await res.json());
        }
      } catch (err) {
        console.error("Failed to load pickup requests", err);
      } finally {
        setLoading(false);
      }
    }

    fetchPickups();
  }, [navigate, API_URL]);

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/");
    window.location.reload();
  };

  const cards = [
    {
      title: "Create Shipment",
      icon: <FaBox size={28} />,
      description: "Register new shipment from client",
      action: () => navigate("/staff/create-shipment"),
    },
    {
      title: "Pickup Requests",
      icon: <FaTruck size={28} />,
      description: "View and schedule pickups",
      action: () => navigate("/staff/pickups"),
    },
    {
      title: "Track Shipment",
      icon: <FaSearch size={28} />,
      description: "Search and update shipment status",
      action: () => navigate("/staff/track"),
    },
    {
      title: "Dispatch Center",
      icon: <FaClipboardList size={28} />,
      description: "Manage shipments ready for dispatch",
      action: () => navigate("/staff/dispatch"),
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-8">
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

      {/* Quick operations */}
      <div className="p-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>

        <div className="bg-white p-6 rounded shadow">
          <input
            type="text"
            placeholder="Scan or enter tracking number..."
            className="w-full border p-3 rounded"
          />

          <button className="mt-4 bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark">
            Search Shipment
          </button>
        </div>
      </div>
    </div>
  );
}