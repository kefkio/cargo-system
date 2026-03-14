// src/pages/ShipFromWalmart.jsx

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
  name: "Ship From Walmart to Kenya",
  provider: {
    "@type": "Organization",
    name: "FirstPoint Cargo",
    url: "https://yourdomain.com",
    telephone: "+254701203325",
  },
  areaServed: { "@type": "Country", name: "Kenya" },
  serviceType: "International Package Forwarding",
  description:
    "Buy groceries, electronics, furniture, appliances and more from Walmart USA and ship to Kenya. Air freight in 5–10 days or sea freight in 4–6 weeks.",
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
    { "@type": "ListItem", position: 2, name: "Ship From Walmart to Kenya", item: "https://yourdomain.com/ship-from-walmart-to-kenya" },
  ],
};

const FAQ_DATA = [
  {
    q: "Can I ship from Walmart to Kenya?",
    a: "Yes. Walmart doesn't offer direct international shipping to Kenya, but you can use our US warehouse address at checkout on Walmart.com. We receive your order and forward it to Kenya.",
  },
  {
    q: "How do I use Walmart with a US forwarding address?",
    a: "Sign up with FirstPoint Cargo to get your free personal US warehouse address. Enter it as the delivery address on Walmart.com. Once your order arrives at our warehouse, we ship it to Kenya.",
  },
  {
    q: "Can I ship Walmart furniture and appliances to Kenya?",
    a: "Yes. Large items like furniture, appliances and home goods are best shipped by sea freight to keep costs low. We handle special packing for oversized or fragile Walmart items.",
  },
  {
    q: "How long does Walmart shipping to Kenya take?",
    a: "After your Walmart order arrives at our US warehouse, air freight to Kenya takes 5–10 business days. Sea freight takes 4–6 weeks and is ideal for bulk or heavy items.",
  },
  {
    q: "Does Walmart ship to a freight forwarder address?",
    a: "Yes. Our warehouse addresses are standard US residential and commercial addresses that Walmart accepts without any restrictions. You can also use Walmart+ free shipping benefits to our warehouse.",
  },
  {
    q: "Can I ship Walmart grocery or food products to Kenya?",
    a: "Non-perishable food items, vitamins, supplements and packaged goods from Walmart can be shipped to Kenya subject to KRA customs regulations. Perishable items are not eligible for international shipping.",
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
  { icon: "🏠", name: "Home & Furniture",     hint: "Sofas, beds, decor" },
  { icon: "📱", name: "Electronics",           hint: "TVs, phones, tablets" },
  { icon: "👶", name: "Baby & Kids",           hint: "Toys, clothing, gear" },
  { icon: "🍎", name: "Food & Supplements",    hint: "Vitamins, snacks, health" },
  { icon: "👗", name: "Clothing & Fashion",    hint: "Men, women, kids" },
  { icon: "🔧", name: "Tools & Hardware",      hint: "Power tools, hand tools" },
  { icon: "🚲", name: "Sports & Outdoors",     hint: "Bikes, camping, fitness" },
  { icon: "🧴", name: "Beauty & Personal Care",hint: "Skincare, hair, wellness" },
];

const STEPS = [
  {
    step: "01",
    title: "Get Your US Warehouse Address",
    body: "Sign up free and instantly receive a personal US address at one of our 4 warehouses across the USA.",
  },
  {
    step: "02",
    title: "Shop on Walmart.com",
    body: "Add items to your cart on Walmart.com. At checkout, enter your FirstPoint warehouse address as the delivery address.",
  },
  {
    step: "03",
    title: "We Receive & Prepare",
    body: "Your Walmart order arrives at our US warehouse. We inspect, photograph, and prepare it for international shipping.",
  },
  {
    step: "04",
    title: "Delivered Across Kenya",
    body: "We ship your Walmart goods to Nairobi or anywhere in Kenya. Customs clearance is fully handled by our team.",
  },
];

const ADVANTAGES = [
  {
    icon: "💵",
    title: "Walmart's Everyday Low Prices",
    body: "Walmart's famously low prices combined with our affordable forwarding rates means you save significantly vs. buying locally in Kenya.",
  },
  {
    icon: "📦",
    title: "Millions of Products",
    body: "From groceries and fashion to electronics and furniture — Walmart's 100M+ product catalog is now available for delivery to Kenya.",
  },
  {
    icon: "🔁",
    title: "Consolidation Service",
    body: "Ordered from multiple Walmart departments? We consolidate all your items into one shipment — one rate, one delivery.",
  },
  {
    icon: "🛡️",
    title: "Safe Packing Guarantee",
    body: "All Walmart shipments are professionally re-packed if needed. Fragile items, appliances and furniture get specialist protection.",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
const SectionLabel = ({ text, light = false }) => (
  <span className={`inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-4 px-3 py-1 rounded-full border ${
    light
      ? "text-blue-200 border-blue-300/30 bg-blue-300/10"
      : "text-blue-800 border-blue-200 bg-blue-50"
  }`}>
    {text}
  </span>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ShipFromWalmart() {
  useEffect(() => {
    if (!document.getElementById("wm-fonts")) {
      const link = document.createElement("link");
      link.id = "wm-fonts";
      link.rel = "stylesheet";
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>Ship From Walmart to Kenya | Cargo Forwarding from $16.99/kg | FirstPoint</title>
        <meta
          name="description"
          content="Shop Walmart.com and ship to Kenya. Electronics, furniture, appliances, baby products & more. Air freight 5–10 days · Sea freight 4–6 weeks. Get an instant quote."
        />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <link rel="canonical" href="https://yourdomain.com/ship-from-walmart-to-kenya" />
        <meta name="keywords" content="ship Walmart to Kenya, Walmart Kenya shipping, buy from Walmart ship to Kenya, Walmart forwarding Kenya, ship furniture USA to Kenya, Walmart appliances Kenya" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="FirstPoint Cargo" />
        <meta property="og:title" content="Ship From Walmart to Kenya | FirstPoint Cargo" />
        <meta property="og:description" content="Shop Walmart.com — electronics, furniture, baby products & more — and ship to Kenya. Air & sea freight available. Instant cost calculator." />
        <meta property="og:image" content="https://yourdomain.com/assets/seo/walmart-preview.jpg" />
        <meta property="og:url" content="https://yourdomain.com/ship-from-walmart-to-kenya" />
        <meta property="og:locale" content="en_KE" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ship From Walmart to Kenya | FirstPoint Cargo" />
        <meta name="twitter:description" content="Shop Walmart USA, ship to Kenya. Furniture, electronics, baby products & more. Instant shipping calculator." />
        <meta name="twitter:image" content="https://yourdomain.com/assets/seo/walmart-preview.jpg" />

        {/* Geo */}
        <meta name="geo.region" content="KE" />
        <meta name="geo.placename" content="Nairobi, Kenya" />

        {/* Structured data */}
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
      </Helmet>

      <div style={{ fontFamily: "'Outfit', sans-serif", background: "#f0f4ff" }}>

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <div
          className="relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #001f5b 0%, #0047bb 55%, #005dc8 100%)" }}
        >
          {/* Walmart-blue atmosphere glows */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
            style={{ backgroundImage: "radial-gradient(circle at 20% 65%, rgba(255,198,0,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 15%, rgba(0,150,255,0.12) 0%, transparent 45%)" }} />
          {/* Subtle dot grid */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05]" aria-hidden="true"
            style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

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
              <SectionLabel text="Walmart Forwarding" light />
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Shop Walmart.<br />
                <span style={{ color: "#ffc600" }}>Ship to Kenya.</span>
              </h1>
              <p className="text-blue-100/75 text-lg leading-relaxed mb-8 max-w-lg">
                Walmart is America's largest retailer — from everyday groceries to
                big-screen TVs and bedroom furniture. Now you can shop{" "}
                <strong className="text-white">Walmart.com</strong> and have
                everything delivered straight to your door in Kenya.
              </p>

              {/* Metrics */}
              <div className="flex flex-wrap gap-4 mb-10">
                {[
                  { label: "Air Freight",   value: "5–10 Days" },
                  { label: "Sea Freight",   value: "4–6 Weeks" },
                  { label: "Air Rate From", value: "$16.99/kg" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-5 py-3">
                    <p className="text-xs text-blue-200/60 font-medium tracking-wide uppercase mb-0.5">{label}</p>
                    <p className="text-xl font-bold text-yellow-400" style={{ fontFamily: "'Playfair Display', serif" }}>{value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="#calculator"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-slate-900 text-sm transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #ffc600, #f59e0b)", boxShadow: "0 4px 20px rgba(255,198,0,0.45)" }}
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
                className="relative w-80 rounded-3xl flex flex-col items-center text-center p-8 gap-4"
                style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", boxShadow: "0 25px 50px rgba(0,0,0,0.35)" }}
              >
                <div className="text-5xl" aria-hidden="true">🏪</div>
                <div>
                  <p className="text-yellow-300/70 text-xs font-semibold uppercase tracking-widest mb-1">100M+ Products</p>
                  <p className="text-white font-bold text-base">Walmart.com</p>
                </div>
                <div className="w-full h-px bg-white/10" />
                {/* Category preview */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {POPULAR_CATEGORIES.slice(0, 6).map(({ icon }) => (
                    <span key={icon} className="text-xl bg-white/10 rounded-xl w-10 h-10 flex items-center justify-center" aria-hidden="true">{icon}</span>
                  ))}
                </div>
                <div className="w-full h-px bg-white/10" />
                <div>
                  <p className="text-2xl font-extrabold text-yellow-400" style={{ fontFamily: "'Playfair Display', serif" }}>Delivered</p>
                  <p className="text-blue-200/60 text-sm mt-0.5">Anywhere in Kenya</p>
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
              Popular Walmart Categories We Ship to Kenya
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              From everyday essentials to big-ticket purchases — if Walmart sells it, we can ship it.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {POPULAR_CATEGORIES.map(({ icon, name, hint }) => (
              <div
                key={name}
                className="group bg-white rounded-2xl p-5 border border-blue-100 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-blue-300 transition-all duration-300 text-center"
              >
                <div className="text-3xl mb-3" aria-hidden="true">{icon}</div>
                <p className="font-bold text-gray-900 text-sm mb-1">{name}</p>
                <p className="text-gray-400 text-xs">{hint}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── ADVANTAGES ────────────────────────────────────────────────────── */}
        <div className="py-20" style={{ background: "linear-gradient(180deg, #eff6ff, #dbeafe50)" }}>
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <SectionLabel text="Why Walmart + FirstPoint" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                The Smart Way to Shop From the USA
              </h2>
              <p className="text-gray-500 mt-3 max-w-xl mx-auto">
                Walmart's prices combined with our forwarding expertise makes this the most cost-effective way to import goods to Kenya.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {ADVANTAGES.map(({ icon, title, body }) => (
                <div key={title} className="bg-white rounded-2xl p-6 border border-blue-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl mb-4" aria-hidden="true">{icon}</div>
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
              How to Ship From Walmart to Kenya
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Four steps from Walmart.com to your front door anywhere in Kenya.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px"
              style={{ background: "linear-gradient(90deg, transparent, #0047bb, #0047bb, transparent)" }} aria-hidden="true" />
            {STEPS.map(({ step, title, body }) => (
              <div key={step} className="text-center">
                <div
                  className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center font-extrabold text-xl relative z-10"
                  style={{ background: "linear-gradient(135deg, #001f5b, #0047bb)", color: "#ffc600", fontFamily: "'Playfair Display', serif", boxShadow: "0 4px 16px rgba(0,71,187,0.35)" }}
                  aria-hidden="true"
                >{step}</div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SHIPPING CALCULATOR ───────────────────────────────────────────── */}
        <div
          id="calculator"
          className="relative py-20 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #001f5b 0%, #0047bb 55%, #005dc8 100%)" }}
          aria-labelledby="calc-walmart-heading"
        >
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
            style={{ backgroundImage: "radial-gradient(circle at 75% 20%, rgba(255,198,0,0.14), transparent 50%), radial-gradient(circle at 15% 80%, rgba(0,150,255,0.12), transparent 50%)" }} />

          <div className="relative max-w-6xl mx-auto px-6">
            <div className="text-center mb-10">
              <SectionLabel text="Instant Estimate" light />
              <h2
                id="calc-walmart-heading"
                className="text-3xl sm:text-4xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Calculate Your Walmart Shipping Cost
              </h2>
              <p className="text-blue-200/65 mt-3 max-w-xl mx-auto">
                Enter your package weight (air) or dimensions (sea) for an instant shipping estimate from the USA to Kenya.
              </p>
            </div>

            {/* Context tips */}
            <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
              {[
                { icon: "👗", text: "Clothing & small items — cheapest by air freight" },
                { icon: "🏠", text: "Furniture & appliances save more with sea freight" },
                { icon: "🔁", text: "Order from multiple Walmart depts? We consolidate" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-start gap-3 bg-white/8 rounded-xl px-4 py-3 border border-white/10">
                  <span className="text-lg shrink-0 mt-0.5" aria-hidden="true">{icon}</span>
                  <p className="text-blue-100/70 text-xs leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

            <div className="max-w-lg mx-auto">
              <ShippingCalculator />
            </div>

            <p className="text-center text-blue-300/35 text-xs mt-8">
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
              <p className="text-gray-500 mt-3">Common questions about shipping Walmart orders to Kenya.</p>
            </div>
            <div className="flex flex-col gap-3" itemScope itemType="https://schema.org/FAQPage">
              {FAQ_DATA.map(({ q, a }) => (
                <details
                  key={q}
                  className="group bg-blue-50/60 rounded-2xl border border-blue-100 overflow-hidden cursor-pointer"
                  itemScope itemProp="mainEntity" itemType="https://schema.org/Question"
                >
                  <summary
                    className="flex items-center justify-between px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base list-none select-none"
                    itemProp="name"
                  >
                    {q}
                    <span className="ml-4 w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-lg shrink-0 font-bold transition-transform duration-300 group-open:rotate-45">+</span>
                  </summary>
                  <div
                    className="px-6 pb-5 pt-1 text-sm text-gray-600 leading-relaxed border-t border-blue-100"
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
            style={{ background: "linear-gradient(135deg, #001f5b 0%, #0047bb 55%, #005dc8 100%)" }}
          >
            <div className="absolute top-0 right-0 w-80 h-80 pointer-events-none" aria-hidden="true"
              style={{ background: "radial-gradient(circle at top right, rgba(255,198,0,0.18), transparent 60%)" }} />
            <div className="flex-1">
              <p className="text-yellow-400 text-xs font-semibold tracking-[0.2em] uppercase mb-2">Ready to Shop?</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                Get Your Free US Address & Start Shopping Walmart
              </h2>
              <p className="text-blue-200/55 text-sm max-w-md">
                Sign up in minutes. Get your personal US warehouse address instantly. Start shopping Walmart.com and ship everything to Kenya.
              </p>
            </div>
            <div className="flex flex-col gap-3 shrink-0 w-full sm:w-auto">
              <Link
                to="/register"
                className="px-8 py-3.5 rounded-2xl font-bold text-slate-900 text-sm text-center transition-all hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, #ffc600, #f59e0b)", boxShadow: "0 4px 20px rgba(255,198,0,0.45)" }}
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
        <div className="max-w-6xl mx-auto px-6 py-10 border-t border-blue-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Also explore</p>
              <div className="flex flex-wrap gap-4">
                <Link to="/ship-from-amazon-to-kenya"
                  className="text-sm font-medium text-blue-700 hover:text-blue-900 underline underline-offset-2 transition-colors">
                  Ship from Amazon to Kenya →
                </Link>
                <Link to="/ship-from-ebay-to-kenya"
                  className="text-sm font-medium text-blue-700 hover:text-blue-900 underline underline-offset-2 transition-colors">
                  Ship from eBay to Kenya →
                </Link>
                <Link to="/ship-from-bestbuy-to-kenya"
                  className="text-sm font-medium text-blue-700 hover:text-blue-900 underline underline-offset-2 transition-colors">
                  Ship from Best Buy to Kenya →
                </Link>
                <Link to="/air-freight-usa-to-kenya"
                  className="text-sm font-medium text-blue-700 hover:text-blue-900 underline underline-offset-2 transition-colors">
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