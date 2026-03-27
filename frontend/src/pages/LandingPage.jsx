// src/pages/LandingPage.jsx

import React, { useState, useEffect, useRef } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { Helmet } from "react-helmet-async";

// Marketing components
import TopBanner from "../components/marketing/TopBanner";
import Hero from "../components/marketing/Hero";
import HowItWorks from "../components/marketing/HowItWorks";
import Services from "../components/marketing/Services";
import Pricing from "../components/marketing/Pricing";
import Testimonials from "../components/marketing/Testimonials";
import NextShipmentBanner from "../components/marketing/NextShipmentBanner";

// Layout
import Navbar from "../components/layout/Navbar";
import SideNav from "../components/layout/SideNav";
import Footer from "../components/layout/Footer";

// Common
import BackToTop from "../components/common/BackToTop";
import ShippingCalculator from "../components/shipment/ShippingCalculator";
import Contact from "../components/Contact";

// ─── Google Fonts ─────────────────────────────────────────────────────────────
const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Outfit:wght@300;400;500;600&display=swap";

// ─── Trust stats shown in the calculator section ──────────────────────────────
const TRUST_STATS = [
  { value: "5–10", unit: "Days", label: "Air Delivery" },
  { value: "4–6",  unit: "Weeks", label: "Sea Delivery" },
  { value: "4",    unit: "Hubs",  label: "US Warehouses" },
  { value: "100%", unit: "",      label: "Tracked Shipments" },
];

// ─── Shopping store logos ─────────────────────────────────────────────────────
const SHOPPING_LOGOS = [
  {
    name: "Amazon",
    href: "https://www.amazon.com",
    file: "Amazon.png",
  },
  {
    name: "eBay",
    href: "https://www.ebay.com",
    file: "eBay.png",
  },
  {
    name: "Walmart",
    href: "https://www.walmart.com",
    file: "Walmart.png",
  },
  {
    name: "BestBuy",
    href: "https://www.bestbuy.com",
    file: "BestBuy.png",
  },
  {
    name: "Target",
    href: "https://www.target.com",
    file: "Target.png",
  },
  {
    name: "AliExpress",
    href: "https://www.aliexpress.com",
    file: "AliExpress.png",
  },
];

// ─── Structured data ──────────────────────────────────────────────────────────
const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "FirstPoint Cargo – USA to Kenya Shipping",
  url: "https://yourdomain.com",
  logo: "https://yourdomain.com/assets/logo.png",
  telephone: "+254701203325",
  address: {
    "@type": "PostalAddress",
    addressCountry: "KE",
  },
  sameAs: [
    "https://www.facebook.com/",
    "https://www.linkedin.com/",
    "https://twitter.com/",
    "https://wa.me/254701203325",
  ],
};

const SHIPPING_SERVICE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "USA to Kenya Cargo Shipping",
  provider: { "@type": "Organization", name: "FirstPoint Cargo" },
  areaServed: [
    { "@type": "Country", name: "Kenya" },
  ],
  serviceType: "International Package Forwarding & Freight Shipping",
  description:
    "Air and sea cargo shipping from the United States to Kenya. Shop from Amazon, eBay, Walmart and ship to your door.",
  offers: [
    {
      "@type": "Offer",
      name: "Air Freight USA to Kenya",
      priceCurrency: "USD",
      price: "16.99",
      unitText: "per kg",
    },
    {
      "@type": "Offer",
      name: "Sea Freight USA to Kenya",
      priceCurrency: "USD",
      price: "30.00",
      unitText: "per cubic foot",
    },
  ],
};

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How can I ship packages from the USA to Kenya?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use our US warehouse address when shopping online at Amazon, eBay or Walmart. Once your package arrives at our warehouse, we consolidate and ship it to Kenya by air or sea.",
      },
    },
    {
      "@type": "Question",
      name: "How long does shipping from USA to Kenya take?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Air cargo from the USA to Kenya typically takes 5 to 10 business days. Sea freight takes approximately 4 to 6 weeks.",
      },
    },
    {
      "@type": "Question",
      name: "How much does it cost to ship from USA to Kenya?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Air freight is charged at $16.99 per kg with a minimum of 1 kg. Sea freight is $30 per cubic foot for the first 100 cubic feet and $25 per cubic foot thereafter.",
      },
    },
    {
      "@type": "Question",
      name: "Can I ship from Amazon to Kenya?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Simply use our US warehouse address as the delivery address on Amazon. We receive your package and forward it to Kenya.",
      },
    },
  ],
};

