import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Building2,
  Scale,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  FileText,
  User,
  LogOut,
  AlertCircle,
  Phone,
  Thermometer,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

export default function OwnerDashboardPage() {
  const { user, isAuthenticated, isOwner, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'facilities', 'requests', 'add'
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusActionLoading, setStatusActionLoading] = useState(null);

  // New facility form state
  const [newFacility, setNewFacility] = useState({
    name: '',
    tagline: '',
    address: '',
    city: 'Ahmedabad',
    latitude: 23.0225,
    longitude: 72.5714,
    storageType: 'Multipurpose CA Cold Store',
    totalCapacity: 4000000,
    availableCapacity: 3500000,
    temperatureMin: 2,
    temperatureMax: 10,
    acceptedCrops: 'Tomato, Potato, Onion, Chilli',
    minimumQuantity: 100,
    pricePerKg: 2.2,
    handlingCharge: 350,
    transportRatePerKm: 25,
    storageDuration: '15 to 180 days',
    paymentTerms: '25% advance upon intake, balance at dispatch',
    damagePolicy: 'APEDA standard cold storage insurance covered up to 90%',
    operatingHours: '06:00 AM - 10:00 PM',
    contactPhone: user?.phone || '+91 98980 23456',
    contactEmail: user?.email || '',
  });
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?tab=login&role=owner');
      return;
    }
    fetchOwnerData();
  }, [isAuthenticated]);

  const fetchOwnerData = async () => {
    setLoading(true);
    try {
      const [facRes, bookRes] = await Promise.all([
        api.get('/storages/my/facilities'),
        api.get('/bookings'),
      ]);

      if (facRes.data.success) {
        setFacilities(facRes.data.storages);
      }
      if (bookRes.data.success) {
        setBookings(bookRes.data.bookings);
      }
    } catch (err) {
      console.error('Error fetching owner data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setStatusActionLoading(bookingId);
    try {
      const res = await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      if (res.data.success) {
        // Refresh bookings and facilities to reflect updated capacity
        await fetchOwnerData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking status');
    } finally {
      setStatusActionLoading(null);
    }
  };

  const handleCreateFacility = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      const res = await api.post('/storages', newFacility);
      if (res.data.success) {
        setFormSuccess('Storage facility registered successfully! Pending admin approval.');
        await fetchOwnerData();
        setActiveTab('facilities');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to register facility');
    }
  };

  // Metrics calculations
  const totalCapacityKg = facilities.reduce((sum, f) => sum + (f.totalCapacity || 0), 0);
  const availableCapacityKg = facilities.reduce((sum, f) => sum + (f.availableCapacity || 0), 0);
  const occupiedCapacityKg = totalCapacityKg - availableCapacityKg;
  const utilizationRate = totalCapacityKg > 0 ? Math.round((occupiedCapacityKg / totalCapacityKg) * 100) : 0;

  const pendingRequests = bookings.filter((b) => b.status === 'pending');
  const activeBookings = bookings.filter((b) => b.status === 'accepted');
  const estimatedRevenue = activeBookings.reduce((sum, b) => sum + (b.totalCost || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-white">Owner Portal</div>
              <div className="text-[11px] text-emerald-400">AgriCold Manager</div>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors ${
                activeTab === 'overview' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('requests')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors ${
                activeTab === 'requests' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4" />
                <span>Farmer Requests</span>
              </div>
              {pendingRequests.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[10px] flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('facilities')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors ${
                activeTab === 'facilities' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>My Cold Storages ({facilities.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('add')}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors ${
                activeTab === 'add' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>Add New Facility</span>
            </button>
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <div className="text-xs">
            <div className="font-bold text-white">{user?.name}</div>
            <div className="text-[11px] text-slate-400">{user?.email}</div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Storage Facility Dashboard</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time chamber capacity utilization and farmer reservation requests.
              </p>
            </div>

            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Capacity</span>
                <span className="text-lg font-black text-slate-900">{(totalCapacityKg / 1000).toLocaleString()} MT</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{facilities.length} registered chambers</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available Space</span>
                <span className="text-lg font-black text-emerald-700">{(availableCapacityKg / 1000).toLocaleString()} MT</span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">Ready for intake</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Occupied Space</span>
                <span className="text-lg font-black text-slate-900">{(occupiedCapacityKg / 1000).toLocaleString()} MT</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{utilizationRate}% utilized</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/50 shadow-2xs">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Pending Requests</span>
                <span className="text-lg font-black text-amber-900">{pendingRequests.length}</span>
                <span className="text-[10px] text-amber-700 block mt-0.5">Action required</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Bookings</span>
                <span className="text-lg font-black text-sky-700">{activeBookings.length}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">In chamber storage</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 shadow-2xs">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Active Revenue</span>
                <span className="text-lg font-black text-emerald-900">₹{estimatedRevenue.toLocaleString()}</span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">Storage + handling</span>
              </div>
            </div>

            {/* Capacity Utilization Progress Bar */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-800">Overall Chamber Capacity Utilization</span>
                <span className="text-emerald-700">{utilizationRate}% Full</span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>0 MT</span>
                <span>Occupied: {(occupiedCapacityKg / 1000).toLocaleString()} MT</span>
                <span>Max: {(totalCapacityKg / 1000).toLocaleString()} MT</span>
              </div>
            </div>

            {/* Pending Requests Quick View */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>Incoming Farmer Storage Requests</span>
                </div>
                <button
                  onClick={() => setActiveTab('requests')}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  View All ({bookings.length}) →
                </button>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No pending farmer requests at the moment. All requests have been reviewed!
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <div
                      key={req._id}
                      className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{req.farmerName}</span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {req.farmerPhone}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600">
                          Produce: <strong>{req.crop}</strong> ({req.quantity} kg) • Arrival:{' '}
                          <strong>{new Date(req.startDate).toLocaleDateString()}</strong> • Duration:{' '}
                          <strong>{req.durationDays} days</strong>
                        </div>
                        {req.specialRequirements && (
                          <div className="text-[11px] text-amber-900 italic">
                            Note: "{req.specialRequirements}"
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right mr-3 hidden sm:block">
                          <div className="text-[10px] text-slate-400">Estimated Total</div>
                          <div className="font-extrabold text-sm text-emerald-800">
                            ₹{req.totalCost.toLocaleString()}
                          </div>
                        </div>

                        <button
                          onClick={() => handleUpdateStatus(req._id, 'accepted')}
                          disabled={statusActionLoading === req._id}
                          className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          Accept
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(req._id, 'rejected')}
                          disabled={statusActionLoading === req._id}
                          className="px-3 py-1.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-bold text-xs cursor-pointer disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: REQUESTS TABLE */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-black text-slate-900">Farmer Booking Requests</h1>
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Farmer</th>
                      <th className="p-4">Crop & Qty</th>
                      <th className="p-4">Arrival Date</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4">Total Revenue</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map((b) => (
                      <tr key={b._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 font-bold text-slate-900">
                          <div>{b.farmerName}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{b.farmerPhone}</div>
                        </td>
                        <td className="p-4">
                          <span className="font-semibold text-slate-800">{b.crop}</span>
                          <span className="text-[11px] text-slate-500 block">({b.quantity} kg)</span>
                        </td>
                        <td className="p-4 text-slate-600">
                          {new Date(b.startDate).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-slate-600">{b.durationDays} Days</td>
                        <td className="p-4 font-bold text-emerald-700">₹{b.totalCost.toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            b.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {b.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1.5">
                          {b.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(b._id, 'accepted')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold text-[11px]"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(b._id, 'rejected')}
                                className="px-2.5 py-1 rounded-lg border border-slate-300 text-slate-600 hover:text-rose-600 text-[11px]"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {b.status === 'accepted' && (
                            <button
                              onClick={() => handleUpdateStatus(b._id, 'completed')}
                              className="px-2.5 py-1 rounded-lg bg-sky-700 text-white font-bold text-[11px]"
                            >
                              Mark Released
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FACILITIES */}
        {activeTab === 'facilities' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black text-slate-900">Your Cold Storage Facilities</h1>
              <button
                onClick={() => setActiveTab('add')}
                className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Register Another Unit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {facilities.map((fac) => (
                <div
                  key={fac._id}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        fac.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {fac.status === 'approved' ? 'Active & Approved' : 'Pending Verification'}
                      </span>
                      <h3 className="font-extrabold text-base text-slate-900 mt-1">{fac.name}</h3>
                      <p className="text-xs text-slate-500">{fac.address}, {fac.city}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Total</span>
                      <span className="font-bold text-slate-800">{(fac.totalCapacity / 1000).toLocaleString()} MT</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Available</span>
                      <span className="font-bold text-emerald-700">{(fac.availableCapacity / 1000).toLocaleString()} MT</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">Rate</span>
                      <span className="font-bold text-slate-800">₹{fac.pricePerKg}/kg/mo</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-400">
                      Temp: {fac.temperatureMin}°C to {fac.temperatureMax}°C
                    </span>
                    <button
                      onClick={() => navigate(`/storages/${fac._id}`)}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      View Public Page →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: ADD FACILITY FORM */}
        {activeTab === 'add' && (
          <div className="max-w-3xl space-y-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900">List Your Cold Storage Facility</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Provide accurate refrigeration specs, capacity and pricing for farmer discovery.
              </p>
            </div>

            {formSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            {formError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateFacility} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xs space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Storage Name *</label>
                  <input
                    type="text"
                    required
                    value={newFacility.name}
                    onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })}
                    placeholder="e.g. Anand Polar Agro Vaults"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">City Hub *</label>
                  <select
                    value={newFacility.city}
                    onChange={(e) => setNewFacility({ ...newFacility, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                  >
                    {['Ahmedabad', 'Sanand', 'Bavla', 'Gandhinagar', 'Kadi', 'Anand', 'Dholka'].map((c) => (
                      <option key={c} value={c}>{c}, Gujarat</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Full Facility Address *</label>
                  <input
                    type="text"
                    required
                    value={newFacility.address}
                    onChange={(e) => setNewFacility({ ...newFacility, address: e.target.value })}
                    placeholder="Survey No, Highway / Industrial Area"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Total Capacity (kg) *</label>
                  <input
                    type="number"
                    required
                    value={newFacility.totalCapacity}
                    onChange={(e) => setNewFacility({ ...newFacility, totalCapacity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Available Capacity (kg) *</label>
                  <input
                    type="number"
                    required
                    value={newFacility.availableCapacity}
                    onChange={(e) => setNewFacility({ ...newFacility, availableCapacity: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Min Temp (°C) *</label>
                  <input
                    type="number"
                    required
                    value={newFacility.temperatureMin}
                    onChange={(e) => setNewFacility({ ...newFacility, temperatureMin: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Max Temp (°C) *</label>
                  <input
                    type="number"
                    required
                    value={newFacility.temperatureMax}
                    onChange={(e) => setNewFacility({ ...newFacility, temperatureMax: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Storage Rate (₹/kg/month) *</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={newFacility.pricePerKg}
                    onChange={(e) => setNewFacility({ ...newFacility, pricePerKg: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Handling / Unloading Fee (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newFacility.handlingCharge}
                    onChange={(e) => setNewFacility({ ...newFacility, handlingCharge: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Accepted Crops (comma separated) *</label>
                  <input
                    type="text"
                    required
                    value={newFacility.acceptedCrops}
                    onChange={(e) => setNewFacility({ ...newFacility, acceptedCrops: e.target.value })}
                    placeholder="Tomato, Potato, Onion, Mango, Apple"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Damage & Spoilage Responsibility Policy</label>
                  <input
                    type="text"
                    value={newFacility.damagePolicy}
                    onChange={(e) => setNewFacility({ ...newFacility, damagePolicy: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 cursor-pointer"
                >
                  Submit Storage Facility for Verification
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
