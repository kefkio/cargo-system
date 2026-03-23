import React, { useEffect, useState, useRef } from "react";
import ClientNavbar from "../components/ClientNavbar";
import DashboardCard from "../components/DashboardCard";
import NextShipmentBanner from "../components/NextShipmentBanner";
import PickupRequest from "../components/PickupRequest";
import ShippingCalculator from "../components/ShippingCalculator";
import TrackShipment from "../components/TrackShipment";
import Contact from "../components/Contact";

// ─── Fonts ────────────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.href =
  "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap";
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

// ─── Design tokens ────────────────────────────────────────────────────────────
const css = `
  :root {
    --bg:       #0a0d14;
    --surface:  #111622;
    --surface2: #161d2e;
    --border:   rgba(255,255,255,0.07);
    --accent:   #4f8ef7;
    --accent2:  #a78bfa;
    --accent3:  #34d399;
    --text:     #e8eaf0;
    --muted:    #7a8099;
    --danger:   #f87171;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .dash-root {
    min-height: 100vh;
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    overflow-x: hidden;
  }

  /* ── progress bar ── */
  .progress-bar {
    position: fixed; top: 0; left: 0; height: 2px;
    background: linear-gradient(90deg, var(--accent), var(--accent2));
    z-index: 100;
    transition: width 0.1s linear;
    box-shadow: 0 0 10px var(--accent);
  }

  /* ── mesh bg ── */
  .mesh {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background:
      radial-gradient(ellipse 60% 50% at 20% 10%, rgba(79,142,247,.12) 0%, transparent 70%),
      radial-gradient(ellipse 50% 40% at 80% 80%, rgba(167,139,250,.10) 0%, transparent 70%),
      radial-gradient(ellipse 40% 30% at 60% 40%, rgba(52,211,153,.06) 0%, transparent 70%);
  }

  /* ── grid lines ── */
  .grid-lines {
    position: fixed; inset: 0; pointer-events: none; z-index: 0;
    background-image:
      linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 60px 60px;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
  }

  /* ── layout ── */
  .dash-body {
    position: relative; z-index: 1;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 24px 80px;
  }

  /* ── hero greeting ── */
  .hero {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 24px;
    padding: 48px 0 36px;
    border-bottom: 1px solid var(--border);
    flex-wrap: wrap;
  }
  .hero-left {}
  .hero-label {
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .hero-label::before {
    content: '';
    display: block;
    width: 20px; height: 1px;
    background: var(--accent);
  }
  .hero-name {
    font-family: 'Syne', sans-serif;
    font-size: clamp(28px, 4vw, 48px);
    font-weight: 800;
    line-height: 1.1;
    color: var(--text);
  }
  .hero-name span {
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .hero-sub {
    margin-top: 8px;
    font-size: 14px;
    color: var(--muted);
    font-weight: 300;
  }
  .hero-right {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  /* ── stat pill ── */
  .stat-pill {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding: 14px 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 14px;
    min-width: 110px;
    transition: border-color .2s, transform .2s;
  }
  .stat-pill:hover {
    border-color: rgba(79,142,247,0.35);
    transform: translateY(-2px);
  }
  .stat-pill-value {
    font-family: 'Syne', sans-serif;
    font-size: 26px;
    font-weight: 800;
    line-height: 1;
    color: var(--text);
  }
  .stat-pill-label {
    font-size: 11px;
    color: var(--muted);
    margin-top: 4px;
    text-transform: uppercase;
    letter-spacing: .08em;
  }

  /* ── section title ── */
  .section-title {
    font-family: 'Syne', sans-serif;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .18em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .section-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  /* ── banner wrapper ── */
  .banner-wrapper {
    margin-top: 32px;
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid var(--border);
    background: var(--surface);
    position: relative;
  }
  .banner-wrapper::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(79,142,247,.07), rgba(167,139,250,.05));
    pointer-events: none;
  }

  /* ── main grid ── */
  .main-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 20px;
  }
  @media (max-width: 768px) {
    .main-grid { grid-template-columns: 1fr; }
  }
  .main-grid-full {
    grid-column: 1 / -1;
  }

  /* ── card ── */
  .dash-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
    position: relative;
    transition: border-color .25s, transform .25s, box-shadow .25s;
  }
  .dash-card:hover {
    border-color: rgba(79,142,247,.25);
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0,0,0,.35);
  }
  .dash-card-header {
    padding: 20px 24px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .dash-card-title {
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--muted);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .dash-card-title svg { color: var(--accent); }
  .dash-card-body { padding: 20px 24px 24px; }

  /* ── badge ── */
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 100px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: .04em;
  }
  .badge-blue  { background: rgba(79,142,247,.15);  color: var(--accent);  border: 1px solid rgba(79,142,247,.3);  }
  .badge-green { background: rgba(52,211,153,.12);  color: var(--accent3); border: 1px solid rgba(52,211,153,.3);  }
  .badge-purple{ background: rgba(167,139,250,.12); color: var(--accent2); border: 1px solid rgba(167,139,250,.3); }

  /* ── dot ── */
  .live-dot {
    display: inline-block;
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--accent3);
    animation: pulse-dot 2s infinite;
  }
  @keyframes pulse-dot {
    0%,100% { box-shadow: 0 0 0 0 rgba(52,211,153,.6); }
    50%      { box-shadow: 0 0 0 5px rgba(52,211,153,0); }
  }

  /* ── fade-in ── */
  .fade-section {
    transition: opacity .7s ease, transform .7s ease;
  }
  .fade-hidden  { opacity: 0; transform: translateY(20px); }
  .fade-visible { opacity: 1; transform: translateY(0); }

  /* ── WhatsApp fab ── */
  .whatsapp-fab {
    position: fixed;
    bottom: 32px; right: 32px;
    width: 52px; height: 52px;
    border-radius: 50%;
    background: #25D366;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 4px 20px rgba(37,211,102,.4);
    cursor: pointer;
    transition: transform .2s, box-shadow .2s;
    z-index: 90;
    text-decoration: none;
    animation: fab-in .4s ease both;
  }
  .whatsapp-fab:hover {
    transform: scale(1.1);
    box-shadow: 0 8px 30px rgba(37,211,102,.5);
  }
  @keyframes fab-in {
    from { opacity: 0; transform: scale(0.7) translateY(20px); }
    to   { opacity: 1; transform: scale(1) translateY(0); }
  }

  /* ── shimmer skeleton ── */
  .skeleton {
    background: linear-gradient(90deg, var(--surface2) 25%, rgba(255,255,255,.04) 50%, var(--surface2) 75%);
    background-size: 400% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
  }
  @keyframes shimmer {
    from { background-position: 100% 0; }
    to   { background-position: -100% 0; }
  }
`;

