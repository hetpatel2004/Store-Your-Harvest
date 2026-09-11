const express = require('express');
const router = express.Router();
const {
  getStorageReviews,
  addReview,
} = require('../controllers/reviewController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.get('/storage/:storageId', getStorageReviews);
router.post('/storage/:storageId', optionalAuth, addReview);

module.exports = router;
