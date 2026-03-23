// src/components/super-admin/SuperAdminDashboard.jsx
import React, { useState, useContext } from "react";
import { AuthContext } from "../../auth/AuthContext";
import Unauthorized from "../../auth/Unauthorized";
import useDashboardData from "./hooks/useDashboardData";


import AdminsPanel from "./AdminsPanel";
import StaffPanel from "./StaffPanel";
import ClientsPanel from "./ClientsPanel";
import ShipmentsPanel from "./ShipmentsPanel";
import DeleteRequestsPanel from "./DeleteRequestsPanel";

const TABS = ["admins", "staff", "clients", "shipments"];

export default function SuperAdminDashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const allowedRoles = ["superadmin"];

  const { tableData, stats, activity, services, loading, error } = useDashboardData();

  const [activeTab, setActiveTab] = useState("admins");
  const [search, setSearch] = useState("");

  if (authLoading) return <div>Loading...</div>;
  if (!user || !allowedRoles.includes(user.role?.toLowerCase())) {
    return <Unauthorized />;
  }

  const renderTabPanel = () => {
    switch (activeTab) {
      case "admins":
        return <AdminsPanel search={search} />;
      case "staff":
        return <StaffPanel search={search} />;
      case "clients":
        return <ClientsPanel search={search} />;
      case "shipments":
        return <ShipmentsPanel search={search} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f14] text-[#f0f2f8] font-sans">
      {/* Delete Requests Panel for SuperAdmin */}
      <div className="px-5 pt-5">
        <h1 className="text-xl font-bold mb-4">Delete Requests</h1>
        <DeleteRequestsPanel />
      </div>

      {/* Topbar */}
      <div className="h-14 border-b border-[#2a3045] flex items-center px-6">
        <h1 className="text-lg font-bold">{activeTab.toUpperCase()}</h1>
      </div>

      {/* Tab buttons */}
      <div className="flex gap-2 px-5 py-3 border-b border-[#2a3045]">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 text-sm font-mono ${
              activeTab === tab ? "text-[#e8ff47] border-b-2 border-[#e8ff47]" : "text-[#7a8499]"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="px-5 py-3">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#1e2330] border border-[#2a3045] rounded px-3 py-2 text-[#f0f2f8]"
        />
      </div>

      {/* Content */}
      <div className="px-5 py-3">{renderTabPanel()}</div>

      {/* Loading/Error overlay */}
      {loading && <div className="fixed inset-0 bg-black/30 flex items-center justify-center text-[#e8ff47]">Loading dashboard...</div>}
      {error && <div className="fixed inset-0 bg-black/30 flex items-center justify-center text-[#ff5c5c]">{error}</div>}
    </div>
  );
}