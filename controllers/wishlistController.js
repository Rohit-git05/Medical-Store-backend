const Wishlist = require('../models/Wishlist');

// Helper to get or create wishlist
const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId }).populate('medicines');
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: userId, medicines: [] });
  }
  return wishlist;
};

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await getOrCreateWishlist(req.user._id);
    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle item in wishlist (Add/Remove)
// @route   POST /api/wishlist/toggle
// @access  Private
exports.toggleWishlist = async (req, res) => {
  try {
    const { medicineId } = req.body;
    if (!medicineId) {
      return res.status(400).json({ success: false, message: 'Medicine ID is required' });
    }

    const wishlist = await getOrCreateWishlist(req.user._id);

    const isExist = wishlist.medicines.some(med => med._id.toString() === medicineId);

    if (isExist) {
      // Remove
      wishlist.medicines = wishlist.medicines.filter(med => med._id.toString() !== medicineId);
    } else {
      // Add
      wishlist.medicines.push(medicineId);
    }

    wishlist.updatedAt = Date.now();
    await wishlist.save();

    const populatedWishlist = await Wishlist.findById(wishlist._id).populate('medicines');
    res.json({ success: true, wishlist: populatedWishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
