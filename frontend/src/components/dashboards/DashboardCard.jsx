// src/pages/ClientDashboard.jsx
import React, { useEffect, useState } from "react";
import ClientNavbar from "../components/ClientNavbar";
import DashboardCard from "./DashboardCard";
import NextShipmentBanner from "../components/NextShipmentBanner";
import PickupRequest from "../components/PickupRequest";
import ShippingCalculator from "../components/ShippingCalculator";
import TrackShipment from "../components/TrackShipment";

export default function ClientDashboard() {
  const [profile, setProfile] = useState(null);
  const [shipments, setShipments] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("access");

    const fetchProfile = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/auth/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchShipments = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/shipments/client/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch shipments");
        const data = await res.json();
        setShipments(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
    fetchShipments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      {/* Navbar */}
      <ClientNavbar />

      {/* Next Shipment Banner inside a card */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <DashboardCard title="Next Shipment">
          <NextShipmentBanner />
        </DashboardCard>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Greeting */}
        <header className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {profile?.username || "Client"}
          </h1>
          <p className="text-gray-600 mt-1">Here’s a summary of your shipments</p>
        </header>

        {/* Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard title="Total Shipments">
            <p className="text-2xl font-bold">{shipments.length}</p>
          </DashboardCard>
          <DashboardCard title="Pending Shipments">
            <p className="text-2xl font-bold">
              {shipments.filter((s) => s.status === "pending").length}
            </p>
          </DashboardCard>
          <DashboardCard title="Delivered Shipments">
            <p className="text-2xl font-bold">
              {shipments.filter((s) => s.status === "delivered").length}
            </p>
          </DashboardCard>
        </section>

        {/* Pickup Request & Shipping Calculator */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard title="Request a Pickup">
            <PickupRequest />
          </DashboardCard>
          <DashboardCard title="Shipping Calculator">
            <ShippingCalculator />
          </DashboardCard>
        </section>

        {/* Track Shipment */}
        <DashboardCard title="Track a Shipment">
          <TrackShipment />
        </DashboardCard>

        {/* Recent Shipments Table */}
        <DashboardCard title="Recent Shipments">
          {shipments.length === 0 ? (
            <p>No shipments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-4 py-2 text-left">Tracking #</th>
                    <th className="border px-4 py-2 text-left">Origin</th>
                    <th className="border px-4 py-2 text-left">Destination</th>
                    <th className="border px-4 py-2 text-left">Status</th>
                    <th className="border px-4 py-2 text-left">Date Created</th>
                  </tr>
                </thead>
                <tbody>
                  {shipments.map((s) => (
                    <tr key={s.id}>
                      <td className="border px-4 py-2">{s.tracking_number}</td>
                      <td className="border px-4 py-2">{s.origin}</td>
                      <td className="border px-4 py-2">{s.destination}</td>
                      <td className="border px-4 py-2 capitalize">{s.status}</td>
                      <td className="border px-4 py-2">
                        {new Date(s.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DashboardCard>
      </div>
    </div>
  );
}