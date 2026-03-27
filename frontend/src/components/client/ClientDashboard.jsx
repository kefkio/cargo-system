// src/components/client/ClientDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ShipmentLifecycle from "../admin/charts/ShipmentLifecycle";
import PickupRequestsPanel from "../admin/PickupRequestsPanel";
import InvoicesPanel from "../shared/InvoicesPanel";
import { FaBox, FaTruck, FaCheckCircle, FaTimesCircle, FaMoneyCheckAlt } from "react-icons/fa";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;
  const BASE_URL = API_URL.replace(/\/accounts\/?$/, '');

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return navigate("/login");

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/profile/`, {
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
        const res = await fetch(`${BASE_URL}/shipments/client/`, {
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

      {/* Pending Delivery (Paid) Banner */}
      {shipments.filter((s) => s.proforma_paid && s.status !== "Delivered" && s.status !== "Cancelled").length > 0 && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4 mb-6 flex items-center gap-3">
          <FaMoneyCheckAlt className="text-emerald-600 text-2xl flex-shrink-0" />
          <div>
            <p className="font-semibold text-emerald-800">
              {shipments.filter((s) => s.proforma_paid && s.status !== "Delivered" && s.status !== "Cancelled").length} shipment(s) paid &amp; pending delivery
            </p>
            <p className="text-sm text-emerald-600">Payment confirmed — your cargo is being processed for delivery.</p>
          </div>
        </div>
      )}

      {/* Recent Shipments */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Recent Shipments</h2>
        {shipments.slice(0, 5).map((s) => {
          const ts = {
            "Pickup Requested": s.pickup_requested_at,
            "Shipment Created": s.shipment_created_at,
            "Processing at Origin": s.processing_at_origin_at,
            "In Transit": s.in_transit_at,
            "Arrived Nairobi Hub": s.arrived_nairobi_at,
            "Dispatched": s.dispatched_at,
            "Delivered": s.delivered_at,
          };
          return (
            <div key={s.id} className="bg-white p-4 rounded shadow mb-2">
              {s.proforma_paid && s.status !== "Delivered" && s.status !== "Cancelled" && (
                <div className="bg-emerald-50 border border-emerald-200 rounded px-3 py-2 mb-3 flex items-center gap-2 text-sm">
                  <FaMoneyCheckAlt className="text-emerald-600" />
                  <span className="text-emerald-800 font-medium">Payment complete — pending delivery</span>
                </div>
              )}
              <p>
                <span className="font-bold">Tracking:</span> {s.tracking_number}
              </p>
              <p>
                <span className="font-bold">Status:</span> {s.status}
              </p>
              <ShipmentLifecycle status={s.status} timestamps={ts} />
            </div>
          );
        })}
      </section>

      {/* My Invoices */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">My Invoices</h2>
        <div className="bg-white p-4 rounded shadow">
          <InvoicesPanel role="CLIENT" />
        </div>
      </section>

      {/* Pickup Requests */}
      <section>
        <h2 className="text-xl font-semibold mb-2">Pickup Requests</h2>
        <PickupRequestsPanel clientView />
      </section>
    </div>
  );
}