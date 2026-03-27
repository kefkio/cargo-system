// src/components/super-admin/SuperAdminNavbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import SuperAdminBell from "./SuperAdminBell";

export default function SuperAdminNavbar() {
    const handleExit = () => {
      navigate("/");
    };
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  return (
    <nav className="bg-primary text-white px-6 py-4 flex justify-between items-center shadow-md sticky top-0 z-50 border-b border-[#2a3045] super-admin-nav-bg">
      <div className="flex items-center gap-4">
        <button
          onClick={handleExit}
          className="text-yellow-400 hover:text-yellow-300 text-3xl font-bold focus:outline-none"
          title="Exit Super Admin"
          aria-label="Exit Super Admin"
        >
          {/* SVG left arrow icon */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="32" height="32">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <span className="font-bold text-xl">Super Admin Dashboard</span>
      </div>
      <div className="flex items-center gap-6">
        <SuperAdminBell />
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}