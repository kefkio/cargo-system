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


// ==========================
// Fade In Section
// ==========================

const FadeInSection = ({ children, id }) => {

  const [isVisible, setVisible] = useState(false);
  const domRef = useRef(null);

  useEffect(() => {

    const observer = new IntersectionObserver((entries) => {

      entries.forEach((entry) => {

        if (entry.isIntersecting) {
          setVisible(true);
        }

      });

    });

    if (domRef.current) observer.observe(domRef.current);

    return () => domRef.current && observer.unobserve(domRef.current);

  }, []);

  return (
    <section
      id={id}
      ref={domRef}
      className={`w-full max-w-screen-2xl mx-auto transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {children}
    </section>
  );
};


// ==========================
// Landing Page
// ==========================

export default function LandingPage() {

  const [isSideNavOpen, setIsSideNavOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {

    localStorage.removeItem("access");
    localStorage.removeItem("refresh");

  }, []);


  useEffect(() => {

    const handleScroll = () => {

      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;

      const progress = docHeight > 0
        ? (scrollTop / docHeight) * 100
        : 0;

      setScrollProgress(progress);

    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);

  }, []);


  const shoppingLogos = [
    "Amazon",
    "eBay",
    "Walmart",
    "BestBuy",
    "Target",
    "AliExpress"
  ];


  return (

    <>
    
      <Helmet>

        <title>
        Ship From USA to Kenya | Cargo Shipping & Package Forwarding
        </title>

        <meta
          name="description"
          content="Shop from Amazon, eBay, Walmart and ship your packages to Kenya using our fast and affordable cargo shipping service."
        />

        <meta name="robots" content="index, follow" />

        <link
          rel="canonical"
          href="https://yourdomain.com/"
        />


        {/* Open Graph */}

        <meta property="og:type" content="website" />

        <meta
          property="og:title"
          content="Ship From USA to Kenya | Cargo Shipping"
        />

        <meta
          property="og:description"
          content="Shop from Amazon, Walmart and eBay and ship to Kenya using fast air and sea cargo shipping."
        />

        <meta
          property="og:image"
          content="https://yourdomain.com/assets/seo/preview.jpg"
        />

        <meta
          property="og:url"
          content="https://yourdomain.com/"
        />


        {/* Twitter */}

        <meta name="twitter:card" content="summary_large_image" />

        <meta
          name="twitter:title"
          content="Ship From USA to Kenya"
        />

        <meta
          name="twitter:description"
          content="Affordable cargo shipping from the USA to Kenya."
        />


        {/* Organization Schema */}

        <script type="application/ld+json">
        {`
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Cargo Shipping USA Kenya",
          "url": "https://yourdomain.com",
          "telephone": "+254701203325",
          "sameAs": [
            "https://www.facebook.com/",
            "https://www.linkedin.com/",
            "https://twitter.com/",
            "https://wa.me/254701203325"
          ]
        }
        `}
        </script>


        {/* Shipping Service Schema */}

        <script type="application/ld+json">
        {`
        {
          "@context":"https://schema.org",
          "@type":"ShippingService",
          "name":"USA to Kenya Cargo Shipping",
          "areaServed":"Kenya",
          "serviceType":"International Shipping"
        }
        `}
        </script>


        {/* FAQ Schema */}

        <script type="application/ld+json">
        {`
        {
          "@context":"https://schema.org",
          "@type":"FAQPage",
          "mainEntity":[
            {
              "@type":"Question",
              "name":"How can I ship from USA to Kenya?",
              "acceptedAnswer":{
                "@type":"Answer",
                "text":"Use our US warehouse address when shopping online and we will forward your packages to Kenya."
              }
            },
            {
              "@type":"Question",
              "name":"How long does shipping take?",
              "acceptedAnswer":{
                "@type":"Answer",
                "text":"Air cargo takes about 5 to 10 days while sea freight takes approximately 4 to 6 weeks."
              }
            }
          ]
        }
        `}
        </script>


      </Helmet>


      <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-indigo-50 via-white to-gray-100 flex flex-col font-inter text-gray-800">

        <NextShipmentBanner />

        {/* Scroll Progress */}

        <div className="fixed top-0 left-0 w-full h-1 bg-gray-200 z-50">

          <div
            className="h-1 bg-primary transition-all duration-200"
            style={{ width: `${scrollProgress}%` }}
          />

        </div>


        <TopBanner />

        <Navbar
          isSideNavOpen={isSideNavOpen}
          setIsSideNavOpen={setIsSideNavOpen}
        />


        <div className="flex flex-1 relative">

          <SideNav
            isOpen={isSideNavOpen}
            setIsOpen={setIsSideNavOpen}
          />


          <main className={`flex-1 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 ${isSideNavOpen ? "md:pl-64" : ""}`}>

            {/* SEO H1 */}

            <h1 className="sr-only">
              Ship From USA to Kenya – Cargo Shipping Service
            </h1>


            <FadeInSection id="hero">
              <Hero />
            </FadeInSection>


            <FadeInSection id="howitworks">
              <HowItWorks />
            </FadeInSection>


            {/* Shopping Sites */}

            <FadeInSection id="shopping-sites">

              <section className="py-6 overflow-hidden">

                <h2 className="sr-only">
                Popular US stores you can shop from
                </h2>

                <div className="flex gap-8 animate-scroll whitespace-nowrap">

                  {shoppingLogos.map((logo) => (

                    <img
                      key={logo}
                      src={`/assets/logos/${logo}.png`}
                      alt={`${logo} shipping to Kenya`}
                      loading="lazy"
                      className="h-10"
                    />

                  ))}

                </div>

              </section>

            </FadeInSection>


            {/* Calculator */}

            <FadeInSection id="calculator">

              <section className="py-16">

                <h2 className="text-3xl font-bold text-center mb-4">
                Shipping Cost Calculator (USA to Kenya)
                </h2>

                <p className="text-center text-gray-600 max-w-xl mx-auto mb-10">
                Estimate the cost of shipping your package from the United States to Kenya.
                </p>

                <ShippingCalculator />

              </section>

            </FadeInSection>


            <FadeInSection id="services">
              <Services />
            </FadeInSection>


            <FadeInSection id="pricing">
              <Pricing />
            </FadeInSection>


            <FadeInSection id="testimonials">
              <Testimonials />
            </FadeInSection>


            <FadeInSection id="contact">
              <Contact />
            </FadeInSection>


            <section id="footer" className="bg-gray-50 py-12">

              <Footer />

            </section>


          </main>

        </div>


        {/* WhatsApp */}

        <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50">

          <a
            href="https://wa.me/254701203325"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center bg-green-500 text-white w-14 h-14 rounded-full shadow-xl hover:bg-green-600 transition"
          >

            <FaWhatsapp size={28} />

          </a>

        </div>


        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">

          <BackToTop />

        </div>

      </div>

    </>
  );
}