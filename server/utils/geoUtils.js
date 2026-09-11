// Geographic coordinates for Gujarat farming and storage corridors
const GUJARAT_CITY_COORDINATES = {
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

/**
 * Calculates geodesic distance between two coordinate pairs using Haversine formula
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in kilometers rounded to 1 decimal place
 */
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's mean radius in km
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

/**
 * Resolves coordinates for a given city string with fallback to Ahmedabad center
 * @param {string} cityName
 * @returns {{lat: number, lng: number}}
 */
const getCityCoordinates = (cityName) => {
  if (!cityName) return GUJARAT_CITY_COORDINATES.ahmedabad;
  const normalized = cityName.toLowerCase().trim();
  return GUJARAT_CITY_COORDINATES[normalized] || GUJARAT_CITY_COORDINATES.ahmedabad;
};

module.exports = {
  GUJARAT_CITY_COORDINATES,
  calculateHaversineDistance,
  getCityCoordinates,
};
