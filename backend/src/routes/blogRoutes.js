const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  listBlogPosts,
  getBlogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} = require('../controllers/blogController');

const router = express.Router();
router.get('/', listBlogPosts);
router.get('/:id', getBlogPost);
router.use(protect);
router.post('/', authorize(['Super Admin', 'Admin', 'Content Manager']), createBlogPost);
router.put('/:id', authorize(['Super Admin', 'Admin', 'Content Manager']), updateBlogPost);
router.delete('/:id', authorize(['Super Admin', 'Admin']), deleteBlogPost);

module.exports = router;