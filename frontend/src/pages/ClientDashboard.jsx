import React, { useEffect, useState, useRef } from "react";
import ClientNavbar from "../components/ClientNavbar";
import DashboardCard from "../components/DashboardCard";
import NextShipmentBanner from "../components/NextShipmentBanner";
import PickupRequest from "../components/PickupRequest";
import ShippingCalculator from "../components/ShippingCalculator";
import TrackShipment from "../components/TrackShipment";
import Contact from "../components/Contact";

export default function ClientDashboard() {
  const [profile, setProfile] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showWhatsapp, setShowWhatsapp] = useState(false);

  const token = localStorage.getItem("access");

  // ------------------------------
  // Fetch profile, shipments & notifications
  // ------------------------------
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/accounts/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchShipments = async () => {
      try {
        const res = await fetch(`${API_URL}/shipments/client/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch shipments");
        const data = await res.json();
        setShipments(data);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`${API_URL}/notifications/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch notifications");
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.read).length);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
    fetchShipments();
    fetchNotifications();

    // ------------------------------
    // Polling for new notifications every 30 seconds
    // ------------------------------
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // ------------------------------
  // Scroll progress & WhatsApp button
  // ------------------------------
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);

      if (scrollTop > 200 && !showWhatsapp) setShowWhatsapp(true);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showWhatsapp]);

  // ------------------------------
  // FadeInSection helper (landing page style)
  // ------------------------------
  const FadeInSection = ({ children, id }) => {
    const [isVisible, setVisible] = useState(false);
    const domRef = useRef(null);

    useEffect(() => {
      const currentRef = domRef.current;
      if (!currentRef) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setVisible(true);
        });
      });

      observer.observe(currentRef);
      return () => currentRef && observer.unobserve(currentRef);
    }, []);

    return (
      <section
        id={id}
        ref={domRef}
        className={`w-full transition-opacity duration-1000 ease-out transform ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {children}
      </section>
    );
  };

  // ------------------------------
  // CountUp helper for summary cards
  // ------------------------------
  const CountUp = ({ value }) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
      let start = 0;
      const end = value;
      const duration = 800;
      const increment = end / (duration / 16);
      const step = () => {
        start += increment;
        if (start < end) {
          setCount(Math.floor(start));
          requestAnimationFrame(step);
        } else {
          setCount(end);
        }
      };
      requestAnimationFrame(step);
    }, [value]);
    return <span>{count}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-gray-100 flex flex-col font-inter text-gray-800 scroll-smooth">
      <div className="fixed top-0 left-0 h-1 bg-blue-500 z-50" style={{ width: `${scrollProgress}%` }} />
      {/* Navbar with notifications */}
      <ClientNavbar notifications={notifications} unreadCount={unreadCount} />

      {/* Rest of dashboard sections */}
      <FadeInSection id="next-shipment-banner">
        <NextShipmentBanner />
      </FadeInSection>

      <FadeInSection id="greeting">
        <div className="text-center my-8 px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Welcome, {profile?.username || "Client"}
          </h1>
          <p className="text-gray-600 mt-1">Here’s a summary of your shipments</p>
          <p className="text-sm text-gray-500 mt-2">
            You have <span className="font-semibold text-gray-800"><CountUp value={shipments.length} /></span> active shipments.
          </p>
        </div>
      </FadeInSection>

      {/* Track Shipment */}
      <FadeInSection id="track-shipment">
        <div className="max-w-6xl mx-auto px-6 mb-6">
          <DashboardCard title="Track a Shipment">
            <TrackShipment />
          </DashboardCard>
        </div>
      </FadeInSection>

      {/* Summary, Pickup, Calculator, Feedback, Recent Shipments */}
      {/* ... same as previous dashboard implementation ... */}
    </div>
  );
}