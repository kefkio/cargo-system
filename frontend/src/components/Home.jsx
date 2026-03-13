// src/components/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LandingPage from "../pages/LandingPage";

const API_URL = import.meta.env.VITE_API_URL; // e.g. http://localhost:8000/api/accounts

// -------------------- REFRESH TOKEN HELPER --------------------
const refreshToken = async () => {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;

  try {
    const res = await fetch(`${API_URL}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await res.json();
    // SimpleJWT returns { "access": "<new_access_token>" }
    localStorage.setItem("access", data.access);
    return data.access;
  } catch (err) {
    console.error("Token refresh failed:", err);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    return null;
  }
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLogin = async () => {
      let token = localStorage.getItem("access");

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        let res = await fetch(`${API_URL}/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // If token is invalid/expired, try refreshing
        if (res.status === 401 || res.status === 403) {
          const newAccess = await refreshToken();
          if (newAccess) {
            token = newAccess;
            res = await fetch(`${API_URL}/profile/`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          }
        }

        if (!res.ok) {
          throw new Error("Invalid token");
        }

        const profile = await res.json();

        if (profile.role === "CLIENT") {
          navigate("/dashboard/client");
        } else if (profile.role === "ADMIN" || profile.role === "STAFF" || profile.role === "SUPERADMIN") {
          navigate("/dashboard/admin");
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Profile fetch failed:", err);

        // remove invalid tokens
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        setError("Session expired. Please login again.");
        setIsLoading(false);
      }
    };

    checkLogin();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Checking session...</p>
      </div>
    );
  }

  if (error) {
    console.warn(error);
  }

  return <LandingPage />;
}