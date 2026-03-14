// src/pages/SeaFreightUSAtoKenya.jsx

import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Outfit:wght@300;400;500;600&display=swap";

// ─── Structured data ──────────────────────────────────────────────────────────
const SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Sea Freight Shipping USA to Kenya",
  provider: {
    "@type": "Organization",
    name: "FirstPoint Cargo",
    url: "https://yourdomain.com",
    telephone: "+254701203325",
  },
  areaServed: { "@type": "Country", name: "Kenya" },
  serviceType: "International Sea Freight",
  description:
    "Affordable sea freight shipping from the United States to Kenya for large shipments and bulk cargo. Transit time 4–6 weeks. From $30/ft³.",
  offers: [
    {
      "@type": "Offer",
      name: "Sea Freight up to 100 ft³",
      priceCurrency: "USD",
      price: "30.00",
      unitText: "per cubic foot",
      availability: "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      name: "Sea Freight over 100 ft³",
      priceCurrency: "USD",
      price: "25.00",
      unitText: "per cubic foot",
      availability: "https://schema.org/InStock",
    },
  ],
};

const BREADCRUMB_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://yourdomain.com/" },
    {
      "@type": "ListItem",
      position: 2,
      name: "Sea Freight USA to Kenya",
      item: "https://yourdomain.com/sea-freight-usa-to-kenya",
    },
  ],
};

