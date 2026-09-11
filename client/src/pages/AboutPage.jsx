import React from 'react';
import { Link } from 'react-router-dom';
import {
  Warehouse,
  Wheat,
  Building2,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Thermometer,
  Scale,
  Award,
  Users,
  CheckCircle2,
  ArrowRight,
  HeartHandshake,
  Cpu,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 overflow-hidden">
      {/* 3D Hero Banner */}
      <section className="relative py-20 lg:py-28 bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:28px_28px]"></div>
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl animate-pulse-glow pointer-events-none"></div>
        <div className="absolute bottom-0 -left-32 w-96 h-96 rounded-full bg-teal-500/15 blur-3xl animate-pulse-glow pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-wider mb-6 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Our Mission & Vision</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto mb-6">
            Empowering Farmers. Preserving Harvests.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
              Eliminating Spoilage.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto leading-relaxed mb-10">
            AgriCold Connect is built to bridge the gap between Indian farmers and verified cold storage facilities, transforming perishable harvest losses into profitable off-season market sales.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/storages"
              className="px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Wheat className="w-4 h-4" />
              <span>Explore Cold Storages (Farmer Free)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/auth?role=owner"
              className="px-7 py-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Storage Owner Onboarding</span>
            </Link>
          </div>
        </div>
      </section>

      {/* The Agritech Problem Section (3D Perspective cards) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-3.5 py-1 rounded-full uppercase tracking-wider">
            The Reality in Indian Agriculture
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3">
            Why We Started AgriCold Connect
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            In Gujarat and across India, farmers harvest bumper crops only to be forced into distress sales because cold storage access is fragmented and opaque.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 perspective-1000">
          {/* 3D Card 1 */}
          <div className="card-3d bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              ₹92,000 Cr Post-Harvest Spoilage
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Up to 35% of tomatoes, potatoes, onions, and seasonal fruits spoil each year simply because farmers lack real-time visibility into which local chambers have space and suitable cooling.
            </p>
            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] font-bold text-rose-700">
              Crisis: Millions of tonnes wasted at market yards
            </div>
          </div>

          {/* 3D Card 2 */}
          <div className="card-3d bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Scale className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Hidden Storage & Transit Costs
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Farmers often transport tractors 40 km seeking cheaper nominal rent, only to lose money on diesel, gate unloading fees, and transit decay that were never disclosed upfront.
            </p>
            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] font-bold text-amber-800">
              Solution: Transparent total outlay calculation
            </div>
          </div>

          {/* 3D Card 3 */}
          <div className="card-3d bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Cpu className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">
              Smart Multi-Factor Matching
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Different crops require strictly calibrated biological humidity and temperature ranges. AgriCold connects produce to the correct micro-climate so shelf life extends from weeks to months.
            </p>
            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] font-bold text-emerald-800">
              Precision: Automatic temperature range calibration
            </div>
          </div>
        </div>
      </section>

      {/* How We Deliver Value (Split 3D section) */}
      <section className="py-20 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Visual 3D Composition */}
            <div className="relative">
              <div className="w-full h-96 rounded-3xl bg-gradient-to-tr from-emerald-900 to-teal-800 p-8 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-emerald-300 uppercase">Gujarat Cold Network</span>
                    <h4 className="text-2xl font-black">Zero Middlemen. Direct Farm-to-Vault.</h4>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-400/30">
                    Live Verified
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 py-4 text-xs">
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                    <span className="text-emerald-300 font-bold block text-[11px]">Farmers Benefited</span>
                    <span className="text-xl font-black">500+ Kisan</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
                    <span className="text-emerald-300 font-bold block text-[11px]">Statewide Capacity</span>
                    <span className="text-xl font-black">25,000 MT</span>
                  </div>
                </div>

                <p className="text-xs text-emerald-100/80">
                  Covering Ahmedabad, Sanand, Bavla, Gandhinagar, Kadi, Anand, Dholka, and Saurashtra.
                </p>
              </div>

              {/* Floating 3D Badge */}
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-200 animate-float flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  ★
                </div>
                <div>
                  <div className="font-extrabold text-xs text-slate-900">100% Insured Chambers</div>
                  <div className="text-[10px] text-slate-400">APEDA & NABARD Compliance</div>
                </div>
              </div>
            </div>

            {/* Right Column: Values */}
            <div className="space-y-6">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Farmer-First Architecture
              </span>
              <h3 className="text-3xl font-black text-slate-900 leading-tight">
                Designed to be Frictionless for Every Farmer
              </h3>
              <ul className="space-y-4 text-xs text-slate-600">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block text-sm">No Forced Login for Farmers</strong>
                    Search, filter, compare, and calculate storage pricing without creating an account or password.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block text-sm">Transparent Real-Time Capacity</strong>
                    Never show up to a cold storage with a loaded tractor only to be turned away due to full chambers.
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block text-sm">Direct Owner Communication</strong>
                    Direct phone and booking reservations sent straight to storage managers.
                  </div>
                </li>
              </ul>

              <div className="pt-2">
                <Link
                  to="/storages"
                  className="px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
                >
                  <span>Browse Available Cold Facilities</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
