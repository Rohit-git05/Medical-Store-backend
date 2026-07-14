const Blog = require('../models/Blog');
const { uploadToCloudinary } = require('../services/cloudinary');

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
exports.getBlogs = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = { status: 'published' };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const blogs = await Blog.find(query)
      .populate('author', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: blogs.length, blogs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single blog details
// @route   GET /api/blogs/:id
// @access  Public
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('author', 'name profilePicture');
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create blog post
// @route   POST /api/blogs
// @access  Private (Admin/Pharmacist)
exports.createBlog = async (req, res) => {
  try {
    const blogData = {
      ...req.body,
      author: req.user._id
    };

    if (req.file) {
      blogData.image = await uploadToCloudinary(req.file.path, 'blogs');
    }

    const blog = await Blog.create(blogData);
    res.status(201).json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update blog post
// @route   PUT /api/blogs/:id
// @access  Private (Admin/Pharmacist)
exports.updateBlog = async (req, res) => {
  try {
    let blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Verify ownership or check if Admin
    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to edit this blog' });
    }

    const blogData = { ...req.body };

    if (req.file) {
      blogData.image = await uploadToCloudinary(req.file.path, 'blogs');
    }

    blog = await Blog.findByIdAndUpdate(req.params.id, blogData, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, blog });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete blog post
// @route   DELETE /api/blogs/:id
// @access  Private (Admin/Pharmacist)
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this blog' });
    }

    await blog.deleteOne();
    res.json({ success: true, message: 'Blog post deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
