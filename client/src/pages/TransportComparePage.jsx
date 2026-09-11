import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Truck,
  Ship,
  Scale,
  MapPin,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  PhoneCall,
  Clock,
  Wheat,
  SlidersHorizontal,
  ChevronRight,
  BadgeAlert
} from 'lucide-react';

export default function TransportComparePage() {
  const [serviceType, setServiceType] = useState('all');
  const [crop, setCrop] = useState('Wheat');
  const [quantityKg, setQuantityKg] = useState(3000);
  const [pickupCity, setPickupCity] = useState('Sanand');
  const [destinationType, setDestinationType] = useState('storage');
  const [targetPort, setTargetPort] = useState('Mundra Port (APSEZ)');
  const [distanceKm, setDistanceKm] = useState(35);

  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState([]);
  const [cheapestDeal, setCheapestDeal] = useState(null);
  const [fastestDeal, setFastestDeal] = useState(null);

  const [selectedQuote, setSelectedQuote] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    farmerName: '',
    farmerPhone: '',
    pickupAddress: '',
    destinationAddress: '',
    pickupDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    notes: '',
  });
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transport/compare', {
        params: {
          serviceType,
          crop,
          quantityKg,
          distanceKm,
          pickupCity,
          destinationType,
          targetPort,
        },
      });
      if (res.data.success) {
        setQuotes(res.data.quotes || []);
        setCheapestDeal(res.data.cheapestDeal || null);
        setFastestDeal(res.data.fastestDeal || null);
      }
    } catch (err) {
      console.error('Error fetching transport comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [serviceType, destinationType, targetPort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuotes();
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    try {
      const res = await api.post('/transport/book', {
        providerName: selectedQuote.name,
        farmerName: bookingForm.farmerName,
        farmerPhone: bookingForm.farmerPhone,
        pickupAddress: bookingForm.pickupAddress,
        destinationType,
        destinationAddress: bookingForm.destinationAddress || (destinationType === 'port' ? targetPort : 'Local Cold Storage'),
        crop,
        quantityKg,
        pickupDate: bookingForm.pickupDate,
        estimatedCost: 'Rs. ' + selectedQuote.totalEstimatedCost,
        notes: bookingForm.notes,
      });

      if (res.data.success) {
        setBookingSuccess(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Booking submission failed');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24">
      <section 
        className="relative py-14 lg:py-20 text-white bg-cover bg-center bg-fixed border-b border-emerald-500/20"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2000&q=80')"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-emerald-950/90 to-slate-950/95 backdrop-blur-[2px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md">
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span>Smart Agricultural Transport & Export Hub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            Farm Pickup, Mandi Shuttle &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
              Export Deals
            </span>
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl mx-auto leading-relaxed font-medium">
            Compare live rates across verified refrigerated trucks, tractors, and port export carriers. Transparent freight with zero hidden tolls or driver surcharges.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-slate-950/90 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            
            <div className="flex flex-wrap gap-2 pb-4 border-b border-slate-800">
              <button
                type="button"
                onClick={() => setServiceType('all')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  serviceType === 'all'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                All Transport Deals
              </button>

              <button
                type="button"
                onClick={() => { setServiceType('farm_pickup'); setDestinationType('storage'); }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  serviceType === 'farm_pickup'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Farm Pickup & Local Drop</span>
              </button>

              <button
                type="button"
                onClick={() => { setServiceType('export_logistics'); setDestinationType('port'); }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                  serviceType === 'export_logistics'
                    ? 'bg-sky-400 text-slate-950 shadow-md shadow-sky-400/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Ship className="w-3.5 h-3.5" />
                <span>Export Port Haulage (Mundra / JNPT)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Produce / Crop
                </label>
                <select
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Wheat">Wheat (Grain)</option>
                  <option value="Rice">Rice / Basmati</option>
                  <option value="Tomato">Tomato (Perishable)</option>
                  <option value="Potato">Potato</option>
                  <option value="Onion">Onion</option>
                  <option value="Vegetables">Mixed Vegetables</option>
                  <option value="Mango">Mango (Alphonso / Kesar)</option>
                  <option value="Banana">Banana</option>
                  <option value="Spices">Spices & Cumin (Jeera)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Weight (Kilograms)
                </label>
                <input
                  type="number"
                  min="200"
                  step="100"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 3000"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                  Farm Pickup Location
                </label>
                <select
                  value={pickupCity}
                  onChange={(e) => setPickupCity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Sanand">Sanand (Ahmedabad)</option>
                  <option value="Bavla">Bavla (Dholka Belt)</option>
                  <option value="Anand">Anand (Charotar)</option>
                  <option value="Kheda">Kheda / Nadiad</option>
                  <option value="Gandhinagar">Gandhinagar (Mansa)</option>
                  <option value="Surat">Surat (Bardoli)</option>
                  <option value="Rajkot">Rajkot / Gondal</option>
                  <option value="Deesa">Deesa (Banaskantha)</option>
                </select>
              </div>

              {destinationType === 'port' ? (
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Export Port Target
                  </label>
                  <select
                    value={targetPort}
                    onChange={(e) => setTargetPort(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Mundra Port (APSEZ)">Mundra Port (APSEZ)</option>
                    <option value="Kandla Port (Deendayal)">Kandla Port (Deendayal)</option>
                    <option value="Hazira Port (Surat)">Hazira Port (Surat)</option>
                    <option value="Nhava Sheva (JNPT Mumbai)">Nhava Sheva (JNPT Mumbai)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Estimated Distance (Km)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    value={distanceKm}
                    onChange={(e) => setDistanceKm(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. 35"
                  />
                </div>
              )}

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Scale className="w-4 h-4" />
                  <span>{loading ? 'Comparing...' : 'Compare Deals'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cheapestDeal && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/40 flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full mb-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Cheapest Verified Quote</span>
                </div>
                <div className="text-lg font-black text-white">{cheapestDeal.name}</div>
                <div className="text-xs text-slate-400">
                  Total Quote: <strong className="text-emerald-400 text-sm">Rs. {cheapestDeal.totalEstimatedCost}</strong> (Rs. {cheapestDeal.costPerKg}/kg)
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuote(cheapestDeal)}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs transition-transform hover:scale-105 cursor-pointer"
              >
                Select Deal →
              </button>
            </div>
          )}

          {fastestDeal && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/80 to-slate-900 border border-sky-500/40 flex items-center justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-sky-400 bg-sky-500/20 px-2.5 py-0.5 rounded-full mb-1.5">
                  <Zap className="w-3 h-3 text-sky-400" />
                  <span>Fastest Transit Time</span>
                </div>
                <div className="text-lg font-black text-white">{fastestDeal.name}</div>
                <div className="text-xs text-slate-400">
                  Est. Transit: <strong className="text-sky-400 text-sm">{fastestDeal.transitHours} Hours</strong> | Total: Rs. {fastestDeal.totalEstimatedCost}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuote(fastestDeal)}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-extrabold text-xs transition-transform hover:scale-105 cursor-pointer"
              >
                Select Deal →
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Available Carrier Quotes ({quotes.length} Options)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked automatically from lowest total cost for {quantityKg} kg {crop}
            </p>
          </div>
          <div className="text-xs text-emerald-400 font-semibold bg-emerald-950/80 px-3 py-1.5 rounded-full border border-emerald-500/30">
            Zero Commission Guarantee
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-28 rounded-2xl bg-slate-800/60 animate-pulse border border-slate-700/50"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {quotes.map((quote, index) => {
              const isCheapest = cheapestDeal && quote.id === cheapestDeal.id;

              return (
                <div
                  key={quote.id}
                  className={`rounded-2xl p-5 border transition-all ${
                    isCheapest
                      ? 'bg-slate-800/90 border-emerald-500/80 shadow-lg shadow-emerald-950/40'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2 max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-400">#{index + 1}</span>
                        <h3 className="text-base sm:text-lg font-black text-white">{quote.name}</h3>
                        {quote.verified && (
                          <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                            Verified
                          </span>
                        )}
                        {isCheapest && (
                          <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                            Best Value
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                        <span className="font-semibold text-white">Truck: {quote.bestVehicle}</span>
                        <span>•</span>
                        <span className="text-slate-400">Rating: {quote.rating} ({quote.tripsCompleted} trips)</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">{quote.tempRange}</span>
                      </div>

                      {quote.selectedPort && (
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                          <span className="bg-sky-950 text-sky-300 px-2 py-0.5 rounded border border-sky-800">
                            Port: {quote.selectedPort}
                          </span>
                          {quote.exportAssistance && (
                            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                              Customs Clearance
                            </span>
                          )}
                          {quote.phytosanitarySupport && (
                            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                              Phytosanitary Support
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center py-2 px-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Base Freight</div>
                        <div className="font-extrabold text-white mt-0.5">Rs. {quote.estimatedFreight}</div>
                        <div className="text-[10px] text-slate-500">{quote.distanceKm} km</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Labor / Handling</div>
                        <div className="font-extrabold text-white mt-0.5">Rs. {quote.handlingFee}</div>
                        <div className="text-[10px] text-slate-500">Loading/Unload</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Transit Time</div>
                        <div className="font-extrabold text-emerald-400 mt-0.5">~{quote.transitHours}h</div>
                        <div className="text-[10px] text-slate-500">Fast Route</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between lg:justify-end gap-5">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Outlay</div>
                        <div className="text-2xl font-black text-amber-400">Rs. {quote.totalEstimatedCost}</div>
                        <div className="text-[11px] text-slate-400 font-semibold">approx Rs. {quote.costPerKg} / kg</div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedQuote(quote)}
                        className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                      >
                        Book Pickup →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-emerald-500/40 p-6 sm:p-8 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            
            {bookingSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-white">Pickup Request Confirmed!</h3>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-left space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Booking Reference:</span>
                    <strong className="text-amber-400">{bookingSuccess.booking?.referenceNumber}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Carrier:</span>
                    <span className="text-white font-semibold">{selectedQuote.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated Total:</span>
                    <span className="text-emerald-400 font-bold">{bookingSuccess.booking?.estimatedCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dispatch Contact:</span>
                    <span className="text-white">{selectedQuote.contactPhone}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300">
                  {bookingSuccess.message}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedQuote(null);
                    setBookingSuccess(null);
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm cursor-pointer hover:bg-emerald-400"
                >
                  Done
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                  <div>
                    <h3 className="text-lg font-black text-white">Schedule Transport Pickup</h3>
                    <p className="text-xs text-slate-400">{selectedQuote.name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedQuote(null)}
                    className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-500/30 text-xs mb-5 flex items-center justify-between">
                  <div>
                    <div className="text-slate-400">Assigned Vehicle: <strong className="text-white">{selectedQuote.bestVehicle}</strong></div>
                    <div className="text-slate-400">Estimated Rate: <strong className="text-amber-400">Rs. {selectedQuote.totalEstimatedCost}</strong> ({quantityKg} kg {crop})</div>
                  </div>
                  <div className="text-right text-emerald-400 font-bold">
                    Zero Advance Required
                  </div>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Farmer Full Name *</label>
                    <input
                      type="text"
                      required
                      value={bookingForm.farmerName}
                      onChange={(e) => setBookingForm({ ...bookingForm, farmerName: e.target.value })}
                      placeholder="e.g. Bharatbhai Patel"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Contact Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={bookingForm.farmerPhone}
                      onChange={(e) => setBookingForm({ ...bookingForm, farmerPhone: e.target.value })}
                      placeholder="+91 98980 XXXXX"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Farm Pickup Address / Village *</label>
                    <input
                      type="text"
                      required
                      value={bookingForm.pickupAddress}
                      onChange={(e) => setBookingForm({ ...bookingForm, pickupAddress: e.target.value })}
                      placeholder="Farm Location, Village, Taluka, District"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Preferred Pickup Date</label>
                      <input
                        type="date"
                        required
                        value={bookingForm.pickupDate}
                        onChange={(e) => setBookingForm({ ...bookingForm, pickupDate: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Destination Target</label>
                      <input
                        type="text"
                        value={bookingForm.destinationAddress}
                        onChange={(e) => setBookingForm({ ...bookingForm, destinationAddress: e.target.value })}
                        placeholder={destinationType === 'port' ? targetPort : 'Local Cold Storage'}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Special Handling Instructions (Optional)</label>
                    <input
                      type="text"
                      value={bookingForm.notes}
                      onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                      placeholder="e.g. Fragile crates, need plastic tarpaulin, narrow village road"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm shadow-lg transition-transform hover:scale-[1.01] active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {bookingLoading ? 'Sending Request...' : 'Confirm Pickup Request (No Advance Required)'}
                    </button>
                    <p className="text-[11px] text-center text-slate-400 mt-2">
                      Carrier team will call you to verify tractor / truck gate arrival time.
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}