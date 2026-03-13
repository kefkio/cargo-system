import { useState, useContext } from "react";
import { loginUser, getUserProfile, logoutUser } from "../api/api";
import { AuthContext } from "../auth/AuthContext";

export function useAuth() {
  const { setUser } = useContext(AuthContext); // ✅ use AuthContext
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      // 1️⃣ Login and get JWT
      const tokens = await loginUser(email, password); 
      localStorage.setItem("access", tokens.access);
      localStorage.setItem("refresh", tokens.refresh);

      // 2️⃣ Fetch user profile with stored token
      const profile = await getUserProfile();
      
      // 3️⃣ Update AuthContext
      setUser(profile);

      return profile;
    } catch (err) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  return { login, logout, loading, error };
}