import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import {
  MapPin,
  Wheat,
  Scale,
  Thermometer,
  Calendar,
  Search,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

const GUJARAT_HUBS = [
  'Ahmedabad',
  'Sanand',
  'Bavla',
  'Gandhinagar',
  'Kadi',
  'Anand',
  'Dholka',
  'Naroda',
  'Rajkot',
];

export default function HeroSearchCard({ className = '' }) {
  const { searchCriteria, updateSearch, cropsData } = useSearch();
  const navigate = useNavigate();

  const [crop, setCrop] = useState(searchCriteria.crop || 'Tomato');
  const [city, setCity] = useState(searchCriteria.city || 'Ahmedabad');
  const [quantity, setQuantity] = useState(searchCriteria.quantity || 500);
  const [duration, setDuration] = useState(searchCriteria.duration || 30);
  const [temperature, setTemperature] = useState(searchCriteria.temperature || '8°C - 13°C');

  // Auto-update temperature recommendation when crop changes
  useEffect(() => {
    if (cropsData[crop]) {
      const profile = cropsData[crop];
      setTemperature(`${profile.tempMin}°C - ${profile.tempMax}°C`);
    }
  }, [crop, cropsData]);

  const handleSearch = (e) => {
    e.preventDefault();
    updateSearch({
      crop,
      city,
      quantity: Number(quantity),
      duration: Number(duration),
      temperature,
    });
    navigate(
      `/storages?crop=${encodeURIComponent(crop)}&city=${encodeURIComponent(
        city
      )}&quantity=${quantity}&duration=${duration}`
    );
  };

  const handleQuickCropSelect = (selectedCrop) => {
    setCrop(selectedCrop);
    if (cropsData[selectedCrop]) {
      const profile = cropsData[selectedCrop];
      setTemperature(`${profile.tempMin}°C - ${profile.tempMax}°C`);
      if (profile.typicalQty) {
        setQuantity(profile.typicalQty);
      }
    }
  };

  return (
    <div className={`w-full max-w-4xl mx-auto rounded-3xl bg-white/95 backdrop-blur-xl border border-emerald-100/80 shadow-2xl shadow-emerald-950/10 p-4 sm:p-7 transition-all ${className}`}>
      {/* Quick Crop Selection Chips */}
      <div className="mb-5 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick Select Harvest:
          </span>
          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            Optimal temp auto-calibrated
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {Object.keys(cropsData).map((c) => {
            const isSelected = crop === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => handleQuickCropSelect(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105'
                    : 'bg-slate-100/90 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
                }`}
              >
                <span>{c}</span>
                {isSelected && <span className="text-[10px] opacity-80">({cropsData[c]?.tempMin}° to {cropsData[c]?.tempMax}°C)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Fields */}
      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-5">
          {/* Location */}
          <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-200/80 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
            <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mb-1 uppercase tracking-wider">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Location
            </label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-transparent font-semibold text-slate-800 text-sm focus:outline-hidden cursor-pointer"
            >
              {GUJARAT_HUBS.map((h) => (
                <option key={h} value={h}>
                  {h}, Gujarat
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 block mt-0.5">Nearby storage hubs</span>
          </div>

          {/* Crop */}
          <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-200/80 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
            <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mb-1 uppercase tracking-wider">
              <Wheat className="w-3.5 h-3.5 text-amber-600" />
              Crop
            </label>
            <select
              value={crop}
              onChange={(e) => handleQuickCropSelect(e.target.value)}
              className="w-full bg-transparent font-semibold text-slate-800 text-sm focus:outline-hidden cursor-pointer"
            >
              {Object.keys(cropsData).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400 block mt-0.5">Produce type</span>
          </div>

          {/* Quantity */}
          <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-200/80 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
            <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mb-1 uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              Quantity (kg)
            </label>
            <div className="flex items-center">
              <input
                type="number"
                min="50"
                step="50"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-transparent font-semibold text-slate-800 text-sm focus:outline-hidden"
                placeholder="500"
              />
              <span className="text-xs font-bold text-slate-400 ml-1">kg</span>
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {(Number(quantity) / 1000).toFixed(1)} Metric Ton
            </span>
          </div>

          {/* Temperature Range (Smart Calibrated) */}
          <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-200/80 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
            <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mb-1 uppercase tracking-wider">
              <Thermometer className="w-3.5 h-3.5 text-sky-600" />
              Req. Temp
            </label>
            <input
              type="text"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="w-full bg-transparent font-semibold text-slate-800 text-sm focus:outline-hidden"
              placeholder="2°C - 8°C"
            />
            <span className="text-[10px] text-sky-600 font-medium block mt-0.5">
              Ideal for {crop}
            </span>
          </div>

          {/* Duration */}
          <div className="bg-slate-50/90 p-3 rounded-2xl border border-slate-200/80 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
            <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mb-1 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-transparent font-semibold text-slate-800 text-sm focus:outline-hidden cursor-pointer"
            >
              <option value="15">15 Days</option>
              <option value="30">30 Days (1 Mo)</option>
              <option value="60">60 Days (2 Mos)</option>
              <option value="90">90 Days (3 Mos)</option>
              <option value="180">180 Days (6 Mos)</option>
            </select>
            <span className="text-[10px] text-slate-400 block mt-0.5">Storage period</span>
          </div>
        </div>

        {/* Submit Bar & Real-time summary */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
            <span>
              Searching <strong className="text-slate-800">8+ verified cold facilities</strong> around {city}
            </span>
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white font-bold text-sm shadow-lg shadow-emerald-700/25 hover:shadow-xl hover:shadow-emerald-700/35 hover:scale-[1.02] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Search className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
            <span>Find Suitable Storage</span>
            <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </form>
    </div>
  );
}
