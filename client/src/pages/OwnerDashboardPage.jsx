import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
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
  RefreshCw,
  Search,
  Filter,
  Wheat,
  Truck,
  Video,
  Printer,
  Sparkles,
  Sliders,
  Layers,
  MapPin,
  Eye,
  Check,
  CreditCard,
  Percent,
} from 'lucide-react';

export default function OwnerDashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Active Tab: 'overview' | 'requests' | 'chambers' | 'facilities' | 'add' | 'ledger'
  const [activeTab, setActiveTab] = useState('overview');

  // Facilities & Bookings state
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState('all');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'accepted', 'completed', 'paid'

  // Quick Capacity Edit Modal
  const [editingCapacityFacility, setEditingCapacityFacility] = useState(null);
  const [newAvailableCapacity, setNewAvailableCapacity] = useState('');
  const [newTariffRate, setNewTariffRate] = useState('');
  const [capacityUpdateLoading, setCapacityUpdateLoading] = useState(false);

  // Record Payment Modal
  const [paymentModalBooking, setPaymentModalBooking] = useState(null);
  const [paymentMethodInput, setPaymentMethodInput] = useState('Cash at Gate Entry');
  const [paymentTxnInput, setPaymentTxnInput] = useState('');
  const [paymentActionLoading, setPaymentActionLoading] = useState(false);

  // Add Facility Form state
  const [newFacility, setNewFacility] = useState({
    name: '',
    tagline: 'Modern CA Multipurpose Cold Storage & Ripening Unit',
    address: '',
    city: 'Ahmedabad',
    district: 'Ahmedabad',
    latitude: 23.0225,
    longitude: 72.5714,
    storageType: 'Multipurpose CA Cold Store',
    totalCapacity: 5000000,
    availableCapacity: 4500000,
    temperatureMin: 2,
    temperatureMax: 10,
    humidityMin: 85,
    humidityMax: 95,
    acceptedCrops: 'Tomato, Potato, Onion, Chilli, Garlic',
    minimumQuantity: 100,
    pricePerKg: 2.2,
    handlingCharge: 350,
    transportRatePerKm: 25,
    storageDuration: '15 to 180 days',
    paymentTerms: '25% advance upon intake, balance at release. Cash, UPI, RTGS accepted.',
    damagePolicy: 'Comprehensive APEDA standard crop insurance covered up to 90%.',
    operatingHours: '06:00 AM - 10:00 PM (24/7 during harvest season)',
    contactPhone: user?.phone || '+91 98980 23456',
    contactEmail: user?.email || '',
  });
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

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
        api.get('/storages/my/facilities').catch(() => ({ data: { storages: [] } })),
        api.get('/bookings').catch(() => ({ data: { bookings: [] } })),
      ]);

      if (facRes.data?.success) {
        setFacilities(facRes.data.storages || []);
      }
      if (bookRes.data?.success) {
        setBookings(bookRes.data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching owner data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOwnerData();
  };

  // Status Action: Accept / Reject / Complete
  const handleUpdateStatus = async (bookingId, newStatus) => {
    setActionLoading(bookingId);
    try {
      const res = await api.put(`/bookings/${bookingId}/status`, { status: newStatus });
      if (res.data?.success) {
        await fetchOwnerData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking status');
    } finally {
      setActionLoading(null);
    }
  };

  // Mark Payment Received Handler
  const handleOpenPaymentModal = (booking) => {
    setPaymentModalBooking(booking);
    setPaymentMethodInput('Cash at Gate Entry');
    setPaymentTxnInput(`TXN-CASH-${booking._id.slice(-6).toUpperCase()}`);
  };

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!paymentModalBooking) return;
    setPaymentActionLoading(true);

    try {
      const res = await api.put(`/bookings/${paymentModalBooking._id}/pay`, {
        paymentMethod: paymentMethodInput,
        transactionId: paymentTxnInput,
      });

      if (res.data?.success) {
        setPaymentModalBooking(null);
        await fetchOwnerData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setPaymentActionLoading(false);
    }
  };

  // Fast Capacity & Rate Quick-Update
  const handleOpenCapacityModal = (facility) => {
    setEditingCapacityFacility(facility);
    setNewAvailableCapacity(Math.round(facility.availableCapacity / 1000));
    setNewTariffRate(facility.pricePerKg);
  };

  const handleSaveCapacityUpdate = async (e) => {
    e.preventDefault();
    if (!editingCapacityFacility) return;
    setCapacityUpdateLoading(true);

    try {
      const updatedKg = Number(newAvailableCapacity) * 1000;
      const res = await api.put(`/storages/${editingCapacityFacility._id}`, {
        availableCapacity: Math.min(editingCapacityFacility.totalCapacity, Math.max(0, updatedKg)),
        pricePerKg: Number(newTariffRate) || editingCapacityFacility.pricePerKg,
      });

      if (res.data?.success) {
        setEditingCapacityFacility(null);
        await fetchOwnerData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update capacity settings');
    } finally {
      setCapacityUpdateLoading(false);
    }
  };

  // Register New Facility Handler
  const handleCreateFacility = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setCreateLoading(true);

    try {
      const res = await api.post('/storages', {
        ...newFacility,
        totalCapacity: Number(newFacility.totalCapacity),
        availableCapacity: Number(newFacility.availableCapacity),
        pricePerKg: Number(newFacility.pricePerKg),
        handlingCharge: Number(newFacility.handlingCharge),
      });

      if (res.data?.success) {
        setFormSuccess('Cold storage facility registered successfully! Pending admin audit & approval.');
        await fetchOwnerData();
        setActiveTab('facilities');
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to register facility');
    } finally {
      setCreateLoading(false);
    }
  };

  // Aggregated Metrics
  const activeFacilities = useMemo(() => {
    if (selectedFacilityId === 'all') return facilities;
    return facilities.filter((f) => f._id === selectedFacilityId);
  }, [facilities, selectedFacilityId]);

  const totalCapacityKg = activeFacilities.reduce((sum, f) => sum + (f.totalCapacity || 0), 0);
  const availableCapacityKg = activeFacilities.reduce((sum, f) => sum + (f.availableCapacity || 0), 0);
  const occupiedCapacityKg = Math.max(0, totalCapacityKg - availableCapacityKg);
  const utilizationRate = totalCapacityKg > 0 ? Math.round((occupiedCapacityKg / totalCapacityKg) * 100) : 0;

  // Bookings filter by facility & search
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchesFacility =
        selectedFacilityId === 'all' ||
        b.storageId?._id === selectedFacilityId ||
        b.storageId === selectedFacilityId;

      const matchesSearch =
        !searchQuery ||
        b.farmerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.farmerPhone?.includes(searchQuery) ||
        b.crop?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.storageName?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'pending' && b.status === 'pending') ||
        (statusFilter === 'accepted' && b.status === 'accepted') ||
        (statusFilter === 'completed' && b.status === 'completed') ||
        (statusFilter === 'paid' && b.bill?.paymentStatus === 'paid');

      return matchesFacility && matchesSearch && matchesStatus;
    });
  }, [bookings, selectedFacilityId, searchQuery, statusFilter]);

  const pendingRequests = bookings.filter((b) => b.status === 'pending');
  const activeStoring = bookings.filter((b) => b.status === 'accepted');
  const completedBookings = bookings.filter((b) => b.status === 'completed');

  const totalRevenue = bookings.reduce((sum, b) => sum + (b.bill?.total || b.totalCost || 0), 0);
  const paidRevenue = bookings
    .filter((b) => b.bill?.paymentStatus === 'paid')
    .reduce((sum, b) => sum + (b.bill?.total || b.totalCost || 0), 0);
  const pendingRevenue = totalRevenue - paidRevenue;

  // Print Gate Pass & Receipt
  const printGatePass = (booking) => {
    const isPaid = booking.bill?.paymentStatus === 'paid';
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Gate Pass - #${booking._id.slice(-6).toUpperCase()}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0f172a; }
          .header { border-bottom: 2px solid #10b981; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
          .brand { font-size: 24px; font-weight: 900; color: #065f46; }
          .badge { border: 2px solid #059669; padding: 6px 14px; border-radius: 8px; font-weight: 900; color: #059669; text-transform: uppercase; font-size: 13px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0; }
          .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
          th { background: #f1f5f9; padding: 10px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
          .footer { margin-top: 36px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 11px; text-align: center; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">🌾 AgriCold Connect</div>
            <p style="margin: 4px 0 0; font-size: 13px; color: #475569;">Facility Gate Intake & Weighbridge Pass</p>
          </div>
          <div style="text-align: right;">
            <span class="badge">${isPaid ? 'ENTRY GRANTED • PAID' : 'ENTRY GRANTED • PAYMENT PENDING'}</span>
            <p style="margin: 6px 0 0; font-size: 12px;">Pass ID: <strong>GATE-${booking._id.slice(-6).toUpperCase()}</strong></p>
            <p style="margin: 2px 0 0; font-size: 12px;">Date: ${new Date().toLocaleDateString('en-IN')}</p>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <h4 style="margin:0 0 6px; color:#047857; text-transform:uppercase;">Farmer / Depositor</h4>
            <p style="margin:3px 0;"><strong>${booking.farmerName}</strong></p>
            <p style="margin:3px 0;">Phone: ${booking.farmerPhone}</p>
            <p style="margin:3px 0;">Registered: Gujarat, India</p>
          </div>

          <div class="card">
            <h4 style="margin:0 0 6px; color:#047857; text-transform:uppercase;">Intake Storage Facility</h4>
            <p style="margin:3px 0;"><strong>${booking.storageName}</strong></p>
            <p style="margin:3px 0;">Commodity: <strong>${booking.crop}</strong> (${Number(booking.quantity).toLocaleString()} kg)</p>
            <p style="margin:3px 0;">Duration: ${booking.durationDays} Days (From ${new Date(booking.startDate).toLocaleDateString('en-IN')})</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Service Item</th>
              <th style="text-align: right;">Rate / Charge</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cold Chamber Reservation (${booking.crop} - ${booking.quantity} kg)</td>
              <td style="text-align: right;">₹${booking.estimatedStorageCost?.toLocaleString() || 0}</td>
            </tr>
            <tr>
              <td>Weighbridge, Inspection & Unloading</td>
              <td style="text-align: right;">₹${booking.handlingCost?.toLocaleString() || 0}</td>
            </tr>
            ${
              booking.transportCost > 0
                ? `<tr><td>Road Freight Transport Logistics</td><td style="text-align: right;">₹${booking.transportCost?.toLocaleString()}</td></tr>`
                : ''
            }
            ${
              booking.extraServices?.cctvMonitoring
                ? `<tr><td>24/7 CCTV Camera Monitoring (${booking.extraServices?.cctvDays} Days)</td><td style="text-align: right;">₹${booking.extraServices?.cctvCost?.toLocaleString() || 0}</td></tr>`
                : ''
            }
          </tbody>
        </table>

        <div style="margin-top: 24px; text-align: right;">
          <span style="font-size: 16px; font-weight: 900; color: #065f46;">
            Total Amount: ₹${Number(booking.bill?.total || booking.totalCost).toLocaleString()}
          </span>
          <p style="margin: 4px 0 0; font-size: 12px; color: ${isPaid ? '#059669' : '#d97706'}; font-weight: bold;">
            Payment Status: ${isPaid ? `PAID (${booking.bill?.paymentMethod || 'Online'} - Txn: ${booking.bill?.transactionId || 'Verified'})` : 'PENDING PAYMENT AT INTAKE'}
          </p>
        </div>

        <div class="footer">
          Authorized signature of Facility Manager: ____________________ • Security Gate Pass issued by AgriCold Connect
        </div>
      </body>
      </html>
    `;

    const win = window.open('', '_blank');
    win.document.write(printContent);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-emerald-500 selection:text-white">
      {/* ----------------- OWNER COMMAND SIDEBAR ----------------- */}
      <aside className="w-full md:w-72 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between shrink-0 shadow-2xl z-30">
        <div className="space-y-6">
          {/* Logo / Header */}
          <div className="flex items-center gap-3 pb-5 border-b border-slate-800/80">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-amber-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-wide text-white">AgriCold Owner</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/40">
                  OPERATOR
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">Facility Manager Portal</div>
            </div>
          </div>

          {/* Facility Selector (If owner has multiple storages) */}
          {facilities.length > 1 && (
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Active Facility View
              </label>
              <select
                value={selectedFacilityId}
                onChange={(e) => setSelectedFacilityId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700/80 text-white text-xs rounded-2xl px-3 py-2.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All My Facilities ({facilities.length})</option>
                {facilities.map((fac) => (
                  <option key={fac._id} value={fac._id}>
                    {fac.name} ({fac.city})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs font-semibold">
            {/* 1. Dashboard Overview */}
            <button
              onClick={() => {
                setActiveTab('overview');
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-lg shadow-emerald-500/25'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>Dashboard Overview</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-black border border-emerald-500/30">
                {utilizationRate}% Occ
              </span>
            </button>

            {/* 2. Farmer Booking Requests */}
            <button
              onClick={() => {
                setActiveTab('requests');
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all cursor-pointer ${
                activeTab === 'requests'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-lg shadow-emerald-500/25'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Farmer Requests</span>
              </div>
              {pendingRequests.length > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 shadow-sm animate-pulse">
                  {pendingRequests.length} NEW
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-slate-300">
                  {bookings.length}
                </span>
              )}
            </button>

            {/* 3. Chamber & Occupancy Matrix */}
            <button
              onClick={() => {
                setActiveTab('chambers');
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all cursor-pointer ${
                activeTab === 'chambers'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-lg shadow-emerald-500/25'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Chambers & Capacity</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {(availableCapacityKg / 1000).toLocaleString()} MT Free
              </span>
            </button>

            {/* 4. Registered Facilities */}
            <button
              onClick={() => {
                setActiveTab('facilities');
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all cursor-pointer ${
                activeTab === 'facilities'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-lg shadow-emerald-500/25'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-teal-400" />
                <span>My Facilities</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-slate-300">
                {facilities.length}
              </span>
            </button>

            {/* 5. Add New Facility */}
            <button
              onClick={() => {
                setActiveTab('add');
                setSearchQuery('');
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left transition-all cursor-pointer ${
                activeTab === 'add'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-lg shadow-emerald-500/25'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-amber-400" />
              <span>Register New Facility</span>
            </button>

            {/* 6. Invoices & Billings Ledger */}
            <button
              onClick={() => {
                setActiveTab('ledger');
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all cursor-pointer ${
                activeTab === 'ledger'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black shadow-lg shadow-emerald-500/25'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Billing & Gate Ledger</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">
                ₹{Number(paidRevenue || 0).toLocaleString()}
              </span>
            </button>
          </nav>
        </div>

        {/* User Info & Footer */}
        <div className="pt-6 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center font-black text-xs">
                OP
              </div>
              <div>
                <div className="font-bold text-xs text-white">{user?.name || 'Cold Store Owner'}</div>
                <div className="text-[10px] text-emerald-400 font-semibold">{user?.email}</div>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 border border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Operator</span>
          </button>
        </div>
      </aside>

      {/* ----------------- MAIN OWNER WORKSPACE ----------------- */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-900/60 overflow-y-auto">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Facility Control Hub
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-slate-400 font-medium">Live Chamber Sensors</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white capitalize">
              {activeTab === 'overview' && 'Executive Facility Dashboard'}
              {activeTab === 'requests' && 'Farmer Intake & Reservation Queue'}
              {activeTab === 'chambers' && 'Chamber Stack Occupancy & Rates'}
              {activeTab === 'facilities' && 'Registered Cold Storage Facilities'}
              {activeTab === 'add' && 'Onboard New Cold Storage Facility'}
              {activeTab === 'ledger' && 'Facility Financials & Revenue Ledger'}
            </h1>
          </div>

          {/* Quick Search & Filters */}
          {(activeTab === 'requests' || activeTab === 'ledger') && (
            <div className="flex items-center gap-2.5 flex-1 max-w-md justify-end">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search farmer name, phone, crop..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-inner"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700/80 text-slate-300 text-xs rounded-2xl px-3 py-2 focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Bookings</option>
                <option value="pending">Pending Intake</option>
                <option value="accepted">Accepted / Storing</option>
                <option value="completed">Completed / Released</option>
                <option value="paid">Paid Receipts</option>
              </select>
            </div>
          )}
        </header>

        {/* Viewport Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* ================= TAB 1: EXECUTIVE OVERVIEW ================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Primary Metric Ribbon */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Managed Capacity */}
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Total Capacity
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                      <Scale className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white">
                    {(totalCapacityKg / 1000).toLocaleString()} MT
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {activeFacilities.length} Facility / Storage Unit(s)
                  </p>
                </div>

                {/* 2. Live Occupied Space */}
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Occupied Space
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-amber-400">
                    {(occupiedCapacityKg / 1000).toLocaleString()} MT
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-semibold">
                    {utilizationRate}% Chamber Utilization
                  </p>
                </div>

                {/* 3. Available Intake Capacity */}
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Available for Intake
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-emerald-400">
                    {(availableCapacityKg / 1000).toLocaleString()} MT
                  </div>
                  <p className="text-[11px] text-emerald-300 mt-1 font-semibold">
                    Ready for immediate storage
                  </p>
                </div>

                {/* 4. Total Billings Revenue */}
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Total Billings
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white">
                    ₹{Number(totalRevenue || 0).toLocaleString()}
                  </div>
                  <p className="text-[11px] text-emerald-400 mt-1 font-semibold">
                    ₹{Number(paidRevenue || 0).toLocaleString()} Collected
                  </p>
                </div>
              </div>

              {/* LIVE CAPACITY & CHAMBERS GAUGE */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/40">
                          Active Chamber Load
                        </span>
                        <span className="text-xs text-slate-400">Real-Time Space Monitoring</span>
                      </div>
                      <h3 className="text-xl font-black text-white mt-1">
                        Facility Occupancy: {utilizationRate}% Loaded
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Current potato, tomato, and perishables volume stored under controlled temperature.
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-3xl font-black text-amber-400 block">
                        {(occupiedCapacityKg / 1000).toFixed(1)} MT
                      </span>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
                        of {(totalCapacityKg / 1000).toFixed(1)} MT Capacity
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="w-full h-4 rounded-full bg-slate-950 p-0.5 overflow-hidden border border-slate-800">
                      <div
                        style={{ width: `${utilizationRate}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-1000 shadow-md"
                      />
                    </div>
                    <div className="flex justify-between text-xs font-bold pt-1">
                      <span className="text-amber-400">
                        Occupied: {(occupiedCapacityKg / 1000).toLocaleString()} MT ({utilizationRate}%)
                      </span>
                      <span className="text-emerald-400">
                        Remaining Free Space: {(availableCapacityKg / 1000).toLocaleString()} MT ({100 - utilizationRate}%)
                      </span>
                    </div>
                  </div>

                  {/* Chamber Snapshot Matrix */}
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300 uppercase tracking-wider">
                        Chamber Status Matrix
                      </span>
                      <button
                        onClick={() => setActiveTab('chambers')}
                        className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span>Manage Chambers</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                        <div className="flex items-center justify-between text-slate-400 mb-1">
                          <span>Chamber #1 (Root Bay)</span>
                          <span className="text-emerald-400 font-bold">2°C - 4°C</span>
                        </div>
                        <div className="font-black text-white text-sm">Potato Seed Stacks</div>
                        <div className="text-[10px] text-amber-400 mt-1">92% Capacity (Heavy Load)</div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                        <div className="flex items-center justify-between text-slate-400 mb-1">
                          <span>Chamber #2 (CA Unit)</span>
                          <span className="text-sky-400 font-bold">8°C - 12°C</span>
                        </div>
                        <div className="font-black text-white text-sm">Tomato & Vegetable Crates</div>
                        <div className="text-[10px] text-emerald-400 mt-1">45% Capacity (Intake Open)</div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                        <div className="flex items-center justify-between text-slate-400 mb-1">
                          <span>Chamber #3 (De-Humid)</span>
                          <span className="text-amber-400 font-bold">0°C - 2°C</span>
                        </div>
                        <div className="font-black text-white text-sm">Onion Mesh Sacks</div>
                        <div className="text-[10px] text-amber-400 mt-1">78% Capacity (Limited)</div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                        <div className="flex items-center justify-between text-slate-400 mb-1">
                          <span>Chamber #4 (Pre-Cool)</span>
                          <span className="text-teal-400 font-bold">0°C Rapid</span>
                        </div>
                        <div className="font-black text-white text-sm">Rapid Heat Extraction</div>
                        <div className="text-[10px] text-emerald-400 mt-1">Active Batch (Free)</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Today's Gate Activity & Action shortcuts */}
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-black text-white mb-1">Facility Operations</h3>
                    <p className="text-xs text-slate-400 mb-4">
                      Direct shortcuts for intake gate and rates.
                    </p>

                    <div className="space-y-2.5">
                      <button
                        onClick={() => setActiveTab('requests')}
                        className="w-full p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-left flex items-center justify-between text-xs font-bold text-white transition-all cursor-pointer border border-slate-700/60"
                      >
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-amber-400" />
                          <span>Review Farmer Requests</span>
                        </div>
                        {pendingRequests.length > 0 && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                            {pendingRequests.length} Pending
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => setActiveTab('chambers')}
                        className="w-full p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-left flex items-center justify-between text-xs font-bold text-white transition-all cursor-pointer border border-slate-700/60"
                      >
                        <div className="flex items-center gap-2.5">
                          <Sliders className="w-4 h-4 text-emerald-400" />
                          <span>Tune Capacity & Tariff Rates</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>

                      <button
                        onClick={() => setActiveTab('ledger')}
                        className="w-full p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-left flex items-center justify-between text-xs font-bold text-white transition-all cursor-pointer border border-slate-700/60"
                      >
                        <div className="flex items-center gap-2.5">
                          <DollarSign className="w-4 h-4 text-teal-400" />
                          <span>Record Gate Cash Payments</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>

                      <button
                        onClick={() => setActiveTab('add')}
                        className="w-full p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-left flex items-center justify-between text-xs font-bold text-emerald-300 transition-all cursor-pointer border border-emerald-500/30"
                      >
                        <div className="flex items-center gap-2.5">
                          <PlusCircle className="w-4 h-4 text-emerald-400" />
                          <span>Add Another Cold Storage Unit</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-emerald-400" />
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span>Gate Status</span>
                      <span className="text-emerald-400 font-bold">OPEN (24/7 INTAKE)</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Weighbridge calibrated • Diesel generator test passed
                    </p>
                  </div>
                </div>
              </div>

              {/* RECENT INTAKE RESERVATIONS TABLE */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-white">Recent Intake Reservations</h3>
                    <p className="text-xs text-slate-400">Farmers storing in your facilities</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Requests ({bookings.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3.5 rounded-l-xl">Farmer</th>
                        <th className="p-3.5">Facility</th>
                        <th className="p-3.5">Commodity</th>
                        <th className="p-3.5">Duration</th>
                        <th className="p-3.5">Total Amount</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right rounded-r-xl">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {bookings.slice(0, 5).map((b) => (
                        <tr key={b._id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5">
                            <div className="font-bold text-white">{b.farmerName}</div>
                            <div className="text-[10px] text-slate-400">{b.farmerPhone}</div>
                          </td>
                          <td className="p-3.5 font-medium text-slate-300">{b.storageName}</td>
                          <td className="p-3.5">
                            <span className="font-bold text-amber-300">{b.crop}</span>
                            <div className="text-[10px] text-slate-400">{Number(b.quantity).toLocaleString()} kg</div>
                          </td>
                          <td className="p-3.5 text-slate-300">{b.durationDays} Days</td>
                          <td className="p-3.5 font-black text-white">
                            ₹{Number(b.bill?.total || b.totalCost).toLocaleString()}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                b.status === 'accepted'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : b.status === 'pending'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  : 'bg-slate-700 text-slate-300'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => printGatePass(b)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Gate Pass</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: FARMER REQUESTS QUEUE ================= */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                <div>
                  <h2 className="text-lg font-black text-white">Farmer Booking Requests Queue</h2>
                  <p className="text-xs text-slate-400">
                    Showing {filteredBookings.length} of {bookings.length} reservations
                  </p>
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-400">
                  <Calendar className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-bold">No farmer booking requests matching criteria found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map((b) => {
                    const isPending = b.status === 'pending';
                    const isAccepted = b.status === 'accepted';
                    const isPaid = b.bill?.paymentStatus === 'paid';

                    return (
                      <div
                        key={b._id}
                        className={`bg-slate-900 p-6 rounded-3xl border shadow-xl space-y-4 transition-all ${
                          isPending
                            ? 'border-amber-500/50 bg-amber-950/10'
                            : 'border-slate-800'
                        }`}
                      >
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                                  b.status === 'accepted'
                                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                    : b.status === 'pending'
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : 'bg-slate-800 text-slate-400 border-slate-700'
                                }`}
                              >
                                {b.status.toUpperCase()}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                Booked {new Date(b.createdAt).toLocaleDateString('en-IN')}
                              </span>
                              <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">
                                #{b._id.slice(-6).toUpperCase()}
                              </span>
                            </div>
                            <h3 className="text-lg font-black text-white mt-1.5 flex items-center gap-2">
                              <span>{b.farmerName}</span>
                              <span className="text-xs font-normal text-slate-400">• {b.farmerPhone}</span>
                            </h3>
                            <p className="text-xs text-slate-400">
                              Storage Target: <strong className="text-slate-200">{b.storageName}</strong>
                            </p>
                          </div>

                          {/* Quick Action Buttons */}
                          <div className="flex flex-wrap items-center gap-2">
                            {isPending && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(b._id, 'accepted')}
                                  disabled={actionLoading === b._id}
                                  className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Accept & Reserve Chamber</span>
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(b._id, 'rejected')}
                                  disabled={actionLoading === b._id}
                                  className="px-3 py-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                                >
                                  <XCircle className="w-4 h-4" />
                                  <span>Reject</span>
                                </button>
                              </>
                            )}

                            {isAccepted && (
                              <button
                                onClick={() => handleUpdateStatus(b._id, 'completed')}
                                disabled={actionLoading === b._id}
                                className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-black text-xs transition-all cursor-pointer disabled:opacity-50 border border-emerald-500/30 flex items-center gap-1.5"
                              >
                                <Check className="w-4 h-4" />
                                <span>Release & Complete</span>
                              </button>
                            )}

                            {!isPaid && (
                              <button
                                onClick={() => handleOpenPaymentModal(b)}
                                className="px-4 py-2 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                              >
                                <CreditCard className="w-4 h-4 text-slate-950" />
                                <span>Record Payment</span>
                              </button>
                            )}

                            <button
                              onClick={() => printGatePass(b)}
                              className="p-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                              title="Print Gate Pass"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Commodity & Duration Details */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-800">
                          <div className="p-3 rounded-2xl bg-slate-950/60">
                            <span className="text-[10px] text-slate-400 block font-bold">Crop & Weight</span>
                            <span className="font-black text-amber-300">
                              {b.crop} ({Number(b.quantity).toLocaleString()} kg)
                            </span>
                          </div>

                          <div className="p-3 rounded-2xl bg-slate-950/60">
                            <span className="text-[10px] text-slate-400 block font-bold">Intake Date & Span</span>
                            <span className="font-black text-white">
                              {new Date(b.startDate).toLocaleDateString('en-IN')} ({b.durationDays} Days)
                            </span>
                          </div>

                          <div className="p-3 rounded-2xl bg-slate-950/60">
                            <span className="text-[10px] text-slate-400 block font-bold">Total Bill</span>
                            <span className="font-black text-emerald-400">
                              ₹{Number(b.bill?.total || b.totalCost).toLocaleString()}
                            </span>
                          </div>

                          <div className="p-3 rounded-2xl bg-slate-950/60">
                            <span className="text-[10px] text-slate-400 block font-bold">Payment Status</span>
                            <span
                              className={`font-black uppercase ${
                                isPaid ? 'text-emerald-400' : 'text-amber-400'
                              }`}
                            >
                              {isPaid ? `PAID (${b.bill?.paymentMethod || 'Online'})` : 'PENDING'}
                            </span>
                          </div>
                        </div>

                        {/* Special requirements & optional services */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                          {b.extraServices?.transportGoods && (
                            <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-300 font-bold border border-amber-500/20 flex items-center gap-1.5">
                              <Truck className="w-3.5 h-3.5" />
                              <span>Farm Pickup Requested ({b.extraServices?.pickupDistanceKm || 0} km)</span>
                            </span>
                          )}

                          {b.extraServices?.cctvMonitoring && (
                            <span className="px-2.5 py-1 rounded-xl bg-teal-500/10 text-teal-300 font-bold border border-teal-500/20 flex items-center gap-1.5">
                              <Video className="w-3.5 h-3.5" />
                              <span>24/7 CCTV Camera Requested ({b.extraServices?.cctvDays} Days)</span>
                            </span>
                          )}

                          {b.extraServices?.preCoolingTreatment && (
                            <span className="px-2.5 py-1 rounded-xl bg-sky-500/10 text-sky-300 font-bold border border-sky-500/20">
                              Rapid Pre-Cooling Requested
                            </span>
                          )}

                          {b.specialRequirements && (
                            <span className="text-[11px] text-slate-400 italic">
                              Note: "{b.specialRequirements}"
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: CHAMBERS & CAPACITY MANAGEMENT ================= */}
          {activeTab === 'chambers' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                <div>
                  <h2 className="text-lg font-black text-white">Chamber Matrix & Live Capacity Tuner</h2>
                  <p className="text-xs text-slate-400">
                    Real-time available capacity and seasonal tariff adjustments for your cold storages
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {facilities.map((facility) => {
                  const facTotalMT = facility.totalCapacity / 1000;
                  const facAvailMT = facility.availableCapacity / 1000;
                  const facOccMT = Math.max(0, facTotalMT - facAvailMT);
                  const facOccPct = Math.round((facOccMT / facTotalMT) * 100) || 0;

                  return (
                    <div
                      key={facility._id}
                      className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                              {facility.status.toUpperCase()}
                            </span>
                            {facility.verified && (
                              <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded border border-purple-500/30">
                                APEDA Certified
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-black text-white mt-1.5">{facility.name}</h3>
                          <p className="text-xs text-slate-400">
                            {facility.city}, Gujarat • Rate: ₹{facility.pricePerKg}/kg/month
                          </p>
                        </div>

                        <button
                          onClick={() => handleOpenCapacityModal(facility)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 border border-slate-700"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Tune Rate / Space</span>
                        </button>
                      </div>

                      {/* Capacity Gauge */}
                      <div className="space-y-1.5">
                        <div className="w-full h-3 rounded-full bg-slate-950 p-0.5 overflow-hidden border border-slate-800">
                          <div
                            style={{ width: `${facOccPct}%` }}
                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-400"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-amber-400">Occupied: {facOccMT.toLocaleString()} MT ({facOccPct}%)</span>
                          <span className="text-emerald-400">Vacant: {facAvailMT.toLocaleString()} MT</span>
                          <span className="text-slate-400">Total: {facTotalMT.toLocaleString()} MT</span>
                        </div>
                      </div>

                      {/* Chambers breakdown */}
                      <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                        <div className="flex items-center justify-between font-bold text-slate-300">
                          <span>Chamber Temperature Controls</span>
                          <span className="text-sky-400">{facility.temperatureMin}°C to {facility.temperatureMax}°C</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {facility.acceptedCrops?.map((crop) => (
                            <span
                              key={crop}
                              className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 text-[10px] font-semibold"
                            >
                              ✓ {crop}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 4: MY FACILITIES ================= */}
          {activeTab === 'facilities' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                <div>
                  <h2 className="text-lg font-black text-white">Registered Cold Storage Facilities</h2>
                  <p className="text-xs text-slate-400">
                    You have {facilities.length} active cold storage facility profile(s)
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('add')}
                  className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Register Another Storage</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {facilities.map((facility) => (
                  <div
                    key={facility._id}
                    className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          {facility.status}
                        </span>
                        <h3 className="text-base font-black text-white mt-1.5">{facility.name}</h3>
                        <p className="text-xs text-slate-400">{facility.address}, {facility.city}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400">Monthly Tariff</span>
                        <div className="text-base font-black text-emerald-400">₹{facility.pricePerKg}/kg</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 text-xs">
                      <div className="p-3 rounded-2xl bg-slate-950/60">
                        <span className="text-[10px] text-slate-400 block font-bold">Capacity</span>
                        <span className="font-black text-white">{(facility.totalCapacity / 1000).toLocaleString()} MT</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-950/60">
                        <span className="text-[10px] text-slate-400 block font-bold">Temp Range</span>
                        <span className="font-black text-sky-400">{facility.temperatureMin}°C - {facility.temperatureMax}°C</span>
                      </div>
                      <div className="p-3 rounded-2xl bg-slate-950/60">
                        <span className="text-[10px] text-slate-400 block font-bold">Handling</span>
                        <span className="font-black text-white">₹{facility.handlingCharge}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                      <span className="text-slate-400">Phone: <strong className="text-white">{facility.contactPhone}</strong></span>
                      <button
                        onClick={() => handleOpenCapacityModal(facility)}
                        className="text-emerald-400 hover:text-emerald-300 font-bold"
                      >
                        Adjust Rates &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 5: ADD NEW FACILITY ================= */}
          {activeTab === 'add' && (
            <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div>
                <h2 className="text-xl font-black text-white">Register New Cold Storage Facility</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Expand your storage network across Gujarat. Submitted facilities undergo quick APEDA verification.
                </p>
              </div>

              {formSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                  ✓ {formSuccess}
                </div>
              )}
              {formError && (
                <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold">
                  ✕ {formError}
                </div>
              )}

              <form onSubmit={handleCreateFacility} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Facility Name *</label>
                    <input
                      type="text"
                      required
                      value={newFacility.name}
                      onChange={(e) => setNewFacility({ ...newFacility, name: e.target.value })}
                      placeholder="e.g. Sardar Patel Cold Storage & Pack House"
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">City / District *</label>
                    <input
                      type="text"
                      required
                      value={newFacility.city}
                      onChange={(e) => setNewFacility({ ...newFacility, city: e.target.value, district: e.target.value })}
                      placeholder="e.g. Anand, Deesa, Ahmedabad"
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Address / Highway Location *</label>
                  <input
                    type="text"
                    required
                    value={newFacility.address}
                    onChange={(e) => setNewFacility({ ...newFacility, address: e.target.value })}
                    placeholder="Plot No., GIDC Industrial Estate, Highway Crossing"
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Total Capacity (kg) *</label>
                    <input
                      type="number"
                      required
                      value={newFacility.totalCapacity}
                      onChange={(e) => setNewFacility({ ...newFacility, totalCapacity: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Initial Available (kg) *</label>
                    <input
                      type="number"
                      required
                      value={newFacility.availableCapacity}
                      onChange={(e) => setNewFacility({ ...newFacility, availableCapacity: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Rate (₹/kg/month) *</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={newFacility.pricePerKg}
                      onChange={(e) => setNewFacility({ ...newFacility, pricePerKg: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Handling Fee (₹) *</label>
                    <input
                      type="number"
                      required
                      value={newFacility.handlingCharge}
                      onChange={(e) => setNewFacility({ ...newFacility, handlingCharge: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Min Temp (°C)</label>
                    <input
                      type="number"
                      value={newFacility.temperatureMin}
                      onChange={(e) => setNewFacility({ ...newFacility, temperatureMin: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Max Temp (°C)</label>
                    <input
                      type="number"
                      value={newFacility.temperatureMax}
                      onChange={(e) => setNewFacility({ ...newFacility, temperatureMax: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Accepted Crops (Comma separated)</label>
                  <input
                    type="text"
                    value={newFacility.acceptedCrops}
                    onChange={(e) => setNewFacility({ ...newFacility, acceptedCrops: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl transition-all cursor-pointer disabled:opacity-50"
                  >
                    {createLoading ? 'Registering Facility...' : 'Submit Facility for APEDA Verification'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ================= TAB 6: BILLING & GATE LEDGER ================= */}
          {activeTab === 'ledger' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                <div>
                  <h2 className="text-lg font-black text-white">Facility Revenue & Billings Ledger</h2>
                  <p className="text-xs text-slate-400">
                    Track all payments, cash receipts, and pending invoices for your cold storage units
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Paid Collections</span>
                    <span className="text-base font-black text-emerald-400">
                      ₹{Number(paidRevenue || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-400">
                  <DollarSign className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-bold">No ledger records matching criteria found.</p>
                </div>
              ) : (
                <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-4">Receipt # / Date</th>
                          <th className="p-4">Farmer Depositor</th>
                          <th className="p-4">Crop & Volume</th>
                          <th className="p-4">Total Amount</th>
                          <th className="p-4">Payment Method</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filteredBookings.map((b) => {
                          const isPaid = b.bill?.paymentStatus === 'paid';
                          return (
                            <tr key={b._id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="p-4">
                                <div className="font-black text-white">INV-{b._id.slice(-6).toUpperCase()}</div>
                                <div className="text-[10px] text-slate-400">
                                  {new Date(b.createdAt).toLocaleDateString('en-IN')}
                                </div>
                              </td>

                              <td className="p-4">
                                <div className="font-bold text-white">{b.farmerName}</div>
                                <div className="text-[10px] text-slate-400">{b.farmerPhone}</div>
                              </td>

                              <td className="p-4">
                                <div className="font-bold text-amber-300">{b.crop}</div>
                                <div className="text-[10px] text-slate-400">{Number(b.quantity).toLocaleString()} kg</div>
                              </td>

                              <td className="p-4 font-black text-white text-sm">
                                ₹{Number(b.bill?.total || b.totalCost).toLocaleString()}
                              </td>

                              <td className="p-4 text-slate-300">
                                {b.bill?.paymentMethod || 'Gate Cash / Offline'}
                              </td>

                              <td className="p-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                                    isPaid
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  }`}
                                >
                                  {isPaid ? 'PAID' : 'PENDING'}
                                </span>
                              </td>

                              <td className="p-4 text-right space-x-2">
                                {!isPaid && (
                                  <button
                                    onClick={() => handleOpenPaymentModal(b)}
                                    className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all cursor-pointer"
                                  >
                                    Record Paid
                                  </button>
                                )}
                                <button
                                  onClick={() => printGatePass(b)}
                                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer inline-flex items-center gap-1"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  <span>Print Pass</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ================= MODAL: RECORD PAYMENT ================= */}
      {paymentModalBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Record Farmer Payment</h3>
                <p className="text-xs text-slate-400">
                  {paymentModalBooking.farmerName} • ₹{Number(paymentModalBooking.bill?.total || paymentModalBooking.totalCost).toLocaleString()}
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmPayment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Payment Method</label>
                <select
                  value={paymentMethodInput}
                  onChange={(e) => setPaymentMethodInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="Cash at Gate Entry">Cash at Gate Entry</option>
                  <option value="UPI / QR Code Scan">UPI / QR Code Scan</option>
                  <option value="RTGS / NEFT Direct Bank">RTGS / NEFT Direct Bank</option>
                  <option value="Cheque / Draft">Cheque / Demand Draft</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Receipt / Transaction Ref Number</label>
                <input
                  type="text"
                  required
                  value={paymentTxnInput}
                  onChange={(e) => setPaymentTxnInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setPaymentModalBooking(null)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={paymentActionLoading}
                  className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black transition-all cursor-pointer disabled:opacity-50"
                >
                  {paymentActionLoading ? 'Saving...' : 'Confirm Payment Received'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: TUNE CAPACITY & RATES ================= */}
      {editingCapacityFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Quick Space & Tariff Tuner</h3>
                <p className="text-xs text-slate-400">{editingCapacityFacility.name}</p>
              </div>
            </div>

            <form onSubmit={handleSaveCapacityUpdate} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Available Intake Capacity (MT)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max={editingCapacityFacility.totalCapacity / 1000}
                  value={newAvailableCapacity}
                  onChange={(e) => setNewAvailableCapacity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Total Capacity: {(editingCapacityFacility.totalCapacity / 1000).toLocaleString()} MT
                </span>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Monthly Tariff Rate (₹ / kg / month)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={newTariffRate}
                  onChange={(e) => setNewTariffRate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingCapacityFacility(null)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={capacityUpdateLoading}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black transition-all cursor-pointer disabled:opacity-50"
                >
                  {capacityUpdateLoading ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
