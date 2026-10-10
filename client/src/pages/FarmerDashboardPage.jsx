import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Wheat,
  ShieldCheck,
  Building2,
  Calendar,
  MapPin,
  Navigation,
  Phone,
  Mail,
  Clock,
  Download,
  Printer,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Eye,
  ArrowRight,
  DollarSign,
  FileText,
  ChevronRight,
  X,
  User,
  Truck,
  Layers,
  Thermometer,
  Sparkles,
  LogOut,
  Video,
  Snowflake,
  Sliders,
  Check,
  CreditCard,
  QrCode,
  Receipt,
  CheckCheck,
} from 'lucide-react';
import { resolveDistanceKm } from '../utils/geoUtils';

export default function FarmerDashboardPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, accepted, completed
  const [selectedBookingForBill, setSelectedBookingForBill] = useState(null);

  // Manage Optional Services State
  const [selectedBookingForServices, setSelectedBookingForServices] = useState(null);
  const [servicesFormState, setServicesFormState] = useState({
    transportGoods: false,
    pickupDistanceKm: 10,
    pickupWeightKg: 500,
    pickupAddress: '',
    cctvMonitoring: false,
    cctvOption: 'always', // 'always' or 'custom'
    cctvDays: 30,
    preCoolingTreatment: false,
    insurance: false,
  });
  const [updatingServices, setUpdatingServices] = useState(false);
  const [servicesSuccessMsg, setServicesSuccessMsg] = useState('');
  const [servicesErrorMsg, setServicesErrorMsg] = useState('');

  // Bill Payment State
  const [selectedBookingForPayment, setSelectedBookingForPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('upi'); // 'upi', 'card', 'netbanking', 'counter'
  const [selectedBank, setSelectedBank] = useState('State Bank of India');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [cardForm, setCardForm] = useState({ number: '', name: '', expiry: '', cvv: '' });

  useEffect(() => {
    // If auth state is determined and user is not logged in, redirect to auth
    if (!isAuthenticated) {
      navigate('/auth?role=farmer&redirect=/farmer');
      return;
    }

    fetchFarmerBookings();
  }, [isAuthenticated]);

  const fetchFarmerBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/bookings');
      if (res.data.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to load farmer bookings:', err);
      setError('Unable to load your bookings. Please check your connection and retry.');
    } finally {
      setLoading(false);
    }
  };

  const openManageServices = (booking) => {
    setSelectedBookingForServices(booking);
    const rawMode = booking.extraServices?.transportMode || (booking.extraServices?.transportGoods ? 'pickup' : 'none');
    setServicesFormState({
      transportMode: ['pickup', 'drop', 'both'].includes(rawMode) ? rawMode : 'none',
      pickupDistanceKm: booking.extraServices?.pickupDistanceKm || booking.distanceKm || 10,
      dropDistanceKm: booking.extraServices?.dropDistanceKm || booking.distanceKm || 10,
      pickupWeightKg: booking.extraServices?.pickupWeightKg || booking.quantity || 500,
      pickupAddress: booking.extraServices?.pickupAddress || '',
      dropAddress: booking.extraServices?.dropAddress || '',
      cctvMonitoring: Boolean(booking.extraServices?.cctvMonitoring),
      cctvOption: booking.extraServices?.cctvOption || 'always',
      cctvDays: booking.extraServices?.cctvDays || booking.durationDays || 30,
      preCoolingTreatment: Boolean(booking.extraServices?.preCoolingTreatment),
      insurance: Boolean(booking.extraServices?.insurance),
    });
    setServicesSuccessMsg('');
    setServicesErrorMsg('');
  };

  const handleModalPickupAddressChange = (val) => {
    const storageCity = selectedBookingForServices?.storageId?.city || 'Ahmedabad';
    const storageLat = selectedBookingForServices?.storageId?.latitude;
    const storageLng = selectedBookingForServices?.storageId?.longitude;
    const resolved = resolveDistanceKm(val, storageLat, storageLng, storageCity);
    setServicesFormState((prev) => ({
      ...prev,
      pickupAddress: val,
      pickupDistanceKm: resolved,
    }));
  };

  const handleModalDropAddressChange = (val) => {
    const storageCity = selectedBookingForServices?.storageId?.city || 'Ahmedabad';
    const storageLat = selectedBookingForServices?.storageId?.latitude;
    const storageLng = selectedBookingForServices?.storageId?.longitude;
    const resolved = resolveDistanceKm(val, storageLat, storageLng, storageCity);
    setServicesFormState((prev) => ({
      ...prev,
      dropAddress: val,
      dropDistanceKm: resolved,
    }));
  };

  const handleSaveServices = async (e) => {
    e.preventDefault();
    setUpdatingServices(true);
    setServicesSuccessMsg('');
    setServicesErrorMsg('');

    try {
      const duration = selectedBookingForServices.durationDays || 30;
      const effectiveCctvDays =
        servicesFormState.cctvOption === 'custom' && Number(servicesFormState.cctvDays) > 0
          ? Math.min(duration, Math.max(1, Number(servicesFormState.cctvDays)))
          : duration;

      const isTransportActive = servicesFormState.transportMode !== 'none';
      const pDist = Number(servicesFormState.pickupDistanceKm) || 10;
      const dDist = Number(servicesFormState.dropDistanceKm) || 10;
      const pWeight = Number(servicesFormState.pickupWeightKg) || selectedBookingForServices.quantity || 100;

      const res = await api.put(`/bookings/${selectedBookingForServices._id}/services`, {
        extraServices: {
          transportGoods: isTransportActive,
          transportMode: servicesFormState.transportMode,
          pickupDistanceKm: servicesFormState.transportMode === 'pickup' || servicesFormState.transportMode === 'both' ? pDist : 0,
          dropDistanceKm: servicesFormState.transportMode === 'drop' || servicesFormState.transportMode === 'both' ? dDist : 0,
          pickupWeightKg: pWeight,
          dropWeightKg: pWeight,
          pickupAddress: servicesFormState.transportMode === 'pickup' || servicesFormState.transportMode === 'both' ? servicesFormState.pickupAddress : '',
          dropAddress: servicesFormState.transportMode === 'drop' || servicesFormState.transportMode === 'both' ? servicesFormState.dropAddress : '',
          cctvMonitoring: servicesFormState.cctvMonitoring,
          cctvOption: servicesFormState.cctvOption,
          cctvDays: effectiveCctvDays,
          preCoolingTreatment: servicesFormState.preCoolingTreatment,
          insurance: servicesFormState.insurance,
        },
        pickupAddress: servicesFormState.pickupAddress,
      });

      if (res.data.success) {
        setServicesSuccessMsg('Optional services updated successfully! Itemized tax invoice recalculated.');
        setBookings((prev) =>
          prev.map((b) => (b._id === res.data.booking._id ? res.data.booking : b))
        );
        setTimeout(() => {
          setSelectedBookingForServices(null);
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to update services:', err);
      setServicesErrorMsg(err.response?.data?.message || 'Failed to update services. Please try again.');
    } finally {
      setUpdatingServices(false);
    }
  };

  const openPaymentModal = (booking) => {
    setSelectedBookingForPayment(booking);
    setPaymentSuccessData(null);
    setPaymentError('');
    setPaymentMethod('upi');
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    setPaymentProcessing(true);
    setPaymentError('');

    try {
      const methodLabel =
        paymentMethod === 'upi'
          ? 'UPI Instant (GPay / PhonePe / QR)'
          : paymentMethod === 'card'
          ? 'Debit / Credit Card'
          : paymentMethod === 'netbanking'
          ? `Net Banking (${selectedBank})`
          : 'Pay on Arrival / Counter at Facility';

      const generatedTxnId = `TXN-AGRI-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const res = await api.put(`/bookings/${selectedBookingForPayment._id}/pay`, {
        paymentMethod: methodLabel,
        transactionId: generatedTxnId,
      });

      if (res.data.success) {
        const updatedBooking = res.data.booking;
        setPaymentSuccessData({
          txnId: res.data.transactionId || generatedTxnId,
          method: methodLabel,
          amount: updatedBooking.bill?.total || selectedBookingForPayment.totalCost,
          date: res.data.paymentDate || new Date(),
          booking: updatedBooking,
        });

        // Update bookings list
        setBookings((prev) =>
          prev.map((b) => (b._id === updatedBooking._id ? updatedBooking : b))
        );

        // Also update selected booking for bill if currently open
        if (selectedBookingForBill && selectedBookingForBill._id === updatedBooking._id) {
          setSelectedBookingForBill(updatedBooking);
        }
      }
    } catch (err) {
      console.error('Payment failed:', err);
      setPaymentError(err.response?.data?.message || 'Payment processing failed. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  // KPI Statistics
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const acceptedCount = bookings.filter((b) => b.status === 'accepted').length;
  const totalCapacityKg = bookings
    .filter((b) => b.status === 'accepted' || b.status === 'pending')
    .reduce((sum, b) => sum + (Number(b.quantity) || 0), 0);
  const totalSpend = bookings
    .filter((b) => b.status === 'accepted')
    .reduce((sum, b) => sum + (Number(b.bill?.total || b.totalCost) || 0), 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Confirmed & Space Reserved
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Awaiting Facility Approval
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Declined by Facility
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Completed / Released
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const generateBillNumber = (bookingId) => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `BILL-${date}-${bookingId?.slice(-6).toUpperCase()}`;
  };

  const printBill = (booking) => {
    const billContent = generateBillHtml(booking);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(billContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  const downloadBill = (booking) => {
    const billContent = generateBillHtml(booking);
    const blob = new Blob([billContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${generateBillNumber(booking._id)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateBillHtml = (booking) => {
    const subtotal = booking.bill?.subtotal || booking.totalCost || 0;
    const tax = booking.bill?.tax || Math.round(subtotal * 0.18);
    const total = booking.bill?.total || subtotal + tax;
    const items = booking.bill?.items && booking.bill.items.length > 0
      ? booking.bill.items
      : [
          { description: `Cold Chamber Storage (${booking.crop} - ${booking.quantity} kg)`, total: booking.estimatedStorageCost },
          { description: 'Handling & Weighbridge Charge', total: booking.handlingCost },
          ...(booking.transportCost > 0 ? [{ description: `Road Transport Freight (${booking.distanceKm} km)`, total: booking.transportCost }] : []),
        ];

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Invoice - ${generateBillNumber(booking._id)}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 30px; color: #1e293b; background: #fff; }
          .invoice-box { max-width: 800px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #10b981; padding-bottom: 20px; }
          .brand { font-size: 24px; font-weight: 900; color: #065f46; }
          .brand span { color: #10b981; }
          .invoice-tag { text-align: right; }
          .invoice-tag h2 { margin: 0; font-size: 20px; color: #0f172a; }
          .invoice-tag p { margin: 4px 0 0; font-size: 13px; color: #64748b; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 28px 0; }
          .card { background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; }
          .card h4 { margin: 0 0 8px; font-size: 11px; text-transform: uppercase; color: #047857; letter-spacing: 0.5px; }
          .card p { margin: 3px 0; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th { background: #f1f5f9; padding: 12px; text-align: left; font-size: 12px; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
          td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          .text-right { text-align: right; }
          .totals-table { margin-top: 20px; width: 320px; margin-left: auto; }
          .totals-table td { padding: 8px 12px; border: none; }
          .grand-total { font-size: 18px; font-weight: 800; color: #065f46; border-top: 2px solid #10b981; }
          .status-badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-weight: 700; font-size: 11px; text-transform: uppercase; background: #fef3c7; color: #92400e; }
          .footer { margin-top: 36px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
          @media print {
            body { padding: 0; }
            .invoice-box { border: none; box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div class="brand">🌾 Agri<span>Cold</span> Connect</div>
            <div class="invoice-tag">
              <h2>TAX INVOICE / BOOKING RECEIPT</h2>
              <p>Invoice #: <strong>${generateBillNumber(booking._id)}</strong></p>
              <p>Generated: ${new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          <div class="details-grid">
            <div class="card">
              <h4>Farmer / Producer Details</h4>
              <p><strong>${booking.farmerName}</strong></p>
              <p>Phone: ${booking.farmerPhone}</p>
              ${booking.farmerEmail ? `<p>Email: ${booking.farmerEmail}</p>` : ''}
              <p>Registered Location: Gujarat, India</p>
            </div>

            <div class="card">
              <h4>Storage Facility Location</h4>
              <p><strong>${booking.storageName}</strong></p>
              <p>Target Crop: <strong>${booking.crop}</strong> (${Number(booking.quantity).toLocaleString('en-IN')} kg)</p>
              <p>Start Date: ${new Date(booking.startDate).toLocaleDateString('en-IN')} (${booking.durationDays} Days)</p>
              <p>Booking Status: <span class="status-badge">${booking.status?.toUpperCase()}</span></p>
            </div>
          </div>

          ${
            booking.bill?.paymentStatus === 'paid'
              ? `
            <div style="margin: 20px 0; padding: 14px 20px; background: #ecfdf5; border: 2px solid #059669; border-radius: 12px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <span style="color: #065f46; font-weight: 800; font-size: 14px; display: block;">✅ PAYMENT COMPLETED (OFFICIALLY PAID)</span>
                <p style="margin: 4px 0 0; color: #047857; font-size: 12px;">Method: <strong>${booking.bill?.paymentMethod || 'Online Transfer'}</strong> • Txn ID: <strong>${booking.bill?.transactionId || 'N/A'}</strong></p>
                <p style="margin: 2px 0 0; color: #065f46; font-size: 11px;">Payment Timestamp: ${new Date(booking.bill?.paymentDate || Date.now()).toLocaleString('en-IN')}</p>
              </div>
              <div style="border: 2px dashed #059669; color: #059669; font-weight: 900; font-size: 15px; padding: 6px 14px; border-radius: 8px; transform: rotate(-3deg); text-transform: uppercase;">
                PAID - TAX INVOICE
              </div>
            </div>
          `
              : `
            <div style="margin: 20px 0; padding: 12px 18px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px;">
              <span style="color: #92400e; font-weight: 700; font-size: 13px;">⏳ PAYMENT STATUS: PENDING SETTLEMENT</span>
              <p style="margin: 3px 0 0; color: #78350f; font-size: 12px;">Payable via AgriCold Instant UPI / Net Banking, or on crop arrival at facility counter.</p>
            </div>
          `
          }

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th class="text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (item) => `
                <tr>
                  <td>${item.description}</td>
                  <td class="text-right">₹${Number(item.total || 0).toLocaleString('en-IN')}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <table class="totals-table">
            <tr>
              <td>Subtotal Outlay:</td>
              <td class="text-right">₹${Number(subtotal).toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td>GST (18%):</td>
              <td class="text-right">₹${Number(tax).toLocaleString('en-IN')}</td>
            </tr>
            <tr class="grand-total">
              <td>Grand Total:</td>
              <td class="text-right">₹${Number(total).toLocaleString('en-IN')}</td>
            </tr>
          </table>

          <div class="footer">
            <p>AgriCold Connect • Fair Agricultural Cold Storage Infrastructure Marketplace for Gujarat Farmers</p>
            <p>This is an automated verified electronic invoice for reservation ID: ${booking._id}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16">
      {/* Top Banner / Farmer Header */}
      <section className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white pt-8 pb-12 px-4 sm:px-6 lg:px-8 border-b border-emerald-700/40 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-emerald-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-xl shadow-emerald-950/50 shrink-0">
              <Wheat className="w-8 h-8 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-400/30">
                  Verified Farmer Profile
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  ID: {user?._id?.slice(-6).toUpperCase()}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black mt-1">
                Welcome, {user?.name || 'Farmer'} 🌾
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 flex items-center gap-3 mt-1">
                <span>📞 {user?.phone || 'No phone registered'}</span>
                <span>•</span>
                <span>📍 {user?.city || 'Gujarat'}, India</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/transport"
              className="px-5 py-2.5 rounded-2xl bg-emerald-800/90 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-emerald-500/40"
            >
              <Truck className="w-4 h-4 text-amber-300" />
              <span>Transport & Fleet</span>
            </Link>

            <Link
              to="/storages"
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-amber-300"
            >
              <Search className="w-4 h-4" />
              <span>Book New Cold Storage</span>
            </Link>

            <button
              onClick={logout}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Bookings
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {bookings.length}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Confirmed Slots
              </span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">
                {acceptedCount}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Active Crop Reserved
              </span>
              <span className="text-2xl font-black text-amber-600 mt-1 block">
                {(totalCapacityKg / 1000).toFixed(1)} MT
              </span>
              <span className="text-[10px] text-slate-400">
                {totalCapacityKg.toLocaleString()} kg stored
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Wheat className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Pending Facility Review
              </span>
              <span className="text-2xl font-black text-slate-700 mt-1 block">
                {pendingCount}
              </span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* OPTIONAL SERVICES VALUE-ADDED SHOWCASE BANNER */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-3xl p-6 text-white shadow-md border border-emerald-800/40 overflow-hidden relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider border border-amber-400/30 mb-2">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Value-Added Optional Services Available</span>
              </div>
              <h3 className="text-lg font-black text-white">
                Protect Your Harvest with Optional Farm Add-Ons
              </h3>
              <p className="text-xs text-emerald-200/80 max-w-xl">
                You can attach doorstep farm logistics or round-the-clock camera surveillance to any of your active bookings below.
              </p>
            </div>

            <Link
              to="/transport"
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-md flex items-center gap-2 shrink-0 transition-transform hover:scale-105"
            >
              <Truck className="w-4 h-4 text-slate-950" />
              <span>Compare Transport Fleet Rates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-1">
            {/* 1. Farm Pickup & Drop */}
            <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs flex flex-col justify-between hover:bg-white/15 transition-all">
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                  <Truck className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-white flex items-center justify-between">
                  <span>Farm Pickup & Drop</span>
                  <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded font-black">
                    ₹500
                  </span>
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Refrigerated / ventilated transport dispatched directly to your field to pick up crops and deliver safely to cold storage.
                </p>
              </div>
              <span className="text-[10px] text-amber-300 font-extrabold pt-2 block">
                ✓ Eliminates open-tractor heat loss
              </span>
            </div>

            {/* 2. 24/7 CCTV Camera Surveillance */}
            <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs flex flex-col justify-between hover:bg-white/15 transition-all">
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-teal-400 text-slate-950 flex items-center justify-center font-black">
                  <Video className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-white flex items-center justify-between">
                  <span>24/7 CCTV Surveillance</span>
                  <span className="text-[10px] bg-teal-400 text-slate-950 px-1.5 py-0.5 rounded font-black">
                    ₹200
                  </span>
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Continuous 24/7 camera monitoring of your crop stacks throughout the entire storage duration with daily digital temperature logs.
                </p>
              </div>
              <span className="text-[10px] text-teal-300 font-extrabold pt-2 block">
                ✓ Full security & temperature proof
              </span>
            </div>

            {/* 3. Rapid Pre-Cooling */}
            <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs flex flex-col justify-between hover:bg-white/15 transition-all">
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-blue-400 text-slate-950 flex items-center justify-center font-black">
                  <Snowflake className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-white flex items-center justify-between">
                  <span>Rapid Pre-Cooling</span>
                  <span className="text-[10px] bg-blue-400 text-slate-950 px-1.5 py-0.5 rounded font-black">
                    ₹250
                  </span>
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Immediate field heat extraction upon arrival to double shelf life and maintain crop firmness.
                </p>
              </div>
              <span className="text-[10px] text-blue-300 font-extrabold pt-2 block">
                ✓ Prevents mold & weight loss
              </span>
            </div>

            {/* 4. APEDA Insurance */}
            <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xs flex flex-col justify-between hover:bg-white/15 transition-all">
              <div className="space-y-1.5">
                <div className="w-9 h-9 rounded-xl bg-purple-400 text-slate-950 flex items-center justify-center font-black">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-extrabold text-sm text-white flex items-center justify-between">
                  <span>Crop Spoilage Insurance</span>
                  <span className="text-[10px] bg-purple-400 text-slate-950 px-1.5 py-0.5 rounded font-black">
                    ₹300
                  </span>
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Government APEDA certified coverage reimbursing 90% crop value in case of unexpected cooling failure.
                </p>
              </div>
              <span className="text-[10px] text-purple-300 font-extrabold pt-2 block">
                ✓ Zero financial risk for farmers
              </span>
            </div>
          </div>
        </div>

        {/* INTEGRATED TRANSPORT & LOGISTICS PORTAL CARD */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-950 rounded-3xl p-6 text-white shadow-xl border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/20 shrink-0">
              <Truck className="w-7 h-7 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Live Transport Hub
                </span>
                <span className="text-xs text-emerald-300 font-semibold hidden sm:inline">
                  Farm Pickup • APMC Mandi Shuttle • Port Export Lines
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Need Dedicated Fleet or Mandi Delivery? Compare Transport Rates
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Connect directly with 20+ verified Gujarat carriers offering refrigerated reefers, tractor trolleys, and port container haulage (Mundra & Kandla APSEZ) with transparent ₹18–24/km rates and zero advance payment required.
              </p>
            </div>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Link
              to="/transport"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 border border-amber-300"
            >
              <Truck className="w-4 h-4 text-slate-950" />
              <span>Open Transport & Fleet Hub</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Content Section: Bookings & Filter */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Header & Filter Tabs */}
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Your Storage Reservations & Harvest Logs
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Track facility responses, attach optional services (pickup & drop, CCTV), and download verified tax invoices.
              </p>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold shrink-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All ({bookings.length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  statusFilter === 'pending'
                    ? 'bg-white text-amber-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Pending ({pendingCount})
              </button>
              <button
                onClick={() => setStatusFilter('accepted')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  statusFilter === 'accepted'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Confirmed ({acceptedCount})
              </button>
            </div>
          </div>

          {/* Bookings List Area */}
          <div className="p-6">
            {loading ? (
              <div className="py-20 text-center">
                <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs text-slate-500 font-bold">Loading your reservations...</p>
              </div>
            ) : error ? (
              <div className="py-12 text-center max-w-md mx-auto">
                <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">{error}</p>
                <button
                  onClick={fetchFarmerBookings}
                  className="mt-3 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
                >
                  Retry Loading
                </button>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="py-16 text-center max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <Wheat className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    No reservations found in this category
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Ready to protect your crops from market distress sales? Browse verified cold chambers nearby.
                  </p>
                </div>
                <Link
                  to="/storages"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <span>Explore Available Storages</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="p-5 rounded-3xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                  >
                    {/* Facility Info & Badge */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        {getStatusBadge(booking.status)}
                        <span className="text-[11px] font-mono text-slate-400">
                          Ref: #{booking._id?.slice(-6).toUpperCase()}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          • Booked on {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-black text-slate-900">
                          {booking.storageName}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            {booking.storageId?.address || 'Gujarat Cold Storage Corridor'} • {booking.distanceKm || 10} km distance
                          </span>
                        </p>
                      </div>

                      {/* Crop specs pill list */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-extrabold text-xs">
                          🌾 {booking.crop} — {Number(booking.quantity).toLocaleString()} kg
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
                          ⏱️ {booking.durationDays} Days Duration
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold text-xs">
                          🌡️ {booking.requiredTemp || 'Optimal Temp Zone'}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 font-bold text-xs">
                          📅 Arrival: {new Date(booking.startDate).toLocaleDateString('en-IN')}
                        </span>
                      </div>

                      {/* Active Optional Services Chips */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1.5">
                        {booking.extraServices?.transportGoods && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-extrabold text-[10px] border border-amber-300">
                            <Truck className="w-3 h-3 text-amber-700" />
                            {booking.extraServices?.transportMode === 'drop'
                              ? `🚛 Only Drop Active (${booking.extraServices?.dropDistanceKm || 10} km)`
                              : booking.extraServices?.transportMode === 'both'
                              ? `🔄 Both (Pick & Drop) Active (${booking.extraServices?.pickupDistanceKm || 10} km + ${booking.extraServices?.dropDistanceKm || 10} km)`
                              : `🚜 Only Pickup Active (${booking.extraServices?.pickupDistanceKm || 10} km)`}
                          </span>
                        )}
                        {booking.extraServices?.cctvMonitoring && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 font-extrabold text-[10px] border border-teal-300">
                            <Video className="w-3 h-3 text-teal-700" />
                            24/7 CCTV Active ({booking.extraServices?.cctvDays || booking.durationDays}d)
                          </span>
                        )}
                        {booking.extraServices?.preCoolingTreatment && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 font-extrabold text-[10px] border border-blue-300">
                            <Snowflake className="w-3 h-3 text-blue-700" />
                            Pre-Cooling Active
                          </span>
                        )}
                        {booking.extraServices?.insurance && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 font-extrabold text-[10px] border border-purple-300">
                            <ShieldCheck className="w-3 h-3 text-purple-700" />
                            APEDA Insured
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Pricing & Bill CTA Area */}
                    <div className="lg:border-l lg:border-slate-200 lg:pl-6 flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 shrink-0">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block lg:text-right">
                          Estimated Total Outlay
                        </span>
                        <div className="text-xl font-black text-emerald-700 lg:text-right">
                          ₹{Number(booking.bill?.total || booking.totalCost).toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] text-slate-400 block lg:text-right">
                          Includes Chamber + Services + GST
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Payment Button or Paid Status Badge */}
                        {booking.bill?.paymentStatus === 'paid' ? (
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-300 shadow-2xs">
                            <CheckCheck className="w-4 h-4 text-emerald-700" />
                            <span>Paid ({booking.bill?.paymentMethod || 'Online'})</span>
                          </span>
                        ) : (
                          <button
                            onClick={() => openPaymentModal(booking)}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs shadow-md shadow-emerald-800/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer border border-emerald-400/40"
                          >
                            <CreditCard className="w-4 h-4 text-amber-300" />
                            <span>Pay Bill (₹{Number(booking.bill?.total || booking.totalCost).toLocaleString('en-IN')})</span>
                          </button>
                        )}

                        {/* Manage Optional Services Button */}
                        <button
                          onClick={() => openManageServices(booking)}
                          className="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:border-emerald-600 bg-white text-slate-700 hover:text-emerald-800 hover:bg-emerald-50 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        >
                          <Sliders className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Optional Services</span>
                        </button>

                        {/* Compare & Book Dedicated Fleet */}
                        <Link
                          to={`/transport?crop=${encodeURIComponent(booking.crop)}&quantity=${booking.quantity}&pickupCity=${encodeURIComponent(user?.city || 'Sanand')}&distance=${booking.distanceKm || 25}&bookingId=${booking._id}`}
                          className="px-3.5 py-2.5 rounded-xl border border-emerald-300 hover:border-emerald-600 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
                          title="Compare transport carrier quotes and book fleet for this crop"
                        >
                          <Truck className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Fleet Deals</span>
                        </Link>

                        {/* View Official Bill Button */}
                        <button
                          onClick={() => setSelectedBookingForBill(booking)}
                          className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{booking.bill?.paymentStatus === 'paid' ? 'Paid Receipt' : 'Official Bill'}</span>
                        </button>

                        {/* Call Manager */}
                        {booking.storageId?.contactPhone && (
                          <a
                            href={`tel:${booking.storageId.contactPhone}`}
                            className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition-all text-xs font-bold flex items-center gap-1.5"
                            title="Call Storage Manager"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* MANAGE OPTIONAL SERVICES MODAL */}
      {selectedBookingForServices && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="text-base font-bold">
                    Manage Optional Services for {selectedBookingForServices.crop}
                  </h3>
                  <p className="text-xs text-emerald-100">
                    {selectedBookingForServices.storageName} • Ref: #{selectedBookingForServices._id?.slice(-6).toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBookingForServices(null)}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveServices} className="p-6 overflow-y-auto space-y-4 text-xs">
              {servicesSuccessMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{servicesSuccessMsg}</span>
                </div>
              )}

              {servicesErrorMsg && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{servicesErrorMsg}</span>
                </div>
              )}

              <p className="text-slate-600 leading-relaxed">
                Customize your agricultural care package. Any updated services will automatically update your booking record and generate a new itemized tax invoice.
              </p>

              <div className="space-y-3">
                {/* 1. Crops Transport Logistics: None, Only Pickup, Only Drop, Both */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    servicesFormState.transportMode !== 'none'
                      ? 'border-emerald-500 bg-emerald-50/80 shadow-xs ring-1 ring-emerald-400'
                      : 'border-slate-200 bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-emerald-700 shrink-0" />
                      <div>
                        <span className="font-black text-slate-900 text-xs sm:text-sm block">
                          Crops Transport Logistics (Optional)
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Base ₹250/trip + ₹18/km + ₹0.35/kg payload • Genuine Mandi Freight
                        </span>
                      </div>
                    </div>
                    {servicesFormState.transportMode !== 'none' && (
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full shrink-0 border border-emerald-300">
                        {servicesFormState.transportMode === 'pickup' &&
                          `+₹${250 + Math.round((Number(servicesFormState.pickupDistanceKm) || 10) * 18) + Math.round((Number(servicesFormState.pickupWeightKg) || 100) * 0.35)}`}
                        {servicesFormState.transportMode === 'drop' &&
                          `+₹${250 + Math.round((Number(servicesFormState.dropDistanceKm) || 10) * 18) + Math.round((Number(servicesFormState.pickupWeightKg) || 100) * 0.35)}`}
                        {servicesFormState.transportMode === 'both' &&
                          `+₹${500 + Math.round(((Number(servicesFormState.pickupDistanceKm) || 10) + (Number(servicesFormState.dropDistanceKm) || 10)) * 18) + Math.round((Number(servicesFormState.pickupWeightKg) || 100) * 0.7)}`}
                      </span>
                    )}
                  </div>

                  {/* 4 Mode Selector Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => setServicesFormState((prev) => ({ ...prev, transportMode: 'none' }))}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        servicesFormState.transportMode === 'none'
                          ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      None / Self Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => setServicesFormState((prev) => ({ ...prev, transportMode: 'pickup' }))}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        servicesFormState.transportMode === 'pickup'
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                      }`}
                    >
                      🚜 Only Pickup
                    </button>
                    <button
                      type="button"
                      onClick={() => setServicesFormState((prev) => ({ ...prev, transportMode: 'drop' }))}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        servicesFormState.transportMode === 'drop'
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                      }`}
                    >
                      🚛 Only Drop
                    </button>
                    <button
                      type="button"
                      onClick={() => setServicesFormState((prev) => ({ ...prev, transportMode: 'both' }))}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                        servicesFormState.transportMode === 'both'
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                      }`}
                    >
                      🔄 Both (Pick & Drop)
                    </button>
                  </div>

                  {/* Mode Details Form */}
                  {servicesFormState.transportMode !== 'none' && (
                    <div className="mt-3 pt-3 border-t border-emerald-200/60 space-y-3 text-xs" onClick={(e) => e.stopPropagation()}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Cargo Payload Weight (kg):
                          </label>
                          <input
                            type="number"
                            min="10"
                            value={servicesFormState.pickupWeightKg}
                            onChange={(e) =>
                              setServicesFormState((prev) => ({ ...prev, pickupWeightKg: e.target.value }))
                            }
                            className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                          />
                        </div>
                      </div>

                      {/* Pickup fields */}
                      {(servicesFormState.transportMode === 'pickup' || servicesFormState.transportMode === 'both') && (
                        <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Farm Pickup Location / Village / Mandi:</span>
                            </label>
                            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              Trip 1: Farm → Storage
                            </span>
                          </div>
                          <input
                            type="text"
                            value={servicesFormState.pickupAddress}
                            onChange={(e) => handleModalPickupAddressChange(e.target.value)}
                            placeholder="e.g. Sanand, Bavla, Gondal, Deesa, Anand APMC..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                          />
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-600">Calculated Distance:</span>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="1"
                                  value={servicesFormState.pickupDistanceKm}
                                  onChange={(e) =>
                                    setServicesFormState((prev) => ({ ...prev, pickupDistanceKm: e.target.value }))
                                  }
                                  className="w-16 px-2 py-1 rounded-lg border border-emerald-300 font-bold text-center text-xs bg-emerald-50/50"
                                />
                                <span className="font-bold text-emerald-800">km</span>
                              </div>
                            </div>
                            <span className="text-emerald-900 font-bold bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                              Fare: Base ₹250 + ₹{Math.round((Number(servicesFormState.pickupDistanceKm) || 10) * 18)} (dist) + ₹{Math.round((Number(servicesFormState.pickupWeightKg) || 100) * 0.35)} (wt) = ₹{250 + Math.round((Number(servicesFormState.pickupDistanceKm) || 10) * 18) + Math.round((Number(servicesFormState.pickupWeightKg) || 100) * 0.35)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Drop fields */}
                      {(servicesFormState.transportMode === 'drop' || servicesFormState.transportMode === 'both') && (
                        <div className="p-3 rounded-xl bg-white border border-emerald-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                              <Navigation className="w-3.5 h-3.5 text-teal-600" />
                              <span>Drop / Delivery Destination / Mandi / Buyer:</span>
                            </label>
                            <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                              {servicesFormState.transportMode === 'both' ? 'Trip 2: Storage → Mandi' : 'Trip: Storage → Mandi'}
                            </span>
                          </div>
                          <input
                            type="text"
                            value={servicesFormState.dropAddress}
                            onChange={(e) => handleModalDropAddressChange(e.target.value)}
                            placeholder="e.g. Naroda APMC Mandi, Rajkot, Surat, Ahmedabad..."
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                          />
                          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-600">Calculated Distance:</span>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min="1"
                                  value={servicesFormState.dropDistanceKm}
                                  onChange={(e) =>
                                    setServicesFormState((prev) => ({ ...prev, dropDistanceKm: e.target.value }))
                                  }
                                  className="w-16 px-2 py-1 rounded-lg border border-emerald-300 font-bold text-center text-xs bg-emerald-50/50"
                                />
                                <span className="font-bold text-emerald-800">km</span>
                              </div>
                            </div>
                            <span className="text-emerald-900 font-bold bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                              Fare: Base ₹250 + ₹{Math.round((Number(servicesFormState.dropDistanceKm) || 10) * 18)} (dist) + ₹{Math.round((Number(servicesFormState.pickupWeightKg) || 100) * 0.35)} (wt) = ₹{250 + Math.round((Number(servicesFormState.dropDistanceKm) || 10) * 18) + Math.round((Number(servicesFormState.pickupWeightKg) || 100) * 0.35)}
                            </span>
                          </div>
                        </div>
                      )}

                      {servicesFormState.transportMode === 'both' && (
                        <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-950 text-xs flex justify-between items-center font-bold">
                          <span>Combined Transport Outlay (2 Trips: Pickup + Drop):</span>
                          <span className="font-black text-sm text-emerald-900">
                            = ₹{500 + Math.round(((Number(servicesFormState.pickupDistanceKm) || 10) + (Number(servicesFormState.dropDistanceKm) || 10)) * 18) + Math.round((Number(servicesFormState.pickupWeightKg) || 100) * 0.7)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. 24/7 CCTV Camera Surveillance */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    servicesFormState.cctvMonitoring
                      ? 'border-teal-500 bg-teal-50/80 shadow-xs ring-1 ring-teal-400'
                      : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
                  }`}
                >
                  <div
                    onClick={() =>
                      setServicesFormState((prev) => ({ ...prev, cctvMonitoring: !prev.cctvMonitoring }))
                    }
                    className="flex items-start gap-3 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={servicesFormState.cctvMonitoring}
                      onChange={() => {}}
                      className="mt-1 rounded text-teal-600 focus:ring-teal-500 pointer-events-none"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                          <Video className="w-4 h-4 text-teal-700" />
                          24/7 CCTV Camera Surveillance & Chamber Feed
                        </span>
                        <span className="text-xs font-black text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full shrink-0">
                          ₹1,000/day
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Round-the-clock 24/7 digital CCTV recording of your stored crop bays. Choose between full storage duration (Always) or customizable specific surveillance days.
                      </p>
                    </div>
                  </div>

                  {servicesFormState.cctvMonitoring && (
                    <div className="mt-3 pt-3 border-t border-teal-200/60 space-y-2.5 text-xs" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setServicesFormState((prev) => ({ ...prev, cctvOption: 'always' }))}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            servicesFormState.cctvOption === 'always'
                              ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-teal-50'
                          }`}
                        >
                          Always (Full Duration: {selectedBookingForServices.durationDays} Days)
                        </button>
                        <button
                          type="button"
                          onClick={() => setServicesFormState((prev) => ({ ...prev, cctvOption: 'custom' }))}
                          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            servicesFormState.cctvOption === 'custom'
                              ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-teal-50'
                          }`}
                        >
                          Custom Specific Days
                        </button>
                      </div>

                      {servicesFormState.cctvOption === 'custom' && (
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Number of Days for CCTV Camera Surveillance (Max: {selectedBookingForServices.durationDays} Days):
                          </label>
                          <input
                            type="number"
                            min="1"
                            max={selectedBookingForServices.durationDays}
                            value={servicesFormState.cctvDays}
                            onChange={(e) =>
                              setServicesFormState((prev) => ({ ...prev, cctvDays: e.target.value }))
                            }
                            className="w-full px-3 py-2 rounded-xl border border-teal-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden bg-white"
                          />
                        </div>
                      )}

                      {(() => {
                        const days =
                          servicesFormState.cctvOption === 'custom' && Number(servicesFormState.cctvDays) > 0
                            ? Math.min(selectedBookingForServices.durationDays, Math.max(1, Number(servicesFormState.cctvDays)))
                            : selectedBookingForServices.durationDays;
                        const cctvCost = days * 1000;
                        return (
                          <div className="p-2.5 rounded-xl bg-teal-100/70 text-teal-950 text-xs flex items-center justify-between font-semibold">
                            <span>₹1,000 / day × {days} days surveillance</span>
                            <span className="font-extrabold text-sm text-teal-900">= ₹{cctvCost.toLocaleString('en-IN')}</span>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* 3. Rapid Pre-Cooling Treatment */}
                <div
                  onClick={() =>
                    setServicesFormState((prev) => ({
                      ...prev,
                      preCoolingTreatment: !prev.preCoolingTreatment,
                    }))
                  }
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                    servicesFormState.preCoolingTreatment
                      ? 'border-blue-500 bg-blue-50/80 shadow-xs ring-1 ring-blue-400'
                      : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={servicesFormState.preCoolingTreatment}
                    onChange={() => {}}
                    className="mt-1 rounded text-blue-600 focus:ring-blue-500 pointer-events-none"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                        <Snowflake className="w-4 h-4 text-blue-700" />
                        Rapid Core Pre-Cooling Treatment
                      </span>
                      <span className="text-xs font-black text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full shrink-0">
                        +₹250
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Removes core agricultural field heat rapidly upon arrival in the intake dock to double shelf life and prevent moisture decay.
                    </p>
                  </div>
                </div>

                {/* 4. APEDA Spoilage Insurance */}
                <div
                  onClick={() =>
                    setServicesFormState((prev) => ({ ...prev, insurance: !prev.insurance }))
                  }
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                    servicesFormState.insurance
                      ? 'border-purple-500 bg-purple-50/80 shadow-xs ring-1 ring-purple-400'
                      : 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={servicesFormState.insurance}
                    onChange={() => {}}
                    className="mt-1 rounded text-purple-600 focus:ring-purple-500 pointer-events-none"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-purple-700" />
                        APEDA Standard Crop Spoilage Insurance
                      </span>
                      <span className="text-xs font-black text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full shrink-0">
                        +₹300
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Official policy covering 90% crop inventory value against equipment failure or sudden cooling disruption.
                    </p>
                  </div>
                </div>
              </div>

              {/* Recalculated Live Cost Preview */}
              {(() => {
                const baseStorage = (selectedBookingForServices.estimatedStorageCost || 0) + (selectedBookingForServices.handlingCost || 0);
                const mode = servicesFormState.transportMode || 'none';
                const transitFreight = mode !== 'none' ? 0 : (selectedBookingForServices.transportCost || 0);
                
                const pDist = Math.max(1, Number(servicesFormState.pickupDistanceKm) || 10);
                const dDist = Math.max(1, Number(servicesFormState.dropDistanceKm) || 10);
                const pWeight = Math.max(10, Number(servicesFormState.pickupWeightKg) || selectedBookingForServices.quantity || 100);
                const weightCharge = Math.round(pWeight * 0.35);

                const singlePickupFare = 250 + Math.round(pDist * 18) + weightCharge;
                const singleDropFare = 250 + Math.round(dDist * 18) + weightCharge;

                let transportFare = 0;
                if (mode === 'pickup') transportFare = singlePickupFare;
                else if (mode === 'drop') transportFare = singleDropFare;
                else if (mode === 'both') transportFare = singlePickupFare + singleDropFare;

                // CCTV Fare
                const cctvDays =
                  servicesFormState.cctvOption === 'custom' && Number(servicesFormState.cctvDays) > 0
                    ? Math.min(selectedBookingForServices.durationDays, Math.max(1, Number(servicesFormState.cctvDays)))
                    : selectedBookingForServices.durationDays;
                const cctvFare = servicesFormState.cctvMonitoring ? (cctvDays * 1000) : 0;

                let otherExtras = 0;
                if (servicesFormState.preCoolingTreatment) otherExtras += 250;
                if (servicesFormState.insurance) otherExtras += 300;

                const totalExtras = transportFare + cctvFare + otherExtras;
                const subtotal = baseStorage + transitFreight + totalExtras;
                const tax = Math.round(subtotal * 0.18);
                const grand = subtotal + tax;

                return (
                  <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 space-y-1.5 text-xs text-amber-950">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Base Chamber Storage & Labor Handling:</span>
                      <span className="font-bold">₹{baseStorage.toLocaleString('en-IN')}</span>
                    </div>
                    {mode !== 'none' ? (
                      <div className="flex justify-between text-emerald-800">
                        <span>
                          {mode === 'pickup'
                            ? `Doorstep Farm Pickup (${pDist} km, ${pWeight} kg)`
                            : mode === 'drop'
                            ? `Cold Storage Drop to Mandi (${dDist} km, ${pWeight} kg)`
                            : `Both Pickup & Drop (${pDist} + ${dDist} km, ${pWeight} kg)`}:
                        </span>
                        <span className="font-extrabold">+₹{transportFare.toLocaleString('en-IN')}</span>
                      </div>
                    ) : (
                      transitFreight > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Standard Transit Freight:</span>
                          <span className="font-bold">₹{transitFreight.toLocaleString('en-IN')}</span>
                        </div>
                      )
                    )}
                    {servicesFormState.cctvMonitoring && (
                      <div className="flex justify-between text-teal-800">
                        <span>24/7 CCTV Camera Surveillance ({cctvDays} days @ ₹1,000/day):</span>
                        <span className="font-extrabold">+₹{cctvFare.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    {otherExtras > 0 && (
                      <div className="flex justify-between text-blue-800">
                        <span>Other Selected Services (Pre-cooling / Insurance):</span>
                        <span className="font-extrabold">+₹{otherExtras.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-600">GST (18% Govt standard):</span>
                      <span className="font-bold">₹{tax.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-emerald-800 pt-2 border-t border-amber-200">
                      <span>Updated Total Outlay:</span>
                      <span>₹{grand.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForServices(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingServices}
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{updatingServices ? 'Updating Services...' : 'Save & Update Services'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bill & Invoice Preview Modal */}
      {selectedBookingForBill && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-amber-300" />
                <div>
                  <h3 className="text-base font-bold">
                    Official Storage Invoice & Verification
                  </h3>
                  <p className="text-xs text-emerald-100">
                    Bill Ref: {generateBillNumber(selectedBookingForBill._id)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBookingForBill(null)}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Top Two Column Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Farmer (Invoice To)
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    {selectedBookingForBill.farmerName}
                  </p>
                  <p className="text-slate-600">📞 {selectedBookingForBill.farmerPhone}</p>
                  {selectedBookingForBill.farmerEmail && (
                    <p className="text-slate-600">✉️ {selectedBookingForBill.farmerEmail}</p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Cold Storage Facility
                  </span>
                  <p className="text-sm font-bold text-slate-900">
                    {selectedBookingForBill.storageName}
                  </p>
                  <p className="text-slate-600">
                    🌾 Crop: {selectedBookingForBill.crop} ({selectedBookingForBill.quantity} kg)
                  </p>
                  <p className="text-slate-600">
                    ⏱️ Duration: {selectedBookingForBill.durationDays} Days (From{' '}
                    {new Date(selectedBookingForBill.startDate).toLocaleDateString('en-IN')})
                  </p>
                </div>
              </div>

              {/* Itemized Outlay Table */}
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Service Description</th>
                      <th className="p-3 text-right">Cost (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {selectedBookingForBill.bill?.items && selectedBookingForBill.bill.items.length > 0 ? (
                      selectedBookingForBill.bill.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-3 font-medium">{item.description}</td>
                          <td className="p-3 text-right font-bold">
                            ₹{Number(item.total).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <>
                        <tr>
                          <td className="p-3 font-medium">
                            Chamber Storage ({selectedBookingForBill.crop} - {selectedBookingForBill.quantity} kg)
                          </td>
                          <td className="p-3 text-right font-bold">
                            ₹{Number(selectedBookingForBill.estimatedStorageCost).toLocaleString('en-IN')}
                          </td>
                        </tr>
                        <tr>
                          <td className="p-3 font-medium">Unloading & Weighing Handling</td>
                          <td className="p-3 text-right font-bold">
                            ₹{Number(selectedBookingForBill.handlingCost).toLocaleString('en-IN')}
                          </td>
                        </tr>
                        {selectedBookingForBill.transportCost > 0 && (
                          <tr>
                            <td className="p-3 font-medium">
                              Road Transit Freight ({selectedBookingForBill.distanceKm} km)
                            </td>
                            <td className="p-3 text-right font-bold">
                              ₹{Number(selectedBookingForBill.transportCost).toLocaleString('en-IN')}
                            </td>
                          </tr>
                        )}
                      </>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Subtotal, Tax and Total */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 text-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Subtotal Services:</span>
                  <span className="font-bold">
                    ₹{Number(selectedBookingForBill.bill?.subtotal || selectedBookingForBill.totalCost).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">GST (18% Govt standard):</span>
                  <span className="font-bold">
                    ₹{Number(selectedBookingForBill.bill?.tax || Math.round((selectedBookingForBill.totalCost || 0) * 0.18)).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-base font-black text-emerald-800 pt-2 border-t border-emerald-200">
                  <span>Grand Total Outlay:</span>
                  <span>
                    ₹{Number(selectedBookingForBill.bill?.total || Math.round((selectedBookingForBill.totalCost || 0) * 1.18)).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Payment Verification Status in Invoice Modal */}
              {selectedBookingForBill.bill?.paymentStatus === 'paid' ? (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-extrabold text-xs block">Official Tax Invoice Paid & Verified</span>
                      <span className="text-[11px] text-emerald-700">
                        Method: {selectedBookingForBill.bill?.paymentMethod || 'Online Transfer'} • Txn Ref: {selectedBookingForBill.bill?.transactionId || 'VERIFIED'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-900 bg-emerald-200/90 px-3 py-1 rounded-full uppercase border border-emerald-300">
                    PAID
                  </span>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-bold text-xs block">Invoice Awaiting Payment Settlement</span>
                      <span className="text-[11px] text-amber-800">
                        Pay instantly via UPI / Card or directly upon crop arrival at the intake gate.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                💡 <strong>Payment terms:</strong> Cold chamber storage, transportation freight, and optional value-added services are protected under APEDA and Gujarat Warehousing Regulation terms.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              <div className="flex items-center gap-2">
                {selectedBookingForBill.bill?.paymentStatus !== 'paid' && (
                  <button
                    onClick={() => {
                      const b = selectedBookingForBill;
                      setSelectedBookingForBill(null);
                      openPaymentModal(b);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer border border-emerald-400/30"
                  >
                    <CreditCard className="w-4 h-4 text-amber-300" />
                    <span>Pay Bill (₹{Number(selectedBookingForBill.bill?.total || selectedBookingForBill.totalCost).toLocaleString('en-IN')})</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => printBill(selectedBookingForBill)}
                  className="px-4 py-2 rounded-xl border border-slate-300 hover:border-emerald-600 bg-white text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-emerald-600" />
                  <span>Print Invoice</span>
                </button>

                <button
                  onClick={() => downloadBill(selectedBookingForBill)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECURE BILL PAYMENT MODAL */}
      {selectedBookingForPayment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md">
                  <CreditCard className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    Secure Cold Storage Bill Payment
                  </h3>
                  <p className="text-xs text-emerald-100">
                    Booking #{selectedBookingForPayment._id?.slice(-6).toUpperCase()} • {selectedBookingForPayment.storageName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedBookingForPayment(null);
                  setPaymentSuccessData(null);
                }}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {paymentSuccessData ? (
                /* SUCCESS RECEIPT VIEW */
                <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
                  <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
                      Payment Received Successfully!
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 mt-2">
                      ₹{Number(paymentSuccessData.amount).toLocaleString('en-IN')}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Your cold chamber reservation and all selected optional services are officially confirmed.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs max-w-sm mx-auto">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Transaction ID:</span>
                      <span className="font-mono font-bold text-slate-800">{paymentSuccessData.txnId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment Mode:</span>
                      <span className="font-bold text-slate-800">{paymentSuccessData.method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment Date:</span>
                      <span className="font-bold text-slate-800">
                        {new Date(paymentSuccessData.date).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Facility:</span>
                      <span className="font-bold text-slate-800">{selectedBookingForPayment.storageName}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 font-bold">
                      <span className="text-slate-700">Official Status:</span>
                      <span className="text-emerald-700">PAID & SETTLED</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        const paidBooking = paymentSuccessData.booking;
                        setSelectedBookingForPayment(null);
                        setPaymentSuccessData(null);
                        setSelectedBookingForBill(paidBooking);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Receipt className="w-4 h-4" />
                      <span>View Official Tax Invoice</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedBookingForPayment(null);
                        setPaymentSuccessData(null);
                      }}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              ) : (
                /* PAYMENT CHECKOUT FORM */
                <form onSubmit={handleProcessPayment} className="space-y-4">
                  {paymentError && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{paymentError}</span>
                    </div>
                  )}

                  {/* Summary Card */}
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">
                        Cold Storage Chamber ({selectedBookingForPayment.crop} • {selectedBookingForPayment.quantity} kg • {selectedBookingForPayment.durationDays} Days):
                      </span>
                      <span className="font-bold text-slate-800">
                        ₹{Number(selectedBookingForPayment.estimatedStorageCost).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-600">Labor Handling, Weighing & Unloading:</span>
                      <span className="font-bold text-slate-800">
                        ₹{Number(selectedBookingForPayment.handlingCost).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {selectedBookingForPayment.extraServices?.transportGoods && (
                      <div className="flex justify-between items-center text-xs text-amber-900">
                        <span className="flex items-center gap-1 font-semibold">
                          <Truck className="w-3.5 h-3.5 text-amber-700" />
                          Doorstep Farm Pickup & Drop Service:
                        </span>
                        <span className="font-extrabold">
                          +₹{Number(selectedBookingForPayment.extraServices?.transportCost || selectedBookingForPayment.transportCost || 605).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}

                    {selectedBookingForPayment.extraServices?.cctvMonitoring && (
                      <div className="flex justify-between items-center text-xs text-teal-900">
                        <span className="flex items-center gap-1 font-semibold">
                          <Video className="w-3.5 h-3.5 text-teal-700" />
                          24/7 CCTV Camera Surveillance ({selectedBookingForPayment.extraServices?.cctvDays || selectedBookingForPayment.durationDays} Days @ ₹1,000/day):
                        </span>
                        <span className="font-extrabold">
                          +₹{Number(selectedBookingForPayment.extraServices?.cctvCost || ((selectedBookingForPayment.extraServices?.cctvDays || selectedBookingForPayment.durationDays) * 1000)).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs text-slate-600">
                      <span>GST (18% Govt Mandate):</span>
                      <span className="font-bold text-slate-800">
                        ₹{Number(selectedBookingForPayment.bill?.tax || Math.round((selectedBookingForPayment.totalCost || 0) * 0.18)).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex justify-between items-baseline pt-2 border-t border-emerald-300 font-bold">
                      <span className="text-slate-900 text-sm font-extrabold">Total Final Bill Payable:</span>
                      <span className="text-xl font-black text-emerald-800">
                        ₹{Number(selectedBookingForPayment.bill?.total || selectedBookingForPayment.totalCost).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 block">
                      Select Payment Method:
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('upi')}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          paymentMethod === 'upi'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-extrabold ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <QrCode className="w-5 h-5 mx-auto mb-1 text-emerald-700" />
                        <span className="block text-xs">UPI Instant</span>
                        <span className="text-[10px] text-slate-400 block">GPay, PhonePe</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          paymentMethod === 'card'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-extrabold ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <CreditCard className="w-5 h-5 mx-auto mb-1 text-emerald-700" />
                        <span className="block text-xs">Cards</span>
                        <span className="text-[10px] text-slate-400 block">Debit / Credit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('netbanking')}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          paymentMethod === 'netbanking'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-extrabold ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Building2 className="w-5 h-5 mx-auto mb-1 text-emerald-700" />
                        <span className="block text-xs">Net Banking</span>
                        <span className="text-[10px] text-slate-400 block">All Banks</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('counter')}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          paymentMethod === 'counter'
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-extrabold ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Truck className="w-5 h-5 mx-auto mb-1 text-emerald-700" />
                        <span className="block text-xs">Pay on Arrival</span>
                        <span className="text-[10px] text-slate-400 block">At Storage Gate</span>
                      </button>
                    </div>
                  </div>

                  {/* Payment Details Container */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    {paymentMethod === 'upi' && (
                      <div className="space-y-3 text-center sm:text-left sm:flex sm:items-center sm:gap-4">
                        <div className="w-28 h-28 bg-white p-2 rounded-2xl border border-slate-200 mx-auto sm:mx-0 shrink-0 shadow-xs flex items-center justify-center">
                          {/* Simulated UPI QR Code */}
                          <div className="w-full h-full border-2 border-emerald-600 rounded-lg flex flex-col items-center justify-center p-1 bg-emerald-50/50">
                            <QrCode className="w-12 h-12 text-emerald-800" />
                            <span className="text-[8px] font-black text-emerald-900 tracking-wider">BHIM UPI QR</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 flex-1">
                          <span className="text-xs font-bold text-slate-900 block">
                            Scan with Any UPI App to Pay Directly
                          </span>
                          <p className="text-[11px] text-slate-500">
                            Scan via Google Pay, PhonePe, Paytm, BHIM, or Any Indian Bank UPI App.
                          </p>
                          <div className="p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-600">agricold.harvest@icici</span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                              Verified Merchant
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'card' && (
                      <div className="space-y-2.5">
                        <div>
                          <label className="text-[11px] font-bold text-slate-700 block mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            placeholder="4532 •••• •••• 8910"
                            maxLength="19"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-mono"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              maxLength="5"
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                              CVV
                            </label>
                            <input
                              type="password"
                              placeholder="•••"
                              maxLength="4"
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'netbanking' && (
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          Select Banking Partner:
                        </label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-medium"
                        >
                          <option value="State Bank of India">State Bank of India (SBI)</option>
                          <option value="HDFC Bank">HDFC Bank</option>
                          <option value="ICICI Bank">ICICI Bank</option>
                          <option value="Bank of Baroda">Bank of Baroda (BoB)</option>
                          <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                          <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                        </select>
                        <p className="text-[11px] text-slate-500">
                          Secure 256-bit encrypted banking gateway redirect for APMC certified accounts.
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'counter' && (
                      <div className="space-y-2">
                        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                          <span className="font-extrabold block">💵 Pay Upon Crop Delivery at Weighbridge Gate</span>
                          <p className="text-[11px] text-amber-800 leading-relaxed">
                            Confirm your booking now. You can settle the bill via Cash, Mandi Cheque, or UPI at {selectedBookingForPayment.storageName} loading dock upon intake.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedBookingForPayment(null)}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={paymentProcessing}
                      className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {paymentProcessing ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Processing Payment...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>
                            Confirm & Pay ₹{Number(selectedBookingForPayment.bill?.total || selectedBookingForPayment.totalCost).toLocaleString('en-IN')}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}