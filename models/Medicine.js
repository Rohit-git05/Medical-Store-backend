const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true
  },
  genericName: {
    type: String,
    required: [true, 'Generic name is required'],
    trim: true
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: [true, 'Brand reference is required']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category reference is required']
  },
  batchNumber: {
    type: String,
    required: [true, 'Batch number is required']
  },
  barcode: {
    type: String,
    default: ''
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Supplier reference is required']
  },
  purchasePrice: {
    type: Number,
    required: [true, 'Purchase price is required']
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price is required']
  },
  MRP: {
    type: Number,
    required: [true, 'MRP is required']
  },
  discount: {
    type: Number,
    default: 0 // Percentage discount
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    default: 0
  },
  minStock: {
    type: Number,
    default: 10 // Threshold for low stock alert
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  manufacturingDate: {
    type: Date,
    required: [true, 'Manufacturing date is required']
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  prescriptionRequired: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  uses: {
    type: String,
    default: ''
  },
  sideEffects: [{
    type: String
  }],
  dosage: {
    type: String,
    default: ''
  },
  packSize: {
    type: String,
    required: [true, 'Pack size is required'],
    default: '10 tablets'
  },
  precautions: [{
    type: String
  }],
  manufacturer: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  averageRating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Medicine', MedicineSchema);
