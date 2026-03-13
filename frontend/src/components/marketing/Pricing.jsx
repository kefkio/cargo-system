// src/components/Pricing.jsx
import React from "react";

export default function Pricing() {
  const plans = [
    {
      title: "Air Freight",
      price: "From $16.99/kg",
      description: "Fast delivery in 7–14 business days.",
      features: [
        "Minimum 1kg all-inclusive",
        "Rates drop to $14.50–$13.99/kg for larger shipments",
        "Chargeable weight = actual or volumetric (whichever is larger)",
        "Weekly flights from USA to Kenya",
      ],
      highlight: true,
    },
    {
      title: "Ocean Freight",
      price: "$30/cu ft (≤100 cu ft)",
      description: "Affordable bulk shipping, monthly sailings.",
      features: [
        "$25/cu ft for shipments above 100 cu ft",
        "Ideal for large, heavy cargo",
        "Slower transit but cost-effective",
        "Customs clearance handled",
      ],
      highlight: false,
    },
    {
      title: "Sea Boxes & Barrels",
      price: "From $80 per box / $119 per barrel",
      description: "Flexible options for household goods.",
      features: [
        "Medium box: $80",
        "Large box: $99–$135",
        "Wardrobe boxes: $199–$299",
        "Barrels: $119–$269 depending on size",
      ],
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-12 md:py-20 bg-white animate-fadeIn delay-100">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-primary mb-12">
          Shipping Pricing Plans
        </h2>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 mb-16">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-xl shadow-lg p-8 flex flex-col items-center text-center hover:shadow-2xl hover:scale-105 transition-transform duration-300 ${
                plan.highlight ? "border-4 border-secondary" : "border border-gray-200"
              }`}
            >
              {plan.highlight && (
                <span className="bg-secondary text-white px-3 py-1 rounded-full text-sm font-bold mb-4">
                  Best Value
                </span>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.title}</h3>
              <p className="text-3xl font-extrabold text-primary mb-4">{plan.price}</p>
              <p className="text-gray-600 mb-6">{plan.description}</p>

              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="text-gray-700">
                    ✅ {feature}
                  </li>
                ))}
              </ul>

              <button className="px-6 py-3 bg-primary text-white font-bold rounded-lg shadow hover:bg-secondary transition">
                Choose {plan.title}
              </button>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto mt-16">
          <table className="w-full border-collapse border border-gray-200 shadow-lg rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-200 px-4 py-2 text-left">Feature</th>
                {plans.map((plan, idx) => (
                  <th key={idx} className="border border-gray-200 px-4 py-2 text-center">
                    {plan.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-200 px-4 py-2">Pricing Basis</td>
                <td className="border border-gray-200 px-4 py-2 text-center">Per kg</td>
                <td className="border border-gray-200 px-4 py-2 text-center">Per cubic foot</td>
                <td className="border border-gray-200 px-4 py-2 text-center">Per box/barrel</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-2">Delivery Speed</td>
                <td className="border border-gray-200 px-4 py-2 text-center">7–14 days</td>
                <td className="border border-gray-200 px-4 py-2 text-center">4–6 weeks</td>
                <td className="border border-gray-200 px-4 py-2 text-center">6–8 weeks</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-2">Best For</td>
                <td className="border border-gray-200 px-4 py-2 text-center">Small/medium packages</td>
                <td className="border border-gray-200 px-4 py-2 text-center">Bulk cargo</td>
                <td className="border border-gray-200 px-4 py-2 text-center">Household goods</td>
              </tr>
              <tr>
                <td className="border border-gray-200 px-4 py-2">Extra Services</td>
                <td className="border border-gray-200 px-4 py-2 text-center">Free packaging</td>
                <td className="border border-gray-200 px-4 py-2 text-center">Customs clearance</td>
                <td className="border border-gray-200 px-4 py-2 text-center">Flexible sizes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}