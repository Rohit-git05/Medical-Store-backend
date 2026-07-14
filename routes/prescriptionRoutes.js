const express = require('express');
const router = express.Router();
const {
  uploadPrescription,
  getMyPrescriptions,
  getAllPrescriptions,
  updatePrescriptionStatus
} = require('../controllers/prescriptionController');
const { protect, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect); // All prescription routes require auth

router.get('/all', checkRole('admin', 'pharmacist'), getAllPrescriptions);
router.post('/upload', upload.single('prescription'), uploadPrescription);
router.get('/', getMyPrescriptions);
router.put('/:id/status', checkRole('admin', 'pharmacist'), updatePrescriptionStatus);

module.exports = router;
