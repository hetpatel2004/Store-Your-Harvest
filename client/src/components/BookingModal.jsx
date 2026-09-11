import React, { useState } from 'react';
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
} from 'lucide-react';

export default function BookingModal({ isOpen, onClose, storage, onSuccess }) {
  const { user } = useAuth();
  const { searchCriteria } = useSearch();

  const [farmerName, setFarmerName] = useState(user ? user.name : '');
  const [farmerPhone, setFarmerPhone] = useState(user ? user.phone : '');
  const [crop, setCrop] = useState(searchCriteria.crop || (storage?.acceptedCrops?.[0] || 'Tomato'));
  const [quantity, setQuantity] = useState(searchCriteria.quantity || 500);
  const [startDate, setStartDate] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [durationDays, setDurationDays] = useState(searchCriteria.duration || 30);
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen || !storage) return null;

  // Real-time cost calculations
  const qty = Number(quantity) || 500;
  const duration = Number(durationDays) || 30;
  const months = duration / 30;
  const storageCost = Math.round(storage.pricePerKg * qty * months);
  const handlingCost = storage.handlingCharge || 350;
  const distance = storage.distance || 10;
  const transportCost = Math.round(distance * (storage.transportRatePerKm || 25));
  const totalCost = storageCost + handlingCost + transportCost;

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
        distanceKm: distance,
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
              Direct Farmer Booking Request
            </span>
            <h3 className="text-lg font-bold">{storage.name}</h3>
            <p className="text-xs text-emerald-100">
              📍 {storage.city}, Gujarat • ₹{storage.pricePerKg}/kg/month
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          /* Success Screen */
          <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900">
              Storage Request Sent Successfully!
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Your request has been dispatched to <strong>{storage.name}</strong>. The facility manager will contact you at <strong>{farmerPhone}</strong> within 2 business hours to confirm delivery schedule.
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

            <div className="pt-2">
              <button
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md cursor-pointer"
              >
                Close & Continue Exploring
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

            {/* Live Transparent Cost Preview */}
            <div className="rounded-2xl bg-amber-50/80 border border-amber-200/90 p-4 text-xs space-y-2">
              <div className="flex justify-between items-center text-amber-950 font-bold">
                <span>Transparent Cost Calculation:</span>
                <span className="text-[11px] text-amber-800">
                  {qty} kg • {duration} days
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-slate-700 text-[11px] pt-1">
                <div className="p-2 rounded-lg bg-white/80 border border-amber-100">
                  <span className="text-slate-400 block text-[10px]">Cold Storage</span>
                  <span className="font-bold text-slate-800">₹{storageCost.toLocaleString()}</span>
                </div>
                <div className="p-2 rounded-lg bg-white/80 border border-amber-100">
                  <span className="text-slate-400 block text-[10px]">Handling / Unload</span>
                  <span className="font-bold text-slate-800">₹{handlingCost}</span>
                </div>
                <div className="p-2 rounded-lg bg-white/80 border border-amber-100">
                  <span className="text-slate-400 block text-[10px]">Est. Transport</span>
                  <span className="font-bold text-slate-800">₹{transportCost}</span>
                </div>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-amber-200/60 font-bold">
                <span className="text-slate-800 text-xs">Estimated Total Outlay:</span>
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
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
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
