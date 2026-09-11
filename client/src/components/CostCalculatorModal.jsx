import React, { useState } from 'react';
import {
  X,
  Calculator,
  Truck,
  TrendingDown,
  Info,
  Scale,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CostCalculatorModal({ isOpen, onClose }) {
  const [quantity, setQuantity] = useState(1000);
  const [durationMonths, setDurationMonths] = useState(2);
  const [distanceA, setDistanceA] = useState(8); // Facility A (Close, ₹2.40/kg, ₹350 handling)
  const [distanceB, setDistanceB] = useState(45); // Facility B (Far, ₹1.90/kg, ₹550 handling)

  if (!isOpen) return null;

  // Facility A: Nearby, fair rate
  const rateA = 2.4;
  const handlingA = 350;
  const transportRateA = 25;
  const storageCostA = Math.round(rateA * quantity * durationMonths);
  const transportCostA = Math.round(distanceA * transportRateA);
  const totalA = storageCostA + handlingA + transportCostA;

  // Facility B: Farther away, advertised cheaper price
  const rateB = 1.9;
  const handlingB = 550;
  const transportRateB = 30;
  const storageCostB = Math.round(rateB * quantity * durationMonths);
  const transportCostB = Math.round(distanceB * transportRateB);
  const totalB = storageCostB + handlingB + transportCostB;

  const difference = Math.abs(totalB - totalA);
  const isNearerCheaper = totalA < totalB;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Calculator className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                Interactive Total Cost Simulator
              </h3>
              <p className="text-xs text-slate-400">
                Revealing hidden transport & handling fees
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Important Principle Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-950">
              <div className="font-bold text-sm mb-0.5">
                “Lowest storage price isn’t always the lowest total cost.”
              </div>
              <p className="leading-relaxed">
                Many farmers travel to distant cold storages for a ₹0.30–₹0.50 lower storage rate, without calculating that diesel, labor, vehicle transit loss, and toll charges cost ₹1,500–₹3,000 extra.
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Harvest Quantity:</span>
                <span className="text-emerald-700">{quantity} kg ({quantity / 1000} MT)</span>
              </div>
              <input
                type="range"
                min="200"
                max="10000"
                step="100"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>Storage Duration:</span>
                <span className="text-emerald-700">{durationMonths} Months</span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                step="1"
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Comparison Cards: Facility A vs Facility B */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Facility A: Local */}
            <div className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-50/40 relative">
              <span className="absolute -top-3 left-4 bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Facility A: Nearby Storage
              </span>
              <div className="pt-2 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Storage Rate:</span>
                  <span className="font-bold text-slate-900">₹{rateA.toFixed(2)}/kg/mo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Distance:</span>
                  <span className="font-semibold text-slate-800">{distanceA} km</span>
                </div>
                <div className="pt-2 border-t border-emerald-200 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Storage Charge:</span>
                    <span>₹{storageCostA.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Handling Fee:</span>
                    <span>₹{handlingA}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Transport:</span>
                    <span>₹{transportCostA}</span>
                  </div>
                  <div className="pt-1.5 border-t border-emerald-300 flex justify-between font-extrabold text-sm text-emerald-900">
                    <span>Real Total Cost:</span>
                    <span>₹{totalA.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Facility B: Distant */}
            <div className="p-4 rounded-2xl border border-slate-300 bg-slate-50 relative">
              <span className="absolute -top-3 left-4 bg-slate-700 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Facility B: Distant "Cheaper" Store
              </span>
              <div className="pt-2 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-600">Storage Rate:</span>
                  <span className="font-bold text-emerald-600">₹{rateB.toFixed(2)}/kg/mo (Looks cheap!)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Distance:</span>
                  <span className="font-semibold text-rose-600">{distanceB} km away</span>
                </div>
                <div className="pt-2 border-t border-slate-200 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>Storage Charge:</span>
                    <span>₹{storageCostB.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Handling Fee:</span>
                    <span>₹{handlingB}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. Transport:</span>
                    <span className="font-bold text-rose-700">₹{transportCostB}</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-300 flex justify-between font-extrabold text-sm text-slate-900">
                    <span>Real Total Cost:</span>
                    <span className={isNearerCheaper ? 'text-rose-700' : 'text-slate-900'}>
                      ₹{totalB.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Outcome Note */}
          <div className="text-center p-3 rounded-2xl bg-emerald-100/70 border border-emerald-300 text-xs font-bold text-emerald-900">
            {isNearerCheaper ? (
              <span>
                🎉 <strong>Nearby Facility A saves you ₹{difference.toLocaleString()} in net profit</strong>, despite having a slightly higher nominal storage charge!
              </span>
            ) : (
              <span>
                For high quantity over long durations, Facility B balances out after transport.
              </span>
            )}
          </div>

          {/* Footer action */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Close
            </button>
            <Link
              to="/storages"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <span>Explore Real Storages Near You</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
