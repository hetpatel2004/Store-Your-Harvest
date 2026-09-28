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
  nadiad: { lat: 22.6916, lng: 72.8634 },
  deesa: { lat: 24.2585, lng: 72.1814 },
  palanpur: { lat: 24.1724, lng: 72.4346 },
  himatnagar: { lat: 23.5977, lng: 72.9698 },
  gondal: { lat: 21.9619, lng: 70.7923 },
  morbi: { lat: 22.8120, lng: 70.8236 },
  junagadh: { lat: 21.5222, lng: 70.4579 },
  bhavnagar: { lat: 21.7645, lng: 72.1519 },
  jamnagar: { lat: 22.4707, lng: 70.0577 },
  bharuch: { lat: 21.7051, lng: 72.9959 },
  amreli: { lat: 21.6032, lng: 71.2221 },
  surendranagar: { lat: 22.7275, lng: 71.6370 },
  patan: { lat: 23.8493, lng: 72.1266 },
  modasa: { lat: 23.4632, lng: 73.2984 },
  botad: { lat: 22.1704, lng: 71.6664 },
  dahod: { lat: 22.8340, lng: 74.2554 },
  godhra: { lat: 22.7766, lng: 73.6149 },
  navsari: { lat: 20.9467, lng: 72.9520 },
  valsad: { lat: 20.5992, lng: 72.9342 },
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

/**
 * Resolves realistic road distance in km between an entered location/address string and a storage facility
 */
const resolveDistanceKm = (locationText, storageLat, storageLng, storageCity = 'Ahmedabad') => {
  if (!locationText || typeof locationText !== 'string' || !locationText.trim()) {
    return 10; // default fallback
  }

  const textLower = locationText.toLowerCase();
  const cityKeys = Object.keys(GUJARAT_CITY_COORDINATES);
  const matchedKey = cityKeys.find((key) => textLower.includes(key));

  const sLat = Number(storageLat) || getCityCoordinates(storageCity).lat;
  const sLng = Number(storageLng) || getCityCoordinates(storageCity).lng;

  if (matchedKey) {
    const userCoords = GUJARAT_CITY_COORDINATES[matchedKey];
    const directKm = calculateHaversineDistance(userCoords.lat, userCoords.lng, sLat, sLng);
    const roadKm = Math.round(directKm * 1.25);
    return Math.max(5, roadKm);
  }

  if (textLower.includes('apmc') || textLower.includes('mandi') || textLower.includes('market')) {
    return 8;
  }

  return 12;
};

module.exports = {
  GUJARAT_CITY_COORDINATES,
  calculateHaversineDistance,
  getCityCoordinates,
  resolveDistanceKm,
};
