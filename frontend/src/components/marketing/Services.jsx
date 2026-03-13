// src/components/marketing/Services.jsx
import React from "react";
import AirCargo from "../../assets/images/aircargo.png";
import SeaFreight from "../../assets/images/seafreight.png";
import SecureBoxes from "../../assets/images/secureboxes.png";

const Services = () => {
  return (
    <section id="services" className="py-12 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900">
            Our Shipping Services
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Reliable cargo solutions designed to meet your speed, volume, and budget requirements.
          </p>
        </div>

        {/* 1️⃣ Air Freight */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center mb-12 md:mb-20">
          <div>
            <h3 className="text-3xl font-semibold text-gray-900 mb-4">Air Freight</h3>
            <p className="text-gray-600 mb-6">
              Fast, secure, and efficient air cargo services for urgent shipments. Ideal for high-value and time-sensitive deliveries.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li>• Express international shipping</li>
              <li>• Real-time tracking</li>
              <li>• Secure cargo handling</li>
            </ul>
          </div>
          <div>
            <img
              src={AirCargo}
              alt="Air Cargo Service"
              className="w-full h-48 md:h-[420px] object-cover rounded-2xl shadow-xl hover:scale-105 transition duration-500"
              loading="lazy"
            />
          </div>
        </div>

        {/* 2️⃣ Sea Freight */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center mb-12 md:mb-20">
          <div className="order-2 md:order-1">
            <img
              src={SeaFreight}
              alt="Sea Freight Service"
              className="w-full h-48 md:h-[420px] object-cover rounded-2xl shadow-xl hover:scale-105 transition duration-500"
              loading="lazy"
            />
          </div>
          <div className="order-1 md:order-2">
            <h3 className="text-3xl font-semibold text-gray-900 mb-4">Sea Freight</h3>
            <p className="text-gray-600 mb-6">
              Cost-effective ocean freight solutions for large shipments. Perfect for bulk cargo and commercial imports.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li>• Full container & shared container options</li>
              <li>• Reliable port logistics</li>
              <li>• Affordable bulk rates</li>
            </ul>
          </div>
        </div>

        {/* 3️⃣ Secure Boxes & Barrels */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center">
          <div>
            <h3 className="text-3xl font-semibold text-gray-900 mb-4">Secure Boxes & Barrels</h3>
            <p className="text-gray-600 mb-6">
              Convenient and secure shipping options for personal and household goods. Ideal for relocation and diaspora shipments.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li>• Secure packaging options</li>
              <li>• Affordable personal cargo rates</li>
              <li>• Trusted handling & delivery</li>
            </ul>
          </div>
          <div>
            <img
              src={SecureBoxes}
              alt="Secure Boxes Shipping"
              className="w-full h-48 md:h-[420px] object-cover rounded-2xl shadow-xl hover:scale-105 transition duration-500"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;