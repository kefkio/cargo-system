import React, { useEffect, useState } from "react";
import ShipmentForm from "../components/ShipmentForm";
import AccessControl from "../components/AccessControl";
import { isStaff, isAdmin } from "../utils/auth";

export default function CreateShipment() {
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const userRole = localStorage.getItem("userRole"); // Assuming user role is stored in localStorage
    if (isStaff(userRole) || isAdmin(userRole)) {
      setHasAccess(true);
    }
  }, []);

  if (!hasAccess) {
    return <AccessControl />;
  }

  return (
    <div className="create-shipment-container">
      <h1>Create Shipment</h1>
      <ShipmentForm />
    </div>
  );
}