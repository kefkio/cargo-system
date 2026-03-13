import React from "react";
import { Helmet } from "react-helmet-async";
import ShippingCalculator from "../../components/shipment/ShippingCalculator";

export default function ShipFromEbay() {

return (

<div className="max-w-6xl mx-auto px-6 py-16">

<Helmet>

<title>Ship From eBay to Kenya | Cargo Forwarding Service</title>

<meta
name="description"
content="Buy products on eBay and ship them to Kenya with our cargo forwarding service. Fast air freight and affordable sea cargo."
/>

<link
rel="canonical"
href="https://yourdomain.com/ship-from-ebay-to-kenya"
/>

<meta property="og:title" content="Ship From eBay to Kenya"/>
<meta property="og:type" content="website"/>

</Helmet>

<h1 className="text-4xl font-bold mb-6">
Ship From eBay to Kenya
</h1>

<p className="text-gray-600 mb-8">
You can shop for electronics, fashion and collectibles on eBay and ship
them safely to Kenya using our cargo forwarding service.
</p>

<h2 className="text-2xl font-semibold mt-10 mb-4">
How Shipping From eBay Works
</h2>

<ol className="list-decimal ml-6 space-y-2">

<li>Buy items from eBay.</li>
<li>Use our US warehouse address at checkout.</li>
<li>We receive and prepare the package.</li>
<li>We ship the cargo to Kenya.</li>

</ol>

<h2 className="text-2xl font-semibold mt-12 mb-4">
Calculate Shipping Cost
</h2>

<ShippingCalculator/>

<h2 className="text-2xl font-semibold mt-12 mb-4">
FAQs
</h2>

<div className="space-y-4">

<div>
<h3 className="font-semibold">
Can I buy from eBay in Kenya?
</h3>
<p>
Yes. Our US address allows you to receive and forward eBay packages to Kenya.
</p>
</div>

<div>
<h3 className="font-semibold">
How long does shipping take?
</h3>
<p>
Air cargo takes 5–10 days while sea freight takes several weeks.
</p>
</div>

</div>

</div>

);

}