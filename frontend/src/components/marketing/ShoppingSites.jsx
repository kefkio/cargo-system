// src/components/ShoppingSites.jsx
import React from "react";

const shoppingSites = [
  { name: "Amazon", img: "/amazon.png", url: "https://www.amazon.com" },
  { name: "eBay", img: "/ebay.png", url: "https://www.ebay.com" },
  { name: "Walmart", img: "/walmart.png", url: "https://www.walmart.com" },
  { name: "Target", img: "/target.png.jpg", url: "https://www.target.com" },
  { name: "BestBuy", img: "/BestBuy.png", url: "https://www.bestbuy.com" },
  { name: "AliExpress", img: "/aliexpress.png", url: "https://www.aliexpress.com" },
];

export default function ShoppingSites() {
  return (
    <section className="py-12 bg-gray-50">
      <h2 className="text-2xl md:text-3xl font-bold text-center text-primary mb-8">
        Top US Shopping Sites
      </h2>

      <div className="relative overflow-hidden w-full px-4 md:px-20">
        <div className="flex animate-scroll gap-4 md:gap-6">
          {[...shoppingSites, ...shoppingSites].map((site, idx) => (
            <a
              key={idx}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 flex items-center justify-center"
              title={site.name}
            >
              <img
                src={site.img}
                alt={site.name}
                className="max-w-full max-h-full object-contain rounded-full"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}