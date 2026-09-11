import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import StorageCard from '../components/StorageCard';
import BookingModal from '../components/BookingModal';
import CompareDrawer from '../components/CompareDrawer';
import CostCalculatorModal from '../components/CostCalculatorModal';
import api from '../services/api';
import {
  Filter,
  ArrowUpDown,
  Search,
  Sparkles,
  MapPin,
  Wheat,
  Scale,
  Calendar,
  Layers,
  X,
  SlidersHorizontal,
  ChevronDown,
  Info,
  CheckCircle2,
  Building2,
} from 'lucide-react';

const GUJARAT_CITIES = [
  'All Gujarat',
  'Ahmedabad',
  'Sanand',
  'Bavla',
  'Gandhinagar',
  'Kadi',
  'Anand',
  'Dholka',
];

export default function StorageResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchCriteria, updateSearch, compareList } = useSearch();

  // Active query parameters
  const cropParam = searchParams.get('crop') || searchCriteria.crop || 'Tomato';
  const cityParam = searchParams.get('city') || searchCriteria.city || 'Ahmedabad';
  const qtyParam = searchParams.get('quantity') || searchCriteria.quantity || 500;
  const durationParam = searchParams.get('duration') || searchCriteria.duration || 30;

  // Filter & Sort States
  const [selectedCity, setSelectedCity] = useState(cityParam);
  const [selectedCrop, setSelectedCrop] = useState(cropParam);
  const [maxDistance, setMaxDistance] = useState(50);
  const [maxPrice, setMaxPrice] = useState(3.5);
  const [minCapacity, setMinCapacity] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');

  const [storages, setStorages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStorageForBooking, setSelectedStorageForBooking] = useState(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  useEffect(() => {
    fetchStorages();
  }, [selectedCity, selectedCrop, maxDistance, maxPrice, minCapacity, verifiedOnly, sortBy, qtyParam, durationParam]);

  const fetchStorages = async () => {
    setLoading(true);
    try {
      const cityQuery = selectedCity === 'All Gujarat' ? '' : selectedCity;
      const res = await api.get('/storages', {
        params: {
          crop: selectedCrop,
          quantity: qtyParam,
          city: cityQuery,
          duration: durationParam,
          maxDistance,
          maxPrice,
          minCapacity: minCapacity > 0 ? minCapacity : undefined,
          verifiedOnly: verifiedOnly ? 'true' : undefined,
          sortBy,
        },
      });

      if (res.data.success) {
        setStorages(res.data.storages);
      }
    } catch (err) {
      console.error('Error fetching storages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSelectedCity('Ahmedabad');
    setSelectedCrop('Tomato');
    setMaxDistance(50);
    setMaxPrice(3.5);
    setMinCapacity(0);
    setVerifiedOnly(false);
    setSortBy('recommended');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white py-8 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-2">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Smart Cold Storage Match Results</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {storages.length} Cold Storages Found Near You
              </h1>
              <p className="text-xs text-emerald-200/90 mt-1">
                Displaying facilities matching crop, temperature, capacity, and transport distance.
              </p>
            </div>

            {/* Active search chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                <span>Location: <strong>{selectedCity}</strong></span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-1.5">
                <Wheat className="w-3.5 h-3.5 text-amber-300" />
                <span>Crop: <strong>{selectedCrop}</strong></span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-sky-300" />
                <span>Qty: <strong>{qtyParam} kg</strong></span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                <span>Duration: <strong>{durationParam} days</strong></span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Filter Sidebar + Storage Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Top Control Bar: Sort and Mobile filter toggle */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              className="lg:hidden px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>

            <span className="text-xs text-slate-500 hidden sm:inline">
              Showing <strong className="text-slate-800">{storages.length}</strong> available facilities
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Launch Calculator button */}
            <button
              onClick={() => setIsCalculatorOpen(true)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200/60 flex items-center gap-1.5 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Total Cost Calculator</span>
            </button>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-semibold hidden md:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-700 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
              >
                <option value="recommended">⭐ Recommended (Smart Match)</option>
                <option value="distance">📍 Nearest Distance</option>
                <option value="price_asc">💰 Lowest Total Cost</option>
                <option value="capacity_desc">📦 Highest Capacity</option>
                <option value="rating">⭐ Customer Rating</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* FILTER SIDEBAR (Desktop & Mobile Drawer) */}
          <aside className={`lg:block ${showMobileFilter ? 'block mb-6' : 'hidden'} lg:sticky lg:top-24`}>
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 font-black text-sm text-slate-900">
                  <Filter className="w-4 h-4 text-emerald-600" />
                  <span>Filter Facilities</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs text-slate-400 hover:text-emerald-700 underline"
                >
                  Reset
                </button>
              </div>

              {/* City Hub Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Gujarat Hub Location
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {GUJARAT_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Crop Filter */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Accepted Crop
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  {['Tomato', 'Potato', 'Onion', 'Mango', 'Apple', 'Banana', 'Grapes', 'Chilli', 'Carrot'].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Distance Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Max Distance:</span>
                  <span className="text-emerald-700">{maxDistance} km</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  step="5"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>5 km</span>
                  <span>40 km</span>
                  <span>80 km</span>
                </div>
              </div>

              {/* Price Range Slider */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Max Storage Rate:</span>
                  <span className="text-emerald-700">₹{maxPrice.toFixed(2)}/kg/mo</span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="4.0"
                  step="0.1"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>₹1.50</span>
                  <span>₹2.75</span>
                  <span>₹4.00</span>
                </div>
              </div>

              {/* Minimum Capacity Filter */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Available Capacity Filter
                </label>
                <select
                  value={minCapacity}
                  onChange={(e) => setMinCapacity(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                >
                  <option value="0">Any Available Space</option>
                  <option value="500000">At least 500 MT (5L kg)</option>
                  <option value="1000000">At least 1,000 MT (10L kg)</option>
                  <option value="2000000">At least 2,000 MT (20L kg)</option>
                </select>
              </div>

              {/* Verified Only Toggle */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-700">
                    Show Verified Only ✓
                  </span>
                </label>
                <p className="text-[10px] text-slate-400 mt-1 pl-6">
                  Inspected backup power & valid crop insurance.
                </p>
              </div>
            </div>
          </aside>

          {/* STORAGE RESULTS LIST */}
          <main className="lg:col-span-3 space-y-5">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-64 rounded-3xl bg-slate-200 animate-pulse"></div>
                ))}
              </div>
            ) : storages.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
                  <Building2 className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  No storages matching active filter constraints
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try broadening your distance slider or resetting storage price filters to view facilities across neighboring Gujarat districts.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-md"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              storages.map((storage) => (
                <StorageCard
                  key={storage._id}
                  storage={storage}
                  onRequestStorage={(s) => setSelectedStorageForBooking(s)}
                />
              ))
            )}
          </main>
        </div>
      </div>

      {/* Floating Compare Action Bar when items selected */}
      {compareList.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              <div className="text-xs">
                <span className="font-bold">{compareList.length} Storages</span> selected to compare
              </div>
            </div>
            <button
              onClick={() => setIsCompareOpen(true)}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Compare Now
            </button>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedStorageForBooking && (
        <BookingModal
          isOpen={!!selectedStorageForBooking}
          storage={selectedStorageForBooking}
          onClose={() => setSelectedStorageForBooking(null)}
          onSuccess={() => {
            fetchStorages();
          }}
        />
      )}

      {/* Compare Modal Drawer */}
      <CompareDrawer
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        onRequestStorage={(s) => setSelectedStorageForBooking(s)}
      />

      {/* Cost Calculator Modal */}
      <CostCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />
    </div>
  );
}
