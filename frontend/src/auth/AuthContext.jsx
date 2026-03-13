import React, { createContext, useEffect, useState } from "react";
import { getUserProfile, logoutUser } from "../api/api";

/* ---------------- CONTEXT ---------------- */

export const AuthContext = createContext(null);

/* ---------------- PROVIDER ---------------- */

export function AuthProvider({ children }) {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- RESTORE SESSION ---------------- */

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem("access");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await getUserProfile();
        setUser(profile);
      } catch (err) {
        console.error("Session restore failed:", err);
        logoutUser();
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  /* ---------------- LOGOUT ---------------- */

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  /* ---------------- CONTEXT VALUE ---------------- */

  const value = {
    user,
    setUser,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}