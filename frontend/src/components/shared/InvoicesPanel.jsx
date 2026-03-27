// src/components/shared/InvoicesPanel.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PrintableInvoice from "./PrintableInvoice";

// ─── Constants ───────────────────────────────────────────────────────────────

const ROLES = {
  CLIENT: "CLIENT",
  CARGOADMIN: "CARGOADMIN",
  CLIENTADMIN: "CLIENTADMIN",
  STAFF: "STAFF",
  SUPERADMIN: "SUPERADMIN",
};

const INVOICE_TYPES = { PROFORMA: "proforma", FINAL: "final" };

const STATUSES = {
  DRAFT: "draft",
  ISSUED: "issued",
  PAID: "paid",
  CANCELLED: "cancelled",
  RETIRED: "retired",
  EXPIRED: "expired",
};

const PAYMENT_METHODS = [
  { key: "cash",  label: "💵 Cash" },
  { key: "bank",  label: "🏦 Bank Transfer" },
  { key: "mpesa", label: "📱 M-Pesa" },
  { key: "visa",  label: "💳 Visa" },
];

const PAYMENT_METHOD_LABELS = Object.fromEntries(PAYMENT_METHODS.map(({ key, label }) => [key, label]));

// ─── Theme helper ─────────────────────────────────────────────────────────────

function buildTheme(isDark) {
  return {
    bg:       isDark ? "bg-[#1a1d27]"  : "bg-white",
    border:   isDark ? "border-[#2a3045]" : "border-gray-200",
    text:     isDark ? "text-[#f0f2f8]"  : "text-gray-900",
    textMuted:isDark ? "text-[#7a8499]"  : "text-gray-500",
    cardBg:   isDark ? "bg-[#0d0f14]"   : "bg-gray-50",
    inputBase:isDark
      ? "bg-[#0d0f14] border-[#2a3045] text-[#f0f2f8]"
      : "border-gray-300",
    btnActive: isDark
      ? "bg-[#e8ff47] text-[#0d0f14] font-semibold"
      : "bg-blue-600 text-white font-semibold",
    btnInactive: isDark
      ? "bg-[#0d0f14] text-[#7a8499] border border-[#2a3045] hover:text-[#f0f2f8]"
      : "bg-gray-100 text-gray-600 hover:bg-gray-200",
    btnCancel: isDark
      ? "border-[#2a3045] text-[#7a8499] hover:text-[#f0f2f8]"
      : "border-gray-300 text-gray-600 hover:bg-gray-100",
  };
}

// ─── API helper ───────────────────────────────────────────────────────────────

async function apiFetch(url, options, onUnauthorized) {
  const res = await fetch(url, options);
  if (res.status === 401) {
    onUnauthorized();
    return null;
  }
  return res;
}

/**
 * Reusable invoices panel for all dashboards.
 *
 * Props:
 *  - role    {string}  "CLIENT" | "CARGOADMIN" | "CLIENTADMIN" | "STAFF" | "SUPERADMIN"
 *                      Use the exported ROLES constants. Defaults to "CLIENT".
 *  - theme   {string}  "light" (default) | "dark" (SuperAdmin dark UI)
 *  - search  {string}  Optional external search string; filters by invoice number,
 *                      tracking number, or client name.
 *
 * Behaviour:
 *  - Fetches from VITE_BASE_URL (shipments or client endpoint depending on role).
 *  - Redirects to /login on 401 responses and clears stored tokens.
 *  - Role-based permission flags control which action sub-forms are shown:
 *      canEditClearance    → SUPERADMIN, CARGOADMIN
 *      canRecordPayment    → SUPERADMIN, CLIENTADMIN
 *      canCancelProforma   → CLIENTADMIN
 *      canRequestCreditNote→ CLIENTADMIN, CARGOADMIN
 *  - Filtering and summary stats are memoised (useMemo).
 *  - PrintableInvoice is rendered at panel level (single instance, not per-card).
 *  - Theme classes are centralised in buildTheme() and passed as a single `theme` prop.
 */
