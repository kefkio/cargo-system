// src/components/super-admin/StaffPanel.jsx


import React, { useState, useEffect } from "react";
import UnifiedPanel from "./UnifiedPanel";
import EditStaffModal from "./EditStaffModal";
import axios from "axios";
import { registerUser } from "../../api/api";
import { toast } from "react-toastify";



export default function StaffPanel() {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "STAFF"
  });
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
        `${API_URL}/staff/${staff.id}/`,
        { isActive: false },
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
        `${API_URL}/staff/${staff.id}/`,
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
      {/* Add New Staff Button (Superadmin only) */}
      <div className="flex justify-end mb-2">
        <button
          className="bg-[#e8ff47] text-[#181c27] px-4 py-2 rounded font-bold"
          onClick={() => setAddModalOpen(true)}
        >
          + Add New Staff
        </button>
      </div>
            {/* Add Staff Modal */}
            {addModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <h2 className="text-lg font-bold mb-4 text-gray-900">Add New Staff</h2>
                  <form
                    onSubmit={async e => {
                      e.preventDefault();
                      try {
                        const [first_name, ...rest] = addForm.name.split(" ");
                        const last_name = rest.join(" ");
                        await registerUser({
                          first_name,
                          last_name,
                          email: addForm.email,
                          password: addForm.password,
                          confirm_password: addForm.confirm_password,
                          role: addForm.role
                        });
                        toast.success("Staff user created successfully!");
                        setAddModalOpen(false);
                        setAddForm({ name: "", email: "", password: "", confirm_password: "", role: "STAFF" });
                        setRefreshKey(k => k + 1);
                      } catch (err) {
                        toast.error("Failed to create staff: " + (err?.response?.data?.error || err.message));
                      }
                    }}
                  >
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1 text-gray-900">Name</label>
                      <input
                        className="w-full border px-3 py-2 rounded text-gray-900 bg-gray-100 placeholder-gray-500"
                        value={addForm.name}
                        onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1 text-gray-900">Email</label>
                      <input
                        className="w-full border px-3 py-2 rounded text-gray-900 bg-gray-100 placeholder-gray-500"
                        type="email"
                        value={addForm.email}
                        onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1 text-gray-900">Password</label>
                      <input
                        className="w-full border px-3 py-2 rounded text-gray-900 bg-gray-100 placeholder-gray-500"
                        type="password"
                        value={addForm.password}
                        onChange={e => setAddForm(f => ({ ...f, password: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1 text-gray-900">Confirm Password</label>
                      <input
                        className="w-full border px-3 py-2 rounded text-gray-900 bg-gray-100 placeholder-gray-500"
                        type="password"
                        value={addForm.confirm_password}
                        onChange={e => setAddForm(f => ({ ...f, confirm_password: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1 text-gray-900">Role</label>
                      <select
                        className="w-full border px-3 py-2 rounded text-gray-900 bg-gray-100"
                        value={addForm.role}
                        onChange={e => setAddForm(f => ({ ...f, role: e.target.value }))}
                      >
                        <option value="STAFF">Staff</option>
                        <option value="CARGOADMIN">Cargo Admin</option>
                        <option value="CLIENTADMIN">Client Admin</option>
                      </select>
                    </div>
                    <div className="flex gap-2 justify-end mt-4">
                      <button
                        type="button"
                        className="px-4 py-2 rounded bg-gray-300 text-gray-900"
                        onClick={() => setAddModalOpen(false)}
                      >Cancel</button>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded bg-blue-600 text-white font-bold"
                      >Add</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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