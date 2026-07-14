const Prescription = require('../models/Prescription');
const { uploadToCloudinary } = require('../services/cloudinary');

// @desc    Upload prescription
// @route   POST /api/prescriptions/upload
// @access  Private
exports.uploadPrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a file' });
    }

    const fileUrl = await uploadToCloudinary(req.file.path, 'prescriptions');

    const prescription = await Prescription.create({
      user: req.user._id,
      fileUrl
    });

    res.status(201).json({ success: true, prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user's prescriptions
// @route   GET /api/prescriptions
// @access  Private
exports.getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all prescriptions (Admin/Pharmacist)
// @route   GET /api/prescriptions/all
// @access  Private (Admin/Pharmacist)
exports.getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find()
      .populate('user', 'name email')
      .populate('recommendedMedicines.medicine')
      .sort({ createdAt: -1 });
    res.json({ success: true, prescriptions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update prescription status & recommendations (Admin/Pharmacist)
// @route   PUT /api/prescriptions/:id/status
// @access  Private (Admin/Pharmacist)
exports.updatePrescriptionStatus = async (req, res) => {
  try {
    const { status, pharmacistFeedback, recommendedMedicines } = req.body;
    let prescription = await Prescription.findById(req.params.id);

    if (!prescription) {
      return res.status(404).json({ success: false, message: 'Prescription not found' });
    }

    prescription.status = status || prescription.status;
    prescription.pharmacistFeedback = pharmacistFeedback || prescription.pharmacistFeedback;
    prescription.pharmacist = req.user._id;

    if (recommendedMedicines) {
      // Map [{ medicineId, quantity }] into prescription format
      prescription.recommendedMedicines = recommendedMedicines.map(rec => ({
        medicine: rec.medicine,
        quantity: rec.quantity || 1
      }));
    }

    await prescription.save();

    res.json({ success: true, message: 'Prescription updated successfully', prescription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
