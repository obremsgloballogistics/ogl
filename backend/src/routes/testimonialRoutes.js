const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  listTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require('../controllers/testimonialController');

const router = express.Router();
router.get('/', listTestimonials);
router.get('/:id', getTestimonial);
router.use(protect);
router.post('/', authorize(['Super Admin', 'Admin', 'Content Manager']), createTestimonial);
router.put('/:id', authorize(['Super Admin', 'Admin', 'Content Manager']), updateTestimonial);
router.delete('/:id', authorize(['Super Admin', 'Admin']), deleteTestimonial);

module.exports = router;