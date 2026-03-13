import React from "react";
import { Helmet } from "react-helmet-async";
import ShippingCalculator from "../../components/shipment/ShippingCalculator";

export default function ShipFromBestBuy(){

return(

<div className="max-w-6xl mx-auto px-6 py-16">

<Helmet>

<title>Ship From BestBuy to Kenya | Electronics Shipping</title>

<meta
name="description"
content="Buy electronics from BestBuy and ship them to Kenya using our cargo forwarding service."
/>

</Helmet>

<h1 className="text-4xl font-bold mb-6">
Ship Electronics From BestBuy to Kenya
</h1>

<p className="text-gray-600 mb-8">
BestBuy is one of the best places to purchase electronics in the US.
We help you ship those products to Kenya safely.
</p>

<h2 className="text-2xl font-semibold mt-10 mb-4">
Estimate Shipping Cost
</h2>

<ShippingCalculator/>

</div>

);

}