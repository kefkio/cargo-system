// src/components/shared/PrintableInvoice.jsx
import React, { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";

/**
 * Printable invoice matching the Kenyan invoice format:
 *   A. Taxable Services (subject to VAT)
 *   B. Disbursements (Non-VATable — costs incurred on behalf of client)
 *   C. Grand Total
 *
 * Props:
 *   - invoice: full invoice object from API
 *   - companyName: company name string
 *   - companyaddress: company address string
 *   - companyTagline: company tagline or description
 *   - companyPin: KRA PIN
 *   - onClose: callback to close the print view
 */
export default function PrintableInvoice({
  invoice,
  companyName = "FPC Cargo",
  companyTagline = "Cargo Handling & Logistics",
  companyPin = "P0XXXXXXXX",
  onClose,
}) {
  const printRef = useRef();

  const inv = invoice;
  const cur = inv.currency || "KES";
  const isProforma = inv.invoice_type === "proforma";
  const fmt = (v) => Number(v || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Section A: Taxable services
  const taxableRows = [
    { desc: "Freight Charge (Cargo Handling)", amt: inv.freight_charge },
    { desc: "Handling Fee", amt: inv.handling_fee },
    { desc: "Insurance", amt: inv.insurance },
    ...(Number(inv.other_charges) > 0 ? [{ desc: "Other Charges", amt: inv.other_charges }] : []),
  ].filter((r) => Number(r.amt) > 0);

  const taxableSubtotal = Number(inv.taxable_subtotal || 0);
  const vatRate = Number(inv.tax_rate || 0);
  const vatAmount = Number(inv.tax_amount || 0);
  const taxableTotal = taxableSubtotal + vatAmount;

  // Section B: Disbursements (Non-VATable)
  const disbursementRows = [
    { desc: "Import Duty", amt: inv.customs_duty },
    { desc: "Excise Duty", amt: inv.excise_duty },
    { desc: "Reimbursable VAT", amt: inv.reimbursable_vat },
    { desc: "Import VAT (KRA)", amt: inv.import_vat },
    { desc: "Port Charges", amt: inv.port_charges },
    { desc: "Clearance Fees", amt: inv.clearance_fee },
    { desc: "Railway Development Levy (RDL)", amt: inv.rdl },
    { desc: "Import Declaration Fee (IDF)", amt: inv.idf },
  ].filter((r) => Number(r.amt) > 0);

  const disbursementsSubtotal = Number(inv.disbursements_subtotal || 0);

  // Section C: Grand Total
  const grandTotal = Number(inv.total_amount || 0);

  const statusBadgeClass = { paid: "pi-badge-paid", issued: "pi-badge-issued" }[inv.status] ?? "pi-badge-draft";

  const handlePrint = () => {
    const content = printRef.current;
    const win = window.open("", "_blank");
    win.document.write(`
      <html>
        <head>
          <title>${inv.invoice_number}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; padding: 40px; font-size: 13px; }
            .pi-header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #1a1a1a; padding-bottom: 12px; }
            .pi-logo-row { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 6px; }
            .pi-logo { width: 48px; height: 48px; border-radius: 50%; background-color: #0B3D91; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 18px; flex-shrink: 0; }
            .pi-company-name { font-size: 22px; font-weight: 700; margin: 0; color: #0B3D91; }
            .pi-company-sub { color: #555; margin-bottom: 2px; }
            .pi-proforma-banner { background: #fff3e0; border: 2px solid #e65100; color: #e65100; text-align: center; padding: 8px; margin-bottom: 16px; font-weight: 700; font-size: 13px; border-radius: 4px; }
            .pi-meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; }
            .pi-meta-left { line-height: 1.7; }
            .pi-meta-right { line-height: 1.7; text-align: right; }
            .pi-badge { display: inline-block; padding: 1px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
            .pi-badge-paid { background: #e8f5e9; color: #2e7d32; }
            .pi-badge-issued { background: #e3f2fd; color: #1565c0; }
            .pi-badge-draft { background: #fff3e0; color: #e65100; }
            .pi-section { margin-top: 16px; }
            .pi-section-title { font-size: 14px; font-weight: 700; padding: 8px 12px; }
            .pi-section-a { background: #e8f5e9; color: #2e7d32; }
            .pi-section-b { background: #fff3e0; color: #e65100; }
            .pi-section-c { background: #e3f2fd; color: #1565c0; }
            .pi-section-note { font-size: 11px; color: #888; padding: 4px 12px; font-style: italic; }
            .pi-table { width: 100%; border-collapse: collapse; }
            .pi-th { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e0e0e0; font-weight: 600; background: #fafafa; font-size: 12px; text-transform: uppercase; color: #666; }
            .pi-th-r { text-align: right; }
            .pi-td { padding: 8px 12px; border-bottom: 1px solid #e0e0e0; }
            .pi-td-r { text-align: right; font-variant-numeric: tabular-nums; }
            .pi-td-muted { color: #555; }
            .pi-td-empty { color: #999; font-style: italic; }
            .pi-td-subtotal { padding: 8px 12px; font-weight: 600; border-top: 2px solid #ccc; }
            .pi-td-subtotal-r { text-align: right; }
            .pi-td-total { padding: 8px 12px; font-weight: 700; border-top: 2px solid #1a1a1a; }
            .pi-td-total-r { text-align: right; }
            .pi-td-grand { padding: 12px; font-weight: 700; font-size: 16px; border-top: 3px double #1a1a1a; }
            .pi-td-grand-r { text-align: right; }
            .pi-payment { margin-top: 20px; padding: 10px 12px; background: #e8f5e9; border-radius: 4px; font-size: 12px; }
            .pi-notes { margin-top: 16px; font-size: 11px; color: #888; font-style: italic; }
            .pi-disclaimer { background: #fffde7; border: 1px solid #f9a825; color: #795548; padding: 10px 14px; margin-top: 20px; font-size: 11px; border-radius: 4px; line-height: 1.5; }
            .pi-qr-section { display: flex; align-items: flex-start; justify-content: space-between; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0; }
            .pi-qr-info { font-size: 11px; color: #666; line-height: 1.6; }
            .pi-qr-info strong { color: #333; }
            .pi-qr-hint { margin-top: 4px; font-size: 10px; color: #999; }
            .pi-footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #ccc; font-size: 11px; color: #888; text-align: center; }
            @media print {
              body { padding: 20px; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>${content.innerHTML}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4">
        {/* Toolbar (non-printable) */}
        <div className="flex items-center justify-between px-6 py-3 bg-gray-100 rounded-t-lg border-b">
          <span className="text-sm font-semibold text-gray-700">
            {isProforma ? "Proforma Invoice Preview" : "Invoice Preview"}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-sm font-semibold rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
            >
              Close
            </button>
          </div>
        </div>

        {/* Printable content */}
        <div ref={printRef} className="p-8 pi-root">
          {/* Header */}
          <div className="pi-header">
            <div className="pi-logo-row">
              <div className="pi-logo">FP</div>
              <h1 className="pi-company-name">{companyName}</h1>
            </div>
            <p className="pi-company-sub">{companyTagline}</p>
            <p className="pi-company-sub">KRA PIN: <strong>{companyPin}</strong></p>
          </div>

          {/* Proforma banner */}
          {isProforma && (
            <div className="pi-proforma-banner">
              PROFORMA INVOICE — FOR QUOTATION PURPOSES ONLY
            </div>
          )}

          {/* Invoice meta */}
          <div className="pi-meta">
            <div className="pi-meta-left">
              <div><strong>Invoice No:</strong> {inv.invoice_number}</div>
              <div><strong>Type:</strong> {inv.invoice_type === "proforma" ? "Proforma Invoice" : "Final Invoice"}</div>
              <div>
                <strong>Status:</strong>{" "}
                <span className={`pi-badge ${statusBadgeClass}`}>
                  {inv.status.toUpperCase()}
                </span>
              </div>
            </div>
            <div className="pi-meta-right">
              <div><strong>Date:</strong> {new Date(inv.created_at).toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}</div>
              <div><strong>Client:</strong> {inv.client_name || "—"}</div>
              {inv.client_kra_pin && (
                <div><strong>Client KRA PIN:</strong> {inv.client_kra_pin}</div>
              )}
              <div><strong>Tracking:</strong> {inv.cargo_tracking || "—"}</div>
            </div>
          </div>

          {/* Section A: Taxable Services */}
          <div>
            <div className="pi-section-title pi-section-a">A. Taxable Services</div>
            <table className="pi-table">
              <thead>
                <tr>
                  <th className="pi-th">Description</th>
                  <th className="pi-th pi-th-r">Amount ({cur})</th>
                </tr>
              </thead>
              <tbody>
                {taxableRows.map((row, i) => (
                  <tr key={i}>
                    <td className="pi-td">{row.desc}</td>
                    <td className="pi-td pi-td-r">{fmt(row.amt)}</td>
                  </tr>
                ))}
                {taxableRows.length === 0 && (
                  <tr>
                    <td colSpan={2} className="pi-td pi-td-empty">No taxable charges</td>
                  </tr>
                )}
                <tr>
                  <td className="pi-td-subtotal">Subtotal (Taxable)</td>
                  <td className="pi-td-subtotal pi-td-subtotal-r">{fmt(taxableSubtotal)}</td>
                </tr>
                {vatRate > 0 && (
                  <tr>
                    <td className="pi-td pi-td-muted">VAT ({vatRate}%)</td>
                    <td className="pi-td pi-td-muted pi-td-r">{fmt(vatAmount)}</td>
                  </tr>
                )}
                <tr>
                  <td className="pi-td-total">Total (Taxable)</td>
                  <td className="pi-td-total pi-td-total-r">{fmt(taxableTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section B: Disbursements (Non-VATable) — hide for proformas if all zero */}
          {(!isProforma || disbursementsSubtotal > 0) && (
            <div className="pi-section">
              <div className="pi-section-title pi-section-b">B. Disbursements (Non-VATable)</div>
              <p className="pi-section-note">
                Costs incurred on behalf of the client — out-of-scope for VAT
              </p>
              <table className="pi-table">
                <thead>
                  <tr>
                    <th className="pi-th">Description</th>
                    <th className="pi-th pi-th-r">Amount ({cur})</th>
                  </tr>
                </thead>
                <tbody>
                  {disbursementRows.map((row, i) => (
                    <tr key={i}>
                      <td className="pi-td">{row.desc}</td>
                      <td className="pi-td pi-td-r">{fmt(row.amt)}</td>
                    </tr>
                  ))}
                  {disbursementRows.length === 0 && (
                    <tr>
                      <td colSpan={2} className="pi-td pi-td-empty">No disbursement charges entered</td>
                    </tr>
                  )}
                  <tr>
                    <td className="pi-td-subtotal">Subtotal (Disbursements)</td>
                    <td className="pi-td-subtotal pi-td-subtotal-r">{fmt(disbursementsSubtotal)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Section C: Grand Total */}
          <div className="pi-section">
            <div className="pi-section-title pi-section-c">C. Grand Total</div>
            <table className="pi-table">
              <thead>
                <tr>
                  <th className="pi-th">Description</th>
                  <th className="pi-th pi-th-r">Amount ({cur})</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="pi-td-grand">Total Payable</td>
                  <td className="pi-td-grand pi-td-grand-r">{cur} {fmt(grandTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment info */}
          {inv.status === "paid" && (
            <div className="pi-payment">
              <strong>Payment Received:</strong>{" "}
              {{ cash: "Cash", bank: "Bank Transfer", mpesa: "M-Pesa", visa: "Visa" }[inv.payment_method] || inv.payment_method}
              {inv.payment_reference ? ` — Ref: ${inv.payment_reference}` : ""}
              {inv.paid_at ? ` — ${new Date(inv.paid_at).toLocaleDateString("en-KE", { year: "numeric", month: "long", day: "numeric" })}` : ""}
            </div>
          )}

          {/* Notes */}
          {inv.notes && (
            <div className="pi-notes">
              <strong>Notes:</strong> {inv.notes}
            </div>
          )}

          {/* Proforma disclaimer */}
          {isProforma && (
            <div className="pi-disclaimer">
              <strong>Disclaimer:</strong> This is a <strong>Proforma Invoice</strong> issued for quotation and estimation
              purposes only. It is <strong>not a tax invoice</strong> and does not constitute a demand for payment.
              All charges shown are estimated and may vary upon actual clearance and dispatch.
              A final tax invoice will be issued upon confirmation of all charges.
            </div>
          )}

          {/* QR Code Section */}
          <div className="pi-qr-section">
            <div className="pi-qr-info">
              <div><strong>Invoice:</strong> {inv.invoice_number}</div>
              <div><strong>Tracking:</strong> {inv.cargo_tracking || "—"}</div>
              <div><strong>Amount:</strong> {cur} {fmt(grandTotal)}</div>
              <div className="pi-qr-hint">Scan QR to verify invoice</div>
            </div>
            <QRCodeSVG
              value={`INV:${inv.invoice_number}|TRK:${inv.cargo_tracking || ""}|AMT:${cur}${fmt(grandTotal)}|PIN:${companyPin}`}
              size={80}
              level="M"
              includeMargin={false}
            />
          </div>

          {/* Footer */}
          <div className="pi-footer">
            {isProforma
              ? "This is a computer-generated proforma invoice for quotation purposes only. Not a tax invoice."
              : "This is a computer-generated invoice. Disbursement items are out-of-scope for VAT as per KRA guidelines."}
          </div>
        </div>
      </div>
    </div>
  );
}
