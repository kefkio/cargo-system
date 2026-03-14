// src/components/super-admin/StaffPanel.jsx
import React, { useEffect, useState } from "react";

export default function StaffPanel() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    async function fetchStaff() {
      try {
        const token = localStorage.getItem("access");
        const res = await fetch(`${API_URL}/staff/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch staff");

        const data = await res.json();
        setStaff(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStaff();
  }, [API_URL]);

  if (loading) return <p>Loading staff...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Staff Management</h2>
      <table className="w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Email</th>
            <th className="px-4 py-2 border">Role</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((member) => (
            <tr key={member.id}>
              <td className="px-4 py-2 border">{member.name}</td>
              <td className="px-4 py-2 border">{member.email}</td>
              <td className="px-4 py-2 border">{member.role}</td>
              <td className="px-4 py-2 border">{member.isActive ? "Active" : "Inactive"}</td>
              <td className="px-4 py-2 border">
                <button className="text-blue-600 hover:underline mr-2">Edit</button>
                <button className="text-red-600 hover:underline">Disable</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}