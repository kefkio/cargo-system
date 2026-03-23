import React, { useEffect, useState } from "react";

export default function WarehouseManagement() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) {
      setError("Not authenticated");
      setLoading(false);
      return;
    }

    async function fetchWarehouses() {
      try {
        const res = await fetch(`${API_URL}/warehouses/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to load warehouses");
        setWarehouses(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchWarehouses();
  }, [API_URL]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white shadow rounded p-6">
        <h1 className="text-2xl font-bold mb-4">Warehouse Management</h1>

        {loading && <p>Loading warehouses...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="space-y-4">
            {warehouses.length === 0 && <p>No warehouses configured yet.</p>}
            {warehouses.map((wh) => (
              <div key={wh.id} className="border p-4 rounded">
                <p className="font-semibold">{wh.name}</p>
                <p>{wh.address}</p>
                <p className="text-sm text-gray-500">Capacity: {wh.capacity}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}