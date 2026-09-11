const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { protect, optionalAuth, authorize } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, createBooking);
router.get('/', protect, getBookings);
router.put('/:id/status', protect, authorize('owner', 'admin'), updateBookingStatus);

module.exports = router;
