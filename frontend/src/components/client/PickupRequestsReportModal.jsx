import React from "react";

export default function PickupRequestsReportModal({ title, pickups, onClose }) {
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
        {pickups.length === 0 ? (
          <p className="text-gray-500 italic">No pickup requests found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-2 border">Origin</th>
                  <th className="px-3 py-2 border">Destination</th>
                  <th className="px-3 py-2 border">Requested At</th>
                  <th className="px-3 py-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                {pickups.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2 border">{p.origin?.name || p.origin}</td>
                    <td className="px-3 py-2 border">{p.destination?.name || p.destination}</td>
                    <td className="px-3 py-2 border">{p.pickup_requested_at ? new Date(p.pickup_requested_at).toLocaleString() : "—"}</td>
                    <td className="px-3 py-2 border">{p.dispatcher_name ? "Dispatched" : "Pending"}</td>
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
