import React from 'react';
import { useSearch } from '../context/SearchContext';
import {
  X,
  Layers,
  Thermometer,
  Scale,
  DollarSign,
  Truck,
  ShieldCheck,
  Star,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function CompareDrawer({ isOpen, onClose, onRequestStorage }) {
  const { compareList, removeCompare, clearCompare } = useSearch();

  if (!isOpen || compareList.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">
                Side-by-Side Facility Comparison
              </h3>
              <p className="text-xs text-slate-400">
                Comparing {compareList.length} selected cold storages
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={clearCompare}
              className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="p-6 overflow-x-auto flex-1">
          <div className="grid grid-cols-4 gap-4 min-w-[640px]">
            {/* Metric Labels Column */}
            <div className="space-y-4 pt-28 font-semibold text-xs text-slate-500 border-r border-slate-100 pr-3">
              <div className="h-10 flex items-center">Smart Match Score</div>
              <div className="h-10 flex items-center">Distance from Farm</div>
              <div className="h-10 flex items-center">Available Capacity</div>
              <div className="h-10 flex items-center">Temperature Range</div>
              <div className="h-10 flex items-center">Storage Rate</div>
              <div className="h-10 flex items-center">Handling & Loading</div>
              <div className="h-10 flex items-center">Est. Transport</div>
              <div className="h-12 flex items-center font-bold text-slate-900 bg-slate-50 px-2 rounded-lg">
                Estimated Total Outlay
              </div>
              <div className="h-10 flex items-center">Verification & Rating</div>
              <div className="h-12 flex items-center">Action</div>
            </div>

            {/* Storage Cards Columns */}
            {compareList.map((storage) => {
              const totalCost = storage.costBreakdown?.totalCost || 2000;
              const storageCost = storage.costBreakdown?.storageCost || 1200;
              const transportCost = storage.costBreakdown?.transportCost || 350;

              return (
                <div
                  key={storage._id}
                  className="space-y-4 rounded-2xl border border-slate-200 p-4 bg-slate-50/50 flex flex-col justify-between"
                >
                  {/* Card Header with image */}
                  <div className="h-24 relative">
                    <button
                      onClick={() => removeCompare(storage._id)}
                      className="absolute top-1 right-1 z-10 w-6 h-6 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                      title="Remove from comparison"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <h4 className="font-bold text-sm text-slate-900 line-clamp-2 pr-6">
                      {storage.name}
                    </h4>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {storage.city}, Gujarat
                    </span>
                  </div>

                  {/* Match Score */}
                  <div className="h-10 flex items-center">
                    <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800">
                      ⭐ {storage.matchScore || 92}% Match
                    </span>
                  </div>

                  {/* Distance */}
                  <div className="h-10 flex items-center font-bold text-slate-800 text-xs">
                    {storage.distance || 7.5} km away
                  </div>

                  {/* Capacity */}
                  <div className="h-10 flex items-center text-xs font-semibold text-slate-700">
                    {(storage.availableCapacity / 1000).toLocaleString()} MT free
                  </div>

                  {/* Temperature */}
                  <div className="h-10 flex items-center text-xs font-bold text-sky-700">
                    {storage.temperatureMin}°C to {storage.temperatureMax}°C
                  </div>

                  {/* Rate */}
                  <div className="h-10 flex items-center text-xs font-semibold text-slate-800">
                    ₹{storage.pricePerKg}/kg/mo
                  </div>

                  {/* Handling */}
                  <div className="h-10 flex items-center text-xs font-semibold text-slate-800">
                    ₹{storage.handlingCharge}
                  </div>

                  {/* Transport */}
                  <div className="h-10 flex items-center text-xs font-semibold text-slate-800">
                    ₹{transportCost}
                  </div>

                  {/* Total Cost */}
                  <div className="h-12 flex items-center font-extrabold text-sm text-emerald-800 bg-emerald-50 px-3 rounded-lg border border-emerald-200">
                    ₹{totalCost.toLocaleString()}
                  </div>

                  {/* Rating */}
                  <div className="h-10 flex items-center gap-1.5 text-xs">
                    <span className="font-bold text-slate-800">⭐ {storage.rating || 4.8}</span>
                    {storage.verified && (
                      <span className="text-[10px] text-sky-700 font-bold bg-sky-50 px-1.5 py-0.5 rounded-sm">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  {/* Action button */}
                  <div className="h-12 flex items-center">
                    <button
                      onClick={() => {
                        onClose();
                        onRequestStorage(storage);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Request</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
