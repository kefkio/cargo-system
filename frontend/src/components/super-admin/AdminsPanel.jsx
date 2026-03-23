// src/components/super-admin/AdminsPanel.jsx
import React from "react";

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
  if (!data.length) return <div className="text-[#7a8499]">No admins found.</div>;

  return (
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
  );
}