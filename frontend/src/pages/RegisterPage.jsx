import React from "react";
import RegisterForm from "../components/RegisterForm";
import buyerImage from "../assets/buyer_dweb_individual.jpg";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex font-sans">

      {/* ── Left: Image panel ── */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">

        {/* Full-bleed photo */}
        <img
          src={buyerImage}
          alt="Buyer"
          className="w-full h-full object-cover scale-105 transition-transform duration-[8s] ease-out hover:scale-100"
        />

        {/* Dark gradient overlay — bottom-up for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Brand mark — top-left */}
        <div className="absolute top-8 left-8 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 8h14M5 8a2 2 0 010-4h14a2 2 0 010 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-sm tracking-wide">CargoLink</span>
        </div>

        {/* Bottom caption */}
        <div className="absolute bottom-10 left-8 right-8">
          <p className="text-white/50 text-xs uppercase tracking-[0.2em] mb-2 font-medium">
            Trusted by thousands
          </p>
          <h2 className="text-white text-2xl font-bold leading-snug mb-4">
            Ship smarter from the<br />US to Kenya — effortlessly.
          </h2>

          {/* Social proof chips */}
          <div className="flex items-center gap-3 flex-wrap">
            {["Fast Delivery", "Live Tracking", "Secure Payments"].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-medium bg-white/15 backdrop-blur-sm border border-white/20 text-white/90"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Form panel ── */}
      <div className="flex w-full md:w-1/2 justify-center items-center bg-gray-50 relative overflow-hidden">

        {/* Subtle background texture — decorative circles */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-indigo-100/60 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-sky-100/60 blur-3xl pointer-events-none" />

        {/* Mobile-only brand mark */}
        <div className="absolute top-6 left-6 flex md:hidden items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 8h14M5 8a2 2 0 010-4h14a2 2 0 010 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2L19 8"/>
            </svg>
          </div>
          <span className="text-gray-800 font-semibold text-sm">CargoLink</span>
        </div>

        {/* Form container */}
        <div className="relative z-10 w-full max-w-md px-8 py-10">

          {/* Header above the form */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
            <p className="text-sm text-gray-500">
              Already have an account?{" "}
              <a href="/login" className="text-indigo-600 font-medium hover:underline">
                Sign in
              </a>
            </p>
          </div>

          {/* The existing RegisterForm — untouched */}
          <RegisterForm />

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-gray-400">
            By registering, you agree to our{" "}
            <a href="/terms-privacy" className="underline hover:text-gray-600">
              Terms & Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>

    </div>
  );
}