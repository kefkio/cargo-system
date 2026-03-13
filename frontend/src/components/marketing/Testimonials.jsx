// src/components/Testimonials.jsx
import React from "react";
import { FaQuoteLeft } from "react-icons/fa";

const testimonials = [
  {
    name: "Jane Mwangi",
    role: "Business Owner",
    feedback:
      "Firstpoint Cargo made shipping effortless. I could track my packages in real-time and they always arrived on schedule.",
  },
  {
    name: "David Otieno",
    role: "Importer",
    feedback:
      "The customer support team is fantastic. They answered all my questions and ensured my cargo was handled securely.",
  },
  {
    name: "Sarah Kamau",
    role: "Entrepreneur",
    feedback:
      "Transparent pricing and reliable delivery — I trust Firstpoint Cargo for all my logistics needs.",
  },
];

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="py-20 bg-gray-50 animate-fadeIn delay-200"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-primary mb-12">
          What Our Customers Say
        </h2>

        {/* Carousel-like horizontal scroll */}
        <div className="flex gap-8 overflow-x-auto snap-x snap-mandatory pb-4">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="snap-center bg-white rounded-xl shadow-lg p-8 min-w-[300px] md:min-w-[400px] flex flex-col items-center text-center hover:shadow-2xl transition-transform duration-300"
            >
              <FaQuoteLeft className="text-secondary text-3xl mb-4" />
              <p className="italic text-gray-700 mb-6">“{t.feedback}”</p>
              <h3 className="font-bold text-lg text-text-primary">{t.name}</h3>
              <span className="text-sm text-gray-500">{t.role}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}