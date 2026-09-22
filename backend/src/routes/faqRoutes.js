const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  listFaqs,
  getFaq,
  createFaq,
  updateFaq,
  deleteFaq,
} = require('../controllers/faqController');

const router = express.Router();
router.get('/', listFaqs);
router.get('/:id', getFaq);
router.use(protect);
router.post('/', authorize(['Super Admin', 'Admin', 'Content Manager']), createFaq);
router.put('/:id', authorize(['Super Admin', 'Admin', 'Content Manager']), updateFaq);
router.delete('/:id', authorize(['Super Admin', 'Admin']), deleteFaq);

module.exports = router;