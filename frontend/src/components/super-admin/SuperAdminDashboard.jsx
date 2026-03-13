// src/components/super-admin/SuperAdminDashboard.jsx
import React, { useState } from "react";
import SuperAdminNavbar from "./SuperAdminNavbar";
import AdminsPanel from "./AdminsPanel";
import StaffPanel from "./StaffPanel";
import ClientsPanel from "./ClientsPanel";
import ShipmentsPanel from "./ShipmentsPanel";

const tabs = [
  { id: "admins", label: "Admins" },
  { id: "staff", label: "Staff" },
  { id: "clients", label: "Clients" },
  { id: "shipments", label: "Shipments" },
];

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState("admins");

  const renderTab = () => {
    switch (activeTab) {
      case "admins":
        return <AdminsPanel />;
      case "staff":
        return <StaffPanel />;
      case "clients":
        return <ClientsPanel />;
      case "shipments":
        return <ShipmentsPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <SuperAdminNavbar />
      <div className="p-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 rounded-t ${
                activeTab === tab.id
                  ? "bg-white border-t border-l border-r border-gray-300 font-semibold"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Panel Content */}
        <div className="bg-white p-6 rounded shadow">{renderTab()}</div>
      </div>
    </div>
  );
}