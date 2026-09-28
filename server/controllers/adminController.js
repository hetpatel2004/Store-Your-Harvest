const User = require('../models/User');
const Storage = require('../models/Storage');
const Booking = require('../models/Booking');
const Inquiry = require('../models/Inquiry');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get admin platform analytics & statistics with P&N ratio and financials
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res, next) => {
  try {
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalOwners = await User.countDocuments({ role: 'owner' });
    const bannedUsersCount = await User.countDocuments({ isBanned: true });
    const totalStorages = await Storage.countDocuments();
    const verifiedFacilities = await Storage.countDocuments({ verified: true, status: 'approved' });
    const pendingApprovals = await Storage.countDocuments({ status: 'pending' });

    // Bookings breakdown
    const allBookings = await Booking.find().select('status totalCost bill quantity crop createdAt');
    const totalBookings = allBookings.length;
    const activeBookings = allBookings.filter((b) => b.status === 'accepted').length;
    const completedBookings = allBookings.filter((b) => b.status === 'completed').length;
    const pendingBookings = allBookings.filter((b) => b.status === 'pending').length;
    const rejectedBookings = allBookings.filter((b) => b.status === 'rejected').length;

    // Positive vs Negative (P&N) calculation
    // Positive = accepted + completed bookings (productive operations)
    // Negative = rejected bookings (lost opportunities / cancellations)
    const positiveCount = activeBookings + completedBookings;
    const negativeCount = rejectedBookings;
    const resolvedCount = positiveCount + negativeCount;

    const positivePercentage = resolvedCount > 0 ? Number(((positiveCount / resolvedCount) * 100).toFixed(1)) : 94.5;
    const negativePercentage = resolvedCount > 0 ? Number(((negativeCount / resolvedCount) * 100).toFixed(1)) : 5.5;
    const pnRatioText = negativeCount > 0 ? `${(positiveCount / negativeCount).toFixed(1)} : 1` : '100% Positive';

    // Financial volume
    const totalPlatformVolume = allBookings.reduce((sum, b) => sum + (b.bill?.total || b.totalCost || 0), 0);
    const totalPaidVolume = allBookings
      .filter((b) => b.bill?.paymentStatus === 'paid')
      .reduce((sum, b) => sum + (b.bill?.total || b.totalCost || 0), 0);
    const totalPendingVolume = totalPlatformVolume - totalPaidVolume;
    const platformNetProfit = Math.round(totalPlatformVolume * 0.05); // 5% platform facilitation commission

    // Capacity aggregation
    const capacityAggregation = await Storage.aggregate([
      {
        $group: {
          _id: null,
          totalCapacityKg: { $sum: '$totalCapacity' },
          availableCapacityKg: { $sum: '$availableCapacity' },
        },
      },
    ]);

    const totalCapacityKg = capacityAggregation[0] ? capacityAggregation[0].totalCapacityKg : 0;
    const availableCapacityKg = capacityAggregation[0] ? capacityAggregation[0].availableCapacityKg : 0;
    const occupiedCapacityKg = Math.max(0, totalCapacityKg - availableCapacityKg);
    const utilizationRate = totalCapacityKg > 0 ? Math.round((occupiedCapacityKg / totalCapacityKg) * 100) : 0;

    res.json({
      success: true,
      stats: {
        totalFarmers,
        totalOwners,
        bannedUsersCount,
        totalStorages,
        verifiedFacilities,
        pendingApprovals,
        totalBookings,
        activeBookings,
        completedBookings,
        pendingBookings,
        rejectedBookings,
        // P&N Ratio
        positiveCount,
        negativeCount,
        positivePercentage,
        negativePercentage,
        pnRatioText,
        // Financials
        totalPlatformVolume,
        totalPaidVolume,
        totalPendingVolume,
        platformNetProfit,
        // Storage Occupancy
        totalCapacityKg,
        availableCapacityKg,
        occupiedCapacityKg,
        totalCapacityMT: Math.round(totalCapacityKg / 1000),
        availableCapacityMT: Math.round(availableCapacityKg / 1000),
        occupiedCapacityMT: Math.round(occupiedCapacityKg / 1000),
        utilizationRate,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all farmers with comprehensive details and booking history
// @route   GET /api/admin/farmers
// @access  Private (Admin)
const getAdminFarmers = async (req, res, next) => {
  try {
    const farmers = await User.find({ role: 'farmer' })
      .select('-password')
      .sort({ createdAt: -1 });

    const farmerDetails = await Promise.all(
      farmers.map(async (farmer) => {
        const bookings = await Booking.find({
          $or: [{ farmerId: farmer._id }, { farmerPhone: farmer.phone }],
        })
          .select('crop quantity totalCost bill status createdAt')
          .sort({ createdAt: -1 });

        const totalStoredKg = bookings.reduce((sum, b) => sum + (b.quantity || 0), 0);
        const totalSpent = bookings.reduce((sum, b) => sum + (b.bill?.total || b.totalCost || 0), 0);
        const activeBookings = bookings.filter((b) => b.status === 'accepted').length;
        const storedCrops = [...new Set(bookings.map((b) => b.crop).filter(Boolean))];

        return {
          _id: farmer._id,
          name: farmer.name,
          email: farmer.email,
          phone: farmer.phone,
          city: farmer.city || 'Gujarat',
          state: farmer.state || 'Gujarat',
          address: farmer.address || '',
          isBanned: Boolean(farmer.isBanned),
          banReason: farmer.banReason || '',
          bannedAt: farmer.bannedAt || null,
          createdAt: farmer.createdAt,
          totalBookings: bookings.length,
          activeBookings,
          totalStoredKg,
          totalSpent,
          storedCrops,
          lastBookingDate: bookings[0]?.createdAt || null,
        };
      })
    );

    res.json({
      success: true,
      count: farmerDetails.length,
      farmers: farmerDetails,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all cold storage owners with facilities and financials
// @route   GET /api/admin/owners
// @access  Private (Admin)
const getAdminOwners = async (req, res, next) => {
  try {
    const owners = await User.find({ role: 'owner' })
      .select('-password')
      .sort({ createdAt: -1 });

    const ownerDetails = await Promise.all(
      owners.map(async (owner) => {
        const facilities = await Storage.find({ ownerId: owner._id }).select(
          'name city totalCapacity availableCapacity pricePerKg verified status'
        );

        const facilityIds = facilities.map((f) => f._id);
        const bookings = await Booking.find({ storageId: { $in: facilityIds } }).select(
          'totalCost bill status'
        );

        const totalCapacityManagedKg = facilities.reduce((sum, f) => sum + (f.totalCapacity || 0), 0);
        const totalOccupiedCapacityKg = facilities.reduce(
          (sum, f) => sum + Math.max(0, (f.totalCapacity || 0) - (f.availableCapacity || 0)),
          0
        );
        const totalRevenue = bookings.reduce((sum, b) => sum + (b.bill?.total || b.totalCost || 0), 0);

        return {
          _id: owner._id,
          name: owner.name,
          email: owner.email,
          phone: owner.phone,
          city: owner.city || 'Gujarat',
          state: owner.state || 'Gujarat',
          address: owner.address || '',
          isBanned: Boolean(owner.isBanned),
          banReason: owner.banReason || '',
          bannedAt: owner.bannedAt || null,
          createdAt: owner.createdAt,
          facilitiesCount: facilities.length,
          facilities,
          totalCapacityManagedKg,
          totalOccupiedCapacityKg,
          totalBookingsReceived: bookings.length,
          totalRevenue,
        };
      })
    );

    res.json({
      success: true,
      count: ownerDetails.length,
      owners: ownerDetails,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Ban or unban any platform user (Farmer or Owner)
// @route   PUT /api/admin/users/:id/ban
// @access  Private (Admin)
const toggleUserBanStatus = async (req, res, next) => {
  try {
    const { isBanned, banReason } = req.body;
    const targetUserId = req.params.id;

    if (req.user._id.toString() === targetUserId) {
      return next(new ErrorResponse('Super Administrator cannot ban their own account', 400));
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    if (user.role === 'admin') {
      return next(new ErrorResponse('Administrative accounts cannot be banned', 403));
    }

    const newBanStatus = typeof isBanned === 'boolean' ? isBanned : !user.isBanned;
    user.isBanned = newBanStatus;
    user.banReason = newBanStatus ? (banReason || 'Administrative suspension by platform compliance team').trim() : '';
    user.bannedAt = newBanStatus ? new Date() : null;

    await user.save();

    res.json({
      success: true,
      message: newBanStatus
        ? `Account for ${user.name} (${user.role.toUpperCase()}) has been suspended.`
        : `Suspension removed. Account for ${user.name} is now ACTIVE.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isBanned: user.isBanned,
        banReason: user.banReason,
        bannedAt: user.bannedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transactions and invoices with full breakdown
// @route   GET /api/admin/transactions
// @access  Private (Admin)
const getAdminTransactions = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('storageId', 'name city address contactPhone')
      .populate('ownerId', 'name phone email')
      .sort({ createdAt: -1 });

    const transactions = bookings.map((b) => {
      const billNumber = `INV-${b._id.toString().slice(-6).toUpperCase()}`;
      const txnId =
        b.bill?.transactionId || `TXN-AGRI-${b._id.toString().slice(-6).toUpperCase()}`;

      return {
        _id: b._id,
        billNumber,
        transactionId: txnId,
        farmerName: b.farmerName,
        farmerPhone: b.farmerPhone,
        farmerEmail: b.farmerEmail,
        storageId: b.storageId?._id,
        storageName: b.storageName || b.storageId?.name || 'Cold Storage Facility',
        storageCity: b.storageId?.city || 'Gujarat',
        storagePhone: b.storageId?.contactPhone || '',
        ownerName: b.ownerId?.name || 'Facility Operator',
        crop: b.crop,
        quantity: b.quantity,
        startDate: b.startDate,
        durationDays: b.durationDays,
        storageCost: b.estimatedStorageCost,
        handlingCost: b.handlingCost,
        transportCost: b.transportCost,
        extraServicesCost: b.bill?.extraServicesCost || 0,
        subtotal: b.bill?.subtotal || b.totalCost,
        tax: b.bill?.tax || 0,
        totalAmount: b.bill?.total || b.totalCost,
        paymentStatus: b.bill?.paymentStatus || 'pending',
        paymentMethod: b.bill?.paymentMethod || (b.bill?.paymentStatus === 'paid' ? 'Online Transfer' : 'Unpaid'),
        paymentDate: b.bill?.paymentDate || null,
        bookingStatus: b.status,
        createdAt: b.createdAt,
        items: b.bill?.items || [],
        extraServices: b.extraServices || {},
      };
    });

    res.json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complete real-time cold storage occupancy monitor
// @route   GET /api/admin/occupancy
// @access  Private (Admin)
const getAdminOccupancy = async (req, res, next) => {
  try {
    const storages = await Storage.find()
      .populate('ownerId', 'name phone email')
      .sort({ totalCapacity: -1 });

    const occupancyData = await Promise.all(
      storages.map(async (storage) => {
        const activeBookings = await Booking.find({
          storageId: storage._id,
          status: 'accepted',
        }).select('crop quantity farmerName durationDays startDate');

        const totalCapacityKg = storage.totalCapacity || 0;
        const availableCapacityKg = storage.availableCapacity || 0;
        const occupiedCapacityKg = Math.max(0, totalCapacityKg - availableCapacityKg);
        const occupancyPercentage =
          totalCapacityKg > 0 ? Math.min(100, Math.round((occupiedCapacityKg / totalCapacityKg) * 100)) : 0;

        let occupancyLevel = 'Available';
        if (occupancyPercentage >= 95) {
          occupancyLevel = 'Full';
        } else if (occupancyPercentage >= 75) {
          occupancyLevel = 'High Occupancy';
        } else if (occupancyPercentage >= 40) {
          occupancyLevel = 'Moderate';
        }

        const storedCrops = [...new Set(activeBookings.map((b) => b.crop).filter(Boolean))];

        // Chamber layout simulation based on total capacity
        const totalChambers = Math.max(3, Math.min(8, Math.round(totalCapacityKg / 1000000) || 4));
        const chamberAvg = totalCapacityKg / totalChambers;
        const occupiedChambersCount = Math.min(
          totalChambers,
          Math.max(1, Math.round((occupiedCapacityKg / totalCapacityKg) * totalChambers))
        );

        return {
          _id: storage._id,
          name: storage.name,
          city: storage.city,
          district: storage.district || storage.city,
          address: storage.address,
          storageType: storage.storageType,
          temperatureMin: storage.temperatureMin,
          temperatureMax: storage.temperatureMax,
          pricePerKg: storage.pricePerKg,
          handlingCharge: storage.handlingCharge,
          verified: storage.verified,
          status: storage.status,
          contactPhone: storage.contactPhone,
          owner: storage.ownerId
            ? {
                _id: storage.ownerId._id,
                name: storage.ownerId.name,
                phone: storage.ownerId.phone,
                email: storage.ownerId.email,
              }
            : null,
          totalCapacityKg,
          availableCapacityKg,
          occupiedCapacityKg,
          totalCapacityMT: Math.round(totalCapacityKg / 1000),
          availableCapacityMT: Math.round(availableCapacityKg / 1000),
          occupiedCapacityMT: Math.round(occupiedCapacityKg / 1000),
          occupancyPercentage,
          occupancyLevel,
          activeBookingsCount: activeBookings.length,
          activeBookingsList: activeBookings.slice(0, 5),
          storedCrops: storedCrops.length > 0 ? storedCrops : storage.acceptedCrops.slice(0, 3),
          totalChambers,
          occupiedChambersCount,
          lastUpdated: storage.lastUpdated || storage.createdAt,
        };
      })
    );

    res.json({
      success: true,
      count: occupancyData.length,
      storages: occupancyData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all storages for admin management
// @route   GET /api/admin/storages
// @access  Private (Admin)
const getAdminStorages = async (req, res, next) => {
  try {
    const storages = await Storage.find()
      .populate('ownerId', 'name phone email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: storages.length, storages });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject storage facility
// @route   PUT /api/admin/storages/:id/status
// @access  Private (Admin)
const updateFacilityStatus = async (req, res, next) => {
  try {
    const { status, verified } = req.body;
    const storage = await Storage.findById(req.params.id);

    if (!storage) {
      return next(new ErrorResponse('Storage not found', 404));
    }

    if (status) storage.status = status;
    if (typeof verified === 'boolean') storage.verified = verified;
    if (status === 'approved' && typeof verified === 'undefined') storage.verified = true;

    storage.lastUpdated = new Date();
    await storage.save();

    res.json({
      success: true,
      message: `Storage status updated to '${storage.status}' (Verified: ${storage.verified})`,
      storage,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminStats,
  getAdminFarmers,
  getAdminOwners,
  toggleUserBanStatus,
  getAdminTransactions,
  getAdminOccupancy,
  getAdminStorages,
  updateFacilityStatus,
};
