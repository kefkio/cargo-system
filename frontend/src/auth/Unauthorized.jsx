// src/components/auth/Unauthorized.jsx
import React from "react";

export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0d0f14] text-[#f0f2f8] px-4">
      <h1 className="text-6xl font-bold text-[#ff5c5c] mb-4">403</h1>
      <h2 className="text-2xl font-semibold mb-2">Unauthorized</h2>
      <p className="text-[#7a8499] mb-6 text-center">
        You do not have permission to access this page.
      </p>
      <a
        href="/"
        className="px-4 py-2 bg-[#e8ff47] text-[#0d0f14] font-semibold rounded hover:bg-[#d0e700] transition-colors"
      >
        Go to Dashboard
      </a>
    </div>
  );
}