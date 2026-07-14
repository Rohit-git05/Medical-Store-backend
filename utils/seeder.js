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
      { name: 'Appetizers', description: 'Quick bites and starters' },
      { name: 'Mains', description: 'Full course entrees and mains' },
      { name: 'Desserts', description: 'Sweet treats and dessert delights' },
      { name: 'Beverages', description: 'Cold drinks and hot beverages' },
      { name: 'Snacks', description: 'Light snacks and street food' }
    ]);
    console.log('Categories created...');

    // 3. Create Brands (Cuisines)
    const brands = await Brand.create([
      { name: 'Italian', description: 'Classic pizza, pasta, and gelato' },
      { name: 'American', description: 'Burgers, fries, shakes, and wings' },
      { name: 'Indian', description: 'Rich tandoori starters and curries' },
      { name: 'Chinese', description: 'Wok-tossed noodles, rice, and dimsums' }
    ]);
    console.log('Brands/Cuisines created...');

    // 4. Create Suppliers (Partner Restaurants)
    const suppliers = await Supplier.create([
      {
        name: 'The Food Bistro Group',
        contactEmail: 'orders@foodbistro.com',
        contactPhone: '+91 9988776655',
        address: '12 Culinary Boulevard, food Court'
      }
    ]);
    console.log('Restaurants created...');

    // 5. Create Medicines (Menu Items)
    await Medicine.create([
      {
        name: 'Margherita Pizza',
        genericName: 'Italian Sour-dough Pizza',
        brand: brands[0]._id, // Italian
        category: categories[1]._id, // Mains
        batchNumber: 'F101-MP',
        supplier: suppliers[0]._id,
        purchasePrice: 120,
        sellingPrice: 249,
        MRP: 299,
        discount: 16,
        stock: 50,
        minStock: 5,
        expiryDate: new Date('2027-12-31'),
        manufacturingDate: new Date('2025-01-01'),
        description: 'Classic neapolitan style sourdough pizza topped with fresh tomato sauce, mozzarella cheese, and basil leaves.',
        uses: 'Tomato sauce, fresh mozzarella, sweet basil, olive oil.',
        sideEffects: ['Gluten (Wheat)', 'Dairy (Cheese)', 'Lactose'],
        dosage: 'Serves 1-2 people (12 inches).',
        manufacturer: 'Pizza Palace Kitchen',
        prescriptionRequired: false,
        packSize: '12 Inch Medium Pizza',
        precautions: ['Best served hot and fresh', 'Contains milk products', 'Extra chili flakes available on request'],
        images: ['/uploads/page_16.png', '/uploads/page_36.png', '/uploads/page_55.png']
      },
      {
        name: 'Classic Chicken Shawarma',
        genericName: 'Lebanese Chicken Wrap',
        brand: brands[1]._id, // American / Wraps
        category: categories[1]._id, // Mains
        batchNumber: 'F102-CS',
        supplier: suppliers[0]._id,
        purchasePrice: 80,
        sellingPrice: 179,
        MRP: 199,
        discount: 10,
        stock: 40,
        minStock: 5,
        expiryDate: new Date('2027-08-31'),
        manufacturingDate: new Date('2025-03-01'),
        description: 'Spiced slow-roasted chicken wrapped in fresh pita bread with garlic sauce, pickled cucumbers, and French fries.',
        uses: 'Roasted chicken, garlic paste, pickled cucumbers, pita bread, French fries.',
        sideEffects: ['Gluten (Pita)', 'Garlic'],
        dosage: 'Single serving wrapped roll.',
        manufacturer: 'Wrap Bistro Kitchen',
        prescriptionRequired: true, // Non-Veg
        packSize: '1 Wrap + Garlic Dip',
        precautions: ['Contains garlic paste', 'Can request extra pickles'],
        images: ['/uploads/page_17.png', '/uploads/page_18.png', '/uploads/page_50.png']
      },
      {
        name: 'Paneer Tikka Platter',
        genericName: 'Tandoori Grilled Paneer',
        brand: brands[2]._id, // Indian
        category: categories[0]._id, // Appetizers
        batchNumber: 'F103-PT',
        supplier: suppliers[0]._id,
        purchasePrice: 95,
        sellingPrice: 220,
        MRP: 250,
        discount: 12,
        stock: 30,
        minStock: 4,
        expiryDate: new Date('2027-06-30'),
        manufacturingDate: new Date('2025-02-01'),
        description: 'Spiced paneer cubes marinated in yogurt and tikka spices, chargrilled in a tandoor with onions and bell peppers.',
        uses: 'Paneer, yogurt, tandoori marinade, red onion, green capsicum.',
        sideEffects: ['Dairy (Yogurt/Paneer)', 'Lactose'],
        dosage: 'Serves 1-2 people (6 pieces).',
        manufacturer: 'The Curry House Kitchen',
        prescriptionRequired: false,
        packSize: '6 Pieces + Mint Chutney',
        precautions: ['Gluten-free choice', 'Contains dairy'],
        images: ['/uploads/page_15.png', '/uploads/page_32.png', '/uploads/page_54.png']
      },
      {
        name: 'Veg Hakka Fried Rice',
        genericName: 'Wok-tossed Rice with Veggies',
        brand: brands[3]._id, // Chinese
        category: categories[1]._id, // Mains
        batchNumber: 'F104-HN',
        supplier: suppliers[0]._id,
        purchasePrice: 65,
        sellingPrice: 149,
        MRP: 169,
        discount: 11,
        stock: 45,
        minStock: 5,
        expiryDate: new Date('2027-09-30'),
        manufacturingDate: new Date('2025-04-01'),
        description: 'Piping hot wok-tossed jasmine rice with carrots, French beans, spring onion greens, soy sauce, and egg halves.',
        uses: 'Rice, carrots, French beans, spring onions, soy sauce, boiled egg.',
        sideEffects: ['Soy', 'Gluten', 'Eggs'],
        dosage: 'Standard 500ml box (Serves 1).',
        manufacturer: 'Golden Dragon Kitchen',
        prescriptionRequired: true, // Non-Veg (Eggs)
        packSize: '500g Container',
        precautions: ['Contains egg halves', 'Can be made eggless on request'],
        images: ['/uploads/page_35.png', '/uploads/page_56.png', '/uploads/page_49.png']
      },
      {
        name: 'Strawberry Cheesecake',
        genericName: 'New York Strawberry Cheesecake',
        brand: brands[0]._id, // Italian
        category: categories[2]._id, // Desserts
        batchNumber: 'F105-SC',
        supplier: suppliers[0]._id,
        purchasePrice: 40,
        sellingPrice: 99,
        MRP: 119,
        discount: 16,
        stock: 20,
        minStock: 2,
        expiryDate: new Date('2027-04-30'),
        manufacturingDate: new Date('2025-05-01'),
        description: 'Rich, smooth cream cheese filling baked on a graham cracker crust and topped with a sweet strawberry glaze.',
        uses: 'Cream cheese, strawberries, graham crackers, cream, sugar.',
        sideEffects: ['Dairy', 'Gluten', 'Gelatin (rare)'],
        dosage: 'One pre-sliced cake piece.',
        manufacturer: 'Bakehouse Kitchen',
        prescriptionRequired: false,
        packSize: '1 Slice',
        precautions: ['Keep refrigerated', 'Best consumed fresh'],
        images: ['/uploads/page_29.png', '/uploads/page_22.png', '/uploads/page_53.png']
      },
      {
        name: 'Avocado Toast & Fries',
        genericName: 'Gourmet Sandwich',
        brand: brands[1]._id, // American
        category: categories[4]._id, // Snacks
        batchNumber: 'F106-AS',
        supplier: suppliers[0]._id,
        purchasePrice: 60,
        sellingPrice: 129,
        MRP: 149,
        discount: 13,
        stock: 35,
        minStock: 4,
        expiryDate: new Date('2027-05-31'),
        manufacturingDate: new Date('2025-05-01'),
        description: 'Mashed seasoned avocado spread over toasted multi-grain bread slices. Served with a side of crispy fries.',
        uses: 'Avocado, multigrain bread, potato fries, cherry tomato.',
        sideEffects: ['Gluten'],
        dosage: 'Serves 1.',
        manufacturer: 'Sandwich Bistro Kitchen',
        prescriptionRequired: false,
        packSize: '1 Plate',
        precautions: ['100% Vegan options available', 'Multigrain bread contains seeds'],
        images: ['/uploads/page_24.png', '/uploads/page_25.png', '/uploads/page_52.png']
      },
      {
        name: 'Banh Mi Pork Baguette',
        genericName: 'Vietnamese Sandwich',
        brand: brands[3]._id, // Chinese/Asian
        category: categories[4]._id, // Snacks
        batchNumber: 'F107-BM',
        supplier: suppliers[0]._id,
        purchasePrice: 50,
        sellingPrice: 119,
        MRP: 139,
        discount: 14,
        stock: 25,
        minStock: 3,
        expiryDate: new Date('2027-05-31'),
        manufacturingDate: new Date('2025-05-01'),
        description: 'Crispy French baguette stuffed with savory sliced pork, cucumbers, pickled carrots, daikon, and fresh cilantro.',
        uses: 'Baguette, pork slices, cucumber, pickled carrots, daikon, cilantro.',
        sideEffects: ['Gluten', 'Pork'],
        dosage: 'Serves 1.',
        manufacturer: 'Asian Bites Kitchen',
        prescriptionRequired: true, // Non-Veg
        packSize: '1 Baguette',
        precautions: ['Contains pork', 'Cilantro can be omitted on request'],
        images: ['/uploads/page_27.png', '/uploads/page_26.png']
      },
      {
        name: 'Mango Mousse Cheesecake',
        genericName: 'Mango Cheesecake Slice',
        brand: brands[0]._id, // Italian
        category: categories[2]._id, // Desserts
        batchNumber: 'F108-MC',
        supplier: suppliers[0]._id,
        purchasePrice: 45,
        sellingPrice: 99,
        MRP: 109,
        discount: 9,
        stock: 15,
        minStock: 2,
        expiryDate: new Date('2027-05-31'),
        manufacturingDate: new Date('2025-05-01'),
        description: 'Heavenly slice of cold-set cheesecake with white chocolate cream and a mango glaze, garnished with fresh flowers.',
        uses: 'Cream cheese, mango pulp, cookie crust, white chocolate.',
        sideEffects: ['Dairy', 'Gluten'],
        dosage: 'Single serving slice.',
        manufacturer: 'Bakehouse Kitchen',
        prescriptionRequired: false,
        packSize: '1 Slice',
        precautions: ['Contains dairy products', 'Keep refrigerated'],
        images: ['/uploads/page_31.png', '/uploads/page_30.png']
      },
      {
        name: 'Gourmet Red Velvet Cupcake',
        genericName: 'Red Velvet Cupcake',
        brand: brands[1]._id, // American
        category: categories[2]._id, // Desserts
        batchNumber: 'F109-VC',
        supplier: suppliers[0]._id,
        purchasePrice: 30,
        sellingPrice: 79,
        MRP: 89,
        discount: 11,
        stock: 30,
        minStock: 3,
        expiryDate: new Date('2027-05-31'),
        manufacturingDate: new Date('2025-05-01'),
        description: 'Soft red velvet cupcake topped with vanilla cream cheese frosting and a sweet glazed cherry.',
        uses: 'Flour, cocoa, cream cheese, glazed cherry, butter, sugar.',
        sideEffects: ['Gluten', 'Dairy', 'Eggs'],
        dosage: 'Single cupcake unit.',
        manufacturer: 'Bakehouse Kitchen',
        prescriptionRequired: false,
        packSize: '1 Cupcake',
        precautions: ['Contains eggs', 'Contains dairy products'],
        images: ['/uploads/page_28.png', '/uploads/page_23.png']
      },
      {
        name: 'Tuscan Creamy Chicken Pasta',
        genericName: 'Italian Cream Pasta',
        brand: brands[0]._id, // Italian
        category: categories[1]._id, // Mains
        batchNumber: 'F110-TP',
        supplier: suppliers[0]._id,
        purchasePrice: 100,
        sellingPrice: 219,
        MRP: 249,
        discount: 12,
        stock: 40,
        minStock: 4,
        expiryDate: new Date('2027-05-31'),
        manufacturingDate: new Date('2025-05-01'),
        description: 'Tender pan-seared chicken strips tossed with sun-dried tomatoes and spinach in a rich garlic cream sauce over linguine.',
        uses: 'Chicken, sun-dried tomatoes, baby spinach, cream sauce, linguine pasta.',
        sideEffects: ['Gluten', 'Dairy', 'Garlic'],
        dosage: 'Serves 1.',
        manufacturer: 'Pasta Palace Kitchen',
        prescriptionRequired: true, // Non-Veg
        packSize: '1 Bowl',
        precautions: ['Contains garlic and dairy cream'],
        images: ['/uploads/page_39.png', '/uploads/page_38.png', '/uploads/page_40.png', '/uploads/page_41.png']
      },
      {
        name: 'Seafood Spaghetti Marinara',
        genericName: 'Seafood Pasta',
        brand: brands[0]._id, // Italian
        category: categories[1]._id, // Mains
        batchNumber: 'F111-SM',
        supplier: suppliers[0]._id,
        purchasePrice: 130,
        sellingPrice: 269,
        MRP: 299,
        discount: 10,
        stock: 20,
        minStock: 2,
        expiryDate: new Date('2027-05-31'),
        manufacturingDate: new Date('2025-05-01'),
        description: 'Spaghetti pasta tossed with sautéed prawns and calamari rings in a zesty garlic tomato marinara sauce.',
        uses: 'Spaghetti, prawns, calamari, tomato sauce, garlic, olive oil.',
        sideEffects: ['Gluten', 'Shellfish', 'Seafood'],
        dosage: 'Serves 1.',
        manufacturer: 'Pasta Palace Kitchen',
        prescriptionRequired: true, // Non-Veg
        packSize: '1 Bowl',
        precautions: ['High allergen risk for shellfish/seafood allergies'],
        images: ['/uploads/page_42.png']
      },
      {
        name: 'Vietnamese Pho Soup',
        genericName: 'Asian Noodle Soup',
        brand: brands[3]._id, // Chinese/Asian
        category: categories[1]._id, // Mains
        batchNumber: 'F112-VP',
        supplier: suppliers[0]._id,
        purchasePrice: 85,
        sellingPrice: 189,
        MRP: 209,
        discount: 9,
        stock: 30,
        minStock: 3,
        expiryDate: new Date('2027-05-31'),
        manufacturingDate: new Date('2025-05-01'),
        description: 'Comforting rice noodle soup served in a savory beef broth with thinly sliced tenderloin beef, fresh mint, and lime.',
        uses: 'Rice noodles, beef broth, beef slices, mint, basil, scallions.',
        sideEffects: ['Beef', 'Gluten-free options'],
        dosage: 'Serves 1.',
        manufacturer: 'Asian Bites Kitchen',
        prescriptionRequired: true, // Non-Veg
        packSize: '1 Bowl',
        precautions: ['Contains beef broth', 'Served piping hot'],
        images: ['/uploads/page_43.png']
      },
      {
        name: 'Chargrilled Salmon Fillet',
        genericName: 'Grilled Salmon Dish',
        brand: brands[1]._id, // American
        category: categories[1]._id, // Mains
        batchNumber: 'F113-SF',
        supplier: suppliers[0]._id,
        purchasePrice: 160,
        sellingPrice: 349,
        MRP: 399,
        discount: 12,
        stock: 20,
        minStock: 2,
        expiryDate: new Date('2027-05-31'),
        manufacturingDate: new Date('2025-05-01'),
        description: 'Flaky chargrilled salmon fillet seasoned with herbs. Served over a bed of quinoa and steamed broccoli with lemon slices.',
        uses: 'Salmon fillet, quinoa, broccoli, sweet potato, lemon slices.',
        sideEffects: ['Fish'],
        dosage: 'Serves 1.',
        manufacturer: 'Seafood Bistro Kitchen',
        prescriptionRequired: true, // Non-Veg
        packSize: '1 Plate',
        precautions: ['Contains fish bone hazard risk (rare)', 'Gluten-free platter'],
        images: ['/uploads/page_44.png', '/uploads/page_58.png']
      },
      {
        name: 'Roasted Cauliflower Salad',
        genericName: 'Middle Eastern Salad',
        brand: brands[2]._id, // Indian/Middle Eastern
        category: categories[0]._id, // Appetizers
        batchNumber: 'F114-CS',
        supplier: suppliers[0]._id,
        purchasePrice: 65,
        sellingPrice: 159,
        MRP: 179,
        discount: 11,
        stock: 40,
        minStock: 4,
        expiryDate: new Date('2027-05-31'),
        manufacturingDate: new Date('2025-05-01'),
        description: 'Tender roasted cauliflower florets tossed with fresh parsley, pomegranate seeds, chickpeas, and a light tahini dressing.',
        uses: 'Cauliflower, chickpeas, pomegranate seeds, parsley, tahini sauce.',
        sideEffects: ['Sesame (Tahini)'],
        dosage: 'Serves 1-2.',
        manufacturer: 'The Curry House Kitchen',
        prescriptionRequired: false,
        packSize: '1 Bowl',
        precautions: ['100% Vegan and Gluten-free salad', 'Contains sesame paste in dressing'],
        images: ['/uploads/page_33.png', '/uploads/page_34.png', '/uploads/page_13.png']
      }
    ]);

    console.log('Food dishes created successfully!');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  connectDB().then(importData);
}

module.exports = importData;
