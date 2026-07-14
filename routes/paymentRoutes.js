const express = require('express');
const router = express.Router();
const { createPaymentIntent } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/create-intent', createPaymentIntent);

module.exports = router;
