import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HeroSearchCard from '../components/HeroSearchCard';
import StorageCard from '../components/StorageCard';
import BookingModal from '../components/BookingModal';
import CostCalculatorModal from '../components/CostCalculatorModal';
import CompareDrawer from '../components/CompareDrawer';
import { useSearch } from '../context/SearchContext';
import api from '../services/api';
import {
  Sparkles,
  Warehouse,
  ShieldCheck,
  TrendingUp,
  Clock,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  Calculator,
  Scale,
  Thermometer,
  Layers,
  MapPin,
  Award,
  Users,
  Building2,
  Wheat,
  Zap,
} from 'lucide-react';

export default function LandingPage() {
  const [featuredStorages, setFeaturedStorages] = useState([]);
  const [loadingStorages, setLoadingStorages] = useState(true);
  const [selectedStorageForBooking, setSelectedStorageForBooking] = useState(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const { compareList } = useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/storages?limit=4&sortBy=recommended')
      .then((res) => {
        if (res.data.success) {
          setFeaturedStorages(res.data.storages.slice(0, 3));
        }
      })
      .catch((err) => {
        console.error('Failed to load featured storages:', err);
      })
      .finally(() => {
        setLoadingStorages(false);
      });
  }, []);

  const faqs = [
    {
      q: 'Do farmers need to login or create an account to view available cold storage?',
      a: 'Absolutely NOT! Farmers can browse, filter, compare facilities, view live available capacity, and calculate exact total costs with ZERO login required. You only provide a contact number when you decide to send a storage reservation request.',
    },
    {
      q: 'How does the Smart Recommendation score work?',
      a: 'Unlike generic directories that only sort by nominal storage rate, our Smart Matching algorithm evaluates 5 vital factors: exact crop acceptance, optimal temperature range compatibility, available capacity sufficiency, road distance from your farm, and verified facility reliability.',
    },
    {
      q: 'What is included in the Total Cost Calculator?',
      a: 'We eliminate hidden surprises. The total estimated outlay factors in: (1) Cold storage chamber rent per kg/month, (2) Loading/unloading handling charges, and (3) Road transport freight based on distance. This helps you avoid travelling to far-off storages that end up costing more overall.',
    },
    {
      q: 'How does a cold-storage owner register and receive bookings?',
      a: 'Storage owners can click "Storage Owner Portal", register with basic facility information (temperature range, capacity, pricing, accepted crops), and immediately access a dedicated Owner Dashboard to review and approve incoming farmer requests in real time.',
    },
    {
      q: 'Are the storage facilities verified for crop safety and insurance?',
      a: 'Yes. Verified cold storages are inspected for functional power backup (generators), calibrated digital temperature logs, and APEDA/NABARD standard refrigeration insurance covering up to 90% crop value in case of unexpected cooling failure.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 overflow-hidden">
      {/* 1. HERO SECTION WITH 3D DEPTH */}
      <section className="relative pt-12 pb-24 md:pt-16 md:pb-36 overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-950 text-white">
        {/* Subtle 3D background ambient grid and floating orbs */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:28px_28px]"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl animate-pulse-glow pointer-events-none"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 rounded-full bg-teal-500/15 blur-3xl animate-pulse-glow pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-8">
            {/* Mission Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-wider mb-6 backdrop-blur-md shadow-xs animate-float">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Gujarat's Fair & Transparent Cold Storage Network</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight mb-5">
              Store Smarter. Sell Better.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
                Save Your Harvest.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed mb-8 max-w-2xl mx-auto font-normal">
              Find nearby cold-storage facilities based on crop, capacity, temperature, price and distance — all in one place with zero hidden costs.
            </p>

            {/* 3D ROLE SELECTION CARDS (FARMER DIRECT vs STORAGE OWNER) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-10 perspective-1000">
              {/* Role 1: Farmer (No Login Required) */}
              <Link
                to="/storages"
                className="card-3d bg-gradient-to-tr from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 p-5 rounded-3xl text-slate-950 text-left shadow-xl shadow-amber-500/20 border border-amber-300 flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform shadow-md">
                    <Wheat className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider bg-slate-950 text-white px-2 py-0.5 rounded-full inline-block mb-0.5">
                      No Login Required
                    </div>
                    <div className="text-base font-black leading-tight text-slate-950">
                      I'm a Farmer
                    </div>
                    <div className="text-xs text-slate-900 font-semibold">
                      Find Available Cold Storage →
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-950 group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>

              {/* Role 2: Storage Owner (Register then Login Portal) */}
              <Link
                to="/auth?tab=register"
                className="card-3d bg-white/10 hover:bg-white/15 p-5 rounded-3xl text-white text-left shadow-xl border border-white/20 backdrop-blur-md flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform shadow-md">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-0.5">
                      Owner Portal
                    </div>
                    <div className="text-base font-black leading-tight">
                      Storage Owner
                    </div>
                    <div className="text-xs text-emerald-200">
                      Login / Register Facility →
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>
            </div>

            {/* Quick Hero Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-emerald-200/80">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Login Needed for Farmers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Transparent Transport & Handling</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% Insured Chambers</span>
              </div>
            </div>
          </div>

          {/* 2. HERO INTERACTIVE SEARCH SECTION */}
          <div className="relative mt-2">
            <HeroSearchCard />
          </div>
        </div>
      </section>

      {/* 3. PROBLEM VS SOLUTION SECTION (3D CARDS) */}
      <section className="py-20 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
              The Post-Harvest Challenge
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              Why Farmers Suffer Distress Sales at Harvest
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Every season, farmers produce bumper harvests but lose up to 35% of their profits due to lack of accessible storage information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch perspective-1000">
            {/* The Old Broken Way */}
            <div className="card-3d p-8 rounded-3xl bg-rose-50/50 border border-rose-100 flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-rose-700 text-xs font-bold uppercase tracking-wider mb-4">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  The Traditional Nightmare
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Uncertainty, Spoiled Produce & Hidden Rates
                </h3>
                <ul className="space-y-3.5 text-xs text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-bold">✕</span>
                    <span>Farmers drive tractors miles without knowing if the facility has free space.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-bold">✕</span>
                    <span>Produce rots when stored at mismatched temperature conditions.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-bold">✕</span>
                    <span>Hidden loading, unloading, and toll costs wipe out perceived savings.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 font-bold">✕</span>
                    <span>Forced to sell at throwaway APMC mandi prices on harvest day.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-rose-100 text-xs font-bold text-rose-800">
                Result: Over ₹92,000 Cr agricultural post-harvest loss in India annually.
              </div>
            </div>

            {/* The AgriCold Connect Solution */}
            <div className="card-3d p-8 rounded-3xl bg-emerald-50/70 border-2 border-emerald-500/80 flex flex-col justify-between shadow-lg shadow-emerald-950/5">
              <div>
                <div className="inline-flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  The AgriCold Connect Solution
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  Precision Discovery, Smart Matching & Direct Access
                </h3>
                <ul className="space-y-3.5 text-xs text-slate-700">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Live Capacity Meter:</strong> Instantly check exact available kilograms before leaving your farm.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Crop-Optimized Temperature Matching:</strong> Automatically filters facilities matching your crop's biological shelf-life.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Transparent Total Outlay:</strong> Storage + handling + estimated transport shown together upfront.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Zero Login Barrier:</strong> Immediate access for every farmer without signup hurdles.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-200 text-xs font-bold text-emerald-900 flex items-center justify-between">
                <span>Result: Up to 40% higher realization when selling during off-season!</span>
                <Link to="/storages" className="text-emerald-700 hover:underline font-bold">
                  View Available Storages →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS (3-STEP SECTION) */}
      <section className="py-20 bg-slate-50 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full uppercase tracking-wider">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              How AgriCold Connect Works for Farmers
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              From harvest to verified cold vault in under 60 seconds with no login required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 perspective-1000">
            {/* Step 1 */}
            <div className="card-3d bg-white p-7 rounded-3xl border border-slate-200 shadow-sm relative group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold text-xl mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Enter Your Requirements
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Select your crop, harvest quantity (kg), farm location, and anticipated storage duration. Optimal temperature is auto-suggested.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Example Crop:</span>
                  <span className="font-semibold text-slate-800">Tomato (500 kg)</span>
                </div>
                <div className="flex justify-between">
                  <span>Auto Temp:</span>
                  <span className="font-semibold text-sky-700">8°C - 13°C</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="card-3d bg-white p-7 rounded-3xl border border-slate-200 shadow-sm relative group">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-extrabold text-xl mb-6 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-xs">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Compare Nearby Storages
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                View AI Smart Match score, live available capacity, chamber temperature range, distance, and itemized total costs.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Match Score:</span>
                  <span className="font-bold text-emerald-700">⭐ 96% Best Match</span>
                </div>
                <div className="flex justify-between">
                  <span>Distance:</span>
                  <span className="font-semibold text-slate-800">7.4 km away</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="card-3d bg-white p-7 rounded-3xl border border-slate-200 shadow-sm relative group">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-extrabold text-xl mb-6 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-xs">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Book & Store Your Harvest
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Send an instant booking request with your arrival date. Facility manager confirms unloading bay reservation within hours.
              </p>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Confirmation:</span>
                  <span className="font-bold text-emerald-700">Direct Owner Contact</span>
                </div>
                <div className="flex justify-between">
                  <span>Security:</span>
                  <span className="font-semibold text-slate-800">APEDA Standard Receipt</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED COLD STORAGES */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full uppercase tracking-wider">
                Gujarat Cold Chain Hubs
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
                Featured Verified Cold Storages
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Real facilities around Ahmedabad, Sanand, Bavla, Gandhinagar, and Anand.
              </p>
            </div>
            <Link
              to="/storages"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 px-5 py-2.5 rounded-xl shadow-xs transition-all"
            >
              <span>View All Available Facilities →</span>
            </Link>
          </div>

          {loadingStorages ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-96 rounded-3xl bg-slate-200/70 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {featuredStorages.map((storage) => (
                <StorageCard
                  key={storage._id}
                  storage={storage}
                  onRequestStorage={(s) => setSelectedStorageForBooking(s)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="py-20 bg-slate-50 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
              Common Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="w-full px-6 py-4 text-left font-bold text-sm text-slate-900 hover:text-emerald-700 flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180 text-emerald-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs text-slate-600 leading-relaxed animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {selectedStorageForBooking && (
        <BookingModal
          isOpen={!!selectedStorageForBooking}
          storage={selectedStorageForBooking}
          onClose={() => setSelectedStorageForBooking(null)}
        />
      )}

      {/* Cost Calculator Modal */}
      <CostCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* Comparison Drawer */}
      <CompareDrawer
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        onRequestStorage={(s) => setSelectedStorageForBooking(s)}
      />
    </div>
  );
}
