import React, { useState } from "react";

export default function EditClientModal({ client, open, onClose, onSave, isSuperAdmin }) {
  const [form, setForm] = useState({
    name: client?.name || "",
    email: client?.email || "",
    role: client?.role || "CLIENT",
  });
  const [submitting, setSubmitting] = useState(false);

  React.useEffect(() => {
    setForm({
      name: client?.name || "",
      email: client?.email || "",
      role: client?.role || "CLIENT",
    });
  }, [client]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await onSave(form);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form
        className="bg-[#23283a] p-6 rounded shadow w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-lg font-bold mb-4 text-[#e8ff47]">Edit Client</h2>
        <label className="block mb-2 text-[#f0f2f8]">Name
          <input
            className="w-full px-3 py-2 rounded bg-[#181c27] border border-[#2a3045] text-[#f0f2f8]"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>
        <label className="block mb-2 text-[#f0f2f8]">Email
          <input
            className="w-full px-3 py-2 rounded bg-[#181c27] border border-[#2a3045] text-[#f0f2f8]"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            type="email"
          />
        </label>
        <label className="block mb-4 text-[#f0f2f8]">Role
          <select
            className="w-full px-3 py-2 rounded bg-[#181c27] border border-[#2a3045] text-[#f0f2f8]"
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="CLIENT">Client</option>
            <option value="STAFF">Staff</option>
          </select>
        </label>
        {form.role === "STAFF" && !isSuperAdmin && (
          <div className="mb-4 text-[#ffaa33] text-sm">
            This request will be sent to the superadmin for approval.
          </div>
        )}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            className="px-4 py-2 rounded bg-[#7a8499] text-white"
            onClick={onClose}
            disabled={submitting}
          >Cancel</button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-[#e8ff47] text-[#181c27] font-bold"
            disabled={submitting}
          >{submitting ? "Saving..." : "Save"}</button>
        </div>
      </form>
    </div>
  );
}
