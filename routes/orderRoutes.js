const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, checkRole } = require('../middleware/auth');

router.use(protect); // All order routes require auth

router.get('/all', checkRole('admin', 'pharmacist'), getAllOrders);
router.route('/')
  .get(getMyOrders)
  .post(createOrder);

router.route('/:id')
  .get(getOrderById);

router.put('/:id/status', checkRole('admin', 'pharmacist'), updateOrderStatus);

module.exports = router;
