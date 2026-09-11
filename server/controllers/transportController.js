const TransportProvider = require('../models/TransportProvider');

const MOCK_PROVIDERS = [
  {
    name: 'KisanSpeed Reefer Cold Logistics',
    serviceType: 'both',
    vehicleTypes: [
      { type: 'Tata Ace Reefer (1.5 MT)', capacityKg: 1500, tempControlled: true, tempMin: 0, tempMax: 15 },
      { type: 'Eicher Pro 14ft Reefer (4 MT)', capacityKg: 4000, tempControlled: true, tempMin: -10, tempMax: 20 },
      { type: '32ft Multi-Axle Reefer (16 MT)', capacityKg: 16000, tempControlled: true, tempMin: -25, tempMax: 25 },
    ],
    baseRatePerKm: 24,
    minCharge: 1100,
    loadingUnloadingCharge: 350,
    exportPortCoverage: [
      { portName: 'Mundra Port (APSEZ)', distanceFromHubKm: 340, transitHours: 8, exportCustomClearanceAssistance: true, phytosanitarySupport: true },
      { portName: 'Kandla Port (Deendayal)', distanceFromHubKm: 310, transitHours: 7, exportCustomClearanceAssistance: true, phytosanitarySupport: true },
      { portName: 'Pipavav Port (APM)', distanceFromHubKm: 290, transitHours: 7, exportCustomClearanceAssistance: true, phytosanitarySupport: false },
    ],
    supportedCommodities: ['Vegetables', 'Tomato', 'Potato', 'Onion', 'Rice', 'Wheat', 'Banana', 'Mango'],
    coveredDistricts: ['Ahmedabad', 'Sanand', 'Anand', 'Kheda', 'Gandhinagar', 'Vadodara'],
    rating: 4.9,
    tripsCompleted: 430,
    contactPhone: '+91 98251 22334',
    verified: true,
    trackingAvailable: true,
  },
  {
    name: 'Gujarat AgroExpress Farm-to-Port Lines',
    serviceType: 'export_logistics',
    vehicleTypes: [
      { type: '40ft Heavy Reefer Container (24 MT)', capacityKg: 24000, tempControlled: true, tempMin: -25, tempMax: 20 },
      { type: '32ft Heavy Tarpaulin Grain Trailer (22 MT)', capacityKg: 22000, tempControlled: false, tempMin: 15, tempMax: 35 },
    ],
    baseRatePerKm: 22,
    minCharge: 3500,
    loadingUnloadingCharge: 500,
    exportPortCoverage: [
      { portName: 'Mundra Port (APSEZ)', distanceFromHubKm: 335, transitHours: 7.5, exportCustomClearanceAssistance: true, phytosanitarySupport: true },
      { portName: 'Nhava Sheva (JNPT Mumbai)', distanceFromHubKm: 520, transitHours: 12, exportCustomClearanceAssistance: true, phytosanitarySupport: true },
      { portName: 'Kandla Port (Deendayal)', distanceFromHubKm: 305, transitHours: 6.5, exportCustomClearanceAssistance: true, phytosanitarySupport: true },
    ],
    supportedCommodities: ['Rice', 'Wheat', 'Mango', 'Grapes', 'Spices', 'Vegetables'],
    coveredDistricts: ['Ahmedabad', 'Sanand', 'Anand', 'Rajkot', 'Surat', 'Kutch'],
    rating: 4.8,
    tripsCompleted: 610,
    contactPhone: '+91 98980 44552',
    verified: true,
    trackingAvailable: true,
  },
  {
    name: 'Gramin Sathi Farm Pickup & Mandi Shuttle',
    serviceType: 'farm_pickup',
    vehicleTypes: [
      { type: 'Mahindra Bolero Maxi Truck (1.8 MT)', capacityKg: 1800, tempControlled: false, tempMin: 10, tempMax: 35 },
      { type: 'Tata 407 Insulated (2.5 MT)', capacityKg: 2500, tempControlled: true, tempMin: 4, tempMax: 18 },
      { type: 'Eicher 17ft Open Body (6 MT)', capacityKg: 6000, tempControlled: false, tempMin: 15, tempMax: 35 },
    ],
    baseRatePerKm: 19,
    minCharge: 800,
    loadingUnloadingCharge: 250,
    exportPortCoverage: [],
    supportedCommodities: ['Vegetables', 'Tomato', 'Potato', 'Onion', 'Wheat', 'Rice', 'Carrot', 'Chilli'],
    coveredDistricts: ['Ahmedabad', 'Sanand', 'Bavla', 'Dholka', 'Kheda', 'Anand'],
    rating: 4.7,
    tripsCompleted: 290,
    contactPhone: '+91 97240 88991',
    verified: true,
    trackingAvailable: true,
  },
  {
    name: 'Mundra Global Maritime Reefer Haulage',
    serviceType: 'both',
    vehicleTypes: [
      { type: 'Plug-in Genset Reefer Trailer 40ft (25 MT)', capacityKg: 25000, tempControlled: true, tempMin: -28, tempMax: 15 },
      { type: 'Twin-Chamber Split Reefer 24ft (10 MT)', capacityKg: 10000, tempControlled: true, tempMin: -18, tempMax: 12 },
    ],
    baseRatePerKm: 26,
    minCharge: 4000,
    loadingUnloadingCharge: 600,
    exportPortCoverage: [
      { portName: 'Mundra Port (APSEZ)', distanceFromHubKm: 340, transitHours: 7.5, exportCustomClearanceAssistance: true, phytosanitarySupport: true },
      { portName: 'Hazira Port (Surat)', distanceFromHubKm: 280, transitHours: 6.5, exportCustomClearanceAssistance: true, phytosanitarySupport: true },
      { portName: 'Nhava Sheva (JNPT Mumbai)', distanceFromHubKm: 530, transitHours: 12, exportCustomClearanceAssistance: true, phytosanitarySupport: true },
    ],
    supportedCommodities: ['Rice', 'Wheat', 'Vegetables', 'Mango', 'Banana', 'Spices'],
    coveredDistricts: ['Ahmedabad', 'Sanand', 'Anand', 'Vadodara', 'Surat', 'Bharuch'],
    rating: 4.95,
    tripsCompleted: 780,
    contactPhone: '+91 98241 55667',
    verified: true,
    trackingAvailable: true,
  },
  {
    name: 'Sardar Patel Krishi Vahan Cooperative',
    serviceType: 'farm_pickup',
    vehicleTypes: [
      { type: 'Tractor Trolley with Cushion Liner (3 MT)', capacityKg: 3000, tempControlled: false, tempMin: 15, tempMax: 35 },
      { type: 'Eicher 14ft Insulated (4 MT)', capacityKg: 4000, tempControlled: true, tempMin: 5, tempMax: 18 },
    ],
    baseRatePerKm: 18,
    minCharge: 750,
    loadingUnloadingCharge: 200,
    exportPortCoverage: [],
    supportedCommodities: ['Potato', 'Onion', 'Wheat', 'Rice', 'Vegetables'],
    coveredDistricts: ['Sanand', 'Bavla', 'Viramgam', 'Ahmedabad', 'Gandhinagar'],
    rating: 4.65,
    tripsCompleted: 185,
    contactPhone: '+91 99090 33211',
    verified: true,
    trackingAvailable: false,
  }
];

