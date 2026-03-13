import React from "react";
import { Helmet } from "react-helmet-async";
import ShippingCalculator from "../../components/shipment/ShippingCalculator";

export default function ShipFromWalmart() {

return (

<div className="max-w-6xl mx-auto px-6 py-16">

<Helmet>

<title>Ship From Walmart to Kenya | Cargo Shipping</title>

<meta
name="description"
content="Shop from Walmart and ship your purchases to Kenya using our cargo shipping service."
/>

<link
rel="canonical"
href="https://yourdomain.com/ship-from-walmart-to-kenya"
/>

</Helmet>

<h1 className="text-4xl font-bold mb-6">
Ship From Walmart to Kenya
</h1>

<p className="text-gray-600 mb-8">
Walmart offers millions of products that can be shipped to Kenya through
our US forwarding warehouse.
</p>

<h2 className="text-2xl font-semibold mt-12 mb-4">
Shipping Cost Calculator
</h2>

<ShippingCalculator/>

</div>

);

}