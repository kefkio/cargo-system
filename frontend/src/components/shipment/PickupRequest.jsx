// src/components/shipment/PickupRequest.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const US_STATES = [
  ["AL","Alabama"],["AK","Alaska"],["AZ","Arizona"],["AR","Arkansas"],["CA","California"],
  ["CO","Colorado"],["CT","Connecticut"],["DE","Delaware"],["FL","Florida"],["GA","Georgia"],
  ["HI","Hawaii"],["ID","Idaho"],["IL","Illinois"],["IN","Indiana"],["IA","Iowa"],
  ["KS","Kansas"],["KY","Kentucky"],["LA","Louisiana"],["ME","Maine"],["MD","Maryland"],
  ["MA","Massachusetts"],["MI","Michigan"],["MN","Minnesota"],["MS","Mississippi"],["MO","Missouri"],
  ["MT","Montana"],["NE","Nebraska"],["NV","Nevada"],["NH","New Hampshire"],["NJ","New Jersey"],
  ["NM","New Mexico"],["NY","New York"],["NC","North Carolina"],["ND","North Dakota"],["OH","Ohio"],
  ["OK","Oklahoma"],["OR","Oregon"],["PA","Pennsylvania"],["RI","Rhode Island"],["SC","South Carolina"],
  ["SD","South Dakota"],["TN","Tennessee"],["TX","Texas"],["UT","Utah"],["VT","Vermont"],
  ["VA","Virginia"],["WA","Washington"],["WV","West Virginia"],["WI","Wisconsin"],["WY","Wyoming"],
  ["DC","District of Columbia"],
];

const STEPS = ["Contact", "Address", "Package"];

