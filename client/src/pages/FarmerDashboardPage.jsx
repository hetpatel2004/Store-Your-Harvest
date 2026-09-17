import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import {
  ShieldCheck,
  Building2,
  Users,
  Calendar,
  History,
  ArrowRightArrowLeft,
  AlertCircle,
  CheckCircle,
  XCircle,
  MapPin,
} from 'lucide-react';

export default function FarmerDashboardPage() {
  const { user, isAuthenticated, isFarmer, login, logout } = useAuth();
  const navigate = useNavigate();
  const { farmId } = useParams();

  if (!isAuthenticated) {
    navigate('/auth?tab=login');
    return null;
  }

  if (!isFarmer) {
    alert('Access denied. Farmer role required.');
    navigate('/');
    return null;
  }

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBooking, setNewBooking] = useState({
    storageId: '',
    crop: 'Tomato',
    quantity: 500,
    duration: 30,
    distance: 10,
  });
  const [loadingNewBooking, setLoadingNewBooking] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [isAuthenticated, farmId]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings', {
        params: { farmerId: user._id },
      });
      if (res.data.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    setLoadingNewBooking(true);
    try {
      const res = await api.post('/bookings', {
        farmerId: user._id,
        farmerName: user.name,
        farmerPhone: user.phone,
        farmerEmail: user.email,
        storageId: newBooking.storageId,
        crop: newBooking.crop,
        quantity: newBooking.quantity,
        durationDays: newBooking.duration,
        estimatedStorageCost: newBooking.quantity * (2.2), // default rate
        handlingCost: 350,
        transportCost: newBooking.distance * 25,
        totalCost: 0, // will be calculated
        distanceKm: newBooking.distance,
        status: 'pending',
      });
      if (res.data.success) {
        await fetchBookings();
        setNewBooking({
          storageId: '',
          crop: 'Tomato',
          quantity: 500,
          duration: 30,
          distance: 10,
        });
        alert('Booking request submitted successfully!');
        navigate('/farmer');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoadingNewBooking(false);
    }
  };

  const handleCropChange = (e) => {
    setNewBooking({ ...newBooking, crop: e.target.value });
  };

  const handleQuantityChange = (e) => {
    setNewBooking({ ...newBooking, quantity: Number(e.target.value) });
  };

  const handleDurationChange = (e) => {
    setNewBooking({ ...newBooking, duration: Number(e.target.value) });
  };

  const handleDistanceChange = (e) => {
    setNewBooking({ ...newBooking, distance: Number(e.target.value) });
  };

  const statusColors = {
    pending: 'amber',
    accepted: 'emerald',
    rejected: 'red',
    completed: 'green',
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
              <h2 className="text-xl font-bold text-slate-800">Farmer Dashboard</h2>
              <p className="text-slate-500 text-sm">Welcome, {user.name}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={logout} className="px-3 py-1 rounded text-sm font-medium text-red-600 hover:bg-red-100">
                Logout
              </button>
            </button>
          </div>
        </div>
      </nav>

      <main className="p-4">
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <p className="text-slate-500">Loading your bookings...</p>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            {/* Active/Recent Bookings Section */}
            <div className="bg-white rounded-xl p-6 shadow mb-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Your Active Bookings ({bookings.length})
              </h3>
              {bookings.length === 0 ? (
                <p className="text-slate-500 text-center py-8">
                  No active bookings. Create a new storage request below.
                </p>
              ) : (
                bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-slate-800">
                          {booking.storageName || 'Storage Facility'}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {booking.crop} - {booking.quantity} kg
                        </p>
                        <p className="text-xs text-slate-500">
                          Status: <span
                          className={`px-2 py-1 text-xs rounded ${statusColors[booking.status] || 'amber'}-bg ${statusColors[booking.status] || 'amber'}-text`}
                        >
                          {booking.status}
                        </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Distance</p>
                        <p className="font-medium">
                          {booking.distanceKm} km
                        </p>
                        <p className="text-xs text-slate-500">Est. Cost</p>
                        <p className="font-medium text-emerald-600">
                          ₹{booking.estimatedStorageCost || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Create New Booking Section */}
            <div className="bg-white rounded-xl p-6 shadow mb-6 border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">
                Create New Storage Request
              </h3>
              <form onSubmit={handleCreateBooking}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">
                      Select Storage
                    </label>
                    <select
                      value={newBooking.storageId}
                      onChange={(e) => setNewBooking({ ...newBooking, storageId: e.target.value })}
                      className="w-full px-3 py-2 rounded border border-slate-300"
                    >
                      <option value="">Select a storage facility</option>
                      {/* Storage options would be populated dynamically */}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">
                      Crop
                    </label>
                    <select
                      value={newBooking.crop}
                      onChange={handleCropChange}
                      className="w-full px-3 py-2 rounded border border-slate-300"
                    >
                      <option value="Tomato">Tomato</option>
                      <option value="Potato">Potato</option>
                      <option value="Onion">Onion</option>
                      <option value="Mango">Mango</option>
                      <option value="Apple">Apple</option>
                      <option value="Banana">Banana</option>
                      <option value="Grapes">Grapes</option>
                      <option value="Chilli">Chilli</option>
                      <option value="Carrot">Carrot</option>
                      <option value="Maize">Maize</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">
                      Quantity (kg)
                    </label>
                    <input
                      type="number"
                      value={newBooking.quantity}
                      onChange={(e) => handleQuantityChange(e)}
                      className="w-full px-3 py-2 rounded border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">
                      Duration (days)
                    </label>
                    <input
                      type="number"
                      value={newBooking.duration}
                      onChange={(e) => handleDurationChange(e)}
                      className="w-full px-3 py-2 rounded border border-slate-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1">
                      Distance (km)
                    </label>
                    <input
                      type="number"
                      value={newBooking.distance}
                      onChange={(e) => handleDistanceChange(e)}
                      className="w-full px-3 py-2 rounded border border-slate-300"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded bg-emerald-600 text-white font-medium text-sm hover:bg-emerald-500 transition-colors"
                >
                  Submit Storage Request
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}