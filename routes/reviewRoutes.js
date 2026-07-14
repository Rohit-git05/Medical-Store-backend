const express = require('express');
const router = express.Router();
const {
  getReviewsForMedicine,
  createReview,
  toggleLikeReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/medicine/:medicineId', getReviewsForMedicine);
router.post('/', protect, createReview);
router.patch('/:id/like', protect, toggleLikeReview);

module.exports = router;
