// src/components/super-admin/StaffPanel.jsx


import React, { useState, useEffect } from "react";
import UnifiedPanel from "./UnifiedPanel";
import EditStaffModal from "./EditStaffModal";
import axios from "axios";



export default function StaffPanel() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [editStaff, setEditStaff] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [allStaff, setAllStaff] = useState([]);
  const [fetching, setFetching] = useState(true);

  // Fetch all staff/admins
  useEffect(() => {
    setFetching(true);
    const access = localStorage.getItem("access");
    fetch(`${API_URL}/staff/?_k=${refreshKey}`, {
      headers: access ? { Authorization: `Bearer ${access}` } : {}
    })
      .then(res => res.json())
      .then(data => setAllStaff(Array.isArray(data) ? data : []))
      .finally(() => setFetching(false));
  }, [API_URL, refreshKey]);

  const handleEdit = (staff) => {
    setEditStaff(staff);
    setModalOpen(true);
  };

  const handleDisable = async (staff) => {
    if (!window.confirm(`Disable staff: ${staff.name}? This will revoke all access.`)) return;
    setLoading(true);
    try {
      await axios.patch(
        `${API_URL}/accounts/staff/${staff.id}/`,
        { isActive: false, role: "CLIENT" },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setRefreshKey(k => k + 1);
    } catch (err) {
      alert("Failed to disable staff");
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async (staff) => {
    if (!window.confirm(`Enable staff: ${staff.name}? This will restore their previous access.`)) return;
    setLoading(true);
    try {
      // Restore to STAFF by default, or previous role if you want to track it
      await axios.patch(
        `${API_URL}/accounts/staff/${staff.id}/`,
        { isActive: true, role: "STAFF" },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setRefreshKey(k => k + 1);
    } catch (err) {
      alert("Failed to enable staff");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (form) => {
    setLoading(true);
    try {
      await axios.patch(
        `${API_URL}/accounts/staff/${editStaff.id}/`,
        form,
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setModalOpen(false);
      setEditStaff(null);
      setRefreshKey(k => k + 1);
    } catch (err) {
      alert("Failed to update staff");
    } finally {
      setLoading(false);
    }
  };

  const activeStaff = allStaff.filter(u => u.isActive);
  const inactiveStaff = allStaff.filter(u => !u.isActive);

  return (
    <>
      <UnifiedPanel
        title="Active Staff/Admins"
        endpoint={null}
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
          { key: "isActive", label: "Status", render: (item) => item.isActive ? "Active" : "Inactive" },
        ]}
        actions={[
          { label: "Edit", onClick: handleEdit },
          { label: "Disable", onClick: handleDisable, showIf: (item) => item.isActive },
        ]}
        searchPlaceholder="Search staff..."
        dataOverride={activeStaff}
        loadingOverride={fetching}
      />
      <UnifiedPanel
        title="Disabled Staff/Admins"
        endpoint={null}
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
          { key: "isActive", label: "Status", render: (item) => item.isActive ? "Active" : "Inactive" },
        ]}
        actions={[
          { label: "Enable", onClick: handleEnable, showIf: (item) => !item.isActive },
        ]}
        searchPlaceholder="Search disabled staff..."
        dataOverride={inactiveStaff}
        loadingOverride={fetching}
      />
      <EditStaffModal
        staff={editStaff}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
      {loading && <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"><div className="bg-white p-4 rounded shadow">Processing...</div></div>}
    </>
  );
}