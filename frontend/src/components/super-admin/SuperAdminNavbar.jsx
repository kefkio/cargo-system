// src/components/super-admin/SuperAdminNavbar.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function SuperAdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  };

  return (
    <nav className="bg-primary text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="font-bold text-xl">Super Admin Dashboard</div>
      <button
        onClick={handleLogout}
        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
      >
        Logout
      </button>
    </nav>
  );
}