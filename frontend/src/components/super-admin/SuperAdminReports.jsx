import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBox,
  FaFileInvoiceDollar,
  FaUsers,
  FaChartBar,
  FaPlane,
  FaShip,
  FaMoneyBillWave,
  FaTruck,
  FaSpinner,
  FaCalendarAlt,
  FaDownload,
} from "react-icons/fa";

const PERIOD_OPTIONS = [
  { key: "day", label: "Today" },
  { key: "week", label: "Last 7 Days" },
  { key: "month", label: "Last 30 Days" },
  { key: "year", label: "Last 12 Months" },
  { key: "custom", label: "Custom Range" },
];

const STATUS_COLORS = {
  "Pickup Requested": "bg-amber-900/40 text-amber-300",
  "Shipment Created": "bg-blue-900/40 text-blue-300",
  "Processing at Origin": "bg-indigo-900/40 text-indigo-300",
  "In Transit": "bg-purple-900/40 text-purple-300",
  "Arrived Nairobi Hub": "bg-teal-900/40 text-teal-300",
  "Dispatched": "bg-orange-900/40 text-orange-300",
  "Delivered": "bg-green-900/40 text-green-300",
  "Cancelled": "bg-red-900/40 text-red-300",
};

export default function SuperAdminReports() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [period, setPeriod] = useState("month");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;
  const BASE_URL = API_URL.replace(/\/accounts\/?$/, "");

  const fetchReports = useCallback(async () => {
    const token = localStorage.getItem("access");
    if (!token) return navigate("/login");

    setLoading(true);
    setError(null);
    try {
      let url = `${BASE_URL}/shipments/admin/reports/?period=${period}`;
      if (period === "custom") {
        if (dateFrom) url += `&date_from=${dateFrom}`;
        if (dateTo) url += `&date_to=${dateTo}`;
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load reports");
      setData(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, period, dateFrom, dateTo, navigate]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const fmt$ = (v) =>
    `$${Number(v || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  /* ── Simple bar for trend charts ── */
  const TrendBar = ({ items, valueKey = "count", labelKey = "day", color = "bg-[#e8ff47]" }) => {
    if (!items || items.length === 0)
      return <p className="text-xs text-[#7a8499] italic py-4">No data for this period.</p>;
    const max = Math.max(...items.map((d) => d[valueKey]), 1);
    return (
      <div className="flex items-end gap-1 h-36 mt-2">
        {items.map((d, i) => {
          const pct = (d[valueKey] / max) * 100;
          const label = typeof d[labelKey] === "string" ? d[labelKey].slice(5) : d[labelKey];
          const displayVal = valueKey === "amount"
            ? `$${Number(d[valueKey]).toFixed(0)}`
            : d[valueKey];
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <span className="text-[10px] text-[#7a8499] font-medium">{displayVal}</span>
              <div
                className={`w-full rounded-t ${color} transition-all`}
                style={{ height: `${Math.max(pct, 4)}%` }}
                title={`${d[labelKey]}: ${d[valueKey]}`}
              />
              <span className="text-[9px] text-[#555b6e] truncate w-full text-center">{label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  /* ── Stat card (dark) ── */
  const StatCard = ({ icon, label, value, sub, accentColor = "text-[#e8ff47]" }) => (
    <div className="bg-[#1a1d27] border border-[#2a3045] rounded-xl p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <span className={accentColor}>{icon}</span>
        <span className="text-xs font-medium text-[#7a8499]">{label}</span>
      </div>
      <span className={`text-2xl font-bold ${accentColor}`}>{value}</span>
      {sub && <span className="text-xs text-[#555b6e] mt-1">{sub}</span>}
    </div>
  );

  /* ── CSV export ── */
  const exportCSV = () => {
    if (!data) return;
    const lines = [
      ["Report", "Super Admin Reports"],
      ["Period", data.period],
      ["From", data.date_range?.from || ""],
      ["To", data.date_range?.to || ""],
      [],
      ["=== SHIPMENTS ==="],
      ["Total Shipments", data.shipments.total],
      ["Delivered", data.shipments.delivered],
      ["Delivery Rate", `${data.shipments.delivery_rate}%`],
      ["Total Weight (kg)", data.shipments.total_weight_kg],
      [],
      ["Status", "Count"],
      ...Object.entries(data.shipments.by_status).map(([k, v]) => [k, v]),
      [],
      ["Transport Mode", "Count"],
      ...Object.entries(data.shipments.by_mode).map(([k, v]) => [k, v]),
      [],
      ...(data.revenue
        ? [
            ["=== REVENUE ==="],
            ["Revenue Collected (USD)", data.revenue.collected],
            ["Outstanding (USD)", data.revenue.outstanding],
            ["Taxable Services (USD)", data.revenue.taxable_services],
            ["VAT Collected (USD)", data.revenue.vat_collected],
            ["Disbursements (USD)", data.revenue.disbursements],
            [],
          ]
        : []),
      ["=== INVOICES ==="],
      ["Total Invoices", data.invoices.total],
      ["Paid", data.invoices.paid_count],
      ["Outstanding", data.invoices.outstanding_count],
      [],
      ["=== TOP CLIENTS ==="],
      ["Name", "Email", "Shipments"],
      ...data.clients.top.map((c) => [c.name, c.email, c.shipment_count]),
    ];
    const csv = lines.map((row) => (Array.isArray(row) ? row.join(",") : row)).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `superadmin-report-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0d0f14] text-[#f0f2f8]">
      {/* Header */}
      <div className="bg-[#1a1d27] border-b border-[#2a3045] px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/super-admin")}
            className="text-[#e8ff47] hover:text-[#d4eb3c] transition"
          >
            <FaArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <FaChartBar className="text-[#e8ff47]" /> Reports & Analytics
            </h1>
            <p className="text-xs text-[#7a8499] mt-0.5">
              Full visibility — shipments, revenue, invoices & clients
            </p>
          </div>
        </div>

        <button
          onClick={exportCSV}
          disabled={!data}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-[#e8ff47] text-[#0d0f14] hover:bg-[#d4eb3c] disabled:opacity-40 transition"
        >
          <FaDownload size={12} /> Export CSV
        </button>
      </div>

      {/* Period Selector */}
      <div className="px-6 pt-5">
        <div className="bg-[#1a1d27] border border-[#2a3045] rounded-xl p-4">
          <div className="flex flex-wrap items-center gap-3">
            <FaCalendarAlt className="text-[#7a8499]" />
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setPeriod(opt.key)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition ${
                  period === opt.key
                    ? "bg-[#e8ff47] text-[#0d0f14]"
                    : "bg-[#2a3045] text-[#7a8499] hover:text-[#f0f2f8] hover:bg-[#333a50]"
                }`}
              >
                {opt.label}
              </button>
            ))}

            {period === "custom" && (
              <div className="flex items-center gap-2 ml-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-[#0d0f14] border border-[#2a3045] text-[#f0f2f8] rounded-lg focus:outline-none focus:border-[#e8ff47]/50"
                />
                <span className="text-[#7a8499] text-xs">to</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-[#0d0f14] border border-[#2a3045] text-[#f0f2f8] rounded-lg focus:outline-none focus:border-[#e8ff47]/50"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <FaSpinner className="animate-spin text-[#e8ff47] mr-3" size={24} />
          <span className="text-[#7a8499]">Loading reports...</span>
        </div>
      )}

      {error && (
        <div className="px-6 pt-4">
          <div className="bg-red-900/30 border border-red-500/40 text-red-400 rounded-lg p-4 text-sm">{error}</div>
        </div>
      )}

      {data && !loading && (
        <>
          {/* ═══ KPI Cards ═══ */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 px-6 pt-5">
            <StatCard
              icon={<FaBox size={16} />}
              label="Shipments"
              value={data.shipments.total}
              sub={`${data.shipments.delivered} delivered`}
              accentColor="text-blue-400"
            />
            <StatCard
              icon={<FaTruck size={16} />}
              label="Delivery Rate"
              value={`${data.shipments.delivery_rate}%`}
              sub={`${data.shipments.total_weight_kg.toLocaleString()} kg shipped`}
              accentColor="text-green-400"
            />
            {data.revenue && (
              <StatCard
                icon={<FaMoneyBillWave size={16} />}
                label="Revenue Collected"
                value={fmt$(data.revenue.collected)}
                sub={`VAT: ${fmt$(data.revenue.vat_collected)}`}
                accentColor="text-[#e8ff47]"
              />
            )}
            {data.revenue && (
              <StatCard
                icon={<FaFileInvoiceDollar size={16} />}
                label="Outstanding"
                value={fmt$(data.revenue.outstanding)}
                sub={`${data.invoices.outstanding_count} invoice${data.invoices.outstanding_count !== 1 ? "s" : ""}`}
                accentColor="text-orange-400"
              />
            )}
            <StatCard
              icon={<FaFileInvoiceDollar size={16} />}
              label="Invoices"
              value={data.invoices.total}
              sub={`${data.invoices.paid_count} paid`}
              accentColor="text-purple-400"
            />
            <StatCard
              icon={<FaUsers size={16} />}
              label="Active Clients"
              value={data.clients.active}
              sub={`of ${data.clients.total} total`}
              accentColor="text-indigo-400"
            />
          </div>

          {/* ═══ Charts Row ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-6 pt-5">
            <div className="bg-[#1a1d27] border border-[#2a3045] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[#f0f2f8] mb-1 flex items-center gap-2">
                <FaBox className="text-blue-400" size={14} /> Shipments Created (Daily)
              </h3>
              <TrendBar items={data.shipments.daily_trend} color="bg-blue-500" />
            </div>

            {data.revenue && (
              <div className="bg-[#1a1d27] border border-[#2a3045] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-[#f0f2f8] mb-1 flex items-center gap-2">
                  <FaMoneyBillWave className="text-[#e8ff47]" size={14} /> Revenue Collected (Daily)
                </h3>
                <TrendBar items={data.revenue.by_day} valueKey="amount" labelKey="day" color="bg-[#e8ff47]" />
              </div>
            )}
          </div>

          {/* ═══ Breakdown Row ═══ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-6 pt-5">
            {/* Shipments by Status */}
            <div className="bg-[#1a1d27] border border-[#2a3045] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[#f0f2f8] mb-3">Shipments by Status</h3>
              {Object.keys(data.shipments.by_status).length === 0 ? (
                <p className="text-xs text-[#7a8499] italic">No shipments in period.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(data.shipments.by_status).map(([status, count]) => {
                    const pct = data.shipments.total ? Math.round((count / data.shipments.total) * 100) : 0;
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_COLORS[status] || "bg-[#2a3045] text-[#7a8499]"}`}>
                            {status}
                          </span>
                          <span className="text-xs text-[#7a8499] font-semibold">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-[#2a3045] rounded-full h-1.5">
                          <div className="bg-[#e8ff47] h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Transport Mode */}
            <div className="bg-[#1a1d27] border border-[#2a3045] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[#f0f2f8] mb-3">Transport Mode</h3>
              {Object.keys(data.shipments.by_mode).length === 0 ? (
                <p className="text-xs text-[#7a8499] italic">No data.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(data.shipments.by_mode).map(([mode, count]) => {
                    const pct = data.shipments.total ? Math.round((count / data.shipments.total) * 100) : 0;
                    return (
                      <div key={mode} className="flex items-center gap-3">
                        {mode === "Air" ? (
                          <FaPlane className="text-blue-400" size={20} />
                        ) : (
                          <FaShip className="text-teal-400" size={20} />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-[#f0f2f8]">{mode} Freight</span>
                            <span className="text-sm font-bold text-[#f0f2f8]">{count}</span>
                          </div>
                          <div className="w-full bg-[#2a3045] rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${mode === "Air" ? "bg-blue-500" : "bg-teal-500"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Invoice Breakdown */}
            <div className="bg-[#1a1d27] border border-[#2a3045] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[#f0f2f8] mb-3">Invoice Breakdown</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#555b6e] font-semibold mb-1.5">By Type</p>
                  <div className="flex gap-3">
                    {Object.entries(data.invoices.by_type).map(([type, count]) => (
                      <div
                        key={type}
                        className={`flex-1 text-center rounded-lg p-3 border ${
                          type === "proforma"
                            ? "bg-amber-900/20 border-amber-700/30"
                            : "bg-emerald-900/20 border-emerald-700/30"
                        }`}
                      >
                        <p className="text-lg font-bold text-[#f0f2f8]">{count}</p>
                        <p className="text-[10px] text-[#7a8499] capitalize">{type}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#555b6e] font-semibold mb-1.5">By Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(data.invoices.by_status).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between bg-[#0d0f14] rounded-lg px-3 py-2">
                        <span className={`w-2 h-2 rounded-full ${
                          status === "paid" ? "bg-green-500"
                            : status === "issued" ? "bg-blue-500"
                            : status === "draft" ? "bg-gray-500"
                            : "bg-red-500"
                        }`} />
                        <span className="text-xs text-[#7a8499] capitalize flex-1 ml-2">{status}</span>
                        <span className="text-xs font-bold text-[#f0f2f8]">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {Object.keys(data.invoices.payment_methods).length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#555b6e] font-semibold mb-1.5">Payment Method</p>
                    <div className="flex gap-3">
                      {Object.entries(data.invoices.payment_methods).map(([method, count]) => (
                        <div key={method} className="flex items-center gap-2 bg-[#0d0f14] rounded-lg px-3 py-2">
                          <span className="text-lg">{method === "cash" ? "💵" : "🏦"}</span>
                          <div>
                            <p className="text-xs font-bold text-[#f0f2f8]">{count}</p>
                            <p className="text-[10px] text-[#7a8499] capitalize">{method}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ═══ Revenue Detail & Pipeline ═══ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 px-6 pt-5">
            {/* Revenue Breakdown (Super Admin exclusive) */}
            {data.revenue && (
              <div className="bg-[#1a1d27] border border-[#2a3045] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-[#f0f2f8] mb-3 flex items-center gap-2">
                  <FaMoneyBillWave className="text-[#e8ff47]" size={14} /> Revenue Breakdown
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Taxable Services", value: data.revenue.taxable_services, color: "bg-blue-500" },
                    { label: "VAT Collected", value: data.revenue.vat_collected, color: "bg-indigo-500" },
                    { label: "Disbursements", value: data.revenue.disbursements, color: "bg-teal-500" },
                  ].map((item) => {
                    const total = data.revenue.collected || 1;
                    const pct = Math.round((item.value / total) * 100);
                    return (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-[#7a8499]">{item.label}</span>
                          <span className="text-xs font-semibold text-[#f0f2f8]">{fmt$(item.value)}</span>
                        </div>
                        <div className="w-full bg-[#2a3045] rounded-full h-2">
                          <div className={`${item.color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}

                  <div className="border-t border-[#2a3045] pt-3 mt-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold text-[#f0f2f8]">Total Collected</span>
                      <span className="text-sm font-bold text-[#e8ff47]">{fmt$(data.revenue.collected)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-[#7a8499]">Outstanding</span>
                      <span className="text-xs font-semibold text-orange-400">{fmt$(data.revenue.outstanding)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pipeline Snapshot */}
            <div className="bg-[#1a1d27] border border-[#2a3045] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[#f0f2f8] mb-3 flex items-center gap-2">
                <FaTruck className="text-indigo-400" size={14} /> Current Pipeline
              </h3>
              {Object.keys(data.pipeline).length === 0 ? (
                <p className="text-xs text-[#7a8499] italic">No shipments in pipeline.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(data.pipeline).map(([status, count]) => {
                    const totalPipeline = Object.values(data.pipeline).reduce((a, b) => a + b, 0);
                    const pct = totalPipeline ? Math.round((count / totalPipeline) * 100) : 0;
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded whitespace-nowrap ${STATUS_COLORS[status] || "bg-[#2a3045] text-[#7a8499]"}`}>
                          {status}
                        </span>
                        <div className="flex-1 bg-[#2a3045] rounded-full h-2">
                          <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-bold text-[#f0f2f8] w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                  <div className="border-t border-[#2a3045] pt-2 mt-2 flex justify-between">
                    <span className="text-xs font-semibold text-[#7a8499]">Total in Pipeline</span>
                    <span className="text-sm font-bold text-indigo-400">
                      {Object.values(data.pipeline).reduce((a, b) => a + b, 0)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══ Top Clients ═══ */}
          <div className="px-6 pt-5 pb-8">
            <div className="bg-[#1a1d27] border border-[#2a3045] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-[#f0f2f8] mb-3 flex items-center gap-2">
                <FaUsers className="text-indigo-400" size={14} /> Top Clients (by Shipment Volume)
              </h3>
              {data.clients.top.length === 0 ? (
                <p className="text-xs text-[#7a8499] italic">No client activity in this period.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-[#555b6e] uppercase tracking-wider border-b border-[#2a3045]">
                        <th className="pb-2 pr-4">#</th>
                        <th className="pb-2 pr-4">Client</th>
                        <th className="pb-2 pr-4">Email</th>
                        <th className="pb-2 text-right">Shipments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.clients.top.map((client, i) => (
                        <tr key={client.id} className="border-b border-[#2a3045]/50 hover:bg-[#2a3045]/30 transition">
                          <td className="py-2.5 pr-4 font-semibold text-[#555b6e]">{i + 1}</td>
                          <td className="py-2.5 pr-4 font-medium text-[#f0f2f8]">{client.name}</td>
                          <td className="py-2.5 pr-4 text-[#7a8499]">{client.email}</td>
                          <td className="py-2.5 text-right">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e8ff47]/10 text-[#e8ff47] text-xs font-bold">
                              <FaBox size={10} /> {client.shipment_count}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
