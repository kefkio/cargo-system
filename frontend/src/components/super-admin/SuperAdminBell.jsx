import React, { useState, useEffect } from "react";
import { FaBell } from "react-icons/fa";

export default function SuperAdminBell() {
  const [pendingCount, setPendingCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch("/api/accounts/delete-requests/", {
          headers: { Authorization: `Bearer ${localStorage.getItem("access")}` }
        });
        const data = await res.json();
        const pending = data.filter(r => r.status === "pending");
        setRequests(pending);
        setPendingCount(pending.length);
      } catch (err) {
        setPendingCount(0);
      }
    };
    fetchRequests();
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="relative p-2 text-white hover:text-yellow-300"
        title="Pending Requests"
      >
        <FaBell size={22} />
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {pendingCount}
          </span>
        )}
      </button>
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white text-black border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b font-semibold">Pending Approval Requests</div>
          <div className="max-h-64 overflow-y-auto">
            {requests.length > 0 ? (
              requests.map((req) => (
                <div key={req.id} className="p-3 border-b hover:bg-gray-50 text-sm">
                  <div><b>User:</b> {req.user}</div>
                  <div><b>Type:</b> {req.target_type}</div>
                  <div><b>Reason:</b> {req.reason}</div>
                  <div className="text-xs text-gray-500 mt-1">{new Date(req.created_at).toLocaleString()}</div>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-gray-500">No pending requests</div>
            )}
          </div>
          <div className="p-2 border-t text-center">
            <a href="#delete-requests" onClick={() => setDropdownOpen(false)} className="text-blue-600 hover:underline">View All Requests</a>
          </div>
        </div>
      )}
    </div>
  );
}
