const Address = require('../models/Address');

// @desc    Get user addresses
// @route   GET /api/addresses
// @access  Private
exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add a new address
// @route   POST /api/addresses
// @access  Private
exports.addAddress = async (req, res) => {
  try {
    const { name, street, city, state, zipCode, country, phone, isDefault } = req.body;

    // If marked as default, unset other default addresses for user
    if (isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    // Check if this is the first address, default it
    const addressCount = await Address.countDocuments({ user: req.user._id });
    const markDefault = addressCount === 0 ? true : isDefault;

    const address = await Address.create({
      user: req.user._id,
      name,
      street,
      city,
      state,
      zipCode,
      country: country || 'India',
      phone,
      isDefault: markDefault
    });

    res.status(201).json({ success: true, address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
exports.updateAddress = async (req, res) => {
  try {
    let address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    // Authorize owner
    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (req.body.isDefault) {
      await Address.updateMany({ user: req.user._id }, { isDefault: false });
    }

    address = await Address.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await address.deleteOne();
    res.json({ success: true, message: 'Address removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Set default address
// @route   PATCH /api/addresses/:id/default
// @access  Private
exports.setDefaultAddress = async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    if (address.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    await Address.updateMany({ user: req.user._id }, { isDefault: false });

    address.isDefault = true;
    await address.save();

    res.json({ success: true, message: 'Default address updated', address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
