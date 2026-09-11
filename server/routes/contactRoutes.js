const express = require('express');
const router = express.Router();
const {
  submitInquiry,
  getInquiries,
  updateInquiryStatus,
} = require('../controllers/contactController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', submitInquiry);
router.get('/', protect, authorize('admin'), getInquiries);
router.put('/:id/status', protect, authorize('admin'), updateInquiryStatus);

module.exports = router;