const FAQ_DATA = [
  {
    q: "How long does sea freight from the USA to Kenya take?",
    a: "Sea freight from the USA to Kenya typically takes 4 to 6 weeks, including ocean transit and customs clearance at the port of Mombasa.",
  },
  {
    q: "How much does sea freight from USA to Kenya cost?",
    a: "Sea freight is charged at $30 per cubic foot for the first 100 cubic feet, and $25 per cubic foot for any volume above 100 cubic feet. Use our calculator for an instant estimate.",
  },
  {
    q: "What types of cargo can I ship by sea to Kenya?",
    a: "Sea freight is ideal for large items, furniture, appliances, vehicles, machinery, bulk goods, and full container loads. Almost any non-hazardous cargo can be shipped by sea.",
  },
  {
    q: "What is the minimum shipment size for sea freight?",
    a: "We accept LCL (Less than Container Load) shipments of any size, making sea freight accessible even for smaller bulk orders. There is no strict minimum volume.",
  },
  {
    q: "Where does sea freight from the USA arrive in Kenya?",
    a: "All sea freight shipments arrive at the Port of Mombasa in Kenya. We handle customs clearance and onward delivery to Nairobi or any other destination in Kenya.",
  },
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_DATA.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

const FEATURES = [
  {
    icon: "💰",
    title: "$30 / ft³",
    body: "The most cost-effective way to ship large or heavy items from the USA. Tiered pricing drops to $25/ft³ above 100 cubic feet.",
  },
  {
    icon: "📦",
    title: "Any Volume",
    body: "From a single oversized item to a full container load — we handle LCL and FCL shipments of all sizes.",
  },
  {
    icon: "🚢",
    title: "4–6 Week Transit",
    body: "Ocean freight from the US West or East Coast to the Port of Mombasa, with regular sailings and reliable schedules.",
  },
  {
    icon: "🏭",
    title: "4 US Warehouses",
    body: "Drop your goods at our warehouses in New York, Los Angeles, Chicago or Federal Way, WA for consolidation and loading.",
  },
  {
    icon: "📋",
    title: "Customs & Clearance",
    body: "Full KRA customs clearance handling at Mombasa port. We provide all documentation including Bill of Lading and packing lists.",
  },
  {
    icon: "🚛",
    title: "Door-to-Door Delivery",
    body: "Once cleared at Mombasa, we arrange onward trucking to Nairobi, Kisumu, Nakuru, or any destination across Kenya.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Get Your US Warehouse Address",
    body: "Sign up to receive your personal US warehouse address. Use it when shipping purchases from any US store.",
  },
  {
    number: "02",
    title: "Ship Your Goods to Warehouse",
    body: "Deliver your cargo to our US warehouse. We accept goods from Amazon, eBay, Walmart or any US supplier.",
  },
  {
    number: "03",
    title: "We Consolidate & Load",
    body: "Your cargo is consolidated, packed and loaded onto the next available vessel. We handle all export documentation.",
  },
  {
    number: "04",
    title: "Mombasa to Your Door",
    body: "We clear your cargo through Mombasa customs and arrange delivery to your final destination anywhere in Kenya.",
  },
];

const COMPARE = [
  { label: "Best for",          air: "Small, urgent packages",       sea: "Large, heavy or bulk cargo" },
  { label: "Transit time",      air: "5–10 business days",           sea: "4–6 weeks" },
  { label: "Rate",              air: "$16.99 / kg",                  sea: "$30 / ft³ (≤100 ft³)" },
  { label: "Tracking",         air: "Real-time",                    sea: "Milestone updates" },
  { label: "Customs support",  air: "✓ Included",                   sea: "✓ Included" },
  { label: "Door delivery",    air: "✓ Included",                   sea: "✓ Included" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
const SectionLabel = ({ text, light = false }) => (
  <span
    className={`inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-4 px-3 py-1 rounded-full border ${
      light
        ? "text-teal-300 border-teal-400/30 bg-teal-400/10"
        : "text-teal-700 border-teal-200 bg-teal-50"
    }`}
  >
    {text}
  </span>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SeaFreightUSAtoKenya() {
  useEffect(() => {
    if (!document.getElementById("sf-fonts")) {
      const link = document.createElement("link");
      link.id = "sf-fonts";
      link.rel = "stylesheet";
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>Sea Freight USA to Kenya | Affordable Cargo Shipping from $30/ft³ | FirstPoint</title>
        <meta
          name="description"
          content="Affordable sea freight from the USA to Kenya for large shipments. From $30/ft³, 4–6 week transit via Mombasa port. LCL & FCL available. Full customs clearance included."
        />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <link rel="canonical" href="https://yourdomain.com/sea-freight-usa-to-kenya" />
        <meta name="keywords" content="sea freight USA to Kenya, ocean cargo Kenya, ship bulk goods to Kenya, LCL USA Kenya, Mombasa cargo shipping, affordable shipping Kenya" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="FirstPoint Cargo" />
        <meta property="og:title" content="Sea Freight USA to Kenya | From $30/ft³ | FirstPoint Cargo" />
        <meta property="og:description" content="Ship large cargo by sea from the USA to Kenya. $30/ft³, 4–6 week transit, full customs clearance at Mombasa port." />
        <meta property="og:image" content="https://yourdomain.com/assets/seo/sea-freight-preview.jpg" />
        <meta property="og:url" content="https://yourdomain.com/sea-freight-usa-to-kenya" />
        <meta property="og:locale" content="en_KE" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Sea Freight USA to Kenya | FirstPoint Cargo" />
        <meta name="twitter:description" content="Affordable sea freight from the USA to Kenya. From $30/ft³. LCL & FCL. Mombasa port delivery." />
        <meta name="twitter:image" content="https://yourdomain.com/assets/seo/sea-freight-preview.jpg" />

        {/* Geo */}
        <meta name="geo.region" content="KE" />
        <meta name="geo.placename" content="Mombasa, Kenya" />

        {/* Structured data */}
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
      </Helmet>

      <div style={{ fontFamily: "'Outfit', sans-serif", background: "#f0fdfa" }}>

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #042f2e 0%, #065f46 50%, #0f766e 100%)" }}
        >
          {/* Background effects */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
            style={{ backgroundImage: "radial-gradient(circle at 15% 60%, rgba(20,184,166,0.12) 0%, transparent 50%), radial-gradient(circle at 85% 20%, rgba(245,158,11,0.08) 0%, transparent 40%)" }} />
          {/* Wave pattern */}
          <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none opacity-10" aria-hidden="true"
            style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(255,255,255,0.3) 10px, rgba(255,255,255,0.3) 11px)", backgroundSize: "100% 22px" }} />

          {/* Back to home */}
          <div className="relative max-w-6xl mx-auto px-6 pt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-teal-300 hover:text-white transition-colors group"
              aria-label="Back to homepage"
            >
              <span className="w-7 h-7 rounded-full border border-teal-400/30 bg-teal-400/10 flex items-center justify-center group-hover:bg-teal-400/20 transition-colors" aria-hidden="true">←</span>
              Back to Home
            </Link>
          </div>

          <div className="relative max-w-6xl mx-auto px-6 pt-8 pb-20 grid lg:grid-cols-2 gap-12 items-center">
            {/* Copy */}
            <div>
              <SectionLabel text="Sea Freight Service" light />
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Sea Freight<br />
                <span style={{ color: "#2dd4bf" }}>USA → Kenya</span>
              </h1>
              <p className="text-emerald-100/80 text-lg leading-relaxed mb-8 max-w-lg">
                The most affordable way to ship large, heavy, or bulk cargo from the United States to Kenya.
                Your goods travel by ocean freight to <strong className="text-white">Mombasa port</strong> and
                are delivered anywhere in Kenya — typically in <strong className="text-white">4–6 weeks</strong>.
              </p>

              {/* Key metrics */}
              <div className="flex flex-wrap gap-4 mb-10">
                {[
                  { label: "Transit Time",   value: "4–6 Weeks" },
                  { label: "Rate ≤ 100 ft³", value: "$30 / ft³" },
                  { label: "Rate > 100 ft³", value: "$25 / ft³" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-5 py-3">
                    <p className="text-xs text-emerald-300/70 font-medium tracking-wide uppercase mb-0.5">{label}</p>
                    <p className="text-xl font-bold text-amber-400" style={{ fontFamily: "'Playfair Display', serif" }}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/#calculator"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-slate-900 text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 4px 20px rgba(245,158,11,0.4)" }}
                >
                  🚢 Calculate My Cost
                </Link>
                <a
                  href="https://wa.me/254701203325"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-white text-sm border border-white/20 hover:bg-white/10 transition-all duration-200"
                >
                  💬 Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Visual card */}
            <div className="hidden lg:flex justify-center">
              <div
                className="relative w-80 h-80 rounded-3xl flex flex-col items-center justify-center text-center p-8"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}
              >
                <div className="text-7xl mb-4" aria-hidden="true">🚢</div>
                <div className="text-5xl font-extrabold text-teal-300 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>4–6</div>
                <div className="text-emerald-200/80 font-semibold text-lg mb-3">Weeks to Kenya</div>
                <div className="w-12 h-0.5 bg-teal-400/40 mx-auto mb-3" />
                <p className="text-emerald-300/60 text-sm">
                  USA ports → Mombasa → Kenya nationwide
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── FEATURES ──────────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <SectionLabel text="Why Choose Sea Freight" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Built for Large Shipments
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Sea freight is the smart choice when volume matters more than speed.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon, title, body }) => (
              <div
                key={title}
                className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center text-2xl mb-4 group-hover:bg-teal-100 transition-colors" aria-hidden="true">{icon}</div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
        <div className="py-20" style={{ background: "linear-gradient(180deg, #f0fdf4, #dcfce7)" }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <SectionLabel text="Step by Step" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                How Sea Freight Works
              </h2>
              <p className="text-gray-500 mt-3 max-w-xl mx-auto">
                From your supplier in the US to your door in Kenya — here's the full journey.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px"
                style={{ background: "linear-gradient(90deg, transparent, #0d9488, #0d9488, transparent)" }} aria-hidden="true" />
              {STEPS.map(({ number, title, body }) => (
                <div key={number} className="text-center">
                  <div
                    className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center font-extrabold text-xl relative z-10"
                    style={{ background: "linear-gradient(135deg, #042f2e, #065f46)", color: "#2dd4bf", fontFamily: "'Playfair Display', serif", boxShadow: "0 4px 16px rgba(4,47,46,0.3)" }}
                    aria-hidden="true"
                  >{number}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── AIR vs SEA COMPARISON ─────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <SectionLabel text="Compare Options" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Air Freight vs Sea Freight
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Not sure which service is right for you? Here's a quick side-by-side.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-3 text-center">
              <div className="py-4 px-4 border-b border-gray-100" />
              <div className="py-4 px-4 border-b border-l border-gray-100 bg-sky-50">
                <span className="text-2xl" aria-hidden="true">✈️</span>
                <p className="font-bold text-gray-800 text-sm mt-1">Air Freight</p>
              </div>
              <div className="py-4 px-4 border-b border-l border-gray-100 bg-teal-50">
                <span className="text-2xl" aria-hidden="true">🚢</span>
                <p className="font-bold text-gray-800 text-sm mt-1">Sea Freight</p>
              </div>
            </div>
            {COMPARE.map(({ label, air, sea }, i) => (
              <div key={label} className={`grid grid-cols-3 text-sm ${i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}`}>
                <div className="py-3.5 px-5 font-semibold text-gray-500 text-xs uppercase tracking-wide border-b border-gray-100 flex items-center">{label}</div>
                <div className="py-3.5 px-5 text-gray-700 border-b border-l border-gray-100 flex items-center justify-center text-center">{air}</div>
                <div className="py-3.5 px-5 text-teal-800 font-medium border-b border-l border-gray-100 flex items-center justify-center text-center">{sea}</div>
              </div>
            ))}
            {/* CTA row */}
            <div className="grid grid-cols-3">
              <div className="py-5 px-4" />
              <div className="py-5 px-4 border-l border-gray-100 flex items-center justify-center">
                <Link to="/air-freight-usa-to-kenya"
                  className="text-xs font-bold text-sky-700 hover:text-sky-900 underline underline-offset-2 transition-colors">
                  Learn more →
                </Link>
              </div>
              <div className="py-5 px-4 border-l border-gray-100 flex items-center justify-center">
                <Link to="/#calculator"
                  className="text-xs font-bold text-teal-700 hover:text-teal-900 underline underline-offset-2 transition-colors">
                  Get a quote →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── PRICING CTA ───────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 pb-20">
          <div
            className="relative rounded-3xl overflow-hidden p-10 sm:p-14 flex flex-col sm:flex-row items-center gap-8"
            style={{ background: "linear-gradient(135deg, #042f2e 0%, #065f46 55%, #0f766e 100%)" }}
          >
            <div className="absolute top-0 right-0 w-80 h-80 pointer-events-none" aria-hidden="true"
              style={{ background: "radial-gradient(circle at top right, rgba(45,212,191,0.15), transparent 60%)" }} />
            <div className="flex-1">
              <p className="text-teal-300 text-xs font-semibold tracking-[0.2em] uppercase mb-2">Sea Freight Rates</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                From <span className="text-amber-400">$30</span>
                <span className="text-slate-400 text-xl font-normal"> / ft³</span>
              </h2>
              <p className="text-teal-200/60 text-sm mb-1">Volume &gt; 100 ft³ → <span className="text-amber-300 font-semibold">$25 / ft³</span></p>
              <p className="text-emerald-200/50 text-sm max-w-md mt-2">
                LCL & FCL available. All shipments include export documentation, ocean freight, and customs clearance at Mombasa port.
              </p>
            </div>
            <div className="flex flex-col gap-3 shrink-0 w-full sm:w-auto">
              <Link
                to="/#calculator"
                className="px-8 py-3.5 rounded-2xl font-bold text-slate-900 text-sm text-center transition-all hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 4px 20px rgba(245,158,11,0.4)" }}
              >
                Get Instant Quote →
              </Link>
              <a
                href="https://wa.me/254701203325"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3.5 rounded-2xl font-semibold text-white text-sm text-center border border-white/20 hover:bg-white/10 transition-colors"
              >
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>

        {/* ── FAQ ───────────────────────────────────────────────────────────── */}
        <div className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-12">
              <SectionLabel text="FAQ" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                Frequently Asked Questions
              </h2>
              <p className="text-gray-500 mt-3">Common questions about sea freight from the USA to Kenya.</p>
            </div>
            <div className="flex flex-col gap-3" itemScope itemType="https://schema.org/FAQPage">
              {FAQ_DATA.map(({ q, a }) => (
                <details
                  key={q}
                  className="group bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden cursor-pointer"
                  itemScope itemProp="mainEntity" itemType="https://schema.org/Question"
                >
                  <summary
                    className="flex items-center justify-between px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base list-none select-none"
                    itemProp="name"
                  >
                    {q}
                    <span className="ml-4 w-7 h-7 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-lg shrink-0 font-bold transition-transform duration-300 group-open:rotate-45">+</span>
                  </summary>
                  <div
                    className="px-6 pb-5 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-100"
                    itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer"
                  >
                    <span itemProp="text">{a}</span>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* ── FOOTER NAV ────────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 py-10 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Also explore</p>
              <div className="flex flex-wrap gap-4">
                <Link to="/air-freight-usa-to-kenya"
                  className="text-sm font-medium text-teal-700 hover:text-teal-900 underline underline-offset-2 transition-colors">
                  Air Freight USA to Kenya →
                </Link>
                <Link to="/#pricing"
                  className="text-sm font-medium text-teal-700 hover:text-teal-900 underline underline-offset-2 transition-colors">
                  View All Pricing →
                </Link>
                <Link to="/#calculator"
                  className="text-sm font-medium text-teal-700 hover:text-teal-900 underline underline-offset-2 transition-colors">
                  Shipping Calculator →
                </Link>
              </div>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors group"
              aria-label="Back to homepage"
            >
              <span className="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors" aria-hidden="true">←</span>
              Back to Home
            </Link>
          </div>
        </div>

      </div>
    </>
  );
}