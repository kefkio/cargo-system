import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import ShipmentSticker from "../shipment/ShipmentSticker";

export default function CreateShipment() {
  const navigate = useNavigate();
  const location = useLocation();
  const dashboardPath = location.pathname.startsWith("/staff")
    ? "/dashboard/staff"
    : "/dashboard/admin";
  const API_URL = import.meta.env.VITE_API_URL.replace(/\/accounts\/?$/, '');

  const pickupRequest = location.state?.pickupRequest || null;

  const [form, setForm] = useState({
    clientEmail: pickupRequest?.client_email || "",
    clientName: pickupRequest?.client_name || "",
    clientPhone: pickupRequest?.client_phone || "",
    clientNumber: "",
    origin: pickupRequest?.origin_name || "",
    destination: pickupRequest?.destination_name || "",
    destContactPerson: pickupRequest?.dest_contact_person || "",
    destContactPhone: pickupRequest?.dest_contact_phone || "",
    destContactEmail: pickupRequest?.dest_contact_email || "",
    destAddressLine: pickupRequest?.dest_address_line || "",
    destArea: pickupRequest?.dest_area || "",
    destCity: pickupRequest?.dest_city || "",
    destPostalCode: pickupRequest?.dest_postal_code || "",
    transportMode: pickupRequest?.transport_mode || "Air",
    weight: pickupRequest?.weight_kg ? String(pickupRequest.weight_kg) : "",
    volume: pickupRequest?.volume_cbm ? String(pickupRequest.volume_cbm) : "",
    packageType: pickupRequest?.cargo_type || "Box",
    priority: pickupRequest?.priority || "Standard",
    description: pickupRequest?.handling_instructions || "",
    deliveryDate: pickupRequest?.expected_delivery_date || "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [clientConfirmed, setClientConfirmed] = useState(!!pickupRequest?.client_email);
  const [currentStep, setCurrentStep] = useState(0);
  const [createdShipment, setCreatedShipment] = useState(null);
  const [showSticker, setShowSticker] = useState(false);

  const steps = ["Client", "Route", "Cargo", "Contact", "Review"];

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const searchClient = async (query) => {
    if (!query) return setClientSuggestions([]);
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`${API_URL}/shipments/clients/search/?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setClientSuggestions(data);
    } catch (err) {
      console.error("Client search failed", err);
    }
  };

  const searchDestination = async (query) => {
    if (!query) return setDestinationSuggestions([]);
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`${API_URL}/shipments/warehouses/search/?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDestinationSuggestions(data);
    } catch (err) {
      console.error("Destination search failed", err);
    }
  };

  const searchOrigin = async (query) => {
    if (!query) return setOriginSuggestions([]);
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`${API_URL}/shipments/warehouses/search/?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOriginSuggestions(data);
    } catch (err) {
      console.error("Origin search failed", err);
    }
  };

  const selectClient = (client) => {
    setForm((prev) => ({
      ...prev,
      clientEmail: client.email,
      clientName: client.name,
      clientPhone: client.phone || "",
      clientNumber: client.id,
    }));
    setClientConfirmed(true);
    setClientSuggestions([]);
  };

  const selectDestination = (dest) => {
    setForm((prev) => ({
      ...prev,
      destination: dest.name || dest.code,
    }));
    setDestinationSuggestions([]);
  };

  const selectOrigin = (warehouse) => {
    setForm((prev) => ({
      ...prev,
      origin: warehouse.name || warehouse.code,
    }));
    setOriginSuggestions([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["clientEmail", "clientName"].includes(name)) {
      setForm((prev) => ({ ...prev, [name]: value }));
      setClientConfirmed(false);
      searchClient(value);
    } else if (name === "destination") {
      setForm((prev) => ({ ...prev, destination: value }));
      searchDestination(value);
    } else if (name === "origin") {
      setForm((prev) => ({ ...prev, origin: value }));
      searchOrigin(value);
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
      if (!validateEmail(form.clientEmail)) { setError("Enter a valid client email address"); setLoading(false); return; }
      if (form.destContactEmail && !validateEmail(form.destContactEmail)) { setError("Enter a valid destination contact email address"); setLoading(false); return; }
      if (form.transportMode === "Air" && !form.weight) { setError("Weight is required for Air shipment"); setLoading(false); return; }
      if (form.transportMode === "Sea" && !form.volume) { setError("Volume is required for Sea shipment"); setLoading(false); return; }
      if (!form.destContactPerson || !form.destContactPhone) { setError("Destination contact person and phone are required"); setLoading(false); return; }

      // If coming from a pickup request, update the existing cargo instead of creating new
      const isReceiving = !!pickupRequest?.id;
      const url = isReceiving
        ? `${API_URL}/shipments/admin/receive-shipment/${pickupRequest.id}/`
        : `${API_URL}/shipments/create/`;
      const method = isReceiving ? "PATCH" : "POST";

      const shipmentRes = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      if (!shipmentRes.ok) { const err = await shipmentRes.json(); throw new Error(err.error ? JSON.stringify(err.error) : "Failed to create shipment"); }
      const data = await shipmentRes.json();
      setMessage(`Shipment ${isReceiving ? "received" : "created"} successfully! Tracking: ${data.tracking_number}`);
      setCreatedShipment(data);
      setShowSticker(true);
      setForm({ clientEmail: "", clientName: "", clientPhone: "", clientNumber: "", origin: "", destination: "", destContactPerson: "", destContactPhone: "", destContactEmail: "", destAddressLine: "", destArea: "", destCity: "", destPostalCode: "", transportMode: "Air", weight: "", volume: "", packageType: "Box", priority: "Standard", description: "", deliveryDate: "" });
      setClientConfirmed(false);
      setCurrentStep(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `
    w-full bg-white border border-gray-300 rounded-lg px-4 py-3 
    text-gray-900 placeholder-gray-500 text-sm
    focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20
    transition-all duration-200
  `;

  const labelClass = "block text-xs font-semibold text-gray-700 uppercase tracking-widest mb-2";

  const sectionClass = "bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-sm";

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04] create-shipment-grid-light"
      />

      <div className="relative max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white text-base font-black">📦</span>
              </div>
              <span className="text-xs font-mono text-blue-600 uppercase tracking-widest">Cargo System</span>
            </div>
            <Link
              to={dashboardPath}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
            >
              ← Back to Dashboard
            </Link>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-gray-900">
            New Shipment
          </h1>
          <p className="text-gray-600 mt-1 text-sm">Fill in the details below to create a new cargo shipment</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          {steps.map((step, i) => (
            <React.Fragment key={step}>
              <button
                onClick={() => setCurrentStep(i)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-bold whitespace-nowrap transition-all ${
                  i === currentStep
                    ? "bg-blue-600 text-white"
                    : i < currentStep
                    ? "bg-blue-50 text-blue-600 border border-blue-200"
                    : "bg-gray-100 text-gray-500 border border-gray-200"
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  i === currentStep ? "bg-white/20 text-white" : i < currentStep ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-500"
                }`}>
                  {i < currentStep ? "✓" : i + 1}
                </span>
                {step}
              </button>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-px min-w-4 ${i < currentStep ? "bg-blue-300" : "bg-gray-200"}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Alerts */}
        {message && (
          <div className="mb-6 flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4">
            <span className="text-green-600 text-lg mt-0.5">✓</span>
            <p className="text-green-700 text-sm font-medium">{message}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
            <span className="text-red-500 text-lg mt-0.5">⚠</span>
            <p className="text-red-600 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={submitShipment} className="space-y-5">
          {/* Section 0: Client Info */}
          <div className={sectionClass}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-xs text-blue-600 font-bold">1</span>
                <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Client Information</h2>
              </div>
              {clientConfirmed && (
                <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full font-mono">
                  ✓ Confirmed
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
              <div className="relative">
                <label className={labelClass}>Email</label>
                <input
                  name="clientEmail"
                  type="email"
                  value={form.clientEmail}
                  onChange={handleChange}
                  placeholder="client@company.com"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  name="clientName"
                  type="text"
                  value={form.clientName}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <PhoneInput
                  country={"us"}
                  value={form.clientPhone}
                  onChange={(value) => {
                    setForm((prev) => ({ ...prev, clientPhone: value }));
                    setClientConfirmed(false);
                    searchClient(value);
                  }}
                  inputProps={{ name: "clientPhone", required: true, autoComplete: "tel" }}
                  inputStyle={{ width: "100%" }}
                  containerClass="phone-input-container"
                />
              </div>

              {/* Client Suggestions */}
              {clientSuggestions.length > 0 && (
                <ul className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl z-20 max-h-52 overflow-y-auto shadow-lg shadow-gray-200/60">
                  {clientSuggestions.map((c) => (
                    <li
                      key={c.clientNumber}
                      onClick={() => selectClient(c)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-xs text-blue-600 font-bold flex-shrink-0">
                        {c.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-gray-900 font-medium">{c.name}</p>
                        <p className="text-xs text-gray-600">{c.email} · {c.phone}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Section 2: Route */}
          <div className={sectionClass}>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-xs text-blue-600 font-bold">2</span>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Route & Transport</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
              <div className="relative">
                <label className={labelClass}>Origin</label>
                <input
                  name="origin"
                  value={form.origin}
                  onChange={handleChange}
                  placeholder="Warehouse name or code"
                  className={inputClass}
                  required
                />
                {originSuggestions.length > 0 && (
                  <ul className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl z-20 max-h-52 overflow-y-auto shadow-lg shadow-gray-200/60">
                    {originSuggestions.map((w) => (
                      <li
                        key={w.id}
                        onClick={() => selectOrigin(w)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                      >
                        <span className="text-blue-600 text-sm">📍</span>
                        <div>
                          <p className="text-sm text-gray-900">{w.name || w.code}</p>
                          {w.location && <p className="text-xs text-gray-500">{w.location}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="relative">
                <label className={labelClass}>Destination</label>
                <input
                  name="destination"
                  value={form.destination}
                  onChange={handleChange}
                  placeholder="Warehouse name or code"
                  className={inputClass}
                  required
                />
                {destinationSuggestions.length > 0 && (
                  <ul className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-xl z-20 max-h-52 overflow-y-auto shadow-lg shadow-gray-200/60">
                    {destinationSuggestions.map((d) => (
                      <li
                        key={d.id}
                        onClick={() => selectDestination(d)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                      >
                        <span className="text-blue-600 text-sm">📍</span>
                        <div>
                          <p className="text-sm text-gray-900">{d.name || d.code}</p>
                          {d.location && <p className="text-xs text-gray-500">{d.location}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Transport Mode */}
            <div>
              <label className={labelClass}>Transport Mode</label>
              <div className="grid grid-cols-2 gap-3">
                {["Air", "Sea"].map((mode) => (
                  <label
                    key={mode}
                    className={`flex items-center gap-4 px-5 py-4 rounded-xl border cursor-pointer transition-all ${
                      form.transportMode === mode
                        ? "border-blue-300 bg-blue-50 text-gray-900"
                        : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="transportMode"
                      value={mode}
                      checked={form.transportMode === mode}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-2xl">{mode === "Air" ? "✈️" : "🚢"}</span>
                    <div>
                      <p className={`font-bold text-sm ${form.transportMode === mode ? "text-blue-600" : ""}`}>{mode} Freight</p>
                      <p className="text-xs text-gray-500 mt-0.5">{mode === "Air" ? "Fast delivery · Weight-based" : "Bulk cargo · Volume-based"}</p>
                    </div>
                    {form.transportMode === mode && (
                      <span className="ml-auto text-blue-600 text-sm">✓</span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            {/* Weight/Volume */}
            {form.transportMode === "Air" && (
              <div>
                <label className={labelClass}>Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  value={form.weight}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
            )}
            {form.transportMode === "Sea" && (
              <div>
                <label className={labelClass}>Volume (m³)</label>
                <input
                  type="number"
                  name="volume"
                  value={form.volume}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>
            )}
          </div>

          {/* Section 3: Cargo Details */}
          <div className={sectionClass}>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-xs text-blue-600 font-bold">3</span>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Cargo Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Package Type</label>
                <select
                  name="packageType"
                  value={form.packageType}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Box">📦 Box</option>
                  <option value="Envelope">✉️ Envelope</option>
                  <option value="Pallet">🪵 Pallet</option>
                  <option value="Other">📋 Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Priority</label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="Standard">🟢 Standard</option>
                  <option value="Express">🔴 Express</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Expected Delivery</label>
                <input
                  type="date"
                  name="deliveryDate"
                  value={form.deliveryDate}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Description / Notes</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Special handling instructions, contents description, or any relevant notes..."
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>
          </div>

          {/* Section 4: Destination Contact */}
          <div className={sectionClass}>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-xs text-blue-600 font-bold">4</span>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Destination Contact</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Contact Person</label>
                <input
                  name="destContactPerson"
                  value={form.destContactPerson}
                  onChange={handleChange}
                  required
                  placeholder="Full name"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Contact Phone</label>
                <PhoneInput
                  country={"us"}
                  value={form.destContactPhone}
                  onChange={(value) => setForm((prev) => ({ ...prev, destContactPhone: value }))}
                  inputProps={{ name: "destContactPhone", required: true, autoComplete: "tel" }}
                  inputStyle={{ width: "100%" }}
                  containerClass="phone-input-container"
                />
              </div>
              <div>
                <label className={labelClass}>Contact Email <span className="text-gray-500 normal-case font-normal tracking-normal">(optional)</span></label>
                <input
                  name="destContactEmail"
                  value={form.destContactEmail}
                  onChange={handleChange}
                  placeholder="contact@company.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Delivery Address</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Address / Locality</label>
                  <input
                    name="destAddressLine"
                    value={form.destAddressLine}
                    onChange={handleChange}
                    placeholder="e.g. House 12, Riverside Drive"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Area</label>
                  <input
                    name="destArea"
                    value={form.destArea}
                    onChange={handleChange}
                    placeholder="e.g. Westlands"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>City</label>
                  <input
                    name="destCity"
                    value={form.destCity}
                    onChange={handleChange}
                    placeholder="e.g. Nairobi"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Postal Code</label>
                  <input
                    name="destPostalCode"
                    value={form.destPostalCode}
                    onChange={handleChange}
                    placeholder="e.g. 00100"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-gray-600 font-mono">
              All required fields must be completed before submitting
            </p>
            <button
              type="submit"
              disabled={loading}
              className={`
                relative flex items-center gap-3 px-8 py-3.5 rounded-xl font-bold text-sm
                transition-all duration-200 overflow-hidden
                ${loading
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-95"
                }
              `}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <span>Create Shipment</span>
                  <span className="text-base">→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Sticker Modal — shown immediately after shipment creation */}
      {showSticker && createdShipment && (
        <ShipmentSticker
          shipment={createdShipment}
          requireConfirmation={true}
          onConfirmed={(updated) => setCreatedShipment(updated)}
          onClose={() => setShowSticker(false)}
        />
      )}
    </div>
  );
}