export default function PickupRequest({ onClose }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    street: "", city: "", state: "", zip: "",
    contactPerson: "", contactPhone: "",
    packageDetails: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleClose = () => {
    setVisible(false);
    if (onClose) {
      setTimeout(onClose, 300);
    } else {
      setTimeout(() => navigate(-1), 300);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 0) {
      if (!form.name.trim()) newErrors.name = "Full name is required";
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Valid email required";
      if (!form.phone.trim()) newErrors.phone = "Phone number is required";
      
    }
    if (step === 1) {
      if (!form.street.trim()) newErrors.street = "Street address is required";
      if (!form.city.trim()) newErrors.city = "City is required";
      if (!form.state) newErrors.state = "State is required";
      if (!form.zip.trim() || !/^\d{5}(-\d{4})?$/.test(form.zip)) newErrors.zip = "Valid ZIP required";
    }
    if (step === 2) {
      if (!form.packageDetails.trim()) newErrors.packageDetails = "Please provide package details or instructions";
      if (form.contactPhone && !/^\+?[\d\s\-().]{7,20}$/.test(form.contactPhone))
        newErrors.contactPhone = "Enter a valid phone number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL.replace(/\/accounts\/?$/, '');
      const res = await fetch(`${API_URL}/pickup-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Submission failed");
      }
      setSubmitted(true);
      setTimeout(() => { setVisible(false); setTimeout(() => handleClose(), 300); }, 3000);
    } catch (err) {
      console.error("Pickup request failed:", err);
      alert("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (name) =>
    `w-full px-4 py-3 rounded-xl border text-sm font-medium bg-white/70 backdrop-blur-sm
     text-gray-900 placeholder-gray-400 transition-all duration-200 outline-none
     focus:ring-2 focus:ring-offset-1 focus:bg-white
     ${errors[name]
       ? "border-red-400 focus:ring-red-300"
       : "border-gray-200 focus:border-indigo-400 focus:ring-indigo-200"}`;

  return (
    <>
      {/* SEO-friendly hidden metadata for screen readers / crawlers */}
      <div aria-hidden="false" className="sr-only">
        <h1>Schedule a Package Pickup</h1>
        <p>
          Request a free package pickup at your US address. Fill in your contact
          details, delivery address, and package information to get started.
        </p>
      </div>

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Request a package pickup"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          transition: "opacity 0.3s ease",
          opacity: visible ? 1 : 0,
        }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          onClick={handleClose}
          aria-hidden="true"
        />

        {/* Modal card */}
        <div
          className="relative w-full max-w-md z-10 rounded-2xl overflow-hidden shadow-2xl"
          style={{
            transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
            transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease",
            opacity: visible ? 1 : 0,
          }}
        >
          {/* Gradient header band */}
          <div
            className="px-6 pt-7 pb-10 pickup-header-gradient"
          >
            <button
              onClick={handleClose}
              aria-label="Close pickup request form"
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 8h14M5 8a2 2 0 010-4h14a2 2 0 010 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Request a Pickup
              </h2>
            </div>
            <p className="text-white/70 text-sm pl-12">
              Schedule a free package collection at your door.
            </p>
          </div>

          {/* Step indicator */}
          <div
            className="flex items-center gap-0 px-6 -mt-5"
            role="tablist"
            aria-label="Form steps"
          >
            {STEPS.map((label, i) => (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 shadow-sm
                      ${i < step ? "bg-indigo-600 border-indigo-600 text-white"
                        : i === step ? "bg-white border-indigo-500 text-indigo-600"
                        : "bg-white border-gray-200 text-gray-400"}`}
                    role="tab"
                    aria-selected={i === step}
                    aria-label={`Step ${i + 1}: ${label}`}
                  >
                    {i < step ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : i + 1}
                  </div>
                  <span className={`text-xs font-medium ${i === step ? "text-indigo-600" : "text-gray-400"}`}>
                    {label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mb-5 mx-1 transition-all duration-500 ${i < step ? "bg-indigo-500" : "bg-gray-200"}`} aria-hidden="true"/>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Form body */}
          <div className="bg-gray-50 px-6 pb-6 pt-4">
            {submitted ? (
              <div
                role="status"
                aria-live="polite"
                className="flex flex-col items-center gap-3 py-8 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 13l4 4L19 7" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-lg font-bold text-gray-900">Request Received!</p>
                <p className="text-sm text-gray-500">
                  We'll confirm your pickup via email and WhatsApp shortly.
                </p>
              </div>
            ) : (
              <form
                onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}
                noValidate
                aria-label={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}
              >
                <div className="flex flex-col gap-3">

                  {/* Step 0 — Contact */}
                  {step === 0 && (
                    <>
                      <div>
                        <label htmlFor="name" className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                        <input id="name" type="text" name="name" value={form.name} onChange={handleChange}
                          placeholder="Jane Smith" required autoComplete="name"
                          aria-describedby={errors.name ? "name-error" : undefined}
                          className={fieldClass("name")} />
                        {errors.name && <p id="name-error" role="alert" className="text-xs text-red-500 mt-1">{errors.name}</p>}
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                        <input id="email" type="email" name="email" value={form.email} onChange={handleChange}
                          placeholder="jane@example.com" required autoComplete="email"
                          aria-describedby={errors.email ? "email-error" : undefined}
                          className={fieldClass("email")} />
                        {errors.email && <p id="email-error" role="alert" className="text-xs text-red-500 mt-1">{errors.email}</p>}
                      </div>
                    <div>
  <label htmlFor="phone" className="block text-xs font-semibold text-gray-600 mb-1">
    Phone Number
  </label>
  <PhoneInput
    country={"us"} // default country
    value={form.phone}
    onChange={(phone) => setForm((prev) => ({ ...prev, phone: "+" + phone }))}
    inputProps={{
      name: "phone",
      required: true,
      autoComplete: "tel",
      id: "phone",
      "aria-describedby": errors.phone ? "phone-error" : undefined,
    }}
    containerClass="w-full"
    inputClass="!w-full !py-3 !pl-14 !rounded-xl !border !border-gray-200 !bg-white/70 !text-gray-900 !text-sm focus:!border-indigo-400"
  />
  {errors.phone && (
    <p id="phone-error" role="alert" className="text-xs text-red-500 mt-1">
      {errors.phone}
    </p>
  )}
</div>
                    </>
                  )}

                  {/* Step 1 — Address */}
                  {step === 1 && (
                    <>
                      <div>
                        <label htmlFor="street" className="block text-xs font-semibold text-gray-600 mb-1">Street Address</label>
                        <input id="street" type="text" name="street" value={form.street} onChange={handleChange}
                          placeholder="123 Main St, Apt 4B" required autoComplete="street-address"
                          aria-describedby={errors.street ? "street-error" : undefined}
                          className={fieldClass("street")} />
                        {errors.street && <p id="street-error" role="alert" className="text-xs text-red-500 mt-1">{errors.street}</p>}
                      </div>
                      <div>
                        <label htmlFor="city" className="block text-xs font-semibold text-gray-600 mb-1">City</label>
                        <input id="city" type="text" name="city" value={form.city} onChange={handleChange}
                          placeholder="New York" required autoComplete="address-level2"
                          aria-describedby={errors.city ? "city-error" : undefined}
                          className={fieldClass("city")} />
                        {errors.city && <p id="city-error" role="alert" className="text-xs text-red-500 mt-1">{errors.city}</p>}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label htmlFor="state" className="block text-xs font-semibold text-gray-600 mb-1">State</label>
                          <select id="state" name="state" value={form.state} onChange={handleChange} required
                            autoComplete="address-level1"
                            aria-describedby={errors.state ? "state-error" : undefined}
                            className={fieldClass("state")}>
                            <option value="">Select…</option>
                            {US_STATES.map(([abbr, name]) => (
                              <option key={abbr} value={abbr}>{name}</option>
                            ))}
                          </select>
                          {errors.state && <p id="state-error" role="alert" className="text-xs text-red-500 mt-1">{errors.state}</p>}
                        </div>
                        <div>
                          <label htmlFor="zip" className="block text-xs font-semibold text-gray-600 mb-1">ZIP Code</label>
                          <input id="zip" type="text" name="zip" value={form.zip} onChange={handleChange}
                            placeholder="10001" required autoComplete="postal-code" maxLength={10}
                            aria-describedby={errors.zip ? "zip-error" : undefined}
                            className={fieldClass("zip")} />
                          {errors.zip && <p id="zip-error" role="alert" className="text-xs text-red-500 mt-1">{errors.zip}</p>}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Step 2 — Package */}
                  {step === 2 && (
                    <>
                      <div>
                        <label htmlFor="packageDetails" className="block text-xs font-semibold text-gray-600 mb-1">
                          Package Details & Instructions <span className="text-red-400">*</span>
                        </label>
                        <textarea id="packageDetails" name="packageDetails" value={form.packageDetails}
                          onChange={handleChange} rows={4} required
                          placeholder="Describe your package — dimensions, weight, number of items, fragile contents, packing instructions, preferred pickup window, etc."
                          className={`${fieldClass("packageDetails")} resize-none`}
                          aria-describedby={errors.packageDetails ? "pkg-error" : "pkg-hint"}
                        />
                        {errors.packageDetails
                          ? <p id="pkg-error" role="alert" className="text-xs text-red-500 mt-1">{errors.packageDetails}</p>
                          : <p id="pkg-hint" className="text-xs text-gray-400 mt-1">The more detail you provide, the smoother your pickup will go.</p>
                        }
                      </div>

                      {/* Optional contact person divider */}
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400 whitespace-nowrap">On-site contact (optional)</span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                      <p className="text-xs text-gray-500 -mt-1">
                        If someone other than you will be present at pickup, add their details below.
                      </p>

                      <div>
                        <label htmlFor="contactPerson" className="block text-xs font-semibold text-gray-600 mb-1">
                          Contact Person Name
                          <span className="font-normal text-gray-400 ml-1">(optional)</span>
                        </label>
                        <input id="contactPerson" type="text" name="contactPerson" value={form.contactPerson}
                          onChange={handleChange} autoComplete="off"
                          placeholder="e.g. John at the front desk"
                          className={fieldClass("contactPerson")} />
                      </div>

                      <div>
  <label htmlFor="contactPhone" className="block text-xs font-semibold text-gray-600 mb-1">
    Contact Person Phone <span className="font-normal text-gray-400 ml-1">(optional)</span>
  </label>
  <PhoneInput
    country={"us"}
    value={form.contactPhone}
    onChange={(phone) => setForm((prev) => ({ ...prev, contactPhone: "+" + phone }))}
    inputProps={{
      name: "contactPhone",
      autoComplete: "tel",
      id: "contactPhone",
      "aria-describedby": errors.contactPhone ? "contact-phone-error" : undefined,
    }}
    containerClass="w-full"
    inputClass="!w-full !py-3 !pl-14 !rounded-xl !border !border-gray-200 !bg-white/70 !text-gray-900 !text-sm focus:!border-indigo-400"
  />
  {errors.contactPhone && (
    <p id="contact-phone-error" role="alert" className="text-xs text-red-500 mt-1">
      {errors.contactPhone}
    </p>
  )}
</div>
                    </>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex gap-3 mt-5">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 py-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600
                                 hover:bg-gray-50 active:scale-95 transition-all duration-150"
                    >
                      ← Back
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    aria-label={step < 2 ? `Continue to ${STEPS[step + 1]}` : "Submit pickup request"}
                    className="flex-1 py-3 rounded-xl text-sm font-bold text-white
                               active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: loading
                        ? "#a5b4fc"
                        : "linear-gradient(135deg, #4f46e5, #7c3aed)",
                      boxShadow: loading ? "none" : "0 4px 14px rgba(79,70,229,0.35)",
                    }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="40 20"/>
                        </svg>
                        Submitting…
                      </span>
                    ) : step < 2 ? `Continue →` : "Submit Request"}
                  </button>
                </div>

                {/* Trust signals */}
                {step === 2 && (
                  <p className="text-center text-xs text-gray-400 mt-3" aria-label="Privacy assurance">
                    🔒 Your information is encrypted and never shared.
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}