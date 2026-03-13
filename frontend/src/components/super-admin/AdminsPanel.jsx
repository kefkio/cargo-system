// src/components/super-admin/AdminsPanel.jsx
import React, { useEffect, useState } from "react";

export default function AdminsPanel() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    async function fetchAdmins() {
      try {
        const token = localStorage.getItem("access");
        const res = await fetch(`${API_URL}/admins/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch admins");

        const data = await res.json();
        setAdmins(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAdmins();
  }, []);

  if (loading) return <p>Loading admins...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Admins Management</h2>
      <table className="w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Email</th>
            <th className="px-4 py-2 border">Role</th>
            <th className="px-4 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {admins.map((admin) => (
            <tr key={admin.id}>
              <td className="px-4 py-2 border">{admin.name}</td>
              <td className="px-4 py-2 border">{admin.email}</td>
              <td className="px-4 py-2 border">{admin.role}</td>
              <td className="px-4 py-2 border">
                <button className="text-blue-600 hover:underline mr-2">Edit</button>
                <button className="text-red-600 hover:underline">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}