const BREADCRUMB_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://yourdomain.com/" },
    { "@type": "ListItem", position: 2, name: "Shipping Calculator", item: "https://yourdomain.com/#calculator" },
    { "@type": "ListItem", position: 3, name: "Services", item: "https://yourdomain.com/#services" },
    { "@type": "ListItem", position: 4, name: "Pricing", item: "https://yourdomain.com/#pricing" },
    { "@type": "ListItem", position: 5, name: "Contact", item: "https://yourdomain.com/#contact" },
  ],
};

// ─── Fade-in section wrapper ──────────────────────────────────────────────────
const FadeInSection = ({ children, id, delay = 0 }) => {
  const [isVisible, setVisible] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {
    const node = domRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setVisible(true)),
      { threshold: 0.08 }
    );
    observer.observe(node);
    return () => observer.unobserve(node);
  }, []);

  return (
    <section
      id={id}
      ref={domRef}
      style={{ transitionDelay: `${delay}ms` }}
      className={`w-full max-w-screen-2xl mx-auto transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {children}
    </section>
  );
};

// ─── Section heading component ────────────────────────────────────────────────
const SectionHeading = ({ eyebrow, title, subtitle, light = false }) => (
  <div className="text-center mb-12">
    {eyebrow && (
      <span
        className={`inline-block text-xs font-semibold tracking-[0.2em] uppercase mb-3 px-3 py-1 rounded-full border ${
          light
            ? "text-amber-300 border-amber-300/30 bg-amber-300/10"
            : "text-amber-600 border-amber-200 bg-amber-50"
        }`}
      >
        {eyebrow}
      </span>
    )}
    <h2
      className={`text-3xl sm:text-4xl font-bold leading-tight mb-3 ${
        light ? "text-white" : "text-gray-900"
      } font-playfair`}
    >
      {title}
    </h2>
    {subtitle && (
      <p className={`text-base max-w-xl mx-auto ${light ? "text-slate-400" : "text-gray-500"}`}>
        {subtitle}
      </p>
    )}
  </div>
);

// ─── WhatsApp float button ────────────────────────────────────────────────────
const WhatsAppFloat = () => (
  <div className="fixed right-5 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2">
    <a
      href="https://wa.me/254701203325"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="group relative flex items-center justify-center w-14 h-14 rounded-2xl shadow-2xl transition-all duration-300 hover:scale-110 hover:rounded-3xl btn-whatsapp-float"
    >
      <FaWhatsapp size={26} className="text-white" />
      {/* Tooltip */}
      <span className="pointer-events-none absolute right-16 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
        Chat on WhatsApp
        <span className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45" />
      </span>
    </a>
    <span className="text-[9px] font-semibold text-gray-400 tracking-wide">CHAT</span>
  </div>
);

// ─── Scroll progress bar ──────────────────────────────────────────────────────
const ScrollProgress = ({ progress }) => (
  <div className="fixed top-0 left-0 w-full h-0.5 z-[60] scroll-bar-track">
    <div
      className="h-full transition-all duration-150 scroll-bar-fill"
      style={{ width: `${progress}%` }}
    />
  </div>
);

// ─── Trust stats bar ──────────────────────────────────────────────────────────
const TrustStats = () => (
  <div
    className="rounded-2xl overflow-hidden trust-stats-bg"
    role="list"
    aria-label="Shipping service statistics"
  >
    <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-white/10">
      {TRUST_STATS.map(({ value, unit, label }) => (
        <div
          key={label}
          role="listitem"
          className="flex flex-col items-center justify-center py-6 px-4 text-center group hover:bg-white/5 transition-colors"
        >
          <div className="flex items-end gap-1 mb-1">
            <span
              className="text-3xl font-extrabold text-amber-400 leading-none font-playfair"
            >
              {value}
            </span>
            {unit && <span className="text-amber-300/70 text-sm font-semibold mb-0.5">{unit}</span>}
          </div>
          <span className="text-slate-400 text-xs font-medium tracking-wide uppercase">{label}</span>
        </div>
      ))}
    </div>
  </div>
);

// ─── Store logo ticker ────────────────────────────────────────────────────────
const StoreTicker = () => (
  <div
    className="py-10 overflow-hidden"
    aria-label="US stores you can shop from and ship to Kenya"
  >
    <p className="text-center text-xs font-semibold text-gray-400 tracking-[0.2em] uppercase mb-6">
      Shop from any US store
    </p>
    <div className="relative">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none ticker-fade-left" aria-hidden="true" />
      <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none ticker-fade-right" aria-hidden="true" />

      <div className="store-ticker-track flex gap-12 whitespace-nowrap">
        {[...SHOPPING_LOGOS, ...SHOPPING_LOGOS].map((logo, i) => {
          const src = new URL(`../assets/logos/${logo.file}`, import.meta.url).href;
          return (
            <a
              key={`${logo.name}-${i}`}
              href={logo.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center"
              aria-label={`Go to ${logo.name}`}
            >
              <img
                src={src}
                alt={`Ship from ${logo.name} to Kenya`}
                loading="lazy"
                className="h-8 object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-50 hover:opacity-100"
              />
            </a>
          );
        })}
      </div>


    </div>
  </div>
);

// ─── Main landing page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    // Inject Google Fonts
    if (!document.getElementById("lp-fonts")) {
      const link = document.createElement("link");
      link.id = "lp-fonts";
      link.rel = "stylesheet";
      link.href = FONT_HREF;
      document.head.appendChild(link);
    }
    // Clear stale auth
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* ── SEO Head ─────────────────────────────────────────────────────── */}
      <Helmet>
        {/* Primary */}
        <title>Ship From USA to Kenya | Affordable Cargo & Package Forwarding | FirstPoint</title>
        <meta
          name="description"
          content="Ship packages from Amazon, eBay, Walmart & more to Kenya. Air freight from $16.99/kg (5–10 days) or sea cargo at $30/ft³ (4–6 weeks). Get a free instant quote."
        />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href="https://yourdomain.com/" />

        {/* Keywords (supplemental signal) */}
        <meta
          name="keywords"
          content="ship from USA to Kenya, cargo shipping Kenya, package forwarding Kenya, Amazon to Kenya, sea freight USA Kenya, air freight Kenya, USA Kenya shipping cost"
        />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="FirstPoint Cargo" />
        <meta property="og:title" content="Ship From USA to Kenya | FirstPoint Cargo" />
        <meta
          property="og:description"
          content="Fast, affordable cargo shipping from the USA to Kenya. Air freight 5–10 days · Sea freight 4–6 weeks. Instant shipping cost calculator."
        />
        <meta property="og:image" content="https://yourdomain.com/assets/seo/preview.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="FirstPoint Cargo – USA to Kenya shipping service" />
        <meta property="og:url" content="https://yourdomain.com/" />
        <meta property="og:locale" content="en_KE" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@firstpointcargo" />
        <meta name="twitter:title" content="Ship From USA to Kenya | FirstPoint Cargo" />
        <meta
          name="twitter:description"
          content="Affordable cargo shipping from the USA to Kenya. Air & sea freight. Instant calculator."
        />
        <meta name="twitter:image" content="https://yourdomain.com/assets/seo/preview.jpg" />

        {/* Geo targeting */}
        <meta name="geo.region" content="KE" />
        <meta name="geo.placename" content="Nairobi, Kenya" />

        {/* Structured Data */}
        <script type="application/ld+json">{JSON.stringify(ORGANIZATION_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(SHIPPING_SERVICE_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
        <script type="application/ld+json">{JSON.stringify(BREADCRUMB_SCHEMA)}</script>
      </Helmet>

      {/* ── Page Shell ───────────────────────────────────────────────────── */}
      <div
        className="min-h-screen w-full overflow-x-hidden flex flex-col text-gray-800 landing-shell"
      >
        {/* Scroll progress */}
        <ScrollProgress progress={scrollProgress} />

        {/* Banners & nav */}
        <NextShipmentBanner />
        <TopBanner />
        <Navbar isSideNavOpen={isSideNavOpen} setIsSideNavOpen={setIsSideNavOpen} />

        <div className="flex flex-1 relative">
          <SideNav isOpen={isSideNavOpen} setIsOpen={setIsSideNavOpen} />

          <main
            className={`flex-1 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
              isSideNavOpen ? "md:pl-64" : ""
            }`}
          >
            {/* Hidden H1 for SEO */}
            <h1 className="sr-only">
              Ship From USA to Kenya – Affordable Air & Sea Cargo Forwarding Service
            </h1>

            {/* ── Hero ─────────────────────────────────────────────────── */}
            <FadeInSection id="hero">
              <Hero />
            </FadeInSection>

            {/* ── Store ticker ─────────────────────────────────────────── */}
            <FadeInSection id="shopping-sites" delay={100}>
              <StoreTicker />
            </FadeInSection>

            {/* ── How It Works ─────────────────────────────────────────── */}
            <FadeInSection id="howitworks" delay={150}>
              <div className="py-16">
                <SectionHeading
                  eyebrow="Simple Process"
                  title="How It Works"
                  subtitle="From your US shopping cart to your door in Kenya — in three simple steps."
                />
                <HowItWorks />
              </div>
            </FadeInSection>

            {/* ── Calculator ───────────────────────────────────────────── */}
            <FadeInSection id="calculator" delay={100}>
              <div
                className="relative rounded-3xl overflow-hidden my-8 py-16 px-4 sm:px-10 calculator-section-bg"
                aria-labelledby="calc-heading"
              >
                {/* Decorative blobs */}
                <div
                  className="absolute top-0 right-0 w-96 h-96 pointer-events-none calc-blob-amber"
                  aria-hidden="true"
                />
                <div
                  className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none calc-blob-sky"
                  aria-hidden="true"
                />

                <SectionHeading
                  light
                  eyebrow="Instant Estimate"
                  title="Shipping Cost Calculator"
                  subtitle="Estimate the cost of shipping your package from the United States to Kenya."
                />

                {/* Trust stats */}
                <div className="max-w-2xl mx-auto mb-10">
                  <TrustStats />
                </div>

                {/* Calculator widget */}
                <div className="max-w-lg mx-auto" id="calc-heading">
                  <ShippingCalculator />
                </div>

                {/* Disclaimer */}
                <p className="text-center text-slate-500 text-xs mt-8 max-w-lg mx-auto">
                  Estimates are indicative only. Final rates confirmed at booking.
                  Duties, taxes, and delivery charges may apply.
                </p>
              </div>
            </FadeInSection>

            {/* ── Services ─────────────────────────────────────────────── */}
            <FadeInSection id="services" delay={100}>
              <div className="py-16">
                <SectionHeading
                  eyebrow="What We Offer"
                  title="Our Shipping Services"
                  subtitle="Flexible air and sea freight options tailored to your timeline and budget."
                />
                <Services />
              </div>
            </FadeInSection>

            {/* ── Pricing ──────────────────────────────────────────────── */}
            <FadeInSection id="pricing" delay={100}>
              <div className="py-16">
                <SectionHeading
                  eyebrow="Transparent Pricing"
                  title="Simple, Honest Rates"
                  subtitle="No hidden fees. No surprises. Just straightforward shipping costs."
                />
                <Pricing />
              </div>
            </FadeInSection>

            {/* ── Testimonials ─────────────────────────────────────────── */}
            <FadeInSection id="testimonials" delay={100}>
              <div
                className="rounded-3xl my-8 py-16 px-4 sm:px-10 testimonials-bg"
              >
                <SectionHeading
                  eyebrow="Customer Stories"
                  title="What Our Customers Say"
                  subtitle="Trusted by hundreds of Kenyans shopping from the US every month."
                />
                <Testimonials />
              </div>
            </FadeInSection>

            {/* ── FAQ (SEO content block) ───────────────────────────────── */}
            <FadeInSection id="faq" delay={100}>
              <div className="py-16">
                <SectionHeading
                  eyebrow="FAQ"
                  title="Frequently Asked Questions"
                  subtitle="Everything you need to know about shipping from the USA to Kenya."
                />
                <div className="max-w-3xl mx-auto grid gap-4" itemScope itemType="https://schema.org/FAQPage">
                  {FAQ_SCHEMA.mainEntity.map(({ name, acceptedAnswer }) => (
                    <details
                      key={name}
                      className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer"
                      itemScope
                      itemProp="mainEntity"
                      itemType="https://schema.org/Question"
                    >
                      <summary
                        className="flex items-center justify-between px-6 py-4 font-semibold text-gray-900 text-sm sm:text-base list-none"
                        itemProp="name"
                      >
                        {name}
                        <span className="ml-4 text-amber-500 text-lg shrink-0 transition-transform duration-300 group-open:rotate-45">+</span>
                      </summary>
                      <div
                        className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-50"
                        itemScope
                        itemProp="acceptedAnswer"
                        itemType="https://schema.org/Answer"
                      >
                        <span itemProp="text">{acceptedAnswer.text}</span>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </FadeInSection>

            {/* ── Contact ──────────────────────────────────────────────── */}
            <FadeInSection id="contact" delay={100}>
              <div className="py-16">
                <SectionHeading
                  eyebrow="Get In Touch"
                  title="Ready to Ship?"
                  subtitle="Our team is on standby to help you get your packages from the US to Kenya."
                />
                <Contact />
              </div>
            </FadeInSection>

            {/* ── Footer ───────────────────────────────────────────────── */}
            <section
              id="footer"
              className="rounded-t-3xl overflow-hidden mt-4 footer-bg"
            >
              <Footer />
            </section>
          </main>
        </div>

        {/* ── Floating elements ─────────────────────────────────────────── */}
        <WhatsAppFloat />

        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
          <BackToTop />
        </div>
      </div>
    </>
  );
}