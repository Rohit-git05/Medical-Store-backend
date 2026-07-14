const Review = require('../models/Review');
const Medicine = require('../models/Medicine');

// @desc    Get reviews for a medicine
// @route   GET /api/reviews/medicine/:medicineId
// @access  Public
exports.getReviewsForMedicine = async (req, res) => {
  try {
    const reviews = await Review.find({ medicine: req.params.medicineId })
      .populate('user', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a review for a medicine
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const { medicineId, rating, reviewText } = req.body;

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    // Check if user already reviewed this medicine
    const alreadyReviewed = await Review.findOne({ user: req.user._id, medicine: medicineId });
    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this medicine' });
    }

    const review = await Review.create({
      user: req.user._id,
      medicine: medicineId,
      rating: Number(rating),
      reviewText
    });

    res.status(201).json({ success: true, review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle like on a review
// @route   PATCH /api/reviews/:id/like
// @access  Private
exports.toggleLikeReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const userId = req.user._id.toString();
    const likeIndex = review.likes.indexOf(userId);

    if (likeIndex > -1) {
      // Unlike
      review.likes.splice(likeIndex, 1);
    } else {
      // Like
      review.likes.push(userId);
    }

    await review.save();
    res.json({ success: true, likes: review.likes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
