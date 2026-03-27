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
  FaCheckCircle,
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
  "Pickup Requested": "bg-amber-100 text-amber-800",
  "Shipment Created": "bg-blue-100 text-blue-800",
  "Processing at Origin": "bg-indigo-100 text-indigo-800",
  "In Transit": "bg-purple-100 text-purple-800",
  "Arrived Nairobi Hub": "bg-teal-100 text-teal-800",
  "Dispatched": "bg-orange-100 text-orange-800",
  "Delivered": "bg-green-100 text-green-800",
  "Cancelled": "bg-red-100 text-red-800",
};

export default function StaffReports() {
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

  /* ── Simple bar for trend charts ── */
  const TrendBar = ({ items, valueKey = "count", labelKey = "day", color = "bg-primary" }) => {
    if (!items || items.length === 0) return <p className="text-xs text-gray-400 italic py-4">No data for this period.</p>;
    const max = Math.max(...items.map((d) => d[valueKey]), 1);
    return (
      <div className="flex items-end gap-1 h-32 mt-2">
        {items.map((d, i) => {
          const pct = (d[valueKey] / max) * 100;
          const label = typeof d[labelKey] === "string" ? d[labelKey].slice(5) : d[labelKey]; // trim year
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <span className="text-[10px] text-gray-500 font-medium">{d[valueKey]}</span>
              <div
                className={`w-full rounded-t ${color} transition-all`}
                style={{ height: `${Math.max(pct, 4)}%` }}
                title={`${d[labelKey]}: ${d[valueKey]}`}
              />
              <span className="text-[9px] text-gray-400 truncate w-full text-center">{label}</span>
            </div>
          );
        })}
      </div>
    );
  };

  /* ── Stat card ── */
  const StatCard = ({ icon, label, value, sub, color = "text-primary", bgColor = "bg-blue-50" }) => (
    <div className={`${bgColor} rounded-xl p-4 flex flex-col`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={color}>{icon}</span>
        <span className="text-xs font-medium text-gray-500">{label}</span>
      </div>
      <span className={`text-2xl font-bold ${color}`}>{value}</span>
      {sub && <span className="text-xs text-gray-400 mt-1">{sub}</span>}
    </div>
  );

  /* ── CSV export ── */
  const exportCSV = () => {
    if (!data) return;
    const lines = [
      ["Report", "Staff Reports"],
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
      ...(data.revenue ? [
        ["=== REVENUE ==="],
        ["Revenue Collected (USD)", data.revenue.collected],
        ["Outstanding (USD)", data.revenue.outstanding],
        ["Taxable Services (USD)", data.revenue.taxable_services],
        ["VAT Collected (USD)", data.revenue.vat_collected],
        ["Disbursements (USD)", data.revenue.disbursements],
        [],
      ] : []),
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
    a.download = `staff-report-${period}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/staff")}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <FaArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaChartBar className="text-primary" /> Reports & Analytics
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Shipments, invoices & client insights</p>
          </div>
        </div>

        <button
          onClick={exportCSV}
          disabled={!data}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-40 transition"
        >
          <FaDownload size={12} /> Export CSV
        </button>
      </div>

      {/* Period Selector */}
      <div className="px-6 pt-5">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex flex-wrap items-center gap-3">
            <FaCalendarAlt className="text-gray-400" />
            {PERIOD_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setPeriod(opt.key)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition ${
                  period === opt.key
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <span className="text-gray-400 text-xs">to</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <FaSpinner className="animate-spin text-primary mr-3" size={24} />
          <span className="text-gray-500">Loading reports...</span>
        </div>
      )}

      {error && (
        <div className="px-6 pt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">{error}</div>
        </div>
      )}

      {data && !loading && (
        <>
          {/* ═══ KPI Cards ═══ */}
          <div className={`grid grid-cols-2 md:grid-cols-3 ${data.revenue ? 'xl:grid-cols-6' : 'xl:grid-cols-4'} gap-4 px-6 pt-5`}>
            <StatCard
              icon={<FaBox size={16} />}
              label="Shipments"
              value={data.shipments.total}
              sub={`${data.shipments.delivered} delivered`}
              color="text-blue-600"
              bgColor="bg-blue-50"
            />
            <StatCard
              icon={<FaTruck size={16} />}
              label="Delivery Rate"
              value={`${data.shipments.delivery_rate}%`}
              sub={`${data.shipments.total_weight_kg.toLocaleString()} kg shipped`}
              color="text-green-600"
              bgColor="bg-green-50"
            />
            {data.revenue && (
              <StatCard
                icon={<FaMoneyBillWave size={16} />}
                label="Revenue"
                value={`$${data.revenue.collected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                sub={`VAT: $${data.revenue.vat_collected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                color="text-emerald-600"
                bgColor="bg-emerald-50"
              />
            )}
            {data.revenue && (
              <StatCard
                icon={<FaFileInvoiceDollar size={16} />}
                label="Outstanding"
                value={`$${data.revenue.outstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                sub={`${data.invoices.outstanding_count} invoice${data.invoices.outstanding_count !== 1 ? "s" : ""}`}
                color="text-orange-600"
                bgColor="bg-orange-50"
              />
            )}
            <StatCard
              icon={<FaFileInvoiceDollar size={16} />}
              label="Invoices"
              value={data.invoices.total}
              sub={`${data.invoices.paid_count} paid`}
              color="text-purple-600"
              bgColor="bg-purple-50"
            />
            <StatCard
              icon={<FaUsers size={16} />}
              label="Active Clients"
              value={data.clients.active}
              sub={`of ${data.clients.total} total`}
              color="text-indigo-600"
              bgColor="bg-indigo-50"
            />
          </div>

          {/* ═══ Charts Row ═══ */}
          <div className={`grid grid-cols-1 ${data.revenue ? 'lg:grid-cols-2' : ''} gap-4 px-6 pt-5`}>
            {/* Shipments Trend */}
            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                <FaBox className="text-blue-500" size={14} /> Shipments Created (Daily)
              </h3>
              <TrendBar items={data.shipments.daily_trend} color="bg-blue-500" />
            </div>

            {/* Revenue Trend — only if revenue data present */}
            {data.revenue && (
              <div className="bg-white rounded-xl shadow p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <FaMoneyBillWave className="text-emerald-500" size={14} /> Revenue Collected (Daily)
                </h3>
                <TrendBar items={data.revenue.by_day} valueKey="amount" labelKey="day" color="bg-emerald-500" />
              </div>
            )}
          </div>

          {/* ═══ Breakdown Row ═══ */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-6 pt-5">
            {/* Shipments by Status */}
            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Shipments by Status</h3>
              {Object.keys(data.shipments.by_status).length === 0 ? (
                <p className="text-xs text-gray-400 italic">No shipments in period.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(data.shipments.by_status).map(([status, count]) => {
                    const pct = data.shipments.total ? Math.round((count / data.shipments.total) * 100) : 0;
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_COLORS[status] || "bg-gray-100 text-gray-700"}`}>
                            {status}
                          </span>
                          <span className="text-xs text-gray-600 font-semibold">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                          <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Transport Mode */}
            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Transport Mode</h3>
              {Object.keys(data.shipments.by_mode).length === 0 ? (
                <p className="text-xs text-gray-400 italic">No data.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(data.shipments.by_mode).map(([mode, count]) => {
                    const pct = data.shipments.total ? Math.round((count / data.shipments.total) * 100) : 0;
                    return (
                      <div key={mode} className="flex items-center gap-3">
                        {mode === "Air" ? (
                          <FaPlane className="text-blue-500" size={20} />
                        ) : (
                          <FaShip className="text-teal-500" size={20} />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{mode} Freight</span>
                            <span className="text-sm font-bold text-gray-900">{count}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
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
            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Invoice Breakdown</h3>
              <div className="space-y-3">
                {/* By type */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5">By Type</p>
                  <div className="flex gap-3">
                    {Object.entries(data.invoices.by_type).map(([type, count]) => (
                      <div
                        key={type}
                        className={`flex-1 text-center rounded-lg p-3 ${
                          type === "proforma"
                            ? "bg-amber-50 border border-amber-200"
                            : "bg-emerald-50 border border-emerald-200"
                        }`}
                      >
                        <p className="text-lg font-bold">{count}</p>
                        <p className="text-[10px] text-gray-500 capitalize">{type}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* By status */}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5">By Status</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(data.invoices.by_status).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                        <span className={`w-2 h-2 rounded-full ${
                          status === "paid" ? "bg-green-500"
                            : status === "issued" ? "bg-blue-500"
                            : status === "draft" ? "bg-gray-400"
                            : "bg-red-400"
                        }`} />
                        <span className="text-xs text-gray-600 capitalize flex-1 ml-2">{status}</span>
                        <span className="text-xs font-bold text-gray-800">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment methods */}
                {Object.keys(data.invoices.payment_methods).length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1.5">Payment Method</p>
                    <div className="flex gap-3">
                      {Object.entries(data.invoices.payment_methods).map(([method, count]) => (
                        <div key={method} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-lg">{method === "cash" ? "💵" : "🏦"}</span>
                          <div>
                            <p className="text-xs font-bold text-gray-800">{count}</p>
                            <p className="text-[10px] text-gray-500 capitalize">{method}</p>
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
          <div className={`grid grid-cols-1 ${data.revenue ? 'lg:grid-cols-2' : ''} gap-4 px-6 pt-5`}>
            {/* Revenue Breakdown — only if revenue data present */}
            {data.revenue && (
            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaMoneyBillWave className="text-emerald-500" size={14} /> Revenue Breakdown
              </h3>
              <div className="space-y-2">
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
                        <span className="text-xs text-gray-600">{item.label}</span>
                        <span className="text-xs font-semibold text-gray-800">
                          ${item.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className={`${item.color} h-2 rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}

                <div className="border-t border-gray-200 pt-2 mt-3 flex justify-between">
                  <span className="text-sm font-bold text-gray-700">Total Collected</span>
                  <span className="text-sm font-bold text-emerald-600">
                    ${data.revenue.collected.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
            )}

            {/* Pipeline Snapshot */}
            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaTruck className="text-indigo-500" size={14} /> Current Pipeline
              </h3>
              {Object.keys(data.pipeline).length === 0 ? (
                <p className="text-xs text-gray-400 italic">No shipments in pipeline.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(data.pipeline).map(([status, count]) => {
                    const totalPipeline = Object.values(data.pipeline).reduce((a, b) => a + b, 0);
                    const pct = totalPipeline ? Math.round((count / totalPipeline) * 100) : 0;
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded whitespace-nowrap ${STATUS_COLORS[status] || "bg-gray-100 text-gray-700"}`}>
                          {status}
                        </span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-bold text-gray-700 w-8 text-right">{count}</span>
                      </div>
                    );
                  })}
                  <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                    <span className="text-xs font-semibold text-gray-500">Total in Pipeline</span>
                    <span className="text-sm font-bold text-indigo-600">
                      {Object.values(data.pipeline).reduce((a, b) => a + b, 0)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══ Top Clients ═══ */}
          <div className="px-6 pt-5 pb-8">
            <div className="bg-white rounded-xl shadow p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaUsers className="text-indigo-500" size={14} /> Top Clients (by Shipment Volume)
              </h3>
              {data.clients.top.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No client activity in this period.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                        <th className="pb-2 pr-4">#</th>
                        <th className="pb-2 pr-4">Client</th>
                        <th className="pb-2 pr-4">Email</th>
                        <th className="pb-2 text-right">Shipments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.clients.top.map((client, i) => (
                        <tr key={client.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                          <td className="py-2.5 pr-4 font-semibold text-gray-400">{i + 1}</td>
                          <td className="py-2.5 pr-4 font-medium text-gray-800">{client.name}</td>
                          <td className="py-2.5 pr-4 text-gray-500">{client.email}</td>
                          <td className="py-2.5 text-right">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
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
