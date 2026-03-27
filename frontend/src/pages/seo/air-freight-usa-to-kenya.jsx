// src/pages/AirFreightUSAtoKenya.jsx

import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Outfit:wght@300;400;500;600&display=swap";

const SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "Air Freight Shipping USA to Kenya",
  provider: {
    "@type": "Organization",
    name: "FirstPoint Cargo",
    url: "https://yourdomain.com",
    telephone: "+254701203325",
  },
  areaServed: { "@type": "Country", name: "Kenya" },
  serviceType: "International Air Freight",
  description:
    "Fast air cargo shipping from the United States to Kenya. Delivery within 5–10 business days. Rate from $16.99/kg.",
  offers: {
    "@type": "Offer",
    priceCurrency: "USD",
    price: "16.99",
    unitText: "per kg",
    availability: "https://schema.org/InStock",
  },
};

const BREADCRUMB_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://yourdomain.com/" },
    {
      "@type": "ListItem",
      position: 2,
      name: "Air Freight USA to Kenya",
      item: "https://yourdomain.com/air-freight-usa-to-kenya",
    },
  ],
};

const FAQ_DATA = [
  {
    q: "How long does air freight from the USA to Kenya take?",
    a: "Air freight from the USA to Kenya typically takes 5 to 10 business days, depending on the origin warehouse and customs clearance.",
  },
  {
    q: "How much does air freight from USA to Kenya cost?",
    a: "Air freight is charged at $16.99 per kilogram with a minimum charge of 1 kg. Use our shipping calculator for an instant estimate.",
  },
  {
    q: "What can I ship via air freight to Kenya?",
    a: "You can ship electronics, clothing, accessories, cosmetics, auto parts, and most general merchandise. Hazardous goods and restricted items are not permitted.",
  },
  {
    q: "Do I need to clear customs when shipping to Kenya by air?",
    a: "Yes, all international shipments are subject to Kenya Revenue Authority customs clearance. We guide you through the process and provide all necessary documentation.",
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
  { icon: "⚡", title: "5–10 Day Delivery", body: "The fastest way to get your packages from the US to Kenya. Most shipments clear customs and arrive within 5–10 business days." },
  { icon: "📦", title: "$16.99 / kg", body: "Transparent flat-rate pricing with a minimum of 1 kg. No hidden fees — the rate you see is what you pay." },
  { icon: "🔍", title: "Full Tracking", body: "Every shipment is fully tracked from our US warehouse to your door in Kenya. Real-time updates via WhatsApp." },
  { icon: "🏭", title: "4 US Warehouses", body: "Receive goods at our warehouses in New York, Los Angeles, Chicago or Federal Way, WA — then we do the rest." },
  { icon: "📋", title: "Customs Support", body: "We handle all documentation and guide you through Kenya Revenue Authority customs clearance seamlessly." },
  { icon: "🛍️", title: "Any US Store", body: "Shop from Amazon, eBay, Walmart, BestBuy, Target or any US retailer and ship it straight to Kenya." },
];

const STEPS = [
  { number: "01", title: "Get Your US Address", body: "Sign up and receive your personal US warehouse address. Use it as the delivery address when shopping online." },
  { number: "02", title: "Shop & Ship to Warehouse", body: "Place your orders on Amazon, eBay, Walmart or any US store. Your packages arrive at our warehouse." },
  { number: "03", title: "We Consolidate & Fly", body: "We weigh, pack and consolidate your items for air freight. Your shipment departs within 1–3 business days." },
  { number: "04", title: "Delivered to Your Door", body: "Your package clears customs and is delivered to your address in Nairobi or anywhere in Kenya." },
];

const BackHome = () => (
  <Link
    to="/"
    className="inline-flex items-center gap-2 text-sm font-medium text-sky-300 hover:text-white transition-colors group"
    aria-label="Back to homepage"
  >
    <span className="w-7 h-7 rounded-full border border-sky-400/30 bg-sky-400/10 flex items-center justify-center group-hover:bg-sky-400/20 transition-colors" aria-hidden="true">←</span>
    Back to Home
  </Link>
);

const SectionLabel = ({ text, light = false }) => (
  <span className={`inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-4 px-3 py-1 rounded-full border ${light ? "text-sky-300 border-sky-400/30 bg-sky-400/10" : "text-sky-700 border-sky-200 bg-sky-50"}`}>
    {text}
  </span>
);

export default function AirFreightUSAtoKenya() {
  useEffect(() => {
    if (!document.getElementById("af-fonts")) {
      const link = document.createElement("link");
      link.id = "af-fonts";
      link.rel = "stylesheet";
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
  }, []);

  return (
    <>
      <Helmet>
        <title>Air Freight USA to Kenya | 5–10 Days from $16.99/kg | FirstPoint Cargo</title>
        <meta name="description" content="Ship packages by air freight from the USA to Kenya in 5–10 days from $16.99/kg. Shop Amazon, eBay & Walmart and we'll forward your cargo to Nairobi or anywhere in Kenya." />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
        <link rel="canonical" href="https://yourdomain.com/air-freight-usa-to-kenya" />
        <meta name="keywords" content="air freight USA to Kenya, air cargo Kenya, ship from USA to Kenya by air, Amazon to Kenya shipping, air freight Nairobi" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="FirstPoint Cargo" />
        <meta property="og:title" content="Air Freight USA to Kenya | 5–10 Days from $16.99/kg" />
        <meta property="og:description" content="Fast air cargo shipping from the USA to Kenya. Delivery in 5–10 days. $16.99/kg. Full tracking included." />
        <meta property="og:image" content="https://yourdomain.com/assets/seo/air-freight-preview.jpg" />
        <meta property="og:url" content="https://yourdomain.com/air-freight-usa-to-kenya" />
        <meta property="og:locale" content="en_KE" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Air Freight USA to Kenya | FirstPoint Cargo" />
        <meta name="twitter:description" content="Fast, affordable air freight from the USA to Kenya. From $16.99/kg. Delivered in 5–10 days." />
        <meta name="geo.region" content="KE" />
        <meta name="geo.placename" content="Nairobi, Kenya" />
        <script type="application/ld+json">{JSON.stringify(SERVICE_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
      </Helmet>

      <div className="seo-air-page">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden seo-air-hero-bg">
          <div className="absolute inset-0 pointer-events-none seo-air-hero-glow" aria-hidden="true" />
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] seo-air-hero-pattern" aria-hidden="true" />

          {/* Back to home */}
          <div className="relative max-w-6xl mx-auto px-6 pt-6">
            <BackHome />
          </div>

          <div className="relative max-w-6xl mx-auto px-6 pt-8 pb-20 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionLabel text="Air Freight Service" light />
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] mb-6 font-playfair"
                >
                Air Freight<br />
                <span className="seo-air-accent">USA → Kenya</span>
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-lg">
                The fastest, most reliable way to ship packages from the United States to Kenya.
                Shop from any US store and we'll fly your cargo straight to your door —
                most shipments arrive in <strong className="text-white">5–10 business days</strong>.
              </p>

              <div className="flex flex-wrap gap-4 mb-10">
                {[
                  { label: "Delivery Time", value: "5–10 Days" },
                  { label: "Rate From", value: "$16.99/kg" },
                  { label: "Min. Weight", value: "1 kg" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-5 py-3">
                    <p className="text-xs text-slate-400 font-medium tracking-wide uppercase mb-0.5">{label}</p>
                    <p className="text-xl font-bold text-amber-400 font-playfair" >{value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/#calculator"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-slate-900 text-sm transition-all duration-200 hover:scale-105 active:scale-95 btn-cta-amber">
                  ✈️ Calculate My Cost
                </Link>
                <a href="https://wa.me/254701203325" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-white text-sm border border-white/20 hover:bg-white/10 transition-all duration-200">
                  💬 Chat on WhatsApp
                </a>
              </div>
            </div>

            {/* Visual card */}
            <div className="hidden lg:flex justify-center">
              <div className="relative w-80 h-80 rounded-3xl flex flex-col items-center justify-center text-center p-8 glass-card-light">
                <div className="text-7xl mb-4" aria-hidden="true">✈️</div>
                <div className="text-5xl font-extrabold text-amber-400 mb-1 font-playfair" >5–10</div>
                <div className="text-slate-300 font-semibold text-lg mb-3">Days to Kenya</div>
                <div className="w-12 h-0.5 bg-amber-400/40 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">USA → Nairobi & nationwide delivery</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── FEATURES ────────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <SectionLabel text="Why Choose Air Freight" />
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-playfair" >
              Everything Included in Every Shipment
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">
              Our air freight service is designed for speed, transparency and peace of mind.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon, title, body }) => (
              <div key={title} className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-2xl mb-4 group-hover:bg-sky-100 transition-colors" aria-hidden="true">{icon}</div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
        <div className="py-20 seo-air-features-bg">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-14">
              <SectionLabel text="Step by Step" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-playfair" >
                How Air Freight Works
              </h2>
              <p className="text-gray-500 mt-3 max-w-xl mx-auto">
                From your online cart in the US to your door in Kenya — here's the journey.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px seo-air-step-line" aria-hidden="true" />
              {STEPS.map(({ number, title, body }) => (
                <div key={number} className="text-center">
                  <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center font-extrabold text-xl relative z-10 seo-air-step-number"
                    aria-hidden="true">{number}</div>
                  <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PRICING CTA ──────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="relative rounded-3xl overflow-hidden p-10 sm:p-14 flex flex-col sm:flex-row items-center gap-8 seo-air-cta-bg">
            <div className="absolute top-0 right-0 w-80 h-80 pointer-events-none seo-air-cta-glow" aria-hidden="true" />
            <div className="flex-1">
              <p className="text-sky-400 text-xs font-semibold tracking-[0.2em] uppercase mb-2">Air Freight Rate</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 font-playfair" >
                From <span className="text-amber-400">$16.99</span>
                <span className="text-slate-400 text-xl font-normal"> / kg</span>
              </h2>
              <p className="text-slate-400 text-sm max-w-md">
                Minimum charge of 1 kg. All shipments include full tracking and customs documentation support. No hidden fees.
              </p>
            </div>
            <div className="flex flex-col gap-3 shrink-0 w-full sm:w-auto">
              <Link to="/#calculator"
                className="px-8 py-3.5 rounded-2xl font-bold text-slate-900 text-sm text-center transition-all hover:scale-105 active:scale-95 btn-cta-amber">
                Get Instant Quote →
              </Link>
              <a href="https://wa.me/254701203325" target="_blank" rel="noopener noreferrer"
                className="px-8 py-3.5 rounded-2xl font-semibold text-white text-sm text-center border border-white/20 hover:bg-white/10 transition-colors">
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>

        {/* ── FAQ ──────────────────────────────────────────────────────────── */}
        <div className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-12">
              <SectionLabel text="FAQ" />
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 font-playfair" >
                Frequently Asked Questions
              </h2>
              <p className="text-gray-500 mt-3">Common questions about air freight shipping from the USA to Kenya.</p>
            </div>
            <div className="flex flex-col gap-3" itemScope itemType="https://schema.org/FAQPage">
              {FAQ_DATA.map(({ q, a }) => (
                <details key={q} className="group bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden cursor-pointer"
                  itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <summary className="flex items-center justify-between px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base list-none select-none" itemProp="name">
                    {q}
                    <span className="ml-4 w-7 h-7 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-lg shrink-0 font-bold transition-transform duration-300 group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-6 pb-5 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-100"
                    itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                    <span itemProp="text">{a}</span>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* ── FOOTER NAV ───────────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-6 py-10 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Also explore</p>
              <div className="flex flex-wrap gap-4">
                <Link to="/sea-freight-usa-to-kenya" className="text-sm font-medium text-sky-700 hover:text-sky-900 underline underline-offset-2 transition-colors">
                  Sea Freight USA to Kenya →
                </Link>
                <Link to="/#pricing" className="text-sm font-medium text-sky-700 hover:text-sky-900 underline underline-offset-2 transition-colors">
                  View All Pricing →
                </Link>
                <Link to="/#calculator" className="text-sm font-medium text-sky-700 hover:text-sky-900 underline underline-offset-2 transition-colors">
                  Shipping Calculator →
                </Link>
              </div>
            </div>
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors group" aria-label="Back to homepage">
              <span className="w-8 h-8 rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors" aria-hidden="true">←</span>
              Back to Home
            </Link>
          </div>
        </div>

      </div>
    </>
  );
}