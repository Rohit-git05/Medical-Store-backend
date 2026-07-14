require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const { apiLimiter, sanitizeInput } = require('./middleware/security');

// Initialize database
connectDB().then(async () => {
  try {
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database is empty. Automatically running database seeder...');
      const importData = require('./utils/seeder');
      await importData();
      console.log('Database seeded successfully.');
    }
  } catch (err) {
    console.error('Error auto-seeding database:', err);
  }
});

const app = express();

// --- SECURITY MIDDLEWARES ---
app.use(helmet({
  crossOriginResourcePolicy: false // Allow loading images from our server directly
}));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting and JSON body parsers
app.use('/api/', apiLimiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sanitization to prevent XSS
app.use(sanitizeInput);

// Static uploads directory for prescription & medicine images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- REGISTER ROUTES ---
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/addresses', require('./routes/addressRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/prescriptions', require('./routes/prescriptionRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Root path test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Medical Store API is active' });
});

// --- GLOBAL ERROR HANDLER ---
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
