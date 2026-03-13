// src/components/WarehouseAddress.jsx
import React, { useState } from "react";

export default function WarehouseAddress() {
  const [customerName, setCustomerName] = useState("");
  const [submittedName, setSubmittedName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim()) return alert("Please enter your name");
    setSubmittedName(customerName.trim());

    // TODO: Send submittedName to backend API for labelling
    // fetch(`${BASE_URL}/save-customer-name`, {...})
  };

  const handleCopy = () => {
    if (!submittedName) return alert("Please submit your name first");
    const addressText = `FirstPoint+ ${submittedName}
330 Tompkins Ave
Unit 3623
Staten Island, NY, 10304
USA
Phone: 7012033251`;
    navigator.clipboard.writeText(addressText);
    alert("Address copied to clipboard!");
  };

  const handlePrint = () => {
    if (!submittedName) return alert("Please submit your name first");
    const printContent = `
FirstPoint+ ${submittedName}
330 Tompkins Ave
Unit 3623
Staten Island, NY, 10304
USA
Phone: 7012033251
`;
    const newWin = window.open("", "_blank");
    newWin.document.write(`<pre>${printContent}</pre>`);
    newWin.print();
    newWin.close();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-xl mx-auto my-8">
      <h3 className="text-xl font-bold mb-4 text-center">USA Shipping Address</h3>

      {!submittedName && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-4">
          <label className="text-sm font-medium">Enter Your Name:</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="John Doe"
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            Submit Name
          </button>
        </form>
      )}

      {submittedName && (
        <div className="bg-gray-50 p-4 rounded border border-gray-200">
          <pre className="text-sm whitespace-pre-wrap">
            FirstPoint+ {submittedName}
            {"\n"}330 Tompkins Ave
            {"\n"}Unit 3623
            {"\n"}Staten Island, NY, 10304
            {"\n"}USA
            {"\n"}Phone: 7012033251
          </pre>

          <div className="flex gap-4 mt-4 justify-center">
            <button
              onClick={handleCopy}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              Copy Address
            </button>
            <button
              onClick={handlePrint}
              className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 transition"
            >
              Print Address
            </button>
          </div>
        </div>
      )}
    </div>
  );
}