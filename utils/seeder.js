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
      { name: 'Diabetes Care', description: 'Insulin and diabetes aids' },
      { name: 'Ointments', description: 'Topical creams and ointments' }
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
        sideEffects: [
          'Nausea or stomach upset',
          'Allergic skin reactions in rare cases',
          'Liver risk if recommended dose is exceeded'
        ],
        dosage: '1 tablet every 4-6 hours as required. Max 4g daily.',
        manufacturer: 'Cipla Ltd.',
        prescriptionRequired: false,
        packSize: '10 Tablets (1 Strip)',
        precautions: [
          'Do not take with other paracetamol-containing products',
          'Avoid alcohol consumption while taking this medication',
          'Consult doctor if you have kidney or liver issues'
        ],
        images: [
          'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=500&auto=format&fit=crop&q=60'
        ]
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
        sideEffects: [
          'Diarrhea or loose stools',
          'Nausea and vomiting',
          'Mild skin rashes or itching'
        ],
        dosage: 'Take 1 capsule 3 times daily or as prescribed by a physician.',
        manufacturer: 'Sun Pharmaceuticals',
        prescriptionRequired: true,
        packSize: '10 Capsules',
        precautions: [
          'Finish the entire course as prescribed by the doctor',
          'Do not take if you have a history of penicillin allergy',
          'Take with food to minimize gastrointestinal discomfort'
        ],
        images: [
          'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1607619056574-7b8d304b3b33?w=500&auto=format&fit=crop&q=60'
        ]
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
        sideEffects: [
          'Mild drowsiness or sleepiness',
          'Dizziness or lightheadedness',
          'Dry mouth or throat'
        ],
        dosage: '10ml twice daily or as directed by a doctor.',
        manufacturer: 'GSK India',
        prescriptionRequired: false,
        packSize: '100ml Bottle',
        precautions: [
          'Avoid driving or operating machinery after consumption',
          'Avoid consuming alcohol while using this medicine',
          'Keep out of reach of children under 6 years'
        ],
        images: [
          'https://images.unsplash.com/photo-1550572017-edd951b55104?w=500&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: 'Multivitamin Formula',
        genericName: 'Vitamins and Minerals',
        brand: brands[3]._id, // Abbott
        category: categories[4]._id, // Vitamins
        batchNumber: 'B822-MV',
        supplier: suppliers[0]._id,
        purchasePrice: 60,
        sellingPrice: 110,
        MRP: 120,
        discount: 8,
        stock: 80,
        minStock: 10,
        expiryDate: new Date('2027-09-30'),
        manufacturingDate: new Date('2025-04-01'),
        description: 'Daily nutritional supplement to boost immunity and energy.',
        uses: 'Vitamin deficiency, fatigue, immunity boost.',
        sideEffects: [
          'Mild stomach upset on empty stomach',
          'Unpleasant metallic taste in mouth',
          'Temporary changes in urine color'
        ],
        dosage: '1 tablet daily after breakfast or lunch.',
        manufacturer: 'Abbott Laboratories',
        prescriptionRequired: false,
        packSize: '30 Tablets (1 Bottle)',
        precautions: [
          'Take with a full glass of water and a meal',
          'Do not exceed the recommended daily dose',
          'Consult a physician if you are pregnant or breastfeeding'
        ],
        images: [
          'https://images.unsplash.com/photo-1616671285420-7f2832c3f87b?w=500&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: 'Hydrocortisone Cream 1%',
        genericName: 'Hydrocortisone',
        brand: brands[3]._id, // Abbott
        category: categories[6]._id, // Ointments
        batchNumber: 'B511-HC',
        supplier: suppliers[0]._id,
        purchasePrice: 20,
        sellingPrice: 38,
        MRP: 42,
        discount: 9,
        stock: 60,
        minStock: 12,
        expiryDate: new Date('2027-05-31'),
        manufacturingDate: new Date('2025-05-01'),
        description: 'Topical steroid cream for relief of itching and skin inflammation.',
        uses: 'Eczema, insect bites, mild rashes.',
        sideEffects: [
          'Mild burning or stinging at application site',
          'Dryness or peeling of skin',
          'Skin thinning (if used long-term)'
        ],
        dosage: 'Apply a thin film to the affected area 2 to 3 times daily.',
        manufacturer: 'Abbott Laboratories',
        prescriptionRequired: false,
        packSize: '15g Tube',
        precautions: [
          'For external use only; do not ingest',
          'Do not use on open wounds or infected skin',
          'Avoid contact with eyes and mucous membranes'
        ],
        images: [
          'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=500&auto=format&fit=crop&q=60'
        ]
      }
    ]);

    console.log('Medicines created successfully!');
    if (require.main === module) {
      process.exit();
    }
  } catch (error) {
    console.error('Error importing data:', error);
    if (require.main === module) {
      process.exit(1);
    } else {
      throw error;
    }
  }
};

if (require.main === module) {
  connectDB().then(importData);
}

module.exports = importData;
