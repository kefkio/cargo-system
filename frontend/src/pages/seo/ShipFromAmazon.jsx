// src/pages/ShipFromAmazon.jsx

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
  name: "Ship From Amazon to Kenya",
  provider: {
    "@type": "Organization",
    name: "FirstPoint Cargo",
    url: "https://yourdomain.com",
    telephone: "+254701203325",
  },
  areaServed: { "@type": "Country", name: "Kenya" },
  serviceType: "International Package Forwarding",
  description:
    "Buy anything from Amazon USA and ship to Kenya. Electronics, clothing, books, supplements, tools and more. Air freight in 5–10 days or sea freight in 4–6 weeks.",
  offers: [
    {
      "@type": "Offer",
      name: "Air Freight",
      priceCurrency: "USD",
      price: "16.99",
      unitText: "per kg",
    },
    {
      "@type": "Offer",
      name: "Sea Freight",
      priceCurrency: "USD",
      price: "30.00",
      unitText: "per cubic foot",
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
      name: "Ship From Amazon to Kenya",
      item: "https://yourdomain.com/ship-from-amazon-to-kenya",
    },
  ],
};

const FAQ_DATA = [
  {
    q: "Can Amazon ship directly to Kenya?",
    a: "Some Amazon items ship internationally, but the majority of US-only listings do not. Our US warehouse address unlocks the entire Amazon US catalog — we receive your order and forward it to Kenya.",
  },
  {
    q: "How do I use Amazon with a US forwarding address?",
    a: "Sign up with FirstPoint Cargo to get your free personal US warehouse address. At checkout on Amazon.com, enter that address as your delivery address. Amazon ships to our warehouse; we ship to you in Kenya.",
  },
  {
    q: "How long does shipping from Amazon to Kenya take?",
    a: "After your Amazon order arrives at our US warehouse, air freight to Kenya takes 5–10 business days. Sea freight takes 4–6 weeks and is best for large or heavy Amazon orders.",
  },
  {
    q: "Can I use Amazon Prime with a forwarding address?",
    a: "Yes. Amazon Prime free shipping and same-day/next-day delivery applies to our US warehouse addresses. You get the benefits of Prime to our warehouse, then we handle forwarding to Kenya.",
  },
  {
    q: "What Amazon products can I ship to Kenya?",
    a: "You can ship electronics, clothing, books, supplements, kitchen appliances, tools, sports equipment, baby products and most general merchandise. Hazardous materials and restricted items are excluded.",
  },
  {
    q: "How much does it cost to ship from Amazon to Kenya?",
    a: "Air freight starts at $16.99 per kg (minimum 1 kg). Sea freight starts at $30 per cubic foot for up to 100 ft³, and $25/ft³ above that. Use our calculator below for an instant estimate.",
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
const POPULAR_CATEGORIES = [
  { icon: "📱", name: "Electronics",        hint: "Phones, laptops, tablets, TVs" },
  { icon: "📚", name: "Books & Media",       hint: "Textbooks, novels, DVDs" },
  { icon: "💊", name: "Health & Vitamins",   hint: "Supplements, fitness, wellness" },
  { icon: "👗", name: "Clothing & Shoes",    hint: "Fashion, sportswear, accessories" },
  { icon: "🍳", name: "Kitchen & Home",      hint: "Appliances, cookware, décor" },
  { icon: "🔧", name: "Tools & DIY",         hint: "Power tools, hand tools, hardware" },
  { icon: "👶", name: "Baby Products",       hint: "Gear, clothing, feeding, toys" },
  { icon: "🎮", name: "Gaming & Toys",       hint: "Consoles, games, LEGO, action figures" },
];

const STEPS = [
  {
    step: "01",
    title: "Create Your Account",
    body: "Sign up with FirstPoint Cargo and get a personal US warehouse address instantly — in New York, LA, Chicago or Federal Way, WA.",
  },
  {
    step: "02",
    title: "Shop on Amazon.com",
    body: "Browse Amazon.com and add items to your cart. At checkout, enter your FirstPoint US warehouse address as the delivery address.",
  },
  {
    step: "03",
    title: "We Receive & Inspect",
    body: "Your Amazon order arrives at our US warehouse. We photograph, inspect and notify you via WhatsApp. You choose air or sea freight.",
  },
  {
    step: "04",
    title: "Delivered in Kenya",
    body: "We ship your Amazon goods to your door anywhere in Kenya — Nairobi, Mombasa, Kisumu, Nakuru or upcountry. Customs included.",
  },
];

const ADVANTAGES = [
  {
    icon: "🌍",
    title: "Unlock the Full Amazon Catalog",
    body: "Access 350M+ Amazon products — including US-only listings that normally don't ship internationally to Kenya.",
  },
  {
    icon: "⚡",
    title: "Amazon Prime to Our Warehouse",
    body: "Prime free & same-day shipping applies to our US addresses. Your packages arrive at our warehouse fast, then we forward to Kenya.",
  },
  {
    icon: "📦",
    title: "Multi-Order Consolidation",
    body: "Ordered from multiple Amazon sellers? We consolidate everything into one shipment — lower cost, one delivery.",
  },
  {
    icon: "🔔",
    title: "WhatsApp Arrival Alerts",
    body: "We notify you the moment your Amazon order arrives at our warehouse with photographs and package details.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
const SectionLabel = ({ text, light = false }) => (
  <span className={`inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-4 px-3 py-1 rounded-full border ${
    light
      ? "text-orange-200 border-orange-300/30 bg-orange-300/10"
      : "text-orange-700 border-orange-200 bg-orange-50"
  }`}>
    {text}
  </span>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ShipFromAmazon() {
  useEffect(() => {
    if (!document.getElementById("az-fonts")) {
      const link = document.createElement("link");
      link.id = "az-fonts";
      link.rel = "stylesheet";
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>Ship From Amazon to Kenya | From $16.99/kg | FirstPoint Cargo</title>
        <meta
          name="description"
          content="Buy anything from Amazon USA and ship to Kenya. Electronics, books, vitamins, clothing & more. Use Amazon Prime to our warehouse. Air freight 5–10 days · Sea freight 4–6 weeks."
        />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <link rel="canonical" href="https://yourdomain.com/ship-from-amazon-to-kenya" />
        <meta name="keywords" content="ship Amazon to Kenya, Amazon Kenya shipping, buy from Amazon ship to Kenya, Amazon forwarding Kenya, Amazon Prime Kenya, Amazon to Nairobi shipping" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="FirstPoint Cargo" />
        <meta property="og:title" content="Ship From Amazon to Kenya | FirstPoint Cargo" />
        <meta property="og:description" content="Buy electronics, books, vitamins & clothing from Amazon USA. We ship to Kenya. Amazon Prime works to our US warehouse." />
        <meta property="og:image" content="https://yourdomain.com/assets/seo/amazon-preview.jpg" />
        <meta property="og:url" content="https://yourdomain.com/ship-from-amazon-to-kenya" />
        <meta property="og:locale" content="en_KE" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ship From Amazon to Kenya | FirstPoint Cargo" />
        <meta name="twitter:description" content="Shop Amazon USA, ship to Kenya. Electronics, clothing, books & more. Amazon Prime works too." />
        <meta name="twitter:image" content="https://yourdomain.com/assets/seo/amazon-preview.jpg" />

        {/* Geo */}
        <meta name="geo.region" content="KE" />
        <meta name="geo.placename" content="Nairobi, Kenya" />

        {/* Structured data */}
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
      </Helmet>

      <div style={{ fontFamily: "'Outfit', sans-serif", background: "#fff8f0" }}>

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1a0800 0%, #7c2d12 45%, #9a3412 100%)" }}
        >
          {/* Atmospheric glows */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
            style={{ backgroundImage: "radial-gradient(circle at 15% 70%, rgba(251,146,60,0.14) 0%, transparent 50%), radial-gradient(circle at 85% 10%, rgba(253,186,116,0.08) 0%, transparent 45%)" }} />
          {/* Amazon smile arc suggestion - subtle curved lines */}
          <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none opacity-[0.04]" aria-hidden="true"
            style={{ backgroundImage: "repeating-radial-gradient(ellipse at 50% 200%, transparent 60%, rgba(255,255,255,0.4) 61%, transparent 62%)", backgroundSize: "200% 200%" }} />

          {/* Back to home */}
          <div className="relative max-w-6xl mx-auto px-6 pt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-orange-300 hover:text-white transition-colors group"
              aria-label="Back to homepage"
            >
              <span className="w-7 h-7 rounded-full border border-orange-400/30 bg-orange-400/10 flex items-center justify-center group-hover:bg-orange-400/20 transition-colors" aria-hidden="true">←</span>
              Back to Home
            </Link>
          </div>

          <div className="relative max-w-6xl mx-auto px-6 pt-8 pb-20 grid lg:grid-cols-2 gap-12 items-center">
            {/* Copy */}
            <div>
              <SectionLabel text="Amazon Forwarding" light />
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Shop Amazon.<br />
                <span style={{ color: "#fb923c" }}>Ship to Kenya.</span>
              </h1>
              <p className="text-orange-100/75 text-lg leading-relaxed mb-8 max-w-lg">
                Amazon's 350M+ product catalog is now yours. Use our US warehouse address
                at checkout on <strong className="text-white">Amazon.com</strong> — even
                Amazon Prime orders — and we'll forward everything to your door in Kenya.
              </p>

              {/* Metrics */}
              <div className="flex flex-wrap gap-4 mb-10">
                {[
                  { label: "Air Freight",   value: "5–10 Days" },
                  { label: "Sea Freight",   value: "4–6 Weeks" },
                  { label: "Air Rate From", value: "$16.99/kg" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-5 py-3">
                    <p className="text-xs text-orange-200/60 font-medium tracking-wide uppercase mb-0.5">{label}</p>
                    <p className="text-xl font-bold text-orange-300" style={{ fontFamily: "'Playfair Display', serif" }}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="#calculator"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-white text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #ea580c, #c2410c)", boxShadow: "0 4px 20px rgba(234,88,12,0.5)" }}
                >
                  📦 Calculate Shipping Cost
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
                className="relative w-80 rounded-3xl flex flex-col items-center text-center p-8 gap-4"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", boxShadow: "0 25px 50px rgba(0,0,0,0.4)" }}
              >
                <div className="text-5xl" aria-hidden="true">📦</div>
                <div>
                  <p className="text-orange-300/70 text-xs font-semibold uppercase tracking-widest mb-1">350M+ Products</p>
                  <p className="text-white font-bold text-base">Amazon.com</p>
                </div>
                <div className="w-full h-px bg-white/10" />
                <div className="flex flex-wrap gap-2 justify-center">
                  {POPULAR_CATEGORIES.slice(0, 6).map(({ icon }) => (
                    <span key={icon} className="text-xl bg-white/10 rounded-xl w-10 h-10 flex items-center justify-center" aria-hidden="true">{icon}</span>
                  ))}
                </div>
                <div className="w-full h-px bg-white/10" />
                {/* Prime badge */}
                <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2 border border-white/15">
                  <span className="text-base" aria-hidden="true">✓</span>
                  <p className="text-orange-200/80 text-xs font-semibold">Amazon Prime Compatible</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── POPULAR CATEGORIES ────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <SectionLabel text="What You Can Ship" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Popular Amazon Categories We Ship to Kenya
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              If Amazon sells it, we can ship it. Here are the most popular categories our customers order.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {POPULAR_CATEGORIES.map(({ icon, name, hint }) => (
              <div
                key={name}
                className="group bg-white rounded-2xl p-5 border border-orange-100 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-orange-300 transition-all duration-300 text-center"
              >
                <div className="text-3xl mb-3" aria-hidden="true">{icon}</div>
                <p className="font-bold text-gray-900 text-sm mb-1">{name}</p>
                <p className="text-gray-400 text-xs">{hint}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── ADVANTAGES ────────────────────────────────────────────────────── */}
        <div className="py-20" style={{ background: "linear-gradient(180deg, #fff7ed, #ffedd5)" }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <SectionLabel text="Why Amazon + FirstPoint" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                The Complete Amazon-to-Kenya Experience
              </h2>
              <p className="text-gray-500 mt-3 max-w-xl mx-auto">
                We've built our service around how Amazon shoppers actually shop — Prime, multi-seller orders, and all.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {ADVANTAGES.map(({ icon, title, body }) => (
                <div key={title} className="bg-white rounded-2xl p-6 border border-orange-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl mb-4" aria-hidden="true">{icon}</div>
                  <h3 className="font-bold text-gray-900 text-sm mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <SectionLabel text="Step by Step" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              How to Ship From Amazon to Kenya
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              From Amazon.com to your front door anywhere in Kenya — in four simple steps.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px"
              style={{ background: "linear-gradient(90deg, transparent, #ea580c, #ea580c, transparent)" }} aria-hidden="true" />
            {STEPS.map(({ step, title, body }) => (
              <div key={step} className="text-center">
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center font-extrabold text-xl relative z-10"
                  style={{ background: "linear-gradient(135deg, #1a0800, #7c2d12)", color: "#fb923c", fontFamily: "'Playfair Display', serif", boxShadow: "0 4px 16px rgba(124,45,18,0.4)" }}
                  aria-hidden="true"
                >{step}</div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── DELIVERY TIME VISUAL ──────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 pb-20">
          <div
            className="rounded-3xl overflow-hidden grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/10"
            style={{ background: "linear-gradient(135deg, #1a0800, #7c2d12)" }}
            aria-label="Delivery time comparison"
          >
            {[
              { icon: "✈️", mode: "Air Freight", time: "5–10 Days", rate: "$16.99 / kg", note: "Best for urgent or lighter packages" },
              { icon: "🚢", mode: "Sea Freight", time: "4–6 Weeks", rate: "$30 / ft³", note: "Best for heavy or large Amazon orders" },
            ].map(({ icon, mode, time, rate, note }) => (
              <div key={mode} className="p-8 sm:p-10 text-center flex flex-col items-center gap-3">
                <span className="text-4xl" aria-hidden="true">{icon}</span>
                <p className="text-orange-300/70 text-xs font-semibold uppercase tracking-widest">{mode}</p>
                <p className="text-4xl font-extrabold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{time}</p>
                <p className="text-orange-400 font-bold text-lg">{rate}</p>
                <p className="text-orange-200/50 text-xs">{note}</p>
                <a href="#calculator"
                  className="mt-2 px-5 py-2 rounded-xl text-xs font-bold text-slate-900 transition-all hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #fb923c, #ea580c)" }}>
                  Get Estimate →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* ── SHIPPING CALCULATOR ───────────────────────────────────────────── */}
        <div
          id="calculator"
          className="relative py-20 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1a0800 0%, #7c2d12 50%, #9a3412 100%)" }}
          aria-labelledby="calc-amazon-heading"
        >
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
            style={{ backgroundImage: "radial-gradient(circle at 80% 15%, rgba(251,146,60,0.15), transparent 50%), radial-gradient(circle at 10% 85%, rgba(253,186,116,0.08), transparent 50%)" }} />

          <div className="relative max-w-6xl mx-auto px-6">
            <div className="text-center mb-10">
              <SectionLabel text="Instant Estimate" light />
              <h2
                id="calc-amazon-heading"
                className="text-3xl sm:text-4xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Calculate Your Amazon Shipping Cost
              </h2>
              <p className="text-orange-200/65 mt-3 max-w-xl mx-auto">
                Enter your package weight (air) or dimensions (sea) for an instant estimate to Kenya.
              </p>
            </div>

            {/* Context tips */}
            <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
              {[
                { icon: "📱", text: "Electronics & small items — air freight is fastest" },
                { icon: "🍳", text: "Kitchen appliances — sea freight cuts cost significantly" },
                { icon: "📦", text: "Multiple Amazon orders? We consolidate into one shipment" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-start gap-3 bg-white/8 rounded-xl px-4 py-3 border border-white/10">
                  <span className="text-lg shrink-0 mt-0.5" aria-hidden="true">{icon}</span>
                  <p className="text-orange-100/70 text-xs leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

            <div className="max-w-lg mx-auto">
              <ShippingCalculator />
            </div>

            <p className="text-center text-orange-300/30 text-xs mt-8">
              Estimates only · Final rates confirmed at booking · KRA customs duties & import taxes may apply
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
              <p className="text-gray-500 mt-3">Everything you need to know about shipping Amazon orders to Kenya.</p>
            </div>
            <div className="flex flex-col gap-3" itemScope itemType="https://schema.org/FAQPage">
              {FAQ_DATA.map(({ q, a }) => (
                <details
                  key={q}
                  className="group bg-orange-50/60 rounded-2xl border border-orange-100 overflow-hidden cursor-pointer"
                  itemScope itemProp="mainEntity" itemType="https://schema.org/Question"
                >
                  <summary
                    className="flex items-center justify-between px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base list-none select-none"
                    itemProp="name"
                  >
                    {q}
                    <span className="ml-4 w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-lg shrink-0 font-bold transition-transform duration-300 group-open:rotate-45">+</span>
                  </summary>
                  <div
                    className="px-6 pb-5 pt-1 text-sm text-gray-600 leading-relaxed border-t border-orange-100"
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
            style={{ background: "linear-gradient(135deg, #1a0800 0%, #7c2d12 55%, #9a3412 100%)" }}
          >
            <div className="absolute top-0 right-0 w-80 h-80 pointer-events-none" aria-hidden="true"
              style={{ background: "radial-gradient(circle at top right, rgba(251,146,60,0.2), transparent 60%)" }} />
            <div className="flex-1">
              <p className="text-orange-400 text-xs font-semibold tracking-[0.2em] uppercase mb-2">Start Shipping Today</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                Get Your Free US Address & Shop Amazon Now
              </h2>
              <p className="text-orange-200/55 text-sm max-w-md">
                Sign up in minutes. Your personal US warehouse address is ready instantly. Start shopping Amazon.com — Prime orders welcome.
              </p>
            </div>
            <div className="flex flex-col gap-3 shrink-0 w-full sm:w-auto">
              <Link
                to="/register"
                className="px-8 py-3.5 rounded-2xl font-bold text-white text-sm text-center transition-all hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, #ea580c, #c2410c)", boxShadow: "0 4px 20px rgba(234,88,12,0.5)" }}
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
        <div className="max-w-6xl mx-auto px-6 py-10 border-t border-orange-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Also explore</p>
              <div className="flex flex-wrap gap-4">
                <Link to="/ship-from-walmart-to-kenya"
                  className="text-sm font-medium text-orange-700 hover:text-orange-900 underline underline-offset-2 transition-colors">
                  Ship from Walmart to Kenya →
                </Link>
                <Link to="/ship-from-ebay-to-kenya"
                  className="text-sm font-medium text-orange-700 hover:text-orange-900 underline underline-offset-2 transition-colors">
                  Ship from eBay to Kenya →
                </Link>
                <Link to="/ship-from-bestbuy-to-kenya"
                  className="text-sm font-medium text-orange-700 hover:text-orange-900 underline underline-offset-2 transition-colors">
                  Ship from Best Buy to Kenya →
                </Link>
                <Link to="/air-freight-usa-to-kenya"
                  className="text-sm font-medium text-orange-700 hover:text-orange-900 underline underline-offset-2 transition-colors">
                  Air Freight USA to Kenya →
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