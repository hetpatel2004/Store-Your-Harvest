const { calculateHaversineDistance, getCityCoordinates } = require('../utils/geoUtils');
const { calculateTotalCost } = require('./costCalculatorService');

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
  });

  return {
    matchScore,
    isRecommended: matchScore >= 88,
    isBestMatch: matchScore >= 92,
    matchExplanation: explanations.slice(0, 3).join(' • '),
    distance,
    costBreakdown,
  };
};

module.exports = {
  CROP_STORAGE_PROFILES,
  computeRecommendationScore,
};
