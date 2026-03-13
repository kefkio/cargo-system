// src/components/SideNav.jsx
import React from "react";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaTruck,
  FaUser,
  FaDollarSign,
  FaPhone,
  FaInfoCircle,
  FaCalculator, // new icon for calculator link
} from "react-icons/fa";
import { Link } from "react-router-dom";

export default function SideNav({ isOpen, setIsOpen }) {
  return (
    <>
      {/* Toggle Button */}
      <button
        className="fixed top-20 left-4 z-50 p-3 bg-primary text-white rounded-md shadow-lg"
        onClick={() => setIsOpen(true)}
      >
        <FaBars size={20} />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Side Drawer */}
      <aside
        className={`fixed top-16 left-0 h-[calc(100vh-4rem)] w-64
          bg-slate-900/90 border-r border-white/10 text-white shadow-2xl
          transform transition-transform duration-300 ease-in-out z-50 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-white/10">
            <h2 className="text-lg font-bold">Menu</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-300 hover:text-white"
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-3 mt-6 px-4">
            <a
              href="#hero"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition"
            >
              <FaHome /> Home
            </a>

            <a
              href="#howitworks"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition"
            >
              <FaInfoCircle /> How It Works
            </a>

            <a
              href="#services"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition"
            >
              <FaTruck /> Services
            </a>

            <a
              href="#pricing"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition"
            >
              <FaDollarSign /> Pricing
            </a>

            {/* New Calculator Link */}
            <a
              href="#calculator"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition"
            >
              <FaCalculator /> Shipping -Pricing Calculator
            </a>

            <a
              href="#contact"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition"
            >
              <FaPhone /> Contact
            </a>

            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition"
            >
              <FaUser /> Sign In
            </Link>

            <Link
              to="/register"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition"
            >
              <FaUser /> Sign Up
            </Link>
          </nav>

          {/* Footer */}
          <div className="mt-auto p-4 text-sm text-gray-400 border-t border-white/10">
            © 2026 Firstpoint Cargo
          </div>
        </div>
      </aside>
    </>
  );
}