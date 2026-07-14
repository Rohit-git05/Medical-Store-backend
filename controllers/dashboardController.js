const Order = require('../models/Order');
const User = require('../models/User');
const Medicine = require('../models/Medicine');

// @desc    Get dashboard analytics (Admin/Pharmacist)
// @route   GET /api/dashboard/stats
// @access  Private (Admin/Pharmacist)
exports.getDashboardStats = async (req, res) => {
  try {
    // 1. Core Metrics
    const totalMedicines = await Medicine.countDocuments({ status: 'active' });
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalOrders = await Order.countDocuments();

    // 2. Revenue Calculations
    // Total Revenue (Only count paid orders or successfully completed orders)
    const paidOrders = await Order.find({ paymentStatus: 'paid' });
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Monthly Revenue (Current Month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthlyPaidOrders = await Order.find({
      paymentStatus: 'paid',
      createdAt: { $gte: startOfMonth }
    });
    const monthlyRevenue = monthlyPaidOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Daily Sales (Today)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const dailyOrders = await Order.find({
      createdAt: { $gte: startOfToday }
    });
    const dailySales = dailyOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // 3. Low Stock Medicines (Below minimum threshold)
    const lowStockCount = await Medicine.countDocuments({
      status: 'active',
      $expr: { $lte: ['$stock', '$minStock'] }
    });

    // 4. Recent Activity
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const recentUsers = await User.find({ role: 'customer' })
      .sort({ createdAt: -1 })
      .limit(5);

    // 5. Chart Analytics Data (Last 7 days of sales)
    const last7Days = [];
    const salesData = [];
    const ordersData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.setHours(0, 0, 0, 0));
      const dayEnd = new Date(d.setHours(23, 59, 59, 999));

      const dayOrders = await Order.find({
        createdAt: { $gte: dayStart, $lte: dayEnd }
      });

      const daySales = dayOrders.reduce((sum, order) => sum + order.totalAmount, 0);

      last7Days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
      salesData.push(daySales);
      ordersData.push(dayOrders.length);
    }

    // 6. Top Selling Products (Aggregating based on review counts and average ratings as a proxy, or analyzing orders)
    // For simplicity, find medicines with highest rating/reviews or stock turnover
    const topSelling = await Medicine.find({ status: 'active' })
      .populate('brand', 'name')
      .sort({ averageRating: -1, numReviews: -1 })
      .limit(4);

    res.json({
      success: true,
      stats: {
        totalMedicines,
        totalCustomers,
        totalOrders,
        totalRevenue,
        monthlyRevenue,
        dailySales,
        lowStockCount
      },
      charts: {
        labels: last7Days,
        sales: salesData,
        orders: ordersData
      },
      topSelling,
      recentOrders,
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
