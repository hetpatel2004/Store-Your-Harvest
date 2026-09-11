import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  PhoneCall,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Wheat,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'farmer',
    city: 'Ahmedabad',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitting(true);
    try {
      await api.post('/contact', formData);
      setSubmitted(true);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to send inquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      {/* 3D Hero Banner */}
      <section className="relative py-16 lg:py-24 bg-gradient-to-b from-emerald-950 to-slate-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Kisan Support Desk</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
            We're Here to Protect Your Harvest
          </h1>

          <p className="text-sm sm:text-base text-emerald-100/90 max-w-xl mx-auto leading-relaxed">
            Need urgent chamber space during harvest? Have questions about crop temperature or storage registration? Connect with our Gujarat agricultural team.
          </p>
        </div>
      </section>

      {/* Main Contact Section (3D Grid) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Contact Cards (Col 1) */}
          <div className="space-y-4">
            <div className="card-3d bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <PhoneCall className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Toll-Free Harvest Helpline</h3>
              <p className="text-xs text-slate-500">
                Direct telephonic support for farmers during harvest season.
              </p>
              <div className="text-base font-black text-emerald-700">1800-890-COLD (2653)</div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>6:00 AM – 10:00 PM (Everyday)</span>
              </div>
            </div>

            <div className="card-3d bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Email Inquiries</h3>
              <p className="text-xs text-slate-500">
                For facility audits, FPO bulk storage, and technical support.
              </p>
              <div className="text-sm font-bold text-slate-900">support@agricold.in</div>
              <div className="text-xs text-slate-500">owners@agricold.in</div>
            </div>

            <div className="card-3d bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">State Command Center</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Agro-Logistics Hub, SG Highway, Near Vaishnodevi Circle, Ahmedabad, Gujarat 382421
              </p>
            </div>
          </div>

          {/* Contact Inquiry Form (Col 2 & 3) */}
          <div className="lg:col-span-2">
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Send an Instant Message</h3>
                  <p className="text-xs text-slate-500">Our regional coordinator will reply within 2 business hours.</p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Kisan First Policy
                </span>
              </div>

              {submitted ? (
                <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900">Message Received!</h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Thank you, <strong>{formData.name}</strong>. Our cold chain coordinator in {formData.city} will call you at <strong>{formData.phone}</strong> shortly.
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/storages"
                      className="px-6 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-md inline-flex items-center gap-1.5"
                    >
                      <Wheat className="w-4 h-4" />
                      <span>Find Cold Storage Now (No Login Needed)</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Ramesh Patel"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Contact Phone Number *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98980 XXXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">I am a *</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                      >
                        <option value="farmer">Farmer / Agricultural Producer</option>
                        <option value="owner">Cold Storage Owner / Manager</option>
                        <option value="trader">FPO / APMC Mandi Trader</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">District / City *</label>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                      >
                        {['Ahmedabad', 'Sanand', 'Bavla', 'Gandhinagar', 'Kadi', 'Anand', 'Dholka'].map((c) => (
                          <option key={c} value={c}>{c}, Gujarat</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Message or Storage Inquiry *</label>
                    <textarea
                      rows="4"
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your crop quantity, harvest timing, or facility details..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    ></textarea>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Link
                      to="/storages"
                      className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <Wheat className="w-3.5 h-3.5" />
                      <span>Need urgent storage? Browse directly without waiting →</span>
                    </Link>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>Submit Inquiry</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
