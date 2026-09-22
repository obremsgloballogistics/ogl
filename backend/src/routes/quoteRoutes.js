const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  listQuotes,
  getQuote,
  createQuote,
  updateQuote,
  deleteQuote,
} = require('../controllers/quoteController');

const router = express.Router();

router.post('/', createQuote);
router.use(protect);

router.get('/', authorize(['Super Admin', 'Admin', 'Operations Manager', 'Customer Support']), listQuotes);
router.get('/:id', authorize(['Super Admin', 'Admin', 'Operations Manager', 'Customer Support']), getQuote);
router.put('/:id', authorize(['Super Admin', 'Admin', 'Operations Manager', 'Customer Support']), updateQuote);
router.delete('/:id', authorize(['Super Admin', 'Admin']), deleteQuote);

module.exports = router;