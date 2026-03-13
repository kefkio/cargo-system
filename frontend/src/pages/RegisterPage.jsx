import React from "react";
import RegisterForm from "../components/RegisterForm";
import buyerImage from "../assets/buyer_dweb_individual.jpg";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left Image */}
      <div className="hidden md:flex md:w-1/2">
        <img
          src={buyerImage}
          alt="Buyer"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Form */}
      <div className="flex w-full md:w-1/2 justify-center items-center p-10 bg-gray-50">
        <RegisterForm />
      </div>
    </div>
  );
}