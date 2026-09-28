const Booking = require('../models/Booking');
const Storage = require('../models/Storage');
const { calculateTotalCost } = require('../services/costCalculatorService');
const { resolveDistanceKm } = require('../utils/geoUtils');
const ErrorResponse = require('../utils/errorResponse');

// Genuine agricultural logistics pricing for:
// - 'pickup': Farm to Cold Storage
// - 'drop': Cold Storage to Mandi/Buyer
// - 'both': Both Pickup & Drop (two trips)
// - 'none': Self-arranged transport
// Formula per trip: Base ₹250 + (Distance km × ₹18) + (Weight kg × ₹0.35)
const calculateTransportFare = ({
  mode = 'none', // 'none', 'pickup', 'drop', 'both'
  pickupDistanceKm = 10,
  dropDistanceKm = 10,
  quantityKg = 500,
  pickupAddress = '',
  dropAddress = '',
}) => {
  const normMode = ['pickup', 'drop', 'both'].includes(mode) ? mode : 'none';
  if (normMode === 'none') {
    return {
      mode: 'none',
      total: 0,
      pickupFare: 0,
      dropFare: 0,
      pickupDistanceKm: 0,
      dropDistanceKm: 0,
      items: [],
    };
  }

  const basePerTrip = 250; // Base vehicle mobilization & driver loading assistance
  const perKmRate = 18; // ₹18/km road transit rate
  const perKgRate = 0.35; // ₹0.35/kg (₹35 per quintal) payload weight charge
  const weight = Math.max(10, Number(quantityKg) || 100);
  const weightCost = Math.round(weight * perKgRate);

  const pDist = Math.max(1, Number(pickupDistanceKm) || 10);
  const dDist = Math.max(1, Number(dropDistanceKm) || 10);

  const pickupDistCost = Math.round(pDist * perKmRate);
  const pickupFare = basePerTrip + pickupDistCost + weightCost;

  const dropDistCost = Math.round(dDist * perKmRate);
  const dropFare = basePerTrip + dropDistCost + weightCost;

  const items = [];

  if (normMode === 'pickup') {
    items.push({
      description: `Only Pickup Trip: Farm to Cold Storage (${pDist} km, ${weight} kg - Base ₹${basePerTrip} + Dist ₹${pickupDistCost} + Wt ₹${weightCost})`,
      quantity: 1,
      unitPrice: pickupFare,
      total: pickupFare,
    });
    return {
      mode: 'pickup',
      pickupDistanceKm: pDist,
      dropDistanceKm: 0,
      pickupFare,
      dropFare: 0,
      total: pickupFare,
      items,
    };
  }

  if (normMode === 'drop') {
    items.push({
      description: `Only Drop Trip: Cold Storage to Mandi/Buyer (${dDist} km, ${weight} kg - Base ₹${basePerTrip} + Dist ₹${dropDistCost} + Wt ₹${weightCost})`,
      quantity: 1,
      unitPrice: dropFare,
      total: dropFare,
    });
    return {
      mode: 'drop',
      pickupDistanceKm: 0,
      dropDistanceKm: dDist,
      pickupFare: 0,
      dropFare,
      total: dropFare,
      items,
    };
  }

  if (normMode === 'both') {
    items.push({
      description: `Pickup Trip: Farm to Cold Storage (${pDist} km, ${weight} kg - Base ₹${basePerTrip} + Dist ₹${pickupDistCost} + Wt ₹${weightCost})`,
      quantity: 1,
      unitPrice: pickupFare,
      total: pickupFare,
    });
    items.push({
      description: `Drop Trip: Cold Storage to Mandi/Buyer (${dDist} km, ${weight} kg - Base ₹${basePerTrip} + Dist ₹${dropDistCost} + Wt ₹${weightCost})`,
      quantity: 1,
      unitPrice: dropFare,
      total: dropFare,
    });
    return {
      mode: 'both',
      pickupDistanceKm: pDist,
      dropDistanceKm: dDist,
      pickupFare,
      dropFare,
      total: pickupFare + dropFare,
      items,
    };
  }

  return { mode: 'none', total: 0, items: [] };
};

