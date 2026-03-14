// src/pages/ShipFromEbay.jsx

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
  name: "Ship From eBay to Kenya",
  provider: {
    "@type": "Organization",
    name: "FirstPoint Cargo",
    url: "https://yourdomain.com",
    telephone: "+254701203325",
  },
  areaServed: { "@type": "Country", name: "Kenya" },
  serviceType: "International Package Forwarding",
  description:
    "Buy any product on eBay USA and ship it to Kenya. Electronics, fashion, collectibles, auto parts and more. Air freight in 5–10 days or sea freight in 4–6 weeks.",
};

const BREADCRUMB_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://yourdomain.com/" },
    { "@type": "ListItem", position: 2, name: "Ship From eBay to Kenya", item: "https://yourdomain.com/ship-from-ebay-to-kenya" },
  ],
};

const FAQ_DATA = [
  {
    q: "Can I buy from eBay and ship to Kenya?",
    a: "Yes. eBay sellers often don't ship internationally to Kenya, but you can use our US warehouse address at checkout. We receive your eBay order and forward it to Kenya by air or sea freight.",
  },
  {
    q: "How do I use eBay with a US forwarding address?",
    a: "Sign up with FirstPoint Cargo to get your free personal US warehouse address. Enter it as the shipping address when checking out on eBay. The seller ships to our warehouse; we ship to you in Kenya.",
  },
  {
    q: "How long does eBay shipping to Kenya take?",
    a: "Once your eBay order arrives at our US warehouse, air freight to Kenya takes 5–10 business days. Sea freight takes 4–6 weeks and is better suited for larger or heavier items.",
  },
  {
    q: "Can I ship used or second-hand items from eBay to Kenya?",
    a: "Yes, eBay specializes in both new and used items. We can forward used electronics, vintage clothing, collectibles, and second-hand goods from eBay to Kenya without restrictions on used items.",
  },
  {
    q: "What happens if my eBay order arrives damaged?",
    a: "We photograph all incoming packages at our warehouse. If damage is noted on arrival, we alert you before shipping. We recommend requesting insurance for high-value eBay purchases.",
  },
  {
    q: "Can I ship eBay auto parts to Kenya?",
    a: "Yes. Auto parts are among the most popular items shipped from eBay to Kenya. Sea freight is recommended for heavy or bulky parts. We handle all customs documentation at Mombasa port.",
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
  { icon: "📱", name: "Electronics",       hint: "Phones, tablets, laptops" },
  { icon: "👟", name: "Fashion & Sneakers", hint: "Nike, Jordan, Yeezy & more" },
  { icon: "🚗", name: "Auto Parts",         hint: "OEM & aftermarket parts" },
  { icon: "🎮", name: "Gaming",             hint: "Consoles, games, accessories" },
  { icon: "🏋️", name: "Sports & Fitness",   hint: "Equipment & apparel" },
  { icon: "🎸", name: "Musical Instruments",hint: "Guitars, drums, studio gear" },
  { icon: "🪙", name: "Collectibles",       hint: "Coins, cards, vintage items" },
  { icon: "🔧", name: "Tools & Hardware",   hint: "Power tools, hand tools" },
];

const STEPS = [
  {
    step: "01",
    title: "Get Your US Warehouse Address",
    body: "Sign up free and receive a personal US address at one of our 4 US warehouses — in New York, LA, Chicago or Federal Way, WA.",
  },
  {
    step: "02",
    title: "Buy Anything on eBay",
    body: "Shop eBay.com as normal. At checkout, enter your FirstPoint warehouse address. The seller ships to our US warehouse.",
  },
  {
    step: "03",
    title: "We Receive & Notify You",
    body: "We receive your eBay package, photograph its contents, and send you a WhatsApp notification. You then choose air or sea freight.",
  },
  {
    step: "04",
    title: "Delivered to Kenya",
    body: "We ship your package to your door in Nairobi or anywhere in Kenya. All customs clearance is handled by our team.",
  },
];

const TRUST_POINTS = [
  {
    icon: "📸",
    title: "Package Photography",
    body: "We photograph every incoming eBay package so you can verify contents before we ship to Kenya.",
  },
  {
    icon: "🔔",
    title: "WhatsApp Notifications",
    body: "Get instant WhatsApp alerts when your eBay order arrives at our warehouse and when it departs for Kenya.",
  },
  {
    icon: "📦",
    title: "Consolidation Available",
    body: "Ordered multiple items from different eBay sellers? We consolidate into one shipment to save you money.",
  },
  {
    icon: "💸",
    title: "Best Rate for Used Goods",
    body: "eBay ships used & second-hand goods at the same rate as new. Air from $16.99/kg, sea from $30/ft³.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
const SectionLabel = ({ text, light = false }) => (
  <span className={`inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-4 px-3 py-1 rounded-full border ${
    light
      ? "text-yellow-300 border-yellow-400/30 bg-yellow-400/10"
      : "text-yellow-700 border-yellow-200 bg-yellow-50"
  }`}>
    {text}
  </span>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ShipFromEbay() {
  useEffect(() => {
    if (!document.getElementById("eb-fonts")) {
      const link = document.createElement("link");
      link.id = "eb-fonts";
      link.rel = "stylesheet";
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>Ship From eBay to Kenya | Cargo Forwarding | FirstPoint Cargo</title>
        <meta
          name="description"
          content="Buy anything on eBay USA — electronics, sneakers, auto parts, collectibles — and ship to Kenya. Air freight 5–10 days · Sea freight 4–6 weeks. Free instant quote."
        />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <link rel="canonical" href="https://yourdomain.com/ship-from-ebay-to-kenya" />
        <meta name="keywords" content="ship eBay to Kenya, eBay Kenya shipping, buy on eBay ship to Kenya, eBay forwarding Kenya, ship used items USA to Kenya, eBay auto parts Kenya" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="FirstPoint Cargo" />
        <meta property="og:title" content="Ship From eBay to Kenya | FirstPoint Cargo" />
        <meta property="og:description" content="Buy electronics, sneakers, auto parts & collectibles on eBay USA. We forward your packages to Kenya. Air & sea freight available." />
        <meta property="og:image" content="https://yourdomain.com/assets/seo/ebay-preview.jpg" />
        <meta property="og:url" content="https://yourdomain.com/ship-from-ebay-to-kenya" />
        <meta property="og:locale" content="en_KE" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ship From eBay to Kenya | FirstPoint Cargo" />
        <meta name="twitter:description" content="Shop eBay USA. We ship to Kenya. Electronics, sneakers, auto parts & more. Air & sea freight." />
        <meta name="twitter:image" content="https://yourdomain.com/assets/seo/ebay-preview.jpg" />

        {/* Geo */}
        <meta name="geo.region" content="KE" />
        <meta name="geo.placename" content="Nairobi, Kenya" />

        {/* Structured data */}
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
      </Helmet>

      <div style={{ fontFamily: "'Outfit', sans-serif", background: "#fffbeb" }}>

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1a0a00 0%, #78350f 50%, #92400e 100%)" }}
        >
          {/* Background glow effects */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
            style={{ backgroundImage: "radial-gradient(circle at 15% 70%, rgba(251,191,36,0.15) 0%, transparent 50%), radial-gradient(circle at 85% 15%, rgba(239,68,68,0.08) 0%, transparent 40%)" }} />
          {/* Diagonal slash texture */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.04]" aria-hidden="true"
            style={{ backgroundImage: "repeating-linear-gradient(-45deg, #fff 0, #fff 1px, transparent 0, transparent 8px)", backgroundSize: "12px 12px" }} />

          {/* Back to home */}
          <div className="relative max-w-6xl mx-auto px-6 pt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-yellow-300 hover:text-white transition-colors group"
              aria-label="Back to homepage"
            >
              <span className="w-7 h-7 rounded-full border border-yellow-400/30 bg-yellow-400/10 flex items-center justify-center group-hover:bg-yellow-400/20 transition-colors" aria-hidden="true">←</span>
              Back to Home
            </Link>
          </div>

          <div className="relative max-w-6xl mx-auto px-6 pt-8 pb-20 grid lg:grid-cols-2 gap-12 items-center">
            {/* Copy */}
            <div>
              <SectionLabel text="eBay Forwarding" light />
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Shop eBay.<br />
                <span style={{ color: "#fbbf24" }}>Ship to Kenya.</span>
              </h1>
              <p className="text-amber-100/75 text-lg leading-relaxed mb-8 max-w-lg">
                eBay is the world's largest marketplace for new, used, and rare goods.
                Now you can shop all of it from Kenya — use our US warehouse address
                at checkout and we'll forward everything to your door.
              </p>

              {/* Metrics */}
              <div className="flex flex-wrap gap-4 mb-10">
                {[
                  { label: "Air Freight",   value: "5–10 Days" },
                  { label: "Sea Freight",   value: "4–6 Weeks" },
                  { label: "Air Rate From", value: "$16.99/kg" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-5 py-3">
                    <p className="text-xs text-amber-200/60 font-medium tracking-wide uppercase mb-0.5">{label}</p>
                    <p className="text-xl font-bold text-amber-400" style={{ fontFamily: "'Playfair Display', serif" }}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="#calculator"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-slate-900 text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 4px 20px rgba(245,158,11,0.45)" }}
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
                className="relative w-80 rounded-3xl flex flex-col items-center justify-center text-center p-8 gap-4"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", boxShadow: "0 25px 50px rgba(0,0,0,0.4)" }}
              >
                <div className="text-5xl" aria-hidden="true">🛍️</div>
                <div>
                  <p className="text-amber-300/70 text-xs font-semibold uppercase tracking-widest mb-1">New & Used</p>
                  <p className="text-white font-bold text-base">Any eBay Listing</p>
                </div>
                <div className="w-full h-px bg-white/10" />
                <div className="flex flex-wrap gap-2 justify-center">
                  {POPULAR_CATEGORIES.slice(0, 6).map(({ icon }) => (
                    <span key={icon} className="text-xl bg-white/10 rounded-xl w-10 h-10 flex items-center justify-center" aria-hidden="true">{icon}</span>
                  ))}
                </div>
                <div className="w-full h-px bg-white/10" />
                <div>
                  <p className="text-2xl font-extrabold text-amber-400" style={{ fontFamily: "'Playfair Display', serif" }}>Delivered</p>
                  <p className="text-amber-200/60 text-sm mt-0.5">Anywhere in Kenya</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── POPULAR CATEGORIES ────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <SectionLabel text="What You Can Buy & Ship" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Popular eBay Categories Shipped to Kenya
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              New, used, rare or bulk — if it's listed on eBay, we can ship it to Kenya.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {POPULAR_CATEGORIES.map(({ icon, name, hint }) => (
              <div
                key={name}
                className="group bg-white rounded-2xl p-5 border border-yellow-100 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-yellow-300 transition-all duration-300 text-center"
              >
                <div className="text-3xl mb-3" aria-hidden="true">{icon}</div>
                <p className="font-bold text-gray-900 text-sm mb-1">{name}</p>
                <p className="text-gray-400 text-xs">{hint}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
        <div className="py-20" style={{ background: "linear-gradient(180deg, #fef3c7, #fde68a30)" }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <SectionLabel text="Step by Step" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                How to Ship From eBay to Kenya
              </h2>
              <p className="text-gray-500 mt-3 max-w-xl mx-auto">
                Four simple steps from eBay checkout to your door in Kenya.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px"
                style={{ background: "linear-gradient(90deg, transparent, #d97706, #d97706, transparent)" }} aria-hidden="true" />
              {STEPS.map(({ step, title, body }) => (
                <div key={step} className="text-center">
                  <div
                    className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center font-extrabold text-xl relative z-10"
                    style={{ background: "linear-gradient(135deg, #1a0a00, #78350f)", color: "#fbbf24", fontFamily: "'Playfair Display', serif", boxShadow: "0 4px 16px rgba(120,53,15,0.35)" }}
                    aria-hidden="true"
                  >{step}</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-sm">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TRUST / WHY US ────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <SectionLabel text="Our Promise" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
              Why Ship Your eBay Orders With Us?
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TRUST_POINTS.map(({ icon, title, body }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-yellow-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl mb-4" aria-hidden="true">{icon}</div>
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
          style={{ background: "linear-gradient(135deg, #1a0a00 0%, #78350f 50%, #92400e 100%)" }}
          aria-labelledby="calc-ebay-heading"
        >
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
            style={{ backgroundImage: "radial-gradient(circle at 80% 15%, rgba(251,191,36,0.15), transparent 50%), radial-gradient(circle at 10% 85%, rgba(251,191,36,0.08), transparent 50%)" }} />

          <div className="relative max-w-6xl mx-auto px-6">
            <div className="text-center mb-10">
              <SectionLabel text="Instant Estimate" light />
              <h2
                id="calc-ebay-heading"
                className="text-3xl sm:text-4xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Calculate Your eBay Shipping Cost
              </h2>
              <p className="text-amber-200/60 mt-3 max-w-xl mx-auto">
                Enter the weight (air freight) or dimensions (sea freight) of your eBay package for an instant estimate to Kenya.
              </p>
            </div>

            {/* Context tips */}
            <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
              {[
                { icon: "👟", text: "Sneakers & small items are cheaper by air freight" },
                { icon: "🚗", text: "Auto parts & bulky items save more with sea freight" },
                { icon: "📦", text: "Order multiple items? We consolidate to cut costs" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-start gap-3 bg-white/8 rounded-xl px-4 py-3 border border-white/10">
                  <span className="text-lg shrink-0 mt-0.5" aria-hidden="true">{icon}</span>
                  <p className="text-amber-100/70 text-xs leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

            <div className="max-w-lg mx-auto">
              <ShippingCalculator />
            </div>

            <p className="text-center text-amber-300/30 text-xs mt-8">
              Estimates only · Final rates confirmed at booking · Customs duties & KRA import taxes may apply
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
              <p className="text-gray-500 mt-3">Everything you need to know about shipping eBay orders to Kenya.</p>
            </div>
            <div className="flex flex-col gap-3" itemScope itemType="https://schema.org/FAQPage">
              {FAQ_DATA.map(({ q, a }) => (
                <details
                  key={q}
                  className="group bg-amber-50/60 rounded-2xl border border-amber-100 overflow-hidden cursor-pointer"
                  itemScope itemProp="mainEntity" itemType="https://schema.org/Question"
                >
                  <summary
                    className="flex items-center justify-between px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base list-none select-none"
                    itemProp="name"
                  >
                    {q}
                    <span className="ml-4 w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-lg shrink-0 font-bold transition-transform duration-300 group-open:rotate-45">+</span>
                  </summary>
                  <div
                    className="px-6 pb-5 pt-1 text-sm text-gray-600 leading-relaxed border-t border-amber-100"
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
            style={{ background: "linear-gradient(135deg, #1a0a00 0%, #78350f 55%, #92400e 100%)" }}
          >
            <div className="absolute top-0 right-0 w-80 h-80 pointer-events-none" aria-hidden="true"
              style={{ background: "radial-gradient(circle at top right, rgba(251,191,36,0.18), transparent 60%)" }} />
            <div className="flex-1">
              <p className="text-amber-400 text-xs font-semibold tracking-[0.2em] uppercase mb-2">Start Shopping</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                Get Your Free US Address Today
              </h2>
              <p className="text-amber-200/55 text-sm max-w-md">
                Sign up in minutes and start shopping on eBay.com right away. Your US warehouse address is ready the moment you register.
              </p>
            </div>
            <div className="flex flex-col gap-3 shrink-0 w-full sm:w-auto">
              <Link
                to="/register"
                className="px-8 py-3.5 rounded-2xl font-bold text-slate-900 text-sm text-center transition-all hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", boxShadow: "0 4px 20px rgba(245,158,11,0.45)" }}
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
        <div className="max-w-6xl mx-auto px-6 py-10 border-t border-amber-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Also explore</p>
              <div className="flex flex-wrap gap-4">
                <Link to="/ship-from-amazon-to-kenya"
                  className="text-sm font-medium text-amber-700 hover:text-amber-900 underline underline-offset-2 transition-colors">
                  Ship from Amazon to Kenya →
                </Link>
                <Link to="/ship-from-bestbuy-to-kenya"
                  className="text-sm font-medium text-amber-700 hover:text-amber-900 underline underline-offset-2 transition-colors">
                  Ship from Best Buy to Kenya →
                </Link>
                <Link to="/air-freight-usa-to-kenya"
                  className="text-sm font-medium text-amber-700 hover:text-amber-900 underline underline-offset-2 transition-colors">
                  Air Freight USA to Kenya →
                </Link>
                <Link to="/sea-freight-usa-to-kenya"
                  className="text-sm font-medium text-amber-700 hover:text-amber-900 underline underline-offset-2 transition-colors">
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