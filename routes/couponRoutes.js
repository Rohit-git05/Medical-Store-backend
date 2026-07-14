const express = require('express');
const router = express.Router();
const {
  validateCoupon,
  getCoupons,
  createCoupon,
  deleteCoupon
} = require('../controllers/couponController');
const { protect, checkRole } = require('../middleware/auth');

router.get('/validate', protect, validateCoupon);

router.route('/')
  .get(protect, checkRole('admin'), getCoupons)
  .post(protect, checkRole('admin'), createCoupon);

router.delete('/:id', protect, checkRole('admin'), deleteCoupon);

module.exports = router;
