const express = require('express');
const router = express.Router();
const {
  getStorages,
  getStorageById,
  createStorage,
  updateStorage,
  deleteStorage,
  getMyFacilities,
  getRecommendedStorages,
  compareStorages,
  getStorageAnalytics,
} = require('../controllers/storageController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getStorages);
router.get('/my/facilities', protect, authorize('owner', 'admin'), getMyFacilities);
router.get('/:id', getStorageById);
router.post('/', protect, authorize('owner', 'admin'), createStorage);
router.put('/:id', protect, authorize('owner', 'admin'), updateStorage);
router.delete('/:id', protect, authorize('owner', 'admin'), deleteStorage);

// New expanded functionality routes
router.get('/recommended', getRecommendedStorages);
router.get('/compare/:id', compareStorages);
router.get('/analytics', protect, authorize('admin'), getStorageAnalytics);

module.exports = router;
