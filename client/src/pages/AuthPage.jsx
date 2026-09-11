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
} from 'lucide-react';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register, isAuthenticated, user } = useAuth();

  // If URL has ?tab=register, default to register; otherwise default to login or register
  const initialTab = searchParams.get('tab') === 'login' ? 'login' : 'register';
  const [isLogin, setIsLogin] = useState(initialTab === 'login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('Ahmedabad');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'owner') navigate('/owner');
      else navigate('/storages');
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isLogin) {
        // OWNER / ADMIN LOGIN WITH EMAIL & PASSWORD
        const res = await login(email, password);
        if (res.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/owner');
        }
      } else {
        // OWNER REGISTRATION FIRST
        const res = await register({
          name,
          email,
          phone,
          password,
          role: 'owner',
          city,
        });

        // Show success and switch to Login tab so owner must log in with their credentials!
        setSuccessMessage(
          'Registration successful! Please enter your password below to log in and access your facility dashboard.'
        );
        setIsLogin(true);
        setPassword(''); // require typing password to confirm login
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Authentication failed. Please check your credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 py-12">
      <div className="w-full max-w-xl space-y-5">
        {/* 1. PROMINENT FARMER DIRECT ACCESS BANNER (NO LOGIN REQUIRED) */}
        <div className="card-3d bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 rounded-3xl p-6 text-slate-950 shadow-xl border border-amber-300 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-12 h-12 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 shadow-md">
                <Wheat className="w-7 h-7" />
              </div>
              <div>
                <div className="inline-block bg-slate-950 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider mb-1">
                  For Farmers — Zero Login Required
                </div>
                <h3 className="text-lg font-black text-slate-950 leading-tight">
                  Are you a Farmer seeking Cold Storage?
                </h3>
                <p className="text-xs text-slate-900 font-medium mt-0.5">
                  No account or password needed! Browse and compare live chambers immediately.
                </p>
              </div>
            </div>

            <Link
              to="/storages"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-950 hover:bg-slate-900 text-amber-400 hover:text-white font-black text-xs shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0 border border-slate-900 cursor-pointer"
            >
              <span>Explore Storages Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* 2. STORAGE OWNER AUTHENTICATION CARD (REGISTER THEN LOGIN) */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-950 to-slate-900 p-6 sm:p-8 text-white text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-700/30">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-black">
              Cold Storage Owner Portal
            </h2>
            <p className="text-xs text-emerald-200/90 mt-1">
              {isLogin
                ? 'Sign in to access your facility dashboard, live capacity & farmer bookings'
                : 'Register your cold storage facility first, then log in to manage your bays'}
            </p>
          </div>

          {/* Form Container */}
          <div className="p-6 sm:p-8">
            {/* Mode Switch Tabs (Register First, then Login) */}
            <div className="flex rounded-2xl bg-slate-100 p-1 mb-6 text-xs font-bold">
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
                1. Register Facility
              </button>
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
                2. Owner Sign In
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
              {/* Registration Only: Full Name */}
              {!isLogin && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Facility Owner / Manager Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rajeshbhai Patel"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              )}

              {/* Email Address (used for both register & login) */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Official Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@coldstorage.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                {isLogin && (
                  <span className="text-[11px] text-slate-400 mt-0.5 block">
                    Admin portal login: <strong className="text-slate-600">admin@agricold.in</strong>
                  </span>
                )}
              </div>

              {/* Registration Only: Phone Number */}
              {!isLogin && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Facility Contact Mobile Number *
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

              {/* Registration Only: City */}
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
                    {['Ahmedabad', 'Sanand', 'Bavla', 'Gandhinagar', 'Kadi', 'Anand', 'Dholka', 'Rajkot', 'Mehsana'].map((c) => (
                      <option key={c} value={c}>{c}, Gujarat</option>
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

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm shadow-md shadow-emerald-700/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>
                    {loading
                      ? 'Processing...'
                      : isLogin
                      ? 'Sign In with Credentials'
                      : 'Complete Facility Registration'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Static Admin Reference note */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-center text-[11px] text-slate-500">
                <span>Platform Admin static access: </span>
                <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-sm font-bold">admin@agricold.in</code> / <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-sm font-bold">Admin@123</code>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
