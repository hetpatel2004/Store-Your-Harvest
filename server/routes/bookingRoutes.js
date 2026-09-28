const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  updateBookingStatus,
  updateBookingServices,
  payBookingBill,
} = require('../controllers/bookingController');
const { protect, optionalAuth, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/', protect, getBookings);
router.put('/:id/status', protect, authorize('owner', 'admin'), updateBookingStatus);
router.put('/:id/services', protect, updateBookingServices);
router.put('/:id/pay', protect, payBookingBill);
router.post('/:id/pay', protect, payBookingBill);

module.exports = router;
