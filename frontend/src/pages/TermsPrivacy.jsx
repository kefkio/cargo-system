// src/pages/TermsPrivacy.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function TermsPrivacy() {
  return (
    <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
      <div className="w-full max-w-3xl bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Terms & Privacy Policy</h1>

        <p className="mb-4">
          Welcome to FirstPoint Cargo! This is a dummy Terms & Privacy Policy page.
          All content here is for demonstration purposes only.
        </p>

        <h2 className="text-xl font-semibold mt-4 mb-2">1. User Agreement</h2>
        <p className="mb-4">
          By using our services, you agree to follow all our rules and policies. This is just placeholder text for now.
        </p>

        <h2 className="text-xl font-semibold mt-4 mb-2">2. Privacy Notice</h2>
        <p className="mb-4">
          We respect your privacy. Any personal information collected is stored securely and is not shared with third parties. (Dummy text)
        </p>

        <h2 className="text-xl font-semibold mt-4 mb-2">3. Cookies & Tracking</h2>
        <p className="mb-4">
          We may use cookies and similar tracking technologies for analytics and improving your experience. (Dummy text)
        </p>

        <h2 className="text-xl font-semibold mt-4 mb-2">4. Changes to Policy</h2>
        <p className="mb-4">
          This page can be updated at any time. Users should check back periodically for updates. (Dummy text)
        </p>

        <div className="mt-6 text-center">
          <Link
            to="/"
            className="text-blue-600 hover:underline font-medium"
          >
            &larr; Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}