// src/components/Footer.jsx
import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Footer() {
  const seoPages = [
    { label: "Ship from Amazon to Kenya", path: "/seo/ship-from-amazon-to-kenya" },
    { label: "Ship from eBay to Kenya", path: "/seo/ship-from-ebay-to-kenya" },
    { label: "Ship from Walmart to Kenya", path: "/seo/ship-from-walmart-to-kenya" },
    { label: "Ship from BestBuy to Kenya", path: "/seo/ship-from-bestbuy-to-kenya" },
    { label: "Air Freight USA to Kenya", path: "/seo/air-freight-usa-to-kenya" },
    { label: "Sea Freight USA to Kenya", path: "/seo/sea-freight-usa-to-kenya" },
    { label: "Shipping Calculator USA to Kenya", path: "/seo/shipping-calculator-usa-to-kenya" },
  ];

  return (
    <footer className="bg-primary text-white py-10 px-6 md:px-12 text-sm md:text-base animate-fadeIn delay-300">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Column 1: Brand */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold tracking-wide">Firstpoint Cargo</h3>
          <p className="text-gray-300 leading-relaxed">
            Reliable US–Kenya shipping made simple. Track, ship, and manage your cargo with ease.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div className="space-y-2">
          <h4 className="font-semibold mb-2">Quick Links</h4>
          <ul className="space-y-1">
            <li><a href="#hero" className="hover:text-secondary transition-colors">Home</a></li>
            <li><a href="#services" className="hover:text-secondary transition-colors">Services</a></li>
            <li><a href="#pricing" className="hover:text-secondary transition-colors">Pricing</a></li>
            <li><a href="#calculator" className="hover:text-secondary transition-colors">Calculator</a></li>
          </ul>
        </div>

        {/* Column 3: Shipping Services / SEO Pages */}
        <div className="space-y-2">
          <h4 className="font-semibold mb-2">Shipping Services</h4>
          <ul className="space-y-1">
            {seoPages.map((page) => (
              <li key={page.path}>
                <Link to={page.path} className="hover:text-secondary transition-colors">
                  {page.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Newsletter + Social */}
        <div className="space-y-3">
          <h4 className="font-semibold mb-2">Stay Connected</h4>
          <form className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-3 py-1.5 rounded-lg text-primary focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
            />
            <button
              type="submit"
              className="bg-secondary text-white font-semibold py-1.5 rounded-lg shadow hover:bg-secondary-dark transition-colors text-sm"
            >
              Subscribe
            </button>
          </form>

          <div className="flex gap-3 mt-2">
            <a href="https://facebook.com/YourPage" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors"><FaFacebookF size={16} /></a>
            <a href="https://twitter.com/YourHandle" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors"><FaTwitter size={16} /></a>
            <a href="https://instagram.com/YourHandle" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors"><FaInstagram size={16} /></a>
            <a href="https://linkedin.com/company/YourCompany" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors"><FaLinkedinIn size={16} /></a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-8 border-t border-gray-600 pt-4 text-center text-gray-400 text-xs md:text-sm space-y-1">
        <div>© 2026 Firstpoint Cargo. All rights reserved.</div>
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          <Link to="/terms-privacy" className="hover:text-secondary transition-colors">Terms & Privacy Policy</Link>
          <Link to="/cookie-policy" className="hover:text-secondary transition-colors">Cookies</Link>
          <Link to="/insurance-terms" className="hover:text-secondary transition-colors">Insurance Terms</Link>
          <Link to="/prohibited-items" className="hover:text-secondary transition-colors">Prohibited Items</Link>
          <Link to="/accessibility" className="hover:text-secondary transition-colors">Accessibility</Link>
          <Link to="/user-agreement" className="hover:text-secondary transition-colors">User Agreement</Link>
          <Link to="/privacy-notice" className="hover:text-secondary transition-colors">Privacy Notice</Link>
          <Link to="/ca-privacy-notice" className="hover:text-secondary transition-colors">CA Privacy Notice</Link>
          <Link to="/adchoice" className="hover:text-secondary transition-colors">AdChoice</Link>
          <Link to="/payments-terms" className="hover:text-secondary transition-colors">Payments Terms</Link>
        </div>
      </div>
    </footer>
  );
}