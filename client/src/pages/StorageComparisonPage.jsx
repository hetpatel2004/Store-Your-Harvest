import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Layout,
  Settings,
  Users,
  ArrowRightArrowLeft,
  AlertCircle,
  CheckCircle,
  XCircle,
  Image,
  Search,
} from 'lucide-react';

export default function StorageComparisonPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  if (!isAuthenticated) {
    navigate('/auth?tab=login');
    return null;
  }

  const [storage, setStorage] = useState(null);
  const [comparedStorages, setComparedStorages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comparisonCriteria, setComparisonCriteria] = useState({
    crop: 'Tomato',
    quantity: 500,
    city: 'Ahmedabad',
  });

  useEffect(() => {
    fetchStorageDetails();
    fetchComparisonStorages();
  }, [id]);

  const fetchStorageDetails = async () => {
    try {
      const res = await api.get(`/storages/${id}`);
      if (res.data.success) {
        setStorage(res.data.storage);
      }
    } catch (err) {
      alert('Storage facility not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchComparisonStorages = async () => {
    try {
      const res = await api.get('/storages/compare/:id'.replace(':id', id || ''));
      if (res.data.success) {
        setComparedStorages(res.data.comparedStorages);
      }
    } catch (err) {
      console.error('Error fetching comparison data:', err);
    }
  };

  const handleSearchUpdate = (criteria) => {
    setComparisonCriteria(criteria);
    // Trigger re-comparison with new criteria
    fetchComparisonStorages();
  };

  if (!storage) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <p className="text-slate-600">Loading storage details...</p>
      </div>
    );
  }

  const storageCrops = storage.acceptedCrops || [];
  const comparisonCrops = comparedStorages.map((s) => s.acceptedCrops || []);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Layout className="text-emerald-600 text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Compare: {storage.name}
              </h2>
              <p className="text-slate-500 text-sm">
                {storage.cropsData?.length || 0} crops supported
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/')}
              className="px-3 py-1 rounded text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              ← Back to Facilities
            </button>
          </div>
        </div>
      </nav>

      <main className="p-4">
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <p className="text-slate-500">Loading comparison data...</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {/* Storage Details Sidebar */}
            <div className="bg-white rounded-xl p-6 shadow mb-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                {storage.name} Details
              </h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Location</p>
                  <p className="font-medium text-slate-800">{storage.city}</p>
                </div>
                <div>
                  <p className="text-slate-500">Temperature Range</p>
                  <p className="font-medium">
                    {storage.temperatureMin}°C - {storage.temperatureMax}°C
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Capacity</p>
                  <p className="font-medium">
                    {storage.availableCapacity || 0} kg available
                  </p>
                </div>
                <div>
                  <p className="text-slate-500">Rating</p>
                  <p className="font-medium text-emerald-600">
                    ⭐ {storage.rating || 0}
                  </p>
                </div>
              </div>

              {/* Accepted Crops */}
              <p className="text-slate-500 text-sm mt-4">Accepted Crops:</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {storageCrops.map((crop) => (
                  <span
                    key={crop}
                    className="px-2 py-1 text-xs rounded bg-emerald-100 text-emerald-600"
                  >
                    {crop}
                  </span>
                ))}
              </div>
            </div>

            {/* Comparison Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {comparedStorages.length === 0 ? (
                <p className="text-slate-500 text-center py-12">
                  No comparison storages available. Use the search to find comparable facilities.
                </p>
              ) : (
                comparedStorages.map((comparedStorage) => (
                  <div
                    key={comparedStorage._id}
                    className="bg-white rounded-xl p-5 border border-slate-200 hover:border-emerald-200 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Crop Chips */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {storageCrops.slice(0, 3).map((crop) => (
                          <span
                            key={crop}
                            className="px-2 py-1 text-xs rounded bg-emerald-100 text-emerald-600"
                          >
                            {crop}
                          </span>
                        ))}
                      </span>
                    </div>

                    <h4 className="font-medium text-slate-800 truncate mb-2">
                      {comparedStorage.name}
                    </h4>
                    <p className="text-slate-500 text-sm mb-2">
                      {comparedStorage.city}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-slate-500">Capacity</p>
                        <p className="font-medium">{comparedStorage.availableCapacity || 0} kg</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Rating</p>
                        <p className="font-medium text-emerald-600">
                          ⭐ {comparedStorage.rating || 0}
                        </p>
                      </div>
                    </div>

                    <p className="text-slate-400 text-xs mt-3">
                      {comparedStorage.distance} km away
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Search Form for More Comparisons */}
            <div className="mt-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Find More Comparable Storages
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const { crop, quantity, city } = comparisonCriteria;
                  navigate(`/comparison/${id}?crop=${crop}&quantity=${quantity}&city=${city}`);
                }}
              >
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">
                      Crop
                    </label>
                    <select
                      value={comparisonCriteria.crop}
                      onChange={(e) =>
                        setComparisonCriteria({
                          ...comparisonCriteria,
                          crop: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded border border-slate-300"
                    >
                      <option value="Tomato">Tomato</option>
                      <option value="Potato">Potato</option>
                      <option value="Onion">Onion</option>
                      <option value="Mango">Mango</option>
                      <option value="Banana">Banana</option>
                      <option value="Carrot">Carrot</option>
                      <option value="Grapes">Grapes</option>
                      <option value="Chilli">Chilli</option>
                      <option value="Cauliflower">Cauliflower</option>
                      <option value="Cabbage">Cabbage</option>
                      <option value="Okra">Okra</option>
                      <option value="Pumpkin">Pumpkin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">
                      Quantity (kg)
                    </label>
                    <input
                      type="number"
                      value={comparisonCriteria.quantity}
                      onChange={(e) =>
                        setComparisonCriteria({
                          ...comparisonCriteria,
                          quantity: Number(e.target.value) || 500,
                        })
                      }
                      className="w-full px-3 py-2 rounded border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">
                      City
                    </label>
                    <select
                      value={comparisonCriteria.city}
                      onChange={(e) =>
                        setComparisonCriteria({
                          ...comparisonCriteria,
                          city: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 rounded border border-slate-300"
                    >
                      <option value="Ahmedabad">Ahmedabad</option>
                      <option value="Sanand">Sanand</option>
                      <option value="Gandhinagar">Gandhinagar</option>
                      <option value="Vadodara">Vadodara</option>
                      <option value="Rajkot">Rajkot</option>
                      <option value="Junagadh">Junagadh</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-500 transition-colors"
                >
                  Find Comparable Storages
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}