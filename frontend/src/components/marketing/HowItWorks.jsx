// src/components/HowItWorks.jsx
import React, { useState, useEffect } from "react";
import { FaLock, FaClipboardList, FaWarehouse, FaShoppingCart } from "react-icons/fa";
import GenerateAddressModal from "../shipment/GenerateAddressModal";

const steps = [
  { title: "Register as a User", description: "Sign in or register to personalize your USA warehouse address.", icon: <FaClipboardList /> },
  { title: "Set Password", description: "Secure your shipping account with a password.", icon: <FaLock /> },
  { title: "Warehouse Access", description: "Get access to our warehouse network.", icon: <FaWarehouse /> },
  { title: "Shop & Ship", description: "Shop online from popular US stores and ship to your warehouse.", icon: <FaShoppingCart /> },
];

export default function HowItWorks({ user }) {
  const [visibleSteps, setVisibleSteps] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showMore, setShowMore] = useState(false); // Read more state

  // Animate steps on mount
  useEffect(() => {
    steps.forEach((_, idx) => {
      setTimeout(() => setVisibleSteps((prev) => [...prev, idx]), idx * 200);
    });
  }, []);

  return (
    <section id="how-it-works" className="py-20 px-6 md:px-20 bg-gradient-to-r from-white to-gray-50">
      <h2 className="text-4xl font-extrabold text-primary mb-16 text-center tracking-tight">
        How It Works
      </h2>

      <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Left: Steps */}
        <div className="relative space-y-10">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-4 relative transition-all duration-700 ease-out transform cursor-pointer ${
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
            </div>
          ))}
        </div>

        {/* Right: Personalize Warehouse Address Button */}
        <div className="bg-gradient-to-r from-primary to-secondary p-1 rounded-xl shadow-xl max-w-md mx-auto md:mx-0">
          <div className="bg-white p-6 rounded-xl text-center shadow-md space-y-4">
            <h3 className="font-extrabold text-xl md:text-2xl text-secondary tracking-wide uppercase">
              Personalize Your Warehouse Address
            </h3>
            <p className="text-gray-700 text-sm mb-4">
              Click below to generate your personal USA warehouse address for shopping and shipping.
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

            <button
              onClick={() => setShowModal(true)}
              className="w-full px-5 py-2 rounded-xl shadow font-semibold text-white bg-primary hover:bg-primary-dark transition text-sm"
            >
              Generate Warehouse Address
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <GenerateAddressModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        user={user}
      />
    </section>
  );
}