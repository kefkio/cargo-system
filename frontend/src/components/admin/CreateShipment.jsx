import React, { useState } from "react";

export default function CreateShipment() {
  const API_URL = import.meta.env.VITE_API_URL;

  const [form, setForm] = useState({
    clientEmail: "",
    clientName: "",
    clientPhone: "",
    clientNumber: "",
    origin: "",
    destination: "",
    destContactPerson: "",
    destContactPhone: "",
    destContactEmail: "",
    transportMode: "Air",
    weight: "",
    volume: "",
    packageType: "Box",
    priority: "Standard",
    description: "",
    deliveryDate: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [clientConfirmed, setClientConfirmed] = useState(false);

  // --- Live search for clients ---
  const searchClient = async (query) => {
    if (!query) return setClientSuggestions([]);
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`${API_URL}/clients/search/?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setClientSuggestions(data);
    } catch (err) {
      console.error("Client search failed", err);
    }
  };

  // --- Live search for destinations ---
  const searchDestination = async (query) => {
    if (!query) return setDestinationSuggestions([]);
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`${API_URL}/destinations/search/?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDestinationSuggestions(data);
    } catch (err) {
      console.error("Destination search failed", err);
    }
  };

  // --- Handle client selection ---
  const selectClient = (client) => {
    setForm((prev) => ({
      ...prev,
      clientEmail: client.email,
      clientName: client.name,
      clientPhone: client.phone,
      clientNumber: client.clientNumber,
    }));
    setClientConfirmed(true);
    setClientSuggestions([]);
  };

  // --- Handle destination selection ---
  const selectDestination = (dest) => {
    setForm((prev) => ({
      ...prev,
      destination: `${dest.city}, ${dest.country}`,
      destContactPerson: dest.contactPerson || "",
      destContactPhone: dest.contactPhone || "",
      destContactEmail: dest.contactEmail || "",
    }));
    setDestinationSuggestions([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (["clientEmail", "clientPhone", "clientName"].includes(name)) {
      setForm((prev) => ({ ...prev, [name]: value }));
      setClientConfirmed(false);
      searchClient(value);
    } else if (name === "destination") {
      setForm((prev) => ({ ...prev, destination: value }));
      searchDestination(value);
    } else if (name === "transportMode") {
      setForm((prev) => ({
        ...prev,
        transportMode: value,
        weight: value === "Air" ? prev.weight : "",
        volume: value === "Sea" ? prev.volume : "",
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const submitShipment = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("access");

      // 1. Check if client is confirmed
      if (!clientConfirmed) {
        // Try to find existing client
        const clientRes = await fetch(
          `${API_URL}/clients/search/?q=${form.clientEmail}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const clients = await clientRes.json();
        let client = clients.find((c) => c.email === form.clientEmail);

        // Create new client if not exists
        if (!client) {
          const createRes = await fetch(`${API_URL}/clients/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              email: form.clientEmail,
              name: form.clientName,
              phone: form.clientPhone,
            }),
          });
          if (!createRes.ok) throw new Error("Failed to create client");
          client = await createRes.json();
        }

        // Update form with client info
        setForm((prev) => ({
          ...prev,
          clientEmail: client.email,
          clientName: client.name,
          clientPhone: client.phone,
          clientNumber: client.clientNumber,
        }));
        setClientConfirmed(true);
      }

      // 2. Validate shipment fields
      if (form.transportMode === "Air" && !form.weight) {
        setError("Weight is required for Air shipment");
        setLoading(false);
        return;
      }
      if (form.transportMode === "Sea" && !form.volume) {
        setError("Volume is required for Sea shipment");
        setLoading(false);
        return;
      }
      if (!form.destContactPerson || !form.destContactPhone) {
        setError("Destination contact person and phone are required");
        setLoading(false);
        return;
      }

      // 3. Submit shipment
      const shipmentRes = await fetch(`${API_URL}/shipments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, clientNumber: form.clientNumber }),
      });

      if (!shipmentRes.ok) {
        const err = await shipmentRes.json();
        throw new Error(err.error || "Failed to create shipment");
      }

      const data = await shipmentRes.json();
      setMessage(`Shipment ${data.id} created successfully!`);

      // Reset form
      setForm({
        clientEmail: "",
        clientName: "",
        clientPhone: "",
        clientNumber: "",
        origin: "",
        destination: "",
        destContactPerson: "",
        destContactPhone: "",
        destContactEmail: "",
        transportMode: "Air",
        weight: "",
        volume: "",
        packageType: "Box",
        priority: "Standard",
        description: "",
        deliveryDate: "",
      });
      setClientConfirmed(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow rounded p-6">
        <h1 className="text-3xl font-bold mb-6">Create New Shipment</h1>

        {message && <p className="text-green-600 mb-4">{message}</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={submitShipment} className="space-y-4">
          {/* Client Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            <input
              name="clientEmail"
              type="email"
              value={form.clientEmail}
              onChange={handleChange}
              placeholder="Client Email"
              className="border p-2 rounded w-full"
              required
            />
            <input
              name="clientName"
              type="text"
              value={form.clientName}
              onChange={handleChange}
              placeholder="Client Name"
              className="border p-2 rounded w-full"
              required
            />
            <input
              name="clientPhone"
              type="tel"
              value={form.clientPhone}
              onChange={handleChange}
              placeholder="Client Phone"
              className="border p-2 rounded w-full"
              required
            />

            {/* Client Suggestions */}
            {clientSuggestions.length > 0 && (
              <ul className="absolute top-16 left-0 bg-white border w-full z-10 max-h-60 overflow-y-auto shadow">
                {clientSuggestions.map((c) => (
                  <li
                    key={c.clientNumber}
                    onClick={() => selectClient(c)}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {c.name} - {c.email} - {c.phone}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Shipment Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
            <input
              name="origin"
              value={form.origin}
              onChange={handleChange}
              placeholder="Origin"
              className="border p-2 rounded w-full"
              required
            />
            <input
              name="destination"
              value={form.destination}
              onChange={handleChange}
              placeholder="Destination (City, Country)"
              className="border p-2 rounded w-full"
              required
            />
            {/* Destination Suggestions */}
            {destinationSuggestions.length > 0 && (
              <ul className="absolute top-16 left-0 bg-white border w-full z-10 max-h-60 overflow-y-auto shadow">
                {destinationSuggestions.map((d) => (
                  <li
                    key={d.id}
                    onClick={() => selectDestination(d)}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {d.city}, {d.country}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="transportMode"
                  value="Air"
                  checked={form.transportMode === "Air"}
                  onChange={handleChange}
                />{" "}
                Air
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="transportMode"
                  value="Sea"
                  checked={form.transportMode === "Sea"}
                  onChange={handleChange}
                />{" "}
                Sea
              </label>
            </div>
          </div>

          {form.transportMode === "Air" && (
            <input
              type="number"
              name="weight"
              value={form.weight}
              onChange={handleChange}
              required
              placeholder="Weight (kg)"
              className="border p-2 rounded w-full"
            />
          )}
          {form.transportMode === "Sea" && (
            <input
              type="number"
              name="volume"
              value={form.volume}
              onChange={handleChange}
              required
              placeholder="Volume (m³)"
              className="border p-2 rounded w-full"
            />
          )}

          {/* Destination Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              name="destContactPerson"
              value={form.destContactPerson}
              onChange={handleChange}
              required
              placeholder="Destination Contact Person"
              className="border p-2 rounded w-full"
            />
            <input
              name="destContactPhone"
              value={form.destContactPhone}
              onChange={handleChange}
              required
              placeholder="Destination Contact Phone"
              className="border p-2 rounded w-full"
            />
            <input
              name="destContactEmail"
              value={form.destContactEmail}
              onChange={handleChange}
              placeholder="Destination Contact Email"
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select
              name="packageType"
              value={form.packageType}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option>Box</option>
              <option>Envelope</option>
              <option>Pallet</option>
              <option>Other</option>
            </select>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option>Standard</option>
              <option>Express</option>
            </select>
            <input
              type="date"
              name="deliveryDate"
              value={form.deliveryDate}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </div>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description / Notes"
            className="border p-2 rounded w-full"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-2 rounded hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Shipment"}
          </button>
        </form>
      </div>
    </div>
  );
}