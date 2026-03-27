// src/components/layout/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaBars } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ setIsSideNavOpen }) {
  const [activeSection, setActiveSection] = useState("hero");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("access"));
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.6, rootMargin: "-80px 0px 0px 0px" }
    );

    sections.forEach((section) => observer.observe(section));
    return () => sections.forEach((section) => observer.unobserve(section));
  }, []);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const section = document.getElementById(searchQuery.toLowerCase());
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    setIsLoggedIn(false);
    navigate("/");
    window.location.reload();
  };

  const links = [
    { id: "hero", label: "Home" },
    { id: "howitworks", label: "How It Works" },
    { id: "services", label: "Services", hasDropdown: true },
    { id: "pricing", label: "Pricing" },
    { id: "calculator", label: "Calculator" },
    { id: "track", label: "Track Parcel", path: "/track" },
  ];

  const servicesDropdown = [
    { label: "Ship from Amazon to Kenya", path: "/seo/ship-from-amazon-to-kenya" },
    { label: "Ship from eBay to Kenya", path: "/seo/ship-from-ebay-to-kenya" },
    { label: "Ship from Walmart to Kenya", path: "/seo/ship-from-walmart-to-kenya" },
    { label: "Ship from BestBuy to Kenya", path: "/seo/ship-from-bestbuy-to-kenya" },
    { label: "Air Freight USA to Kenya", path: "/seo/air-freight-usa-to-kenya" },
    { label: "Sea Freight USA to Kenya", path: "/seo/sea-freight-usa-to-kenya" },
    { label: "Shipping Calculator USA to Kenya", path: "/seo/shipping-calculator-usa-to-kenya" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full bg-white text-gray-800 shadow-md z-50 px-6 py-4 flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">FP</div>
        <span className="text-2xl font-extrabold text-primary tracking-wide">Firstpoint Cargo</span>
      </div>

      {/* Desktop nav links */}
      <ul className="hidden md:flex items-center gap-6 font-medium">
        {links.map((link) => (
          <li key={link.id} className="relative" ref={link.hasDropdown ? dropdownRef : null}>
            {link.hasDropdown ? (
              <>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`pb-1 flex items-center gap-1 hover:text-secondary transition ${
                    activeSection === link.id ? "text-secondary font-bold border-b-2 border-secondary" : ""
                  }`}
                >
                  {link.label} ▼
                </button>

                {dropdownOpen && (
                  <ul className="absolute top-full left-0 mt-2 w-64 max-h-80 overflow-y-auto bg-white border border-gray-200 shadow-lg rounded-md z-50">
                    {servicesDropdown.map((service) => (
                      <li key={service.path}>
                        <Link
                          to={service.path}
                          className="block px-4 py-2 text-gray-800 hover:bg-primary hover:text-white transition"
                          onClick={() => setDropdownOpen(false)}
                        >
                          {service.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : link.path ? (
              <Link
                to={link.path}
                className="pb-1 transition-all duration-300 hover:text-secondary"
              >
                {link.label}
              </Link>
            ) : (
              <a
                href={`#${link.id}`}
                className={`pb-1 transition-all duration-300 ${
                  activeSection === link.id ? "text-secondary font-bold border-b-2 border-secondary" : "hover:text-secondary"
                }`}
              >
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>

      {/* Right side: search + auth */}
      <div className="hidden md:flex items-center gap-6">
        <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-lg overflow-hidden shadow max-w-xs">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 w-full text-gray-700 focus:outline-none"
          />
          <button type="submit" className="bg-secondary px-3 py-2 text-white hover:bg-secondary-dark transition">
            <FaSearch />
          </button>
        </form>

        {!isLoggedIn ? (
          <div className="flex gap-4 items-center text-sm font-medium">
            <Link to="/login" className="text-primary hover:text-secondary transition text-xs font-semibold">
              Sign In
            </Link>
            <span className="text-gray-400">|</span>
            <Link to="/register" className="bg-secondary hover:bg-secondary-dark text-white px-3 py-1 rounded text-xs font-semibold transition">
              Sign Up
            </Link>
          </div>
        ) : (
          <div className="flex gap-4 items-center text-sm font-medium">
            <Link to="/dashboard/client" className="hover:text-secondary transition text-xs font-semibold">
              Dashboard
            </Link>
            <span className="text-gray-400">|</span>
            <button onClick={handleLogout} className="text-red-500 hover:text-red-700 text-xs font-semibold transition">
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      <button
        aria-label="Open menu"
        className="md:hidden bg-primary px-4 py-2 rounded-lg text-white hover:bg-secondary transition"
        onClick={() => setIsSideNavOpen(true)}
      >
        <FaBars />
      </button>
    </nav>
  );
}