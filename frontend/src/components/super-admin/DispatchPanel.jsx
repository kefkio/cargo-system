// src/components/super-admin/DispatchPanel.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";

const STATUS_BADGE = {
  "Arrived Nairobi Hub": "bg-teal-900/40 text-teal-300 border-teal-700/30",
  "Dispatched":          "bg-orange-900/40 text-orange-300 border-orange-700/30",
  "Delivered":           "bg-green-900/40 text-green-300 border-green-700/30",
};

export default function DispatchPanel({ search = "" }) {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("ready"); // ready | dispatched | delivered

  const API_URL = import.meta.env.VITE_API_URL.replace(/\/accounts\/?$/, "");
  const token = localStorage.getItem("access");

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/shipments/admin/pipeline/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch pipeline shipments");
      const pipeline = await res.json();

      // Also fetch recent shipments to include delivered ones
      const recentRes = await fetch(`${API_URL}/shipments/admin/recent-shipments/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      let recent = [];
      if (recentRes.ok) {
        recent = await recentRes.json();
      }

      // Merge: pipeline has active, recent may have delivered
      const pipelineArr = Array.isArray(pipeline) ? pipeline : pipeline.results || [];
      const recentArr = Array.isArray(recent) ? recent : recent.results || [];
      const ids = new Set(pipelineArr.map((s) => s.id));
      const delivered = recentArr.filter((s) => s.status === "Delivered" && !ids.has(s.id));
      setShipments([...pipelineArr, ...delivered]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const ready = useMemo(
    () => shipments.filter((s) => s.status === "Arrived Nairobi Hub"),
    [shipments]
  );
  const dispatched = useMemo(
    () => shipments.filter((s) => s.status === "Dispatched"),
    [shipments]
  );
  const delivered = useMemo(
    () => shipments.filter((s) => s.status === "Delivered"),
    [shipments]
  );

  const totalDispatchCost = useMemo(
    () =>
      shipments
        .filter((s) => s.status === "Dispatched" || s.status === "Delivered")
        .reduce((sum, s) => sum + parseFloat(s.dispatch_cost || 0), 0),
    [shipments]
  );

  const activeList =
    tab === "ready" ? ready : tab === "dispatched" ? dispatched : delivered;

  const filtered = useMemo(() => {
    if (!search.trim()) return activeList;
    const q = search.toLowerCase();
    return activeList.filter(
      (s) =>
        (s.tracking_number || "").toLowerCase().includes(q) ||
        (s.client_name || "").toLowerCase().includes(q) ||
        (s.dest_contact_person || "").toLowerCase().includes(q) ||
        (s.dispatcher_name || "").toLowerCase().includes(q) ||
        (s.dispatcher_phone || "").toLowerCase().includes(q) ||
        (s.dispatcher_service || "").toLowerCase().includes(q)
    );
  }, [activeList, search]);

  if (loading)
    return <p className="text-[#7a8499] py-4">Loading dispatch data...</p>;
  if (error) return <p className="text-red-400 py-4">{error}</p>;

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {[
          { key: "ready", label: "Ready for Dispatch", count: ready.length, color: "text-teal-400" },
          { key: "dispatched", label: "Dispatched", count: dispatched.length, color: "text-orange-400" },
          { key: "delivered", label: "Delivered", count: delivered.length, color: "text-green-400" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`rounded-lg p-3 text-center border transition ${
              tab === item.key
                ? "bg-[#e8ff47]/10 border-[#e8ff47]/40"
                : "bg-[#0d0f14] border-[#2a3045] hover:border-[#3a4055]"
            }`}
          >
            <p className={`text-xl font-bold ${item.color}`}>{item.count}</p>
            <p className="text-[10px] text-[#7a8499] mt-0.5">{item.label}</p>
          </button>
        ))}
        <div className="rounded-lg p-3 text-center border bg-[#0d0f14] border-[#2a3045]">
          <p className="text-xl font-bold text-[#e8ff47]">
            KES {totalDispatchCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] text-[#7a8499] mt-0.5">Total Dispatch Costs</p>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <p className="text-[#7a8499] text-sm italic py-6 text-center">
          {search
            ? "No shipments match your search."
            : tab === "ready"
            ? "No shipments awaiting dispatch."
            : tab === "dispatched"
            ? "No dispatched shipments in pipeline."
            : "No delivered shipments found."}
        </p>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => {
            const badge = STATUS_BADGE[s.status] || "bg-[#2a3045] text-[#7a8499]";
            return (
              <div
                key={s.id}
                className="bg-[#0d0f14] border border-[#2a3045] rounded-lg p-3 hover:border-[#3a4055] transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  {/* Status */}
                  <span className={`inline-block self-start px-2.5 py-0.5 text-[10px] font-semibold rounded border ${badge}`}>
                    {s.status}
                  </span>

                  {/* Tracking & client */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5">
                      <span className="text-sm font-semibold text-[#f0f2f8]">
                        {s.tracking_number}
                      </span>
                      {s.client_name && (
                        <span className="text-xs text-[#7a8499]">
                          Client: {s.client_name}
                        </span>
                      )}
                      {s.weight_kg && (
                        <span className="text-xs text-[#7a8499]">
                          {s.weight_kg}kg
                        </span>
                      )}
                      {s.transport_mode && (
                        <span className="text-xs text-[#7a8499]">
                          {s.transport_mode === "Air" ? "✈️" : "🚢"} {s.transport_mode}
                        </span>
                      )}
                    </div>

                    {/* Delivery contact */}
                    {s.dest_contact_person && (
                      <p className="text-xs text-[#555b6e] mt-0.5">
                        📍 {s.dest_contact_person}
                        {s.dest_contact_phone && ` — ${s.dest_contact_phone}`}
                        {s.destination_name && ` · ${s.destination_name}`}
                      </p>
                    )}

                    {/* Dispatcher info */}
                    {s.dispatcher_name && (
                      <p className="text-xs mt-0.5">
                        <span className="text-orange-400 font-medium">
                          🚚 {s.dispatcher_service}
                        </span>
                        <span className="text-[#7a8499]"> — {s.dispatcher_name}</span>
                        {s.dispatcher_phone && (
                          <span className="text-[#7a8499]"> · 📞 {s.dispatcher_phone}</span>
                        )}
                        {parseFloat(s.dispatch_cost || 0) > 0 && (
                          <span className="text-[#e8ff47] ml-2 font-medium">
                            · KES {parseFloat(s.dispatch_cost).toLocaleString()}
                          </span>
                        )}
                      </p>
                    )}

                    {/* Timestamps */}
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-0.5">
                      {s.dispatched_datetime && (
                        <span className="text-[10px] text-[#555b6e]">
                          Dispatched: {new Date(s.dispatched_datetime).toLocaleString()}
                        </span>
                      )}
                      {s.delivered_datetime && (
                        <span className="text-[10px] text-[#555b6e]">
                          Delivered: {new Date(s.delivered_datetime).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