export default function InvoicesPanel({ role = ROLES.CLIENT, theme = "light", search = "", lazy = false }) {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [printInvoice, setPrintInvoice] = useState(null);

  const BASE_URL = import.meta.env.VITE_BASE_URL
    ?? import.meta.env.VITE_API_URL?.replace(/\/accounts\/?$/, "");
  const token = localStorage.getItem("access");
  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token}`, "Content-Type": "application/json" }),
    [token],
  );

  const isClient = role === ROLES.CLIENT;
  const isDark = theme === "dark";
  const t = useMemo(() => buildTheme(isDark), [isDark]);

  const canEditClearance   = role === ROLES.SUPERADMIN || role === ROLES.CARGOADMIN;
  const canRecordPayment   = role === ROLES.SUPERADMIN || role === ROLES.CLIENTADMIN;
  const canCancelProforma  = role === ROLES.CLIENTADMIN || role === ROLES.STAFF;
  const canRequestCreditNote = role === ROLES.CLIENTADMIN || role === ROLES.CARGOADMIN || role === ROLES.STAFF;

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    navigate("/login");
  }, [navigate]);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const endpoint = isClient
        ? `${BASE_URL}/shipments/client/invoices/`
        : `${BASE_URL}/shipments/invoices/`;
      const res = await apiFetch(endpoint, { headers }, handleUnauthorized);
      if (!res) return;
      if (!res.ok) throw new Error("Failed to fetch invoices");
      const data = await res.json();
      setInvoices(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  }, [BASE_URL, headers, isClient, handleUnauthorized]);

  useEffect(() => {
    if (!lazy) fetchInvoices();
  }, [fetchInvoices, lazy]);

  const filtered = useMemo(() => invoices.filter((inv) => {
    if (filter !== "all" && inv.invoice_type !== filter) return false;
    if (statusFilter === "unpaid") {
      if (inv.payment_status !== "unpaid") return false;
    } else if (statusFilter !== "all" && inv.status !== statusFilter) return false;
    if (dateFrom) {
      const invDate = new Date(inv.created_at);
      if (invDate < new Date(dateFrom)) return false;
    }
    if (dateTo) {
      const invDate = new Date(inv.created_at);
      const toDate = new Date(dateTo);
      toDate.setDate(toDate.getDate() + 1); // inclusive upper bound
      if (invDate >= toDate) return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const matchesNumber   = inv.invoice_number?.toLowerCase().includes(q);
      const matchesTracking = inv.cargo_tracking?.toLowerCase().includes(q);
      const matchesClient   = inv.client_name?.toLowerCase().includes(q);
      if (!matchesNumber && !matchesTracking && !matchesClient) return false;
    }
    return true;
  }), [invoices, filter, statusFilter, dateFrom, dateTo, search]);

  const stats = useMemo(() => {
    const unpaidInvoices = invoices.filter((i) => i.payment_status === "unpaid");
    return {
      totalProforma:    invoices.filter((i) => i.invoice_type === INVOICE_TYPES.PROFORMA).length,
      totalFinal:       invoices.filter((i) => i.invoice_type === INVOICE_TYPES.FINAL).length,
      totalPaid:        invoices.filter((i) => i.status === STATUSES.PAID).length,
      totalOutstanding: invoices.filter((i) => i.status === STATUSES.ISSUED).length,
      totalUnpaid:      unpaidInvoices.length,
      totalUnpaidAmount: unpaidInvoices.reduce((sum, i) => sum + Number(i.total_amount || 0), 0),
      currency:         invoices[0]?.currency || "USD",
    };
  }, [invoices]);

  if (lazy && !hasFetched && !loading) {
    return (
      <div className="space-y-4">
        {/* Pre-run filter panel */}
        <div className={`border ${t.border} rounded-lg p-4 space-y-3 ${t.bg}`}>
          <p className={`text-sm font-semibold ${t.text}`}>Configure Report Filters</p>

          {/* Date range */}
          <div className="flex flex-wrap gap-4">
            <div className="flex flex-col gap-1">
              <label className={`text-xs ${t.textMuted}`}>From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className={`text-sm border rounded px-2 py-1 ${t.inputBase}`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={`text-xs ${t.textMuted}`}>To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className={`text-sm border rounded px-2 py-1 ${t.inputBase}`}
              />
            </div>
          </div>

          {/* Type filter */}
          <div className="flex flex-wrap gap-2 items-center">
            <span className={`text-xs ${t.textMuted}`}>Type:</span>
            {["all", "proforma", "final"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded text-xs transition ${filter === f ? t.btnActive : t.btnInactive}`}
              >
                {f === "all" ? "All" : f === "proforma" ? "Proforma" : "Final"}
              </button>
            ))}
            <span className={`text-xs ml-3 ${t.textMuted}`}>Status:</span>
            {["all", "draft", "issued", "paid", "unpaid", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded text-xs transition ${statusFilter === s ? t.btnActive : t.btnInactive}`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={fetchInvoices}
            className="flex items-center gap-2 px-6 py-2 rounded bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
          >
            Run Report
          </button>
        </div>
      </div>
    );
  }

  if (loading) return <p className={`py-4 ${t.textMuted}`}>Loading invoices...</p>;
  if (error)   return <p className="text-red-500 py-4">{error}</p>;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Proformas",       value: stats.totalProforma,    color: isDark ? "text-amber-400"   : "text-amber-600" },
          { label: "Final Invoices",  value: stats.totalFinal,       color: isDark ? "text-emerald-400" : "text-emerald-600" },
          { label: "Paid",            value: stats.totalPaid,        color: isDark ? "text-green-400"   : "text-green-600" },
          { label: "Outstanding",     value: stats.totalOutstanding, color: isDark ? "text-orange-400"  : "text-orange-600" },
          {
            label: "Unpaid", value: stats.totalUnpaid,
            color: isDark ? "text-red-400" : "text-red-600",
            sub: stats.totalUnpaidAmount > 0 ? `${stats.currency} ${stats.totalUnpaidAmount.toFixed(2)}` : null,
          },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className={`${t.bg} border ${t.border} rounded-lg p-3 text-center`}>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className={`text-xs ${t.textMuted}`}>{label}</p>
            {sub && <p className={`text-xs font-semibold mt-0.5 ${color}`}>{sub}</p>}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-2">
        {/* Date range row */}
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1">
            <label className={`text-xs ${t.textMuted}`}>From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className={`text-sm border rounded px-2 py-1 ${t.inputBase}`}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className={`text-xs ${t.textMuted}`}>To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className={`text-sm border rounded px-2 py-1 ${t.inputBase}`}
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(""); setDateTo(""); }}
              className={`text-xs px-2 py-1 rounded border ${t.btnCancel} transition`}
            >
              Clear dates
            </button>
          )}
          {lazy && hasFetched && (
            <button
              onClick={fetchInvoices}
              className={`ml-auto text-xs px-3 py-1.5 rounded border ${t.btnCancel} transition`}
            >
              ↻ Refresh
            </button>
          )}
        </div>

        {/* Type + Status buttons */}
        <div className="flex flex-wrap gap-2">
          <span className={`text-xs self-center mr-1 ${t.textMuted}`}>Type:</span>
          {["all", "proforma", "final"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded text-xs transition ${filter === f ? t.btnActive : t.btnInactive}`}
            >
              {f === "all" ? "All" : f === "proforma" ? "Proforma" : "Final"}
            </button>
          ))}
          <span className={`text-xs self-center ml-3 mr-1 ${t.textMuted}`}>Status:</span>
          {["all", "draft", "issued", "paid", "unpaid", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded text-xs transition ${statusFilter === s ? t.btnActive : t.btnInactive}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice List */}
      {filtered.length === 0 ? (
        <p className={`text-sm italic py-4 ${t.textMuted}`}>
          No invoices match the current filters.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((inv) => (
            <InvoiceCard
              key={inv.id}
              invoice={inv}
              showClient={!isClient}
              isDark={isDark}
              theme={t}
              canEditClearance={canEditClearance}
              canRecordPayment={canRecordPayment}
              canCancelProforma={canCancelProforma}
              canRequestCreditNote={canRequestCreditNote}
              baseUrl={BASE_URL}
              headers={headers}
              onRefresh={fetchInvoices}
              onPrint={setPrintInvoice}
              onUnauthorized={handleUnauthorized}
            />
          ))}
        </div>
      )}

      {/* Print overlay — lifted to panel level */}
      {printInvoice && (
        <PrintableInvoice invoice={printInvoice} onClose={() => setPrintInvoice(null)} />
      )}
    </div>
  );
}

