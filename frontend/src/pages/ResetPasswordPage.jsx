import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axios from "axios";

export default function ResetPasswordPage() {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [suggestedPassword, setSuggestedPassword] = useState("");

  const validatePasswordStrength = (password) => {
    const errs = [];
    
    if (password.length < 8)
      errs.push("Password must be at least 8 characters");

    if (!/[A-Z]/.test(password))
      errs.push("Password must contain an uppercase letter");

    if (!/[a-z]/.test(password))
      errs.push("Password must contain a lowercase letter");

    if (!/[0-9]/.test(password))
      errs.push("Password must contain a number");

    if (!/[!@#$%^&*]/.test(password))
      errs.push("Password should contain a special character");

    return errs;
  };

  const generateStrongPassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setSuggestedPassword(password);
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(suggestedPassword);
    alert("Suggested password copied to clipboard!");
    setNewPassword(suggestedPassword);
    setConfirmPassword(suggestedPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setMessage("");

    if (newPassword !== confirmPassword) {
      setErrors(["Passwords do not match"]);
      return;
    }

    const passwordErrors = validatePasswordStrength(newPassword);
    if (passwordErrors.length > 0) {
      setErrors(passwordErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const res = await axios.post(
        `${apiUrl}/password-reset-confirm/`,
        {
          uid,
          token,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }
      );

      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const backendError = err.response?.data?.error;

      if (Array.isArray(backendError)) {
        setErrors(backendError);
      } else {
        setErrors([backendError || "Error resetting password"]);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">Reset Password</h2>

      {errors.length > 0 && (
        <ul className="mb-4 text-red-500 list-disc list-inside">
          {errors.map((err, i) => (
            <li key={i}>{err}</li>
          ))}
        </ul>
      )}

      {message && <p className="mb-4 text-green-600">{message}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* New Password */}
        <div className="relative">
          <input
            type={showNewPassword ? "text" : "password"}
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 pr-10 border rounded"
            required
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {showNewPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {/* Password Strength Meter */}
        {newPassword && (() => {
          const checks = [
            newPassword.length >= 8,
            /[A-Z]/.test(newPassword),
            /[a-z]/.test(newPassword),
            /[0-9]/.test(newPassword),
            /[!@#$%^&*]/.test(newPassword),
          ];
          const passed = checks.filter(Boolean).length;
          const label = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"][passed];
          const color = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"][passed];
          const textColor = ["", "text-red-600", "text-orange-600", "text-yellow-600", "text-blue-600", "text-green-600"][passed];
          return (
            <div>
              <div className="flex gap-1 h-1.5 rounded overflow-hidden bg-gray-200">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={`flex-1 rounded transition-colors duration-300 ${i <= passed ? color : "bg-gray-200"}`} />
                ))}
              </div>
              <p className={`text-xs mt-1 font-medium ${textColor}`}>{label}</p>
            </div>
          );
        })()}

        {/* Confirm Password */}
        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 pr-10 border rounded"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            tabIndex={-1}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className="flex flex-col mb-4">
          <button
            type="button"
            onClick={generateStrongPassword}
            className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
          >
            Suggest Strong Password
          </button>

          {suggestedPassword && (
            <div className="mt-2">
              <p className="text-gray-700">Suggested Password: <strong>{suggestedPassword}</strong></p>
              <button
                type="button"
                onClick={handleCopyPassword}
                className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Copy Suggested Password
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`bg-blue-500 text-white p-2 rounded ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
          }`}
        >
          {isSubmitting ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-3">
        Password should contain:
        <br />• At least 8 characters
        <br />• Uppercase letter
        <br />• Lowercase letter
        <br />• Number
        <br />• Special character
      </p>
    </div>
  );
}