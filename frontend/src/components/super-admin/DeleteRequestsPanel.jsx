import React, { useEffect, useState } from "react";
import axios from "axios";

export default function DeleteRequestsPanel() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await axios.get("/api/accounts/delete-requests/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` }
      });
      const data = Array.isArray(res.data) ? res.data : (res.data.results ?? []);
      setRequests(data);
    } catch (err) {
      setError("Failed to fetch requests");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await axios.post(`/api/accounts/delete-${action}/`, { request_id: id }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access")}` }
      });
      fetchRequests();
    } catch (err) {
      alert("Action failed");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  if (loading) return <div className="p-4 text-gray-400">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!requests.length) return <div className="p-4 text-gray-400">No delete requests</div>;

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="text-xs text-left text-gray-500 border-b border-gray-700">
          <th className="px-4 py-2">User</th>
          <th className="px-4 py-2">Target Type</th>
          <th className="px-4 py-2">Target ID</th>
          <th className="px-4 py-2">Reason</th>
          <th className="px-4 py-2">Status</th>
          <th className="px-4 py-2">Created At</th>
          <th className="px-4 py-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((r) => (
          <tr key={r.id} className="border-b border-gray-800">
            <td className="px-4 py-2 text-sm">{r.user}</td>
            <td className="px-4 py-2 text-sm">{r.target_type}</td>
            <td className="px-4 py-2 text-sm">{r.target_id}</td>
            <td className="px-4 py-2 text-sm">{r.reason}</td>
            <td className="px-4 py-2 text-sm capitalize">{r.status}</td>
            <td className="px-4 py-2 text-sm">{new Date(r.created_at).toLocaleString()}</td>
            <td className="px-4 py-2 text-sm flex gap-2">
              {r.status === "pending" && (
                <>
                  <button
                    className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                    onClick={() => handleAction(r.id, "approve")}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    onClick={() => handleAction(r.id, "reject")}
                  >
                    Reject
                  </button>
                </>
              )}
              {r.status !== "pending" && (
                <span className="text-gray-400">No actions</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}