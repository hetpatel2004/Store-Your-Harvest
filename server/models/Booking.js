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
