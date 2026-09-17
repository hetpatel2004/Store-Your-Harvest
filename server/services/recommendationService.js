const { calculateHaversineDistance, getCityCoordinates } = require('../utils/geoUtils');
const { calculateTotalCost, compareStorageCosts, calculateSavings } = require('./costCalculatorService');

// Optimal physiological storage thresholds for major Indian crops
const CROP_STORAGE_PROFILES = {
  Potato: { tempMin: 3, tempMax: 6, humidity: '90-95%', shelfLife: '6-10 months', defaultRate: 1.8 },
  Tomato: { tempMin: 8, tempMax: 13, humidity: '85-90%', shelfLife: '2-4 weeks', defaultRate: 2.5 },
  Onion: { tempMin: 0, tempMax: 2, humidity: '65-70%', shelfLife: '5-8 months', defaultRate: 2.0 },
  Mango: { tempMin: 10, tempMax: 13, humidity: '85-90%', shelfLife: '3-6 weeks', defaultRate: 3.5 },
  Apple: { tempMin: -1, tempMax: 2, humidity: '90-95%', shelfLife: '6-9 months', defaultRate: 3.0 },
  Banana: { tempMin: 13, tempMax: 15, humidity: '90-95%', shelfLife: '2-4 weeks', defaultRate: 2.2 },
  Grapes: { tempMin: -1, tempMax: 0, humidity: '90-95%', shelfLife: '2-4 months', defaultRate: 3.2 },
  Chilli: { tempMin: 7, tempMax: 10, humidity: '90-95%', shelfLife: '3-5 weeks', defaultRate: 2.8 },
  Carrot: { tempMin: 0, tempMax: 2, humidity: '95-98%', shelfLife: '4-6 months', defaultRate: 2.2 },
  Maize: { tempMin: 10, tempMax: 15, humidity: '70-80%', shelfLife: '3-5 months', defaultRate: 1.5 },
  Wheat: { tempMin: 13, tempMax: 18, humidity: '60-70%', shelfLife: '6-8 months', defaultRate: 1.2 },
  Soybean: { tempMin: 15, tempMax: 20, humidity: '55-65%', shelfLife: '5-7 months', defaultRate: 1.3 },
  Pulses: { tempMin: 10, tempMax: 15, humidity: '60-70%', shelfLife: '4-6 months', defaultRate: 1.4 },
  // Additional common vegetables
  Brinjal: { tempMin: 8, tempMax: 12, humidity: '85-90%', shelfLife: '2-3 weeks', defaultRate: 2.6 },
  Cauliflower: { tempMin: 0, tempMax: 4, humidity: '85-95%', shelfLife: '2-3 weeks', defaultRate: 3.0 },
  Cabbage: { tempMin: 0, tempMax: 5, humidity: '80-90%', shelfLife: '3-4 months', defaultRate: 2.4 },
  Okra: { tempMin: 8, tempMax: 12, humidity: '85-95%', shelfLife: '1-2 weeks', defaultRate: 3.5 },
  Pumpkin: { tempMin: 7, tempMax: 10, humidity: '80-85%', shelfLife: '2-3 months', defaultRate: 1.8 },
  // Additional fruits
  Papaya: { tempMin: 7, tempMax: 10, humidity: '85-90%', shelfLife: '2-3 weeks', defaultRate: 2.5 },
  Watermelon: { tempMin: 7, tempMax: 10, humidity: '80-85%', shelfLife: '1-2 weeks', defaultRate: 1.5 },
  Muskmelon: { tempMin: 7, tempMax: 10, humidity: '80-90%', shelfLife: '1-2 weeks', defaultRate: 2.0 },
  Pomegranate: { tempMin: 5, tempMax: 10, humidity: '85-90%', shelfLife: '2-3 months', defaultRate: 3.5 },
  Guava: { tempMin: 5, tempMax: 8, humidity: '85-95%', shelfLife: '1-2 weeks', defaultRate: 3.0 },
  Orange: { tempMin: 4, tempMax: 8, humidity: '85-90%', shelfLife: '2-3 months', defaultRate: 3.0 },
  Lemon: { tempMin: 4, tempMax: 10, humidity: '85-90%', shelfLife: '1-3 weeks', defaultRate: 2.8 },
  // Additional vegetables
  BottleGourd: { tempMin: 10, tempMax: 15, humidity: '80-85%', shelfLife: '1-2 weeks', defaultRate: 1.8 },
  RidgeGourd: { tempMin: 10, tempMax: 15, humidity: '75-85%', shelfLife: '1-2 weeks', defaultRate: 1.6 },
  BitterGourd: { tempMin: 10, tempMax: 15, humidity: '80-85%', shelfLife: '1 week', defaultRate: 2.5 },
  SnakeGourd: { tempMin: 10, tempMax: 15, humidity: '75-85%', shelfLife: '1 week', defaultRate: 1.8 },
  GreenBeans: { tempMin: 8, tempMax: 12, humidity: '85-95%', shelfLife: '1 week', defaultRate: 3.0 },
  ClusterBeans: { tempMin: 8, tempMax: 12, humidity: '80-90%', shelfLife: '1 week', defaultRate: 2.8 },
  Peas: { tempMin: 0, tempMax: 5, humidity: '80-90%', shelfLife: '2-3 months', defaultRate: 2.2 },
  Spinach: { tempMin: 0, tempMax: 5, humidity: '90-98%', shelfLife: '1-2 weeks', defaultRate: 3.5 },
  Fenugreek: { tempMin: 10, tempMax: 15, humidity: '65-75%', shelfLife: '1 week', defaultRate: 3.0 },
  Mint: { tempMin: 5, tempMax: 10, humidity: '85-95%', shelfLife: '1 week', defaultRate: 4.0 },
  CurryLeaves: { tempMin: 10, tempMax: 15, humidity: '65-75%', shelfLife: '1 week', defaultRate: 5.0 },
  Drumsticks: { tempMin: 8, tempMax: 12, humidity: '80-85%', shelfLife: '1-2 weeks', defaultRate: 3.2 },
  // Additional grains & crops
  Rice: { tempMin: 13, tempMax: 18, humidity: '60-70%', shelfLife: '6-12 months', defaultRate: 1.0 },
  Barley: { tempMin: 10, tempMax: 15, humidity: '60-70%', shelfLife: '6-8 months', defaultRate: 0.9 },
  Jowar: { tempMin: 15, tempMax: 20, humidity: '55-65%', shelfLife: '5-7 months', defaultRate: 1.1 },
  Bajra: { tempMin: 20, tempMax: 25, humidity: '50-60%', shelfLife: '4-6 months', defaultRate: 0.8 },
  Ragi: { tempMin: 15, tempMax: 20, humidity: '60-65%', shelfLife: '6-8 months', defaultRate: 1.2 },
};

