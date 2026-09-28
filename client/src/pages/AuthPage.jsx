import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Warehouse,
  Building2,
  Wheat,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  MapPin,
  KeyRound,
  UserCheck,
  Search,
} from 'lucide-react';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register, isAuthenticated, user } = useAuth();

  // Selected portal role: 'farmer' or 'owner' (defaults to 'farmer' unless ?role=owner)
  const [role, setRole] = useState(searchParams.get('role') === 'owner' ? 'owner' : 'farmer');

  // Login or Register tab
  const initialTab = searchParams.get('tab') === 'login' ? true : false;
  const [isLogin, setIsLogin] = useState(initialTab);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Ahmedabad');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const redirectPath = searchParams.get('redirect');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (redirectPath) {
        navigate(redirectPath);
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'owner') {
        navigate('/owner');
      } else {
        navigate('/farmer');
      }
    }
  }, [isAuthenticated, user, redirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await login(email, password);
        if (redirectPath) {
          navigate(redirectPath);
        } else if (res.user.role === 'admin') {
          navigate('/admin');
        } else if (res.user.role === 'owner') {
          navigate('/owner');
        } else {
          navigate('/farmer');
        }
      } else {
        // Registering either Farmer or Owner
        const res = await register({
          name,
          email,
          phone,
          password,
          role,
          city,
        });

        if (res.token) {
          // Auto-authenticated by AuthContext
          if (redirectPath) {
            navigate(redirectPath);
          } else if (role === 'farmer') {
            navigate('/farmer');
          } else {
            navigate('/owner');
          }
        } else {
          setSuccessMessage(
            'Registration successful! Please enter your password below to sign in.'
          );
          setIsLogin(true);
          setPassword('');
        }
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || err.message || 'Authentication failed. Please check credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 py-12">
      <div className="w-full max-w-xl space-y-5">
        {/* PUBLIC ACCESS CALLOUT FOR BROWSING */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-3xl p-5 text-white shadow-lg border border-emerald-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black">
              <Wheat className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">
                Public Transparency
              </div>
              <p className="text-xs font-semibold text-slate-200">
                You can browse & check all cold storages freely without signing in. Login is only required to submit bookings and view your farmer dashboard.
              </p>
            </div>
          </div>
          <Link
            to="/storages"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 flex items-center gap-1 shadow-sm transition-all"
          >
            <span>Browse First</span>
            <Search className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* MAIN AUTHENTICATION CARD */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header with Role Selection */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-6 sm:p-7 text-white text-center">
            {/* Role Toggle Selector */}
            <div className="inline-flex rounded-2xl bg-white/10 p-1 mb-4 text-xs font-extrabold border border-white/15">
              <button
                type="button"
                onClick={() => {
                  setRole('farmer');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  role === 'farmer'
                    ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Wheat className="w-4 h-4" />
                <span>🧑‍🌾 Farmer Portal</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRole('owner');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  role === 'owner'
                    ? 'bg-emerald-600 text-white shadow-md font-black'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>🏢 Storage Owner</span>
              </button>
            </div>

            <h2 className="text-xl font-black">
              {role === 'farmer'
                ? isLogin
                  ? 'Farmer Sign In'
                  : 'Farmer Account Registration'
                : isLogin
                ? 'Cold Storage Owner Sign In'
                : 'Register Cold Storage Facility'}
            </h2>
            <p className="text-xs text-emerald-200/90 mt-1 max-w-sm mx-auto">
              {role === 'farmer'
                ? isLogin
                  ? 'Sign in to access your farmer dashboard, confirmed bays & tax invoices'
                  : 'Register once to book storages, receive WhatsApp updates, and manage bookings'
                : isLogin
                ? 'Sign in to manage your facility chambers, live capacity & incoming farmer requests'
                : 'List your facility on Gujarat’s largest transparent cold storage marketplace'}
            </p>
          </div>

          {/* Form Container */}
          <div className="p-6 sm:p-8">
            {/* Mode Switch Tabs (Register vs Sign In) */}
            <div className="flex rounded-2xl bg-slate-100 p-1 mb-6 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                  isLogin ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                1. Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer ${
                  !isLogin ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                2. New Registration
              </button>
            </div>

            {/* Success Message Banner */}
            {successMessage && (
              <div className="p-4 mb-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-semibold leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* Error Message Banner */}
            {errorMessage && (
              <div className="p-3.5 mb-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Registration: Full Name */}
              {!isLogin && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {role === 'farmer' ? 'Farmer Full Name *' : 'Facility Owner / Manager Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === 'farmer' ? 'e.g. Ramesh Patel' : 'e.g. Rajeshbhai Patel'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              )}

              {/* Login / Register: Email or Phone identifier */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isLogin
                    ? 'Mobile Number or Email Address *'
                    : role === 'farmer'
                    ? 'Email Address (or account identifier) *'
                    : 'Official Facility Email *'}
                </label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    isLogin
                      ? role === 'farmer'
                        ? 'ramesh@farmer.com or +91 99090 12345'
                        : 'owner@coldstorage.com or admin@agricold.in'
                      : role === 'farmer'
                      ? 'farmer@email.com'
                      : 'owner@coldstorage.com'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Registration: Phone Number */}
              {!isLogin && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Mobile Phone Number (For WhatsApp / SMS alerts) *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98980 XXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              )}

              {/* Registration: District / City */}
              {!isLogin && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Gujarat District / City *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                  >
                    {[
                      'Ahmedabad',
                      'Sanand',
                      'Bavla',
                      'Gandhinagar',
                      'Kadi',
                      'Anand',
                      'Dholka',
                      'Rajkot',
                      'Mehsana',
                      'Surat',
                      'Vadodara',
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}, Gujarat
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  minLength="6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 rounded-2xl text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                    role === 'farmer'
                      ? 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/25'
                      : 'bg-slate-900 hover:bg-slate-800'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span>
                    {loading
                      ? 'Processing...'
                      : isLogin
                      ? role === 'farmer'
                        ? 'Sign In to Farmer Dashboard'
                        : 'Sign In to Owner Dashboard'
                      : role === 'farmer'
                      ? 'Complete Farmer Registration'
                      : 'Register Cold Storage Facility'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Demo Credentials for Fast Testing */}
              <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold uppercase tracking-wider text-[10px] text-emerald-800 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>One-Click Test Accounts</span>
                  </span>
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                    Instant Demo
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {/* Farmer Quick Autofill */}
                  <button
                    type="button"
                    onClick={() => {
                      setRole('farmer');
                      setIsLogin(true);
                      setEmail('ramesh@farmer.com');
                      setPassword('Farmer@123');
                    }}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-amber-500 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <strong className="text-slate-900 font-black text-xs">🧑‍🌾 Farmer</strong>
                      <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                        farmer
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">ramesh@farmer.com</div>
                    <div className="text-[10px] text-slate-400 font-mono">Pass: Farmer@123</div>
                  </button>

                  {/* Storage Owner Quick Autofill */}
                  <button
                    type="button"
                    onClick={() => {
                      setRole('owner');
                      setIsLogin(true);
                      setEmail('rajesh@patelcoldstorage.com');
                      setPassword('Owner@123');
                    }}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <strong className="text-slate-900 font-black text-xs">🏢 Owner</strong>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                        owner
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">rajesh@patelcold...</div>
                    <div className="text-[10px] text-slate-400 font-mono">Pass: Owner@123</div>
                  </button>

                  {/* Super Admin Quick Autofill */}
                  <button
                    type="button"
                    onClick={() => {
                      setRole('owner');
                      setIsLogin(true);
                      setEmail('admin@agricold.in');
                      setPassword('Admin@123');
                    }}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-purple-500 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <strong className="text-slate-900 font-black text-xs">👑 Admin</strong>
                      <span className="text-[9px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">
                        admin
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">admin@agricold.in</div>
                    <div className="text-[10px] text-slate-400 font-mono">Pass: Admin@123</div>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
