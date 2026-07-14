const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateUserRoleStatus,
  getBrands,
  createBrand,
  deleteBrand,
  getCategories,
  createCategory,
  deleteCategory,
  getSuppliers,
  createSupplier,
  deleteSupplier
} = require('../controllers/adminController');
const { protect, checkRole } = require('../middleware/auth');

router.use(protect); // Require auth for all admin routes

// User management (Admin only)
router.get('/users', checkRole('admin'), getAllUsers);
router.put('/users/:id', checkRole('admin'), updateUserRoleStatus);

// Brands CRUD (Admin/Pharmacist can view, Admin can create/delete)
router.get('/brands', getBrands);
router.post('/brands', checkRole('admin'), createBrand);
router.delete('/brands/:id', checkRole('admin'), deleteBrand);

// Categories CRUD (Admin/Pharmacist can view, Admin can create/delete)
router.get('/categories', getCategories);
router.post('/categories', checkRole('admin'), createCategory);
router.delete('/categories/:id', checkRole('admin'), deleteCategory);

// Suppliers CRUD (Admin/Pharmacist can view, Admin can create/delete)
router.get('/suppliers', getSuppliers);
router.post('/suppliers', checkRole('admin'), createSupplier);
router.delete('/suppliers/:id', checkRole('admin'), deleteSupplier);

module.exports = router;
