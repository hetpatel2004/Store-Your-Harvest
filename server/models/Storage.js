const mongoose = require('mongoose');

const storageSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Storage facility name is required'],
    trim: true,
  },
  tagline: {
    type: String,
    default: 'State-of-the-art Cold Storage & Preservation Facility',
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    default: 'Ahmedabad',
  },
  district: {
    type: String,
    default: 'Ahmedabad',
  },
  state: {
    type: String,
    default: 'Gujarat',
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  storageType: {
    type: String,
    enum: ['Multipurpose CA Cold Store', 'Controlled Atmosphere (CA)', 'Cold Storage & Pack House', 'Refrigerated Warehouse', 'Pre-Cooling & Chilled Unit'],
    default: 'Multipurpose CA Cold Store',
  },
  totalCapacity: {
    type: Number,
    required: [true, 'Total capacity in kg is required'],
  },
  availableCapacity: {
    type: Number,
    required: [true, 'Available capacity in kg is required'],
  },
  temperatureMin: {
    type: Number,
    required: [true, 'Minimum temperature (°C) is required'],
  },
  temperatureMax: {
    type: Number,
    required: [true, 'Maximum temperature (°C) is required'],
  },
  humidityMin: {
    type: Number,
    default: 85,
  },
  humidityMax: {
    type: Number,
    default: 95,
  },
  acceptedCrops: [{
    type: String,
    trim: true,
  }],
  minimumQuantity: {
    type: Number,
    default: 100, // in kg
  },
  pricePerKg: {
    type: Number,
    required: [true, 'Storage price (₹/kg/month) is required'],
  },
  handlingCharge: {
    type: Number,
    default: 350, // in ₹ flat or per quintal
  },
  transportRatePerKm: {
    type: Number,
    default: 25, // ₹ per km transport estimate
  },
  storageDuration: {
    type: String,
    default: '15 to 180 days',
  },
  paymentTerms: {
    type: String,
    default: '30% advance on deposit, balance at harvest release. Cash, UPI, RTGS accepted.',
  },
  damagePolicy: {
    type: String,
    default: 'Comprehensive crop insurance covered up to 90% against refrigeration failure. Standard shrinkage allowance applies.',
  },
  powerBackup: {
    type: Boolean,
    default: true,
  },
  cctvMonitoring: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    default: 4.7,
  },
  reviewsCount: {
    type: Number,
    default: 28,
  },
  verified: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved',
  },
  availability: {
    type: String,
    enum: ['Available', 'Limited', 'Full'],
    default: 'Available',
  },
  images: [{
    type: String,
  }],
  operatingHours: {
    type: String,
    default: '06:00 AM - 10:00 PM (24/7 Gate entry during harvest)',
  },
  contactPhone: {
    type: String,
    required: true,
  },
  contactEmail: {
    type: String,
    default: '',
  },
  features: [{
    type: String,
  }],
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Storage', storageSchema);
