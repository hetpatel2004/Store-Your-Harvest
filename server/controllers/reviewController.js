const Review = require('../models/Review');
const Storage = require('../models/Storage');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all reviews for a cold storage facility
// @route   GET /api/reviews/storage/:storageId
// @access  Public
const getStorageReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ storageId: req.params.storageId }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review for a cold storage facility
// @route   POST /api/reviews/storage/:storageId
// @access  Public (Optional auth for registered farmers)
const addReview = async (req, res, next) => {
  try {
    const { rating, comment, farmerName, farmerCity, cropStored } = req.body;
    const storageId = req.params.storageId;

    const storage = await Storage.findById(storageId);
    if (!storage) {
      return next(new ErrorResponse('Storage facility not found', 404));
    }

    const review = await Review.create({
      storageId,
      farmerId: req.user ? req.user._id : null,
      farmerName: farmerName || (req.user ? req.user.name : 'Verified Farmer'),
      farmerCity: farmerCity || (req.user ? req.user.city : 'Gujarat'),
      rating: Number(rating),
      comment,
      cropStored: cropStored || 'Produce',
    });

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStorageReviews,
  addReview,
};
