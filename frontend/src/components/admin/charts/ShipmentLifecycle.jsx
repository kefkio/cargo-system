import React from "react";
import 'react-tooltip/dist/react-tooltip.css';

export default function ShipmentLifecycle({ status, timestamps }) {
  const stages = [
    "Pickup Requested",
    "Shipment Created",
    "Processing at Origin",
    "In Transit",
    "Arrived Nairobi Hub",
    "Dispatched",
    "Delivered",
  ];

  const currentStageIndex = stages.findIndex((s) => s === status);

  return (
    <div className="my-4">
      <div className="flex justify-between mb-2 text-sm text-gray-600">
        {stages.map((stage, idx) => {
          const completed = idx < currentStageIndex;
          const current = idx === currentStageIndex;
          const tooltipText = timestamps?.[stage] || "Pending";

          return (
            <span
              key={idx}
              title={`${stage}: ${tooltipText}`}
              className={`cursor-pointer ${
                completed
                  ? "text-green-600 font-bold"
                  : current
                  ? "text-yellow-600 font-semibold"
                  : "text-gray-500"
              }`}
            >
              {stage}
            </span>
          );
        })}
      </div>

      <div className="relative h-2 bg-gray-300 rounded">
        <div
          className="absolute h-2 bg-green-600 rounded"
          style={{
            width: `${((currentStageIndex + 1) / stages.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}