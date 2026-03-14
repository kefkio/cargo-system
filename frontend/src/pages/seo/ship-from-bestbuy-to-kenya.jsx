// src/pages/ShipFromBestBuy.jsx

import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import ShippingCalculator from "../../components/shipment/ShippingCalculator";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Outfit:wght@300;400;500;600&display=swap";

// ─── Structured data ──────────────────────────────────────────────────────────
const SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Ship Electronics from Best Buy to Kenya",
  provider: {
    "@type": "Organization",
    name: "FirstPoint Cargo",
    url: "https://yourdomain.com",
    telephone: "+254701203325",
  },
  areaServed: { "@type": "Country", name: "Kenya" },
  serviceType: "International Package Forwarding",
  description:
    "Buy electronics from Best Buy USA and ship them to Kenya. TVs, laptops, phones, gaming consoles and more. Air freight in 5–10 days or sea freight in 4–6 weeks.",
};

const BREADCRUMB_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://yourdomain.com/" },
    { "@type": "ListItem", position: 2, name: "Ship From Best Buy to Kenya", item: "https://yourdomain.com/ship-from-bestbuy-to-kenya" },
  ],
};

const FAQ_DATA = [
  {
    q: "Can I ship Best Buy electronics to Kenya?",
    a: "Yes. Best Buy doesn't ship internationally, but you can use our US warehouse address as your delivery address. We receive your Best Buy order and forward it to Kenya by air or sea freight.",
  },
  {
    q: "How do I buy from Best Buy and ship to Kenya?",
    a: "Sign up with FirstPoint Cargo to get a US warehouse address. Enter that address at checkout on BestBuy.com. Once your package arrives at our warehouse, we ship it to Kenya.",
  },
  {
    q: "Will my electronics be safe during shipping?",
    a: "Yes. We use professional packing materials and handle all electronics with care. Fragile items like TVs and monitors are double-boxed and protected for international transit.",
  },
  {
    q: "Will I pay customs duty on electronics shipped to Kenya?",
    a: "Yes. Electronics imported into Kenya are subject to Kenya Revenue Authority import duties. We provide all necessary documentation and guide you through the customs process.",
  },
  {
    q: "Can I ship a TV from Best Buy to Kenya?",
    a: "Absolutely. TVs are one of our most commonly shipped items. Large TVs are best shipped by sea freight to keep costs manageable. We provide specialist packing for all screen sizes.",
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

// ─── Page content ─────────────────────────────────────────────────────────────
const POPULAR_ITEMS = [
  { icon: "📺", name: "4K & OLED TVs",        hint: "Samsung, LG, Sony" },
  { icon: "💻", name: "Laptops & MacBooks",    hint: "Apple, Dell, HP, Lenovo" },
  { icon: "📱", name: "iPhones & Smartphones", hint: "Apple, Samsung, Google" },
  { icon: "🎮", name: "Gaming Consoles",       hint: "PS5, Xbox, Nintendo Switch" },
  { icon: "🖥️", name: "Monitors & Displays",  hint: "All brands & sizes" },
  { icon: "🎧", name: "Audio & Headphones",    hint: "Bose, Sony, Beats" },
  { icon: "📷", name: "Cameras & Drones",      hint: "Canon, Nikon, DJI" },
  { icon: "⌨️", name: "PC Components",         hint: "CPUs, GPUs, Storage" },
];

const TIPS = [
  {
    step: "01",
    title: "Get Your US Warehouse Address",
    body: "Sign up for free and get a personal US address at one of our 4 US warehouses. This is your shipping address on BestBuy.com.",
  },
  {
    step: "02",
    title: "Shop on BestBuy.com",
    body: "Add items to your cart on BestBuy.com. At checkout, enter your FirstPoint warehouse address. Best Buy ships to our warehouse — free shipping often applies.",
  },
  {
    step: "03",
    title: "We Receive & Inspect",
    body: "We receive your package, photograph the contents, and notify you. You choose air freight (5–10 days) or sea freight (4–6 weeks).",
  },
  {
    step: "04",
    title: "Delivered to Kenya",
    body: "We ship your Best Buy electronics to your door in Nairobi or anywhere in Kenya. We handle customs clearance every step of the way.",
  },
];

const WHY_ITEMS = [
  { icon: "🔒", title: "Safe Electronics Handling", body: "Specialist packing for fragile items — screens, laptops and consoles are double-protected for the journey." },
  { icon: "📍", title: "Full Shipment Tracking", body: "Track your Best Buy order from our US warehouse to your door in Kenya. WhatsApp updates included." },
  { icon: "💸", title: "Competitive Rates", body: "Air freight from $16.99/kg. Sea freight from $30/ft³. Use the calculator below to estimate your cost instantly." },
  { icon: "⚡", title: "Fast Air Option", body: "Need your gadgets quickly? Air freight gets your Best Buy order to Kenya in just 5–10 business days." },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
const SectionLabel = ({ text, light = false }) => (
  <span className={`inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-4 px-3 py-1 rounded-full border ${
    light
      ? "text-blue-300 border-blue-400/30 bg-blue-400/10"
      : "text-blue-700 border-blue-200 bg-blue-50"
  }`}>
    {text}
  </span>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ShipFromBestBuy() {
  useEffect(() => {
    if (!document.getElementById("bb-fonts")) {
      const link = document.createElement("link");
      link.id = "bb-fonts";
      link.rel = "stylesheet";
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>Ship From Best Buy to Kenya | Electronics Forwarding | FirstPoint Cargo</title>
        <meta
          name="description"
          content="Buy electronics from Best Buy USA and ship to Kenya. TVs, laptops, iPhones, PS5 & more. Air freight 5–10 days · Sea freight 4–6 weeks. Instant cost calculator."
        />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <link rel="canonical" href="https://yourdomain.com/ship-from-bestbuy-to-kenya" />
        <meta name="keywords" content="ship Best Buy to Kenya, Best Buy international shipping Kenya, buy electronics USA ship Kenya, Best Buy forwarding Kenya, ship TV from USA to Kenya" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="FirstPoint Cargo" />
        <meta property="og:title" content="Ship From Best Buy to Kenya | Electronics Forwarding" />
        <meta property="og:description" content="Buy TVs, laptops, iPhones and gaming consoles from Best Buy USA. We ship them to Kenya for you. Air & sea freight available." />
        <meta property="og:image" content="https://yourdomain.com/assets/seo/bestbuy-preview.jpg" />
        <meta property="og:url" content="https://yourdomain.com/ship-from-bestbuy-to-kenya" />
        <meta property="og:locale" content="en_KE" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ship From Best Buy to Kenya | FirstPoint Cargo" />
        <meta name="twitter:description" content="Buy electronics from Best Buy USA. We ship to Kenya. TVs, laptops, phones, consoles & more." />
        <meta name="twitter:image" content="https://yourdomain.com/assets/seo/bestbuy-preview.jpg" />

        {/* Geo */}
        <meta name="geo.region" content="KE" />
        <meta name="geo.placename" content="Nairobi, Kenya" />

        {/* Structured data */}
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
      </Helmet>

      <div style={{ fontFamily: "'Outfit', sans-serif", background: "#f8fafc" }}>

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #1d4ed8 55%, #2563eb 100%)" }}
        >
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
            style={{ backgroundImage: "radial-gradient(circle at 10% 60%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(circle at 90% 10%, rgba(245,158,11,0.1) 0%, transparent 40%)" }} />
          {/* Circuit-board-style grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]" aria-hidden="true"
            style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

          {/* Back to home */}
          <div className="relative max-w-6xl mx-auto px-6 pt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-200 hover:text-white transition-colors group"
              aria-label="Back to homepage"
            >
              <span className="w-7 h-7 rounded-full border border-blue-300/30 bg-blue-300/10 flex items-center justify-center group-hover:bg-blue-300/20 transition-colors" aria-hidden="true">←</span>
              Back to Home
            </Link>
          </div>

          <div className="relative max-w-6xl mx-auto px-6 pt-8 pb-20 grid lg:grid-cols-2 gap-12 items-center">
            {/* Copy */}
            <div>
              <SectionLabel text="Best Buy Forwarding" light />
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Shop Best Buy.<br />
                <span style={{ color: "#fbbf24" }}>Ship to Kenya.</span>
              </h1>
              <p className="text-blue-100/80 text-lg leading-relaxed mb-8 max-w-lg">
                Best Buy doesn't ship internationally — but we do.
                Use our US warehouse address to buy any electronics from{" "}
                <strong className="text-white">BestBuy.com</strong>, and we'll forward
                your package to your door in Kenya.
              </p>

              {/* Key metrics */}
              <div className="flex flex-wrap gap-4 mb-10">
                {[
                  { label: "Air Freight", value: "5–10 Days" },
                  { label: "Sea Freight", value: "4–6 Weeks" },
                  { label: "Air Rate From", value: "$16.99/kg" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-5 py-3">
                    <p className="text-xs text-blue-200/70 font-medium tracking-wide uppercase mb-0.5">{label}</p>
                    <p className="text-xl font-bold text-amber-400" style={{ fontFamily: "'Playfair Display', serif" }}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="#calculator"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-slate-900 text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 4px 20px rgba(245,158,11,0.4)" }}
                >
                  🛒 Calculate Shipping Cost
                </a>
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
                className="relative w-80 rounded-3xl flex flex-col items-center justify-center text-center p-8 gap-3"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}
              >
                <div className="text-5xl mb-2" aria-hidden="true">🛒→📦→✈️</div>
                <p className="text-blue-200/60 text-sm font-medium">Buy on BestBuy.com</p>
                <div className="w-full h-px bg-white/10" />
                <p className="text-blue-200/60 text-sm font-medium">Ships to our US warehouse</p>
                <div className="w-full h-px bg-white/10" />
                <div>
                  <p className="text-2xl font-extrabold text-amber-400 mb-0.5" style={{ fontFamily: "'Playfair Display', serif" }}>Delivered</p>
                  <p className="text-blue-200/70 text-sm">to your door in Kenya</p>
                </div>
                {/* Popular items preview */}
                <div className="mt-2 flex flex-wrap gap-2 justify-center">
                  {["📺","💻","📱","🎮"].map((e) => (
                    <span key={e} className="text-2xl bg-white/10 rounded-xl w-10 h-10 flex items-center justify-center" aria-hidden="true">{e}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── POPULAR ELECTRONICS ───────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <SectionLabel text="What You Can Ship" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Popular Best Buy Items We Ship to Kenya
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              From the latest iPhones to 85-inch 4K TVs — if Best Buy sells it, we can ship it to Kenya.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {POPULAR_ITEMS.map(({ icon, name, hint }) => (
              <div
                key={name}
                className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 text-center"
              >
                <div className="text-3xl mb-3" aria-hidden="true">{icon}</div>
                <p className="font-bold text-gray-900 text-sm mb-1">{name}</p>
                <p className="text-gray-400 text-xs">{hint}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
        <div className="py-20" style={{ background: "linear-gradient(180deg, #eff6ff, #dbeafe)" }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <SectionLabel text="Step by Step" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                How to Ship From Best Buy to Kenya
              </h2>
              <p className="text-gray-500 mt-3 max-w-xl mx-auto">
                Four simple steps from BestBuy.com to your door in Kenya.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px"
                style={{ background: "linear-gradient(90deg, transparent, #3b82f6, #3b82f6, transparent)" }} aria-hidden="true" />
              {TIPS.map(({ step, title, body }) => (
                <div key={step} className="text-center">
                  <div
                    className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center font-extrabold text-xl relative z-10"
                    style={{ background: "linear-gradient(135deg, #1e1b4b, #1d4ed8)", color: "#fbbf24", fontFamily: "'Playfair Display', serif", boxShadow: "0 4px 16px rgba(29,78,216,0.3)" }}
                    aria-hidden="true"
                  >{step}</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-sm">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── WHY US ────────────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <SectionLabel text="Why FirstPoint" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Why Ship Your Best Buy Order With Us?
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {WHY_ITEMS.map(({ icon, title, body }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl mb-4 group-hover:bg-blue-100" aria-hidden="true">{icon}</div>
                <h3 className="font-bold text-gray-900 text-sm mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SHIPPING CALCULATOR ───────────────────────────────────────────── */}
        <div
          id="calculator"
          className="relative py-20 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #1d4ed8 55%, #1e40af 100%)" }}
          aria-labelledby="calc-section-heading"
        >
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
            style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgba(245,158,11,0.12), transparent 50%), radial-gradient(circle at 10% 80%, rgba(99,102,241,0.15), transparent 50%)" }} />

          <div className="relative max-w-6xl mx-auto px-6">
            <div className="text-center mb-10">
              <SectionLabel text="Instant Estimate" light />
              <h2
                id="calc-section-heading"
                className="text-3xl sm:text-4xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Estimate Your Best Buy Shipping Cost
              </h2>
              <p className="text-blue-200/70 mt-3 max-w-xl mx-auto">
                Enter the weight (air freight) or dimensions (sea freight) of your Best Buy package for an instant estimate.
              </p>
            </div>

            {/* Tip cards */}
            <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
              {[
                { icon: "💡", text: "Electronics are usually shipped by air for speed" },
                { icon: "📺", text: "Large TVs & appliances are cheaper by sea freight" },
                { icon: "📏", text: "Use the actual package weight from your Best Buy order" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-start gap-3 bg-white/8 rounded-xl px-4 py-3 border border-white/10">
                  <span className="text-lg shrink-0 mt-0.5" aria-hidden="true">{icon}</span>
                  <p className="text-blue-100/80 text-xs leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

            <div className="max-w-lg mx-auto">
              <ShippingCalculator />
            </div>

            <p className="text-center text-blue-300/40 text-xs mt-8">
              Estimates only · Final rates confirmed at booking · Customs duties may apply
            </p>
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
              <p className="text-gray-500 mt-3">Common questions about shipping Best Buy electronics to Kenya.</p>
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
                    <span className="ml-4 w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg shrink-0 font-bold transition-transform duration-300 group-open:rotate-45">+</span>
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

        {/* ── CTA STRIP ─────────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 pb-20">
          <div
            className="relative rounded-3xl overflow-hidden p-10 sm:p-14 flex flex-col sm:flex-row items-center gap-8"
            style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #1d4ed8 60%, #1e40af 100%)" }}
          >
            <div className="absolute top-0 right-0 w-80 h-80 pointer-events-none" aria-hidden="true"
              style={{ background: "radial-gradient(circle at top right, rgba(245,158,11,0.15), transparent 60%)" }} />
            <div className="flex-1">
              <p className="text-blue-300 text-xs font-semibold tracking-[0.2em] uppercase mb-2">Ready to Ship?</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                Start Shopping on Best Buy Today
              </h2>
              <p className="text-blue-200/60 text-sm max-w-md">
                Get your free US warehouse address in minutes. Shop BestBuy.com and ship your electronics to Kenya with ease.
              </p>
            </div>
            <div className="flex flex-col gap-3 shrink-0 w-full sm:w-auto">
              <Link
                to="/register"
                className="px-8 py-3.5 rounded-2xl font-bold text-slate-900 text-sm text-center transition-all hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 4px 20px rgba(245,158,11,0.4)" }}
              >
                Get My US Address →
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

        {/* ── FOOTER NAV ────────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 py-10 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Also explore</p>
              <div className="flex flex-wrap gap-4">
                <Link to="/ship-from-amazon-to-kenya" className="text-sm font-medium text-blue-700 hover:text-blue-900 underline underline-offset-2 transition-colors">
                  Ship from Amazon to Kenya →
                </Link>
                <Link to="/air-freight-usa-to-kenya" className="text-sm font-medium text-blue-700 hover:text-blue-900 underline underline-offset-2 transition-colors">
                  Air Freight USA to Kenya →
                </Link>
                <Link to="/sea-freight-usa-to-kenya" className="text-sm font-medium text-blue-700 hover:text-blue-900 underline underline-offset-2 transition-colors">
                  Sea Freight USA to Kenya →
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