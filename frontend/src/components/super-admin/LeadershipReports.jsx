// src/components/super-admin/LeadershipReports.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  FaBox, FaFileInvoiceDollar, FaUsers, FaChartBar, FaPlane, FaShip,
  FaMoneyBillWave, FaTruck, FaSpinner, FaCalendarAlt, FaDownload,
  FaArrowUp, FaArrowDown, FaExclamationTriangle, FaCheckCircle,
  FaChartLine, FaPercent, FaWeightHanging, FaClock,
} from "react-icons/fa";

const PERIOD_OPTIONS = [
  { key: "day", label: "Today" },
  { key: "week", label: "7 Days" },
  { key: "month", label: "30 Days" },
  { key: "year", label: "12 Months" },
  { key: "custom", label: "Custom" },
];

const STATUS_COLORS = {
  "Pickup Requested": "bg-amber-900/40 text-amber-300",
  "Shipment Created": "bg-blue-900/40 text-blue-300",
  "Processing at Origin": "bg-indigo-900/40 text-indigo-300",
  "In Transit": "bg-purple-900/40 text-purple-300",
  "Arrived Nairobi Hub": "bg-teal-900/40 text-teal-300",
  Dispatched: "bg-orange-900/40 text-orange-300",
  Delivered: "bg-green-900/40 text-green-300",
  Cancelled: "bg-red-900/40 text-red-300",
};

const STATUS_DOT = {
  "Pickup Requested": "bg-amber-400",
  "Shipment Created": "bg-blue-400",
  "Processing at Origin": "bg-indigo-400",
  "In Transit": "bg-purple-400",
  "Arrived Nairobi Hub": "bg-teal-400",
  Dispatched: "bg-orange-400",
  Delivered: "bg-green-400",
  Cancelled: "bg-red-400",
};

