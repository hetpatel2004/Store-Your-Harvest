const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  storageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Storage',
    required: true,
  },
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  farmerName: {
    type: String,
    required: [true, 'Farmer name is required'],
    trim: true,
  },
  farmerCity: {
    type: String,
    default: 'Sanand, Gujarat',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please provide a rating between 1 and 5'],
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
  },
  cropStored: {
    type: String,
    default: 'Tomato',
  },
  verifiedDeposit: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Static method to recompute average rating & review count for a storage facility
reviewSchema.statics.getAverageRating = async function (storageId) {
  const stats = await this.aggregate([
    { $match: { storageId: new mongoose.Types.ObjectId(storageId) } },
    {
      $group: {
        _id: '$storageId',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await mongoose.model('Storage').findByIdAndUpdate(storageId, {
        rating: Math.round(stats[0].averageRating * 10) / 10,
        reviewsCount: stats[0].reviewCount,
      });
    }
  } catch (err) {
    console.error('Error updating storage rating:', err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', async function () {
  await this.constructor.getAverageRating(this.storageId);
});

// Call getAverageRating after delete
reviewSchema.post('deleteOne', { document: true, query: false }, async function () {
  await this.constructor.getAverageRating(this.storageId);
});

module.exports = mongoose.model('Review', reviewSchema);
