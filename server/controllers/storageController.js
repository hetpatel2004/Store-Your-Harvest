const Storage = require('../models/Storage');
const { CROP_PROFILES } = require('../utils/seedData');

// City coordinate lookup for distance calculation
const CITY_COORDS = {
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  sanand: { lat: 22.9856, lng: 72.3802 },
  bavla: { lat: 22.8361, lng: 72.3619 },
  gandhinagar: { lat: 23.2156, lng: 72.6369 },
  kadi: { lat: 23.3039, lng: 72.3328 },
  anand: { lat: 22.5645, lng: 72.9289 },
  dholka: { lat: 22.7239, lng: 72.4644 },
  naroda: { lat: 23.0805, lng: 72.6589 },
  mehsana: { lat: 23.5880, lng: 72.3693 },
  rajkot: { lat: 22.3039, lng: 70.8022 },
  vadodara: { lat: 22.3072, lng: 73.1812 },
  surat: { lat: 21.1702, lng: 72.8311 },
};

// Haversine formula for distance in kilometers
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// Smart Recommendation Scoring Engine
const calculateSmartRecommendation = (storage, farmerRequirements) => {
  const { crop, quantity = 500, userLat, userLng, userCity, durationDays = 30 } = farmerRequirements;

  let score = 0;
  const explanations = [];

  // 1. Crop Compatibility (30 pts)
  let isCropAccepted = false;
  if (crop && storage.acceptedCrops && storage.acceptedCrops.length > 0) {
    isCropAccepted = storage.acceptedCrops.some(
      (c) => c.toLowerCase() === crop.toLowerCase()
    );
    if (isCropAccepted) {
      score += 30;
      explanations.push(`Explicitly accepts ${crop}`);
    } else {
      score += 5; // fallback
    }
  } else {
    score += 25; // neutral if no crop specified
  }

  // 2. Temperature Compatibility (25 pts)
  const cropProfile = crop ? CROP_PROFILES[crop] : null;
  if (cropProfile) {
    const idealMin = cropProfile.tempMin;
    const idealMax = cropProfile.tempMax;
    // Check overlap between [storage.temperatureMin, storage.temperatureMax] and [idealMin, idealMax]
    const overlapMin = Math.max(storage.temperatureMin, idealMin);
    const overlapMax = Math.min(storage.temperatureMax, idealMax);

    if (overlapMin <= overlapMax) {
      score += 25;
      explanations.push(`Suitable temperature range (${storage.temperatureMin}°C to ${storage.temperatureMax}°C)`);
    } else {
      const distanceToRange = Math.min(
        Math.abs(storage.temperatureMin - idealMax),
        Math.abs(idealMin - storage.temperatureMax)
      );
      if (distanceToRange <= 2) {
        score += 15;
        explanations.push(`Close temperature support (${storage.temperatureMin}°C to ${storage.temperatureMax}°C)`);
      } else {
        score += 5;
      }
    }
  } else {
    score += 20;
  }

  // 3. Available Capacity (15 pts)
  const qty = Number(quantity) || 500;
  if (storage.availableCapacity >= qty) {
    if (storage.availableCapacity >= qty * 3) {
      score += 15;
      explanations.push(`Ample capacity (${(storage.availableCapacity / 1000).toFixed(0)} MT free)`);
    } else {
      score += 10;
      explanations.push(`Available space for ${qty} kg`);
    }
  } else {
    score += 0;
    explanations.push('Limited capacity remaining');
  }

  // 4. Distance Calculation & Score (15 pts)
  let farmerLat = userLat;
  let farmerLng = userLng;

  if ((!farmerLat || !farmerLng) && userCity) {
    const normalizedCity = userCity.toLowerCase().trim();
    if (CITY_COORDS[normalizedCity]) {
      farmerLat = CITY_COORDS[normalizedCity].lat;
      farmerLng = CITY_COORDS[normalizedCity].lng;
    }
  }

  // Default to Ahmedabad center if no coords
  if (!farmerLat || !farmerLng) {
    farmerLat = 23.0225;
    farmerLng = 72.5714;
  }

  const distance = calculateDistance(farmerLat, farmerLng, storage.latitude, storage.longitude);

  if (distance <= 12) {
    score += 15;
    explanations.push(`Only ${distance} km from your location`);
  } else if (distance <= 25) {
    score += 12;
    explanations.push(`${distance} km away`);
  } else if (distance <= 45) {
    score += 8;
  } else {
    score += 4;
  }

  // 5. Reliability & Verification (15 pts)
  if (storage.verified) {
    score += 7;
  }
  if (storage.rating >= 4.8) {
    score += 8;
    explanations.push(`Top-rated facility (⭐ ${storage.rating})`);
  } else if (storage.rating >= 4.5) {
    score += 6;
  } else {
    score += 4;
  }

  // Ensure score is between 45% and 98%
  const matchScore = Math.min(Math.max(Math.round(score), 48), 98);

  // Total Cost Calculation
  const months = Math.max(Number(durationDays) || 30, 1) / 30;
  const storageCost = Math.round(storage.pricePerKg * qty * months);
  const handlingCost = storage.handlingCharge || 350;
  const transportRate = storage.transportRatePerKm || 25;
  const transportCost = Math.round(distance * transportRate);
  const totalCost = storageCost + handlingCost + transportCost;

  return {
    matchScore,
    isRecommended: matchScore >= 88,
    isBestMatch: matchScore >= 92,
    matchExplanation: explanations.slice(0, 3).join(' • '),
    distance,
    costBreakdown: {
      quantity: qty,
      durationDays: Number(durationDays) || 30,
      storageRatePerKg: storage.pricePerKg,
      storageCost,
      handlingCost,
      transportRatePerKm: transportRate,
      transportCost,
      totalCost,
    },
  };
};

