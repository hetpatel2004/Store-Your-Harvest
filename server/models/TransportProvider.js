const mongoose = require('mongoose');

const TransportProviderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Provider name is required'],
      trim: true,
    },
    serviceType: {
      type: String,
      enum: ['farm_pickup', 'export_logistics', 'both'],
      default: 'both',
    },
    vehicleTypes: [
      {
        type: { type: String }, // e.g. "Reefer Truck 32ft", "Eicher 14ft Reefer", "Tata Ace Insulated", "40ft Reefer Container (Port)"
        capacityKg: { type: Number },
        tempControlled: { type: Boolean, default: true },
        tempMin: { type: Number, default: -20 },
        tempMax: { type: Number, default: 25 },
      },
    ],
    baseRatePerKm: {
      type: Number,
      required: true,
      default: 28, // ₹ per km
    },
    minCharge: {
      type: Number,
      default: 1200, // minimum trip charge
    },
    loadingUnloadingCharge: {
      type: Number,
      default: 300, // per ton or fixed
    },
    exportPortCoverage: [
      {
        portName: { type: String }, // Mundra Port, Kandla Port, Nhava Sheva (JNPT), Pipavav Port
        distanceFromHubKm: { type: Number },
        transitHours: { type: Number },
        exportCustomClearanceAssistance: { type: Boolean, default: true },
        phytosanitarySupport: { type: Boolean, default: true },
      },
    ],
    supportedCommodities: [
      {
        type: String, // 'Vegetables', 'Rice', 'Wheat', 'Mango', 'Banana', 'Potato', 'Onion', 'Grapes', 'Spices'
      },
    ],
    coveredDistricts: [
      {
        type: String, // 'Ahmedabad', 'Sanand', 'Anand', 'Kheda', 'Kutch', 'Surat', 'Rajkot', 'Banaskantha'
      },
    ],
    rating: {
      type: Number,
      default: 4.8,
    },
    tripsCompleted: {
      type: Number,
      default: 140,
    },
    contactPhone: {
      type: String,
      default: '+91 98250 99881',
    },
    verified: {
      type: Boolean,
      default: true,
    },
    trackingAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('TransportProvider', TransportProviderSchema);
