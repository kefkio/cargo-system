import { useState, useEffect, useRef } from "react";

// ─── Google Font import (Syne + DM Sans) ─────────────────────────────────────
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap";

const RATES = {
  air: { perKg: 16.99, min: 1 },
  sea: { tier1Rate: 30, tier1Max: 100, tier2Rate: 25 },
};

const UOM_OPTIONS = [
  { value: "cm",      label: "Centimeters (cm)" },
  { value: "inches",  label: "Inches (in)" },
  { value: "feet",    label: "Feet (ft)" },
  { value: "meters",  label: "Meters (m)" },
];

function toCubicFeet(vol, uom) {
  const factors = { cm: 0.00003531, inches: 0.0005787, feet: 1, meters: 35.3147 };
  return vol * (factors[uom] || 1);
}

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const target = parseFloat(value);
    const start = 0;
    const duration = 900;
    const startTime = performance.now();
    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay((start + (target - start) * eased).toFixed(2));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value]);
  return <>{display}</>;
}

export default function ShippingCalculator() {
  const [mode, setMode] = useState("air");
  const [weight, setWeight] = useState("");
  const [vol, setVol] = useState({ length: "", width: "", height: "", uom: "cm" });
  const [cost, setCost] = useState(null);
  const [cubicFt, setCubicFt] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    // inject font
    if (!document.getElementById("sc-font")) {
      const link = document.createElement("link");
      link.id = "sc-font";
      link.rel = "stylesheet";
      link.href = FONT_LINK;
      document.head.appendChild(link);
    }
  }, []);

  const handleModeSwitch = (m) => {
    setMode(m);
    setCost(null);
    setRevealed(false);
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    let result = 0;

    if (mode === "air") {
      const kg = parseFloat(weight);
      if (!kg || kg <= 0) { triggerShake(); return; }
      result = Math.max(kg * RATES.air.perKg, RATES.air.perKg * RATES.air.min);
      setCubicFt(null);
    } else {
      const l = parseFloat(vol.length), w = parseFloat(vol.width), h = parseFloat(vol.height);
      if (!l || !w || !h || l <= 0 || w <= 0 || h <= 0) { triggerShake(); return; }
      const cf = toCubicFeet(l * w * h, vol.uom);
      result = cf <= RATES.sea.tier1Max
        ? cf * RATES.sea.tier1Rate
        : RATES.sea.tier1Max * RATES.sea.tier1Rate + (cf - RATES.sea.tier1Max) * RATES.sea.tier2Rate;
      setCubicFt(cf.toFixed(2));
    }

    const finalCost = result.toFixed(2);
    setRevealed(false);
    setCost(null);
    requestAnimationFrame(() => {
      setCost(finalCost);
      setRevealed(true);
    });
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const inputCls = `
    w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3
    text-white text-sm font-medium placeholder-slate-500 outline-none
    transition-all duration-200
    focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:bg-slate-800
  `;
  const labelCls = "block text-xs font-semibold text-slate-400 mb-1.5 tracking-wide uppercase";

  return (
    <div className="font-dm-sans">
      <div
        className={`relative w-full max-w-lg mx-auto rounded-3xl overflow-hidden shadow-2xl calc-container-bg ${shake ? "sc-shake" : ""}`}
      >
        {/* Decorative top glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 pointer-events-none calc-top-glow"
          aria-hidden="true"
        />

        {/* Header */}
        <div className="relative px-6 pt-8 pb-5 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 sc-pulse inline-block" />
            <span className="text-amber-400 text-xs font-semibold tracking-widest uppercase">Instant Estimate</span>
          </div>
          <h2
            className="text-2xl font-extrabold text-white leading-tight font-syne"
          >
            Shipping Cost Calculator
          </h2>
          <p className="text-slate-400 text-sm mt-1.5">
            Air freight by weight · Sea cargo by volume
          </p>
        </div>

        {/* Mode toggle */}
        <div className="px-6 mb-5">
          <div className="relative flex bg-slate-800/70 rounded-2xl p-1 border border-slate-700/60">
            <div
              className="absolute top-1 bottom-1 w-1/2 rounded-xl transition-all duration-300 ease-out calc-mode-indicator"
              style={{ left: mode === "air" ? "4px" : "calc(50% - 4px)" }}
              aria-hidden="true"
            />
            {[
              { val: "air", icon: "✈️", label: "Air Freight" },
              { val: "sea", icon: "🚢", label: "Sea Freight" },
            ].map(({ val, icon, label }) => (
              <button
                key={val}
                type="button"
                onClick={() => handleModeSwitch(val)}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-200
                  ${mode === val ? "text-slate-900" : "text-slate-400 hover:text-slate-200"}`}
                aria-pressed={mode === val}
              >
                <span>{icon}</span> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleCalculate} noValidate className="px-6 pb-6 flex flex-col gap-4">
          {mode === "air" && (
            <div className="sc-reveal">
              <label htmlFor="sc-weight" className={labelCls}>Weight (kg)</label>
              <input
                id="sc-weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 5.5"
                min="0"
                step="0.1"
                required
                className={inputCls}
                aria-label="Package weight in kilograms"
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Rate: <span className="text-amber-400 font-semibold">$16.99 / kg</span> · Min charge 1 kg
              </p>
            </div>
          )}

          {mode === "sea" && (
            <div className="sc-reveal flex flex-col gap-4">
              <div>
                <label className={labelCls}>Dimensions</label>
                <div className="grid grid-cols-3 gap-2">
                  {["length", "width", "height"].map((dim) => (
                    <div key={dim}>
                      <label htmlFor={`sc-${dim}`} className="block text-xs text-slate-500 mb-1 capitalize">{dim}</label>
                      <input
                        id={`sc-${dim}`}
                        type="number"
                        value={vol[dim]}
                        onChange={(e) => setVol({ ...vol, [dim]: e.target.value })}
                        placeholder="0"
                        min="0"
                        step="0.1"
                        required
                        className={inputCls}
                        aria-label={`Package ${dim}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="sc-uom" className={labelCls}>Unit of Measurement</label>
                <select
                  id="sc-uom"
                  value={vol.uom}
                  onChange={(e) => setVol({ ...vol, uom: e.target.value })}
                  className={inputCls}
                  aria-label="Unit of measurement"
                >
                  {UOM_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div className="text-xs text-slate-500 flex gap-4">
                <span>≤ 100 ft³ → <span className="text-amber-400 font-semibold">$30 / ft³</span></span>
                <span>&gt; 100 ft³ → <span className="text-amber-400 font-semibold">$25 / ft³</span></span>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl font-bold text-slate-900 text-sm tracking-wide transition-all duration-200 active:scale-95 btn-cta-amber"
            aria-label="Calculate shipping cost"
          >
            Calculate Shipping Cost →
          </button>

          {/* Result panel */}
          {cost !== null && revealed && (
            <div
              className="sc-reveal rounded-2xl overflow-hidden border border-amber-400/20 calc-result-bg"
              role="status"
              aria-live="polite"
              aria-label={`Estimated shipping cost $${cost}`}
            >
              <div className="px-5 py-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
                  Estimated Cost
                </p>
                <div className="flex items-end gap-1">
                  <span
                    className="font-extrabold text-amber-400 calc-result-value"
                  >
                    $<AnimatedNumber value={cost} />
                  </span>
                  <span className="text-slate-400 text-sm mb-1.5">USD</span>
                </div>
                {mode === "sea" && cubicFt && (
                  <p className="text-xs text-slate-500 mt-1">
                    Volume: <span className="text-slate-300 font-medium">{cubicFt} ft³</span>
                  </p>
                )}
                {mode === "air" && (
                  <p className="text-xs text-slate-500 mt-1">
                    {weight} kg × $16.99/kg
                  </p>
                )}
              </div>

              {/* CTA strip */}
              <div
                className="px-5 py-3 border-t border-amber-400/10 flex items-center justify-between gap-3 calc-cta-strip-bg"
              >
                <p className="text-xs text-slate-400 leading-tight">
                  Ready to ship? Get a confirmed quote.
                </p>
                <button
                  type="button"
                  onClick={() => window.location.href = "#contact"}
                  className="shrink-0 bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold px-4 py-2 rounded-xl transition-colors duration-150 active:scale-95"
                  aria-label="Get a confirmed shipping quote"
                >
                  Get Quote
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Footer note */}
        <div className="px-6 pb-5 text-center">
          <p className="text-xs text-slate-600">
            Estimates only · Final rates confirmed at booking · Taxes & duties may apply
          </p>
        </div>
      </div>
    </div>
  );
}