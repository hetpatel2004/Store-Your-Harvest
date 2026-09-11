import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HeroSearchCard from '../components/HeroSearchCard';
import StorageCard from '../components/StorageCard';
import BookingModal from '../components/BookingModal';
import CostCalculatorModal from '../components/CostCalculatorModal';
import CompareDrawer from '../components/CompareDrawer';
import ImageSlider from '../components/ImageSlider';
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
  Leaf,
  Activity,
  BarChart3,
  Truck
} from 'lucide-react';

export default function LandingPage() {
  const [featuredStorages, setFeaturedStorages] = useState([]);
  const [loadingStorages, setLoadingStorages] = useState(true);
  const [selectedStorageForBooking, setSelectedStorageForBooking] = useState(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

// Animated Telemetry Simulation state
  const [activeTemp, setActiveTemp] = useState(3.4);
  const [savedLossCr] = useState(18.42);

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

    // Subtle micro-telemetry ticker
    const timer = setInterval(() => {
      setActiveTemp((prev) => +(prev + (Math.random() * 0.2 - 0.1)).toFixed(1));
    }, 4000);
    return () => clearInterval(timer);
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
    <div className="min-h-screen text-slate-800 overflow-hidden bg-slate-900">
      
      {/* 1. HERO SECTION WITH RICH AGRICULTURAL & GREENERY BACKGROUND */}
      <section className="relative pt-10 pb-20 md:pt-16 md:pb-32 overflow-hidden text-white bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=2000&q=80')`
        }}
      >
        {/* Layered Rich Dark Green & Emerald Gradients for High Readability and Atmospheric Visuals */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/92 via-slate-950/90 to-slate-950 backdrop-blur-[2px]"></div>
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:32px_32px]"></div>

        {/* Ambient Glowing Blobs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl animate-pulse pointer-events-none"></div>
        <div className="absolute top-1/2 -left-32 w-96 h-96 rounded-full bg-teal-500/15 blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-10">
            
            {/* Live Greenery Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black uppercase tracking-wider mb-6 backdrop-blur-md shadow-lg">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gujarat's Fair & Transparent Cold Storage Network</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight mb-5 drop-shadow-md">
              Store Smarter. Sell Better.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                Save Your Harvest.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed mb-8 max-w-2xl mx-auto font-medium drop-shadow">
              Connect directly with verified multi-commodity cold chambers across Gujarat. Prevent distress harvest selling and check live capacity with zero hidden costs.
            </p>

            {/* 3D ACTION CARDS: FARMER STORAGE, PICKUP & EXPORT TRANSPORT, STORAGE OWNER */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8 perspective-1000">
              {/* Card 1: Farmer Storage (No Login) */}
              <Link
                to="/storages"
                className="card-3d bg-gradient-to-tr from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 p-4 sm:p-5 rounded-3xl text-slate-950 text-left shadow-2xl shadow-amber-500/25 border-2 border-amber-300 flex items-center justify-between group cursor-pointer transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform shadow-md shrink-0">
                    <Wheat className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-wider bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full inline-block mb-1">
                      No Login Needed
                    </div>
                    <div className="text-sm font-black leading-tight text-slate-950">
                      Cold Storages
                    </div>
                    <div className="text-[11px] text-slate-900 font-semibold">
                      Find Capacity →
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>

              {/* Card 2: NEW Pickup & Export Logistics Comparison (No Login) */}
              <Link
                to="/transport"
                className="card-3d bg-gradient-to-tr from-sky-500 via-sky-600 to-teal-600 hover:from-sky-400 hover:to-teal-500 p-4 sm:p-5 rounded-3xl text-slate-950 text-left shadow-2xl shadow-sky-500/25 border-2 border-sky-300 flex items-center justify-between group cursor-pointer transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-slate-950 text-sky-400 flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform shadow-md shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-wider bg-slate-950 text-sky-300 px-2 py-0.5 rounded-full inline-block mb-1">
                      Pickup & Export
                    </div>
                    <div className="text-sm font-black leading-tight text-slate-950">
                      Transport Deals
                    </div>
                    <div className="text-[11px] text-slate-900 font-semibold">
                      Compare Freight →
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>

              {/* Card 3: Storage Owner Portal */}
              <Link
                to="/auth?tab=register"
                className="card-3d bg-slate-900/80 hover:bg-slate-800/90 p-4 sm:p-5 rounded-3xl text-white text-left shadow-2xl border border-emerald-500/30 backdrop-blur-md flex items-center justify-between group cursor-pointer transition-transform"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl group-hover:scale-110 transition-transform shadow-md shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 mb-1">
                      Facility Partner
                    </div>
                    <div className="text-sm font-black leading-tight">
                      Storage Owner
                    </div>
                    <div className="text-[11px] text-emerald-200">
                      Login / Register →
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0" />
              </Link>
            </div>

            {/* Quick Hero Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-emerald-200/90 font-medium">
              <div className="flex items-center gap-1.5 bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Login Needed for Farmers</span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Transparent Freight & Handling</span>
              </div>
<div className="flex items-center gap-1.5 bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>100% Insured Chambers</span>
              </div>
            </div>

            {/* Quick Farmer Tools (opens Cost Calculator / Compare Drawer) */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setIsCalculatorOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs backdrop-blur-md transition-all cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-amber-400" />
                <span>Total Cost Calculator</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (compareList.length === 0) {
                    navigate('/storages');
                    return;
                  }
                  setIsCompareOpen(true);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs backdrop-blur-md transition-all cursor-pointer"
              >
                <Scale className="w-4 h-4 text-sky-400" />
                <span>Compare Facilities ({compareList.length})</span>
              </button>
            </div>
          </div>

          {/* 2. DEDICATED VISUAL IMAGE SLIDER WITH CROPS & WAREHOUSES */}
          <div className="mb-12">
            <ImageSlider />
          </div>

          {/* 3. HERO INTERACTIVE SEARCH SECTION */}
          <div className="relative mt-4">
            <HeroSearchCard />
          </div>
        </div>
      </section>

      {/* 4. LIVE AGRICULTURAL IMPACT & TELEMETRY STRIP */}
      <section className="relative py-10 bg-slate-950 border-y border-emerald-500/20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold uppercase mb-1">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Active Temp Range</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {activeTemp}°C <span className="text-xs text-emerald-400 font-normal">avg</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Real-time IoT chamber logging</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center justify-center gap-2 text-amber-400 text-xs font-bold uppercase mb-1">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <span>Loss Prevented</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-400">
                ₹{savedLossCr} Cr
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Saved from mandi distress sales</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center justify-center gap-2 text-sky-400 text-xs font-bold uppercase mb-1">
                <Warehouse className="w-4 h-4 text-sky-400" />
                <span>Verified Facilities</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                120+ Hubs
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Ahmedabad, Anand, Sanand</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
              <div className="flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold uppercase mb-1">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Farmer Realization</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                +34% Higher
              </div>
              <p className="text-[11px] text-slate-400 mt-1">By selling in peak off-season</p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. PROBLEM VS SOLUTION SECTION (WITH LUSH GREENERY ACCENT) */}
      <section 
        className="py-20 relative bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=2000&q=80')`
        }}
      >
        <div className="absolute inset-0 bg-slate-950/93 backdrop-blur-xs"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
              The Post-Harvest Challenge
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-4">
              Why Farmers Suffer Distress Sales at Harvest
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              Every season, farmers produce bumper harvests but lose up to 35% of their profits due to lack of accessible cold chain information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch perspective-1000">
            {/* The Old Broken Way */}
            <div className="card-3d p-8 rounded-3xl bg-slate-900/80 border border-rose-500/30 backdrop-blur-md flex flex-col justify-between shadow-xl">
              <div>
                <div className="inline-flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-4">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  The Traditional Nightmare
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Uncertainty, Spoiled Produce & Hidden Rates
                </h3>
                <ul className="space-y-3.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 font-bold">✕</span>
                    <span>Farmers drive tractors miles without knowing if the facility has free space.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 font-bold">✕</span>
                    <span>Produce rots when stored at mismatched temperature and humidity conditions.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 font-bold">✕</span>
                    <span>Hidden loading, unloading, and toll costs wipe out perceived savings.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 font-bold">✕</span>
                    <span>Forced to sell at throwaway APMC mandi prices on harvest day.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-rose-500/20 text-xs font-bold text-rose-300">
                Result: Over ₹92,000 Cr agricultural post-harvest loss in India annually.
              </div>
            </div>

            {/* The AgriCold Connect Solution */}
            <div className="card-3d p-8 rounded-3xl bg-emerald-950/70 border-2 border-emerald-500/80 backdrop-blur-md flex flex-col justify-between shadow-2xl shadow-emerald-950/50">
              <div>
                <div className="inline-flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  The AgriCold Connect Solution
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  Precision Discovery, Smart Matching & Direct Access
                </h3>
                <ul className="space-y-3.5 text-xs text-emerald-100/90">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Live Capacity Meter:</strong> Instantly check exact available kilograms before leaving your farm.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Crop-Optimized Temperature Matching:</strong> Automatically filters facilities matching your crop's biological shelf-life.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Transparent Total Outlay:</strong> Storage + handling + estimated transport shown together upfront.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>Zero Login Barrier:</strong> Immediate access for every farmer without signup hurdles.</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center justify-between">
                <span>Result: Up to 40% higher realization when selling during off-season!</span>
                <Link to="/storages" className="text-amber-400 hover:text-amber-300 font-bold hover:underline">
                  View Available Storages →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS (3-STEP SECTION) */}
      <section className="py-20 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
              Simple 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
              How AgriCold Connect Works for Farmers
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              From harvest to verified cold vault in under 60 seconds with no login required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 perspective-1000">
            {/* Step 1 */}
            <div className="card-3d bg-slate-800/80 p-7 rounded-3xl border border-slate-700 shadow-lg relative group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-extrabold text-xl mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Enter Your Requirements
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Select your crop, harvest quantity (kg), farm location, and anticipated storage duration. Optimal temperature is auto-suggested.
              </p>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-[11px] text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Example Crop:</span>
                  <span className="font-semibold text-white">Tomato (500 kg)</span>
                </div>
                <div className="flex justify-between">
                  <span>Auto Temp:</span>
                  <span className="font-semibold text-emerald-400">8°C - 13°C</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="card-3d bg-slate-800/80 p-7 rounded-3xl border border-slate-700 shadow-lg relative group">
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/30 flex items-center justify-center font-extrabold text-xl mb-6 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-xs">
                2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Compare Nearby Storages
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                View AI Smart Match score, live available capacity, chamber temperature range, distance, and itemized total costs.
              </p>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-[11px] text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Match Score:</span>
                  <span className="font-bold text-emerald-400">⭐ 96% Best Match</span>
                </div>
                <div className="flex justify-between">
                  <span>Distance:</span>
                  <span className="font-semibold text-white">7.4 km away</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="card-3d bg-slate-800/80 p-7 rounded-3xl border border-slate-700 shadow-lg relative group">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center font-extrabold text-xl mb-6 group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-xs">
                3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Book & Store Your Harvest
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Send an instant booking request with your arrival date. Facility manager confirms unloading bay reservation within hours.
              </p>
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-[11px] text-slate-300 space-y-1">
                <div className="flex justify-between">
                  <span>Confirmation:</span>
                  <span className="font-bold text-emerald-400">Direct Owner Contact</span>
                </div>
                <div className="flex justify-between">
                  <span>Security:</span>
                  <span className="font-semibold text-white">APEDA Standard Receipt</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FEATURED COLD STORAGES (WITH WAREHOUSE BACKGROUND ACCENT) */}
      <section 
        className="py-20 relative bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2000&q=80')`
        }}
      >
        <div className="absolute inset-0 bg-slate-950/94 backdrop-blur-xs"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
                Gujarat Cold Chain Hubs
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
                Featured Verified Cold Storages
              </h2>
              <p className="text-sm text-slate-300 mt-1">
                Real facilities around Ahmedabad, Sanand, Bavla, Gandhinagar, and Anand.
              </p>
            </div>
            <Link
              to="/storages"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 px-5 py-2.5 rounded-xl shadow-lg transition-all"
            >
              <span>View All Available Facilities →</span>
            </Link>
          </div>

          {loadingStorages ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-96 rounded-3xl bg-slate-800/60 animate-pulse"></div>
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

      {/* 8. FAQ SECTION */}
      <section className="py-20 bg-slate-900 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
              Common Questions
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-800 bg-slate-800/60 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="w-full px-6 py-4 text-left font-bold text-sm text-white hover:text-emerald-400 flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isOpen ? 'rotate-180 text-emerald-400' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-xs text-slate-300 leading-relaxed animate-in fade-in duration-150">
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
