import React from "react";
import { Helmet } from "react-helmet-async";
import ShippingCalculator from "../../components/shipment/ShippingCalculator";

export default function ShippingCalculatorPage(){

return(

<div className="max-w-6xl mx-auto px-6 py-16">

<Helmet>

<title>Shipping Cost Calculator USA to Kenya</title>

<meta
name="description"
content="Use our shipping calculator to estimate cargo cost from the USA to Kenya."
/>

</Helmet>

<h1 className="text-4xl font-bold mb-6">
Shipping Cost Calculator USA to Kenya
</h1>

<ShippingCalculator/>

</div>

);

}