// src/components/super-admin/CancellationsPanel.jsx
import React, { useEffect, useState } from "react";

export default function CancellationsPanel() {
  const [cancellations, setCancellations] = useState([]);
  const [creditNotes, setCreditNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("cancellations"); // cancellations | creditNotes
  const [actionLoading, setActionLoading] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL.replace(/\/accounts\/?$/, "");
  const token = localStorage.getItem("access");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      setLoading(true);
      const [cancRes, cnRes] = await Promise.all([
        fetch(`${API_URL}/shipments/cancellations/`, { headers }),
        fetch(`${API_URL}/shipments/credit-notes/`, { headers }),
      ]);
      if (cancRes.ok) setCancellations(await cancRes.json());
      if (cnRes.ok) setCreditNotes(await cnRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancellationAction(id, action) {
    setActionLoading(`canc-${id}-${action}`);
    try {
      const res = await fetch(`${API_URL}/shipments/cancellations/${id}/${action}/`, {
        method: "POST", headers,
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || `Failed to ${action}`);
        return;
      }
      await fetchAll();
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleApproveCreditNote(id) {
    setActionLoading(`cn-${id}`);
    try {
      const res = await fetch(`${API_URL}/shipments/credit-notes/${id}/approve/`, {
        method: "POST", headers,
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to approve");
        return;
      }
      await fetchAll();
    } catch (e) {
      alert("Error: " + e.message);
    } finally {
      setActionLoading(null);
    }
  }

  const pendingCancellations = cancellations.filter((c) => c.status === "pending");
  const resolvedCancellations = cancellations.filter((c) => c.status !== "pending");
  const pendingCreditNotes = creditNotes.filter((c) => !c.approved_by);
  const approvedCreditNotes = creditNotes.filter((c) => c.approved_by);

  if (loading) return <p className="text-[#7a8499] py-4">Loading...</p>;
  if (error) return <p className="text-red-500 py-4">{error}</p>;

  const tabBtn = (key, label, count) => (
    <button
      key={key}
      onClick={() => setTab(key)}
      className={`px-4 py-2 text-sm font-medium rounded-t transition-all ${
        tab === key
          ? "text-[#e8ff47] border-b-2 border-[#e8ff47] bg-[#e8ff47]/5"
          : "text-[#7a8499] hover:text-[#f0f2f8] hover:bg-[#ffffff08]"
      }`}
    >
      {label} {count > 0 && <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-red-600 text-white">{count}</span>}
    </button>
  );

  return (
    <div>
      <div className="flex gap-1 border-b border-[#2a3045] mb-4">
        {tabBtn("cancellations", "Cancellation Requests", pendingCancellations.length)}
        {tabBtn("creditNotes", "Credit Notes", pendingCreditNotes.length)}
      </div>

      {tab === "cancellations" && (
        <div className="space-y-3">
          {cancellations.length === 0 ? (
            <p className="text-[#7a8499] text-sm italic">No cancellation requests.</p>
          ) : (
            <>
              {pendingCancellations.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-[#e8ff47] uppercase tracking-widest mb-2">
                    Pending Approval ({pendingCancellations.length})
                  </h3>
                  {pendingCancellations.map((cr) => (
                    <CancellationCard
                      key={cr.id}
                      cr={cr}
                      actionLoading={actionLoading}
                      onApprove={() => handleCancellationAction(cr.id, "approve")}
                      onReject={() => handleCancellationAction(cr.id, "reject")}
                    />
                  ))}
                </div>
              )}
              {resolvedCancellations.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-[#7a8499] uppercase tracking-widest mb-2 mt-4">
                    Resolved ({resolvedCancellations.length})
                  </h3>
                  {resolvedCancellations.map((cr) => (
                    <CancellationCard key={cr.id} cr={cr} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {tab === "creditNotes" && (
        <div className="space-y-3">
          {creditNotes.length === 0 ? (
            <p className="text-[#7a8499] text-sm italic">No credit notes.</p>
          ) : (
            <>
              {pendingCreditNotes.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-[#e8ff47] uppercase tracking-widest mb-2">
                    Pending Approval ({pendingCreditNotes.length})
                  </h3>
                  {pendingCreditNotes.map((cn) => (
                    <CreditNoteCard
                      key={cn.id}
                      cn={cn}
                      actionLoading={actionLoading}
                      onApprove={() => handleApproveCreditNote(cn.id)}
                    />
                  ))}
                </div>
              )}
              {approvedCreditNotes.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-[#7a8499] uppercase tracking-widest mb-2 mt-4">
                    Approved ({approvedCreditNotes.length})
                  </h3>
                  {approvedCreditNotes.map((cn) => (
                    <CreditNoteCard key={cn.id} cn={cn} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function CancellationCard({ cr, actionLoading, onApprove, onReject }) {
  const isPending = cr.status === "pending";
  const statusColors = {
    pending: "bg-yellow-900/40 text-yellow-300",
    approved: "bg-green-900/40 text-green-300",
    rejected: "bg-red-900/40 text-red-300",
  };

  return (
    <div className="bg-[#0d0f14] border border-[#2a3045] rounded-lg p-4 mb-2">
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusColors[cr.status]}`}>
              {cr.status.toUpperCase()}
            </span>
            <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-900/40 text-blue-300">
              {cr.request_type === "shipment" ? "Shipment" : "Invoice"}
            </span>
          </div>
          <p className="text-sm text-[#f0f2f8]">
            <span className="text-[#7a8499]">Target:</span> {cr.target_display}
          </p>
          <p className="text-sm text-[#f0f2f8]">
            <span className="text-[#7a8499]">Requested by:</span> {cr.requested_by_name}
          </p>
          <p className="text-sm text-[#f0f2f8]">
            <span className="text-[#7a8499]">Reason:</span> {cr.reason}
          </p>
          <p className="text-xs text-[#7a8499]">
            {new Date(cr.created_at).toLocaleString()}
          </p>
          {cr.reviewed_by_name && (
            <p className="text-xs text-[#7a8499]">
              Reviewed by: {cr.reviewed_by_name} at {new Date(cr.reviewed_at).toLocaleString()}
            </p>
          )}
        </div>
        {isPending && onApprove && onReject && (
          <div className="flex gap-2">
            <button
              disabled={actionLoading === `canc-${cr.id}-approve`}
              onClick={onApprove}
              className="px-3 py-1.5 text-xs font-medium rounded bg-green-600 text-white hover:bg-green-500 disabled:opacity-50 transition"
            >
              {actionLoading === `canc-${cr.id}-approve` ? "..." : "Approve"}
            </button>
            <button
              disabled={actionLoading === `canc-${cr.id}-reject`}
              onClick={onReject}
              className="px-3 py-1.5 text-xs font-medium rounded bg-red-600 text-white hover:bg-red-500 disabled:opacity-50 transition"
            >
              {actionLoading === `canc-${cr.id}-reject` ? "..." : "Reject"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CreditNoteCard({ cn, actionLoading, onApprove }) {
  const isPending = !cn.approved_by;

  return (
    <div className="bg-[#0d0f14] border border-[#2a3045] rounded-lg p-4 mb-2">
      <div className="flex justify-between items-start flex-wrap gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 text-xs font-medium rounded ${
              isPending ? "bg-yellow-900/40 text-yellow-300" : "bg-green-900/40 text-green-300"
            }`}>
              {isPending ? "PENDING" : "APPROVED"}
            </span>
            <span className="text-sm font-semibold text-[#f0f2f8]">{cn.credit_note_number}</span>
          </div>
          <p className="text-sm text-[#f0f2f8]">
            <span className="text-[#7a8499]">Invoice:</span> {cn.invoice_number}
          </p>
          <p className="text-sm text-[#f0f2f8]">
            <span className="text-[#7a8499]">Amount:</span> ${Number(cn.amount).toFixed(2)}
          </p>
          <p className="text-sm text-[#f0f2f8]">
            <span className="text-[#7a8499]">Reason:</span> {cn.reason}
          </p>
          <p className="text-sm text-[#f0f2f8]">
            <span className="text-[#7a8499]">Issued by:</span> {cn.issued_by_name}
          </p>
          <p className="text-xs text-[#7a8499]">
            {new Date(cn.created_at).toLocaleString()}
          </p>
          {cn.approved_by_name && (
            <p className="text-xs text-[#7a8499]">
              Approved by: {cn.approved_by_name} at {new Date(cn.approved_at).toLocaleString()}
            </p>
          )}
        </div>
        {isPending && onApprove && (
          <button
            disabled={actionLoading === `cn-${cn.id}`}
            onClick={onApprove}
            className="px-3 py-1.5 text-xs font-medium rounded bg-green-600 text-white hover:bg-green-500 disabled:opacity-50 transition"
          >
            {actionLoading === `cn-${cn.id}` ? "..." : "Approve"}
          </button>
        )}
      </div>
    </div>
  );
}
