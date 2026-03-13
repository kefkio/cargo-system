// src/components/HowItWorks.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaLock,
  FaClipboardList,
  FaAddressCard,
  FaWarehouse,
  FaShoppingCart,
  FaRegCopy,
  FaCheckCircle,
} from "react-icons/fa";

export default function HowItWorks({ user }) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [copied, setCopied] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState([]);
  const [showAddress, setShowAddress] = useState(false);
  const [showMore, setShowMore] = useState(false); // Read more state
  const warehouseRef = useRef(null);

  const isCustomerLoggedIn = user !== null;

  // Unique warehouse addresses
  const warehouseData = {
    "Staten Island, NY": { line1: "330 Tompkins Ave", line2: "Unit 3623", city: "Staten Island", state: "NY", zip: "10304" },
    "Los Angeles, CA": { line1: "720 S Alameda St", line2: "Unit 1120", city: "Los Angeles", state: "CA", zip: "90021" },
    "Chicago, IL": { line1: "450 N Wells St", line2: "Unit 502", city: "Chicago", state: "IL", zip: "60654" },
    "Federal Way, WA": { line1: "1235 S 336th St", line2: "Unit 8A", city: "Federal Way", state: "WA", zip: "98003" },
  };

  const steps = [
    { title: "Register as a User", description: "Sign in or register to personalize your USA warehouse address.", icon: <FaClipboardList /> },
    { title: "Set Password", description: "Secure your shipping account with a password.", icon: <FaLock /> },
    { title: "Warehouse Access", description: "Get access to our warehouse network.", icon: <FaWarehouse />, onClick: () => warehouseRef.current?.scrollIntoView({ behavior: "smooth" }) },
    { title: "Shop & Ship", description: "Shop online from popular US stores and ship to your warehouse.", icon: <FaShoppingCart /> },
  ];

  // Animate steps
  useEffect(() => {
    steps.forEach((_, idx) => {
      setTimeout(() => setVisibleSteps((prev) => [...prev, idx]), idx * 200);
    });
  }, []);

  // Auto-expand Read More after 7 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowMore(true), 7000);
    return () => clearTimeout(timer);
  }, []);

  // Build warehouse address string
  const warehouseAddress =
    isCustomerLoggedIn && showAddress && selectedWarehouse
      ? `
${userName.trim() ? `FirstPoint + ${userName}` : "FirstPoint + ........................................"}
${selectedWarehouse}
Street Address Line 1: ${warehouseData[selectedWarehouse].line1}
Street Address Line 2: ${warehouseData[selectedWarehouse].line2}
Town/City: ${warehouseData[selectedWarehouse].city}
State: ${warehouseData[selectedWarehouse].state}
Zip Code: ${warehouseData[selectedWarehouse].zip}
Country: USA
Phone Number: 7012033251
`
      : "";

  const handleGenerateAddress = () => {
    if (!isCustomerLoggedIn) {
      const registerNow = window.confirm(
        "You must be registered to generate your warehouse address. Do you want to register now?"
      );
      if (registerNow) navigate("/signup");
      else navigate("/");
      return;
    }

    if (!userName || !selectedWarehouse) {
      alert("Please enter your full name and select a warehouse.");
      return;
    }

    setShowAddress(true);
    warehouseRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="how-it-works" className="py-20 px-6 md:px-20 bg-gradient-to-r from-white to-gray-50">
      <h2 className="text-4xl font-extrabold text-primary mb-16 text-center tracking-tight">
        How It Works
      </h2>

      <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Left: Stepper */}
        <div className="relative space-y-10">
          {steps.map((step, idx) => (
            <div
              key={idx}
              onClick={step.onClick}
              className={`flex items-start gap-4 relative cursor-pointer transition-all duration-700 ease-out transform ${
                visibleSteps.includes(idx) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              } hover:scale-105`}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-center font-bold shadow transform transition-all duration-300">
                {step.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary">{step.title}</h3>
                <p className="text-gray-700 text-sm">{step.description}</p>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className="absolute left-5 top-10 w-0.5 bg-gradient-to-b from-primary to-secondary transition-all duration-700 ease-out"
                  style={{ height: visibleSteps.includes(idx + 1) ? "40px" : "0px" }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Right: Warehouse / Form */}
        <div ref={warehouseRef} className="bg-gradient-to-r from-primary to-secondary p-1 rounded-xl shadow-xl max-w-md mx-auto md:mx-0">
          <div className="bg-white p-6 rounded-xl text-center shadow-md space-y-4">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-secondary text-white shadow-xl mx-auto mb-2 border-4 border-primary">
              <FaAddressCard size={28} />
            </div>
            <h3 className="font-extrabold text-xl md:text-2xl text-secondary tracking-wide uppercase">
              Personalize Your Warehouse Address
            </h3>

            {/* Read More / Read Less */}
            <p className="text-gray-700 text-sm mb-4">
              When you shop or receive goods, simply share our generated warehouse address with your vendor.
              {showMore && (
                <>
                  {" "}Once your shipment arrives, our staff records it in the system, and you’ll automatically get a tracking number, QR code, and payment instructions. You can pay before or after your cargo reaches our Nairobi warehouse, and track it every step of the way.
                </>
              )}
            </p>
            <button
              onClick={() => setShowMore(!showMore)}
              className="text-primary underline text-sm mb-4"
            >
              {showMore ? "Read Less" : "Read More"}
            </button>

            {/* Form Inputs */}
            <div className="space-y-3 text-left">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Full Name"
                className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />

              <label className="text-sm font-semibold block">Select Warehouse:</label>
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Warehouse</option>
                {Object.keys(warehouseData).map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>

              <button
                onClick={handleGenerateAddress}
                className="w-full px-5 py-2 rounded-xl shadow font-semibold text-white bg-primary hover:bg-primary-dark transition text-sm"
              >
                Generate Address
              </button>
            </div>

            {/* Warehouse Address */}
            {isCustomerLoggedIn && showAddress && (
              <div className="mt-4 p-3 border border-gray-300 rounded-lg bg-gray-50 relative text-xs">
                <h4 className="font-semibold text-primary mb-1">Your USA Warehouse Address</h4>
                <pre className="whitespace-pre-wrap">{warehouseAddress}</pre>
                <div className="flex justify-center gap-2 mt-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(warehouseAddress);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                    className="px-3 py-1 bg-primary text-white rounded shadow hover:bg-primary-dark flex items-center gap-1"
                  >
                    {copied ? <><FaCheckCircle /> Copied</> : <><FaRegCopy /> Copy</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}