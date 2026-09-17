/**
 * Pure service for calculating transparent total outlay costs
 * Directly solves the problem of hidden transport, handling and waiting fees
 */
const calculateTotalCost = ({
  pricePerKg = 2.2,
  quantity = 500,
  durationDays = 30,
  handlingCharge = 350,
  transportRatePerKm = 25,
  distanceKm = 10,
  seasonFactor = 1.0,
  storageTypeFactor = 1.0,
}) => {
  const qty = Number(quantity) || 500;
  const days = Number(durationDays) || 30;
  const months = Math.max(days, 1) / 30;

  // Base cold chamber storage fee adjusted by storage type and season
  const storageCost = Math.round(Number(pricePerKg) * qty * months * storageTypeFactor * seasonFactor);

  // Mandatory labor/unloading and weighing charges
  const handlingCost = Math.round(Number(handlingCharge) || 350);

  // Freight and diesel transit cost based on road distance
  const distance = Math.max(Number(distanceKm) || 0, 1);
  const transportCost = Math.round(distance * (Number(transportRatePerKm) || 25));

  // Seasonal adjustment factor (1.0 = normal, >1 = peak season, <1 = off-season)
  // const seasonFactor = seasonFactor || 1.0;

  // Transparent total
  const totalCost = storageCost + handlingCost + transportCost;

  return {
    quantity: qty,
    durationDays: days,
    durationMonths: Math.round(months * 10) / 10,
    storageRatePerKg: Number(pricePerKg),
    storageCost,
    handlingCost,
    transportRatePerKm: Number(transportRatePerKm) || 25,
    distanceKm: distance,
    transportCost,
    totalCost,
    costBreakdown: {
      storage: { label: 'Storage (per kg/month)', value: Number(pricePerKg), unit: '₹/kg/month' },
      handling: { label: 'Handling/Unloading', value: handlingCharge, unit: '₹ flat' },
      transport: { label: 'Transport Freight', value: distance * (transportRatePerKm || 25), unit: '₹' },
    },
    seasonFactor,
    storageTypeFactor,
  };
};

/**
 * Calculate cost comparison between multiple storage options
 */
const compareStorageCosts = (options) => {
  return options.map((option) => ({
    ...option,
    costBreakdown: calculateTotalCost(option),
  }));
};

/**
 * Calculate savings compared to current market rate
 */
const calculateSavings = (currentRate, newRate, quantity, months) => {
  const currentTotal = Math.round(currentRate * Number(quantity) * months);
  const newTotal = Math.round(newRate * Number(quantity) * months);
  const savings = currentTotal - newTotal;
  const savingsPercentage = Math.round((savings / currentTotal) * 100);

  return {
    currentTotal,
    newTotal,
    savings,
    savingsPercentage,
  };
};

module.exports = {
  calculateTotalCost,
  compareStorageCosts,
  calculateSavings,
};