/**
 * Computes multi-factor Smart Match Score (0-100%) and natural-language explanation badges
 * @param {Object} storage Storage facility document or object
 * @param {Object} requirements Farmer search requirements
 */
const computeRecommendationScore = (storage, requirements = {}) => {
  const {
    crop = '',
    quantity = 500,
    userLat,
    userLng,
    userCity = 'Ahmedabad',
    durationDays = 30,
    season = 'normal',
  } = requirements;

  let score = 0;
  const explanations = [];

  // 1. Crop Compatibility (Max 30 points)
  if (crop && storage.acceptedCrops && storage.acceptedCrops.length > 0) {
    const isAccepted = storage.acceptedCrops.some(
      (c) => c.toLowerCase() === crop.toLowerCase()
    );
    if (isAccepted) {
      score += 30;
      explanations.push(`Explicitly accepts ${crop}`);
    } else {
      score += 5; // fallback
    }
  } else {
    score += 25; // neutral if no specific crop selected
  }

  // 2. Temperature Compatibility (Max 25 points)
  const profile = crop ? CROP_STORAGE_PROFILES[crop] : null;
  if (profile) {
    const idealMin = profile.tempMin;
    const idealMax = profile.tempMax;
    // Check range overlap
    const overlapMin = Math.max(storage.temperatureMin, idealMin);
    const overlapMax = Math.min(storage.temperatureMax, idealMax);

    if (overlapMin <= overlapMax) {
      score += 25;
      explanations.push(`Optimal temp (${storage.temperatureMin}°C to ${storage.temperatureMax}°C)`);
    } else {
      const dist = Math.min(
        Math.abs(storage.temperatureMin - idealMax),
        Math.abs(idealMin - storage.temperatureMax)
      );
      if (dist <= 2) {
        score += 15;
        explanations.push(`Close temp match (${storage.temperatureMin}°C to ${storage.temperatureMax}°C)`);
      } else {
        score += 5;
      }
    }
  } else {
    score += 20;
  }

  // 3. Available Capacity Headroom (Max 15 points)
  const qty = Number(quantity) || 500;
  if (storage.availableCapacity >= qty) {
    if (storage.availableCapacity >= qty * 3) {
      score += 15;
      explanations.push(`Ample capacity (${Math.round(storage.availableCapacity / 1000)} MT free)`);
    } else {
      score += 10;
      explanations.push(`Available space for ${qty} kg`);
    }
  } else {
    score += 0;
    explanations.push('Limited capacity remaining');
  }

  // 4. Haversine Distance (Max 15 points)
  let originLat = userLat;
  let originLng = userLng;

  if (!originLat || !originLng) {
    const coords = getCityCoordinates(userCity);
    originLat = coords.lat;
    originLng = coords.lng;
  }

  const distance = calculateHaversineDistance(
    originLat,
    originLng,
    storage.latitude,
    storage.longitude
  );

  if (distance <= 12) {
    score += 15;
    explanations.push(`Only ${distance} km from farm`);
  } else if (distance <= 25) {
    score += 12;
    explanations.push(`${distance} km away`);
  } else if (distance <= 45) {
    score += 8;
  } else {
    score += 4;
  }

  // 5. Reliability & Certification (Max 15 points)
  if (storage.verified) {
    score += 7;
  }
  if (storage.rating >= 4.8) {
    score += 8;
    explanations.push(`Top-rated (⭐ ${storage.rating})`);
  } else if (storage.rating >= 4.5) {
    score += 6;
  } else {
    score += 4;
  }

  // 6. Seasonal Pricing Compatibility (Max 10 points) - NEW
  const cropProfile = CROP_STORAGE_PROFILES[crop] || {};
  const baseRate = cropProfile.defaultRate || 2.0;
  const pricePerKg = Number(storage.pricePerKg) || baseRate;
  const seasonalAdjustment = season === 'peak' ? 1.2 : season === 'off' ? 0.9 : 1.0;
  const adjustedRate = pricePerKg * seasonalAdjustment;
  if (adjustedRate <= baseRate * 1.1) {
    score += 10;
    explanations.push(`Seasonal pricing is favorable`);
  } else if (adjustedRate <= baseRate * 1.3) {
    score += 6;
  }

  // 7. Storage Features Bonus (Max 5 points) - NEW
  if (storage.powerBackup) {
    score += 3;
    explanations.push('Power backup available');
  }
  if (storage.cctvMonitoring) {
    score += 2;
    explanations.push('CCTV monitored for security');
  }

  // Bound match score between 48% and 98%
  const matchScore = Math.min(Math.max(Math.round(score), 48), 98);

  // Compute transparent total cost
  const costBreakdown = calculateTotalCost({
    pricePerKg: storage.pricePerKg,
    quantity: qty,
    durationDays,
    handlingCharge: storage.handlingCharge,
    transportRatePerKm: storage.transportRatePerKm,
    distanceKm: distance,
    seasonFactor: season === 'peak' ? 1.2 : season === 'off' ? 0.9 : 1.0,
    storageTypeFactor: 1.0,
  });

  // Calculate savings compared to default market rate
  const savings = calculateSavings(
    costBreakdown.storageRatePerKg,
    costBreakdown.storageRatePerKg,
    qty,
    durationDays
  );

  return {
    matchScore,
    isRecommended: matchScore >= 88,
    isBestMatch: matchScore >= 92,
    matchExplanation: explanations.slice(0, 3).join(' • '),
    distance,
    costBreakdown,
    savings,
    seasonalAdjustment: season === 'peak' ? 'Peak season rates apply' : 'Normal rates',
    features: {
      powerBackup: storage.powerBackup,
      cctvMonitoring: storage.cctvMonitoring,
    },
  };
};

/**
 * Gets recommendations for multiple storages filtered by criteria
 * @param {Array} storages Storage facility documents
 * @param {Object} requirements Search requirements
 */
const getMultipleRecommendations = (storages, requirements) => {
  return storages
    .map((storage) => ({
      ...storage,
      score: computeRecommendationScore(storage, requirements),
    }))
    .sort((a, b) => b.score.matchScore - a.score.matchScore)
    .filter((item) => item.score.matchScore >= 50) // Minimum threshold
    .slice(0, 10); // Top 10 results
};

module.exports = {
  CROP_STORAGE_PROFILES,
  computeRecommendationScore,
  getMultipleRecommendations,
};
