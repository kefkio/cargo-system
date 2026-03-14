// src/components/auth/RegisterForm.jsx
import React, { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { FaEye, FaEyeSlash, FaGoogle, FaFacebook, FaApple } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import custImage from "../../assets/images/Customersimagea.png"; // ✅ Correct path
import { useAuth } from "../../hooks/useAuth"; // ✅ Correct relative path
import { registerUser } from "../../api/api";


export default function RegisterForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handlePhoneChange = (value) => {
    setFormData({ ...formData, phone: value });
  };

  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.agreeTerms) {
      setError("You must accept the Terms & Privacy Policy");
      return;
    }

    if (!validateEmail(formData.email)) {
      setError("Enter a valid email address");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1️⃣ Register user
      await registerUser({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone_number: formData.phone,
        password: formData.password,
      });

      // 2️⃣ Login using hook
      const profile = await login(formData.email, formData.password);
      setSuccess(`Welcome ${profile.first_name || profile.email || profile.username}!`);

      // 5️⃣ Redirect based on role
      setTimeout(() => {
        if (profile.role === "CLIENT") {
          navigate("/dashboard/client");
        } else {
          navigate("/dashboard/admin");
        }
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* LEFT IMAGE */}
      <div className="hidden md:flex w-1/2">
        <img src={custImage} alt="Customer" className="object-cover w-full h-full" />
      </div>

      {/* FORM */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          <Link to="/" className="text-blue-600 hover:underline text-sm">
            ← Back to Home
          </Link>

          <h2 className="text-2xl font-bold mt-3 mb-2">Create an account</h2>
          <p className="text-sm mb-6 text-gray-600">
            By creating an account you agree to our{" "}
            <Link to="/terms-privacy" className="text-blue-600">
              Terms & Privacy Policy
            </Link>
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
            {/* NAME */}
            <div className="flex gap-2">
              <input
                type="text"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                required
                autoComplete="given-name"
                className="border p-2 rounded w-1/2"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                required
                autoComplete="family-name"
                className="border p-2 rounded w-1/2"
              />
            </div>

            {/* EMAIL */}
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="border p-2 rounded"
            />

            {/* PHONE */}
            <PhoneInput
              country={"us"}
              value={formData.phone}
              onChange={handlePhoneChange}
              inputProps={{ name: "phone", required: true, autoComplete: "tel" }}
              inputStyle={{ width: "100%" }}
            />

            {/* PASSWORD */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="border p-2 rounded w-full"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2 cursor-pointer text-gray-400"
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>

            {/* CONFIRM PASSWORD */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                className="border p-2 rounded w-full"
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2 cursor-pointer text-gray-400"
              >
                {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
              </span>
            </div>

            {/* TERMS */}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                required
              />
              I agree to the Terms & Privacy Policy
            </label>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-600 text-white p-2 rounded hover:bg-blue-700 ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>

            <p className="text-sm text-center text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600">
                Sign in
              </Link>
            </p>

            {/* SOCIAL LOGIN */}
            <div className="flex items-center justify-center my-3">
              <span className="text-gray-400 text-sm">or continue with</span>
            </div>

            <div className="flex justify-center gap-4">
              <button
                type="button"
                className="flex items-center justify-center w-10 h-10 border rounded-full hover:bg-gray-100"
              >
                <FaGoogle className="text-red-500" />
              </button>

              <button
                type="button"
                className="flex items-center justify-center w-10 h-10 border rounded-full hover:bg-gray-100"
              >
                <FaFacebook className="text-blue-600" />
              </button>

              <button
                type="button"
                className="flex items-center justify-center w-10 h-10 border rounded-full hover:bg-gray-100"
              >
                <FaApple className="text-black" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}