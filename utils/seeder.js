require('dotenv').config({ path: '../.env' });
process.env.USE_MOCK_DB = 'true';
const connectDB = require('../config/db');

const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const Supplier = require('../models/Supplier');
const Medicine = require('../models/Medicine');

const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();
    await Supplier.deleteMany();
    await Medicine.deleteMany();

    console.log('Data cleared...');

    // 1. Create Default Users
    const users = await User.create([
      {
        name: 'Default Admin',
        email: 'admin@healstore.com',
        password: 'admin123',
        role: 'admin',
        phone: '9999999999'
      },
      {
        name: 'Default Pharmacist',
        email: 'pharmacist@healstore.com',
        password: 'pharmacist123',
        role: 'pharmacist',
        phone: '8888888888'
      },
      {
        name: 'Default Customer',
        email: 'customer@healstore.com',
        password: 'customer123',
        role: 'customer',
        phone: '7777777777'
      }
    ]);
    console.log('Users created...');

    // 2. Create Categories
    const categories = await Category.create([
      { name: 'Tablets', description: 'Oral compressed tablets' },
      { name: 'Capsules', description: 'Gelatin shell capsules' },
      { name: 'Syrups', description: 'Oral liquid solutions' },
      { name: 'Injections', description: 'Intravenous solutions' },
      { name: 'Vitamins', description: 'Nutritional health supplements' },
      { name: 'Diabetes Care', description: 'Insulin and diabetes aids' }
    ]);
    console.log('Categories created...');

    // 3. Create Brands
    const brands = await Brand.create([
      { name: 'Cipla', description: 'Cipla pharmaceuticals' },
      { name: 'Sun Pharma', description: 'Sun pharmaceutical industries' },
      { name: 'GSK', description: 'GlaxoSmithKline' },
      { name: 'Abbott', description: 'Abbott laboratories' }
    ]);
    console.log('Brands created...');

    // 4. Create Suppliers
    const suppliers = await Supplier.create([
      {
        name: 'MedDistributors India',
        contactEmail: 'orders@meddist.com',
        contactPhone: '+91 9988776655',
        address: '12 Industrial Area, Mumbai, India'
      }
    ]);
    console.log('Suppliers created...');

    // 5. Create Medicines
    await Medicine.create([
      {
        name: 'Paracetamol 650mg',
        genericName: 'Paracetamol',
        brand: brands[0]._id, // Cipla
        category: categories[0]._id, // Tablets
        batchNumber: 'B123-PA',
        supplier: suppliers[0]._id,
        purchasePrice: 10,
        sellingPrice: 18,
        MRP: 20,
        discount: 10,
        stock: 120,
        minStock: 20,
        expiryDate: new Date('2027-12-31'),
        manufacturingDate: new Date('2025-01-01'),
        description: 'Effective relief from fever and mild to moderate bodily pain.',
        uses: 'Fever, headache, joint pain, toothache.',
        sideEffects: 'Liver injury if overdosed, skin reactions in rare cases.',
        dosage: '1 tablet every 4-6 hours as required. Max 4g daily.',
        manufacturer: 'Cipla Ltd.',
        prescriptionRequired: false
      },
      {
        name: 'Amoxicillin 500mg',
        genericName: 'Amoxicillin',
        brand: brands[1]._id, // Sun Pharma
        category: categories[1]._id, // Capsules
        batchNumber: 'B456-AM',
        supplier: suppliers[0]._id,
        purchasePrice: 40,
        sellingPrice: 75,
        MRP: 85,
        discount: 11,
        stock: 90,
        minStock: 15,
        expiryDate: new Date('2027-08-31'),
        manufacturingDate: new Date('2025-03-01'),
        description: 'Broad spectrum antibiotic used to treat bacterial infections.',
        uses: 'Ear infections, throat infections, urinary tract infections.',
        sideEffects: 'Nausea, vomiting, diarrhea, rashes.',
        dosage: 'Take 1 capsule 3 times daily or as prescribed by a physician.',
        manufacturer: 'Sun Pharmaceuticals',
        prescriptionRequired: true
      },
      {
        name: 'Cough Out Syrup',
        genericName: 'Dextromethorphan',
        brand: brands[2]._id, // GSK
        category: categories[2]._id, // Syrups
        batchNumber: 'B789-CO',
        supplier: suppliers[0]._id,
        purchasePrice: 30,
        sellingPrice: 55,
        MRP: 60,
        discount: 8,
        stock: 50,
        minStock: 10,
        expiryDate: new Date('2027-06-30'),
        manufacturingDate: new Date('2025-02-01'),
        description: 'Soothes dry cough and provides long lasting relief.',
        uses: 'Dry cough, throat irritation.',
        sideEffects: 'Drowsiness, dizziness, lightheadedness.',
        dosage: '10ml twice daily or as directed by a doctor.',
        manufacturer: 'GSK India',
        prescriptionRequired: false
      }
    ]);

    console.log('Medicines created successfully!');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

connectDB().then(importData);
