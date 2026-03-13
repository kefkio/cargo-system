import React from "react";
import { Helmet } from "react-helmet-async";
import ShippingCalculator from "../../components/shipment/ShippingCalculator";

export default function ShipFromAmazon() {

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">

      <Helmet>
        <title>Ship From Amazon to Kenya | Fast Cargo Shipping</title>

        <meta
          name="description"
          content="Buy products from Amazon and ship them to Kenya using our cargo forwarding service. Fast air freight and affordable sea shipping."
        />

        <link rel="canonical" href="https://yourdomain.com/ship-from-amazon-to-kenya" />

        {/* Open Graph */}
        <meta property="og:title" content="Ship From Amazon to Kenya" />
        <meta property="og:description" content="Shop on Amazon and ship your packages to Kenya with affordable cargo shipping." />
        <meta property="og:type" content="website" />

      </Helmet>


      <h1 className="text-4xl font-bold mb-6">
        Ship From Amazon to Kenya
      </h1>

      <p className="text-gray-600 mb-8">
        Shopping on Amazon gives you access to millions of products that may not
        be available locally in Kenya. Our cargo forwarding service allows you
        to ship Amazon packages from the United States to Kenya quickly and
        affordably.
      </p>


      <h2 className="text-2xl font-semibold mt-12 mb-4">
        How to Ship From Amazon to Kenya
      </h2>

      <ol className="list-decimal ml-6 space-y-2 text-gray-700">
        <li>Create an account on our platform.</li>
        <li>Use our US warehouse address when checking out on Amazon.</li>
        <li>We receive your package and prepare it for shipment.</li>
        <li>Your cargo is shipped to Kenya via air or sea freight.</li>
      </ol>


      <h2 className="text-2xl font-semibold mt-12 mb-4">
        Shipping Cost From Amazon to Kenya
      </h2>

      <p className="text-gray-700 mb-6">
        Shipping cost depends on package weight, dimensions and shipping
        method. Use our calculator below to estimate the cost.
      </p>


      <ShippingCalculator />


      <h2 className="text-2xl font-semibold mt-12 mb-4">
        Delivery Time
      </h2>

      <p className="text-gray-700">
        Air cargo typically takes between 5 and 10 days while sea freight
        shipments take 4 to 6 weeks depending on the shipment schedule.
      </p>


      <h2 className="text-2xl font-semibold mt-12 mb-4">
        Frequently Asked Questions
      </h2>

      <div className="space-y-4">

        <div>
          <h3 className="font-semibold">
            Can Amazon ship directly to Kenya?
          </h3>
          <p>
            Some items ship internationally, but many do not. Our service
            provides a US address that allows you to forward any Amazon order
            to Kenya.
          </p>
        </div>

        <div>
          <h3 className="font-semibold">
            How long does shipping from Amazon to Kenya take?
          </h3>
          <p>
            Air freight normally takes 5-10 days while sea freight may take
            several weeks depending on shipment schedules.
          </p>
        </div>

      </div>

    </div>
  );
}