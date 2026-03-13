import React from 'react';

export default function Features() {
  const features = [
    'Weekly air departures for faster delivery',
    'Ocean freight for heavy or bulky cargo',
    'Tax-free U.S. shopping with your warehouse address',
    'Free consolidation of multiple packages',
    'Full customs service in Kenya — no paperwork headaches',
  ];

  return (
    <section className="bg-background py-12 px-6 md:px-20">
      <h2 className="text-3xl font-bold text-primary mb-8">Why Ship with Firstpoint Cargo?</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <li key={idx} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-text-primary">
            <span className="text-2xl mb-2 block">✅</span>
            {feature}
          </li>
        ))}
      </ul>
    </section>
  );
}