const Booking = require('../models/Booking');
const Storage = require('../models/Storage');

// @desc    Create new storage request / booking
// @route   POST /api/bookings
// @access  Public (Optional auth for guest farmers or logged-in farmers)
const createBooking = async (req, res) => {
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
      return res.status(400).json({ message: 'Please provide all required booking fields' });
    }

    const storage = await Storage.findById(storageId);
    if (!storage) {
      return res.status(404).json({ message: 'Selected cold storage facility not found' });
    }

    const qty = Number(quantity);
    if (storage.availableCapacity < qty) {
      return res.status(400).json({
        message: `Requested quantity (${qty} kg) exceeds current available capacity (${storage.availableCapacity} kg)`,
      });
    }

    // Calculate costs
    const months = Math.max(Number(durationDays) || 30, 1) / 30;
    const estimatedStorageCost = Math.round(storage.pricePerKg * qty * months);
    const handlingCost = storage.handlingCharge || 350;
    const transportRate = storage.transportRatePerKm || 25;
    const transportCost = Math.round((Number(distanceKm) || 10) * transportRate);
    const totalCost = estimatedStorageCost + handlingCost + transportCost;

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
      estimatedStorageCost,
      handlingCost,
      transportCost,
      totalCost,
      distanceKm: Number(distanceKm) || 10,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Storage request sent successfully. Facility owner will review and confirm.',
      booking,
    });
  } catch (error) {
    console.error('createBooking error:', error);
    res.status(500).json({ message: error.message || 'Server error submitting booking request' });
  }
};

// @desc    Get bookings (Farmer sees their own, Owner sees for their facilities, Admin sees all)
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'farmer') {
      query = { $or: [{ farmerId: req.user._id }, { farmerPhone: req.user.phone }] };
    } else if (req.user.role === 'owner') {
      // Find storages owned by this owner
      const ownerStorages = await Storage.find({ ownerId: req.user._id }).select('_id');
      const storageIds = ownerStorages.map((s) => s._id);
      query = { storageId: { $in: storageIds } };
    }
    // Admin sees all without restriction

    const bookings = await Booking.find(query)
      .populate('storageId', 'name address city contactPhone images')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error('getBookings error:', error);
    res.status(500).json({ message: 'Server error retrieving bookings' });
  }
};

// @desc    Update booking status (accept, reject, complete)
// @route   PUT /api/bookings/:id/status
// @access  Private (Owner / Admin)
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking request not found' });
    }

    const storage = await Storage.findById(booking.storageId);
    if (!storage) {
      return res.status(404).json({ message: 'Associated storage not found' });
    }

    if (req.user.role !== 'admin' && storage.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    const previousStatus = booking.status;
    booking.status = status;
    await booking.save();

    // Adjust capacity if accepted or completed
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
    console.error('updateBookingStatus error:', error);
    res.status(500).json({ message: 'Server error updating booking status' });
  }
};

module.exports = { createBooking, getBookings, updateBookingStatus };
