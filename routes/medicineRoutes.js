const express = require('express');
const router = express.Router();
const {
  getMedicines,
  getMedicineById,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getAutocompleteSuggestions,
  getTrendingSearches,
  getLowStockAlerts,
  getExpiryAlerts
} = require('../controllers/medicineController');
const { protect, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public Search Utilities
router.get('/search/suggestions', getAutocompleteSuggestions);
router.get('/search/trending', getTrendingSearches);

// Alerts (Admin/Pharmacist)
router.get('/alerts/low-stock', protect, checkRole('admin', 'pharmacist'), getLowStockAlerts);
router.get('/alerts/expiry', protect, checkRole('admin', 'pharmacist'), getExpiryAlerts);

// Standard CRUD operations
router.route('/')
  .get(getMedicines)
  .post(protect, checkRole('admin', 'pharmacist'), upload.array('images', 5), createMedicine);

router.route('/:id')
  .get(getMedicineById)
  .put(protect, checkRole('admin', 'pharmacist'), upload.array('images', 5), updateMedicine)
  .delete(protect, checkRole('admin', 'pharmacist'), deleteMedicine);

module.exports = router;
