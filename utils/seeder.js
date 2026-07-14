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
        genericName: 'Italian Cheese Pizza',
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
        sideEffects: [
          'Gluten (Wheat)',
          'Dairy (Cheese)',
          'Lactose'
        ],
        dosage: 'Serves 1-2 people (12 inches).',
        manufacturer: 'Pizza Palace Kitchen',
        prescriptionRequired: false, // OTC (No prescription)
        packSize: '12 Inch Medium Pizza',
        precautions: [
          'Best served hot and fresh',
          'Contains milk products',
          'Extra chili flakes and oregano available on request'
        ],
        images: [
          'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: 'Double Cheese Chicken Burger',
        genericName: 'Cheeseburger',
        brand: brands[1]._id, // American
        category: categories[1]._id, // Mains
        batchNumber: 'F102-CB',
        supplier: suppliers[0]._id,
        purchasePrice: 80,
        sellingPrice: 179,
        MRP: 199,
        discount: 10,
        stock: 40,
        minStock: 5,
        expiryDate: new Date('2027-08-31'),
        manufacturingDate: new Date('2025-03-01'),
        description: 'Juicy grilled chicken patty with cheddar cheese, lettuce, tomato, pickles, and our special house sauce on a toasted brioche bun.',
        uses: 'Grilled chicken patty, double cheddar, lettuce, tomato, pickles, house sauce, brioche.',
        sideEffects: [
          'Gluten (Brioche Bun)',
          'Dairy (Cheese)',
          'Sesame seeds'
        ],
        dosage: 'Single serving portion with fresh French fries.',
        manufacturer: 'Burger Bistro Kitchen',
        prescriptionRequired: false,
        packSize: '1 Burger + Fries',
        precautions: [
          'Contains gluten and dairy products',
          'Add bacon or extra cheese slice option available at checkout',
          'May contain sesame seeds on the bun'
        ],
        images: [
          'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: 'Paneer Tikka Platter',
        genericName: 'Tandoori Paneer Tikka',
        brand: brands[2]._id, // Indian
        category: categories[0]._id, // Appetizers
        batchNumber: 'F103-PT',
        supplier: suppliers[0]._id,
        purchasePrice: 90,
        sellingPrice: 220,
        MRP: 250,
        discount: 12,
        stock: 30,
        minStock: 4,
        expiryDate: new Date('2027-06-30'),
        manufacturingDate: new Date('2025-02-01'),
        description: 'Spiced paneer cubes marinated in yogurt and tikka spices, chargrilled in a tandoor with onions and bell peppers. Served with mint chutney.',
        uses: 'Paneer cubes, yogurt, tandoori tikka marinade, onion, bell pepper.',
        sideEffects: [
          'Dairy (Yogurt/Paneer)',
          'Lactose'
        ],
        dosage: 'Serves 1-2 people (6 pieces).',
        manufacturer: 'The Curry House Kitchen',
        prescriptionRequired: false,
        packSize: '6 Pieces + Chutney',
        precautions: [
          '100% Vegetarian and Gluten-free starter',
          'Specify spice preferences: Mild, Medium, Hot',
          'Contains dairy products'
        ],
        images: [
          'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: 'Vegetable Hakka Noodles',
        genericName: 'Hakka Noodles',
        brand: brands[3]._id, // Chinese
        category: categories[1]._id, // Mains
        batchNumber: 'F104-HN',
        supplier: suppliers[0]._id,
        purchasePrice: 60,
        sellingPrice: 149,
        MRP: 169,
        discount: 11,
        stock: 45,
        minStock: 5,
        expiryDate: new Date('2027-09-30'),
        manufacturingDate: new Date('2025-04-01'),
        description: 'Wok-tossed noodles with shredded cabbage, carrots, bell peppers, spring onions, and a splash of soy sauce.',
        uses: 'Noodles, soy sauce, cabbage, carrots, bell peppers, spring onions.',
        sideEffects: [
          'Gluten (Noodles)',
          'Soy',
          'MSG'
        ],
        dosage: 'Standard portion size (Serves 1).',
        manufacturer: 'Golden Dragon Kitchen',
        prescriptionRequired: false,
        packSize: '500g Container',
        precautions: [
          'Contains soy sauce and gluten',
          'Can be prepared without MSG on request',
          'Tossed with garlic and onion'
        ],
        images: [
          'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=60'
        ]
      },
      {
        name: 'Chocolate Lava Cake',
        genericName: 'Molten Lava Cake',
        brand: brands[0]._id, // Italian/Desserts
        category: categories[2]._id, // Desserts
        batchNumber: 'F105-LC',
        supplier: suppliers[0]._id,
        purchasePrice: 35,
        sellingPrice: 89,
        MRP: 99,
        discount: 10,
        stock: 25,
        minStock: 3,
        expiryDate: new Date('2027-05-31'),
        manufacturingDate: new Date('2025-05-01'),
        description: 'Warm and decadent chocolate cake filled with a gooey, molten dark chocolate center. Served warm.',
        uses: 'Cocoa powder, dark chocolate, flour, butter, sugar.',
        sideEffects: [
          'Dairy (Butter)',
          'Gluten (Flour)',
          'Eggs'
        ],
        dosage: 'Single serving dessert cake.',
        manufacturer: 'Bakehouse Kitchen',
        prescriptionRequired: false,
        packSize: '1 Cake Cup',
        precautions: [
          'Contains eggs and gluten',
          'Microwave for 10-15 seconds for hot molten lava overflow',
          'Best paired with vanilla ice cream'
        ],
        images: [
          'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&auto=format&fit=crop&q=60'
        ]
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