export default function LeadershipReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState("month");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [activeSection, setActiveSection] = useState("overview"); // overview | revenue | operations | clients

  const API_URL = import.meta.env.VITE_API_URL;
  const BASE_URL = API_URL.replace(/\/accounts\/?$/, "");

  const fetchReports = useCallback(async () => {
    const token = localStorage.getItem("access");
    if (!token) return;
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
  }, [BASE_URL, period, dateFrom, dateTo]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const fmt$ = (v) =>
    `$${Number(v || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  const fmtK = (v) => {
    const n = Number(v || 0);
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`;
    return fmt$(n);
  };
  const fmtNum = (v) => Number(v || 0).toLocaleString();

  // CSV export
  const exportCSV = () => {
    if (!data) return;
    const lines = [
      ["Report", "Leadership Summary"],
      ["Period", data.period],
      ["From", data.date_range?.from || ""],
      ["To", data.date_range?.to || ""],
      [],
      ["SHIPMENTS"],
      ["Total", data.shipments.total],
      ["Delivered", data.shipments.delivered],
      ["Delivery Rate", `${data.shipments.delivery_rate}%`],
      ["Total Weight (kg)", data.shipments.total_weight_kg],
      [],
      ["Status", "Count"],
      ...Object.entries(data.shipments.by_status || {}).map(([k, v]) => [k, v]),
      [],
      ["Transport", "Count"],
      ...Object.entries(data.shipments.by_mode || {}).map(([k, v]) => [k, v]),
    ];
    if (data.revenue) {
      lines.push(
        [],
        ["REVENUE"],
        ["Collected", data.revenue.collected],
        ["Outstanding", data.revenue.outstanding],
        ["Taxable Services", data.revenue.taxable_services],
        ["VAT Collected", data.revenue.vat_collected],
        ["Disbursements", data.revenue.disbursements]
      );
    }
    lines.push(
      [],
      ["INVOICES"],
      ["Total", data.invoices.total],
      ["Paid", data.invoices.paid_count],
      ["Outstanding", data.invoices.outstanding_count],
      [],
      ["TOP CLIENTS"],
      ["Name", "Email", "Shipments"],
      ...(data.clients.top || []).map((c) => [c.name, c.email, c.shipment_count])
    );
    const csv = lines
      .map((row) => (Array.isArray(row) ? row.join(",") : row))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leadership-report-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Sparkline mini bars
  const Sparkline = ({ items, valueKey = "count", color = "#e8ff47" }) => {
    if (!items || items.length === 0) return null;
    const max = Math.max(...items.map((d) => d[valueKey] || 0), 1);
    return (
      <div className="flex items-end gap-[2px] h-8">
        {items.slice(-14).map((d, i) => {
          const pct = ((d[valueKey] || 0) / max) * 100;
          return (
            <div
              key={i}
              className="flex-1 rounded-t-sm min-w-[3px] transition-all"
              style={{ height: `${Math.max(pct, 6)}%`, backgroundColor: color }}
            />
          );
        })}
      </div>
    );
  };

  // Donut ring SVG
  const DonutChart = ({ segments, size = 120 }) => {
    const total = segments.reduce((a, b) => a + b.value, 0) || 1;
    const strokeWidth = 14;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    return (
      <svg width={size} height={size} className="transform -rotate-90">
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dash = pct * circumference;
          const gap = circumference - dash;
          const currentOffset = offset;
          offset += dash;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-currentOffset}
              strokeLinecap="round"
              className="transition-all duration-700"
            />
          );
        })}
      </svg>
    );
  };

  // Full-width bar chart
  const BarChart = ({
    items,
    valueKey = "count",
    labelKey = "day",
    color = "#e8ff47",
    height = 160,
    formatValue,
  }) => {
    if (!items || items.length === 0)
      return (
        <p className="text-xs text-[#7a8499] italic py-6 text-center">
          No data for this period.
        </p>
      );
    const max = Math.max(...items.map((d) => d[valueKey] || 0), 1);
    return (
      <div className="flex items-end gap-[3px]" style={{ height }}>
        {items.map((d, i) => {
          const val = d[valueKey] || 0;
          const pct = (val / max) * 100;
          const label =
            typeof d[labelKey] === "string"
              ? d[labelKey].slice(5)
              : d[labelKey];
          const displayVal = formatValue
            ? formatValue(val)
            : val.toLocaleString();
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1 min-w-0 group relative"
            >
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0d0f14] border border-[#2a3045] text-[#f0f2f8] text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                {displayVal}
              </div>
              <div
                className="w-full rounded-t transition-all duration-500 group-hover:opacity-80"
                style={{
                  height: `${Math.max(pct, 3)}%`,
                  backgroundColor: color,
                }}
              />
              <span className="text-[8px] text-[#555b6e] truncate w-full text-center leading-none">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // Section tab buttons
  const SECTIONS = [
    { key: "overview", label: "Overview", icon: <FaChartBar size={12} /> },
    { key: "revenue", label: "Revenue", icon: <FaMoneyBillWave size={12} /> },
    { key: "operations", label: "Operations", icon: <FaTruck size={12} /> },
    { key: "clients", label: "Clients", icon: <FaUsers size={12} /> },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <FaSpinner className="animate-spin text-[#e8ff47] mr-3" size={20} />
        <span className="text-[#7a8499] text-sm">Loading reports...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 text-red-400 rounded-lg p-4 text-sm">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const s = data.shipments;
  const inv = data.invoices;
  const rev = data.revenue;
  const pipe = data.pipeline;
  const cli = data.clients;

  const totalPipeline = Object.values(pipe || {}).reduce((a, b) => a + b, 0);
  const collectionRate =
    rev && rev.collected + rev.outstanding > 0
      ? Math.round(
          (rev.collected / (rev.collected + rev.outstanding)) * 100
        )
      : 0;

  return (
    <div className="space-y-5">
      {/* ── Header Row: Period + Export ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <FaCalendarAlt className="text-[#7a8499]" size={12} />
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setPeriod(opt.key)}
              className={`px-3 py-1 text-[11px] font-semibold rounded-full transition ${
                period === opt.key
                  ? "bg-[#e8ff47] text-[#0d0f14]"
                  : "bg-[#0d0f14] text-[#7a8499] border border-[#2a3045] hover:text-[#f0f2f8]"
              }`}
            >
              {opt.label}
            </button>
          ))}
          {period === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-2 py-1 text-[11px] bg-[#0d0f14] border border-[#2a3045] text-[#f0f2f8] rounded focus:outline-none focus:border-[#e8ff47]/50"
              />
              <span className="text-[#555b6e] text-[11px]">→</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-2 py-1 text-[11px] bg-[#0d0f14] border border-[#2a3045] text-[#f0f2f8] rounded focus:outline-none focus:border-[#e8ff47]/50"
              />
            </div>
          )}
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded bg-[#e8ff47] text-[#0d0f14] hover:bg-[#d4eb3c] transition"
        >
          <FaDownload size={10} /> Export CSV
        </button>
      </div>

      {/* ── Section Tabs ── */}
      <div className="flex gap-1 bg-[#0d0f14] rounded-lg p-1">
        {SECTIONS.map((sec) => (
          <button
            key={sec.key}
            onClick={() => setActiveSection(sec.key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md transition flex-1 justify-center ${
              activeSection === sec.key
                ? "bg-[#e8ff47] text-[#0d0f14]"
                : "text-[#7a8499] hover:text-[#f0f2f8] hover:bg-[#1a1d27]"
            }`}
          >
            {sec.icon} {sec.label}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════
           SECTION: OVERVIEW — Executive summary
         ═══════════════════════════════════════════════════════════ */}
      {activeSection === "overview" && (
        <>
          {/* KPI Hero Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Shipments */}
            <div className="bg-[#0d0f14] border border-[#2a3045] rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <FaBox className="text-blue-400" size={14} />
                  </div>
                  <span className="text-[11px] font-medium text-[#7a8499]">
                    Shipments
                  </span>
                </div>
              </div>
              <p className="text-3xl font-bold text-blue-400 tracking-tight">
                {fmtNum(s.total)}
              </p>
              <div className="flex items-center gap-2 mt-2 text-[10px] text-[#555b6e]">
                <FaCheckCircle className="text-green-400" size={9} />
                <span>
                  {s.delivered} delivered ({s.delivery_rate}%)
                </span>
              </div>
              <div className="mt-3">
                <Sparkline
                  items={s.daily_trend}
                  valueKey="count"
                  color="#60a5fa"
                />
              </div>
            </div>

            {/* Revenue */}
            {rev && (
              <div className="bg-[#0d0f14] border border-[#2a3045] rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#e8ff47]/10 flex items-center justify-center">
                      <FaMoneyBillWave className="text-[#e8ff47]" size={14} />
                    </div>
                    <span className="text-[11px] font-medium text-[#7a8499]">
                      Revenue
                    </span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#e8ff47] tracking-tight">
                  {fmtK(rev.collected)}
                </p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-[#555b6e]">
                  <FaPercent size={8} />
                  <span>{collectionRate}% collection rate</span>
                </div>
                <div className="mt-3">
                  <Sparkline
                    items={rev.by_day}
                    valueKey="amount"
                    color="#e8ff47"
                  />
                </div>
              </div>
            )}

            {/* Outstanding */}
            {rev && (
              <div className="bg-[#0d0f14] border border-[#2a3045] rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <FaExclamationTriangle
                        className="text-orange-400"
                        size={14}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-[#7a8499]">
                      Outstanding
                    </span>
                  </div>
                </div>
                <p className="text-3xl font-bold text-orange-400 tracking-tight">
                  {fmtK(rev.outstanding)}
                </p>
                <div className="flex items-center gap-2 mt-2 text-[10px] text-[#555b6e]">
                  <FaFileInvoiceDollar size={9} />
                  <span>{inv.outstanding_count} unpaid invoices</span>
                </div>
              </div>
            )}

            {/* Active Clients */}
            <div className="bg-[#0d0f14] border border-[#2a3045] rounded-xl p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                    <FaUsers className="text-indigo-400" size={14} />
                  </div>
                  <span className="text-[11px] font-medium text-[#7a8499]">
                    Active Clients
                  </span>
                </div>
              </div>
              <p className="text-3xl font-bold text-indigo-400 tracking-tight">
                {fmtNum(cli.active)}
              </p>
              <div className="flex items-center gap-2 mt-2 text-[10px] text-[#555b6e]">
                <FaUsers size={9} />
                <span>of {cli.total} total registered</span>
              </div>
            </div>
          </div>

          {/* Secondary metrics row */}
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            <MiniMetric icon={<FaFileInvoiceDollar size={12} />} label="Total Invoices" value={inv.total} color="text-purple-400" />
            <MiniMetric icon={<FaCheckCircle size={12} />} label="Paid Invoices" value={inv.paid_count} color="text-green-400" />
            <MiniMetric icon={<FaTruck size={12} />} label="In Pipeline" value={totalPipeline} color="text-indigo-400" />
            <MiniMetric icon={<FaWeightHanging size={12} />} label="Weight Shipped" value={`${fmtNum(Math.round(s.total_weight_kg))} kg`} color="text-teal-400" />
            <MiniMetric
              icon={<FaPlane size={12} />}
              label="Air Freight"
              value={s.by_mode?.Air || 0}
              color="text-blue-400"
            />
            <MiniMetric
              icon={<FaShip size={12} />}
              label="Sea Freight"
              value={s.by_mode?.Sea || 0}
              color="text-teal-400"
            />
          </div>

          {/* Pipeline visual */}
          <div className="bg-[#0d0f14] border border-[#2a3045] rounded-xl p-5">
            <h3 className="text-xs font-semibold text-[#7a8499] uppercase tracking-widest mb-4 flex items-center gap-2">
              <FaTruck className="text-indigo-400" size={12} /> Live Pipeline
            </h3>
            {totalPipeline === 0 ? (
              <p className="text-xs text-[#555b6e] italic">No active shipments.</p>
            ) : (
              <>
                {/* Pipeline bar segments */}
                <div className="flex rounded-full h-4 overflow-hidden mb-4">
                  {Object.entries(pipe || {}).map(([status, count]) => {
                    const pct = (count / totalPipeline) * 100;
                    const colors = {
                      "Pickup Requested": "#f59e0b",
                      "Shipment Created": "#3b82f6",
                      "Processing at Origin": "#6366f1",
                      "In Transit": "#a855f7",
                      "Arrived Nairobi Hub": "#14b8a6",
                      Dispatched: "#f97316",
                    };
                    return (
                      <div
                        key={status}
                        className="h-full transition-all relative group"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: colors[status] || "#555b6e",
                          minWidth: count > 0 ? "6px" : "0",
                        }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1a1d27] border border-[#2a3045] text-[#f0f2f8] text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none z-10">
                          {status}: {count}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* Legend */}
                <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                  {Object.entries(pipe || {}).map(([status, count]) => (
                    <div key={status} className="flex items-center gap-1.5 text-[10px]">
                      <span className={`w-2 h-2 rounded-full ${STATUS_DOT[status] || "bg-gray-500"}`} />
                      <span className="text-[#7a8499]">{status}</span>
                      <span className="text-[#f0f2f8] font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Shipment Trend Chart */}
          <div className="bg-[#0d0f14] border border-[#2a3045] rounded-xl p-5">
            <h3 className="text-xs font-semibold text-[#7a8499] uppercase tracking-widest mb-3 flex items-center gap-2">
              <FaChartLine className="text-blue-400" size={12} /> Shipment Volume Trend
            </h3>
            <BarChart
              items={s.daily_trend}
              color="#3b82f6"
              height={140}
            />
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
           SECTION: REVENUE — deep financial breakdown
         ═══════════════════════════════════════════════════════════ */}
      {activeSection === "revenue" && (
        <>
          {!rev ? (
            <div className="bg-[#0d0f14] border border-[#2a3045] rounded-xl p-8 text-center">
              <FaMoneyBillWave className="text-[#555b6e] mx-auto mb-3" size={32} />
              <p className="text-sm text-[#7a8499]">Revenue data is not available for your role.</p>
            </div>
          ) : (
            <>
              {/* Revenue KPI row */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="bg-[#0d0f14] border border-[#2a3045] rounded-xl p-4 col-span-1">
                  <p className="text-[10px] uppercase tracking-widest text-[#555b6e] font-semibold mb-1">Revenue Collected</p>
                  <p className="text-2xl font-bold text-[#e8ff47]">{fmtK(rev.collected)}</p>
                </div>
                <div className="bg-[#0d0f14] border border-[#2a3045] rounded-xl p-4 col-span-1">
                  <p className="text-[10px] uppercase tracking-widest text-[#555b6e] font-semibold mb-1">Outstanding</p>
                  <p className="text-2xl font-bold text-orange-400">{fmtK(rev.outstanding)}</p>
                </div>
                <div className="bg-[#0d0f14] border border-[#2a3045] rounded-xl p-4 col-span-1">
                  <p className="text-[10px] uppercase tracking-widest text-[#555b6e] font-semibold mb-1">Taxable Services</p>
                  <p className="text-2xl font-bold text-blue-400">{fmtK(rev.taxable_services)}</p>
                </div>
                <div className="bg-[#0d0f14] border border-[#2a3045] rounded-xl p-4 col-span-1">
                  <p className="text-[10px] uppercase tracking-widest text-[#555b6e] font-semibold mb-1">VAT Collected</p>
                  <p className="text-2xl font-bold text-indigo-400">{fmtK(rev.vat_collected)}</p>
                </div>
                <div className="bg-[#0d0f14] border border-[#2a3045] rounded-xl p-4 col-span-1">
                  <p className="text-[10px] uppercase tracking-widest text-[#555b6e] font-semibold mb-1">Disbursements</p>
                  <p className="text-2xl font-bold text-teal-400">{fmtK(rev.disbursements)}</p>
                </div>
              </div>

              {/* Revenue composition donut + details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-[#0d0f14] border border-[#2a3045] rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-[#7a8499] uppercase tracking-widest mb-4">
                    Revenue Composition
                  </h3>
                  <div className="flex items-center justify-center gap-8">
                    <div className="relative">
                      <DonutChart
                        segments={[
                          { value: Number(rev.taxable_services), color: "#3b82f6" },
                          { value: Number(rev.vat_collected), color: "#6366f1" },
                          { value: Number(rev.disbursements), color: "#14b8a6" },
                        ]}
                        size={140}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-[#f0f2f8]">
                          {fmtK(rev.collected)}
                        </span>
                        <span className="text-[9px] text-[#555b6e]">total</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: "Services", value: rev.taxable_services, color: "bg-blue-500", textColor: "text-blue-400" },
                        { label: "VAT", value: rev.vat_collected, color: "bg-indigo-500", textColor: "text-indigo-400" },
                        { label: "Disbursements", value: rev.disbursements, color: "bg-teal-500", textColor: "text-teal-400" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-sm ${item.color}`} />
                          <div>
                            <p className="text-[11px] text-[#7a8499]">{item.label}</p>
                            <p className={`text-sm font-bold ${item.textColor}`}>
                              {fmt$(item.value)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Collection health */}
                <div className="bg-[#0d0f14] border border-[#2a3045] rounded-xl p-5">
                  <h3 className="text-xs font-semibold text-[#7a8499] uppercase tracking-widest mb-4">
                    Collection Health
                  </h3>
                  <div className="space-y-5">
                    {/* Collection rate gauge */}
                    <div>
                      <div className="flex items-end justify-between mb-2">
                        <span className="text-[11px] text-[#7a8499]">Collection Rate</span>
                        <span className={`text-2xl font-bold ${collectionRate >= 80 ? "text-green-400" : collectionRate >= 50 ? "text-[#e8ff47]" : "text-red-400"}`}>
                          {collectionRate}%
                        </span>
                      </div>
                      <div className="w-full bg-[#2a3045] rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-700 ${collectionRate >= 80 ? "bg-green-500" : collectionRate >= 50 ? "bg-[#e8ff47]" : "bg-red-500"}`}
                          style={{ width: `${collectionRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Collected vs Outstanding */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3 text-center">
                        <p className="text-[10px] text-green-400/60 uppercase font-semibold mb-1">Collected</p>
                        <p className="text-lg font-bold text-green-400">{fmt$(rev.collected)}</p>
                      </div>
                      <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3 text-center">
                        <p className="text-[10px] text-orange-400/60 uppercase font-semibold mb-1">Outstanding</p>
                        <p className="text-lg font-bold text-orange-400">{fmt$(rev.outstanding)}</p>
                      </div>
                    </div>

                    {/* Payment methods */}
                    {Object.keys(inv.payment_methods || {}).length > 0 && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-[#555b6e] font-semibold mb-2">
                          Payment Channels
                        </p>
                        <div className="flex gap-3">
                          {Object.entries(inv.payment_methods).map(([method, count]) => (
                            <div
                              key={method}
                              className="flex-1 flex items-center gap-2 bg-[#1a1d27] rounded-lg px-3 py-2"
                            >
                              <span className="text-xl">
                                {method === "cash" ? "💵" : "🏦"}
                              </span>
                              <div>
                                <p className="text-sm font-bold text-[#f0f2f8]">
                                  {count}
                                </p>
                                <p className="text-[10px] text-[#7a8499] capitalize">
                                  {method}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Revenue trend chart */}
              <div className="bg-[#0d0f14] border border-[#2a3045] rounded-xl p-5">
                <h3 className="text-xs font-semibold text-[#7a8499] uppercase tracking-widest mb-3 flex items-center gap-2">
                  <FaChartLine className="text-[#e8ff47]" size={12} /> Revenue Trend (Daily)
                </h3>
                <BarChart
                  items={rev.by_day}
                  valueKey="amount"
                  color="#e8ff47"
                  height={160}
                  formatValue={(v) => `$${Number(v).toFixed(0)}`}
                />
              </div>
            </>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
           SECTION: OPERATIONS — shipment performance
         ═══════════════════════════════════════════════════════════ */}
      {activeSection === "operations" && (
        <>
          {/* Shipments by Status — full progress bars */}
          <div className="bg-[#0d0f14] border border-[#2a3045] rounded-xl p-5">
            <h3 className="text-xs font-semibold text-[#7a8499] uppercase tracking-widest mb-4 flex items-center gap-2">
              <FaBox className="text-blue-400" size={12} /> Shipment Distribution by Status
            </h3>
            {Object.keys(s.by_status || {}).length === 0 ? (
              <p className="text-xs text-[#555b6e] italic">No shipments in this period.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(s.by_status).map(([status, count]) => {
                  const pct = s.total
                    ? Math.round((count / s.total) * 100)
                    : 0;
                  const barColors = {
                    "Pickup Requested": "bg-amber-500",
                    "Shipment Created": "bg-blue-500",
                    "Processing at Origin": "bg-indigo-500",
                    "In Transit": "bg-purple-500",
                    "Arrived Nairobi Hub": "bg-teal-500",
                    Dispatched: "bg-orange-500",
                    Delivered: "bg-green-500",
                    Cancelled: "bg-red-500",
                  };
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <span className="text-[11px] text-[#7a8499] w-40 truncate">
                        {status}
                      </span>
                      <div className="flex-1 bg-[#2a3045] rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-700 ${barColors[status] || "bg-gray-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-[#f0f2f8] w-16 text-right">
                        {count} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Transport mode + Invoice breakdown side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Transport Mode */}
            <div className="bg-[#0d0f14] border border-[#2a3045] rounded-xl p-5">
              <h3 className="text-xs font-semibold text-[#7a8499] uppercase tracking-widest mb-4">
                Transport Mode Split
              </h3>
              {Object.keys(s.by_mode || {}).length === 0 ? (
                <p className="text-xs text-[#555b6e] italic">No data.</p>
              ) : (
                <div className="space-y-5">
                  {Object.entries(s.by_mode).map(([mode, count]) => {
                    const pct = s.total
                      ? Math.round((count / s.total) * 100)
                      : 0;
                    return (
                      <div key={mode}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {mode === "Air" ? (
                              <FaPlane className="text-blue-400" size={16} />
                            ) : (
                              <FaShip className="text-teal-400" size={16} />
                            )}
                            <span className="text-sm font-semibold text-[#f0f2f8]">
                              {mode} Freight
                            </span>
                          </div>
                          <span className="text-sm font-bold text-[#f0f2f8]">
                            {count}{" "}
                            <span className="text-[#555b6e] text-xs font-normal">
                              ({pct}%)
                            </span>
                          </span>
                        </div>
                        <div className="w-full bg-[#2a3045] rounded-full h-3">
                          <div
                            className={`h-3 rounded-full transition-all ${mode === "Air" ? "bg-blue-500" : "bg-teal-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Invoice Performance */}
            <div className="bg-[#0d0f14] border border-[#2a3045] rounded-xl p-5">
              <h3 className="text-xs font-semibold text-[#7a8499] uppercase tracking-widest mb-4">
                Invoice Summary
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {Object.entries(inv.by_type || {}).map(([type, count]) => (
                  <div
                    key={type}
                    className={`text-center rounded-lg p-3 border ${
                      type === "proforma"
                        ? "bg-amber-900/15 border-amber-700/25"
                        : "bg-emerald-900/15 border-emerald-700/25"
                    }`}
                  >
                    <p className="text-2xl font-bold text-[#f0f2f8]">{count}</p>
                    <p className="text-[10px] text-[#7a8499] capitalize">{type}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {Object.entries(inv.by_status || {}).map(([status, count]) => {
                  const pct = inv.total
                    ? Math.round((count / inv.total) * 100)
                    : 0;
                  const statusBarColors = {
                    draft: "bg-gray-500",
                    issued: "bg-blue-500",
                    paid: "bg-green-500",
                    cancelled: "bg-red-500",
                  };
                  return (
                    <div key={status} className="flex items-center gap-2">
                      <span className="text-[11px] text-[#7a8499] capitalize w-20">
                        {status}
                      </span>
                      <div className="flex-1 bg-[#2a3045] rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${statusBarColors[status] || "bg-gray-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-[#f0f2f8] w-12 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Shipment volume trend */}
          <div className="bg-[#0d0f14] border border-[#2a3045] rounded-xl p-5">
            <h3 className="text-xs font-semibold text-[#7a8499] uppercase tracking-widest mb-3 flex items-center gap-2">
              <FaChartLine className="text-blue-400" size={12} /> Daily Shipment Intake
            </h3>
            <BarChart items={s.daily_trend} color="#3b82f6" height={160} />
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
           SECTION: CLIENTS — client analytics
         ═══════════════════════════════════════════════════════════ */}
      {activeSection === "clients" && (
        <>
          {/* Client KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-[#0d0f14] border border-[#2a3045] rounded-xl p-4 text-center">
              <p className="text-[10px] uppercase tracking-widest text-[#555b6e] font-semibold mb-1">Active This Period</p>
              <p className="text-3xl font-bold text-indigo-400">{fmtNum(cli.active)}</p>
            </div>
            <div className="bg-[#0d0f14] border border-[#2a3045] rounded-xl p-4 text-center">
              <p className="text-[10px] uppercase tracking-widest text-[#555b6e] font-semibold mb-1">Total Registered</p>
              <p className="text-3xl font-bold text-[#7a8499]">{fmtNum(cli.total)}</p>
            </div>
            <div className="bg-[#0d0f14] border border-[#2a3045] rounded-xl p-4 text-center">
              <p className="text-[10px] uppercase tracking-widest text-[#555b6e] font-semibold mb-1">Engagement Rate</p>
              <p className="text-3xl font-bold text-[#e8ff47]">
                {cli.total ? Math.round((cli.active / cli.total) * 100) : 0}%
              </p>
            </div>
            <div className="bg-[#0d0f14] border border-[#2a3045] rounded-xl p-4 text-center">
              <p className="text-[10px] uppercase tracking-widest text-[#555b6e] font-semibold mb-1">Avg Shipments/Client</p>
              <p className="text-3xl font-bold text-blue-400">
                {cli.active ? (s.total / cli.active).toFixed(1) : "0"}
              </p>
            </div>
          </div>

          {/* Top Clients Table */}
          <div className="bg-[#0d0f14] border border-[#2a3045] rounded-xl p-5">
            <h3 className="text-xs font-semibold text-[#7a8499] uppercase tracking-widest mb-4 flex items-center gap-2">
              <FaUsers className="text-indigo-400" size={12} /> Top Clients by Shipment Volume
            </h3>
            {(cli.top || []).length === 0 ? (
              <p className="text-xs text-[#555b6e] italic">No client activity this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[10px] text-[#555b6e] uppercase tracking-wider border-b border-[#2a3045]">
                      <th className="pb-2 pr-4 w-8">Rank</th>
                      <th className="pb-2 pr-4">Client Name</th>
                      <th className="pb-2 pr-4">Email</th>
                      <th className="pb-2 text-right">Shipments</th>
                      <th className="pb-2 text-right pl-4">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cli.top.map((client, i) => {
                      const share = s.total
                        ? Math.round((client.shipment_count / s.total) * 100)
                        : 0;
                      return (
                        <tr
                          key={client.id}
                          className="border-b border-[#2a3045]/40 hover:bg-[#1a1d27]/50 transition"
                        >
                          <td className="py-3 pr-4">
                            <span
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                i === 0
                                  ? "bg-[#e8ff47]/20 text-[#e8ff47]"
                                  : i === 1
                                  ? "bg-blue-500/20 text-blue-400"
                                  : i === 2
                                  ? "bg-teal-500/20 text-teal-400"
                                  : "bg-[#2a3045] text-[#555b6e]"
                              }`}
                            >
                              {i + 1}
                            </span>
                          </td>
                          <td className="py-3 pr-4 font-medium text-[#f0f2f8]">
                            {client.name}
                          </td>
                          <td className="py-3 pr-4 text-[#7a8499] text-xs">
                            {client.email}
                          </td>
                          <td className="py-3 text-right">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold">
                              <FaBox size={8} /> {client.shipment_count}
                            </span>
                          </td>
                          <td className="py-3 text-right pl-4">
                            <div className="flex items-center gap-2 justify-end">
                              <div className="w-16 bg-[#2a3045] rounded-full h-1.5">
                                <div
                                  className="bg-indigo-500 h-1.5 rounded-full"
                                  style={{ width: `${share}%` }}
                                />
                              </div>
                              <span className="text-[10px] font-semibold text-[#555b6e] w-8 text-right">
                                {share}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Mini metric tile ── */
function MiniMetric({ icon, label, value, color = "text-[#f0f2f8]" }) {
  return (
    <div className="bg-[#0d0f14] border border-[#2a3045] rounded-lg p-3 flex items-center gap-3">
      <span className={color}>{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-[#555b6e] truncate">{label}</p>
        <p className={`text-sm font-bold ${color}`}>{value}</p>
      </div>
    </div>
  );
}
