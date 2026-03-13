import React, { useState, useContext } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { AuthContext } from "../../auth/AuthContext";

export default function LoginForm() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const { setUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* -------------------- REDIRECT BY ROLE -------------------- */
  const redirectByRole = (role) => {
    const r = role?.toUpperCase();

    if (r === "CLIENT") navigate("/dashboard/client");
    else if (r === "ADMIN") navigate("/admin-dashboard");
    else if (r === "STAFF") navigate("/staff-dashboard");
    else navigate("/");
  };

  /* -------------------- HANDLE LOGIN -------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess("");

    if (!formData.email || !formData.password) {
      return;
    }

    try {
      const profile = await login(formData.email, formData.password);

      setUser(profile);

      setSuccess(
        `Welcome ${
          profile.first_name || profile.username || profile.email
        }!`
      );

      redirectByRole(profile.role);

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">

        <div className="mb-4">
          <Link to="/" className="text-blue-600 hover:underline text-sm">
            ← Back to Home
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-2 text-center">
          Sign in to your account
        </h2>

        <p className="text-sm mb-6 text-gray-600 text-center">
          Enter your email and password to continue.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              className="border p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-sm text-center text-gray-500 mt-2">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Create one
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}