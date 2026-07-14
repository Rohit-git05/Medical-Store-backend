const Coupon = require('../models/Coupon');

// @desc    Validate a coupon code
// @route   GET /api/coupons/validate
// @access  Private
exports.validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.query;

    if (!code) {
      return res.status(400).json({ success: false, message: 'Please provide a coupon code' });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      expiryDate: { $gte: new Date() }
    });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
    }

    if (Number(subtotal) < coupon.minPurchase) {
      return res.status(400).json({
        success: false,
        message: `Minimum purchase of Rs. ${coupon.minPurchase} required for this coupon`
      });
    }

    res.json({
      success: true,
      message: 'Coupon applied successfully!',
      code: coupon.code,
      discountType: coupon.discountType,
      discountAmount: coupon.discountAmount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all coupons (Admin Only)
// @route   GET /api/coupons
// @access  Private (Admin Only)
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a coupon (Admin Only)
// @route   POST /api/coupons
// @access  Private (Admin Only)
exports.createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountAmount, minPurchase, expiryDate } = req.body;

    const couponExists = await Coupon.findOne({ code: code.toUpperCase() });
    if (couponExists) {
      return res.status(400).json({ success: false, message: 'Coupon already exists with this code' });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      discountType,
      discountAmount,
      minPurchase,
      expiryDate
    });

    res.status(201).json({ success: true, coupon });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete coupon (Admin Only)
// @route   DELETE /api/coupons/:id
// @access  Private (Admin Only)
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    await coupon.deleteOne();
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
