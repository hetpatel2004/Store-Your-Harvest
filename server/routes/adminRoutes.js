const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAdminFarmers,
  getAdminOwners,
  toggleUserBanStatus,
  getAdminTransactions,
  getAdminOccupancy,
  getAdminStorages,
  updateFacilityStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/farmers', getAdminFarmers);
router.get('/owners', getAdminOwners);
router.put('/users/:id/ban', toggleUserBanStatus);
router.get('/transactions', getAdminTransactions);
router.get('/occupancy', getAdminOccupancy);
router.get('/storages', getAdminStorages);
router.put('/storages/:id/status', updateFacilityStatus);

module.exports = router;
