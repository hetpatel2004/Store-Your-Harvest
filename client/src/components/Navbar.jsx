import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Warehouse,
  Wheat,
  Building2,
  Menu,
  X,
  LogOut,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Truck,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isFarmer, isOwner, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 border-b border-emerald-100 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo with 3D hover */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-800 via-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-700/20 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300">
              <Warehouse className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black text-slate-900 tracking-tight">
                  Agri<span className="text-emerald-600">Cold</span>
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Connect
                </span>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 hidden sm:block -mt-0.5">
                Save Your Harvest • Fair Cold Storage
              </p>
            </div>
          </Link>

          {/* Center Navigation Links: Home, About, Contact */}
          <nav className="hidden md:flex items-center gap-2 lg:gap-3">
            <Link
              to="/"
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                isActive('/')
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
              Home
            </Link>

            <Link
              to="/storages"
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                isActive('/storages')
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
              Find Storage
            </Link>

            <Link
              to="/transport"
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-1.5 ${
                isActive('/transport')
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Transport & Fleet</span>
            </Link>

            <Link
              to="/about"
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                isActive('/about')
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
              About
            </Link>

            <Link
              to="/contact"
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                isActive('/contact')
                  ? 'bg-emerald-50 text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-50'
              }`}
            >
              Contact
            </Link>
          </nav>

          {/* Right Role Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* 1. PUBLIC BROWSE (NO LOGIN NEEDED) */}
            <Link
              to="/storages"
              className="px-3.5 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 border border-amber-300"
            >
              <Wheat className="w-4 h-4 text-slate-950" />
              <span>Browse Storages</span>
            </Link>

            {/* 2. AUTHENTICATED USER STATES */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                {isFarmer && (
                  <Link
                    to="/farmer"
                    className="px-4 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-md shadow-emerald-700/20 flex items-center gap-1.5 transition-all"
                  >
                    <Wheat className="w-4 h-4 text-amber-300" />
                    <span>Farmer Dashboard</span>
                  </Link>
                )}

                {isOwner && (
                  <Link
                    to="/owner"
                    className="px-4 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 flex items-center gap-1.5 transition-all"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Owner Dashboard</span>
                  </Link>
                )}

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}

                <span className="text-[11px] font-bold text-slate-500 max-w-[100px] truncate" title={user?.name}>
                  {user?.name?.split(' ')[0]}
                </span>

                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* 3. NOT LOGGED IN: FARMER & OWNER PORTAL BUTTONS */
              <div className="flex items-center gap-2">
                <Link
                  to="/auth?role=farmer"
                  className="px-3.5 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs transition-all flex items-center gap-1.5 border border-emerald-200"
                >
                  <Wheat className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Farmer Sign In</span>
                </Link>

                <Link
                  to="/auth?role=owner"
                  className="px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 border border-slate-800"
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Owner Portal</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              to="/storages"
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center gap-1 shadow-xs"
            >
              <Wheat className="w-3.5 h-3.5" />
              <span>Storages</span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl px-5 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 text-sm font-bold ${isActive('/') ? 'text-emerald-700' : 'text-slate-700'}`}
          >
            Home
          </Link>
          <Link
            to="/storages"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 text-sm font-bold ${isActive('/storages') ? 'text-emerald-700' : 'text-slate-700'}`}
          >
            Find Cold Storage (No Login Needed)
          </Link>
          <Link
            to="/transport"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 text-sm font-bold ${isActive('/transport') ? 'text-emerald-700' : 'text-slate-700'}`}
          >
            🚜 Transport & Fleet Hub
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 text-sm font-bold ${isActive('/about') ? 'text-emerald-700' : 'text-slate-700'}`}
          >
            About
          </Link>
          <Link
            to="/contact"
            onClick={() => setMobileMenuOpen(false)}
            className={`block py-2 text-sm font-bold ${isActive('/contact') ? 'text-emerald-700' : 'text-slate-700'}`}
          >
            Contact
          </Link>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            {isAuthenticated ? (
              <div className="space-y-2">
                {isFarmer && (
                  <Link
                    to="/farmer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-emerald-700 text-white font-black text-sm block"
                  >
                    🌾 Farmer Dashboard ({user?.name})
                  </Link>
                )}
                {isOwner && (
                  <Link
                    to="/owner"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-sm block"
                  >
                    Owner Dashboard
                  </Link>
                )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-xl bg-purple-700 text-white font-bold text-sm block"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 rounded-xl bg-slate-100 text-rose-600 font-bold text-sm"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/auth?role=farmer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-emerald-700 text-white font-extrabold text-sm block"
                >
                  🧑‍🌾 Farmer Login / Register
                </Link>
                <Link
                  to="/auth?role=owner"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm block"
                >
                  🏢 Storage Owner Portal
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