function InvoiceCard({ invoice: inv, showClient, isDark, cardBg, border, text, textMuted, canEditClearance, canRecordPayment, canCancelProforma, canRequestCreditNote, baseUrl, headers, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [clearanceForm, setClearanceForm] = useState(null);
  const [clearanceLoading, setClearanceLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [creditNoteForm, setCreditNoteForm] = useState(null); // { amount, reason }
  const [creditNoteLoading, setCreditNoteLoading] = useState(false);
  const [payMethodForm, setPayMethodForm] = useState(null); // { method, reference }
  const [showPrint, setShowPrint] = useState(false);

  const isProforma = inv.invoice_type === "proforma";
  const typeColor = isProforma
    ? isDark
      ? "bg-amber-900/40 text-amber-300 border-amber-700/50"
      : "bg-amber-100 text-amber-800 border-amber-200"
    : isDark
      ? "bg-emerald-900/40 text-emerald-300 border-emerald-700/50"
      : "bg-emerald-100 text-emerald-800 border-emerald-200";

  const statusColors = {
    draft: isDark ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600",
    issued: isDark ? "bg-blue-900/40 text-blue-300" : "bg-blue-100 text-blue-700",
    paid: isDark ? "bg-green-900/40 text-green-300" : "bg-green-100 text-green-700",
    cancelled: isDark ? "bg-red-900/40 text-red-300" : "bg-red-100 text-red-700",
    retired: isDark ? "bg-slate-700/60 text-slate-400" : "bg-slate-200 text-slate-500",
    expired: isDark ? "bg-orange-900/40 text-orange-400" : "bg-orange-100 text-orange-600",
  };

  const isArchived = inv.status === "retired" || inv.status === "expired";

  const highlightBorder = isProforma
    ? isDark ? "border-l-amber-500" : "border-l-amber-400"
    : isDark ? "border-l-emerald-500" : "border-l-emerald-400";

  return (
    <div className={`${cardBg} border ${border} border-l-4 ${highlightBorder} rounded-lg overflow-hidden`}>
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:opacity-90 transition`}
      >
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <span className={`text-sm font-semibold ${text}`}>{inv.invoice_number}</span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded border ${typeColor}`}>
            {isProforma ? "Proforma" : "Final"}
          </span>
          <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusColors[inv.status] || ""}`}>
            {inv.status.toUpperCase()}
          </span>
          {inv.payment_status === "unpaid" && (
            <span className={`px-2 py-0.5 text-xs font-bold rounded ${
              isDark ? "bg-red-900/50 text-red-300 border border-red-700/50" : "bg-red-100 text-red-700 border border-red-200"
            }`}>
              UNPAID{inv.days_unpaid > 0 ? ` (${inv.days_unpaid}d)` : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <span className={`text-sm font-bold ${text}`}>
            {inv.currency} {Number(inv.total_amount).toFixed(2)}
          </span>
          <span className={`text-xs ${textMuted}`}>{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className={`px-4 pb-4 border-t ${border}`}>
          {/* Shipment & client info */}
          <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-xs">
            <div>
              <span className={textMuted}>Tracking: </span>
              <span className={`font-medium ${text}`}>{inv.cargo_tracking}</span>
            </div>
            {showClient && inv.client_name && (
              <div>
                <span className={textMuted}>Client: </span>
                <span className={`font-medium ${text}`}>{inv.client_name}</span>
              </div>
            )}
            <div>
              <span className={textMuted}>Date: </span>
              <span className={`font-medium ${text}`}>
                {new Date(inv.created_at).toLocaleDateString()}
              </span>
            </div>
            {inv.issued_at && (
              <div>
                <span className={textMuted}>Issued: </span>
                <span className={`font-medium ${text}`}>
                  {new Date(inv.issued_at).toLocaleDateString()}
                </span>
              </div>
            )}
            {inv.paid_at && (
              <div>
                <span className={textMuted}>Paid: </span>
                <span className={`font-medium ${text}`}>
                  {new Date(inv.paid_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Charges breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 mt-3 text-xs">
            <div className="flex justify-between">
              <span className={textMuted}>Freight</span>
              <span className={text}>{inv.currency} {Number(inv.freight_charge).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className={textMuted}>Handling</span>
              <span className={text}>{inv.currency} {Number(inv.handling_fee).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className={textMuted}>Insurance</span>
              <span className={text}>{inv.currency} {Number(inv.insurance).toFixed(2)}</span>
            </div>
            {(Number(inv.customs_duty) > 0 || inv.invoice_type === "final") && (
              <div className="flex justify-between">
                <span className={textMuted}>Customs Duty</span>
                <span className={text}>{inv.currency} {Number(inv.customs_duty).toFixed(2)}</span>
              </div>
            )}
            {(Number(inv.excise_duty) > 0 || inv.invoice_type === "final") && (
              <div className="flex justify-between">
                <span className={textMuted}>Excise Duty</span>
                <span className={text}>{inv.currency} {Number(inv.excise_duty).toFixed(2)}</span>
              </div>
            )}
            {(Number(inv.rdl) > 0 || inv.invoice_type === "final") && (
              <div className="flex justify-between">
                <span className={textMuted}>RDL</span>
                <span className={text}>{inv.currency} {Number(inv.rdl).toFixed(2)}</span>
              </div>
            )}
            {(Number(inv.idf) > 0 || inv.invoice_type === "final") && (
              <div className="flex justify-between">
                <span className={textMuted}>IDF</span>
                <span className={text}>{inv.currency} {Number(inv.idf).toFixed(2)}</span>
              </div>
            )}
            {(Number(inv.clearance_fee) > 0 || inv.invoice_type === "final") && (
              <div className="flex justify-between">
                <span className={textMuted}>Clearance</span>
                <span className={text}>{inv.currency} {Number(inv.clearance_fee).toFixed(2)}</span>
              </div>
            )}
            {Number(inv.other_charges) > 0 && (
              <div className="flex justify-between">
                <span className={textMuted}>Other</span>
                <span className={text}>{inv.currency} {Number(inv.other_charges).toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Clearance status badge for final invoices */}
          {inv.invoice_type === "final" && (
            <div className="mt-2">
              {inv.clearance_charges_confirmed ? (
                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                  isDark ? "bg-green-900/40 text-green-300" : "bg-green-100 text-green-700"
                }`}>
                  ✓ Clearance Charges Confirmed
                </span>
              ) : (
                <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                  isDark ? "bg-yellow-900/40 text-yellow-300" : "bg-yellow-100 text-yellow-800"
                }`}>
                  ⚠ Clearance charges pending — invoice cannot be issued until confirmed
                </span>
              )}
            </div>
          )}

          {/* Totals */}
          <div className={`mt-3 pt-2 border-t ${border} text-xs space-y-1`}>
            <div className="flex justify-between">
              <span className={textMuted}>Subtotal</span>
              <span className={text}>{inv.currency} {Number(inv.subtotal).toFixed(2)}</span>
            </div>
            {Number(inv.tax_rate) > 0 && (
              <div className="flex justify-between">
                <span className={textMuted}>Tax ({inv.tax_rate}%)</span>
                <span className={text}>{inv.currency} {Number(inv.tax_amount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-sm pt-1">
              <span className={text}>Total</span>
              <span className={text}>{inv.currency} {Number(inv.total_amount).toFixed(2)}</span>
            </div>
          </div>

          {/* Notes */}
          {inv.notes && (
            <p className={`mt-2 text-xs italic ${textMuted}`}>{inv.notes}</p>
          )}

          {/* Insurance update for final invoices */}
          {canEditClearance && inv.invoice_type === "final" && inv.clearance_charges_confirmed && Number(inv.insurance) === 0 && (
            <div className={`mt-3 pt-3 border-t ${border}`}>
              <p className={`text-xs font-semibold mb-2 ${isDark ? "text-amber-300" : "text-amber-800"}`}>
                Update Insurance Cost (at dispatch)
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Insurance amount"
                  className={`flex-1 px-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 ${
                    isDark
                      ? "bg-[#0d0f14] border-[#2a3045] text-[#f0f2f8] focus:ring-amber-500"
                      : "border-amber-300 focus:ring-amber-500"
                  }`}
                  id={`ins-panel-${inv.id}`}
                />
                <button
                  onClick={async () => {
                    const val = document.getElementById(`ins-panel-${inv.id}`).value;
                    if (!val) return;
                    try {
                      const res = await fetch(`${baseUrl}/shipments/invoices/${inv.id}/update-insurance/`, {
                        method: "PATCH", headers, body: JSON.stringify({ insurance: parseFloat(val) }),
                      });
                      if (!res.ok) { const e = await res.json(); alert(e.error || "Failed"); return; }
                      onRefresh();
                    } catch (e) { alert("Error: " + e.message); }
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition ${
                    isDark ? "bg-amber-500 text-black hover:bg-amber-400" : "bg-amber-600 text-white hover:bg-amber-700"
                  }`}
                >
                  Update
                </button>
              </div>
            </div>
          )}

          {/* Record Payment for issued final invoices */}
          {canRecordPayment && inv.invoice_type === "final" && inv.status === "issued" && (
            <div className={`mt-3 pt-3 border-t ${border}`}>
              <p className={`text-xs font-semibold mb-2 ${isDark ? "text-green-300" : "text-green-800"}`}>
                Record Payment
              </p>
              {!payMethodForm ? (
                <button
                  onClick={() => setPayMethodForm({ method: "", reference: "" })}
                  className={`px-4 py-2 text-xs font-semibold rounded transition ${
                    isDark ? "bg-green-600 text-white hover:bg-green-500" : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  Record Payment
                </button>
              ) : (
                <div className="space-y-3">
                  {/* Payment Method */}
                  <div>
                    <label className={`block text-xs font-medium mb-1.5 ${text}`}>
                      Payment Method <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      {[
                        { key: "cash", label: "💵 Cash" },
                        { key: "bank", label: "🏦 Bank Transfer" },
                        { key: "mpesa", label: "📱 M-Pesa" },
                        { key: "visa", label: "💳 Visa" },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setPayMethodForm(prev => ({ ...prev, method: key }))}
                          className={`flex-1 px-3 py-2 text-xs font-semibold rounded-lg border-2 transition ${
                            payMethodForm.method === key
                              ? isDark
                                ? "border-green-500 bg-green-900/30 text-green-300"
                                : "border-green-500 bg-green-50 text-green-700"
                              : isDark
                                ? "border-[#2a3045] bg-[#0d0f14] text-[#7a8499] hover:text-[#f0f2f8]"
                                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Reference */}
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${textMuted}`}>
                      Reference / Receipt No. (optional)
                    </label>
                    <input
                      type="text"
                      value={payMethodForm.reference}
                      onChange={(e) => setPayMethodForm(prev => ({ ...prev, reference: e.target.value }))}
                      placeholder={payMethodForm.method === "bank" ? "Bank transaction ID" : "Receipt number"}
                      className={`w-full px-3 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 ${
                        isDark
                          ? "bg-[#0d0f14] border-[#2a3045] text-[#f0f2f8] focus:ring-green-500"
                          : "border-gray-300 focus:ring-green-500"
                      }`}
                    />
                  </div>
                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      disabled={paymentLoading || !payMethodForm.method}
                      onClick={async () => {
                        setPaymentLoading(true);
                        try {
                          const res = await fetch(`${baseUrl}/shipments/invoices/${inv.id}/record-payment/`, {
                            method: "POST", headers,
                            body: JSON.stringify({
                              payment_method: payMethodForm.method,
                              payment_reference: payMethodForm.reference.trim(),
                            }),
                          });
                          if (!res.ok) { const e = await res.json(); alert(e.error || "Failed"); return; }
                          setPayMethodForm(null);
                          onRefresh();
                        } catch (e) { alert("Error: " + e.message); }
                        finally { setPaymentLoading(false); }
                      }}
                      className={`px-4 py-2 text-xs font-semibold rounded disabled:opacity-50 transition ${
                        isDark ? "bg-green-600 text-white hover:bg-green-500" : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {paymentLoading ? "Recording..." : "Confirm Payment"}
                    </button>
                    <button
                      onClick={() => setPayMethodForm(null)}
                      className={`px-3 py-2 text-xs rounded border transition ${
                        isDark ? "border-[#2a3045] text-[#7a8499] hover:text-[#f0f2f8]" : "border-gray-300 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Payment info for paid invoices */}
          {inv.status === "paid" && inv.payment_method && (
            <div className={`mt-3 pt-3 border-t ${border}`}>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <div>
                  <span className={textMuted}>Paid via: </span>
                  <span className={`font-medium ${text}`}>
                    {{ cash: "💵 Cash", bank: "🏦 Bank Transfer", mpesa: "📱 M-Pesa", visa: "💳 Visa" }[inv.payment_method] || inv.payment_method}
                  </span>
                </div>
                {inv.payment_reference && (
                  <div>
                    <span className={textMuted}>Ref: </span>
                    <span className={`font-medium ${text}`}>{inv.payment_reference}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Clearance charges form for draft final invoices */}
          {canEditClearance && inv.invoice_type === "final" && !inv.clearance_charges_confirmed && (
            <div className={`mt-3 pt-3 border-t ${border}`}>
              <p className={`text-xs font-semibold mb-1 ${isDark ? "text-emerald-300" : "text-emerald-800"}`}>
                Confirm Clearance Charges
              </p>
              <p className={`text-xs mb-3 ${textMuted}`}>
                All clearance charges must be entered before this invoice can be issued.
              </p>
              {!clearanceForm ? (
                <button
                  onClick={() => setClearanceForm({
                    customs_duty: inv.customs_duty || "",
                    excise_duty: inv.excise_duty || "",
                    rdl: inv.rdl || "",
                    idf: inv.idf || "",
                    clearance_fee: inv.clearance_fee || "",
                    other_charges: inv.other_charges || "",
                    tax_rate: inv.tax_rate || 16,
                  })}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition ${
                    isDark ? "bg-emerald-600 text-white hover:bg-emerald-500" : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  Enter Clearance Charges
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: "customs_duty", label: "Customs Duty" },
                      { key: "excise_duty", label: "Excise Duty" },
                      { key: "rdl", label: "RDL" },
                      { key: "idf", label: "IDF" },
                      { key: "clearance_fee", label: "Clearance Fee" },
                      { key: "other_charges", label: "Other Charges" },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className={`block text-xs mb-0.5 ${textMuted}`}>{label}</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={clearanceForm[key] ?? ""}
                          onChange={(e) => setClearanceForm(prev => ({ ...prev, [key]: e.target.value }))}
                          className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 ${
                            isDark
                              ? "bg-[#0d0f14] border-[#2a3045] text-[#f0f2f8] focus:ring-emerald-500"
                              : "border-gray-300 focus:ring-emerald-500"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className={`block text-xs mb-0.5 ${textMuted}`}>VAT Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={clearanceForm.tax_rate ?? 16}
                      onChange={(e) => setClearanceForm(prev => ({ ...prev, tax_rate: e.target.value }))}
                      className={`w-32 px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 ${
                        isDark
                          ? "bg-[#0d0f14] border-[#2a3045] text-[#f0f2f8] focus:ring-emerald-500"
                          : "border-gray-300 focus:ring-emerald-500"
                      }`}
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={async () => {
                        setClearanceLoading(true);
                        try {
                          const res = await fetch(`${baseUrl}/shipments/invoices/${inv.id}/confirm-clearance/`, {
                            method: "POST", headers, body: JSON.stringify(clearanceForm),
                          });
                          if (!res.ok) { const e = await res.json(); alert(e.error || "Failed"); return; }
                          setClearanceForm(null);
                          onRefresh();
                        } catch (e) { alert("Error: " + e.message); }
                        finally { setClearanceLoading(false); }
                      }}
                      disabled={clearanceLoading}
                      className={`px-4 py-2 text-xs font-semibold rounded disabled:opacity-50 transition ${
                        isDark ? "bg-emerald-600 text-white hover:bg-emerald-500" : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      {clearanceLoading ? "Confirming..." : "Confirm & Issue Invoice"}
                    </button>
                    <button
                      onClick={() => setClearanceForm(null)}
                      className={`px-3 py-2 text-xs rounded border transition ${
                        isDark ? "border-[#2a3045] text-[#7a8499] hover:text-[#f0f2f8]" : "border-gray-300 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Cancel Proforma Invoice (CLIENTADMIN only, proforma, not already cancelled) */}
          {canCancelProforma && inv.invoice_type === "proforma" && !isArchived && inv.status !== "cancelled" && (
            <div className={`mt-3 pt-3 border-t ${border}`}>
              {!showCancelForm ? (
                <button
                  onClick={() => setShowCancelForm(true)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition ${
                    isDark ? "bg-red-600 text-white hover:bg-red-500" : "bg-red-600 text-white hover:bg-red-700"
                  }`}
                >
                  Request Invoice Cancellation
                </button>
              ) : (
                <div className="space-y-2">
                  <p className={`text-xs font-semibold ${isDark ? "text-red-300" : "text-red-800"}`}>
                    Request Cancellation for {inv.invoice_number}
                  </p>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={2}
                    placeholder="Reason for cancellation..."
                    className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 ${
                      isDark
                        ? "bg-[#0d0f14] border-[#2a3045] text-[#f0f2f8] focus:ring-red-500"
                        : "border-gray-300 focus:ring-red-500"
                    }`}
                  />
                  <div className="flex gap-2">
                    <button
                      disabled={cancelLoading || !cancelReason.trim()}
                      onClick={async () => {
                        setCancelLoading(true);
                        try {
                          const res = await fetch(`${baseUrl}/shipments/invoices/${inv.id}/request-cancellation/`, {
                            method: "POST", headers, body: JSON.stringify({ reason: cancelReason.trim() }),
                          });
                          if (!res.ok) { const e = await res.json(); alert(e.error || "Failed"); return; }
                          alert("Cancellation request submitted. Awaiting SuperAdmin approval.");
                          setShowCancelForm(false);
                          setCancelReason("");
                          onRefresh();
                        } catch (e) { alert("Error: " + e.message); }
                        finally { setCancelLoading(false); }
                      }}
                      className={`px-4 py-2 text-xs font-semibold rounded disabled:opacity-50 transition ${
                        isDark ? "bg-red-600 text-white hover:bg-red-500" : "bg-red-600 text-white hover:bg-red-700"
                      }`}
                    >
                      {cancelLoading ? "Submitting..." : "Submit Request"}
                    </button>
                    <button
                      onClick={() => { setShowCancelForm(false); setCancelReason(""); }}
                      className={`px-3 py-2 text-xs rounded border transition ${
                        isDark ? "border-[#2a3045] text-[#7a8499] hover:text-[#f0f2f8]" : "border-gray-300 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Request Credit Note (CLIENTADMIN/CARGOADMIN, issued or paid invoices) */}
          {canRequestCreditNote && !isProforma && (inv.status === "issued" || inv.status === "paid") && (
            <div className={`mt-3 pt-3 border-t ${border}`}>
              {!creditNoteForm ? (
                <button
                  onClick={() => setCreditNoteForm({ amount: "", reason: "" })}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition ${
                    isDark ? "bg-orange-600 text-white hover:bg-orange-500" : "bg-orange-600 text-white hover:bg-orange-700"
                  }`}
                >
                  Request Credit Note
                </button>
              ) : (
                <div className="space-y-2">
                  <p className={`text-xs font-semibold ${isDark ? "text-orange-300" : "text-orange-800"}`}>
                    Credit Note for {inv.invoice_number} (Max: {inv.currency} {Number(inv.total_amount).toFixed(2)})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className={`block text-xs mb-0.5 ${textMuted}`}>Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        max={inv.total_amount}
                        value={creditNoteForm.amount}
                        onChange={(e) => setCreditNoteForm(prev => ({ ...prev, amount: e.target.value }))}
                        className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-1 ${
                          isDark
                            ? "bg-[#0d0f14] border-[#2a3045] text-[#f0f2f8] focus:ring-orange-500"
                            : "border-gray-300 focus:ring-orange-500"
                        }`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-xs mb-0.5 ${textMuted}`}>Reason</label>
                    <textarea
                      value={creditNoteForm.reason}
                      onChange={(e) => setCreditNoteForm(prev => ({ ...prev, reason: e.target.value }))}
                      rows={2}
                      placeholder="Reason for credit note..."
                      className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 ${
                        isDark
                          ? "bg-[#0d0f14] border-[#2a3045] text-[#f0f2f8] focus:ring-orange-500"
                          : "border-gray-300 focus:ring-orange-500"
                      }`}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={creditNoteLoading || !creditNoteForm.amount || !creditNoteForm.reason.trim()}
                      onClick={async () => {
                        setCreditNoteLoading(true);
                        try {
                          const res = await fetch(`${baseUrl}/shipments/invoices/${inv.id}/request-credit-note/`, {
                            method: "POST", headers, body: JSON.stringify({
                              amount: parseFloat(creditNoteForm.amount),
                              reason: creditNoteForm.reason.trim(),
                            }),
                          });
                          if (!res.ok) { const e = await res.json(); alert(e.error || "Failed"); return; }
                          alert("Credit note request submitted. Awaiting SuperAdmin approval.");
                          setCreditNoteForm(null);
                          onRefresh();
                        } catch (e) { alert("Error: " + e.message); }
                        finally { setCreditNoteLoading(false); }
                      }}
                      className={`px-4 py-2 text-xs font-semibold rounded disabled:opacity-50 transition ${
                        isDark ? "bg-orange-600 text-white hover:bg-orange-500" : "bg-orange-600 text-white hover:bg-orange-700"
                      }`}
                    >
                      {creditNoteLoading ? "Submitting..." : "Submit Credit Note Request"}
                    </button>
                    <button
                      onClick={() => setCreditNoteForm(null)}
                      className={`px-3 py-2 text-xs rounded border transition ${
                        isDark ? "border-[#2a3045] text-[#7a8499] hover:text-[#f0f2f8]" : "border-gray-300 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Archived notice for retired/expired proformas */}
          {isArchived && (
            <div className={`mt-3 pt-3 border-t ${border}`}>
              <p className={`text-xs italic ${
                isDark ? "text-slate-500" : "text-slate-400"
              }`}>
                {inv.status === "retired"
                  ? "This quotation has been retired — a final invoice has been generated."
                  : "This quotation has expired (older than 2 weeks) and is archived for records only."}
              </p>
            </div>
          )}

          {/* Print / Send Quote button — hidden for archived proformas */}
          {!isArchived && (
            <div className={`mt-3 pt-3 border-t ${border} flex gap-2`}>
              <button
                onClick={() => setShowPrint(true)}
                className={`px-4 py-2 text-xs font-semibold rounded transition ${
                  isDark ? "bg-gray-600 text-white hover:bg-gray-500" : "bg-gray-700 text-white hover:bg-gray-800"
                }`}
              >
                🖨️ {isProforma ? "Print / Send Quote" : "Print Invoice"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Print overlay */}
      {showPrint && (
        <PrintableInvoice
          invoice={inv}
          onClose={() => setShowPrint(false)}
        />
      )}
    </div>
  );
}
