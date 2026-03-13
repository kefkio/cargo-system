import React, { useState } from 'react';

export default function TrackShipment() {
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleTrack = () => {
    alert(`Tracking ${trackingNumber}...`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-lg shadow-md text-black">
      <input
        type="text"
        placeholder="Enter your tracking number"
        className="flex-1 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-secondary"
        value={trackingNumber}
        onChange={(e) => setTrackingNumber(e.target.value)}
      />
      <button
        onClick={handleTrack}
        className="bg-secondary hover:bg-secondary-dark text-white font-semibold py-2 px-4 rounded-md transition"
      >
        Track Shipment
      </button>
    </div>
  );
}