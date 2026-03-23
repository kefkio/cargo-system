import React, { useState } from "react";

export default function EditStaffModal({ staff, open, onClose, onSave }) {
  const [form, setForm] = useState({
    name: staff?.name || "",
    email: staff?.email || "",
    role: staff?.role || "STAFF",
    isActive: staff?.isActive ?? true,
  });

  React.useEffect(() => {
    setForm({
      name: staff?.name || "",
      email: staff?.email || "",
      role: staff?.role || "STAFF",
      isActive: staff?.isActive ?? true,
    });
  }, [staff]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4 text-gray-900">Edit Staff</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSave(form);
          }}
        >
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1 text-gray-900">Name</label>
            <input
              className="w-full border px-3 py-2 rounded text-gray-900 bg-gray-100 placeholder-gray-500"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1 text-gray-900">Email</label>
            <input
              className="w-full border px-3 py-2 rounded text-gray-900 bg-gray-100 placeholder-gray-500"
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1 text-gray-900">Role</label>
            <select
              className="w-full border px-3 py-2 rounded text-gray-900 bg-gray-100"
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
            >
              <option value="STAFF">Staff</option>
              <option value="CARGOADMIN">Cargo Admin</option>
              <option value="CLIENTADMIN">Client Admin</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="inline-flex items-center text-gray-900">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
              />
              <span className="ml-2">Active</span>
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-900"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
