import React, { useState, useEffect, useRef } from 'react';
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
  FileText,
  CreditCard,
  Plus,
  Eye,
  Settings,
  Video,
  Truck,
  Shield,
  Zap,
  Snowflake,
  FastForward,
  Thermometer,
  PlusCircle,
  Trash2,
  Edit2,
  User,
  Clock,
  FileCheck,
  Download,
  Smartphone,
  Wallet,
  Receipt,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  Home,
  CreditCard as CreditCardIcon,
  Banknote,
  QrCode,
  Barcode,
  Printer,
  Mail,
  Phone,
  MapPin as MapPinIcon,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  XCircle as XCircleIcon,
  Clock as ClockIcon,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  MoreHorizontal,
  RotateCcw,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Hash,
  Star,
  Heart,
  Bell,
  MessageSquare,
  LogOut,
  LayoutDashboard,
  FileText as FileTextIcon,
  Gift,
  Tag,
  ArrowUpRight,
  ArrowDownLeft,
  Minus,
  Package,
  Warehouse,
  Map,
  Navigation,
  Compass,
  Globe,
  Shield as ShieldIcon,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Key,
  IdCard,
  UserCheck,
  UserPlus,
  UserMinus,
  UserX,
  Activity,
  BarChart2,
  PieChart,
  TrendingUp,
  TrendingDown,
  Target,
  Flag,
  Bookmark,
  BookmarkCheck,
  Archive,
  Folder,
  FilePlus,
  FileMinus,
  FileX,
  FileCheck2,
  Upload,
  Download as DownloadIcon,
  Print,
  Share2,
  Send,
  Receive,
  RefreshCw,
  RotateCcw as RotateCcwIcon,
  Maximize,
  Minimize,
  Fullscreen,
  Minimize2,
  PanelLeft,
  PanelRight,
  PanelTop,
  PanelBottom,
  Sidebar,
  Menu as MenuIcon,
  Grid,
  List,
  Columns,
  Rows,
  Table,
  Kanban,
  Calendar as CalendarIcon,
  Clock as ClockIcon2,
  Timer,
  Stopwatch,
  AlarmClock,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  CalendarMinus,
  CalendarRange,
  CalendarDays,
  CalendarWeek,
  CalendarMonth,
  CalendarYear,
  Sunrise,
  Sunset,
  Moon,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  Wind,
  Thermometer as ThermometerIcon,
  Droplets,
  Droplet,
  Flame,
  Fire,
  Zap as ZapIcon,
  Battery,
  BatteryCharging,
  BatteryLow,
  BatteryMedium,
  BatteryHigh,
  Signal,
  Wifi,
  WifiOff,
  Bluetooth,
  BluetoothConnected,
  BluetoothSearching,
  BluetoothOff,
  Volume2,
  Volume1,
  VolumeX,
  Music,
  Music2,
  Music3,
  Music4,
  Play,
  Pause,
  Stop,
  SkipBack,
  SkipForward,
  FastForward as FastForwardIcon,
  Rewind,
  Shuffle,
  Repeat,
  Repeat1,
  Volume,
  Mic,
  MicOff,
  Mic2,
  Headphones,
  Speaker,
  Monitor,
  MonitorX,
  MonitorCheck,
  MonitorOff,
  MonitorUp,
  MonitorDown,
  MonitorPlay,
  MonitorPause,
  MonitorStop,
  MonitorX2,
  MonitorCheck2,
  MonitorOff2,
  MonitorUp2,
  MonitorDown2,
  MonitorPlay2,
  MonitorPause2,
  MonitorStop2,
} from 'lucide-react';

const EXTRA_SERVICES = [
  { key: 'cctvMonitoring', label: 'CCTV Monitoring Proof', price: 200, icon: Video, description: 'Proof of CCTV monitoring for crop security' },
  { key: 'transportGoods', label: 'Transport Goods / Farm Pickup', price: 500, icon: Truck, description: 'Door-to-door transport & farm pickup service' },
  { key: 'insurance', label: 'Basic Insurance', price: 300, icon: Shield, description: 'Crop insurance against damage' },
  { key: 'powerBackupConfirmation', label: 'Power Backup Confirmation', price: 150, icon: Zap, description: 'Guaranteed power backup verification' },
  { key: 'expressHandling', label: 'Express Handling', price: 180, icon: FastForward, description: 'Priority loading/unloading' },
  { key: 'preCoolingTreatment', label: 'Pre-Cooling Treatment', price: 250, icon: Snowflake, description: 'Pre-cooling before storage' },
  { key: 'insuranceUpgrade', label: 'Insurance Upgrade', price: 100, icon: ShieldCheck, description: 'Enhanced insurance coverage' },
];

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI Payment', icon: Smartphone, description: 'Pay via UPI (Google Pay, PhonePe, Paytm, BHIM)' },
  { id: 'cash', label: 'Cash on Delivery', icon: Banknote, description: 'Pay cash at the time of delivery/pickup' },
  { id: 'card', label: 'Card Payment', icon: CreditCard, description: 'Credit/Debit card payment' },
  { id: 'bank_transfer', label: 'Bank Transfer', icon: Building2, description: 'NEFT/RTGS/IMPS bank transfer' },
];

