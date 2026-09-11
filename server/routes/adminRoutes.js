const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAdminStorages,
  updateFacilityStatus,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminStats);
router.get('/storages', getAdminStorages);
router.put('/storages/:id/status', updateFacilityStatus);

module.exports = router;
