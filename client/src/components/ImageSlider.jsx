import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Thermometer, ShieldCheck, Warehouse, Sparkles, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

const SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1920&q=80',
    tag: 'Golden Harvest & Green Fields',
    title: "Protecting Gujarat's Bumper Harvest",
    subtitle: 'From Sanand to Anand, connect fresh farm yields directly to certified cold-storage chambers in minutes.',
    statLabel: 'Harvest Spoilage Prevented',
    statValue: '₹18.4 Cr+',
    badge: 'Real-Time Preservation'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1920&q=80',
    tag: 'Advanced Cold Chain Infrastructure',
    title: 'Precision Climate-Controlled Chambers',
    subtitle: 'Multi-commodity zones with automated humidity, ethylene scrubbing, and 24/7 auxiliary generator power.',
    statLabel: 'Live Chamber Temp Range',
    statValue: '0°C to 15°C',
    badge: 'NABARD & APEDA Certified'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=1920&q=80',
    tag: 'Farmer-First Economic Empowerment',
    title: 'Sell Off-Season at Peak Market Rates',
    subtitle: 'Never dump tomatoes, potatoes, or onions during peak market gluts. Store safely and sell when prices surge by up to 40%.',
    statLabel: 'Average Farmer Profit Gain',
    statValue: '+34% ROI',
    badge: 'Zero Login Needed'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1920&q=80',
    tag: 'Smart Logistics & Traceability',
    title: 'Transparent Freight & Handling Calculator',
    subtitle: 'See accurate loading, unloading, and tractor transport estimates upfront so you always pick the most economical facility.',
    statLabel: 'Connected Facilities',
    statValue: '120+ Hubs',
    badge: 'Full Cost Transparency'
  }
];

export default function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isHovered]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const current = SLIDES[currentIndex];

  return (
    <div 
      className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-emerald-500/20 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ minHeight: '440px', maxHeight: '540px' }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${current.image})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-emerald-950/50 backdrop-blur-[1px]" />
          <div className="absolute inset-0 bg-radial from-transparent via-slate-950/40 to-slate-950/80" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full min-h-[440px] md:min-h-[500px] flex flex-col justify-between p-6 sm:p-10 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>{current.tag}</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/80 text-emerald-400 text-xs font-semibold backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{current.badge}</span>
          </div>
        </div>

        <div className="my-auto max-w-2xl pt-4 pb-6">
          <motion.div
            key={`text-${current.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white leading-tight tracking-tight mb-3 drop-shadow-md">
              {current.title}
            </h2>
            <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal mb-6 max-w-xl drop-shadow">
              {current.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/storages"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/30 hover:scale-105 transition-all flex items-center gap-2"
              >
                <span>Find Cold Storage (No Login)</span>
                <span>→</span>
              </Link>

              <Link
                to="/about"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all"
              >
                View Spoilage Study
              </Link>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-4 bg-slate-950/70 border border-emerald-500/30 backdrop-blur-md px-4 py-2.5 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-300/80 tracking-wider">
                {current.statLabel}
              </div>
              <div className="text-base sm:text-lg font-black text-white">
                {current.statValue}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous slide"
                className="w-9 h-9 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white flex items-center justify-center border border-white/20 hover:border-emerald-500 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next slide"
                className="w-9 h-9 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white flex items-center justify-center border border-white/20 hover:border-emerald-500 transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-950/60 border border-white/10 backdrop-blur-md">
              {SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    currentIndex === idx 
                      ? 'w-6 h-2 bg-gradient-to-r from-emerald-400 to-amber-400' 
                      : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
