// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [username] = useState(() => localStorage.getItem("username") || "");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");

    if (!accessToken) {
      // Not logged in, redirect to login page
      navigate("/login");
      return;
    }

    // Fetch protected API data
    const fetchProtectedData = async () => {
      try {
        const response = await fetch(
          import.meta.env.VITE_API_URL + "/api/protected/",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Expecting backend to return { "message": "..." }
          setMessage(data.message || "No message returned");
        } else {
          setMessage("Failed to fetch protected data");
        }
      } catch (err) {
        console.error(err);
        setMessage("Network error");
      }
    };

    fetchProtectedData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Welcome, {username}!</p>
      {message && <p className="mb-4 text-gray-700">{message}</p>}
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  );
}