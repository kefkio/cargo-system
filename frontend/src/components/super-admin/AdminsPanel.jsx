// src/components/super-admin/AdminsPanel.jsx
import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { createSuperAdmin } from "../../api/api";

// ─── Constants ───────────────────────────────────────────────
const ROLE_STYLES = {
  "super admin": { bg: "rgba(232,255,71,0.1)",  color: "#e8ff47", border: "rgba(232,255,71,0.25)" },
  admin:         { bg: "rgba(74,184,255,0.1)",  color: "#4ab8ff", border: "rgba(74,184,255,0.25)" },
  manager:       { bg: "rgba(74,240,196,0.1)",  color: "#4af0c4", border: "rgba(74,240,196,0.25)" },
  viewer:        { bg: "rgba(122,132,153,0.12)", color: "#7a8499", border: "rgba(122,132,153,0.25)" },
};

const STATUS_STYLES = {
  active:    { color: "#4af0c4", bg: "rgba(74,240,196,0.15)" },
  inactive:  { color: "#7a8499", bg: "rgba(122,132,153,0.12)" },
  suspended: { color: "#ff5c5c", bg: "rgba(255,92,92,0.15)" },
};

const AV_COLORS = [
  { bg: "rgba(74,184,255,0.15)",  color: "#4ab8ff" },
  { bg: "rgba(74,240,196,0.15)", color: "#4af0c4" },
  { bg: "rgba(255,170,51,0.15)", color: "#ffaa33" },
  { bg: "rgba(232,255,71,0.15)", color: "#e8ff47" },
];

// ─── Sub-components ─────────────────────────────────────────
function Avatar({ name, index }) {
  const color = AV_COLORS[index % AV_COLORS.length];
  const initials = name
    .split(" ")
    .map(n => n[0]?.toUpperCase())
    .join("");
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs"
      style={{ background: color.bg, color: color.color }}
    >
      {initials}
    </div>
  );
}

function RoleBadge({ role }) {
  const style = ROLE_STYLES[role.toLowerCase()] || ROLE_STYLES.viewer;
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold"
      style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}
    >
      {role.toUpperCase()}
    </span>
  );
}

function StatusPill({ status }) {
  const style = STATUS_STYLES[status.toLowerCase()] || STATUS_STYLES.inactive;
  return (
    <span
      className="px-2 py-0.5 rounded-full text-xs font-mono font-semibold"
      style={{ background: style.bg, color: style.color }}
    >
      {status.toUpperCase()}
    </span>
  );
}

// ─── Main Component ─────────────────────────────────────────
export default function AdminsPanel({ data = [] }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirm_password: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await createSuperAdmin(form);
      setSuccess("SuperAdmin created successfully.");
      setForm({ first_name: "", last_name: "", email: "", phone_number: "", password: "", confirm_password: "" });
    } catch (err) {
      setError(err.message || "Failed to create SuperAdmin.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-[#e8ff47]">Admins</h2>
        <button
          className="px-4 py-2 bg-[#e8ff47] text-[#0d0f14] rounded font-semibold hover:bg-[#faffb8] transition"
          onClick={() => setShowModal(true)}
        >
          + Add SuperAdmin
        </button>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[#1a1d27] border border-[#2a3045] rounded-xl p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-[#7a8499] hover:text-[#e8ff47] text-xl"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-xl font-bold text-[#e8ff47] mb-4">Add SuperAdmin</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="First Name"
                className="w-full px-4 py-2 rounded bg-[#0d0f14] border border-[#2a3045] text-[#f0f2f8]"
                required
              />
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Last Name"
                className="w-full px-4 py-2 rounded bg-[#0d0f14] border border-[#2a3045] text-[#f0f2f8]"
                required
              />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full px-4 py-2 rounded bg-[#0d0f14] border border-[#2a3045] text-[#f0f2f8]"
                required
              />
              <input
                type="text"
                name="phone_number"
                value={form.phone_number}
                onChange={handleChange}
                placeholder="Phone Number (optional)"
                className="w-full px-4 py-2 rounded bg-[#0d0f14] border border-[#2a3045] text-[#f0f2f8]"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder={showPassword ? "Password (visible)" : "Password (hidden)"}
                  className="w-full px-4 py-2 rounded bg-[#0d0f14] border border-[#2a3045] text-[#f0f2f8] pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a8499] hover:text-[#e8ff47]"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirm_password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder={showConfirm ? "Confirm Password (visible)" : "Confirm Password (hidden)"}
                  className="w-full px-4 py-2 rounded bg-[#0d0f14] border border-[#2a3045] text-[#f0f2f8] pr-10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7a8499] hover:text-[#e8ff47]"
                  tabIndex={-1}
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {error && <div className="text-red-400 text-sm">{error}</div>}
              {success && <div className="text-green-400 text-sm">{success}</div>}
              <button
                type="submit"
                className="w-full py-2 rounded bg-[#e8ff47] text-[#0d0f14] font-bold hover:bg-[#faffb8] transition disabled:opacity-60"
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create SuperAdmin"}
              </button>
            </form>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="text-[#7a8499] text-xs font-mono uppercase tracking-wider border-b border-[#2a3045]">
              <th className="px-4 py-2">User</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Region</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {data.map((admin, i) => (
              <tr key={i} className="hover:bg-[#1e2330]">
                <td className="px-4 py-2 flex items-center gap-2">
                  <Avatar name={admin.name} index={i} />
                  <div>
                    <div className="text-sm font-medium text-[#f0f2f8]">{admin.name}</div>
                    <div className="text-xs text-[#7a8499]">{admin.sub || ""}</div>
                  </div>
                </td>
                <td className="px-4 py-2 text-xs text-[#7a8499]">{admin.email}</td>
                <td className="px-4 py-2"><RoleBadge role={admin.role} /></td>
                <td className="px-4 py-2 text-xs text-[#7a8499]">{admin.region || "-"}</td>
                <td className="px-4 py-2"><StatusPill status={admin.status} /></td>
                <td className="px-4 py-2 text-xs text-[#7a8499]">{admin.joined || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}