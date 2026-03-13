import { useState } from "react";

export default function ShippingCalculator() {
  const [shippingType, setShippingType] = useState("air"); // "air" or "sea"
  const [weight, setWeight] = useState("");
  const [volume, setVolume] = useState({ length: "", width: "", height: "", uom: "feet" });
  const [cost, setCost] = useState(null);

  const handleCalculate = (e) => {
    e.preventDefault();
    let result = 0;
    if (shippingType === "air" && weight) {
      // Air freight: $16.99/kg minimum 1kg
      result = Math.max(weight * 16.99, 16.99);
    } else if (shippingType === "sea" && volume.length && volume.width && volume.height) {
      // Calculate volume in cubic feet
      let vol = volume.length * volume.width * volume.height;
      switch (volume.uom) {
        case "inches":
          vol *= 0.0005787; // cubic inches to cu ft
          break;
        case "feet":
          // already in cu ft
          break;
        case "cm":
          vol *= 0.00003531; // cubic cm to cu ft
          break;
        case "meters":
          vol *= 35.3147; // cubic meters to cu ft
          break;
        default:
          break;
      }
      // Sea freight: $30/cu ft for ≤100 cu ft, $25 for more
      result = vol <= 100 ? vol * 30 : 100 * 30 + (vol - 100) * 25;
    }
    setCost(result.toFixed(2));
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md max-w-md mx-auto">
      <h3 className="text-lg font-semibold text-gray-800 mb-2 text-center">
        Shipping Cost Calculator
      </h3>
      <p className="text-sm text-gray-600 mb-4 text-center">
        Ideal for calculating shipping cost based on weight for airfreight or cubic metres for sea cargo.
      </p>
      <form onSubmit={handleCalculate} className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="shippingType"
              value="air"
              checked={shippingType === "air"}
              onChange={(e) => setShippingType(e.target.value)}
            />
            <span className="text-sm">Air Freight</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="shippingType"
              value="sea"
              checked={shippingType === "sea"}
              onChange={(e) => setShippingType(e.target.value)}
            />
            <span className="text-sm">Sea Freight</span>
          </label>
        </div>

        {shippingType === "air" && (
          <label className="block">
            <span className="text-sm text-gray-700">Weight (kg):</span>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="mt-1 p-2 border rounded w-full text-sm"
              min="0"
              step="0.1"
              required
            />
          </label>
        )}

        {shippingType === "sea" && (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <label className="block">
                <span className="text-xs text-gray-700">Length:</span>
                <input
                  type="number"
                  value={volume.length || ""}
                  onChange={(e) => setVolume({ ...volume, length: e.target.value })}
                  className="mt-1 p-1 border rounded w-full text-sm"
                  min="0"
                  step="0.1"
                  required
                />
              </label>
              <label className="block">
                <span className="text-xs text-gray-700">Width:</span>
                <input
                  type="number"
                  value={volume.width || ""}
                  onChange={(e) => setVolume({ ...volume, width: e.target.value })}
                  className="mt-1 p-1 border rounded w-full text-sm"
                  min="0"
                  step="0.1"
                  required
                />
              </label>
              <label className="block">
                <span className="text-xs text-gray-700">Height:</span>
                <input
                  type="number"
                  value={volume.height || ""}
                  onChange={(e) => setVolume({ ...volume, height: e.target.value })}
                  className="mt-1 p-1 border rounded w-full text-sm"
                  min="0"
                  step="0.1"
                  required
                />
              </label>
            </div>
            <label className="block">
              <span className="text-xs text-gray-700">Unit of Measurement:</span>
              <select
                value={volume.uom || "feet"}
                onChange={(e) => setVolume({ ...volume, uom: e.target.value })}
                className="mt-1 p-1 border rounded w-full text-sm"
              >
                <option value="inches">Inches</option>
                <option value="feet">Feet</option>
                <option value="cm">Centimeters</option>
                <option value="meters">Meters</option>
              </select>
            </label>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition text-sm font-medium"
        >
          Calculate Cost
        </button>

        {cost !== null && (
          <p className="mt-2 text-center text-gray-800 font-semibold text-sm">
            Estimated Cost: ${cost}
          </p>
        )}
      </form>
    </div>
  );
}