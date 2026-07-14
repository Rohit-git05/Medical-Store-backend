const express = require('express');
const router = express.Router();
const {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog
} = require('../controllers/blogController');
const { protect, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.route('/')
  .get(getBlogs)
  .post(protect, checkRole('admin', 'pharmacist'), upload.single('image'), createBlog);

router.route('/:id')
  .get(getBlogById)
  .put(protect, checkRole('admin', 'pharmacist'), upload.single('image'), updateBlog)
  .delete(protect, checkRole('admin', 'pharmacist'), deleteBlog);

module.exports = router;
