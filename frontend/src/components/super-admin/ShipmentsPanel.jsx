// src/components/super-admin/ShipmentsPanel.jsx
import React, { useEffect, useState } from "react";
import ShipmentLifecycle from "../admin/charts/ShipmentLifecycle";

export default function ShipmentsPanel() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    async function fetchShipments() {
      try {
        const token = localStorage.getItem("access");
        const res = await fetch(`${API_URL}/shipments/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch shipments");

        const data = await res.json();
        setShipments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchShipments();
  }, [API_URL]);

  if (loading) return <p>Loading shipments...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Shipments</h2>
      {shipments.map((shipment) => (
        <div key={shipment.id} className="mb-6 border p-4 rounded">
          <p><strong>Shipment ID:</strong> {shipment.id}</p>
          <p><strong>Client:</strong> {shipment.clientName}</p>
          <p><strong>Status:</strong> {shipment.status}</p>
          <ShipmentLifecycle status={shipment.status} timestamps={shipment.timestamps} />
        </div>
      ))}
    </div>
  );
}