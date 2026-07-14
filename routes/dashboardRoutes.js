const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, checkRole } = require('../middleware/auth');

router.get('/stats', protect, checkRole('admin', 'pharmacist'), getDashboardStats);

module.exports = router;
