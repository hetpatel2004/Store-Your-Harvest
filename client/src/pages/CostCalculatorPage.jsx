import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import {
  Calculator,
  Truck,
  Thermometer,
  Droplet,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
} from 'lucide-react';

export default function CostCalculatorPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { storageId } = useParams();

  if (!isAuthenticated) {
    navigate('/auth?tab=login');
    return null;
  }

  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [crop, setCrop] = useState('Tomato');
  const [quantity, setQuantity] = useState(500);
  const [duration, setDuration] = useState(30);
  const [distance, setDistance] = useState(10);

  const allCrops = [
    'Tomato',
    'Potato',
    'Onion',
    'Mango',
    'Apple',
    'Banana',
    'Grapes',
    'Chilli',
    'Carrot',
    'Maize',
    'Wheat',
    'Soybean',
    'Pulses',
    'Brinjal',
    'Cauliflower',
    'Cabbage',
    'Okra',
    'Pumpkin',
  ];

  const cropProfiles = {
    Tomato: { tempMin: 8, tempMax: 13, humidity: '85-90%', shelfLife: '2-4 weeks', rate: 2.5 },
    Potato: { tempMin: 3, tempMax: 6, humidity: '90-95%', shelfLife: '6-10 months', rate: 1.8 },
    Onion: { tempMin: 0, tempMax: 2, humidity: '65-70%', shelfLife: '5-8 months', rate: 2.0 },
    Mango: { tempMin: 10, tempMax: 13, humidity: '85-90%', shelfLife: '3-6 weeks', rate: 3.5 },
    Apple: { tempMin: -1, tempMax: 2, humidity: '90-95%', shelfLife: '6-9 months', rate: 3.0 },
    Banana: { tempMin: 13, tempMax: 15, humidity: '90-95%', shelfLife: '2-4 weeks', rate: 2.2 },
    Grapes: { tempMin: -1, tempMax: 0, humidity: '90-95%', shelfLife: '2-4 months', rate: 3.2 },
    Chilli: { tempMin: 7, tempMax: 10, humidity: '90-95%', shelfLife: '3-5 weeks', rate: 2.8 },
    Carrot: { tempMin: 0, tempMax: 2, humidity: '95-98%', shelfLife: '4-6 months', rate: 2.2 },
    Maize: { tempMin: 10, tempMax: 15, humidity: '70-80%', shelfLife: '3-5 months', rate: 1.5 },
    Wheat: { tempMin: 13, tempMax: 18, humidity: '60-70%', shelfLife: '6-8 months', rate: 1.2 },
    Soybean: { tempMin: 15, tempMax: 20, humidity: '55-65%', shelfLife: '5-7 months', rate: 1.3 },
    Pulses: { tempMin: 10, tempMax: 15, humidity: '60-70%', shelfLife: '4-6 months', rate: 1.4 },
    Brinjal: { tempMin: 8, tempMax: 12, humidity: '85-90%', shelfLife: '2-3 weeks', rate: 2.6 },
    Cauliflower: { tempMin: 0, tempMax: 4, humidity: '85-95%', shelfLife: '2-3 weeks', rate: 3.0 },
    Cabbage: { tempMin: 0, tempMax: 5, humidity: '80-90%', shelfLife: '3-4 months', rate: 2.4 },
    Okra: { tempMin: 8, tempMax: 12, humidity: '85-95%', shelfLife: '1-2 weeks', rate: 3.5 },
    Pumpkin: { tempMin: 7, tempMax: 10, humidity: '80-85%', shelfLife: '2-3 months', rate: 1.8 },
  };

  const storageDetails = {
    temperatureMin: 8,
    temperatureMax: 13,
    handlingCharge: 350,
    transportRatePerKm: 25,
  };

  useEffect(() => {
    if (storageId) {
      fetchStorageDetails();
    }
  }, [storageId]);

  const fetchStorageDetails = async () => {
    try {
      const res = await api.get(`/storages/${storageId}`);
      if (res.data.success) {
        setCalculation(res.data.storage);
        setCrop(res.data.storage.acceptedCrops?.[0] || 'Tomato');
        setQuantity(500);
        setDuration(30);
        setDistance(10);
      }
    } catch (err) {
      console.error('Error fetching storage details:', err);
    }
  };

  const calculateTotalCost = () => {
    if (!calculation) return null;

    const pricePerKg = cropProfiles[crop]?.rate || 2.2;
    const qty = Number(quantity) || 500;
    const days = Number(duration) || 30;
    const months = Math.max(days, 1) / 30;

    // Base cold chamber storage fee
    const storageCost = Math.round(pricePerKg * qty * months);

    // Mandatory labor/unloading and weighing charges
    const handlingCost = Math.round(storageDetails.handlingCharge || 350);

    // Freight and diesel transit cost based on road distance
    const distanceKm = Math.max(Number(distance) || 0, 1);
    const transportCost = Math.round(distanceKm * (storageDetails.transportRatePerKm || 25));

    // Transparent total
    const totalCost = storageCost + handlingCost + transportCost;

    return {
      storageCost,
      handlingCost,
      transportCost,
      totalCost,
      pricePerKg,
      durationMonths: Math.round(months * 10) / 10,
    };
  };

  const handleCalculate = () => {
    setCalculation(calculateTotalCost());
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Calculator className="text-emerald-600 text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Cost Calculator
              </h2>
              <p className="text-slate-500 text-sm">
                Transparent storage & transport cost breakdown
              </p>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="px-3 py-1 rounded text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              ← Back
            </button>
          </div>
        </div>
      </nav>

      <main className="p-4">
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <p className="text-slate-500">Loading storage details...</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {/* Storage Information Card */}
            {calculation && (
              <div className="bg-white rounded-xl p-6 shadow mb-6 border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4">
                  {storageId ? 'Storage Facility Cost' : 'Custom Calculation'}
                </h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Crop</p>
                    <p className="font-medium text-slate-800">{crop}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Quantity</p>
                    <p className="font-medium">{quantity} kg</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Duration</p>
                    <p className="font-medium">{duration} days ({Math.round(duration / 30 * 10) / 10} months)</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Distance</p>
                    <p className="font-medium">{distance} km</p>
                  </div>
                </div>
              </div>
            )}

            {/* Cost Breakdown */}
            {calculation && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500">Storage Cost</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    ₹{calculation.storageCost}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500">Handling Cost</p>
                  <p className="text-2xl font-bold text-amber-600">
                    ₹{calculation.handlingCost}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-xs text-slate-500">Transport Cost</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{calculation.transportCost}
                  </p>
                </div>
                <div className="p-4 bg-slate-200 rounded-xl border border-slate-200 pt-2">
                  <p className="text-xs text-slate-500 font-medium text-slate-600">Total</p>
                  <p className="text-3xl font-bold text-slate-800">
                    ₹{calculation.totalCost}
                  </p>
                </div>
              </div>
            )}

            {/* Crop & Parameter Selection */}
            <div className="card bg-white rounded-xl p-6 shadow mb-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Storage Parameters</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  // Calculate with new parameters
                  const params = new FormData(e.target);
                  setCrop(params.get('crop') || 'Tomato');
                  setQuantity(Number(params.get('quantity')) || 500);
                  setDuration(Number(params.get('duration')) || 30);
                  setDistance(Number(params.get('distance')) || 10);
                  handleCalculate();
                }}
              >
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">
                      Select Crop
                    </label>
                    <select
                      value={crop}
                      onChange={(e) => setCrop(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-slate-300"
                    >
                      {allCrops.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">
                      Quantity (kg)
                    </label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">
                      Duration (days)
                    </label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) =>
                        setDuration(Number(e.target.value))
                      }
                      className="w-full px-3 py-2 rounded border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">
                      Distance (km)
                    </label>
                    <input
                      type="number"
                      value={distance}
                      onChange={(e) => setDistance(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded border border-slate-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Storage Rate</p>
                    <p className="font-medium text-slate-800">
                      ₹{cropProfiles[crop]?.rate || 2.2} / kg / month
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Expected Total</p>
                    <p className="font-bold text-xl text-emerald-600">
                      ₹{(cropProfiles[crop]?.rate || 2.2) * (quantity / 1000) * (duration / 30)}
                    </p>
                  </div>
                </div>
              </form>
            </div>

            {/* Crop Profile Info */}
            <div className="card bg-white rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                {crop} Storage Profile
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Optimal Temperature</p>
                  <p className="font-medium">
                    {cropProfiles[crop]?.tempMin}°C - {cropProfiles[crop]?.tempMax}°C
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Humidity</p>
                  <p className="font-medium">{cropProfiles[crop]?.humidity}</p>
                </div>
                <div>
                  <p className="text-slate-500">Shelf Life</p>
                  <p className="font-medium">{cropProfiles[crop]?.shelfLife}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}