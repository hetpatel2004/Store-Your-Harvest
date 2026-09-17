import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Leaf,
  Fire,
  Snowflake,
  Tear,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Information,
} from 'lucide-react';

export default function CropProfilesPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/auth?tab=login');
    return null;
  }

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Crop profiles are loaded from server
    // Could fetch from /api/crops endpoint
    setProfiles([
      // All 18 crops with storage profiles
      {
        name: 'Potato',
        tempMin: 3,
        tempMax: 6,
        humidity: '90-95%',
        shelfLife: '6-10 months',
        rate: 1.8,
        description: 'Cool season crop, requires high humidity',
      },
      {
        name: 'Tomato',
        tempMin: 8,
        tempMax: 13,
        humidity: '85-90%',
        shelfLife: '2-4 weeks',
        rate: 2.5,
        description: 'Warm season crop, sensitive to chilling injury',
      },
      {
        name: 'Onion',
        tempMin: 0,
        tempMax: 2,
        humidity: '65-70%',
        shelfLife: '5-8 months',
        rate: 2.0,
        description: 'Requires low humidity to prevent sprouting',
      },
      {
        name: 'Mango',
        tempMin: 10,
        tempMax: 13,
        humidity: '85-90%',
        shelfLife: '3-6 weeks',
        rate: 3.5,
        description: 'Tropical fruit, requires controlled atmosphere for export',
      },
      {
        name: 'Apple',
        tempMin: -1,
        tempMax: 2,
        humidity: '90-95%',
        shelfLife: '6-9 months',
        rate: 3.0,
        description: 'Requires cold storage with good air circulation',
      },
      {
        name: 'Banana',
        tempMin: 13,
        tempMax: 15,
        humidity: '90-95%',
        shelfLife: '2-4 weeks',
        rate: 2.2,
        description: 'Tropical fruit, ripens after harvest at room temperature',
      },
      {
        name: 'Grapes',
        tempMin: -1,
        tempMax: 0,
        humidity: '90-95%',
        shelfLife: '2-4 months',
        rate: 3.2,
        description: 'High value crop, requires precise temperature control',
      },
      {
        name: 'Chilli',
        tempMin: 7,
        tempMax: 10,
        humidity: '90-95%',
        shelfLife: '3-5 weeks',
        rate: 2.8,
        description: 'Requires high humidity to prevent dehydration',
      },
      {
        name: 'Carrot',
        tempMin: 0,
        tempMax: 2,
        humidity: '95-98%',
        shelfLife: '4-6 months',
        rate: 2.2,
        description: 'Requires very high humidity, similar to root vegetables',
      },
      {
        name: 'Maize',
        tempMin: 10,
        tempMax: 15,
        humidity: '70-80%',
        shelfLife: '3-5 months',
        rate: 1.5,
        description: 'Field crop, requires moderate humidity',
      },
      {
        name: 'Wheat',
        tempMin: 13,
        tempMax: 18,
        humidity: '60-70%',
        shelfLife: '6-8 months',
        rate: 1.2,
        description: 'Dry grain storage, lower humidity required',
      },
      {
        name: 'Soybean',
        tempMin: 15,
        tempMax: 20,
        humidity: '55-65%',
        shelfLife: '5-7 months',
        rate: 1.3,
        description: 'Oilseed crop, moderate temperature range',
      },
      {
        name: 'Pulses',
        tempMin: 10,
        tempMax: 15,
        humidity: '60-70%',
        shelfLife: '4-6 months',
        rate: 1.4,
        description: 'Dry legumes, similar to wheat storage requirements',
      },
      {
        name: 'Brinjal',
        tempMin: 8,
        tempMax: 12,
        humidity: '85-90%',
        shelfLife: '2-3 weeks',
        rate: 2.6,
        description: 'Eggplant, moderate temperature and humidity requirements',
      },
      {
        name: 'Cauliflower',
        tempMin: 0,
        tempMax: 4,
        humidity: '85-95%',
        shelfLife: '2-3 weeks',
        rate: 3.0,
        description: 'Requires very high humidity, similar to leafy vegetables',
      },
      {
        name: 'Cabbage',
        tempMin: 0,
        tempMax: 5,
        humidity: '80-90%',
        shelfLife: '3-4 months',
        rate: 2.4,
        description: 'Solid head structure, moderate humidity requirements',
      },
      {
        name: 'Okra',
        tempMin: 8,
        tempMax: 12,
        humidity: '85-95%',
        shelfLife: '1-2 weeks',
        rate: 3.5,
        description: 'Highly perishable, requires high humidity and quick turnover',
      },
      {
        name: 'Pumpkin',
        tempMin: 7,
        tempMax: 10,
        humidity: '80-85%',
        shelfLife: '2-3 months',
        rate: 1.8,
        description: 'Winter squash, moderate temperature and humidity',
      },
    ]);
  }, []);

  const renderCropCard = (profile) => {
    const tempRange =
      profile.tempMin === profile.tempMax
        ? `${profile.tempMin}°C`
        : `${profile.tempMin}°C - ${profile.tempMax}°C`;

    return (
      <div
        key={profile.name}
        className="bg-white rounded-xl p-5 border border-slate-200 hover:border-emerald-200 transition-colors cursor-help"
      >
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Leaf className="text-emerald-600 text-xl" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-slate-800">{profile.name}</h3>
            <p className="text-xs text-slate-500">{profile.description}</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="text-slate-500 text-xs">Temp Range</p>
              <p className="font-medium">{tempRange}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Humidity</p>
              <p className="font-medium">{profile.humidity}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Shelf Life</p>
              <p className="font-medium">{profile.shelfLife}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs">Rate</p>
              <p className="font-medium text-emerald-600">₹{profile.rate}/kg/month</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <ShieldCheck className="text-emerald-600 text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">Crop Storage Profiles</h2>
              <p className="text-slate-500 text-sm">18 crops with optimal storage requirements</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')} className="px-3 py-1 rounded text-sm font-medium text-gray-600 hover:bg-gray-100">
              ← Back
            </button>
          </div>
        </div>
      </nav>

      <main className="p-4">
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <p className="text-slate-500">Loading crop profiles...</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <p className="text-slate-500 text-center mb-6">
              Click on a crop card for detailed storage requirements
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {profiles.map((profile) => renderCropCard(profile))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}