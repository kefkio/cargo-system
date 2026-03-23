import React, { useState } from "react";
import { createShipment } from "../api/shipment";
import { useHistory } from "react-router-dom";

export default function ShipmentForm() {
  const [formData, setFormData] = useState({
    shipmentName: "",
    destination: "",
    weight: "",
    dimensions: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const history = useHistory();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createShipment(formData);
      history.push("/shipments"); // Redirect to the shipments page after successful creation
    } catch (err) {
      setError("Failed to create shipment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create Shipment</h2>
      {error && <p className="error">{error}</p>}
      <div>
        <label>
          Shipment Name:
          <input
            type="text"
            name="shipmentName"
            value={formData.shipmentName}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Destination:
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Weight (kg):
          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Dimensions (cm):
          <input
            type="text"
            name="dimensions"
            value={formData.dimensions}
            onChange={handleChange}
            required
          />
        </label>
      </div>
      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Shipment"}
      </button>
    </form>
  );
}