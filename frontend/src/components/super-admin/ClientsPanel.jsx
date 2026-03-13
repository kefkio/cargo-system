// src/components/super-admin/ClientsPanel.jsx
import React, { useEffect, useState } from "react";

export default function ClientsPanel() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    async function fetchClients() {
      try {
        const token = localStorage.getItem("access");
        const res = await fetch(`${API_URL}/clients/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch clients");

        const data = await res.json();
        setClients(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
  }, []);

  if (loading) return <p>Loading clients...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Clients Management</h2>
      <table className="w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Email</th>
            <th className="px-4 py-2 border">Phone</th>
            <th className="px-4 py-2 border">Last Shipment</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td className="px-4 py-2 border">{client.name}</td>
              <td className="px-4 py-2 border">{client.email}</td>
              <td className="px-4 py-2 border">{client.phone}</td>
              <td className="px-4 py-2 border">{client.lastShipment || "N/A"}</td>
              <td className="px-4 py-2 border">
                <button className="text-blue-600 hover:underline">View</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}