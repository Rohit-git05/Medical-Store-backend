const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const Cart = require('../models/Cart');
const Invoice = require('../models/Invoice');
const Coupon = require('../models/Coupon');
const sendEmail = require('../services/email');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      paymentStatus = 'pending',
      paymentIntentId = '',
      couponCode = ''
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    // 1. Verify and adjust inventory
    const orderItems = [];
    let subtotal = 0;

    for (const item of items) {
      const medicine = await Medicine.findById(item.medicine);
      if (!medicine) {
        return res.status(404).json({ success: false, message: `Medicine ${item.name} not found` });
      }

      if (medicine.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${medicine.name}. Only ${medicine.stock} left.`
        });
      }

      // Decrement stock
      medicine.stock -= item.quantity;
      await medicine.save();

      const itemPrice = medicine.sellingPrice;
      const discountPercentage = medicine.discount || 0;
      const finalPrice = itemPrice * (1 - discountPercentage / 100);

      orderItems.push({
        medicine: medicine._id,
        name: medicine.name,
        quantity: item.quantity,
        price: finalPrice,
        discount: discountPercentage
      });

      subtotal += finalPrice * item.quantity;
    }

    // 2. Coupon Validation
    let discountAmount = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode, isActive: true, expiryDate: { $gte: new Date() } });
      if (coupon && subtotal >= coupon.minPurchase) {
        if (coupon.discountType === 'percentage') {
          discountAmount = subtotal * (coupon.discountAmount / 100);
        } else {
          discountAmount = coupon.discountAmount;
        }
      }
    }

    // 3. GST & Shipping Charges
    const gst = Math.round(subtotal * 0.12 * 100) / 100; // 12% GST standard
    const shippingCharges = subtotal > 500 ? 0 : 50; // Free shipping over Rs 500

    const totalAmount = Math.round((subtotal - discountAmount + gst + shippingCharges) * 100) / 100;

    // 4. Create Order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'pending' : paymentStatus,
      paymentIntentId,
      orderStatus: paymentMethod === 'COD' ? 'pending' : 'confirmed',
      gst,
      shippingCharges,
      discountAmount,
      totalAmount
    });

    // 5. Generate Invoice Log
    const invoiceNumber = 'INV-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    await Invoice.create({
      order: order._id,
      invoiceNumber
    });

    // 6. Clear user cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    // 7. Send confirmation email
    const emailSubject = `Order Confirmed - #${order._id}`;
    const htmlMessage = `
      <h2>Thank you for your order!</h2>
      <p>Your order of total Rs. ${totalAmount} has been placed successfully.</p>
      <p>Order ID: ${order._id}</p>
      <p>Payment Method: ${paymentMethod}</p>
      <p>Delivery Address: ${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.zipCode}</p>
    `;
    await sendEmail({
      email: req.user.email,
      subject: emailSubject,
      htmlMessage
    });

    res.status(201).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order details
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.medicine');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify authorized user
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role === 'customer') {
      return res.status(401).json({ success: false, message: 'Not authorized to view this order' });
    }

    // Get invoice number
    const invoice = await Invoice.findOne({ order: order._id });

    res.json({ success: true, order, invoiceNumber: invoice ? invoice.invoiceNumber : '' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin/Pharmacist)
// @route   GET /api/orders/all
// @access  Private (Admin/Pharmacist)
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Admin/Pharmacist)
// @route   PUT /api/orders/:id/status
// @access  Private (Admin/Pharmacist)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    res.json({ success: true, message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
