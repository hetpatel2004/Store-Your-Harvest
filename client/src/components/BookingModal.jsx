import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import api from '../services/api';
import {
  X,
  Send,
  CheckCircle2,
  Calendar,
  Scale,
  Wheat,
  Thermometer,
  ShieldCheck,
  AlertCircle,
  Truck,
  DollarSign,
  KeyRound,
  ArrowRight,
  UserCheck,
  Lock,
  Video,
  Snowflake,
  MapPin,
  Navigation,
} from 'lucide-react';
import { resolveDistanceKm } from '../utils/geoUtils';

export default function BookingModal({ isOpen, onClose, storage, onSuccess }) {
  const { user, isAuthenticated, login, register } = useAuth();
  const { searchCriteria } = useSearch();
  const navigate = useNavigate();

  // Booking Form State
  const [farmerName, setFarmerName] = useState(user ? user.name : '');
  const [farmerPhone, setFarmerPhone] = useState(user ? user.phone : '');
  const [crop, setCrop] = useState(searchCriteria.crop || (storage?.acceptedCrops?.[0] || 'Tomato'));
  const [quantity, setQuantity] = useState(searchCriteria.quantity || 500);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [durationDays, setDurationDays] = useState(searchCriteria.duration || 30);
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [extraServices, setExtraServices] = useState({
    cctvMonitoring: false, // 24/7 CCTV Camera Surveillance
    preCoolingTreatment: false,
    insurance: false,
  });
  // Transport Mode: 'none', 'pickup', 'drop', 'both'
  const [transportMode, setTransportMode] = useState('none');
  const [pickupDistanceKm, setPickupDistanceKm] = useState(storage?.distance || 10);
  const [dropDistanceKm, setDropDistanceKm] = useState(storage?.distance || 10);
  const [pickupAddress, setPickupAddress] = useState('');
  const [dropAddress, setDropAddress] = useState('');
  const [pickupWeightKg, setPickupWeightKg] = useState(searchCriteria.quantity || 500);
  const [cctvOption, setCctvOption] = useState('always'); // 'always' or 'custom'
  const [cctvDays, setCctvDays] = useState(searchCriteria.duration || 30);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle location text changes with live distance resolution
  const handlePickupAddressChange = (val) => {
    setPickupAddress(val);
    const resolved = resolveDistanceKm(val, storage?.latitude, storage?.longitude, storage?.city);
    setPickupDistanceKm(resolved);
  };

  const handleDropAddressChange = (val) => {
    setDropAddress(val);
    const resolved = resolveDistanceKm(val, storage?.latitude, storage?.longitude, storage?.city);
    setDropDistanceKm(resolved);
  };

  // Inline Auth State (when user is not logged in)
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authEmailOrPhone, setAuthEmailOrPhone] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authCity, setAuthCity] = useState('Ahmedabad');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Auto-sync user details if authentication changes
  useEffect(() => {
    if (user) {
      setFarmerName(user.name || '');
      setFarmerPhone(user.phone || '');
    }
  }, [user]);

  // Keep pickup weight synced with quantity
  useEffect(() => {
    if (quantity) {
      setPickupWeightKg(Number(quantity));
    }
  }, [quantity]);

  // Keep cctvDays synced with durationDays if always
  useEffect(() => {
    if (durationDays && cctvOption === 'always') {
      setCctvDays(Number(durationDays));
    }
  }, [durationDays, cctvOption]);

  if (!isOpen || !storage) return null;

  // Real-time cost calculations
  const qty = Number(quantity) || 500;
  const duration = Number(durationDays) || 30;
  const months = duration / 30;
  const storageCost = Math.round(storage.pricePerKg * qty * months);
  const handlingCost = storage.handlingCharge || 350;
  const baseTransitDist = storage.distance || 10;
  const standardTransportCost = Math.round(baseTransitDist * (storage.transportRatePerKm || 25));

  // Genuine Logistics Pricing Formula: Base ₹250 + (dist * 18) + (weight * 0.35)
  const pDist = Math.max(1, Number(pickupDistanceKm) || 10);
  const dDist = Math.max(1, Number(dropDistanceKm) || 10);
  const pWeight = Math.max(10, Number(pickupWeightKg) || qty || 100);
  const weightCharge = Math.round(pWeight * 0.35);

  const singlePickupFare = 250 + Math.round(pDist * 18) + weightCharge;
  const singleDropFare = 250 + Math.round(dDist * 18) + weightCharge;

  let transportTotalFare = 0;
  if (transportMode === 'pickup') {
    transportTotalFare = singlePickupFare;
  } else if (transportMode === 'drop') {
    transportTotalFare = singleDropFare;
  } else if (transportMode === 'both') {
    transportTotalFare = singlePickupFare + singleDropFare;
  }

  // CCTV Camera Surveillance: ₹1,000 / day with Always or Custom days option
  const effectiveCctvDays =
    cctvOption === 'custom' && Number(cctvDays) > 0
      ? Math.min(duration, Math.max(1, Number(cctvDays)))
      : duration;
  const cctvFare = effectiveCctvDays * 1000;

  let extraServicesCost = 0;
  if (transportMode !== 'none') extraServicesCost += transportTotalFare;
  if (extraServices.cctvMonitoring) extraServicesCost += cctvFare;
  if (extraServices.preCoolingTreatment) extraServicesCost += 250;
  if (extraServices.insurance) extraServicesCost += 300;

  const appliedTransportCost = transportMode !== 'none' ? 0 : standardTransportCost;
  const subtotal = storageCost + handlingCost + appliedTransportCost + extraServicesCost;
  const tax = Math.round(subtotal * 0.18);
  const totalCost = subtotal + tax;

  // Handle Inline Sign In / Registration
  const handleInlineAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'login') {
        await login(authEmailOrPhone, authPassword);
      } else {
        await register({
          name: authName,
          email: authEmailOrPhone,
          phone: authPhone,
          password: authPassword,
          role: 'farmer',
          city: authCity,
        });
      }
    } catch (err) {
      setAuthError(err.response?.data?.message || err.message || 'Authentication failed. Please check inputs.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDemoFarmerLogin = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      await login('ramesh@farmer.com', 'Farmer@123');
    } catch (err) {
      setAuthError('Demo login failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);

    try {
      const res = await api.post('/bookings', {
        storageId: storage._id,
        farmerName,
        farmerPhone,
        crop,
        quantity: qty,
        startDate,
        durationDays: duration,
        requiredTemp: `${storage.temperatureMin}°C - ${storage.temperatureMax}°C`,
        specialRequirements,
        distanceKm: pDist,
        extraServices: {
          transportGoods: transportMode !== 'none',
          transportMode,
          pickupDistanceKm: transportMode === 'pickup' || transportMode === 'both' ? pDist : 0,
          dropDistanceKm: transportMode === 'drop' || transportMode === 'both' ? dDist : 0,
          pickupWeightKg: pWeight,
          dropWeightKg: pWeight,
          pickupAddress: transportMode === 'pickup' || transportMode === 'both' ? pickupAddress : '',
          dropAddress: transportMode === 'drop' || transportMode === 'both' ? dropAddress : '',
          cctvMonitoring: extraServices.cctvMonitoring,
          cctvOption,
          cctvDays: effectiveCctvDays,
          preCoolingTreatment: extraServices.preCoolingTreatment,
          insurance: extraServices.insurance,
        },
      });

      if (res.data.success) {
        setSubmitted(true);
        if (onSuccess) onSuccess(res.data.booking);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to submit storage request. Please check inputs.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
              Cold Storage Reservation Request
            </span>
            <h3 className="text-lg font-bold">{storage.name}</h3>
            <p className="text-xs text-emerald-100">
              📍 {storage.city}, Gujarat • ₹{storage.pricePerKg}/kg/month
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. SUCCESS SCREEN */}
        {submitted ? (
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Storage Request Sent Successfully!
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your request has been dispatched to <strong>{storage.name}</strong>. You can view your live booking status, schedule delivery, and print verified invoices from your farmer dashboard.
            </p>

            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 max-w-sm mx-auto text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Crop & Quantity:</span>
                <span className="font-bold text-slate-800">{crop} ({qty} kg)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Arrival Date:</span>
                <span className="font-bold text-slate-800">{startDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Total:</span>
                <span className="font-extrabold text-emerald-700">₹{totalCost.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => {
                  onClose();
                  navigate('/farmer');
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Go to Farmer Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors cursor-pointer"
              >
                Close & Browse More
              </button>
            </div>
          </div>
        ) : !isAuthenticated ? (
          /* 2. AUTHENTICATION REQUIRED PROMPT (FARMER MUST LOGIN/REGISTER TO BOOK) */
          <div className="p-6 sm:p-8 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto shadow-sm">
                <Wheat className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="text-lg font-black text-slate-900">
                Farmer Sign In or Registration Required
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                You can browse and calculate storage costs freely without logging in. To officially reserve space at <strong>{storage.name}</strong>, please sign in or register below.
              </p>
            </div>

            {/* Auth Mode Tabs */}
            <div className="flex rounded-2xl bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                }}
                className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                  authMode === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sign In as Farmer
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setAuthError('');
                }}
                className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                  authMode === 'register' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                New Farmer Registration
              </button>
            </div>

            {/* Auth Error Banner */}
            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleInlineAuth} className="space-y-3.5 text-xs">
              {authMode === 'register' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Farmer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {authMode === 'login' ? 'Mobile Number or Email *' : 'Email Address *'}
                </label>
                <input
                  type="text"
                  required
                  value={authEmailOrPhone}
                  onChange={(e) => setAuthEmailOrPhone(e.target.value)}
                  placeholder={authMode === 'login' ? 'ramesh@farmer.com or +91 99090 12345' : 'farmer@email.com'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mobile Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    placeholder="+91 98980 XXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              )}

              {authMode === 'register' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">District / City *</label>
                  <select
                    value={authCity}
                    onChange={(e) => setAuthCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                  >
                    {['Ahmedabad', 'Sanand', 'Bavla', 'Gandhinagar', 'Kadi', 'Anand', 'Dholka', 'Rajkot', 'Mehsana'].map((c) => (
                      <option key={c} value={c}>{c}, Gujarat</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Password *</label>
                <input
                  type="password"
                  required
                  minLength="6"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>
                    {authLoading
                      ? 'Signing in...'
                      : authMode === 'login'
                      ? 'Sign In & Continue Booking'
                      : 'Create Farmer Account & Book'}
                  </span>
                </button>
              </div>

              {/* Instant One-Click Demo Farmer Button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Testing? Use demo account:</span>
                <button
                  type="button"
                  onClick={handleDemoFarmerLogin}
                  disabled={authLoading}
                  className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 hover:bg-amber-200 font-extrabold cursor-pointer transition-colors"
                >
                  ⚡ One-Click Farmer Login
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* 3. AUTHENTICATED FARMER BOOKING FORM */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Authenticated Farmer Badge */}
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Booking as registered farmer: <strong>{user?.name}</strong> ({user?.phone || user?.email})
                </span>
              </div>
              <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-2 py-0.5 rounded-full uppercase">
                Verified
              </span>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Farmer Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Farmer / Producer Name *
                </label>
                <input
                  type="text"
                  required
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mobile Number (for SMS confirmation) *
                </label>
                <input
                  type="tel"
                  required
                  value={farmerPhone}
                  onChange={(e) => setFarmerPhone(e.target.value)}
                  placeholder="+91 98980 XXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Crop selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Crop Type *
                </label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                >
                  {storage.acceptedCrops && storage.acceptedCrops.length > 0 ? (
                    storage.acceptedCrops.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))
                  ) : (
                    <option value="Tomato">Tomato</option>
                  )}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Quantity in kg * (Min: {storage.minimumQuantity || 100} kg)
                </label>
                <input
                  type="number"
                  required
                  min={storage.minimumQuantity || 50}
                  step="50"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Start Date */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Expected Intake Date *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                />
              </div>

              {/* Duration Days */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Storage Duration *
                </label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                >
                  <option value="15">15 Days</option>
                  <option value="30">30 Days (1 Month)</option>
                  <option value="60">60 Days (2 Months)</option>
                  <option value="90">90 Days (3 Months)</option>
                  <option value="180">180 Days (6 Months)</option>
                </select>
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Special Handling Requirements (Optional)
              </label>
              <textarea
                rows="2"
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                placeholder="e.g. In standard 20kg plastic crates, needs immediate pre-cooling"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              ></textarea>
            </div>

            {/* Value-Added Optional Services */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  Value-Added Optional Services
                </label>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 font-extrabold px-2 py-0.5 rounded-full">
                  Optional Add-ons
                </span>
              </div>

              {/* 1. Transport Logistics: None, Only Pickup, Only Drop, or Both */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  transportMode !== 'none'
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-400'
                    : 'border-slate-200 bg-slate-50/70'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <span className="font-extrabold text-slate-900 text-xs block">
                        Crops Transport Logistics (Optional)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Base ₹250/trip + ₹18/km + ₹0.35/kg payload • Genuine Mandi Freight
                      </span>
                    </div>
                  </div>
                  {transportMode !== 'none' && (
                    <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0 border border-emerald-300">
                      +₹{transportTotalFare.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Mode Selector 4 Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setTransportMode('none')}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center ${
                      transportMode === 'none'
                        ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    None / Self Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransportMode('pickup')}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center ${
                      transportMode === 'pickup'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                    }`}
                  >
                    🚜 Only Pickup
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransportMode('drop')}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center ${
                      transportMode === 'drop'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                    }`}
                  >
                    🚛 Only Drop
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransportMode('both')}
                    className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all cursor-pointer text-center ${
                      transportMode === 'both'
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                    }`}
                  >
                    🔄 Both (Pick & Drop)
                  </button>
                </div>

                {/* Conditional Fields based on Mode */}
                {transportMode !== 'none' && (
                  <div className="mt-3 pt-3 border-t border-emerald-200/60 space-y-3 text-xs">
                    {/* Pickup Address & km resolution */}
                    {(transportMode === 'pickup' || transportMode === 'both') && (
                      <div className="p-2.5 rounded-xl bg-white border border-emerald-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Farm Pickup Location / Village / Mandi:</span>
                          </label>
                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Trip 1: Farm → Storage
                          </span>
                        </div>
                        <input
                          type="text"
                          value={pickupAddress}
                          onChange={(e) => handlePickupAddressChange(e.target.value)}
                          placeholder="e.g. Sanand APMC, Bavla, Gondal, Deesa, etc."
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-600">Calculated Distance:</span>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="1"
                                value={pickupDistanceKm}
                                onChange={(e) => setPickupDistanceKm(Number(e.target.value))}
                                className="w-16 px-1.5 py-0.5 rounded border border-emerald-300 font-bold text-center text-xs bg-emerald-50/50"
                              />
                              <span className="font-bold text-emerald-800">km</span>
                            </div>
                          </div>
                          <span className="text-emerald-900 font-bold bg-emerald-100/70 px-2 py-0.5 rounded">
                            Fare: Base ₹250 + ₹{Math.round(pDist * 18)} (dist) + ₹{weightCharge} (wt) = ₹{singlePickupFare}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Drop Address & km resolution */}
                    {(transportMode === 'drop' || transportMode === 'both') && (
                      <div className="p-2.5 rounded-xl bg-white border border-emerald-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                            <Navigation className="w-3.5 h-3.5 text-teal-600" />
                            <span>Drop / Delivery Destination / Mandi / Buyer:</span>
                          </label>
                          <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            {transportMode === 'both' ? 'Trip 2: Storage → Mandi' : 'Trip: Storage → Mandi'}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={dropAddress}
                          onChange={(e) => handleDropAddressChange(e.target.value)}
                          placeholder="e.g. Naroda APMC Mandi, Rajkot, Surat, Ahmedabad..."
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                        <div className="flex flex-wrap items-center justify-between gap-2 text-[10px]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-600">Calculated Distance:</span>
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="1"
                                value={dropDistanceKm}
                                onChange={(e) => setDropDistanceKm(Number(e.target.value))}
                                className="w-16 px-1.5 py-0.5 rounded border border-emerald-300 font-bold text-center text-xs bg-emerald-50/50"
                              />
                              <span className="font-bold text-emerald-800">km</span>
                            </div>
                          </div>
                          <span className="text-emerald-900 font-bold bg-emerald-100/70 px-2 py-0.5 rounded">
                            Fare: Base ₹250 + ₹{Math.round(dDist * 18)} (dist) + ₹{weightCharge} (wt) = ₹{singleDropFare}
                          </span>
                        </div>
                      </div>
                    )}

                    {transportMode === 'both' && (
                      <div className="p-2 rounded-xl bg-emerald-100 text-emerald-950 text-xs flex justify-between items-center font-bold">
                        <span>Combined Transport (2 Trips: Pickup + Drop):</span>
                        <span className="font-black text-emerald-900">₹{singlePickupFare} + ₹{singleDropFare} = ₹{transportTotalFare}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3 Other Optional Value-Added Services */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 2. 24/7 CCTV Camera Surveillance */}
                <div
                  className={`p-3 rounded-2xl border transition-all ${
                    extraServices.cctvMonitoring
                      ? 'border-teal-500 bg-teal-50/80 shadow-xs ring-1 ring-teal-400'
                      : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
                  }`}
                >
                  <div
                    onClick={() =>
                      setExtraServices((prev) => ({ ...prev, cctvMonitoring: !prev.cctvMonitoring }))
                    }
                    className="flex items-start gap-2.5 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={extraServices.cctvMonitoring}
                      onChange={() => {}}
                      className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 pointer-events-none"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1">
                          <Video className="w-3.5 h-3.5 text-teal-700" />
                          24/7 CCTV Camera
                        </span>
                        <span className="text-[10px] font-extrabold text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded shrink-0">
                          ₹1,000/day
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        Dedicated chamber surveillance feed for crop bays.
                      </p>
                    </div>
                  </div>

                  {extraServices.cctvMonitoring && (
                    <div className="mt-3 pt-2 border-t border-teal-200/60 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setCctvOption('always')}
                          className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            cctvOption === 'always'
                              ? 'bg-teal-700 text-white border-teal-700'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-teal-50'
                          }`}
                        >
                          Always ({duration}d)
                        </button>
                        <button
                          type="button"
                          onClick={() => setCctvOption('custom')}
                          className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            cctvOption === 'custom'
                              ? 'bg-teal-700 text-white border-teal-700'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-teal-50'
                          }`}
                        >
                          Custom Days
                        </button>
                      </div>

                      {cctvOption === 'custom' && (
                        <div>
                          <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                            Surveillance Days (Max {duration})
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={duration}
                            value={cctvDays}
                            onChange={(e) => setCctvDays(Number(e.target.value))}
                            className="w-full px-2 py-1 rounded-lg border border-teal-300 text-xs bg-white"
                          />
                        </div>
                      )}

                      <div className="p-1.5 rounded-lg bg-teal-100/70 text-teal-900 text-[10px] font-medium flex justify-between">
                        <span>₹1,000 × {effectiveCctvDays}d</span>
                        <span className="font-extrabold">= ₹{cctvFare}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Core Pre-Cooling */}
                <div
                  onClick={() => setExtraServices((prev) => ({ ...prev, preCoolingTreatment: !prev.preCoolingTreatment }))}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 select-none ${
                    extraServices.preCoolingTreatment
                      ? 'border-blue-500 bg-blue-50/80 shadow-xs ring-1 ring-blue-400'
                      : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={extraServices.preCoolingTreatment}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 pointer-events-none"
                  />
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1">
                        <Snowflake className="w-3.5 h-3.5 text-blue-700" />
                        Rapid Pre-Cooling
                      </span>
                      <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded shrink-0">
                        +₹250
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Extracts core field heat upon arrival to preserve freshness.
                    </p>
                  </div>
                </div>

                {/* 4. APEDA Crop Insurance */}
                <div
                  onClick={() => setExtraServices((prev) => ({ ...prev, insurance: !prev.insurance }))}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-2.5 select-none ${
                    extraServices.insurance
                      ? 'border-purple-500 bg-purple-50/80 shadow-xs ring-1 ring-purple-400'
                      : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={extraServices.insurance}
                    onChange={() => {}}
                    className="mt-0.5 rounded text-purple-600 focus:ring-purple-500 pointer-events-none"
                  />
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-extrabold text-slate-900 text-xs flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                        APEDA Insurance
                      </span>
                      <span className="text-[10px] font-extrabold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded shrink-0">
                        +₹300
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Government APEDA coverage protecting 90% crop value.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Cost Preview */}
            <div className="rounded-2xl bg-amber-50/80 border border-amber-200/90 p-4 text-xs space-y-2">
              <div className="flex justify-between items-center text-amber-950 font-bold">
                <span>Transparent Cost Calculation:</span>
                <span className="text-[11px] text-amber-800">
                  {qty} kg • {duration} days
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-700 text-[11px] pt-1">
                <div className="p-2 rounded-lg bg-white/80 border border-amber-100">
                  <span className="text-slate-400 block text-[10px]">Cold Storage</span>
                  <span className="font-bold text-slate-800">₹{storageCost.toLocaleString()}</span>
                </div>
                <div className="p-2 rounded-lg bg-white/80 border border-amber-100">
                  <span className="text-slate-400 block text-[10px]">Handling / Unload</span>
                  <span className="font-bold text-slate-800">₹{handlingCost}</span>
                </div>
                <div className="p-2 rounded-lg bg-white/80 border border-amber-100">
                  <span className="text-slate-400 block text-[10px]">
                    {transportMode !== 'none'
                      ? transportMode === 'pickup'
                        ? 'Only Pickup'
                        : transportMode === 'drop'
                        ? 'Only Drop'
                        : 'Both Pick & Drop'
                      : 'Transit Freight'}
                  </span>
                  <span className="font-bold text-slate-800">
                    ₹{transportMode !== 'none' ? transportTotalFare.toLocaleString() : standardTransportCost.toLocaleString()}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white/80 border border-amber-100">
                  <span className="text-slate-400 block text-[10px]">Optional Add-ons</span>
                  <span className="font-bold text-slate-800">
                    +₹{(extraServicesCost - (transportMode !== 'none' ? transportTotalFare : 0)).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-amber-200/60 font-bold">
                <span className="text-slate-800 text-xs">Estimated Total Outlay (incl. 18% GST):</span>
                <span className="text-base font-black text-emerald-800">
                  ₹{totalCost.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{submitting ? 'Submitting Request...' : 'Send Storage Request'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