exports.compareTransportRates = async (req, res, next) => {
  try {
    const {
      serviceType = 'all',
      crop = 'Vegetables',
      quantityKg = 2000,
      distanceKm = 30,
      pickupCity = 'Sanand',
      destinationType = 'storage',
      targetPort = 'Mundra Port (APSEZ)',
    } = req.query;

    const qty = Math.max(100, Number(quantityKg) || 1000);
    const dist = Math.max(5, Number(distanceKm) || 25);

    let providers = await TransportProvider.find();
    if (!providers || providers.length === 0) {
      providers = await TransportProvider.insertMany(MOCK_PROVIDERS);
    }

    const quotes = providers
      .filter((p) => {
        if (serviceType === 'farm_pickup') return p.serviceType === 'farm_pickup' || p.serviceType === 'both';
        if (serviceType === 'export_logistics') return p.serviceType === 'export_logistics' || p.serviceType === 'both';
        return true;
      })
      .filter((p) => {
        // Port deliveries only make sense for carriers that actually serve the selected port.
        if (destinationType !== 'port') return true;
        return (
          Array.isArray(p.exportPortCoverage) &&
          p.exportPortCoverage.some((port) => port.portName.toLowerCase().includes(targetPort.toLowerCase()))
        );
      })
      .map((p) => {
        let finalDistance = dist;
        let selectedPort = null;

        if (destinationType === 'port' && p.exportPortCoverage && p.exportPortCoverage.length > 0) {
          selectedPort = p.exportPortCoverage.find((port) => port.portName.toLowerCase().includes(targetPort.toLowerCase()))
                         || p.exportPortCoverage[0];
          finalDistance = selectedPort ? selectedPort.distanceFromHubKm : dist;
        }

        const weightTons = qty / 1000;
        const tonKmRate = Math.max(2.5, p.baseRatePerKm / 8);
        const calculatedFreight = Math.round(p.baseRatePerKm * finalDistance + (weightTons > 2 ? (weightTons - 2) * tonKmRate * finalDistance * 0.4 : 0));
        const estimatedFreight = Math.max(p.minCharge, calculatedFreight);
        const handlingFee = Math.round(p.loadingUnloadingCharge * Math.ceil(weightTons));
        const totalEstimatedCost = estimatedFreight + handlingFee;

        const bestVehicle = p.vehicleTypes.find((v) => v.capacityKg >= qty) || p.vehicleTypes[p.vehicleTypes.length - 1];

        return {
          id: p._id,
          name: p.name,
          serviceType: p.serviceType,
          rating: p.rating,
          tripsCompleted: p.tripsCompleted,
          contactPhone: p.contactPhone,
          verified: p.verified,
          trackingAvailable: p.trackingAvailable,
          bestVehicle: bestVehicle ? bestVehicle.type : 'Standard Reefer',
          isTempControlled: bestVehicle ? bestVehicle.tempControlled : true,
          tempRange: bestVehicle && bestVehicle.tempControlled ? bestVehicle.tempMin + '°C to ' + bestVehicle.tempMax + '°C' : 'Ambient / Ventilated',
          distanceKm: finalDistance,
          estimatedFreight,
          handlingFee,
          totalEstimatedCost,
          costPerKg: +(totalEstimatedCost / qty).toFixed(2),
          selectedPort: selectedPort ? selectedPort.portName : null,
          transitHours: selectedPort ? selectedPort.transitHours : Math.max(1, +(finalDistance / 40).toFixed(1)),
          exportAssistance: selectedPort ? selectedPort.exportCustomClearanceAssistance : false,
          phytosanitarySupport: selectedPort ? selectedPort.phytosanitarySupport : false,
        };
      })
      .sort((a, b) => a.totalEstimatedCost - b.totalEstimatedCost);

    res.status(200).json({
      success: true,
      parameters: {
        crop,
        quantityKg: qty,
        distanceKm: dist,
        pickupCity,
        destinationType,
        targetPort,
      },
      cheapestDeal: quotes[0] || null,
      fastestDeal: [...quotes].sort((a, b) => a.transitHours - b.transitHours)[0] || null,
      count: quotes.length,
      quotes,
    });
  } catch (error) {
    next(error);
  }
};

exports.bookTransportRequest = async (req, res, next) => {
  try {
    const {
      providerName,
      farmerName,
      farmerPhone,
      pickupAddress,
      destinationType,
      destinationAddress,
      crop,
      quantityKg,
      pickupDate,
      estimatedCost,
      notes,
    } = req.body;

    if (!farmerName || !farmerPhone || !pickupAddress) {
      return res.status(400).json({
        success: false,
        message: 'Please provide farmer name, phone number, and pickup location',
      });
    }

    const bookingReference = 'TRP-' + Math.floor(100000 + Math.random() * 900000);

    res.status(201).json({
      success: true,
      message: 'Transport pickup request scheduled successfully with ' + (providerName || 'assigned carrier') + '. Dispatch team will call ' + farmerPhone + ' to confirm loading time.',
      booking: {
        referenceNumber: bookingReference,
        farmerName,
        farmerPhone,
        pickupAddress,
        destinationAddress: destinationAddress || destinationType,
        crop,
        quantityKg,
        pickupDate: pickupDate || new Date().toISOString().split('T')[0],
        estimatedCost: estimatedCost || 'Calculated on dispatch',
        status: 'confirmed',
      },
    });
  } catch (error) {
    next(error);
  }
};