import React from "react";

// Example shipment schedule
const shipmentSchedule = [
  { station: "New York", shipmentDate: "2026-02-19", status: "Shipment on Schedule" },
  { station: "New York", shipmentDate: "2026-02-12", status: "Landed" },
  { station: "New York", shipmentDate: "2026-02-05", status: "Landed" },
  { station: "New York", shipmentDate: "2026-01-22", status: "Landed" },
  { station: "New York", shipmentDate: "2026-01-15", status: "Landed" },
];

export default function NextShipmentBanner() {
  const nextShipments = React.useMemo(() => {
    const today = new Date();

    return shipmentSchedule
      .map((s) => ({ ...s, dateObj: new Date(s.shipmentDate) }))
      .filter((s) => s.dateObj >= today)
      .sort((a, b) => a.dateObj - b.dateObj)
      .slice(0, 2);
  }, []);

  if (nextShipments.length === 0) return null;

  return (
    <div className="w-full bg-yellow-100 text-yellow-800 py-2 px-4 text-center font-semibold text-sm md:text-base shadow-md space-y-1">
      {nextShipments.map((s, idx) => (
        <div key={idx}>
          📦 Next shipment from <span className="font-bold">{s.station}</span> will be loaded on{" "}
          <span className="font-bold">
            {s.dateObj.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </span>{" "}
          ({s.status})
        </div>
      ))}
    </div>
  );
}