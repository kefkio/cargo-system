// src/components/super-admin/DispatchPanel.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";

// ✅ All badge styles in one place — no inline classes scattered in JSX
const STATUS_BADGE = {
  "Arrived Nairobi Hub": "badge-teal",
  "Dispatched":          "badge-orange",
  "Delivered":           "badge-green",
};

const TAB_CONFIG = [
  { key: "ready",      label: "Ready for Dispatch", color: "text-teal-400"   },
  { key: "dispatched", label: "Dispatched",          color: "text-orange-400" },
  { key: "delivered",  label: "Delivered",           color: "text-green-400"  },
];

export default function DispatchPanel({ search = "" }) {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [tab, setTab]             = useState("ready");

  const API_URL = import.meta.env.VITE_API_URL.replace(/\/accounts\/?$/, "");
  const token   = localStorage.getItem("access");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [pipelineRes, recentRes] = await Promise.all([
        fetch(`${API_URL}/shipments/admin/pipeline/`,         { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/shipments/admin/recent-shipments/`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (!pipelineRes.ok) throw new Error("Failed to fetch pipeline shipments");

      const pipeline  = await pipelineRes.json();
      const recent    = recentRes.ok ? await recentRes.json() : [];

      const pipelineArr = Array.isArray(pipeline) ? pipeline : pipeline.results || [];
      const recentArr   = Array.isArray(recent)   ? recent   : recent.results   || [];
      const ids         = new Set(pipelineArr.map((s) => s.id));
      const delivered   = recentArr.filter((s) => s.status === "Delivered" && !ids.has(s.id));

      setShipments([...pipelineArr, ...delivered]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const ready      = useMemo(() => shipments.filter((s) => s.status === "Arrived Nairobi Hub"), [shipments]);
  const dispatched = useMemo(() => shipments.filter((s) => s.status === "Dispatched"),          [shipments]);
  const delivered  = useMemo(() => shipments.filter((s) => s.status === "Delivered"),           [shipments]);

  const totalDispatchCost = useMemo(() =>
    shipments
      .filter((s) => s.status === "Dispatched" || s.status === "Delivered")
      .reduce((sum, s) => sum + parseFloat(s.dispatch_cost || 0), 0),
    [shipments]
  );

  const listMap   = { ready, dispatched, delivered };
  const activeList = listMap[tab] || [];

  const filtered = useMemo(() => {
    if (!search.trim()) return activeList;
    const q = search.toLowerCase();
    return activeList.filter((s) =>
      [s.tracking_number, s.client_name, s.dest_contact_person,
       s.dispatcher_name, s.dispatcher_phone, s.dispatcher_service]
        .some((val) => (val || "").toLowerCase().includes(q))
    );
  }, [activeList, search]);

  // ─── Empty state message ────────────────────────────────────────────────────
  const emptyMessage = search
    ? "No shipments match your search."
    : { ready: "No shipments awaiting dispatch.",
        dispatched: "No dispatched shipments in pipeline.",
        delivered:  "No delivered shipments found." }[tab];

  if (loading) return <p className="dispatch-loading">Loading dispatch data...</p>;
  if (error)   return <p className="dispatch-error">{error}</p>;

  return (
    <div className="dispatch-panel">

      {/* ── Summary Tabs ───────────────────────────────────────────────────── */}
      <div className="dispatch-summary-grid">
        {TAB_CONFIG.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`dispatch-tab ${tab === key ? "dispatch-tab--active" : ""}`}
          >
            <p className={`dispatch-tab-count ${color}`}>
              {listMap[key].length}
            </p>
            <p className="dispatch-tab-label">{label}</p>
          </button>
        ))}

        {/* Cost Card */}
        <div className="dispatch-cost-card">
          <p className="dispatch-cost-value">
            KES {totalDispatchCost.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </p>
          <p className="dispatch-tab-label">Total Dispatch Costs</p>
        </div>
      </div>

      {/* ── Shipment List ──────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <p className="dispatch-empty">{emptyMessage}</p>
      ) : (
        <div className="dispatch-list">
          {filtered.map((s) => (
            <ShipmentCard key={s.id} shipment={s} />
          ))}
        </div>
      )}
    </div>
  );
}

// ✅ Extracted into its own component — cleaner JSX, easier to maintain
function ShipmentCard({ shipment: s }) {
  const badgeClass = STATUS_BADGE[s.status] || "badge-default";
  const dispatchCost = parseFloat(s.dispatch_cost || 0);

  return (
    <div className="shipment-card">
      <div className="shipment-card-inner">

        {/* Status Badge */}
        <span className={`status-badge ${badgeClass}`}>{s.status}</span>

        {/* Main Info */}
        <div className="shipment-info">

          {/* Row 1: Tracking + meta */}
          <div className="shipment-meta-row">
            <span className="shipment-tracking">{s.tracking_number}</span>
            {s.client_name    && <MetaTag label="Client" value={s.client_name} />}
            {s.weight_kg      && <MetaTag value={`${s.weight_kg}kg`} />}
            {s.transport_mode && (
              <MetaTag value={`${s.transport_mode === "Air" ? "✈️" : "🚢"} ${s.transport_mode}`} />
            )}
          </div>

          {/* Row 2: Delivery contact */}
          {s.dest_contact_person && (
            <p className="shipment-contact">
              📍 {s.dest_contact_person}
              {s.dest_contact_phone && ` — ${s.dest_contact_phone}`}
              {s.destination_name   && ` · ${s.destination_name}`}
            </p>
          )}

          {/* Row 3: Dispatcher */}
          {s.dispatcher_name && (
            <p className="shipment-dispatcher">
              <span className="dispatcher-service">🚚 {s.dispatcher_service}</span>
              <span className="dispatcher-meta"> — {s.dispatcher_name}</span>
              {s.dispatcher_phone && (
                <span className="dispatcher-meta"> · 📞 {s.dispatcher_phone}</span>
              )}
              {dispatchCost > 0 && (
                <span className="dispatcher-cost">
                  {" "}· KES {dispatchCost.toLocaleString()}
                </span>
              )}
            </p>
          )}

          {/* Row 4: Timestamps */}
          <div className="shipment-timestamps">
            {s.dispatched_datetime && (
              <TimeStamp label="Dispatched" value={s.dispatched_datetime} />
            )}
            {s.delivered_datetime && (
              <TimeStamp label="Delivered" value={s.delivered_datetime} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Small reusable helpers ────────────────────────────────────────────────────
function MetaTag({ label, value }) {
  return (
    <span className="meta-tag">
      {label ? `${label}: ${value}` : value}
    </span>
  );
}

function TimeStamp({ label, value }) {
  return (
    <span className="timestamp">
      {label}: {new Date(value).toLocaleString()}
    </span>
  );
}