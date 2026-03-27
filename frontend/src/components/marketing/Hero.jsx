// src/components/marketing/Hero.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PickupRequest from "../shipment/PickupRequest";

const Hero = () => {
  const navigate = useNavigate();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const [bubbleData] = useState(() =>
    [...Array(6)].map((_, i) => ({
      width: 40 + i * 20,
      height: 40 + i * 20,
      top: `${Math.random() * 80}%`,
      left: `${Math.random() * 90}%`,
      animationDelay: `${i * 2}s`,
    }))
  );
  const [visible, setVisible] = useState({
    headline: false,
    subheadline: false,
    buttons: false,
    tracker: false,
    trust: false,
  });
  const [isPickupOpen, setIsPickupOpen] = useState(false);

  useEffect(() => {
    // Fade-in sequence
    setTimeout(() => setVisible((v) => ({ ...v, headline: true })), 200);
    setTimeout(() => setVisible((v) => ({ ...v, subheadline: true })), 600);
    setTimeout(() => setVisible((v) => ({ ...v, buttons: true })), 1000);
    setTimeout(() => setVisible((v) => ({ ...v, tracker: true })), 1400);
    setTimeout(() => setVisible((v) => ({ ...v, trust: true })), 1800);

    // Scroll listener for parallax
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleTrack = () => {
    if (!trackingNumber.trim()) {
      alert("Please enter a tracking number.");
      return;
    }
    navigate(`/track?tn=${encodeURIComponent(trackingNumber.trim())}`);
  };

  return (
    <section className="relative bg-gradient-to-br from-blue-900 to-blue-700 text-white py-16 md:py-28 overflow-hidden">
      {/* Animated Bubbles with Parallax */}
      <div className="absolute inset-0 pointer-events-none">
        {bubbleData.map((bubble, i) => (
          <span
            key={i}
            className="absolute bg-white bg-opacity-10 rounded-full animate-bubble"
            style={{
              width: `${bubble.width}px`,
              height: `${bubble.height}px`,
              top: bubble.top,
              left: bubble.left,
              animationDelay: bubble.animationDelay,
              transform: `translateY(${scrollY * 0.1 * (i + 1)}px)`,
            }}
          ></span>
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12 text-center z-10">
        {/* Headline */}
        <h1
          className={`text-3xl md:text-6xl font-bold leading-tight mb-6 transition-all duration-700 ease-out transform ${
            visible.headline ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
          }`}
        >
          Ship Between the USA and Kenya — Fast, Reliable & Transparent
        </h1>

        {/* Subheadline */}
        <p
          className={`text-base md:text-xl text-blue-100 max-w-3xl mx-auto mb-8 transition-all duration-700 ease-out transform ${
            visible.subheadline ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          Air freight, sea freight, and secure sea boxes for individuals and businesses.
          <br />
          <span className="font-semibold text-yellow-300">
            We handle customs clearance, taxes, and door-to-door delivery across Kenya.
          </span>
        </p>

        {/* CTA Buttons */}
        <div
          className={`flex flex-col md:flex-row justify-center gap-4 mb-6 transition-all duration-700 ease-out transform ${
            visible.buttons ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <a
            href="#calculator"
            className="bg-white text-blue-800 font-semibold px-8 py-4 rounded-xl shadow-lg hover:scale-105 transition duration-300"
          >
            Calculate Shipping Cost
          </a>
          <button
            onClick={() => setIsPickupOpen(true)}
            className="bg-yellow-500 text-blue-900 font-semibold px-8 py-4 rounded-xl shadow-lg hover:bg-yellow-400 transition"
          >
            Request a Pickup
          </button>
        </div>

        {/* Track Your Parcel */}
        <div
          className={`flex flex-col md:flex-row justify-center gap-4 mt-4 transition-all duration-700 ease-out transform ${
            visible.tracker ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <input
            type="text"
            placeholder="Enter your tracking number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="px-4 py-3 rounded-xl text-gray-800 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button
            onClick={handleTrack}
            className="px-6 py-3 bg-yellow-500 text-white font-bold rounded-xl shadow-lg hover:bg-yellow-400 transition"
          >
            Track Your Parcel
          </button>
        </div>

        {/* Trust Indicators */}
        <div
          className={`flex flex-wrap justify-center gap-6 text-blue-100 text-sm md:text-base mt-10 transition-all duration-700 ease-out transform ${
            visible.trust ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <span>✔ Transparent Pricing</span>
          <span>✔ Secure Cargo Handling</span>
          <span>✔ Real-Time Tracking</span>
          <span>✔ Reliable Delivery Network</span>
        </div>
      </div>

      {/* Pickup Modal */}
      {isPickupOpen && <PickupRequest onClose={() => setIsPickupOpen(false)} />}

      {/* Bubble Animation CSS */}
      <style>{`
        @keyframes bubble {
          0% { transform: translate(0,0) scale(1); opacity:0.4; }
          25% { transform: translate(5px,-15px) scale(1.05); opacity:0.6; }
          50% { transform: translate(-5px,-30px) scale(1.1); opacity:0.6; }
          75% { transform: translate(5px,-15px) scale(1.05); opacity:0.6; }
          100% { transform: translate(0,0) scale(1); opacity:0.4; }
        }
        .animate-bubble { animation: bubble 6s ease-in-out infinite; }
      `}</style>
    </section>
  );
};

export default Hero;