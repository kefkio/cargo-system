// src/components/shipment/ShipmentSticker.jsx
import React, { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

/**
 * Printable cargo sticker with QR code + mandatory sticker attachment confirmation flow.
 *
 * Props:
 *  - shipment: { id, tracking_number, client_name, origin, destination, transport_mode, weight_kg, priority, cargo_type, dest_contact_person, dest_contact_phone, sticker_attached }
 *  - onClose: callback to dismiss (only available after confirmation or if already confirmed)
 *  - onConfirmed: optional callback after successful confirmation
 *  - requireConfirmation: if true, user must print, attach, and upload photo before closing (default: true)
 */
export default function ShipmentSticker({ shipment, onClose, onConfirmed, requireConfirmation = true }) {
  const stickerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Step: 1 = print, 2 = upload photo, 3 = submitting, 4 = done
  const alreadyAttached = shipment.sticker_attached;
  const [step, setStep] = useState(alreadyAttached ? 4 : 1);
  const [hasPrinted, setHasPrinted] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [printCount, setPrintCount] = useState(shipment.sticker_print_count || 0);

  const API_URL = import.meta.env.VITE_API_URL.replace(/\/accounts\/?$/, "");
  const scanUrl = `${window.location.origin}/scan/${shipment.tracking_number}`;

  // Determine the label shown on the sticker based on how many times it's been printed
  function getPrintLabel(count) {
    if (count <= 1) return "ORIGINAL";
    return `REPRINT (${count - 1})`;
  }

  async function recordPrint() {
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`${API_URL}/shipments/admin/record-print/${shipment.id}/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      if (res.ok) {
        const updated = await res.json();
        setPrintCount(updated.sticker_print_count);
        return updated.sticker_print_count;
      }
    } catch (_) {
      // Best-effort; don't block printing
    }
    const next = printCount + 1;
    setPrintCount(next);
    return next;
  }

  async function handlePrint() {
    const content = stickerRef.current;
    if (!content) return;

    // Record the print on the server first, get updated count
    const newCount = await recordPrint();
    const label = getPrintLabel(newCount);

    // Inject the print label into the sticker before capturing HTML
    const labelEl = content.querySelector("[data-print-label]");
    if (labelEl) labelEl.textContent = label;

    const printWindow = window.open("", "_blank", "width=500,height=700");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cargo Sticker — ${shipment.tracking_number}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, Helvetica, sans-serif; }
          @page { size: 4in 6in; margin: 0; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 300);

    setHasPrinted(true);
    if (requireConfirmation && step === 1) {
      setStep(2);
    }
  }

  function handlePhotoSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("Please select a JPEG, PNG, or WebP image");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10MB");
      return;
    }

    setError("");
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleConfirm() {
    if (!photoFile) {
      setError("Please upload a photo of the attached sticker first");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const token = localStorage.getItem("access");
      const formData = new FormData();
      formData.append("sticker_photo", photoFile);

      const res = await fetch(`${API_URL}/shipments/admin/confirm-sticker/${shipment.id}/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to confirm sticker attachment");
      }

      setStep(4);
      if (onConfirmed) {
        const updated = await res.json();
        onConfirmed(updated);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  const canClose = !requireConfirmation || step === 4 || alreadyAttached;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-[440px] w-full overflow-hidden max-h-[95vh] flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-b flex-shrink-0">
          <h3 className="text-sm font-semibold text-gray-700">
            {step === 4 ? "✅ Sticker Confirmed" : "📋 Cargo Sticker"}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              {printCount > 0 ? `🖨 Reprint Sticker (${printCount})` : "🖨 Print Sticker"}
            </button>
            {canClose && (
              <button
                onClick={onClose}
                className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-600 hover:bg-gray-200 transition"
              >
                Close
              </button>
            )}
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Step Indicator (only when requiring confirmation and not done) */}
          {requireConfirmation && step < 4 && (
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center gap-2 text-xs">
                {["Print Sticker", "Upload Photo", "Done"].map((label, i) => {
                  const stepNum = i + 1;
                  const isActive = step >= stepNum || (stepNum === 3 && step === 4);
                  const isCurrent = step === stepNum;
                  return (
                    <React.Fragment key={label}>
                      <div className={`flex items-center gap-1.5 ${isCurrent ? "text-blue-600 font-bold" : isActive ? "text-green-600" : "text-gray-400"}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isActive && !isCurrent ? "bg-green-100 text-green-600" : isCurrent ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"
                        }`}>
                          {isActive && !isCurrent ? "✓" : stepNum}
                        </span>
                        {label}
                      </div>
                      {i < 2 && <div className={`flex-1 h-px ${isActive ? "bg-green-300" : "bg-gray-200"}`} />}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sticker Content */}
          <div ref={stickerRef}>
            <div style={{
              width: "4in",
              height: "6in",
              margin: "0 auto",
              padding: "12px 14px",
              fontFamily: "Arial, Helvetica, sans-serif",
              color: "#111",
              overflow: "hidden",
            }}>
              {/* Header */}
              <div style={{
                textAlign: "center",
                borderBottom: "2px solid #111",
                paddingBottom: "8px",
                marginBottom: "10px",
                position: "relative",
              }}>
                <div style={{ fontSize: "16px", fontWeight: "bold", letterSpacing: "1px" }}>
                  FIRST POINT CARGO
                </div>
                <div style={{ fontSize: "8px", color: "#666", marginTop: "1px" }}>
                  International Shipping & Logistics
                </div>
                {/* Print count label */}
                <div
                  data-print-label
                  style={{
                    position: "absolute",
                    top: "0",
                    right: "0",
                    fontSize: "8px",
                    fontWeight: "bold",
                    letterSpacing: "0.5px",
                    padding: "2px 6px",
                    border: "1px solid #888",
                    borderRadius: "3px",
                    color: printCount > 1 ? "#c00" : "#333",
                  }}
                >
                  {getPrintLabel(printCount || 1)}
                </div>
              </div>

              {/* Tracking Number */}
              <div style={{
                textAlign: "center",
                backgroundColor: "#111",
                color: "#fff",
                padding: "6px 8px",
                borderRadius: "4px",
                marginBottom: "10px",
              }}>
                <div style={{ fontSize: "8px", fontWeight: "bold", letterSpacing: "2px", opacity: 0.7 }}>
                  TRACKING NUMBER
                </div>
                <div style={{ fontSize: "16px", fontWeight: "bold", letterSpacing: "2px", marginTop: "2px" }}>
                  {shipment.tracking_number}
                </div>
              </div>

              {/* Shipment Details Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "4px",
                fontSize: "9px",
                marginBottom: "10px",
              }}>
                <DetailBox label="FROM" value={shipment.origin || shipment.origin_name || "—"} />
                <DetailBox label="TO" value={shipment.destination || shipment.destination_name || "—"} />
                <DetailBox label="CLIENT" value={shipment.client_name || "—"} />
                <DetailBox label="MODE" value={shipment.transport_mode || "—"} />
                <DetailBox label="WEIGHT" value={shipment.weight_kg ? `${shipment.weight_kg} kg` : "—"} />
                <DetailBox label="PRIORITY" value={shipment.priority || "Standard"} />
              </div>

              {/* Physical Delivery Location */}
              <div style={{
                border: "2px solid #333",
                borderRadius: "4px",
                padding: "8px 10px",
                fontSize: "10px",
                marginBottom: "10px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                <div style={{ fontWeight: "bold", fontSize: "8px", color: "#888", letterSpacing: "1px", marginBottom: "4px" }}>
                  DELIVER TO
                </div>
                {shipment.dest_contact_person && (
                  <div style={{ fontWeight: "bold", fontSize: "12px" }}>
                    {shipment.dest_contact_person}
                  </div>
                )}
                {shipment.dest_address_line && (
                  <div style={{ marginTop: "3px" }}>{shipment.dest_address_line}</div>
                )}
                {shipment.dest_area && (
                  <div style={{ marginTop: "3px" }}>{shipment.dest_area}</div>
                )}
                {(shipment.dest_city || shipment.dest_postal_code) && (
                  <div style={{ marginTop: "3px" }}>
                    {[shipment.dest_city, shipment.dest_postal_code].filter(Boolean).join(" ")}
                  </div>
                )}
                <div style={{ marginTop: "3px", fontWeight: "bold" }}>KENYA</div>
                {(shipment.client_phone || shipment.dest_contact_phone) && (
                  <div style={{ marginTop: "5px", color: "#555" }}>
                    TEL: {shipment.client_phone || shipment.dest_contact_phone}
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div style={{
                textAlign: "center",
                borderTop: "2px dashed #ccc",
                paddingTop: "10px",
              }}>
                <div style={{ fontSize: "8px", fontWeight: "bold", color: "#888", letterSpacing: "1px", marginBottom: "6px" }}>
                  SCAN TO UPDATE STATUS
                </div>
                <div style={{ display: "inline-block", padding: "6px", background: "#fff", border: "2px solid #111", borderRadius: "6px" }}>
                  <QRCodeSVG
                    value={scanUrl}
                    size={100}
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <div style={{ fontSize: "7px", color: "#999", marginTop: "4px", wordBreak: "break-all" }}>
                  {scanUrl}
                </div>
              </div>

              {/* Footer */}
              <div style={{
                textAlign: "center",
                borderTop: "1px solid #eee",
                marginTop: "10px",
                paddingTop: "6px",
                fontSize: "7px",
                color: "#aaa",
              }}>
                Handle with care · Do not remove this label
              </div>
            </div>
          </div>

          {/* Confirmation Flow */}
          {requireConfirmation && step < 4 && (
            <div className="px-4 pb-4 border-t mt-2 pt-4 space-y-3">
              {/* Step 1: Prompt to print */}
              {step === 1 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                  <div className="text-2xl mb-2">🖨️</div>
                  <p className="text-sm font-semibold text-amber-800">Print this sticker first</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Click the "Print Sticker" button above, then physically attach it to the package.
                  </p>
                </div>
              )}

              {/* Step 2: Upload photo of attached sticker */}
              {step === 2 && (
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-800">📸 Upload a photo of the attached sticker</p>
                    <p className="text-xs text-blue-600 mt-1">
                      Take a photo showing the sticker attached to the package, then upload it below.
                    </p>
                  </div>

                  {/* Photo preview */}
                  {photoPreview && (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Sticker attachment preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => { setPhotoPreview(null); setPhotoFile(null); }}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Upload button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                  {!photoPreview && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition flex items-center justify-center gap-2"
                    >
                      📷 Take or Select Photo
                    </button>
                  )}

                  {error && (
                    <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      ⚠ {error}
                    </div>
                  )}

                  {/* Confirm button */}
                  <button
                    onClick={handleConfirm}
                    disabled={!photoFile || uploading}
                    className={`w-full py-3 rounded-lg text-sm font-semibold transition ${
                      photoFile && !uploading
                        ? "bg-green-600 text-white hover:bg-green-700"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Confirming...
                      </span>
                    ) : (
                      "✅ Confirm Sticker Attached"
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Success state */}
          {step === 4 && (
            <div className="px-4 pb-4 border-t mt-2 pt-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl mb-1">✅</div>
                <p className="text-sm font-semibold text-green-800">Sticker Attached & Confirmed</p>
                <p className="text-xs text-green-600 mt-1">
                  {shipment.sticker_attached_by
                    ? `Confirmed by ${shipment.sticker_attached_by}`
                    : "This shipment's sticker has been verified."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailBox({ label, value }) {
  return (
    <div style={{
      border: "1px solid #eee",
      borderRadius: "4px",
      padding: "6px 8px",
    }}>
      <div style={{ fontSize: "9px", fontWeight: "bold", color: "#888", letterSpacing: "1px" }}>
        {label}
      </div>
      <div style={{ fontWeight: "bold", fontSize: "12px", marginTop: "2px" }}>
        {value}
      </div>
    </div>
  );
}
