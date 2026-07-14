const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItemQuantity,
  removeFromCart,
  clearCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.use(protect); // All cart routes require auth

router.get('/', getCart);
router.post('/add', addToCart);
router.put('/update', updateCartItemQuantity);
router.delete('/remove/:medicineId', removeFromCart);
router.delete('/clear', clearCart);

module.exports = router;
