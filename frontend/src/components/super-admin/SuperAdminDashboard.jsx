// src/components/super-admin/SuperAdminDashboard.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/AuthContext";
import Unauthorized from "../../auth/Unauthorized";
import useDashboardData from "./hooks/useDashboardData";
import SuperAdminNavbar from "./SuperAdminNavbar";
import AdminsPanel from "./AdminsPanel";
import StaffPanel from "./StaffPanel";
import ClientsPanel from "./ClientsPanel";
import ShipmentsPanel from "./ShipmentsPanel";
import InvoicesPanel from "../shared/InvoicesPanel";
import DeleteRequestsPanel from "./DeleteRequestsPanel";
import CancellationsPanel from "./CancellationsPanel";
import LeadershipReports from "./LeadershipReports";
import DispatchPanel from "./DispatchPanel";

const TABS = ["admins", "staff", "clients", "shipments", "dispatch", "invoices"];

const TAB_ICONS = {
  admins: "👤",
  staff: "🧑‍💼",
  clients: "🏢",
  shipments: "📦",
  dispatch: "🚚",
  invoices: "📄",
};

export default function SuperAdminDashboard() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();
  const allowedRoles = ["superadmin"];
  const { tableData, stats, activity, services, loading, error } = useDashboardData();
  const [activeTab, setActiveTab] = useState("admins");
  const [search, setSearch] = useState("");

  if (authLoading)
    return (
      <div className="min-h-screen bg-[#0d0f14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#e8ff47] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#7a8499] text-sm">Authenticating...</span>
        </div>
      </div>
    );

  if (!user || !allowedRoles.includes(user.role?.toLowerCase())) {
    return <Unauthorized />;
  }

  const renderTabPanel = () => {
    switch (activeTab) {
      case "admins":    return <AdminsPanel search={search} />;
      case "staff":     return <StaffPanel search={search} />;
      case "clients":   return <ClientsPanel search={search} />;
      case "shipments": return <ShipmentsPanel search={search} />;
      case "dispatch":  return <DispatchPanel search={search} />;
      case "invoices":  return <InvoicesPanel role="SUPERADMIN" theme="dark" search={search} />;
      default:          return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0f14] text-[#f0f2f8] font-sans">
      <SuperAdminNavbar />

      <div className="pt-[80px]">
        {/* Page Header */}
        <div className="px-6 pt-6 pb-2 flex items-center justify-between border-b border-[#1e2330]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#f0f2f8]">
              Super Admin Dashboard
            </h1>
            <p className="text-sm text-[#7a8499] mt-0.5">
              Manage users, shipments and system settings
            </p>
          </div>
          <span className="text-xs bg-[#1e2330] text-[#e8ff47] border border-[#e8ff47]/30 px-3 py-1 rounded-full font-mono">
            SUPERADMIN
          </span>
        </div>

        {/* Leadership Reports & Analytics */}
        <div className="px-6 pt-5">
          <div className="bg-[#1a1d27] border border-[#2a3045] rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[#e8ff47] uppercase tracking-widest">
                📊 Reports & Analytics
              </h2>
              <button
                onClick={() => navigate("/super-admin/reports")}
                className="text-[10px] text-[#7a8499] hover:text-[#e8ff47] transition underline underline-offset-2"
              >
                Full Reports Page →
              </button>
            </div>
            <LeadershipReports />
          </div>
        </div>

        {/* Delete Requests Panel */}
        <div className="px-6 pt-5">
          <div className="bg-[#1a1d27] border border-[#2a3045] rounded-xl p-4">
            <h2 className="text-sm font-semibold text-[#e8ff47] uppercase tracking-widest mb-3">
              ⚠️ Pending Delete Requests
            </h2>
            <DeleteRequestsPanel />
          </div>
        </div>

        {/* Cancellations & Credit Notes Panel */}
        <div className="px-6 pt-5">
          <div className="bg-[#1a1d27] border border-[#2a3045] rounded-xl p-4">
            <h2 className="text-sm font-semibold text-[#e8ff47] uppercase tracking-widest mb-3">
              ⚠️ Cancellations & Credit Notes
            </h2>
            <CancellationsPanel />
          </div>
        </div>

        {/* Tabs + Search Row */}
        <div className="px-6 pt-5">
          <div className="bg-[#1a1d27] border border-[#2a3045] rounded-xl overflow-hidden">

            {/* Tab Bar */}
            <div className="flex items-center gap-1 px-4 pt-3 border-b border-[#2a3045]">
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-t transition-all duration-150 ${
                    activeTab === tab
                      ? "text-[#e8ff47] border-b-2 border-[#e8ff47] bg-[#e8ff47]/5"
                      : "text-[#7a8499] hover:text-[#f0f2f8] hover:bg-[#ffffff08]"
                  }`}
                >
                  <span>{TAB_ICONS[tab]}</span>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b border-[#2a3045]">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7a8499] text-sm">🔍</span>
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-[#0d0f14] border border-[#2a3045] rounded-lg pl-9 pr-4 py-2 text-sm text-[#f0f2f8] placeholder-[#7a8499] focus:outline-none focus:border-[#e8ff47]/50 transition-colors"
                />
              </div>
            </div>

            {/* Panel Content */}
            <div className="p-4">
              {renderTabPanel()}
            </div>
          </div>
        </div>

        {/* Bottom padding */}
        <div className="h-10" />
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center z-50 gap-3">
          <div className="w-10 h-10 border-2 border-[#e8ff47] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#e8ff47] text-sm font-mono">Loading dashboard...</span>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1a1d27] border border-[#ff5c5c]/40 rounded-xl px-6 py-4 text-[#ff5c5c] text-sm max-w-sm text-center">
            <div className="text-2xl mb-2">⚠️</div>
            {error}
          </div>
        </div>
      )}
    </div>
  );
}