// ─── Inject styles ─────────────────────────────────────────────────────────────
const styleTag = document.createElement("style");
styleTag.textContent = css;
document.head.appendChild(styleTag);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function FadeSection({ children, id, delay = 0 }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.unobserve(el);
  }, []);

  return (
    <div
      id={id}
      ref={ref}
      className={`fade-section ${visible ? "fade-visible" : "fade-hidden"}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function CountUp({ value }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let frame;
    let start = 0;
    const end = value;
    const duration = 900;
    const startTime = performance.now();
    const step = (now) => {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * end));
      if (p < 1) frame = requestAnimationFrame(step);
      else setCount(end);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <>{count}</>;
}

function CardIcon({ icon }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {icon}
    </svg>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function ClientDashboard() {
  const [profile, setProfile]           = useState(null);
  const [shipments, setShipments]       = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]   = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showWhatsapp, setShowWhatsapp] = useState(false);
  const [loading, setLoading]           = useState(true);

  const token = localStorage.getItem("access");

  // ── Data fetching ─────────────────────────────────────────────────────────
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/accounts/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        setProfile(await res.json());
      } catch (err) { console.error(err); }
    };

    const fetchShipments = async () => {
      try {
        const res = await fetch(`${API_URL}/shipments/client/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch shipments");
        setShipments(await res.json());
      } catch (err) { console.error(err); }
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
      } catch (err) { console.error(err); }
    };

    Promise.all([fetchProfile(), fetchShipments(), fetchNotifications()])
      .finally(() => setLoading(false));

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // ── Scroll ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const scrollTop  = window.scrollY;
      const docHeight  = document.body.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
      if (scrollTop > 200) setShowWhatsapp(true);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const active   = shipments.filter((s) => s.status === "active").length;
  const delivered = shipments.filter((s) => s.status === "delivered").length;
  const pending  = shipments.filter((s) => s.status === "pending").length;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="dash-root">
      {/* ambient mesh + grid */}
      <div className="mesh" />
      <div className="grid-lines" />

      {/* progress bar */}
      <div className="progress-bar" style={{ width: `${scrollProgress}%` }} />

      {/* navbar */}
      <ClientNavbar notifications={notifications} unreadCount={unreadCount} />

      <div className="dash-body">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <FadeSection id="greeting">
          <div className="hero">
            <div className="hero-left">
              <div className="hero-label">
                <span className="live-dot" /> Live Dashboard
              </div>
              {loading ? (
                <div className="skeleton" style={{ width: 260, height: 48, borderRadius: 12 }} />
              ) : (
                <h1 className="hero-name">
                  Hey, <span>{profile?.username || "Client"}</span> 👋
                </h1>
              )}
              <p className="hero-sub">
                {loading
                  ? "Loading your overview..."
                  : `You have ${shipments.length} total shipments on record`}
              </p>
            </div>

            <div className="hero-right">
              {[
                { label: "Active",    value: active,    color: "var(--accent)"  },
                { label: "Delivered", value: delivered, color: "var(--accent3)" },
                { label: "Pending",   value: pending,   color: "var(--accent2)" },
              ].map(({ label, value, color }) => (
                <div className="stat-pill" key={label}>
                  {loading ? (
                    <div className="skeleton" style={{ width: 40, height: 30, borderRadius: 6 }} />
                  ) : (
                    <div className="stat-pill-value" style={{ color }}>
                      <CountUp value={value} />
                    </div>
                  )}
                  <div className="stat-pill-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeSection>

        {/* ── Next Shipment Banner ──────────────────────────────────────── */}
        <FadeSection id="next-shipment" delay={80}>
          <div style={{ marginTop: 32 }}>
            <div className="section-title">Upcoming</div>
            <div className="banner-wrapper">
              <NextShipmentBanner />
            </div>
          </div>
        </FadeSection>

        {/* ── Track Shipment (full width) ───────────────────────────────── */}
        <FadeSection id="track-shipment" delay={140}>
          <div style={{ marginTop: 32 }}>
            <div className="section-title">Tracking</div>
            <div className="dash-card">
              <div className="dash-card-header">
                <div className="dash-card-title">
                  <CardIcon icon={
                    <>
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </>
                  } />
                  Track a Shipment
                </div>
                <span className="badge badge-blue">Real-time</span>
              </div>
              <div className="dash-card-body">
                <TrackShipment />
              </div>
            </div>
          </div>
        </FadeSection>

        {/* ── Main 2-col grid ───────────────────────────────────────────── */}
        <FadeSection id="tools" delay={200}>
          <div style={{ marginTop: 32 }}>
            <div className="section-title">Tools & Actions</div>
            <div className="main-grid">

              {/* Pickup Request */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title">
                    <CardIcon icon={
                      <>
                        <path d="M5 12h14"/>
                        <path d="M12 5v14"/>
                      </>
                    } />
                    Pickup Request
                  </div>
                  <span className="badge badge-green">Available</span>
                </div>
                <div className="dash-card-body">
                  <PickupRequest />
                </div>
              </div>

              {/* Shipping Calculator */}
              <div className="dash-card">
                <div className="dash-card-header">
                  <div className="dash-card-title">
                    <CardIcon icon={
                      <>
                        <rect width="16" height="20" x="4" y="2" rx="2" ry="2"/>
                        <path d="M9 7h6M9 11h6M9 15h4"/>
                      </>
                    } />
                    Shipping Calculator
                  </div>
                  <span className="badge badge-purple">Estimate</span>
                </div>
                <div className="dash-card-body">
                  <ShippingCalculator />
                </div>
              </div>

              {/* Contact (full width) */}
              <div className="dash-card main-grid-full">
                <div className="dash-card-header">
                  <div className="dash-card-title">
                    <CardIcon icon={
                      <>
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </>
                    } />
                    Get in Touch
                  </div>
                </div>
                <div className="dash-card-body">
                  <Contact />
                </div>
              </div>

            </div>
          </div>
        </FadeSection>

      </div>{/* /dash-body */}

      {/* ── WhatsApp FAB ───────────────────────────────────────────────── */}
      {showWhatsapp && (
        <a
          className="whatsapp-fab"
          href="https://wa.me/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
        </a>
      )}
    </div>
  );
}
