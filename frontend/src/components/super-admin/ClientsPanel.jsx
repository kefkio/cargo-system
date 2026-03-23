// src/components/super-admin/ClientsPanel.jsx
import React, { useState, useEffect } from "react";
import UnifiedPanel from "./UnifiedPanel";
import EditClientModal from "./EditClientModal";
import axios from "axios";

export default function ClientsPanel() {
  const API_URL = import.meta.env.VITE_API_URL;
  const [allClients, setAllClients] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [editClient, setEditClient] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  // Get current user role from localStorage or API (simple version)
  useEffect(() => {
    const profile = localStorage.getItem("userProfile");
    if (profile) {
      try {
        setUserRole(JSON.parse(profile).role);
      } catch {}
    }
  }, []);

  useEffect(() => {
    setFetching(true);
    const access = localStorage.getItem("access");
    fetch(`${API_URL}/clients/?_k=${refreshKey}`, {
      headers: access ? { Authorization: `Bearer ${access}` } : {}
    })
      .then(res => res.json())
      .then(data => setAllClients(Array.isArray(data) ? data : []))
      .finally(() => setFetching(false));
  }, [API_URL, refreshKey]);

  const handleDisable = async (client) => {
    if (!window.confirm(`Disable client: ${client.name}? This will revoke all access.`)) return;
    setLoading(true);
    try {
      await axios.patch(
        `${API_URL}/clients/${client.id}/`,
        { isActive: false },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setRefreshKey(k => k + 1);
    } catch (err) {
      alert("Failed to disable client");
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async (client) => {
    if (!window.confirm(`Enable client: ${client.name}? This will restore their access.`)) return;
    setLoading(true);
    try {
      await axios.patch(
        `${API_URL}/clients/${client.id}/`,
        { isActive: true },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setRefreshKey(k => k + 1);
    } catch (err) {
      alert("Failed to enable client");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (client) => {
    setEditClient(client);
    setModalOpen(true);
  };

  const handleSave = async (form) => {
    setLoading(true);
    try {
      await axios.patch(
        `${API_URL}/clients/${editClient.id}/`,
        form,
        { headers: { Authorization: `Bearer ${localStorage.getItem("access")}` } }
      );
      setModalOpen(false);
      setEditClient(null);
      setRefreshKey(k => k + 1);
      if (form.role === "STAFF" && userRole !== "SUPERADMIN") {
        alert("Request sent to superadmin for approval.");
      }
    } catch (err) {
      alert("Failed to update client");
    } finally {
      setLoading(false);
    }
  };

  const activeClients = allClients.filter(u => u.isActive);
  const inactiveClients = allClients.filter(u => !u.isActive);

  return (
    <>
      <UnifiedPanel
        title="Active Clients"
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
        searchPlaceholder="Search clients..."
        dataOverride={activeClients}
        loadingOverride={fetching}
      />
      <UnifiedPanel
        title="Disabled Clients"
        endpoint={null}
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
          { key: "isActive", label: "Status", render: (item) => item.isActive ? "Active" : "Inactive" },
        ]}
        actions={[
          { label: "Edit", onClick: handleEdit },
          { label: "Enable", onClick: handleEnable, showIf: (item) => !item.isActive },
        ]}
        searchPlaceholder="Search disabled clients..."
        dataOverride={inactiveClients}
        loadingOverride={fetching}
      />
      <EditClientModal
        client={editClient}
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditClient(null); }}
        onSave={handleSave}
        isSuperAdmin={userRole === "SUPERADMIN"}
      />
      {loading && <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"><div className="bg-white p-4 rounded shadow">Processing...</div></div>}
    </>
  );
}