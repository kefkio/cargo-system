import React from "react";

export default function ShipmentsReportModal({ title, shipments, onClose, filter }) {
  const filtered = filter ? shipments.filter(filter) : shipments;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-xl font-bold"
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        {filtered.length === 0 ? (
          <p className="text-gray-500 italic">No shipments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-2 border">Tracking</th>
                  <th className="px-3 py-2 border">Status</th>
                  <th className="px-3 py-2 border">Weight (kg)</th>
                  <th className="px-3 py-2 border">Mode</th>
                  <th className="px-3 py-2 border">Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2 border">{s.tracking_number}</td>
                    <td className="px-3 py-2 border">{s.status}</td>
                    <td className="px-3 py-2 border">{s.weight_kg}</td>
                    <td className="px-3 py-2 border">{s.transport_mode}</td>
                    <td className="px-3 py-2 border">{new Date(s.shipment_created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