// 24/7 CCTV Camera Surveillance at ₹1,000 per day with Always (Full Duration) or Custom days
const calculateCctvFare = (cctvOption, cctvDays, durationDays) => {
  const totalDuration = Math.max(1, Number(durationDays) || 30);
  const isCustom = cctvOption === 'custom';
  let days = totalDuration;
  if (isCustom && Number(cctvDays) > 0) {
    days = Math.min(totalDuration, Math.max(1, Number(cctvDays)));
  }
  const perDayRate = 1000;
  const total = days * perDayRate;

  return {
    perDayRate,
    days,
    option: isCustom ? 'custom' : 'always',
    total,
    description: `24/7 CCTV Camera Surveillance (${days} days @ ₹1,000/day ${isCustom ? '[Custom Days]' : '[Always / Full Duration]'})`,
  };
};

// @desc    Create new storage request / booking
// @route   POST /api/bookings
// @access  Public (Allows guest farmers or authenticated users)
const createBooking = async (req, res, next) => {
  try {
    const {
      storageId,
      crop,
      quantity,
      startDate,
      durationDays = 30,
      requiredTemp,
      farmerName,
      farmerPhone,
      farmerEmail,
      specialRequirements,
      distanceKm = 10,
      // Extra services selected by farmer
      extraServices = {},
      // Farmer registration data (if registering during booking)
      farmerPassword,
      registerFarmer = false,
    } = req.body;

    if (!req.user) {
      return next(new ErrorResponse('Please sign in as a farmer to book cold storage', 401));
    }

    if (req.user.role !== 'farmer' && req.user.role !== 'admin') {
      return next(new ErrorResponse('Only registered farmers can submit cold storage bookings', 403));
    }

    const bookingFarmerName = farmerName || req.user.name;
    const bookingFarmerPhone = farmerPhone || req.user.phone;
    const bookingFarmerEmail = farmerEmail || req.user.email || '';

    if (!storageId || !crop || !quantity || !startDate || !bookingFarmerName || !bookingFarmerPhone) {
      return next(new ErrorResponse('Please provide all required booking fields', 400));
    }

    const storage = await Storage.findById(storageId);
    if (!storage) {
      return next(new ErrorResponse('Selected cold storage facility not found', 404));
    }

    const qty = Number(quantity);
    if (storage.availableCapacity < qty) {
      return next(
        new ErrorResponse(
          `Requested quantity (${qty} kg) exceeds available space (${storage.availableCapacity} kg)`,
          400
        )
      );
    }

    // Calculate itemized base costs via service
    const costBreakdown = calculateTotalCost({
      pricePerKg: storage.pricePerKg,
      quantity: qty,
      durationDays,
      handlingCharge: storage.handlingCharge,
      transportRatePerKm: storage.transportRatePerKm,
      distanceKm,
    });

    const STATIC_SERVICE_COSTS = {
      insurance: 300,
      powerBackupConfirmation: 150,
      expressHandling: 180,
      preCoolingTreatment: 250,
      insuranceUpgrade: 100,
    };

    const STATIC_SERVICE_NAMES = {
      insurance: 'APEDA Standard Comprehensive Crop Insurance',
      powerBackupConfirmation: 'Guaranteed Power Backup Verification',
      expressHandling: 'Express Weighbridge & Priority Unloading Bay',
      preCoolingTreatment: 'Rapid Core Pre-Cooling Treatment',
      insuranceUpgrade: 'Premium Spoilage Insurance Upgrade',
    };

    let extraServicesCost = 0;
    const billItemsExtra = [];

    // 1. Genuine Transport Service (None, Only Pickup, Only Drop, or Both)
    const rawTransportMode = extraServices?.transportMode || (extraServices?.transportGoods ? 'pickup' : 'none');
    const normMode = ['pickup', 'drop', 'both'].includes(rawTransportMode) ? rawTransportMode : 'none';
    let transportFareData = { mode: 'none', total: 0, pickupFare: 0, dropFare: 0, pickupDistanceKm: 0, dropDistanceKm: 0, items: [] };

    if (normMode !== 'none') {
      const pAddress = extraServices?.pickupAddress || '';
      const dAddress = extraServices?.dropAddress || '';

      const pDist = Number(extraServices?.pickupDistanceKm) > 0
        ? Number(extraServices.pickupDistanceKm)
        : resolveDistanceKm(pAddress, storage.latitude, storage.longitude, storage.city);

      const dDist = Number(extraServices?.dropDistanceKm) > 0
        ? Number(extraServices.dropDistanceKm)
        : resolveDistanceKm(dAddress, storage.latitude, storage.longitude, storage.city);

      transportFareData = calculateTransportFare({
        mode: normMode,
        pickupDistanceKm: pDist,
        dropDistanceKm: dDist,
        quantityKg: qty,
        pickupAddress: pAddress,
        dropAddress: dAddress,
      });

      extraServicesCost += transportFareData.total;
      billItemsExtra.push(...transportFareData.items);
    }

    // 2. 24/7 CCTV Camera Surveillance at ₹1,000 / day
    let cctvFareData = null;
    const isCctv = Boolean(extraServices && extraServices.cctvMonitoring);
    if (isCctv) {
      cctvFareData = calculateCctvFare(
        extraServices.cctvOption || 'always',
        extraServices.cctvDays || durationDays,
        durationDays
      );
      extraServicesCost += cctvFareData.total;
      billItemsExtra.push({
        description: cctvFareData.description,
        quantity: cctvFareData.days,
        unitPrice: 1000,
        total: cctvFareData.total,
      });
    }

    // 3. Other static value-added services
    if (extraServices && typeof extraServices === 'object') {
      Object.keys(STATIC_SERVICE_COSTS).forEach((key) => {
        if (extraServices[key]) {
          const cost = STATIC_SERVICE_COSTS[key];
          extraServicesCost += cost;
          billItemsExtra.push({
            description: STATIC_SERVICE_NAMES[key] || key,
            quantity: 1,
            unitPrice: cost,
            total: cost,
          });
        }
      });
    }

    // Check if storage will be full after this booking
    const newAvailableCapacity = storage.availableCapacity - qty;
    let availabilityStatus = 'Available';
    if (newAvailableCapacity <= 0) {
      availabilityStatus = 'Full';
    } else if (newAvailableCapacity < storage.totalCapacity * 0.2) {
      availabilityStatus = 'Limited';
    }

    // Calculate total cost with extra services
    const subtotal = costBreakdown.totalCost + extraServicesCost;
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const total = subtotal + tax;

    // Itemized bill breakdown
    const billItems = [
      {
        description: `Cold Chamber Storage (${crop} - ${qty} kg for ${durationDays} days)`,
        quantity: 1,
        unitPrice: costBreakdown.storageCost,
        total: costBreakdown.storageCost,
      },
      {
        description: 'Handling, Weighing & Unloading',
        quantity: 1,
        unitPrice: costBreakdown.handlingCost,
        total: costBreakdown.handlingCost,
      },
    ];

    if (costBreakdown.transportCost > 0 && normMode === 'none') {
      billItems.push({
        description: `Standard Road Freight (${costBreakdown.distanceKm} km)`,
        quantity: 1,
        unitPrice: costBreakdown.transportCost,
        total: costBreakdown.transportCost,
      });
    }

    // Append extra services items
    billItems.push(...billItemsExtra);

    const booking = await Booking.create({
      farmerId: req.user._id,
      farmerName: bookingFarmerName,
      farmerPhone: bookingFarmerPhone,
      farmerEmail: bookingFarmerEmail,
      storageId: storage._id,
      storageName: storage.name,
      ownerId: storage.ownerId,
      crop,
      quantity: qty,
      startDate: new Date(startDate),
      durationDays: Number(durationDays),
      requiredTemp: requiredTemp || `${storage.temperatureMin}°C - ${storage.temperatureMax}°C`,
      specialRequirements: specialRequirements || '',
      estimatedStorageCost: costBreakdown.storageCost,
      handlingCost: costBreakdown.handlingCost,
      transportCost: normMode !== 'none' ? transportFareData.total : costBreakdown.transportCost,
      totalCost: total,
      distanceKm: costBreakdown.distanceKm,
      status: 'pending',
      extraServices: {
        cctvMonitoring: isCctv,
        cctvDays: isCctv && cctvFareData ? cctvFareData.days : 0,
        cctvOption: isCctv && cctvFareData ? cctvFareData.option : 'always',
        cctvCost: isCctv && cctvFareData ? cctvFareData.total : 0,
        transportGoods: normMode !== 'none',
        transportMode: normMode,
        pickupDistanceKm: transportFareData.pickupDistanceKm,
        dropDistanceKm: transportFareData.dropDistanceKm,
        pickupWeightKg: qty,
        dropWeightKg: qty,
        pickupAddress: extraServices.pickupAddress || '',
        dropAddress: extraServices.dropAddress || '',
        pickupCost: transportFareData.pickupFare,
        dropCost: transportFareData.dropFare,
        transportCost: transportFareData.total,
        insurance: Boolean(extraServices && extraServices.insurance),
        powerBackupConfirmation: Boolean(extraServices && extraServices.powerBackupConfirmation),
        expressHandling: Boolean(extraServices && extraServices.expressHandling),
        preCoolingTreatment: Boolean(extraServices && extraServices.preCoolingTreatment),
        insuranceUpgrade: Boolean(extraServices && extraServices.insuranceUpgrade),
      },
      bill: {
        generatedAt: new Date(),
        subtotal,
        extraServicesCost,
        tax,
        total,
        paymentStatus: 'pending',
        items: billItems,
      },
    });

    // Update storage availability
    storage.availableCapacity = newAvailableCapacity;
    storage.availability = availabilityStatus;
    await storage.save();

    res.status(201).json({
      success: true,
      message: 'Storage request sent successfully. Facility owner will review and confirm.',
      booking,
      storageAvailability: availabilityStatus,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings (Farmer sees their own, Owner sees for their facilities, Admin sees all)
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res, next) => {
  try {
    let query = {};

    if (req.user.role === 'farmer') {
      query = { $or: [{ farmerId: req.user._id }, { farmerPhone: req.user.phone }] };
    } else if (req.user.role === 'owner') {
      const ownerStorages = await Storage.find({ ownerId: req.user._id }).select('_id');
      const storageIds = ownerStorages.map((s) => s._id);
      query = { storageId: { $in: storageIds } };
    }

    const bookings = await Booking.find(query)
      .populate('storageId', 'name address city contactPhone images')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (accept, reject, complete)
// @route   PUT /api/bookings/:id/status
// @access  Private (Owner / Admin)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'accepted', 'rejected', 'completed'].includes(status)) {
      return next(new ErrorResponse('Invalid status value', 400));
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return next(new ErrorResponse('Booking request not found', 404));
    }

    const storage = await Storage.findById(booking.storageId);
    if (!storage) {
      return next(new ErrorResponse('Associated storage not found', 404));
    }

    if (req.user.role !== 'admin' && storage.ownerId.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized to update this booking', 403));
    }

    const previousStatus = booking.status;
    booking.status = status;
    await booking.save();

    // Adjust capacity dynamically
    if (previousStatus !== 'accepted' && status === 'accepted') {
      storage.availableCapacity = Math.max(0, storage.availableCapacity - booking.quantity);
      if (storage.availableCapacity === 0) {
        storage.availability = 'Full';
      } else if (storage.availableCapacity < storage.totalCapacity * 0.2) {
        storage.availability = 'Limited';
      }
      await storage.save();
    } else if (previousStatus === 'accepted' && (status === 'rejected' || status === 'completed')) {
      storage.availableCapacity = Math.min(storage.totalCapacity, storage.availableCapacity + booking.quantity);
      storage.availability = 'Available';
      await storage.save();
    }

    res.json({
      success: true,
      message: `Booking has been ${status}`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update optional services for a booking (e.g. Pickup & Drop, 24/7 CCTV surveillance)
// @route   PUT /api/bookings/:id/services
// @access  Private (Farmer or Admin)
const updateBookingServices = async (req, res, next) => {
  try {
    const extraServices = req.body.extraServices || req.body;
    const pickupAddress = req.body.pickupAddress;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return next(new ErrorResponse('Booking request not found', 404));
    }

    // Verify authorization: farmer must own this booking or be admin
    if (
      req.user.role !== 'admin' &&
      booking.farmerId?.toString() !== req.user._id.toString() &&
      booking.farmerPhone !== req.user.phone
    ) {
      return next(new ErrorResponse('Not authorized to update services for this booking', 403));
    }

    const storage = await Storage.findById(booking.storageId);
    const storageLat = storage ? storage.latitude : null;
    const storageLng = storage ? storage.longitude : null;
    const storageCity = storage ? storage.city : 'Ahmedabad';

    const STATIC_SERVICE_COSTS = {
      insurance: 300,
      powerBackupConfirmation: 150,
      expressHandling: 180,
      preCoolingTreatment: 250,
      insuranceUpgrade: 100,
    };

    const STATIC_SERVICE_NAMES = {
      insurance: 'APEDA Standard Comprehensive Crop Insurance',
      powerBackupConfirmation: 'Guaranteed Power Backup Verification',
      expressHandling: 'Express Weighbridge & Priority Unloading Bay',
      preCoolingTreatment: 'Rapid Core Pre-Cooling Treatment',
      insuranceUpgrade: 'Premium Spoilage Insurance Upgrade',
    };

    let extraServicesCost = 0;
    const billItemsExtra = [];

    // 1. Genuine Transport Service (None, Only Pickup, Only Drop, or Both)
    const rawTransportMode = extraServices.transportMode || (extraServices.transportGoods ? 'pickup' : 'none');
    const normMode = ['pickup', 'drop', 'both'].includes(rawTransportMode) ? rawTransportMode : 'none';
    let transportFareData = { mode: 'none', total: 0, pickupFare: 0, dropFare: 0, pickupDistanceKm: 0, dropDistanceKm: 0, items: [] };

    const effectivePickupAddress = pickupAddress || extraServices.pickupAddress || booking.extraServices?.pickupAddress || '';
    const effectiveDropAddress = extraServices.dropAddress || booking.extraServices?.dropAddress || `${booking.storageName}`;

    if (normMode !== 'none') {
      const pDist = Number(extraServices.pickupDistanceKm) > 0
        ? Number(extraServices.pickupDistanceKm)
        : resolveDistanceKm(effectivePickupAddress, storageLat, storageLng, storageCity);

      const dDist = Number(extraServices.dropDistanceKm) > 0
        ? Number(extraServices.dropDistanceKm)
        : resolveDistanceKm(effectiveDropAddress, storageLat, storageLng, storageCity);

      transportFareData = calculateTransportFare({
        mode: normMode,
        pickupDistanceKm: pDist,
        dropDistanceKm: dDist,
        quantityKg: booking.quantity,
        pickupAddress: effectivePickupAddress,
        dropAddress: effectiveDropAddress,
      });

      extraServicesCost += transportFareData.total;
      billItemsExtra.push(...transportFareData.items);
    }

    // 2. 24/7 CCTV Camera Surveillance at ₹1,000 / day
    let cctvFareData = null;
    const isCctv = Boolean(extraServices.cctvMonitoring);
    if (isCctv) {
      cctvFareData = calculateCctvFare(
        extraServices.cctvOption || 'always',
        extraServices.cctvDays || booking.durationDays,
        booking.durationDays
      );
      extraServicesCost += cctvFareData.total;
      billItemsExtra.push({
        description: cctvFareData.description,
        quantity: cctvFareData.days,
        unitPrice: 1000,
        total: cctvFareData.total,
      });
    }

    // 3. Other static extra services
    Object.keys(STATIC_SERVICE_COSTS).forEach((key) => {
      if (extraServices[key]) {
        const cost = STATIC_SERVICE_COSTS[key];
        extraServicesCost += cost;
        billItemsExtra.push({
          description: STATIC_SERVICE_NAMES[key] || key,
          quantity: 1,
          unitPrice: cost,
          total: cost,
        });
      }
    });

    // Update extra services on booking
    booking.extraServices = {
      cctvMonitoring: isCctv,
      cctvDays: isCctv && cctvFareData ? cctvFareData.days : 0,
      cctvOption: isCctv && cctvFareData ? cctvFareData.option : 'always',
      cctvCost: isCctv && cctvFareData ? cctvFareData.total : 0,
      transportGoods: normMode !== 'none',
      transportMode: normMode,
      pickupDistanceKm: transportFareData.pickupDistanceKm,
      dropDistanceKm: transportFareData.dropDistanceKm,
      pickupWeightKg: booking.quantity,
      dropWeightKg: booking.quantity,
      pickupAddress: effectivePickupAddress,
      dropAddress: effectiveDropAddress,
      pickupCost: transportFareData.pickupFare,
      dropCost: transportFareData.dropFare,
      transportCost: transportFareData.total,
      insurance: Boolean(extraServices.insurance),
      powerBackupConfirmation: Boolean(extraServices.powerBackupConfirmation),
      expressHandling: Boolean(extraServices.expressHandling),
      preCoolingTreatment: Boolean(extraServices.preCoolingTreatment),
      insuranceUpgrade: Boolean(extraServices.insuranceUpgrade),
    };

    if (effectivePickupAddress) {
      booking.specialRequirements = booking.specialRequirements
        ? `${booking.specialRequirements} | Pickup Address: ${effectivePickupAddress}`
        : `Pickup Address: ${effectivePickupAddress}`;
    }

    const baseCost = (booking.estimatedStorageCost || 0) + (booking.handlingCost || 0);
    const transitCost = normMode !== 'none' ? 0 : (booking.transportCost || 0);
    const subtotal = baseCost + transitCost + extraServicesCost;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;

    // Reconstruct itemized bill
    const billItems = [
      {
        description: `Cold Chamber Storage (${booking.crop} - ${booking.quantity} kg for ${booking.durationDays} days)`,
        quantity: 1,
        unitPrice: booking.estimatedStorageCost,
        total: booking.estimatedStorageCost,
      },
      {
        description: 'Handling, Weighing & Unloading',
        quantity: 1,
        unitPrice: booking.handlingCost,
        total: booking.handlingCost,
      },
    ];

    if (transitCost > 0) {
      billItems.push({
        description: `Road Transit Freight (${booking.distanceKm} km)`,
        quantity: 1,
        unitPrice: transitCost,
        total: transitCost,
      });
    }

    billItems.push(...billItemsExtra);

    booking.totalCost = total;
    booking.bill = {
      generatedAt: new Date(),
      subtotal,
      extraServicesCost,
      tax,
      total,
      paymentStatus: booking.bill?.paymentStatus || 'pending',
      paymentMethod: booking.bill?.paymentMethod || '',
      transactionId: booking.bill?.transactionId || '',
      paymentDate: booking.bill?.paymentDate || null,
      items: billItems,
    };

    await booking.save();

    res.json({
      success: true,
      message: 'Optional services updated successfully. Updated bill and invoice generated.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Pay booking bill
// @route   PUT /api/bookings/:id/pay
// @access  Private (Farmer or Admin)
const payBookingBill = async (req, res, next) => {
  try {
    const { paymentMethod = 'UPI', transactionId } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return next(new ErrorResponse('Booking request not found', 404));
    }

    // Verify authorization: farmer, facility owner, or admin
    const isFarmer =
      booking.farmerId?.toString() === req.user._id.toString() ||
      booking.farmerPhone === req.user.phone;
    const isOwner = booking.ownerId?.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isFarmer && !isOwner && !isAdmin) {
      return next(new ErrorResponse('Not authorized to update payment for this booking', 403));
    }

    if (booking.bill?.paymentStatus === 'paid') {
      return res.json({
        success: true,
        message: 'This bill has already been paid!',
        booking,
      });
    }

    const txnId =
      transactionId ||
      `TXN-AGRI-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    if (!booking.bill) {
      booking.bill = {
        generatedAt: new Date(),
        subtotal: booking.totalCost,
        tax: 0,
        total: booking.totalCost,
        items: [],
      };
    }

    booking.bill.paymentStatus = 'paid';
    booking.bill.paymentMethod = paymentMethod;
    booking.bill.transactionId = txnId;
    booking.bill.paymentDate = new Date();

    await booking.save();

    res.json({
      success: true,
      message: `Bill of ₹${booking.bill.total || booking.totalCost} paid successfully!`,
      booking,
      transactionId: txnId,
      paymentDate: booking.bill.paymentDate,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  updateBookingStatus,
  updateBookingServices,
  payBookingBill,
};
