const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  reviewText: {
    type: String,
    required: [true, 'Review text is required']
  },
  images: [{
    type: String
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update medicine average rating and review counts after review is saved
ReviewSchema.statics.calculateAverageRating = async function (medicineId) {
  const stats = await this.aggregate([
    { $match: { medicine: medicineId } },
    {
      $group: {
        _id: '$medicine',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    if (stats.length > 0) {
      await mongoose.model('Medicine').findByIdAndUpdate(medicineId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        numReviews: stats[0].numReviews
      });
    } else {
      await mongoose.model('Medicine').findByIdAndUpdate(medicineId, {
        averageRating: 0,
        numReviews: 0
      });
    }
  } catch (err) {
    console.error(err);
  }
};

ReviewSchema.post('save', function () {
  this.constructor.calculateAverageRating(this.medicine);
});

ReviewSchema.post('remove', function () {
  this.constructor.calculateAverageRating(this.medicine);
});

module.exports = mongoose.model('Review', ReviewSchema);
