import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import {
  MapPin,
  Thermometer,
  Scale,
  ShieldCheck,
  Star,
  Sparkles,
  Phone,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';

export default function StorageCard({ storage, onRequestStorage, onQuickCost }) {
  const { toggleCompare, isComparing } = useSearch();
  const comparing = isComparing(storage._id);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const {
    _id,
    name,
    city,
    distance = 8.5,
    availableCapacity,
    totalCapacity,
    temperatureMin,
    temperatureMax,
    acceptedCrops = [],
    minimumQuantity = 100,
    pricePerKg = 2.2,
    handlingCharge = 350,
    costBreakdown = {},
    matchScore = 90,
    isRecommended,
    isBestMatch,
    matchExplanation,
    verified,
    availability = 'Available',
    images = [],
    contactPhone,
    storageType,
    lastUpdated,
  } = storage;

  const imageUrl =
    images && images.length > 0
      ? images[0]
      : 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80';

  const totalCost = costBreakdown.totalCost || Math.round(pricePerKg * 500 + handlingCharge + distance * 25);
  const storageCost = costBreakdown.storageCost || Math.round(pricePerKg * 500);
  const transportCost = costBreakdown.transportCost || Math.round(distance * 25);

  return (
    <div className={`group relative rounded-3xl bg-white border transition-all duration-200 overflow-hidden shadow-sm hover:shadow-xl ${
      isBestMatch
        ? 'border-emerald-500/80 ring-2 ring-emerald-500/20'
        : isRecommended
        ? 'border-emerald-300'
        : 'border-slate-200 hover:border-slate-300'
    }`}>
      {/* Top Match Ribbon */}
      <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          {isBestMatch ? (
            <span className="inline-flex items-center gap-1 font-extrabold text-emerald-800 bg-emerald-100/90 px-2.5 py-0.5 rounded-full text-[11px] shadow-2xs">
              <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500" />
              ⭐ Best Match ({matchScore}%)
            </span>
          ) : isRecommended ? (
            <span className="inline-flex items-center gap-1 font-bold text-teal-800 bg-teal-100/80 px-2.5 py-0.5 rounded-full text-[11px]">
              ⭐ Recommended ({matchScore}%)
            </span>
          ) : (
            <span className="text-slate-600 font-semibold text-[11px]">
              Match Score: <strong className="text-slate-800">{matchScore}%</strong>
            </span>
          )}

          {verified && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200/50">
              <ShieldCheck className="w-3 h-3 text-sky-600" />
              Verified Facility
            </span>
          )}
        </div>

        {/* Compare Checkbox */}
        <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-semibold text-slate-600 hover:text-emerald-700">
          <input
            type="checkbox"
            checked={comparing}
            onChange={() => toggleCompare(storage)}
            className="w-3.5 h-3.5 rounded-sm text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
          <span>Compare</span>
        </label>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex flex-col md:flex-row gap-5">
          {/* Facility Photo */}
          <div className="w-full md:w-52 h-44 md:h-auto rounded-2xl overflow-hidden relative shrink-0 bg-slate-100">
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Status Pill */}
            <div className="absolute top-2.5 left-2.5">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-xs ${
                availability === 'Available'
                  ? 'bg-emerald-600 text-white'
                  : availability === 'Limited'
                  ? 'bg-amber-500 text-white'
                  : 'bg-rose-500 text-white'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                {availability}
              </span>
            </div>

            {/* Distance badge */}
            <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>{distance} km away</span>
            </div>
          </div>

          {/* Details Column */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Name and Rating */}
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                    <Link to={`/storages/${_id}`}>{name}</Link>
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <span className="font-medium text-slate-700">{city}</span> • {storageType}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-lg text-xs font-bold text-amber-900 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{storage.rating || 4.8}</span>
                </div>
              </div>

              {/* Match Explanation Badge */}
              {matchExplanation && (
                <div className="mb-3.5 p-2 rounded-xl bg-emerald-50/70 border border-emerald-100 text-[11px] font-medium text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{matchExplanation}</span>
                </div>
              )}

              {/* Facility Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3.5">
                {/* Available Capacity */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Available Space
                  </span>
                  <span className="text-xs font-extrabold text-slate-900">
                    {(availableCapacity / 1000).toLocaleString()} MT
                  </span>
                  <span className="text-[10px] text-emerald-700 block">
                    ({availableCapacity.toLocaleString()} kg)
                  </span>
                </div>

                {/* Temperature Range */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Temperature
                  </span>
                  <span className="text-xs font-extrabold text-sky-700">
                    {temperatureMin}°C to {temperatureMax}°C
                  </span>
                  <span className="text-[10px] text-slate-400 block">Multi-zone</span>
                </div>

                {/* Storage Base Rate */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Storage Rate
                  </span>
                  <span className="text-xs font-extrabold text-slate-900">
                    ₹{pricePerKg.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 block">per kg / month</span>
                </div>

                {/* Handling & Min Qty */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Handling Fee
                  </span>
                  <span className="text-xs font-extrabold text-slate-900">
                    ₹{handlingCharge}
                  </span>
                  <span className="text-[10px] text-slate-400 block">Min: {minimumQuantity} kg</span>
                </div>
              </div>

              {/* Accepted Crops Tags */}
              <div className="flex items-center gap-1.5 flex-wrap mb-4">
                <span className="text-[11px] font-bold text-slate-400">Accepted:</span>
                {acceptedCrops.slice(0, 5).map((crop) => (
                  <span
                    key={crop}
                    className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                  >
                    {crop}
                  </span>
                ))}
                {acceptedCrops.length > 5 && (
                  <span className="text-[10px] font-bold text-slate-400">
                    +{acceptedCrops.length - 5} more
                  </span>
                )}
              </div>
            </div>

            {/* Bottom Row: Transparent Total Cost + Action Buttons */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Cost Highlight */}
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[11px] text-slate-500 font-medium">Estimated Total:</span>
                  <span className="text-lg font-black text-slate-900">
                    ₹{totalCost.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="text-[11px] text-emerald-700 font-bold hover:underline ml-1"
                  >
                    {showBreakdown ? 'Hide Breakdown' : 'View Breakdown ℹ️'}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Updated 2 hours ago
                  </span>
                  <span>•</span>
                  <span>Includes storage + handling + transport</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${contactPhone || '+919898023456'}`}
                  className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                  title="Contact Owner Directly"
                >
                  <Phone className="w-4 h-4" />
                </a>

                <Link
                  to={`/storages/${_id}`}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors"
                >
                  View Details
                </Link>

                <button
                  onClick={() => onRequestStorage(storage)}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Request Storage</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Expandable Transparent Cost Breakdown Accordion */}
            {showBreakdown && (
              <div className="mt-3 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs animate-in fade-in duration-200">
                <div className="flex items-center justify-between font-bold text-amber-950 mb-2">
                  <span>Transparent Cost Calculation:</span>
                  <span className="text-[10px] font-normal text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Zero Hidden Costs
                  </span>
                </div>
                <div className="space-y-1 text-slate-700 text-[11px]">
                  <div className="flex justify-between">
                    <span>Base Cold Storage ({costBreakdown.quantity || 500} kg × ₹{pricePerKg}/kg):</span>
                    <span className="font-semibold text-slate-900">₹{storageCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Handling, Unloading & Labor (Mandatory fee):</span>
                    <span className="font-semibold text-slate-900">₹{handlingCharge}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Transport ({distance} km @ ₹{storage.transportRatePerKm || 25}/km):</span>
                    <span className="font-semibold text-slate-900">₹{transportCost}</span>
                  </div>
                  <div className="pt-1.5 mt-1 border-t border-amber-200 flex justify-between font-bold text-slate-900 text-xs">
                    <span>Real Total Outlay:</span>
                    <span className="text-emerald-800 font-extrabold">₹{totalCost.toLocaleString()}</span>
                  </div>
                </div>
                <p className="text-[10px] text-amber-800 italic mt-2">
                  💡 <strong>Startup Insight:</strong> Lowest storage price isn't always the lowest total cost when transport & handling are factored in.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
