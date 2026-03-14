import React, { useEffect, useState } from "react";
import { getUserProfile, logoutUser } from "../api/api";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const logout = () => {
    logoutUser();
    setUser(null);
  };

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
