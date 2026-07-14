// Configure stripe if key exists
const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

// @desc    Create a payment intent for Stripe Checkout
// @route   POST /api/payments/create-intent
// @access  Private
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body; // Amount is expected in Rupees (INR)

    if (!amount) {
      return res.status(400).json({ success: false, message: 'Amount is required' });
    }

    const amountInPaise = Math.round(amount * 100); // Stripe requires amount in lowest currency unit (paise for INR)

    if (stripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInPaise,
        currency: 'inr',
        metadata: { integration_check: 'accept_a_payment', userId: req.user._id.toString() }
      });

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        id: paymentIntent.id
      });
    } else {
      // Mock Stripe if credentials are not configured
      console.log('--- STRIPE MOCK INTENT ---');
      console.log(`Amount: INR ${amount}`);
      console.log('--------------------------');
      res.json({
        success: true,
        clientSecret: 'mock_client_secret_xyz123',
        id: 'mock_pi_123456789'
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
