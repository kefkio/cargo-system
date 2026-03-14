// src/components/shipment/GenerateAddressModal.jsx
import React, { useState, useEffect } from "react";
import { FaRegCopy, FaCheckCircle, FaWhatsapp } from "react-icons/fa";

const warehouseData = {
  "Staten Island, NY": {
    line1: "330 Tompkins Ave", line2: "Unit 3623",
    city: "Staten Island", state: "NY", zip: "10304",
    emoji: "🗽",
  },
  "Los Angeles, CA": {
    line1: "720 S Alameda St", line2: "Unit 1120",
    city: "Los Angeles", state: "CA", zip: "90021",
    emoji: "🌴",
  },
  "Chicago, IL": {
    line1: "450 N Wells St", line2: "Unit 502",
    city: "Chicago", state: "IL", zip: "60654",
    emoji: "🌆",
  },
  "Federal Way, WA": {
    line1: "1235 S 336th St", line2: "Unit 8A",
    city: "Federal Way", state: "WA", zip: "98003",
    emoji: "🌲",
  },
};

const PHONE = "7012033251";

export default function GenerateAddressModal({ isOpen, onClose, user }) {
  const [userName, setUserName] = useState(user?.name || "");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [showAddress, setShowAddress] = useState(false);
  const [copied, setCopied] = useState(false);
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => setVisible(true));
      document.body.style.overflow = "hidden";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const wh = selectedWarehouse ? warehouseData[selectedWarehouse] : null;

  const addressLines = showAddress && wh
    ? [
        { label: "Name",          value: `FirstPoint + ${userName.trim() || "........................................"}` },
        { label: "Street Line 1", value: wh.line1 },
        { label: "Street Line 2", value: wh.line2 },
        { label: "City",          value: wh.city },
        { label: "State",         value: wh.state },
        { label: "ZIP Code",      value: wh.zip },
        { label: "Country",       value: "USA" },
        { label: "Phone",         value: PHONE },
      ]
    : [];

  const rawAddressText = addressLines.map(({ label, value }) => `${label}: ${value}`).join("\n");

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleGenerate = () => {
    const newErrors = {};
    if (!userName.trim()) newErrors.userName = "Please enter your full name";
    if (!selectedWarehouse) newErrors.warehouse = "Please select a warehouse";
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) setShowAddress(true);
  };

  const handleReset = () => {
    setShowAddress(false);
    setSelectedWarehouse("");
    setUserName(user?.name || "");
    setErrors({});
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(rawAddressText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    if (!rawAddressText) return;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(rawAddressText)}`, "_blank");
  };

  const fieldClass = (name) =>
    `w-full px-4 py-3 rounded-xl border text-sm font-medium bg-white/70
     text-gray-900 placeholder-gray-400 outline-none transition-all duration-200
     focus:ring-2 focus:ring-offset-1 focus:bg-white
     ${errors[name]
       ? "border-red-400 focus:ring-red-300"
       : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-200"}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Generate your warehouse address"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ opacity: visible ? 1 : 0, transition: "opacity 0.3s ease" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        className="relative w-full max-w-md z-10 rounded-2xl overflow-hidden shadow-2xl"
        style={{
          transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
          transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
          opacity: visible ? 1 : 0,
        }}
      >
        {/* Header */}
        <div
          className="px-6 pt-7 pb-10 relative"
          style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 55%, #0ea5e9 100%)" }}
        >
          <button
            onClick={handleClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>

          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-xl">
              🏭
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight leading-tight">
                Get Your US Warehouse Address
              </h2>
              <p className="text-white/60 text-xs mt-0.5">
                Ship to our warehouse — we'll forward it to you.
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="bg-gray-50 px-6 pb-6 pt-4">
          {!showAddress ? (
            <div className="flex flex-col gap-4">
              {/* Name field */}
              <div>
                <label htmlFor="gen-name" className="block text-xs font-semibold text-gray-600 mb-1">
                  Your Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="gen-name"
                  type="text"
                  value={userName}
                  onChange={(e) => { setUserName(e.target.value); setErrors((p) => ({ ...p, userName: "" })); }}
                  placeholder="e.g. Jane Smith"
                  autoComplete="name"
                  aria-describedby={errors.userName ? "gen-name-error" : "gen-name-hint"}
                  className={fieldClass("userName")}
                />
                {errors.userName
                  ? <p id="gen-name-error" role="alert" className="text-xs text-red-500 mt-1">{errors.userName}</p>
                  : <p id="gen-name-hint" className="text-xs text-gray-400 mt-1">Appears on your label as <span className="font-medium text-gray-500">FirstPoint + Your Name</span></p>
                }
              </div>

              {/* Warehouse selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">
                  Select Warehouse <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Warehouse location">
                  {Object.entries(warehouseData).map(([name, data]) => {
                    const selected = selectedWarehouse === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => { setSelectedWarehouse(name); setErrors((p) => ({ ...p, warehouse: "" })); }}
                        aria-pressed={selected}
                        className={`flex items-start gap-2 p-3 rounded-xl border-2 text-left transition-all duration-150
                          ${selected
                            ? "border-indigo-500 bg-indigo-50 shadow-sm"
                            : "border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40"}`}
                      >
                        <span className="text-lg leading-none mt-0.5">{data.emoji}</span>
                        <div className="flex-1">
                          <p className={`text-xs font-bold leading-tight ${selected ? "text-indigo-700" : "text-gray-800"}`}>
                            {data.city}
                          </p>
                          <p className="text-xs text-gray-400">{data.state}</p>
                        </div>
                        {selected && (
                          <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                              <path d="M1.5 4l2 2 3-3" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {errors.warehouse && (
                  <p role="alert" className="text-xs text-red-500 mt-1">{errors.warehouse}</p>
                )}
              </div>

              <button
                onClick={handleGenerate}
                className="w-full py-3 rounded-xl text-sm font-bold text-white active:scale-95 transition-all duration-150"
                style={{ background: "linear-gradient(135deg, #4f46e5, #0ea5e9)", boxShadow: "0 4px 14px rgba(79,70,229,0.3)" }}
              >
                Generate Address →
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Address card */}
              <div className="rounded-xl overflow-hidden border border-indigo-100 shadow-sm" aria-label="Generated warehouse address">
                <div
                  className="px-4 py-2.5 flex items-center justify-between"
                  style={{ background: "linear-gradient(90deg, #1e3a5f, #0ea5e9)" }}
                >
                  <span className="text-white text-xs font-bold tracking-wide uppercase">🇺🇸 USA Warehouse Address</span>
                  <span className="text-white/70 text-xs">{selectedWarehouse}</span>
                </div>
                <div className="bg-white divide-y divide-gray-100">
                  {addressLines.map(({ label, value }) => (
                    <div key={label} className="flex items-center px-4 py-2.5 gap-3">
                      <span className="text-xs text-gray-400 w-24 shrink-0">{label}</span>
                      <span className="text-xs font-semibold text-gray-800 flex-1 break-all">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleCopy}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95
                    ${copied
                      ? "bg-emerald-500 text-white"
                      : "bg-white border-2 border-gray-200 text-gray-700 hover:border-indigo-300 hover:text-indigo-600"}`}
                  aria-label={copied ? "Address copied" : "Copy address to clipboard"}
                >
                  {copied
                    ? <><FaCheckCircle className="text-base" /> Copied!</>
                    : <><FaRegCopy className="text-base" /> Copy Address</>}
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white active:scale-95 transition-all duration-150"
                  style={{ background: "linear-gradient(135deg, #25d366, #128c7e)", boxShadow: "0 4px 12px rgba(37,211,102,0.3)" }}
                  aria-label="Send address via WhatsApp"
                >
                  <FaWhatsapp className="text-lg" /> WhatsApp
                </button>
              </div>

              <button
                onClick={handleReset}
                className="text-xs text-gray-400 hover:text-indigo-500 transition-colors text-center"
              >
                ← Generate a different address
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}