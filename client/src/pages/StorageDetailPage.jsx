import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import BookingModal from '../components/BookingModal';
import CostCalculatorModal from '../components/CostCalculatorModal';
import api from '../services/api';
import {
  MapPin,
  Thermometer,
  Scale,
  ShieldCheck,
  Star,
  Phone,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Truck,
  DollarSign,
  ArrowLeft,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';

export default function StorageDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { searchCriteria, toggleCompare, isComparing } = useSearch();

  const [storage, setStorage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [customQty, setCustomQty] = useState(searchCriteria.quantity || 500);
  const [customMonths, setCustomMonths] = useState(1);

  useEffect(() => {
    fetchStorageDetail();
  }, [id]);

  const fetchStorageDetail = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/storages/${id}`, {
        params: {
          crop: searchCriteria.crop,
          quantity: customQty,
          city: searchCriteria.city,
          duration: customMonths * 30,
        },
      });
      if (res.data.success) {
        setStorage(res.data.storage);
      }
    } catch (err) {
      console.error('Failed to load storage details:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!storage) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 space-y-4">
        <div className="text-xl font-bold text-slate-800">Storage facility not found</div>
        <Link to="/storages" className="px-5 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-sm">
          Return to All Storages
        </Link>
      </div>
    );
  }

  const {
    name,
    tagline,
    address,
    city,
    district,
    state,
    latitude,
    longitude,
    storageType,
    totalCapacity,
    availableCapacity,
    temperatureMin,
    temperatureMax,
    humidityMin,
    humidityMax,
    acceptedCrops = [],
    minimumQuantity = 100,
    pricePerKg = 2.2,
    handlingCharge = 350,
    transportRatePerKm = 25,
    storageDuration,
    paymentTerms,
    damagePolicy,
    operatingHours,
    contactPhone,
    contactEmail,
    rating = 4.8,
    reviewsCount = 28,
    verified,
    availability = 'Available',
    images = [],
    features = [],
    matchScore = 92,
    matchExplanation,
    distance = 7.4,
  } = storage;

  const comparing = isComparing(storage._id);

  // Dynamic cost based on local inputs
  const calculatedStorageCost = Math.round(pricePerKg * customQty * customMonths);
  const calculatedTransportCost = Math.round(distance * transportRatePerKm);
  const calculatedTotal = calculatedStorageCost + handlingCharge + calculatedTransportCost;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link to="/" className="hover:text-emerald-700">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link to="/storages" className="hover:text-emerald-700">Gujarat Storages</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-800 truncate max-w-xs">{name}</span>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-emerald-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs mb-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  availability === 'Available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  ● {availability}
                </span>

                {verified && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                    Verified Facility
                  </span>
                )}

                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  {rating} ({reviewsCount} farmer reviews)
                </span>

                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-700 text-white flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {matchScore}% Match Score
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{name}</h1>
              <p className="text-xs text-slate-500">{tagline}</p>
              <p className="text-xs text-slate-600 flex items-center gap-1.5 pt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{address}, {city}, {state} ({distance} km from your registered point)</span>
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => toggleCompare(storage)}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                  comparing
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{comparing ? 'In Compare List' : 'Compare'}</span>
              </button>

              <a
                href={`tel:${contactPhone}`}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Call Owner</span>
              </a>

              <button
                onClick={() => setIsBookingOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 hover:scale-[1.02] transition-all cursor-pointer"
              >
                Request Storage Space
              </button>
            </div>
          </div>
        </div>

        {/* Gallery & Quick Specs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Photos (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="h-80 sm:h-96 rounded-3xl overflow-hidden bg-slate-900 relative shadow-md">
              <img
                src={images[activeImage] || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80'}
                alt={name}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/75 text-white text-xs px-3 py-1 rounded-lg backdrop-blur-xs">
                {storageType}
              </div>
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImage === i ? 'border-emerald-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Live Total Cost Simulator for this facility */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="font-extrabold text-sm text-slate-900">
                  Instant Cost Calculator
                </h3>
                <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-bold">
                  Zero Hidden Charges
                </span>
              </div>

              {/* Quantity input */}
              <div className="space-y-3 text-xs mb-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Your Produce Quantity (kg)
                  </label>
                  <input
                    type="number"
                    min={minimumQuantity}
                    step="50"
                    value={customQty}
                    onChange={(e) => setCustomQty(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-400">
                    Min requirement: {minimumQuantity} kg
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Storage Duration (Months)
                  </label>
                  <select
                    value={customMonths}
                    onChange={(e) => setCustomMonths(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                  >
                    <option value="0.5">15 Days (0.5 Mo)</option>
                    <option value="1">30 Days (1 Mo)</option>
                    <option value="2">60 Days (2 Mos)</option>
                    <option value="3">90 Days (3 Mos)</option>
                    <option value="6">180 Days (6 Mos)</option>
                  </select>
                </div>
              </div>

              {/* Transparent calculation breakdown */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-2">
                <div className="flex justify-between text-slate-700">
                  <span>Chamber Rent (₹{pricePerKg}/kg/mo):</span>
                  <span className="font-semibold text-slate-900">₹{calculatedStorageCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Handling & Unloading:</span>
                  <span className="font-semibold text-slate-900">₹{handlingCharge}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Est. Transport ({distance} km @ ₹{transportRatePerKm}/km):</span>
                  <span className="font-semibold text-slate-900">₹{calculatedTransportCost}</span>
                </div>
                <div className="pt-2 border-t border-amber-200/80 flex justify-between font-extrabold text-slate-900 text-sm">
                  <span>Total Estimated Outlay:</span>
                  <span className="text-emerald-800 text-base">₹{calculatedTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setIsBookingOpen(true)}
                className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-700/25 transition-all cursor-pointer"
              >
                Send Request for ₹{calculatedTotal.toLocaleString()}
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Facility Specs & Policies */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Specifications (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Core Specs */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Technical Specifications & Refrigeration
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Temperature Range</span>
                  <span className="font-extrabold text-sm text-sky-700">{temperatureMin}°C to {temperatureMax}°C</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Humidity Control</span>
                  <span className="font-extrabold text-sm text-slate-800">{humidityMin}% - {humidityMax}% RH</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Available Capacity</span>
                  <span className="font-extrabold text-sm text-emerald-700">{(availableCapacity / 1000).toLocaleString()} MT</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Total Facility Size</span>
                  <span className="font-extrabold text-sm text-slate-800">{(totalCapacity / 1000).toLocaleString()} MT</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Operating Hours</span>
                  <span className="font-extrabold text-sm text-slate-800">{operatingHours}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Duration Allowed</span>
                  <span className="font-extrabold text-sm text-slate-800">{storageDuration}</span>
                </div>
              </div>

              {/* Accepted Crops */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Accepted Crops with Multi-Zone Chambers
                </h3>
                <div className="flex flex-wrap gap-2">
                  {acceptedCrops.map((c) => (
                    <span
                      key={c}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Special Features */}
              {features && features.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                    Infrastructure & Facility Highlights
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                    {features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Trust Policies */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Commercial Terms & Spoilage Responsibility
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Damage & Spoilage Policy</h4>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    {damagePolicy}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Payment & Billing Terms</h4>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    {paymentTerms}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Map Visual (1 col) */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                Facility Location & Route
              </h2>

              {/* Map visual card */}
              <div className="h-52 rounded-2xl bg-emerald-950 text-white relative overflow-hidden flex flex-col justify-between p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-300">Gujarat Agro Corridor</span>
                  <span className="bg-emerald-800/80 px-2 py-0.5 rounded-md text-[10px]">
                    Lat: {latitude} • Lng: {longitude}
                  </span>
                </div>

                <div className="text-center my-auto">
                  <MapPin className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
                  <div className="font-bold text-sm mt-1">{city}, Gujarat</div>
                  <div className="text-[11px] text-emerald-200">{distance} km transit distance</div>
                </div>

                <a
                  href={`https://maps.google.com/?q=${latitude},${longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-center text-xs font-bold text-white transition-colors"
                >
                  Open in Google Maps ↗
                </a>
              </div>

              {/* Contact Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="font-bold text-slate-800">Facility Operations Contact</div>
                <div className="text-slate-600">Phone: <strong>{contactPhone}</strong></div>
                {contactEmail && <div className="text-slate-600">Email: {contactEmail}</div>}
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-200">
                  Gate clearance available 24x7 for pre-registered loads during harvest season.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {isBookingOpen && (
        <BookingModal
          isOpen={isBookingOpen}
          storage={storage}
          onClose={() => setIsBookingOpen(false)}
        />
      )}
    </div>
  );
}
