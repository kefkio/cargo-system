// src/App.jsx
import React, { useState, useEffect, useRef, lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
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

// Auth components
import RegisterForm from "./components/auth/RegisterForm";
import LoginForm from "./components/auth/LoginForm";
import ForgotPasswordForm from "./components/auth/ForgotPasswordForm";
import TermsPrivacy from "./components/TermsPrivacy";

// Route protection
import ProtectedRoute from "./routes/ProtectedRoute";

// Lazy-loaded dashboards & tools
const ClientDashboard = lazy(() => import("./components/client/ClientDashboard"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const WarehouseManagement = lazy(() => import("./components/admin/WarehouseManagement"));
const CreateShipment = lazy(() => import("./components/admin/CreateShipment")); // ✅ Using admin CreateShipment
const StaffDashboard = lazy(() => import("./components/staff/StaffDashboard"));
const StaffPickupRequest = lazy(() => import("./components/shipment/PickupRequest"));
const StaffInvoicing = lazy(() => import("./components/staff/StaffInvoicing"));
const StaffReports = lazy(() => import("./components/staff/StaffReports"));
const StaffDispatch = lazy(() => import("./components/staff/StaffDispatch"));
const ScanUpdate = lazy(() => import("./components/shipment/ScanUpdate"));
const SuperAdminDashboard = lazy(() => import("./components/super-admin/SuperAdminDashboard"));
const SuperAdminReports = lazy(() => import("./components/super-admin/SuperAdminReports"));
const TrackShipmentPage = lazy(() => import("./components/shipment/TrackShipment"));

// Modal
import ContactModal from "./components/ContactModal";

function App({ user }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasShownRef = useRef(false);

  useEffect(() => {
    if (user?.isLoggedIn) return;
    if (localStorage.getItem("disableContactModal") === "true") return;
    if (sessionStorage.getItem("contactModalShown")) return;

    let timer;

    const showModal = () => {
      if (!hasShownRef.current) {
        hasShownRef.current = true;
        setIsModalOpen(true);
        sessionStorage.setItem("contactModalShown", "true");
      }
    };

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(showModal, 60000);
    };

    const handleMouseLeave = (e) => {
      if (e.clientY < 10) showModal();
    };

    // Visitor IP check
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        const visitorKey = `visitor_${data.ip}`;
        if (!localStorage.getItem(visitorKey)) localStorage.setItem(visitorKey, "true");
      })
      .catch((err) => console.error("IP check failed:", err));

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    document.addEventListener("mouseleave", handleMouseLeave);
    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [user]);

  return (
    <ErrorBoundary>
      <Router>
        <Suspense
          fallback={
            <div className="loading-fallback">
              Loading...
            </div>
          }
        >
          <Routes>
            {/* Landing */}
            <Route
              path="/"
              element={
                <>
                  <LandingPage />
                  <ContactModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
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

            {/* Auth */}
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/forgot-password" element={<ForgotPasswordForm />} />
            <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
            <Route path="/terms-privacy" element={<TermsPrivacy />} />

            {/* Public Track Page */}
            <Route path="/track" element={<TrackShipmentPage />} />

            {/* Client */}
            <Route
              path="/dashboard/client"
              element={
                <ProtectedRoute allowedRoles={["CLIENT"]}>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin */}
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={["CARGOADMIN", "ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/warehouses"
              element={
                <ProtectedRoute allowedRoles={["CARGOADMIN", "ADMIN"]}>
                  <WarehouseManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/create-shipment"
              element={
                <ProtectedRoute allowedRoles={["CARGOADMIN", "ADMIN"]}>
                  <CreateShipment />
                </ProtectedRoute>
              }
            />

            {/* Staff */}
            <Route
              path="/dashboard/staff"
              element={
                <ProtectedRoute allowedRoles={["CLIENTADMIN", "STAFF"]}>
                  <StaffDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/pickups"
              element={
                <ProtectedRoute allowedRoles={["CLIENTADMIN", "CARGOADMIN", "SUPERADMIN", "STAFF"]}>
                  <StaffPickupRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/create-shipment"
              element={
                <ProtectedRoute allowedRoles={["CARGOADMIN", "ADMIN", "STAFF"]}>
                  <CreateShipment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/invoicing"
              element={
                <ProtectedRoute allowedRoles={["CLIENTADMIN", "CARGOADMIN", "SUPERADMIN", "STAFF"]}>
                  <StaffInvoicing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/dispatch"
              element={
                <ProtectedRoute allowedRoles={["CLIENTADMIN", "CARGOADMIN", "SUPERADMIN", "STAFF"]}>
                  <StaffDispatch />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff/reports"
              element={
                <ProtectedRoute allowedRoles={["CLIENTADMIN", "CARGOADMIN", "SUPERADMIN", "STAFF"]}>
                  <StaffReports />
                </ProtectedRoute>
              }
            />

            {/* QR Scan Update */}
            <Route
              path="/scan/:trackingNumber"
              element={
                <ProtectedRoute allowedRoles={["SUPERADMIN", "CARGOADMIN", "ADMIN", "CLIENTADMIN", "STAFF", "CLIENT"]}>
                  <ScanUpdate />
                </ProtectedRoute>
              }
            />

            {/* Super Admin */}
            <Route
              path="/dashboard/super-admin"
              element={
                <ProtectedRoute allowedRoles={["SUPERADMIN"]}>
                  <SuperAdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/super-admin/reports"
              element={
                <ProtectedRoute allowedRoles={["SUPERADMIN"]}>
                  <SuperAdminReports />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;