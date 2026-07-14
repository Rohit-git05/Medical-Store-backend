const Medicine = require('../models/Medicine');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const { uploadToCloudinary } = require('../services/cloudinary');

// @desc    Get all medicines (Search, Filters, Sort, Paginate)
// @route   GET /api/medicines
// @access  Public
exports.getMedicines = async (req, res) => {
  try {
    const {
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      availability,
      prescriptionRequired,
      sort,
      page = 1,
      limit = 10
    } = req.query;

    const query = { status: 'active' };

    // Search query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } }
      ];
    }

    // Filters
    if (category) {
      query.category = category;
    }
    if (brand) {
      query.brand = brand;
    }
    if (minPrice || maxPrice) {
      query.sellingPrice = {};
      if (minPrice) query.sellingPrice.$gte = Number(minPrice);
      if (maxPrice) query.sellingPrice.$lte = Number(maxPrice);
    }
    if (rating) {
      query.averageRating = { $gte: Number(rating) };
    }
    if (availability) {
      if (availability === 'inStock') {
        query.stock = { $gt: 0 };
      } else if (availability === 'outOfStock') {
        query.stock = 0;
      }
    }
    if (prescriptionRequired !== undefined) {
      query.prescriptionRequired = prescriptionRequired === 'true';
    }

    // Count total matches for pagination
    const count = await Medicine.countDocuments(query);

    // Sorting
    let sortQuery = { createdAt: -1 }; // default is latest
    if (sort) {
      if (sort === 'bestSelling') {
        sortQuery = { numReviews: -1, averageRating: -1 };
      } else if (sort === 'priceAsc') {
        sortQuery = { sellingPrice: 1 };
      } else if (sort === 'priceDesc') {
        sortQuery = { sellingPrice: -1 };
      } else if (sort === 'rating') {
        sortQuery = { averageRating: -1 };
      }
    }

    const medicines = await Medicine.find(query)
      .populate('category', 'name')
      .populate('brand', 'name')
      .sort(sortQuery)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({
      success: true,
      medicines,
      page: Number(page),
      pages: Math.ceil(count / Number(limit)),
      total: count
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single medicine details
// @route   GET /api/medicines/:id
// @access  Public
exports.getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id)
      .populate('category', 'name')
      .populate('brand', 'name')
      .populate('supplier', 'name');

    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    res.json({ success: true, medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a medicine (Admin/Pharmacist)
// @route   POST /api/medicines
// @access  Private (Admin/Pharmacist)
exports.createMedicine = async (req, res) => {
  try {
    const medicineData = { ...req.body };

    // Handle image uploads
    if (req.files && req.files.length > 0) {
      const imageUrls = [];
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.path, 'medicines');
        imageUrls.push(url);
      }
      medicineData.images = imageUrls;
    }

    const medicine = await Medicine.create(medicineData);
    res.status(201).json({ success: true, medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update a medicine (Admin/Pharmacist)
// @route   PUT /api/medicines/:id
// @access  Private (Admin/Pharmacist)
exports.updateMedicine = async (req, res) => {
  try {
    let medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    const medicineData = { ...req.body };

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const imageUrls = [...(medicine.images || [])];
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.path, 'medicines');
        imageUrls.push(url);
      }
      medicineData.images = imageUrls;
    }

    medicine = await Medicine.findByIdAndUpdate(req.params.id, medicineData, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, medicine });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a medicine (Admin/Pharmacist)
// @route   DELETE /api/medicines/:id
// @access  Private (Admin/Pharmacist)
exports.deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ success: false, message: 'Medicine not found' });
    }

    // Soft delete by marking inactive
    medicine.status = 'inactive';
    await medicine.save();

    res.json({ success: true, message: 'Medicine deactivated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get autocomplete suggestions
// @route   GET /api/medicines/search/suggestions
// @access  Public
exports.getAutocompleteSuggestions = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.json({ success: true, suggestions: [] });
    }

    const suggestions = await Medicine.find(
      {
        status: 'active',
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { genericName: { $regex: query, $options: 'i' } }
        ]
      },
      { name: 1, genericName: 1, sellingPrice: 1, images: 1 }
    ).limit(8);

    res.json({ success: true, suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trending searches
// @route   GET /api/medicines/search/trending
// @access  Public
exports.getTrendingSearches = async (req, res) => {
  try {
    // Return standard popular searches for trending searches widget
    const trending = [
      'Paracetamol',
      'Amoxicillin',
      'Atorvastatin',
      'Metformin',
      'Ibuprofen',
      'Vitamin C',
      'Diabetes Care'
    ];
    res.json({ success: true, trending });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Low Stock Alerts (Admin/Pharmacist)
// @route   GET /api/medicines/alerts/low-stock
// @access  Private (Admin/Pharmacist)
exports.getLowStockAlerts = async (req, res) => {
  try {
    const lowStockMedicines = await Medicine.find({
      status: 'active',
      $expr: { $lte: ['$stock', '$minStock'] }
    }).populate('category', 'name').populate('brand', 'name');

    res.json({ success: true, count: lowStockMedicines.length, medicines: lowStockMedicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Expiry Alerts (Admin/Pharmacist)
// @route   GET /api/medicines/alerts/expiry
// @access  Private (Admin/Pharmacist)
exports.getExpiryAlerts = async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringMedicines = await Medicine.find({
      status: 'active',
      expiryDate: { $lte: thirtyDaysFromNow }
    }).populate('category', 'name').populate('brand', 'name');

    res.json({ success: true, count: expiringMedicines.length, medicines: expiringMedicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
