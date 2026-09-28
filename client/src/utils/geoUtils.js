// Geographic coordinates for Gujarat farming and storage corridors
export const GUJARAT_CITY_COORDINATES = {
  ahmedabad: { lat: 23.0225, lng: 72.5714, name: 'Ahmedabad' },
  sanand: { lat: 22.9856, lng: 72.3802, name: 'Sanand' },
  bavla: { lat: 22.8361, lng: 72.3619, name: 'Bavla' },
  gandhinagar: { lat: 23.2156, lng: 72.6369, name: 'Gandhinagar' },
  kadi: { lat: 23.3039, lng: 72.3328, name: 'Kadi' },
  anand: { lat: 22.5645, lng: 72.9289, name: 'Anand' },
  dholka: { lat: 22.7239, lng: 72.4644, name: 'Dholka' },
  naroda: { lat: 23.0805, lng: 72.6589, name: 'Naroda' },
  mehsana: { lat: 23.5880, lng: 72.3693, name: 'Mehsana' },
  rajkot: { lat: 22.3039, lng: 70.8022, name: 'Rajkot' },
  vadodara: { lat: 22.3072, lng: 73.1812, name: 'Vadodara' },
  surat: { lat: 21.1702, lng: 72.8311, name: 'Surat' },
  nadiad: { lat: 22.6916, lng: 72.8634, name: 'Nadiad' },
  deesa: { lat: 24.2585, lng: 72.1814, name: 'Deesa' },
  palanpur: { lat: 24.1724, lng: 72.4346, name: 'Palanpur' },
  himatnagar: { lat: 23.5977, lng: 72.9698, name: 'Himatnagar' },
  gondal: { lat: 21.9619, lng: 70.7923, name: 'Gondal' },
  morbi: { lat: 22.8120, lng: 70.8236, name: 'Morbi' },
  junagadh: { lat: 21.5222, lng: 70.4579, name: 'Junagadh' },
  bhavnagar: { lat: 21.7645, lng: 72.1519, name: 'Bhavnagar' },
  jamnagar: { lat: 22.4707, lng: 70.0577, name: 'Jamnagar' },
  bharuch: { lat: 21.7051, lng: 72.9959, name: 'Bharuch' },
  amreli: { lat: 21.6032, lng: 71.2221, name: 'Amreli' },
  surendranagar: { lat: 22.7275, lng: 71.6370, name: 'Surendranagar' },
  patan: { lat: 23.8493, lng: 72.1266, name: 'Patan' },
  modasa: { lat: 23.4632, lng: 73.2984, name: 'Modasa' },
  botad: { lat: 22.1704, lng: 71.6664, name: 'Botad' },
  dahod: { lat: 22.8340, lng: 74.2554, name: 'Dahod' },
  godhra: { lat: 22.7766, lng: 73.6149, name: 'Godhra' },
  navsari: { lat: 20.9467, lng: 72.9520, name: 'Navsari' },
  valsad: { lat: 20.5992, lng: 72.9342, name: 'Valsad' },
};

export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth mean radius in km
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

export const getCityCoordinates = (cityName) => {
  if (!cityName) return GUJARAT_CITY_COORDINATES.ahmedabad;
  const normalized = cityName.toLowerCase().trim();
  return GUJARAT_CITY_COORDINATES[normalized] || GUJARAT_CITY_COORDINATES.ahmedabad;
};

/**
 * Resolves realistic road distance in km between user location text and storage coordinates
 */
export const resolveDistanceKm = (locationText, storageLat, storageLng, storageCity = 'Ahmedabad') => {
  if (!locationText || typeof locationText !== 'string' || !locationText.trim()) {
    return 10;
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
