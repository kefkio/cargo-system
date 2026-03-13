// src/components/PasswordForm.jsx
import React, { useState } from "react";
import axios from "axios";

export default function PasswordForm({
  apiEndpoint, // e.g., "/auth/change-password/" or "/auth/password-reset-confirm/"
  tokenData = {}, // extra data needed for reset, e.g., { uid, token }
  redirectTo = "/login", // optional redirect after success
}) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const BASE_URL = "http://127.0.0.1:8000/api";

  const validatePasswordStrength = (password) => {
    const errs = [];
    if (password.length < 8) errs.push("Password must be at least 8 characters");
    if (!/[A-Z]/.test(password)) errs.push("Password must contain an uppercase letter");
    if (!/[a-z]/.test(password)) errs.push("Password must contain a lowercase letter");
    if (!/[0-9]/.test(password)) errs.push("Password must contain a number");
    if (!/[!@#$%^&*]/.test(password)) errs.push("Password must contain a special character");
    return errs;
  };

  const generateStrongPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
    setConfirmPassword(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setMessage("");

    if (!newPassword || !confirmPassword) {
      setErrors(["All fields are required"]);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors(["Passwords do not match"]);
      return;
    }

    const passwordErrors = validatePasswordStrength(newPassword);
    if (passwordErrors.length) {
      setErrors(passwordErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = { new_password: newPassword, confirm_password: confirmPassword, ...tokenData };
      const res = await axios.post(`${BASE_URL}${apiEndpoint}`, payload);

      setMessage(res.data.message);
      setNewPassword("");
      setConfirmPassword("");

      if (redirectTo) {
        setTimeout(() => window.location.href = redirectTo, 2000);
      }
    } catch (err) {
      setErrors([err.response?.data?.error || "Failed to change password"]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Set New Password</h2>

      {message && <p className="mb-4 text-green-600">{message}</p>}
      {errors.length > 0 && (
        <ul className="mb-4 text-red-600 list-disc list-inside">
          {errors.map((err, idx) => <li key={idx}>{err}</li>)}
        </ul>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="password"
          placeholder="New password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <button
          type="button"
          onClick={generateStrongPassword}
          className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
        >
          Suggest Strong Password
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-blue-500 text-white p-2 rounded ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}