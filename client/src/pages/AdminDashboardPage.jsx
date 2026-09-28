import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import {
  ShieldCheck,
  Building2,
  Users,
  Calendar,
  Scale,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  LogOut,
  RefreshCw,
  Sparkles,
  TrendingUp,
  DollarSign,
  Ban,
  Unlock,
  FileText,
  ArrowRight,
  Eye,
  Phone,
  Mail,
  MapPin,
  Wheat,
  Truck,
  Video,
  Percent,
  Download,
  Printer,
  Filter,
  ChevronRight,
  Activity,
  AlertCircle,
  Warehouse,
  BarChart3,
  Layers,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // Active top navigation tab
  // 'overview' | 'farmers' | 'owners' | 'occupancy' | 'transactions' | 'approvals'
  const [activeTab, setActiveTab] = useState('overview');

  // Core data states
  const [stats, setStats] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [owners, setOwners] = useState([]);
  const [occupancyList, setOccupancyList] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [storages, setStorages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'banned', 'paid', 'pending'

  // Ban/Unban Modal state
  const [banModalUser, setBanModalUser] = useState(null);
  const [banReasonInput, setBanReasonInput] = useState('');
  const [banActionLoading, setBanActionLoading] = useState(false);

  // Invoice Inspection Modal state
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth?tab=login&role=admin');
      return;
    }
    fetchAllAdminData();
  }, [isAuthenticated]);

  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, farmersRes, ownersRes, occRes, txnsRes, storagesRes] = await Promise.all([
        api.get('/admin/stats').catch((err) => ({ data: { stats: null } })),
        api.get('/admin/farmers').catch((err) => ({ data: { farmers: [] } })),
        api.get('/admin/owners').catch((err) => ({ data: { owners: [] } })),
        api.get('/admin/occupancy').catch((err) => ({ data: { storages: [] } })),
        api.get('/admin/transactions').catch((err) => ({ data: { transactions: [] } })),
        api.get('/admin/storages').catch((err) => ({ data: { storages: [] } })),
      ]);

      if (statsRes.data?.success) setStats(statsRes.data.stats);
      if (farmersRes.data?.success) setFarmers(farmersRes.data.farmers || []);
      if (ownersRes.data?.success) setOwners(ownersRes.data.owners || []);
      if (occRes.data?.success) setOccupancyList(occRes.data.storages || []);
      if (txnsRes.data?.success) setTransactions(txnsRes.data.transactions || []);
      if (storagesRes.data?.success) setStorages(storagesRes.data.storages || []);
    } catch (err) {
      console.error('Failed to load comprehensive admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllAdminData();
  };

  // Ban / Unban User Handler
  const handleOpenBanModal = (targetUser) => {
    setBanModalUser(targetUser);
    setBanReasonInput(targetUser.isBanned ? '' : 'Violation of platform safety and agricultural storage fair-trade guidelines.');
  };

  const handleConfirmBanToggle = async () => {
    if (!banModalUser) return;
    setBanActionLoading(true);
    try {
      const nextBanState = !banModalUser.isBanned;
      const res = await api.put(`/admin/users/${banModalUser._id}/ban`, {
        isBanned: nextBanState,
        banReason: nextBanState ? banReasonInput : '',
      });

      if (res.data?.success) {
        // Update local state directly for instant feedback
        setFarmers((prev) =>
          prev.map((f) =>
            f._id === banModalUser._id ? { ...f, isBanned: nextBanState, banReason: res.data.user.banReason } : f
          )
        );
        setOwners((prev) =>
          prev.map((o) =>
            o._id === banModalUser._id ? { ...o, isBanned: nextBanState, banReason: res.data.user.banReason } : o
          )
        );
        setBanModalUser(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user ban status');
    } finally {
      setBanActionLoading(false);
    }
  };

  // Facility Status Update (Approve / Reject / Verify)
  const handleFacilityStatusUpdate = async (storageId, newStatus, verified = true) => {
    setActionLoading(storageId);
    try {
      const res = await api.put(`/admin/storages/${storageId}/status`, {
        status: newStatus,
        verified,
      });
      if (res.data?.success) {
        await fetchAllAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update facility status');
    } finally {
      setActionLoading(null);
    }
  };

  // Filtered Farmers
  const filteredFarmers = useMemo(() => {
    return farmers.filter((f) => {
      const matchesSearch =
        !searchQuery ||
        f.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.phone?.includes(searchQuery) ||
        f.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.city?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && !f.isBanned) ||
        (statusFilter === 'banned' && f.isBanned);

      return matchesSearch && matchesStatus;
    });
  }, [farmers, searchQuery, statusFilter]);

  // Filtered Storage Owners
  const filteredOwners = useMemo(() => {
    return owners.filter((o) => {
      const matchesSearch =
        !searchQuery ||
        o.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.phone?.includes(searchQuery) ||
        o.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.facilities?.some((fac) => fac.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && !o.isBanned) ||
        (statusFilter === 'banned' && o.isBanned);

      return matchesSearch && matchesStatus;
    });
  }, [owners, searchQuery, statusFilter]);

  // Filtered Occupancy Storages
  const filteredOccupancy = useMemo(() => {
    return occupancyList.filter((s) => {
      const matchesSearch =
        !searchQuery ||
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.district?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'high' && s.occupancyPercentage >= 75) ||
        (statusFilter === 'full' && s.occupancyPercentage >= 95) ||
        (statusFilter === 'available' && s.occupancyPercentage < 75);

      return matchesSearch && matchesStatus;
    });
  }, [occupancyList, searchQuery, statusFilter]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        !searchQuery ||
        t.billNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.farmerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.farmerPhone?.includes(searchQuery) ||
        t.storageName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.crop?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'paid' && t.paymentStatus === 'paid') ||
        (statusFilter === 'pending' && t.paymentStatus !== 'paid');

      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchQuery, statusFilter]);

  const pendingApprovals = storages.filter((s) => s.status === 'pending');

  const printInvoiceWindow = (t) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${t.billNumber}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #1e293b; }
          .header { border-bottom: 2px solid #059669; padding-bottom: 20px; display: flex; justify-content: space-between; }
          .logo { font-size: 24px; font-weight: 900; color: #065f46; }
          .stamp { padding: 4px 12px; border: 2px solid #059669; color: #059669; font-weight: 800; border-radius: 8px; text-transform: uppercase; font-size: 13px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 30px 0; }
          .card { background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
          th { background: #f1f5f9; padding: 10px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #e2e8f0; }
          .total { font-size: 18px; font-weight: 900; color: #065f46; text-align: right; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">🌾 AgriCold Connect</div>
            <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Government of Gujarat APEDA & Agricultural Logistics Portal</p>
          </div>
          <div style="text-align: right;">
            <div class="stamp">${t.paymentStatus === 'paid' ? 'PAID OFFICIAL TAX INVOICE' : 'PENDING PAYMENT DEMAND'}</div>
            <p style="margin: 6px 0 0; font-size: 12px;">Invoice #: <strong>${t.billNumber}</strong></p>
            <p style="margin: 2px 0 0; font-size: 12px;">Txn ID: ${t.transactionId}</p>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <h4 style="margin:0 0 8px; color:#047857; text-transform:uppercase;">Farmer / Depositor</h4>
            <p style="margin:2px 0;"><strong>${t.farmerName}</strong></p>
            <p style="margin:2px 0;">Phone: ${t.farmerPhone}</p>
            ${t.farmerEmail ? `<p style="margin:2px 0;">Email: ${t.farmerEmail}</p>` : ''}
          </div>
          <div class="card">
            <h4 style="margin:0 0 8px; color:#047857; text-transform:uppercase;">Storage & Chamber Hub</h4>
            <p style="margin:2px 0;"><strong>${t.storageName}</strong></p>
            <p style="margin:2px 0;">Location: ${t.storageCity}, Gujarat</p>
            <p style="margin:2px 0;">Crop: <strong>${t.crop}</strong> (${Number(t.quantity).toLocaleString()} kg, ${t.durationDays} Days)</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: right;">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Cold Chamber Storage & Preservation Fee (${t.crop} - ${t.quantity} kg)</td>
              <td style="text-align: right;">₹${t.storageCost?.toLocaleString() || 0}</td>
            </tr>
            <tr>
              <td>Weighbridge, Quality Testing & Unloading Handling</td>
              <td style="text-align: right;">₹${t.handlingCost?.toLocaleString() || 0}</td>
            </tr>
            ${
              t.transportCost > 0
                ? `<tr><td>Farm-to-Coldstore Freight Logistics</td><td style="text-align: right;">₹${t.transportCost?.toLocaleString()}</td></tr>`
                : ''
            }
            ${
              t.extraServicesCost > 0
                ? `<tr><td>Value Added Services (24/7 CCTV / Pre-Cooling)</td><td style="text-align: right;">₹${t.extraServicesCost?.toLocaleString()}</td></tr>`
                : ''
            }
            <tr>
              <td>GST & Agricultural Cess (18%)</td>
              <td style="text-align: right;">₹${t.tax?.toLocaleString() || 0}</td>
            </tr>
          </tbody>
        </table>

        <div class="total">
          Total Payable Amount: ₹${Number(t.totalAmount || 0).toLocaleString()}
        </div>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center;">
          Certified digital receipt generated via AgriCold Gujarat Platform Command Center. Valid for APEDA and Mandi subsidy claims.
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans selection:bg-purple-500 selection:text-white">
      {/* ----------------- ADMIN COMMAND SIDEBAR ----------------- */}
      <aside className="w-full md:w-72 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between shrink-0 shadow-2xl z-30">
        <div className="space-y-6">
          {/* Logo / Brand Header */}
          <div className="flex items-center gap-3 pb-5 border-b border-slate-800/80">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-wide text-white">AgriCold Admin</span>
                <span className="text-[9px] bg-purple-500/20 text-purple-300 font-extrabold px-1.5 py-0.5 rounded border border-purple-500/40">
                  ROOT
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-medium">State Platform Command</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs font-semibold">
            {/* 1. Overview & P&N Financials */}
            <button
              onClick={() => {
                setActiveTab('overview');
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black shadow-lg shadow-purple-500/25'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <BarChart3 className="w-4 h-4 text-purple-400" />
                <span>Executive Overview & P&N</span>
              </div>
              {stats?.pnRatioText && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-black border border-emerald-500/30">
                  {stats.positivePercentage}% POS
                </span>
              )}
            </button>

            {/* 2. Farmers Directory */}
            <button
              onClick={() => {
                setActiveTab('farmers');
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all cursor-pointer ${
                activeTab === 'farmers'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black shadow-lg shadow-purple-500/25'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Wheat className="w-4 h-4 text-emerald-400" />
                <span>Farmers Directory</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-slate-300">
                {farmers.length}
              </span>
            </button>

            {/* 3. Storage Owners Directory */}
            <button
              onClick={() => {
                setActiveTab('owners');
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all cursor-pointer ${
                activeTab === 'owners'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black shadow-lg shadow-purple-500/25'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span>Storage Owners Directory</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-slate-300">
                {owners.length}
              </span>
            </button>

            {/* 4. Real-time Storage Occupancy */}
            <button
              onClick={() => {
                setActiveTab('occupancy');
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all cursor-pointer ${
                activeTab === 'occupancy'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black shadow-lg shadow-purple-500/25'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Cold Storage Occupancy</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-500/20 text-sky-300 border border-sky-500/30">
                {stats?.utilizationRate || 0}% Occ
              </span>
            </button>

            {/* 5. Transactions & Ledger */}
            <button
              onClick={() => {
                setActiveTab('transactions');
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all cursor-pointer ${
                activeTab === 'transactions'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black shadow-lg shadow-purple-500/25'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-teal-400" />
                <span>Transactions & Ledger</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-800 text-slate-300">
                {transactions.length}
              </span>
            </button>

            {/* 6. Facility Verification Approvals */}
            <button
              onClick={() => {
                setActiveTab('approvals');
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-left transition-all cursor-pointer ${
                activeTab === 'approvals'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black shadow-lg shadow-purple-500/25'
                  : 'hover:bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Verification Queue</span>
              </div>
              {pendingApprovals.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white shadow-sm">
                  {pendingApprovals.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* User Info & Sign Out Footer */}
        <div className="pt-6 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 flex items-center justify-center font-black text-xs">
                AD
              </div>
              <div>
                <div className="font-bold text-xs text-white">{user?.name || 'Administrator'}</div>
                <div className="text-[10px] text-purple-400 font-semibold">{user?.email}</div>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
              title="Refresh All Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 border border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Command</span>
          </button>
        </div>
      </aside>

      {/* ----------------- MAIN ADMIN WORKSPACE ----------------- */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-900/60 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                Platform Intelligence
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] text-slate-400 font-medium">MongoDB Atlas Live</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white capitalize">
              {activeTab === 'overview' && 'Executive Overview & Financials'}
              {activeTab === 'farmers' && 'Verified Farmers Registry'}
              {activeTab === 'owners' && 'Cold Storage Operators Directory'}
              {activeTab === 'occupancy' && 'Live Cold Storage Occupancy Monitor'}
              {activeTab === 'transactions' && 'Universal Transactions & Invoice Ledger'}
              {activeTab === 'approvals' && 'Regulatory Cold Store Audits & Badges'}
            </h1>
          </div>

          {/* Quick Search & Filters (Shown for list tabs) */}
          {activeTab !== 'overview' && (
            <div className="flex items-center gap-2.5 flex-1 max-w-md justify-end">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${activeTab}...`}
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 shadow-inner"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700/80 text-slate-300 text-xs rounded-2xl px-3 py-2 focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Status</option>
                {activeTab === 'farmers' || activeTab === 'owners' ? (
                  <>
                    <option value="active">Active Accounts</option>
                    <option value="banned">Suspended / Banned</option>
                  </>
                ) : null}
                {activeTab === 'occupancy' ? (
                  <>
                    <option value="available">Available Space (&lt;75%)</option>
                    <option value="high">High Occupancy (&gt;75%)</option>
                    <option value="full">Completely Full (&gt;95%)</option>
                  </>
                ) : null}
                {activeTab === 'transactions' ? (
                  <>
                    <option value="paid">Paid Transactions</option>
                    <option value="pending">Pending Payments</option>
                  </>
                ) : null}
              </select>
            </div>
          )}
        </header>

        {/* Main Content Viewport */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* ================= TAB 1: EXECUTIVE OVERVIEW & P&N ================= */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Primary KPI Ribbon */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Platform GMV */}
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Gross Platform Volume
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                      <DollarSign className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white">
                    ₹{Number(stats?.totalPlatformVolume || 0).toLocaleString()}
                  </div>
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1.5 mt-1 font-semibold">
                    <span>✓ ₹{Number(stats?.totalPaidVolume || 0).toLocaleString()} Collected</span>
                  </p>
                </div>

                {/* 2. Platform Facilitation Commission */}
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Net Platform Revenue (5%)
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-emerald-400">
                    ₹{Number(stats?.platformNetProfit || 0).toLocaleString()}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">
                    Platform commission margin
                  </p>
                </div>

                {/* 3. Storage Occupancy Utilization */}
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl group-hover:bg-sky-500/20 transition-all" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Overall State Occupancy
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold">
                      <Layers className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white">
                    {stats?.utilizationRate || 0}%
                  </div>
                  <p className="text-[11px] text-sky-400 mt-1 font-semibold">
                    {Number(stats?.occupiedCapacityMT || 0).toLocaleString()} MT / {Number(stats?.totalCapacityMT || 0).toLocaleString()} MT
                  </p>
                </div>

                {/* 4. Active Ecosystem Users */}
                <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Platform Stakeholders
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-white">
                    {farmers.length + owners.length} Accounts
                  </div>
                  <p className="text-[11px] text-amber-300 mt-1 font-semibold">
                    {farmers.length} Farmers • {owners.length} Storage Owners
                  </p>
                </div>
              </div>

              {/* HIGH-IMPACT P&N RATIO & OPERATIONAL HEALTH SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Positive vs Negative (P&N) Ratio Gauge */}
                <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-purple-950/40 border border-purple-500/30 shadow-2xl relative">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-500/40">
                          Efficiency & Reliability Ratio
                        </span>
                        <span className="text-xs text-slate-400">P&N Health Index</span>
                      </div>
                      <h3 className="text-xl font-black text-white mt-1">
                        Platform P&N Ratio: {stats?.pnRatioText || '100% Positive'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Ratio of confirmed storage reservations (Positive) vs cancelled or rejected requests (Negative).
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-3xl font-black text-emerald-400 block">
                        {stats?.positivePercentage || 100}%
                      </span>
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider font-bold">
                        Positive Fulfillment
                      </span>
                    </div>
                  </div>

                  {/* Dual Ratio Progress Bar */}
                  <div className="space-y-2">
                    <div className="w-full h-5 rounded-full bg-rose-950/60 p-1 flex overflow-hidden border border-slate-700/50">
                      <div
                        style={{ width: `${stats?.positivePercentage || 100}%` }}
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 shadow-lg shadow-emerald-500/30"
                      />
                    </div>
                    <div className="flex justify-between text-xs font-bold pt-1">
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Positive Operational Bookings: {stats?.positiveCount || 0}</span>
                      </span>
                      <span className="text-rose-400 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Negative / Rejected: {stats?.negativeCount || 0} ({stats?.negativePercentage || 0}%)</span>
                      </span>
                    </div>
                  </div>

                  {/* Insights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-6 mt-6 border-t border-slate-800">
                    <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Active Storage Runs
                      </span>
                      <span className="text-lg font-black text-white mt-0.5 block">
                        {stats?.activeBookings || 0} reservations
                      </span>
                      <span className="text-[10px] text-emerald-400">Currently in cold chambers</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Successfully Completed
                      </span>
                      <span className="text-lg font-black text-white mt-0.5 block">
                        {stats?.completedBookings || 0} releases
                      </span>
                      <span className="text-[10px] text-teal-400">Zero crop spoilage reported</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/40">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Banned Suspended Users
                      </span>
                      <span className="text-lg font-black text-rose-400 mt-0.5 block">
                        {stats?.bannedUsersCount || 0} accounts
                      </span>
                      <span className="text-[10px] text-slate-400">Restricted from operations</span>
                    </div>
                  </div>
                </div>

                {/* Quick Platform Actions & State summary */}
                <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-black text-white mb-1">State Platform Actions</h3>
                    <p className="text-xs text-slate-400 mb-4">
                      Direct shortcuts to administrative workflows.
                    </p>

                    <div className="space-y-2.5">
                      <button
                        onClick={() => setActiveTab('occupancy')}
                        className="w-full p-3 rounded-2xl bg-slate-800/70 hover:bg-slate-800 text-left flex items-center justify-between text-xs font-bold text-white transition-all cursor-pointer border border-slate-700/50"
                      >
                        <div className="flex items-center gap-2.5">
                          <Layers className="w-4 h-4 text-sky-400" />
                          <span>Inspect Storage Occupancy</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>

                      <button
                        onClick={() => setActiveTab('farmers')}
                        className="w-full p-3 rounded-2xl bg-slate-800/70 hover:bg-slate-800 text-left flex items-center justify-between text-xs font-bold text-white transition-all cursor-pointer border border-slate-700/50"
                      >
                        <div className="flex items-center gap-2.5">
                          <Wheat className="w-4 h-4 text-emerald-400" />
                          <span>Review Farmers & Ban Access</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>

                      <button
                        onClick={() => setActiveTab('transactions')}
                        className="w-full p-3 rounded-2xl bg-slate-800/70 hover:bg-slate-800 text-left flex items-center justify-between text-xs font-bold text-white transition-all cursor-pointer border border-slate-700/50"
                      >
                        <div className="flex items-center gap-2.5">
                          <DollarSign className="w-4 h-4 text-teal-400" />
                          <span>Audit Universal Ledger & GST</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>

                      {pendingApprovals.length > 0 && (
                        <button
                          onClick={() => setActiveTab('approvals')}
                          className="w-full p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-left flex items-center justify-between text-xs font-bold text-rose-300 transition-all cursor-pointer border border-rose-500/30"
                        >
                          <div className="flex items-center gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-rose-400" />
                            <span>Audit {pendingApprovals.length} Pending Storages</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-rose-400" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>APEDA Gujarat Portal v2.4</span>
                    <span className="text-emerald-400 font-bold">100% Operational</span>
                  </div>
                </div>
              </div>

              {/* RECENT TRANSACTIONS STREAM */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-white">Recent Transactions Stream</h3>
                    <p className="text-xs text-slate-400">Live booking invoices recorded on platform</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('transactions')}
                    className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All ({transactions.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3.5 rounded-l-xl">Invoice / Date</th>
                        <th className="p-3.5">Farmer</th>
                        <th className="p-3.5">Storage Facility</th>
                        <th className="p-3.5">Crop & Qty</th>
                        <th className="p-3.5">Amount</th>
                        <th className="p-3.5">Payment</th>
                        <th className="p-3.5 text-right rounded-r-xl">Receipt</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {transactions.slice(0, 5).map((t) => (
                        <tr key={t._id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5 font-bold text-white">
                            <div>{t.billNumber}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              {new Date(t.createdAt).toLocaleDateString('en-IN')}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="font-bold text-white">{t.farmerName}</div>
                            <div className="text-[10px] text-slate-400">{t.farmerPhone}</div>
                          </td>
                          <td className="p-3.5 font-medium text-slate-300">
                            <div>{t.storageName}</div>
                            <div className="text-[10px] text-slate-500">{t.storageCity}, Gujarat</div>
                          </td>
                          <td className="p-3.5">
                            <span className="font-bold text-amber-300">{t.crop}</span>
                            <div className="text-[10px] text-slate-400">{Number(t.quantity).toLocaleString()} kg</div>
                          </td>
                          <td className="p-3.5 font-black text-white">
                            ₹{Number(t.totalAmount || 0).toLocaleString()}
                          </td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                t.paymentStatus === 'paid'
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              }`}
                            >
                              {t.paymentStatus}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => printInvoiceWindow(t)}
                              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[11px] transition-all cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Print</span>
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

          {/* ================= TAB 2: FARMERS DIRECTORY ================= */}
          {activeTab === 'farmers' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                <div>
                  <h2 className="text-lg font-black text-white">Registered Farmers Directory</h2>
                  <p className="text-xs text-slate-400">
                    Showing {filteredFarmers.length} of {farmers.length} farmers across Gujarat
                  </p>
                </div>
              </div>

              {filteredFarmers.length === 0 ? (
                <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-400">
                  <Wheat className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-bold">No farmers matching criteria found.</p>
                </div>
              ) : (
                <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-4">Farmer Details</th>
                          <th className="p-4">Contact Info</th>
                          <th className="p-4">Location</th>
                          <th className="p-4">Reservations</th>
                          <th className="p-4">Volume & Crops</th>
                          <th className="p-4">Total Spent</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Admin Power</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filteredFarmers.map((f) => (
                          <tr
                            key={f._id}
                            className={`hover:bg-slate-800/40 transition-colors ${
                              f.isBanned ? 'bg-rose-950/20' : ''
                            }`}
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                                    f.isBanned
                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  }`}
                                >
                                  {f.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-black text-white text-sm">{f.name}</div>
                                  <div className="text-[10px] text-slate-400">
                                    Joined {new Date(f.createdAt).toLocaleDateString('en-IN')}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="p-4">
                              <div className="font-semibold text-slate-200">{f.phone}</div>
                              <div className="text-[10px] text-slate-400">{f.email}</div>
                            </td>

                            <td className="p-4 text-slate-300">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-emerald-400" />
                                <span>{f.city}, Gujarat</span>
                              </div>
                            </td>

                            <td className="p-4">
                              <span className="font-bold text-white text-xs">{f.totalBookings} total</span>
                              <div className="text-[10px] text-emerald-400 font-semibold">
                                {f.activeBookings} active storing
                              </div>
                            </td>

                            <td className="p-4">
                              <div className="font-black text-amber-300">
                                {Number(f.totalStoredKg || 0).toLocaleString()} kg
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {f.storedCrops?.length > 0 ? (
                                  f.storedCrops.map((c) => (
                                    <span
                                      key={c}
                                      className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-semibold"
                                    >
                                      {c}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[10px] text-slate-500">None yet</span>
                                )}
                              </div>
                            </td>

                            <td className="p-4 font-black text-emerald-400">
                              ₹{Number(f.totalSpent || 0).toLocaleString()}
                            </td>

                            <td className="p-4">
                              {f.isBanned ? (
                                <div>
                                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider inline-flex items-center gap-1">
                                    <Ban className="w-3 h-3" />
                                    <span>BANNED</span>
                                  </span>
                                  {f.banReason && (
                                    <p className="text-[9px] text-rose-400/80 mt-1 max-w-[150px] truncate" title={f.banReason}>
                                      {f.banReason}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>ACTIVE</span>
                                </span>
                              )}
                            </td>

                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleOpenBanModal(f)}
                                className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                                  f.isBanned
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                                    : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {f.isBanned ? (
                                  <>
                                    <Unlock className="w-3.5 h-3.5" />
                                    <span>Unban Access</span>
                                  </>
                                ) : (
                                  <>
                                    <Ban className="w-3.5 h-3.5" />
                                    <span>Ban Farmer</span>
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: STORAGE OWNERS DIRECTORY ================= */}
          {activeTab === 'owners' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                <div>
                  <h2 className="text-lg font-black text-white">Cold Storage Owners Registry</h2>
                  <p className="text-xs text-slate-400">
                    Showing {filteredOwners.length} of {owners.length} facility operators
                  </p>
                </div>
              </div>

              {filteredOwners.length === 0 ? (
                <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-400">
                  <Building2 className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-bold">No storage owners matching criteria found.</p>
                </div>
              ) : (
                <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-4">Owner Name</th>
                          <th className="p-4">Contact Info</th>
                          <th className="p-4">Managed Facilities</th>
                          <th className="p-4">Capacity Managed</th>
                          <th className="p-4">Occupied Volume</th>
                          <th className="p-4">Total Revenue</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Admin Power</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filteredOwners.map((o) => (
                          <tr
                            key={o._id}
                            className={`hover:bg-slate-800/40 transition-colors ${
                              o.isBanned ? 'bg-rose-950/20' : ''
                            }`}
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                                    o.isBanned
                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  }`}
                                >
                                  {o.name.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                  <div className="font-black text-white text-sm">{o.name}</div>
                                  <div className="text-[10px] text-slate-400">{o.city}, Gujarat</div>
                                </div>
                              </div>
                            </td>

                            <td className="p-4">
                              <div className="font-semibold text-slate-200">{o.phone}</div>
                              <div className="text-[10px] text-slate-400">{o.email}</div>
                            </td>

                            <td className="p-4">
                              <div className="font-bold text-white">{o.facilitiesCount} unit(s)</div>
                              <div className="space-y-0.5 mt-1">
                                {o.facilities?.slice(0, 2).map((fac) => (
                                  <div key={fac._id} className="text-[10px] text-slate-300 truncate max-w-[180px]">
                                    • {fac.name}
                                  </div>
                                ))}
                                {o.facilities?.length > 2 && (
                                  <div className="text-[9px] text-slate-500 font-semibold">
                                    +{o.facilities.length - 2} more
                                  </div>
                                )}
                              </div>
                            </td>

                            <td className="p-4 font-black text-sky-400">
                              {(o.totalCapacityManagedKg / 1000).toLocaleString()} MT
                            </td>

                            <td className="p-4 font-black text-amber-300">
                              {(o.totalOccupiedCapacityKg / 1000).toLocaleString()} MT
                            </td>

                            <td className="p-4 font-black text-emerald-400">
                              ₹{Number(o.totalRevenue || 0).toLocaleString()}
                            </td>

                            <td className="p-4">
                              {o.isBanned ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase tracking-wider inline-flex items-center gap-1">
                                  <Ban className="w-3 h-3" />
                                  <span>BANNED</span>
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>ACTIVE</span>
                                </span>
                              )}
                            </td>

                            <td className="p-4 text-right">
                              <button
                                onClick={() => handleOpenBanModal(o)}
                                className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                                  o.isBanned
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                                    : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                }`}
                              >
                                {o.isBanned ? (
                                  <>
                                    <Unlock className="w-3.5 h-3.5" />
                                    <span>Unban Owner</span>
                                  </>
                                ) : (
                                  <>
                                    <Ban className="w-3.5 h-3.5" />
                                    <span>Ban Owner</span>
                                  </>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 4: COLD STORAGE OCCUPANCY MONITOR ================= */}
          {activeTab === 'occupancy' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                <div>
                  <h2 className="text-lg font-black text-white">State Cold Storage Occupancy Monitor</h2>
                  <p className="text-xs text-slate-400">
                    Real-time chamber capacity and volume utilization across all {occupancyList.length} Gujarat facilities
                  </p>
                </div>
              </div>

              {filteredOccupancy.length === 0 ? (
                <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-400">
                  <Layers className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-bold">No cold storage facilities found matching criteria.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredOccupancy.map((s) => {
                    const isFull = s.occupancyPercentage >= 95;
                    const isHigh = s.occupancyPercentage >= 75 && !isFull;
                    const barColor = isFull
                      ? 'from-rose-500 to-rose-600'
                      : isHigh
                      ? 'from-amber-400 to-amber-500'
                      : 'from-emerald-400 to-teal-500';

                    return (
                      <div
                        key={s._id}
                        className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4 hover:border-slate-700 transition-all"
                      >
                        {/* Facility Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider border ${
                                  isFull
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                    : isHigh
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                }`}
                              >
                                {s.occupancyLevel}
                              </span>
                              {s.verified && (
                                <span className="text-[10px] bg-purple-500/20 text-purple-300 font-extrabold px-2 py-0.5 rounded border border-purple-500/30">
                                  APEDA Verified
                                </span>
                              )}
                            </div>
                            <h3 className="text-base font-black text-white mt-1.5">{s.name}</h3>
                            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                              <span>{s.city}, Gujarat • Phone: {s.contactPhone}</span>
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="text-2xl font-black text-white">{s.occupancyPercentage}%</span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                              Occupied
                            </span>
                          </div>
                        </div>

                        {/* Occupancy Progress Bar */}
                        <div className="space-y-1.5">
                          <div className="w-full h-3.5 rounded-full bg-slate-950 p-0.5 overflow-hidden border border-slate-800">
                            <div
                              style={{ width: `${s.occupancyPercentage}%` }}
                              className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-bold">
                            <span className="text-amber-300">
                              Occupied: {Number(s.occupiedCapacityMT || 0).toLocaleString()} MT
                            </span>
                            <span className="text-emerald-400">
                              Vacant: {Number(s.availableCapacityMT || 0).toLocaleString()} MT
                            </span>
                            <span className="text-slate-400">
                              Total: {Number(s.totalCapacityMT || 0).toLocaleString()} MT
                            </span>
                          </div>
                        </div>

                        {/* Chamber Visualization Breakdown */}
                        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-bold uppercase tracking-wider">
                              Chamber Stack Matrix ({s.totalChambers} Chambers)
                            </span>
                            <span className="text-slate-300 font-semibold">
                              {s.occupiedChambersCount} of {s.totalChambers} Active
                            </span>
                          </div>

                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                            {Array.from({ length: s.totalChambers }).map((_, idx) => {
                              const isChamberOccupied = idx < s.occupiedChambersCount;
                              return (
                                <div
                                  key={idx}
                                  className={`p-2 rounded-xl text-center border text-[10px] font-bold ${
                                    isChamberOccupied
                                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  }`}
                                  title={`Chamber #${idx + 1}: ${isChamberOccupied ? 'Occupied with Stored Crops' : 'Vacant Available'}`}
                                >
                                  CH-{idx + 1}
                                  <div className="text-[8px] font-normal opacity-80">
                                    {isChamberOccupied ? 'LOADED' : 'FREE'}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Stored Crops & Operator info */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Wheat className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-slate-400">Active Crops:</span>
                            <span className="text-white font-semibold">
                              {s.storedCrops?.join(', ') || 'Tomato, Potato'}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400">
                            Operator: <strong className="text-slate-200">{s.owner?.name || 'Authorized Owner'}</strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 5: TRANSACTIONS & UNIVERSAL LEDGER ================= */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                <div>
                  <h2 className="text-lg font-black text-white">Universal Transactions & Billing Ledger</h2>
                  <p className="text-xs text-slate-400">
                    Showing {filteredTransactions.length} of {transactions.length} platform transactions with GST compliance
                  </p>
                </div>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-400">
                  <DollarSign className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="font-bold">No transactions found matching criteria.</p>
                </div>
              ) : (
                <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-4">Invoice / Txn ID</th>
                          <th className="p-4">Farmer Depositor</th>
                          <th className="p-4">Facility Destination</th>
                          <th className="p-4">Crop & Volume</th>
                          <th className="p-4">Gross Amount</th>
                          <th className="p-4">Method</th>
                          <th className="p-4">Payment Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filteredTransactions.map((t) => (
                          <tr key={t._id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-4">
                              <div className="font-black text-white">{t.billNumber}</div>
                              <div className="text-[10px] text-purple-400 font-mono mt-0.5">
                                {t.transactionId}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-0.5">
                                {new Date(t.createdAt).toLocaleString('en-IN')}
                              </div>
                            </td>

                            <td className="p-4">
                              <div className="font-bold text-white">{t.farmerName}</div>
                              <div className="text-[10px] text-slate-400">{t.farmerPhone}</div>
                            </td>

                            <td className="p-4">
                              <div className="font-semibold text-slate-200">{t.storageName}</div>
                              <div className="text-[10px] text-slate-500">{t.storageCity}, Gujarat</div>
                            </td>

                            <td className="p-4">
                              <div className="font-bold text-amber-300">{t.crop}</div>
                              <div className="text-[10px] text-slate-400">
                                {Number(t.quantity).toLocaleString()} kg • {t.durationDays} Days
                              </div>
                            </td>

                            <td className="p-4 font-black text-white text-sm">
                              ₹{Number(t.totalAmount || 0).toLocaleString()}
                            </td>

                            <td className="p-4 text-slate-300">
                              {t.paymentMethod || 'Online Transfer'}
                            </td>

                            <td className="p-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center gap-1 ${
                                  t.paymentStatus === 'paid'
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                }`}
                              >
                                {t.paymentStatus === 'paid' ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>PAID</span>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="w-3 h-3" />
                                    <span>PENDING</span>
                                  </>
                                )}
                              </span>
                            </td>

                            <td className="p-4 text-right">
                              <button
                                onClick={() => printInvoiceWindow(t)}
                                className="px-3.5 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white font-bold text-xs transition-all cursor-pointer inline-flex items-center gap-1.5 border border-purple-500/40"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Receipt</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 6: FACILITY VERIFICATION QUEUE ================= */}
          {activeTab === 'approvals' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                <div>
                  <h2 className="text-lg font-black text-white">Cold Storage Regulatory Verification Queue</h2>
                  <p className="text-xs text-slate-400">
                    Review applicant facilities for diesel generator backup, APEDA compliance, and accurate temp ranges
                  </p>
                </div>
              </div>

              {pendingApprovals.length === 0 ? (
                <div className="p-12 text-center bg-slate-900 rounded-3xl border border-slate-800 text-slate-400 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="font-black text-white text-base">Verification Queue is Completely Clear!</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    All registered cold storage facilities meet regulatory standards and have been verified.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingApprovals.map((storage) => (
                    <div
                      key={storage._id}
                      className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-amber-500/40">
                            Pending State Audit
                          </span>
                          <h3 className="text-lg font-black text-white mt-1.5">{storage.name}</h3>
                          <p className="text-xs text-slate-400">
                            {storage.address}, {storage.city}, Gujarat • Phone: {storage.contactPhone}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleFacilityStatusUpdate(storage._id, 'approved', true)}
                            disabled={actionLoading === storage._id}
                            className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Approve & Grant Badge</span>
                          </button>
                          <button
                            onClick={() => handleFacilityStatusUpdate(storage._id, 'rejected', false)}
                            disabled={actionLoading === storage._id}
                            className="px-4 py-2 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-xs transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-800">
                        <div className="p-3 rounded-2xl bg-slate-950/60">
                          <span className="text-[10px] text-slate-400 block font-bold">Total Capacity</span>
                          <span className="font-black text-white">
                            {(storage.totalCapacity / 1000).toLocaleString()} MT
                          </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-950/60">
                          <span className="text-[10px] text-slate-400 block font-bold">Temp Range</span>
                          <span className="font-black text-sky-400">
                            {storage.temperatureMin}°C to {storage.temperatureMax}°C
                          </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-950/60">
                          <span className="text-[10px] text-slate-400 block font-bold">Tariff Rate</span>
                          <span className="font-black text-emerald-400">₹{storage.pricePerKg}/kg/month</span>
                        </div>
                        <div className="p-3 rounded-2xl bg-slate-950/60">
                          <span className="text-[10px] text-slate-400 block font-bold">Handling Fee</span>
                          <span className="font-black text-white">₹{storage.handlingCharge}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* ================= BAN / UNBAN REASON MODAL ================= */}
      {banModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  banModalUser.isBanned
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {banModalUser.isBanned ? <Unlock className="w-6 h-6" /> : <Ban className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-lg font-black text-white">
                  {banModalUser.isBanned ? 'Reinstate Account Access' : 'Suspend & Ban User Account'}
                </h3>
                <p className="text-xs text-slate-400">{banModalUser.name} ({banModalUser.role?.toUpperCase()})</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {banModalUser.isBanned
                ? 'Removing suspension will immediately restore access to booking storage, managing facilities, and logging into the platform.'
                : 'Suspending this user will immediately revoke login sessions and prevent any new reservations or facility edits.'}
            </p>

            {!banModalUser.isBanned && (
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Administrative Reason for Suspension *
                </label>
                <textarea
                  rows={3}
                  value={banReasonInput}
                  onChange={(e) => setBanReasonInput(e.target.value)}
                  placeholder="Specify violation (e.g. fraudulent billing, fake storage capacity, non-payment)..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setBanModalUser(null)}
                className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBanToggle}
                disabled={banActionLoading || (!banModalUser.isBanned && !banReasonInput.trim())}
                className={`px-5 py-2.5 rounded-2xl font-black text-xs text-white transition-all cursor-pointer disabled:opacity-50 ${
                  banModalUser.isBanned
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30'
                }`}
              >
                {banActionLoading
                  ? 'Processing...'
                  : banModalUser.isBanned
                  ? 'Confirm Reinstatement'
                  : 'Confirm Account Ban'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
