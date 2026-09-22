const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');

const router = express.Router();
router.use(protect);

router.get('/', authorize(['Super Admin', 'Admin', 'Operations Manager', 'Customer Support']), listCustomers);
router.get('/:id', authorize(['Super Admin', 'Admin', 'Operations Manager', 'Customer Support']), getCustomer);
router.post('/', authorize(['Super Admin', 'Admin', 'Operations Manager', 'Customer Support']), createCustomer);
router.put('/:id', authorize(['Super Admin', 'Admin', 'Operations Manager', 'Customer Support']), updateCustomer);
router.delete('/:id', authorize(['Super Admin', 'Admin']), deleteCustomer);

module.exports = router;