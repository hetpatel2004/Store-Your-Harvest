const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // allows guest farmers
  },
  farmerName: {
    type: String,
    required: [true, 'Farmer name is required'],
    trim: true,
  },
  farmerPhone: {
    type: String,
    required: [true, 'Contact phone number is required'],
    trim: true,
  },
  farmerEmail: {
    type: String,
    trim: true,
    default: '',
  },
  storageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Storage',
    required: true,
  },
  storageName: {
    type: String,
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  crop: {
    type: String,
    required: [true, 'Crop name is required'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity in kg is required'],
  },
  requiredTemp: {
    type: String,
    default: '',
  },
  startDate: {
    type: Date,
    required: [true, 'Expected arrival date is required'],
  },
  durationDays: {
    type: Number,
    required: [true, 'Duration in days is required'],
    default: 30,
  },
  estimatedStorageCost: {
    type: Number,
    required: true,
  },
  handlingCost: {
    type: Number,
    required: true,
  },
  transportCost: {
    type: Number,
    default: 0,
  },
  totalCost: {
    type: Number,
    required: true,
  },
  distanceKm: {
    type: Number,
    default: 0,
  },
  specialRequirements: {
    type: String,
    default: '',
  },
  // Extra services selected by farmer
  extraServices: {
    cctvMonitoring: { type: Boolean, default: false },
    cctvDays: { type: Number, default: 0 },
    cctvOption: { type: String, default: 'always' }, // 'always' or 'custom'
    cctvCost: { type: Number, default: 0 },
    transportGoods: { type: Boolean, default: false },
    transportMode: { type: String, enum: ['none', 'pickup', 'drop', 'both'], default: 'none' },
    pickupDistanceKm: { type: Number, default: 0 },
    dropDistanceKm: { type: Number, default: 0 },
    pickupWeightKg: { type: Number, default: 0 },
    dropWeightKg: { type: Number, default: 0 },
    pickupAddress: { type: String, default: '' },
    dropAddress: { type: String, default: '' },
    pickupCost: { type: Number, default: 0 },
    dropCost: { type: Number, default: 0 },
    transportCost: { type: Number, default: 0 },
    insurance: { type: Boolean, default: false },
    powerBackupConfirmation: { type: Boolean, default: false },
    expressHandling: { type: Boolean, default: false },
    preCoolingTreatment: { type: Boolean, default: false },
    insuranceUpgrade: { type: Boolean, default: false },
  },
  // Bill details
  bill: {
    generatedAt: { type: Date, default: Date.now },
    subtotal: Number,
    extraServicesCost: Number,
    tax: Number,
    total: Number,
    paymentStatus: { type: String, enum: ['pending', 'partial', 'paid', 'refunded'], default: 'pending' },
    paymentMethod: { type: String, default: '' },
    transactionId: { type: String, default: '' },
    paymentDate: { type: Date, default: null },
    items: [{
      description: String,
      quantity: Number,
      unitPrice: Number,
      total: Number,
    }],
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Booking', bookingSchema);
