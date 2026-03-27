import React, { useEffect, useState } from "react";
import { FaTruck, FaUser, FaMapMarkerAlt, FaCalendarAlt, FaSave } from "react-icons/fa";

export default function PickupRequestsPanel({ token }) {
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dispatchData, setDispatchData] = useState({}); // store temp dispatcher info
  const [saving, setSaving] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL.replace(/\/accounts\/?$/, '');

  useEffect(() => {
    const fetchPickups = async () => {
      try {
        const res = await fetch(`${API_URL}/shipments/admin/pickup-requests/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch pickup requests");
        const data = await res.json();
        setPickups(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPickups();
  }, [token, API_URL]);

  const handleInputChange = (shipmentId, field, value) => {
    setDispatchData((prev) => ({
      ...prev,
      [shipmentId]: {
        ...prev[shipmentId],
        [field]: value,
      },
    }));
  };

  const handleDispatchSave = async (shipmentId) => {
    if (!dispatchData[shipmentId]?.dispatcher_name || !dispatchData[shipmentId]?.dispatcher_service) {
      alert("Please fill in both dispatcher name and service.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/shipments/admin/update-dispatcher/${shipmentId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dispatcher_name: dispatchData[shipmentId].dispatcher_name,
          dispatcher_service: dispatchData[shipmentId].dispatcher_service,
        }),
      });
      if (!res.ok) throw new Error("Failed to save dispatcher info");
      // Update local state
      setPickups((prev) =>
        prev.map((p) =>
          p.id === shipmentId
            ? {
                ...p,
                dispatcher_name: dispatchData[shipmentId].dispatcher_name,
                dispatcher_service: dispatchData[shipmentId].dispatcher_service,
                dispatched_datetime: new Date().toISOString(),
              }
            : p
        )
      );
      alert("Dispatcher info saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Error saving dispatcher info");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading pickup requests...</p>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-6">
      <h2 className="text-xl font-bold mb-4">Pickup Requests</h2>
      {pickups.length === 0 ? (
        <p className="text-gray-600">No pickup requests at the moment.</p>
      ) : (
        <div className="space-y-4">
          {pickups.map((shipment) => (
            <div key={shipment.id} className="p-4 border rounded hover:shadow transition">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">
                    <FaUser className="inline mr-2" /> {shipment.client_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    <FaMapMarkerAlt className="inline mr-1" /> {shipment.origin} → {shipment.destination}
                  </p>
                  <p className="text-sm text-gray-600">
                    <FaCalendarAlt className="inline mr-1" /> Requested:{" "}
                    {new Date(shipment.pickup_requested_at).toLocaleString()}
                  </p>
                </div>
                <div className="ml-4">
                  {shipment.dispatcher_name ? (
                    <p className="text-green-600 text-sm">
                      <FaTruck className="inline mr-1" />
                      {shipment.dispatcher_name} ({shipment.dispatcher_service}) –{" "}
                      {new Date(shipment.dispatched_datetime).toLocaleString()}
                    </p>
                  ) : (
                    <div className="space-y-1">
                      <input
                        type="text"
                        placeholder="Dispatcher Name"
                        className="border px-2 py-1 rounded w-full text-sm"
                        value={dispatchData[shipment.id]?.dispatcher_name || ""}
                        onChange={(e) => handleInputChange(shipment.id, "dispatcher_name", e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Service (Motorcycle/Wells/Ntl)"
                        className="border px-2 py-1 rounded w-full text-sm"
                        value={dispatchData[shipment.id]?.dispatcher_service || ""}
                        onChange={(e) => handleInputChange(shipment.id, "dispatcher_service", e.target.value)}
                      />
                      <button
                        onClick={() => handleDispatchSave(shipment.id)}
                        disabled={saving}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        <FaSave className="inline mr-1" /> Save
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}