// @desc    Get all storages with smart filtering, recommendation scores, and distance
// @route   GET /api/storages
// @access  Public
const getStorages = async (req, res) => {
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
      temperature,
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

    let storages = await Storage.find(query).populate('ownerId', 'name phone email');

    // Filter by crop if provided and filter query demands strict crop
    if (crop && crop !== 'All') {
      // We will still keep facilities but rank them lower, or optionally filter
      // For friendly search, highlight matching ones first
    }

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
      const recommendation = calculateSmartRecommendation(storageObj, farmerReqs);
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
    console.error('getStorages error:', error);
    res.status(500).json({ message: error.message || 'Server error fetching storages' });
  }
};

// @desc    Get single storage by ID
// @route   GET /api/storages/:id
// @access  Public
const getStorageById = async (req, res) => {
  try {
    const storage = await Storage.findById(req.params.id).populate('ownerId', 'name phone email');
    if (!storage) {
      return res.status(404).json({ message: 'Storage facility not found' });
    }

    const { crop, quantity = 500, city = 'Ahmedabad', duration = 30 } = req.query;
    const recommendation = calculateSmartRecommendation(storage.toObject(), {
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
      cropProfile: crop ? CROP_PROFILES[crop] : null,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error fetching storage details' });
  }
};

// @desc    Create a new storage facility (by Storage Owner)
// @route   POST /api/storages
// @access  Private (Owner / Admin)
const createStorage = async (req, res) => {
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
      acceptedCrops: Array.isArray(acceptedCrops) ? acceptedCrops : acceptedCrops.split(',').map((s) => s.trim()),
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
      verified: false, // requires admin verification
      status: 'pending',
    });

    res.status(201).json({ success: true, storage });
  } catch (error) {
    console.error('createStorage error:', error);
    res.status(500).json({ message: error.message || 'Server error creating storage facility' });
  }
};

// @desc    Update storage facility
// @route   PUT /api/storages/:id
// @access  Private (Owner / Admin)
const updateStorage = async (req, res) => {
  try {
    let storage = await Storage.findById(req.params.id);
    if (!storage) {
      return res.status(404).json({ message: 'Storage not found' });
    }

    // Check ownership unless admin
    if (storage.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this facility' });
    }

    storage = await Storage.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, storage });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error updating storage' });
  }
};

// @desc    Delete storage facility
// @route   DELETE /api/storages/:id
// @access  Private (Owner / Admin)
const deleteStorage = async (req, res) => {
  try {
    const storage = await Storage.findById(req.params.id);
    if (!storage) {
      return res.status(404).json({ message: 'Storage not found' });
    }

    if (storage.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this facility' });
    }

    await storage.deleteOne();
    res.json({ success: true, message: 'Storage facility removed' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error deleting storage' });
  }
};

// @desc    Get owner's facilities
// @route   GET /api/storages/my/facilities
// @access  Private (Owner)
const getMyFacilities = async (req, res) => {
  try {
    const storages = await Storage.find({ ownerId: req.user._id });
    res.json({ success: true, storages });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching your facilities' });
  }
};

module.exports = {
  getStorages,
  getStorageById,
  createStorage,
  updateStorage,
  deleteStorage,
  getMyFacilities,
  CROP_PROFILES,
};
