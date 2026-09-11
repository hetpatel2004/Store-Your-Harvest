import React from 'react';
import { Link } from 'react-router-dom';
import { Warehouse, PhoneCall, ShieldCheck, Mail, MapPin, Heart, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Warehouse className="w-5 h-5 text-white" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold text-white tracking-tight">
                  Agri<span className="text-emerald-400">Cold</span>
                </span>
                <span className="bg-emerald-950 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider border border-emerald-800">
                  Connect
                </span>
              </div>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Empowering Indian farmers by removing post-harvest distress sales. Direct transparent connection to verified cold storage facilities with real-time temperature, capacity and zero hidden costs.
            </p>

            <div className="pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-xs font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Government APEDA & NABARD Aligned Guidelines</span>
              </div>
            </div>
          </div>

          {/* Col 2: Quick Search */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Explore Storage
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/storages?crop=Tomato" className="hover:text-emerald-400 transition-colors">
                  Tomato Cold Stores
                </Link>
              </li>
              <li>
                <Link to="/storages?crop=Potato" className="hover:text-emerald-400 transition-colors">
                  Potato Multi-Chamber
                </Link>
              </li>
              <li>
                <Link to="/storages?crop=Onion" className="hover:text-emerald-400 transition-colors">
                  Dehumidified Onion Bays
                </Link>
              </li>
              <li>
                <Link to="/storages?crop=Mango" className="hover:text-emerald-400 transition-colors">
                  Mango Ripening & Chilling
                </Link>
              </li>
              <li>
                <Link to="/storages?crop=Carrot" className="hover:text-emerald-400 transition-colors">
                  Carrot Polar Chambers
                </Link>
              </li>
              <li>
                <Link to="/storages" className="hover:text-emerald-400 transition-colors text-emerald-400 font-semibold">
                  View All Facilities →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Gujarat Hubs */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Covered Hubs
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li className="hover:text-white transition-colors">Sanand GIDC Agro Belt</li>
              <li className="hover:text-white transition-colors">Bavla - Dholka Highway</li>
              <li className="hover:text-white transition-colors">Naroda - Dehgam Corridor</li>
              <li className="hover:text-white transition-colors">Gandhinagar APMC Ring</li>
              <li className="hover:text-white transition-colors">Kadi - Mehsana Perishable Zone</li>
              <li className="hover:text-white transition-colors">Anand Charotar Agri Hub</li>
            </ul>
          </div>

          {/* Col 4: Farmer Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Kisan Support
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5 text-slate-300">
                <PhoneCall className="w-4 h-4 text-emerald-400 mt-0.5" />
                <div>
                  <div className="font-semibold text-white">1800-890-COLD (2653)</div>
                  <div className="text-xs text-slate-400">Toll Free Harvest Helpline (6 AM - 10 PM)</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-emerald-400 mt-0.5" />
                <div>
                  <div className="text-xs text-slate-400">Farmer Inquiries</div>
                  <div className="font-medium text-white">support@agricold.in</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-slate-300">
                <MapPin className="w-4 h-4 text-emerald-400 mt-0.5" />
                <div className="text-xs text-slate-400">
                  Agro-Logistics Command Center, SG Highway, Ahmedabad, Gujarat
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} AgriCold Connect. Built for Hackathon Demo.
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Empowering farmers with smart refrigeration & zero waste</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 inline ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
}
