import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  ShieldCheck,
  Building2,
  Users,
  Calendar,
  Scale,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  LogOut,
  RefreshCw,
  Sparkles,
  BarChart2,
  Grid,
  Menu,
} from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    navigate('/auth?tab=login&role=admin');
    return null;
  }

  if (!isAdmin) {
    alert('Access denied. Admin role required.');
    navigate('/');
    return null;
  }

  const [stats, setStats] = useState(null);
  const [allStorages, setAllStorages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'storages', 'analytics', 'bookings'
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchAdminData();
  }, [isAuthenticated]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [
        statsRes,
        storagesRes,
        analyticsRes,
      ] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/storages'),
        api.get('/api/storages/analytics'),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      if (storagesRes.data.success) {
        setAllStorages(storagesRes.data.storages);
      }
      if (analyticsRes.data.success) {
        // Analytics data already included in storagesRes, merge if needed
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFacilityStatusUpdate = async (storageId, newStatus, verified = true) => {
    setActionLoading(storageId);
    try {
      const res = await api.put(`/admin/storages/${storageId}/status`, {
        status: newStatus,
        verified,
      });
      if (res.data.success) {
        await fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update facility status');
    } finally {
      setActionLoading(null);
    }
  };

  const pendingApprovals = allStorages.filter((s) => s.status === 'pending');

  const statusCounts = {
    approved: allStorages.filter((s) => s.status === 'approved').length,
    pending: pendingApprovals.length,
    rejected: allStorages.filter((s) => s.status === 'rejected').length,
  };

  const statusColors = {
    approved: 'emerald',
    pending: 'amber',
    rejected: 'red',
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-500">Total Storages</p>
                <p className="text-2xl font-bold">{stats.totalStorages || 0}</p>
              </div>
            )}
            {stats && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-500">Verified</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.verifiedStorages || 0}</p>
              </div>
            )}
            {stats && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-500">Pending Approval</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pendingStorages || 0}</p>
              </div>
            )}
            {stats && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-sm text-slate-500">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejectedStorages || 0}</p>
              </div>
            )}
          </div>
        );

      case 'storages':
        return (
          <div className="space-y-4">
            {allStorages.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No storage facilities found</p>
            ) : (
              allStorages.map((storage) => (
                <div key={storage._id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-200 transition-colors">
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-slate-800">{storage.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${statusColors[storage.status] + '-bg'} ${statusColors[storage.status] + '-text'}`}>
                      {storage.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    City: {storage.city} · Crops: {storage.acceptedCrops?.length || 0}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Capacity: {storage.availableCapacity || 0} kg available
                  </p>
                </div>
              ))
            )}
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-800">Storage Status Distribution</h3>
            <div className="space-y-3">
              {['approved', 'pending', 'rejected'].map((status) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-slate-600">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
                  <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${statusColors[status]}-600 rounded-full transition-all duration-500`}
                      style={{ width: `${statusCounts[status] / (stats?.totalStorages || 1) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-slate-500 text-sm ml-2">{statusCounts[status]} storages</span>
                </div>
              ))}
            </div>

            <h3 className="text-xl font-bold text-slate-800 mt-6">Top Crops by Storage Count</h3>
            <p className="text-slate-500">
              The system supports {allStorages.reduce((acc, s) => {
                const crops = s.acceptedCrops || [];
                crops.forEach((c) => acc[c] = (acc[c] || 0) + 1);
                return acc;
              }, {}).hasOwnProperty('Tomato') ? 'Tomato is the most supported crop' : 'Distributed across multiple crops')}
            </p>
          </div>
        );

      case 'bookings':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800">Booking Analytics</h3>
            <p className="text-slate-500">
              Total bookings and acceptance rates are available in the system analytics.
              Use the admin dashboard for detailed booking reports.
            </p>
          </div>
        );
    }
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
              <h2 className="text-xl font-bold text-slate-800">AgriCold Admin</h2>
              <p className="text-slate-500 text-sm">Dashboard & Analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1 rounded text-sm font-medium ${activeTab === 'overview' ? 'bg-emerald-100 text-emerald-600' : 'text-slate-500 hover:bg-emerald-100'}`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('storages')}
              className={`px-3 py-1 rounded text-sm font-medium ${activeTab === 'storages' ? 'bg-emerald-100 text-emerald-600' : 'text-slate-500 hover:bg-emerald-100'}`}
            >
              Storages
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-3 py-1 rounded text-sm font-medium ${activeTab === 'analytics' ? 'bg-emerald-100 text-emerald-600' : 'text-slate-500 hover:bg-emerald-100'}`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-3 py-1 rounded text-sm font-medium ${activeTab === 'bookings' ? 'bg-emerald-100 text-emerald-600' : 'text-slate-500 hover:bg-emerald-100'}`}
            >
              Bookings
            </button>
            <button
              onClick={logout}
              className="px-3 py-1 rounded text-sm font-medium text-red-600 hover:bg-red-100"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="p-4">
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <p className="text-slate-500">Loading admin data...</p>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && stats ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-sm text-slate-500">Total Storages</p>
                    <p className="text-2xl font-bold">{stats.totalStorages || 0}</p>
                  </div>
                )}
                {stats && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-sm text-slate-500">Verified</p>
                    <p className="text-2xl font-bold text-emerald-600">{stats.verifiedStorages || 0}</p>
                  </div>
                )}
                {stats && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-sm text-slate-500">Pending Approval</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.pendingStorages || 0}</p>
                  </div>
                )}
                {stats && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-sm text-slate-500">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">{stats.rejectedStorages || 0}</p>
                  </div>
                )}
              </div>
            ) : null}

            <renderTabContent />

            {actionLoading && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <p className="text-yellow-700">Updating facility status...</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}