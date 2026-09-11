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
}) => {
  const qty = Number(quantity) || 500;
  const days = Number(durationDays) || 30;
  const months = Math.max(days, 1) / 30;

  // Base cold chamber storage fee
  const storageCost = Math.round(Number(pricePerKg) * qty * months);

  // Mandatory labor/unloading and weighing charges
  const handlingCost = Math.round(Number(handlingCharge) || 350);

  // Freight and diesel transit cost based on road distance
  const distance = Math.max(Number(distanceKm) || 0, 1);
  const transportCost = Math.round(distance * (Number(transportRatePerKm) || 25));

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
  };
};

module.exports = { calculateTotalCost };
