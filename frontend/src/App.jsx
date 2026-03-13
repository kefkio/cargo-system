// src/App.jsx
import React, { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Pages
import LandingPage from "./pages/LandingPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// SEO Pages
import ShipFromAmazon from "./pages/seo/ShipFromAmazon";
import ShipFromEbay from "./pages/seo/ship-from-ebay-to-kenya";
import ShipFromWalmart from "./pages/seo/ship-from-walmart-to-kenya";
import ShipFromBestBuy from "./pages/seo/ship-from-bestbuy-to-kenya";
import AirFreight from "./pages/seo/air-freight-usa-to-kenya";
import SeaFreight from "./pages/seo/sea-freight-usa-to-kenya";
import ShippingCalculatorPage from "./pages/seo/shipping-calculator-usa-to-kenya";

// Auth components
import RegisterForm from "./components/auth/RegisterForm";
import LoginForm from "./components/auth/LoginForm";
import ForgotPasswordForm from "./components/auth/ForgotPasswordForm";
import TermsPrivacy from "./components/TermsPrivacy";

// ProtectedRoute
import ProtectedRoute from "./routes/ProtectedRoute";

// Lazy-loaded dashboards
const ClientDashboard = lazy(() => import("./components/client/ClientDashboard"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const StaffDashboard = lazy(() => import("./components/staff/StaffDashboard"));
const SuperAdminDashboard = lazy(() => import("./components/super-admin/SuperAdminDashboard"));

// Optional modal on LandingPage
import ContactModal from "./components/ContactModal";

function App({ user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  // Contact modal timer & IP check
  useEffect(() => {
    if (user?.isLoggedIn) return;
    if (localStorage.getItem("disableContactModal") === "true") return;
    if (sessionStorage.getItem("contactModalShown")) return;

    async function checkVisitor() {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        const visitorKey = `visitor_${data.ip}`;
        if (!localStorage.getItem(visitorKey)) {
          localStorage.setItem(visitorKey, "true");
        }
      } catch (err) {
        console.error("IP check failed:", err);
      }

      let timer;
      const resetTimer = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          if (!hasShown) {
            setIsModalOpen(true);
            setHasShown(true);
            sessionStorage.setItem("contactModalShown", "true");
          }
        }, 60000);
      };

      window.addEventListener("mousemove", resetTimer);
      window.addEventListener("keydown", resetTimer);
      resetTimer();

      const handleMouseLeave = (e) => {
        if (e.clientY < 10 && !hasShown) {
          setIsModalOpen(true);
          setHasShown(true);
          sessionStorage.setItem("contactModalShown", "true");
        }
      };
      document.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("mousemove", resetTimer);
        window.removeEventListener("keydown", resetTimer);
        document.removeEventListener("mouseleave", handleMouseLeave);
      };
    }

    checkVisitor();
  }, [user, hasShown]);

  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {/* Landing Page */}
          <Route
            path="/"
            element={
              <>
                <LandingPage />
                <ContactModal
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                />
              </>
            }
          />

          {/* SEO Pages */}
          <Route path="/seo/ship-from-amazon-to-kenya" element={<ShipFromAmazon />} />
          <Route path="/seo/ship-from-ebay-to-kenya" element={<ShipFromEbay />} />
          <Route path="/seo/ship-from-walmart-to-kenya" element={<ShipFromWalmart />} />
          <Route path="/seo/ship-from-bestbuy-to-kenya" element={<ShipFromBestBuy />} />
          <Route path="/seo/air-freight-usa-to-kenya" element={<AirFreight />} />
          <Route path="/seo/sea-freight-usa-to-kenya" element={<SeaFreight />} />
          <Route path="/seo/shipping-calculator-usa-to-kenya" element={<ShippingCalculatorPage />} />

          {/* Auth Pages */}
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
          <Route path="/terms-privacy" element={<TermsPrivacy />} />

          {/* Dashboards with role-based access */}
          <Route
            path="/dashboard/client"
            element={
              <ProtectedRoute allowedRoles={["CLIENT"]}>
                <ClientDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute allowedRoles={["CARGOADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/staff"
            element={
              <ProtectedRoute allowedRoles={["CLIENTADMIN"]}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/super-admin"
            element={
              <ProtectedRoute allowedRoles={["SUPERADMIN"]}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;