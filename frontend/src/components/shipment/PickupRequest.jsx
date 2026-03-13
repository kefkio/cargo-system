// src/components/shipment/PickupRequest.jsx
import React, { useState } from "react";

export default function PickupRequest({ onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    packageDetails: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Here you can integrate your API call
    console.log("Pickup request submitted:", form);
    setSubmitted(true);

    setTimeout(() => {
      setSubmitted(false);
      onClose(); // close modal after submission
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 relative shadow-lg animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 font-bold"
          aria-label="Close modal"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4 text-center text-primary">
          Request a Pickup
        </h2>

        {submitted ? (
          <p className="text-green-600 font-semibold text-center">
            Thank you! Your pickup request has been submitted.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              required
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Pickup Address"
              required
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            <textarea
              name="packageDetails"
              value={form.packageDetails}
              onChange={handleChange}
              placeholder="Package Details"
              rows={3}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
            ></textarea>

            <button
              type="submit"
              className="bg-secondary text-white font-bold py-3 rounded-xl hover:bg-secondary-dark transition"
            >
              Submit Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}