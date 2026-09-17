const Storage = require('../models/Storage');
const { computeRecommendationScore, CROP_STORAGE_PROFILES } = require('../services/recommendationService');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all storages with smart filtering, recommendation scores, and distance
// @route   GET /api/storages
// @access  Public
const getStorages = async (req, res, next) => {
  try {
    const {
      crop,
      quantity,
      city,
      lat,
      lng,
      duration,
      minCapacity,
      maxPrice,
      maxDistance,
      sortBy = 'recommended', // 'recommended', 'distance', 'price_asc', 'capacity_desc', 'rating'
      verifiedOnly,
    } = req.query;

    let query = { status: 'approved' };

    if (verifiedOnly === 'true') {
      query.verified = true;
    }

    if (minCapacity) {
      query.availableCapacity = { $gte: Number(minCapacity) };
    }

    if (maxPrice) {
      query.pricePerKg = { $lte: Number(maxPrice) };
    }

    const storages = await Storage.find(query).populate('ownerId', 'name phone email');

    const farmerReqs = {
      crop: crop || '',
      quantity: Number(quantity) || 500,
      userCity: city || 'Ahmedabad',
      userLat: lat ? Number(lat) : undefined,
      userLng: lng ? Number(lng) : undefined,
      durationDays: Number(duration) || 30,
    };

    // Calculate smart recommendation scores and cost breakdowns
    let enrichedStorages = storages.map((storage) => {
      const storageObj = storage.toObject();
      const recommendation = computeRecommendationScore(storageObj, farmerReqs);
      return {
        ...storageObj,
        ...recommendation,
      };
    });

    // Filter by maxDistance if specified
    if (maxDistance) {
      enrichedStorages = enrichedStorages.filter(
        (s) => s.distance <= Number(maxDistance)
      );
    }

    // Sort results
    if (sortBy === 'recommended') {
      enrichedStorages.sort((a, b) => b.matchScore - a.matchScore);
    } else if (sortBy === 'distance') {
      enrichedStorages.sort((a, b) => a.distance - b.distance);
    } else if (sortBy === 'price_asc') {
      enrichedStorages.sort((a, b) => a.costBreakdown.totalCost - b.costBreakdown.totalCost);
    } else if (sortBy === 'capacity_desc') {
      enrichedStorages.sort((a, b) => b.availableCapacity - a.availableCapacity);
    } else if (sortBy === 'rating') {
      enrichedStorages.sort((a, b) => b.rating - a.rating);
    }

    res.json({
      success: true,
      count: enrichedStorages.length,
      searchCriteria: farmerReqs,
      storages: enrichedStorages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single storage by ID
// @route   GET /api/storages/:id
// @access  Public
const getStorageById = async (req, res, next) => {
  try {
    const storage = await Storage.findById(req.params.id).populate('ownerId', 'name phone email');
    if (!storage) {
      return next(new ErrorResponse('Storage facility not found', 404));
    }

    const { crop, quantity = 500, city = 'Ahmedabad', duration = 30 } = req.query;
    const recommendation = computeRecommendationScore(storage.toObject(), {
      crop,
      quantity: Number(quantity),
      userCity: city,
      durationDays: Number(duration),
    });

    res.json({
      success: true,
      storage: {
        ...storage.toObject(),
        ...recommendation,
      },
      cropProfile: crop ? CROP_STORAGE_PROFILES[crop] : null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new storage facility (by Storage Owner)
// @route   POST /api/storages
// @access  Private (Owner / Admin)
const createStorage = async (req, res, next) => {
  try {
    const {
      name,
      tagline,
      address,
      city,
      district,
      latitude,
      longitude,
      storageType,
      totalCapacity,
      availableCapacity,
      temperatureMin,
      temperatureMax,
      humidityMin,
      humidityMax,
      acceptedCrops,
      minimumQuantity,
      pricePerKg,
      handlingCharge,
      transportRatePerKm,
      storageDuration,
      paymentTerms,
      damagePolicy,
      operatingHours,
      contactPhone,
      contactEmail,
      images,
      features,
    } = req.body;

    const storage = await Storage.create({
      ownerId: req.user._id,
      name,
      tagline,
      address,
      city: city || 'Ahmedabad',
      district: district || city || 'Ahmedabad',
      latitude: Number(latitude) || 23.0225,
      longitude: Number(longitude) || 72.5714,
      storageType: storageType || 'Multipurpose CA Cold Store',
      totalCapacity: Number(totalCapacity),
      availableCapacity: Number(availableCapacity) || Number(totalCapacity),
      temperatureMin: Number(temperatureMin),
      temperatureMax: Number(temperatureMax),
      humidityMin: Number(humidityMin) || 85,
      humidityMax: Number(humidityMax) || 95,
      acceptedCrops: Array.isArray(acceptedCrops)
        ? acceptedCrops.map((s) => String(s).trim()).filter(Boolean)
        : typeof acceptedCrops === 'string' && acceptedCrops.trim()
        ? acceptedCrops.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      minimumQuantity: Number(minimumQuantity) || 100,
      pricePerKg: Number(pricePerKg),
      handlingCharge: Number(handlingCharge) || 350,
      transportRatePerKm: Number(transportRatePerKm) || 25,
      storageDuration: storageDuration || '15 to 180 days',
      paymentTerms: paymentTerms || 'Standard deposit & balance on departure',
      damagePolicy: damagePolicy || 'Covered under commercial cold storage insurance policy',
      operatingHours: operatingHours || '06:00 AM - 10:00 PM',
      contactPhone: contactPhone || req.user.phone,
      contactEmail: contactEmail || req.user.email,
      images: images && images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80'
      ],
      features: Array.isArray(features) ? features : (features ? features.split(',').map(f => f.trim()) : ['Power backup', 'CCTV monitoring', 'Weighbridge']),
      verified: false,
      status: 'pending',
    });

    res.status(201).json({ success: true, storage });
  } catch (error) {
    next(error);
  }
};

// @desc    Update storage facility
// @route   PUT /api/storages/:id
// @access  Private (Owner / Admin)
const updateStorage = async (req, res, next) => {
  try {
    let storage = await Storage.findById(req.params.id);
    if (!storage) {
      return next(new ErrorResponse('Storage not found', 404));
    }

    // Check ownership unless admin
    if (storage.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to update this facility', 403));
    }

    // Only these fields may be edited directly. Status, verification, and rating
    // are controlled exclusively through the admin approval workflow.
    const EDITABLE_FIELDS = [
      'name', 'tagline', 'address', 'city', 'district', 'latitude', 'longitude',
      'storageType', 'totalCapacity', 'availableCapacity', 'temperatureMin',
      'temperatureMax', 'humidityMin', 'humidityMax', 'acceptedCrops',
      'minimumQuantity', 'pricePerKg', 'handlingCharge', 'transportRatePerKm',
      'storageDuration', 'paymentTerms', 'damagePolicy', 'operatingHours',
      'contactPhone', 'contactEmail', 'images', 'features',
    ];
    const NUMERIC_FIELDS = [
      'latitude', 'longitude', 'totalCapacity', 'availableCapacity', 'temperatureMin',
      'temperatureMax', 'humidityMin', 'humidityMax', 'minimumQuantity', 'pricePerKg',
      'handlingCharge', 'transportRatePerKm',
    ];

    const updateData = {};
    Object.keys(req.body).forEach((key) => {
      if (!EDITABLE_FIELDS.includes(key) || req.body[key] === undefined) return;
      if (key === 'acceptedCrops') {
        updateData.acceptedCrops = Array.isArray(req.body.acceptedCrops)
          ? req.body.acceptedCrops.map((s) => String(s).trim()).filter(Boolean)
          : typeof req.body.acceptedCrops === 'string' && req.body.acceptedCrops.trim()
          ? req.body.acceptedCrops.split(',').map((s) => s.trim()).filter(Boolean)
          : [];
      } else if (key === 'images') {
        updateData.images = Array.isArray(req.body.images)
          ? req.body.images
          : req.body.images
          ? [req.body.images]
          : [];
      } else if (key === 'features') {
        updateData.features = Array.isArray(req.body.features)
          ? req.body.features
          : req.body.features
          ? req.body.features.split(',').map((f) => f.trim())
          : [];
      } else if (NUMERIC_FIELDS.includes(key)) {
        const num = Number(req.body[key]);
        updateData[key] = Number.isFinite(num) ? num : storage[key];
      } else {
        updateData[key] = req.body[key];
      }
    });

    storage = await Storage.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, storage });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete storage facility
// @route   DELETE /api/storages/:id
// @access  Private (Owner / Admin)
const deleteStorage = async (req, res, next) => {
  try {
    const storage = await Storage.findById(req.params.id);
    if (!storage) {
      return next(new ErrorResponse('Storage not found', 404));
    }

    if (storage.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to delete this facility', 403));
    }

    await storage.deleteOne();
    res.json({ success: true, message: 'Storage facility removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get owner's facilities
// @route   GET /api/storages/my/facilities
// @access  Private (Owner)
const getMyFacilities = async (req, res, next) => {
  try {
    const storages = await Storage.find({ ownerId: req.user._id });
    res.json({ success: true, count: storages.length, storages });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recommended storages with scores
// @route   GET /api/storages/recommended
// @access  Public
const getRecommendedStorages = async (req, res, next) => {
  try {
    const {
      crop,
      quantity,
      city,
      lat,
      lng,
      duration,
      season = 'normal',
    } = req.query;

    let query = { status: 'approved' };

    if (crop) {
      query.acceptedCrops = crop;
    }

    const storages = await Storage.find(query).populate('ownerId', 'name phone email');

    const farmerReqs = {
      crop: crop || '',
      quantity: Number(quantity) || 500,
      userCity: city || 'Ahmedabad',
      userLat: lat ? Number(lat) : undefined,
      userLng: lng ? Number(lng) : undefined,
      durationDays: Number(duration) || 30,
      season,
    };

    // Calculate smart recommendation scores and cost breakdowns
    const enrichedStorages = storages.map((storage) => {
      const storageObj = storage.toObject();
      const recommendation = computeRecommendationScore(storageObj, farmerReqs);
      return {
        ...storageObj,
        ...recommendation,
      };
    });

    // Sort by recommendation score (highest first)
    enrichedStorages.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      count: enrichedStorages.length,
      searchCriteria: farmerReqs,
      storages: enrichedStorages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Compare specific storage with others
// @route   GET /api/storages/compare/:id
// @access  Public
const compareStorages = async (req, res, next) => {
  try {
    const targetStorageId = req.params.id;

    // Get all approved storages
    const storages = await Storage.find({ status: 'approved' }).populate('ownerId', 'name phone email');

    // Find the target storage
    const targetStorage = storages.find(
      (s) => s._id.toString() === targetStorageId
    );

    if (!targetStorage) {
      return next(new ErrorResponse('Storage facility not found', 404));
    }

    // Get query parameters for comparison
    const {
      crop,
      quantity,
      city,
      lat,
      lng,
    } = req.query;

    const farmerReqs = {
      crop: crop || '',
      quantity: Number(quantity) || 500,
      userCity: city || 'Ahmedabad',
      userLat: lat ? Number(lat) : undefined,
      userLng: lng ? Number(lng) : undefined,
    };

    // Calculate scores for all storages
    const comparedStorages = storages.map((storage) => {
      const storageObj = storage.toObject();
      const recommendation = computeRecommendationScore(storageObj, farmerReqs);
      return {
        ...storageObj,
        ...recommendation,
      };
    });

    // Sort by match score (highest first)
    comparedStorages.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      targetStorageId,
      searchCriteria: farmerReqs,
      comparedStorages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get storage analytics (admin only)
// @route   GET /api/storages/analytics
// @access  Private (Admin)
const getStorageAnalytics = async (req, res, next) => {
  try {
    const totalStorages = await Storage.countDocuments({ status: 'approved' });
    const verifiedStorages = await Storage.countDocuments({ status: 'approved', verified: true });
    const pendingStorages = await Storage.countDocuments({ status: 'pending' });
    const rejectedStorages = await Storage.countDocuments({ status: 'rejected' });

    // Storage status distribution
    const statusDistribution = await Storage.aggregate([
      { $match: { status: { $in: ['approved', 'pending', 'rejected'] } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Crop distribution
    const cropDistribution = await Storage.aggregate([
      { $unwind: '$acceptedCrops' },
      { $group: { _id: '$acceptedCrops', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Average rating by status
    const ratingByStatus = await Storage.aggregate([
      { $match: { status: 'approved' } },
      { $group: {
          _id: '$status',
          avgRating: { $avg: '$rating' },
          totalCount: { $sum: 1 },
        }
      },
      { $sort: { avgRating: -1 } },
    ]);

    // Top 5 recommended storages (by match score potential)
    const topStorages = await Storage.find({ status: 'approved' })
      .sort({ rating: -1 })
      .limit(5)
      .populate('ownerId', 'name');

    res.json({
      success: true,
      analytics: {
        totalStorages,
        verifiedStorages,
        pendingStorages,
        rejectedStorages,
        statusDistribution,
        cropDistribution,
        ratingByStatus,
        topStorages,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStorages,
  getStorageById,
  createStorage,
  updateStorage,
  deleteStorage,
  getMyFacilities,
  getRecommendedStorages,
  compareStorages,
  getStorageAnalytics,
};
