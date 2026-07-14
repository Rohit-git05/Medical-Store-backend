const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileUrl: {
    type: String,
    required: [true, 'Prescription image or PDF file URL is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  pharmacist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  pharmacistFeedback: {
    type: String,
    default: ''
  },
  recommendedMedicines: [
    {
      medicine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medicine'
      },
      quantity: {
        type: Number,
        default: 1
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Prescription', PrescriptionSchema);
