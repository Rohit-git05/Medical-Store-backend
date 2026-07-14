const Cart = require('../models/Cart');
const Medicine = require('../models/Medicine');

// Helper to get or create cart
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.medicine');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add medicine to cart
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { medicineId, quantity = 1 } = req.body;
    const medicine = await Medicine.findById(medicineId);

    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    if (medicine.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock available' });
    }

    const cart = await getOrCreateCart(req.user._id);

    // Check if medicine already exists in cart
    const itemIndex = cart.items.findIndex(item => item.medicine._id.toString() === medicineId);

    if (itemIndex > -1) {
      // Item exists, update quantity
      const newQty = cart.items[itemIndex].quantity + Number(quantity);
      if (medicine.stock < newQty) {
        return res.status(400).json({ success: false, message: 'Cannot add more. Insufficient stock' });
      }
      cart.items[itemIndex].quantity = newQty;
    } else {
      // Item does not exist, push to array
      cart.items.push({ medicine: medicineId, quantity: Number(quantity) });
    }

    cart.updatedAt = Date.now();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.medicine');
    res.json({ success: true, cart: populatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
exports.updateCartItemQuantity = async (req, res) => {
  try {
    const { medicineId, quantity } = req.body;
    if (quantity < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const medicine = await Medicine.findById(medicineId);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    if (medicine.stock < quantity) {
      return res.status(400).json({ success: false, message: `Only ${medicine.stock} items left in stock` });
    }

    const cart = await getOrCreateCart(req.user._id);
    const itemIndex = cart.items.findIndex(item => item.medicine._id.toString() === medicineId);

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    cart.items[itemIndex].quantity = Number(quantity);
    cart.updatedAt = Date.now();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.medicine');
    res.json({ success: true, cart: populatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:medicineId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = cart.items.filter(item => item.medicine._id.toString() !== req.params.medicineId);

    cart.updatedAt = Date.now();
    await cart.save();

    const populatedCart = await Cart.findById(cart._id).populate('items.medicine');
    res.json({ success: true, cart: populatedCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
exports.clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    cart.updatedAt = Date.now();
    await cart.save();

    res.json({ success: true, cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