const statusColors = {
  pending: 'amber',
  accepted: 'emerald',
  rejected: 'red',
  completed: 'green',
  cancelled: 'red',
};

const PAYMENT_STATUS_COLORS = {
  pending: 'amber',
  partial: 'blue',
  paid: 'emerald',
  refunded: 'red',
  failed: 'red',
};

const EXTRA_SERVICE_COSTS = {
  cctvMonitoring: 200,
  transportGoods: 500,
  insurance: 300,
  powerBackupConfirmation: 150,
  expressHandling: 180,
  preCoolingTreatment: 250,
  insuranceUpgrade: 100,
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatDateOnly = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatCurrency = (amount) => {
  if (!amount) return '₹0';
  return '₹' + Number(amount).toLocaleString('en-IN');
};

const generateBillNumber = (bookingId) => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `BILL-${date}-${bookingId?.slice(-6).toUpperCase()}`;
};

export default function FarmerDashboardPage() {
  const { user, isAuthenticated, isFarmer, login, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('details'); // details, pending, offers, bills
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBooking, setNewBooking] = useState({
    storageId: '',
    crop: 'Tomato',
    quantity: 500,
    duration: 30,
    distance: 10,
    startDate: '',
    extraServices: {},
    farmerPassword: '',
    registerFarmer: false,
  });
  const [loadingNewBooking, setLoadingNewBooking] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedBookingForBill, setSelectedBookingForBill] = useState(null);
  const [selectedBookingForServices, setSelectedBookingForServices] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('upi');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({ upiId: '', cardNumber: '', cardExpiry: '', cardCvv: '', cardName: '' });
  const [notification, setNotification] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const EXTRA_SERVICES = [
    { key: 'cctvMonitoring', label: 'CCTV Monitoring Proof', price: 200, icon: Video, description: 'Proof of CCTV monitoring for crop security' },
    { key: 'transportGoods', label: 'Transport Goods / Farm Pickup', price: 500, icon: Truck, description: 'Door-to-door transport & farm pickup service' },
    { key: 'insurance', label: 'Basic Insurance', price: 300, icon: Shield, description: 'Crop insurance against damage' },
    { key: 'powerBackupConfirmation', label: 'Power Backup Confirmation', price: 150, icon: Zap, description: 'Guaranteed power backup verification' },
    { key: 'expressHandling', label: 'Express Handling', price: 180, icon: FastForward, description: 'Priority loading/unloading' },
    { key: 'preCoolingTreatment', label: 'Pre-Cooling Treatment', price: 250, icon: Snowflake, description: 'Pre-cooling before storage' },
    { key: 'insuranceUpgrade', label: 'Insurance Upgrade', price: 100, icon: ShieldCheck, description: 'Enhanced insurance coverage' },
  ];

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatDateOnly = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return '₹' + Number(amount).toLocaleString('en-IN');
  };

  const generateBillNumber = (bookingId) => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `BILL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${bookingId?.slice(-6).toUpperCase()}`;
  };

  const downloadBill = async (booking) => {
    const billContent = generateBillContent(booking);
    const blob = new Blob([billContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bill-${generateBillNumber(booking._id)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Bill downloaded successfully!');
  };

  const printBill = (booking) => {
    const billContent = generateBillContent(booking);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(billContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const generateBillContent = (booking) => {
    const EXTRA_SERVICE_COSTS = {
      cctvMonitoring: 200,
      transportGoods: 500,
      insurance: 300,
      powerBackupConfirmation: 150,
      expressHandling: 180,
      preCoolingTreatment: 250,
      insuranceUpgrade: 100,
    };

    const billItems = [
      { description: `Storage (${booking.crop} - ${booking.quantity} kg for ${booking.durationDays} days)`, quantity: 1, unitPrice: booking.estimatedStorageCost, total: booking.estimatedStorageCost },
      { description: 'Handling & Unloading', quantity: 1, unitPrice: booking.handlingCost, total: booking.handlingCost },
    ];

    if (booking.transportCost > 0) {
      billItems.push({ description: `Transport (${booking.distanceKm} km)`, quantity: 1, unitPrice: booking.transportCost, total: booking.transportCost });
    }

    if (booking.extraServices) {
      Object.keys(booking.extraServices || {}).forEach(key => {
        if (booking.extraServices[key] && EXTRA_SERVICE_COSTS[key]) {
          const serviceNames = {
            cctvMonitoring: 'CCTV Monitoring Proof',
            transportGoods: 'Transport Goods / Farm Pickup',
            insurance: 'Basic Insurance',
            powerBackupConfirmation: 'Power Backup Confirmation',
            expressHandling: 'Express Handling',
            preCoolingTreatment: 'Pre-Cooling Treatment',
            insuranceUpgrade: 'Insurance Upgrade',
          };
          billItems.push({ description: serviceNames[key], quantity: 1, unitPrice: EXTRA_SERVICE_COSTS[key], total: EXTRA_SERVICE_COSTS[key] });
        }
      });
    }

    const subtotal = booking.bill?.subtotal || 0;
    const tax = booking.bill?.tax || 0;
    const total = booking.bill?.total || 0;
    const billNumber = generateBillNumber(booking._id);

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill - ${booking._id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .bill-container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
          .header { text-align: center; border-bottom: 2px solid #16a34a; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { width: 80px; height: 80px; background: #16a34a; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 30px; margin-bottom: 10px; }
          h1 { color: #16a34a; margin: 0; font-size: 28px; }
          .subtitle { color: #666; margin: 5px 0 0; }
          .bill-info { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .info-box { background: #f0fdf4; padding: 15px; border-radius: 8px; border: 1px solid #bbf7d0; }
          .info-label { font-size: 12px; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; }
          .info-value { font-size: 14px; font-weight: 600; color: #166534; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          th { background: #f0fdf4; color: #166534; font-weight: 600; text-align: left; }
          .text-right { text-align: right; }
          .totals { margin-top: 20px; padding-top: 20px; border-top: 2px solid #16a34a; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .total-row.final { font-size: 18px; font-weight: 700; color: #16a34a; border-top: 2px solid #16a34a; padding-top: 15px; margin-top: 10px; }
          .payment-info { background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 30px; border: 1px solid #fde68a; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; }
          @media print { body { background: white; } .bill-container { box-shadow: none; padding: 0; } .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="bill-container">
          <div class="header">
            <div class="logo">🌱</div>
            <h1>AgriCold Connect</h1>
            <p class="subtitle">Cold Storage Bill / Invoice</p>
          </div>

          <div class="bill-info">
            <div class="info-box">
              <div class="info-label">Bill Number</div>
              <div class="info-value">${generateBillNumber(booking._id)}</div>
            </div>
            <div class="info-box">
              <div class="info-label">Bill Date</div>
              <div class="info-value">${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            </div>
            <div class="info-box">
              <div class="info-label">Booking ID</div>
              <div class="info-value">${booking._id?.slice(-8).toUpperCase()}</div>
            </div>
            <div class="info-box">
              <div class="info-label">Booking Date</div>
              <div class="info-value">${new Date(booking.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            </div>
          </div>

          <div class="bill-info">
            <div class="info-box">
              <div class="info-label">Farmer Name</div>
              <div class="info-value">${booking.farmerName}</div>
            </div>
            <div class="info-box">
              <div class="info-label">Phone</div>
              <div class="info-value">${booking.farmerPhone}</div>
            </div>
            <div class="info-box">
              <div class="info-label">Storage Facility</div>
              <div class="info-value">${booking.storageName}</div>
            </div>
            <div class="info-box">
              <div class="info-label">Status</div>
              <div class="info-value" style="color: #16a34a;">${booking.status?.toUpperCase()}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${(() => {
                const EXTRA_SERVICE_COSTS = {
                  cctvMonitoring: 200,
                  transportGoods: 500,
                  insurance: 300,
                  powerBackupConfirmation: 150,
                  expressHandling: 180,
                  preCoolingTreatment: 250,
                  insuranceUpgrade: 100,
                };

                const billItems = [
                  { description: `Storage (${booking.crop} - ${booking.quantity} kg for ${booking.durationDays} days)`, quantity: 1, unitPrice: booking.estimatedStorageCost, total: booking.estimatedStorageCost },
                  { description: 'Handling & Unloading', quantity: 1, unitPrice: booking.handlingCost, total: booking.handlingCost },
                ];

                if (booking.transportCost > 0) {
                  billItems.push({ description: `Transport (${booking.distanceKm} km)`, quantity: 1, unitPrice: booking.transportCost, total: booking.transportCost });
                }

                if (booking.extraServices) {
                  Object.keys(booking.extraServices || {}).forEach(key => {
                    if (booking.extraServices[key] && EXTRA_SERVICE_COSTS[key]) {
                      const serviceNames = {
                        cctvMonitoring: 'CCTV Monitoring Proof',
                        transportGoods: 'Transport Goods / Farm Pickup',
                        insurance: 'Basic Insurance',
                        powerBackupConfirmation: 'Power Backup Confirmation',
                        expressHandling: 'Express Handling',
                        preCoolingTreatment: 'Pre-Cooling Treatment',
                        insuranceUpgrade: 'Insurance Upgrade',
                      };
                      billItems.push({ description: serviceNames[key], quantity: 1, unitPrice: EXTRA_SERVICE_COSTS[key], total: EXTRA_SERVICE_COSTS[key] });
                    }
                  });
                }

                return billItems.map((item, idx) => `
                  <tr>
                    <td>${idx + 1}</td>
                    <td>${item.description}</td>
                    <td style="text-align: center;">${item.quantity}</td>
                    <td style="text-align: right;">₹${Number(item.unitPrice).toLocaleString('en-IN')}</td>
                    <td style="text-align: right;">₹${Number(item.total).toLocaleString('en-IN')}</td>
                  </tr>
                `).join('');
              })()}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row">
              <span>Subtotal</span>
              <span>₹${Number(booking.bill?.subtotal || 0).toLocaleString('en-IN')}</span>
            </div>
            <div class="total-row">
              <span>GST (18%)</span>
              <span>₹${booking.bill?.tax ? Number(booking.bill.tax).toLocaleString('en-IN') : '0'}</span>
            </div>
            <div class="total-row final">
              <span>Total Amount</span>
              <span>₹${booking.bill?.total ? Number(booking.bill.total).toLocaleString('en-IN') : '0'}</span>
            </div>
          </div>

          <div class="payment-info">
            <h4 style="margin: 0 0 10px; color: #92400e;">Payment Information</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 14px;">
              <div><strong>Payment Status:</strong> <span style="color: ${booking.bill?.paymentStatus === 'paid' ? '#16a34a' : booking.bill?.paymentStatus === 'partial' ? '#2563eb' : '#f59e0b'}">${booking.bill?.paymentStatus?.toUpperCase() || 'PENDING'}</span></div>
              <div><strong>Payment Method:</strong> ${booking.bill?.paymentMethod ? booking.bill.paymentMethod.toUpperCase() : 'NOT SELECTED'}</div>
              <div><strong>Transaction ID:</strong> ${booking.bill?.transactionId || 'N/A'}</div>
              <div><strong>Payment Date:</strong> ${booking.bill?.paymentDate ? new Date(booking.bill.paymentDate).toLocaleDateString('en-IN') : 'N/A'}</div>
            </div>
          </div>

          <div class="footer">
            <p><strong>AgriCold Connect</strong> - Cold Storage Solutions</p>
            <p>Thank you for choosing AgriCold Connect for your crop storage needs.</p>
            <p>For queries, contact: support@agricold.in | +91-XXXXXXXXXX</p>
            <p>This is a computer-generated invoice. No signature required.</p>
          </div>

          <div style="text-align: center; margin-top: 30px;" class="no-print">
            <button onclick="window.print()" style="background: #16a34a; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; cursor: pointer; margin: 0 10px;">🖨️ Print Bill</button>
            <button onclick="document.querySelector('a[download]').click()" style="background: #3b82f6; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; cursor: pointer; margin: 0 10px;">📥 Download</button>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const printBill = (booking) => {
    const billContent = generateBillContent(booking);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(billContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  const downloadBill = (booking) => {
    const billContent = generateBillContent(booking);
    const blob = new Blob([billContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bill-${generateBillNumber(booking._id)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Bill downloaded successfully!');
  };

  const generateBillNumber = (bookingId) => {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    return `BILL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${bookingId?.slice(-6).toUpperCase()}`;
  };

  // ... rest of the component