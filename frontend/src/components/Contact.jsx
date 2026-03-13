// src/components/Contact.jsx
import React from "react";
import { FaWhatsapp, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

export default function Contact() {
  return (
    <section
      id="contact"
      className="py-12 md:py-20 bg-gray-100 animate-fadeIn delay-150"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-primary mb-12">
          Contact Us
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          {/* Left: Info */}
          <div className="space-y-6">
            <p className="text-lg text-gray-700">
              Have questions or need assistance? Our team is here to help you
              with shipping, tracking, and customer support.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <FaMapMarkerAlt className="text-primary" />
                <span>
                  Firstpoint Cargo Offices<br />
                  Staten Island,Newyork, USA
                  Zip Code: 10304
                </span>
              </li>
              <li className="flex items-center gap-3">
                <FaPhoneAlt className="text-primary" />
                <span>+254 701 203 251 (Kenya) / +1 (313) 555‑7890 (USA)</span>
              </li>
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-primary" />
                <span>support@firstpointcargo.com</span>
              </li>
              <li className="flex items-center gap-3">
                {/* WhatsApp Button */}
                <a
                  href="https://wa.me/254701203251"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-600 transition transform hover:scale-105"
                >
                  <FaWhatsapp size={22} />
                  <span className="font-semibold">Chat with us on WhatsApp</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Right: Contact Form */}
          <form className="bg-white rounded-xl shadow-lg p-8 space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Name
              </label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Your email"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Message
              </label>
              <textarea
                placeholder="Your message"
                rows="4"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white font-bold py-3 rounded-lg shadow hover:bg-secondary transition"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}