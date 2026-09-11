const Booking = require('../models/Booking');
const Storage = require('../models/Storage');
const { calculateTotalCost } = require('../services/costCalculatorService');
const ErrorResponse = require('../utils/errorResponse');

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
    } = req.body;

    if (!storageId || !crop || !quantity || !startDate || !farmerName || !farmerPhone) {
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

    // Calculate itemized costs via service
    const costBreakdown = calculateTotalCost({
      pricePerKg: storage.pricePerKg,
      quantity: qty,
      durationDays,
      handlingCharge: storage.handlingCharge,
      transportRatePerKm: storage.transportRatePerKm,
      distanceKm,
    });

    const booking = await Booking.create({
      farmerId: req.user ? req.user._id : null,
      farmerName,
      farmerPhone,
      farmerEmail: farmerEmail || (req.user ? req.user.email : ''),
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
      transportCost: costBreakdown.transportCost,
      totalCost: costBreakdown.totalCost,
      distanceKm: costBreakdown.distanceKm,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Storage request sent successfully. Facility owner will review and confirm.',
      booking,
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

module.exports = { createBooking, getBookings, updateBookingStatus };
