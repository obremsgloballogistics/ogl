const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  listInvoices,
  getNextInvoiceNumber,
  getInvoice,
  getInvoicePdf,
  createInvoice,
  updateInvoice,
  updatePaymentStatus,
  deleteInvoice,
  sendInvoiceEmail,
  logInvoiceClientAction,
} = require('../controllers/invoiceController');

const router = express.Router();

router.use(protect);

router.get('/next-number', authorize(['Super Admin', 'Admin', 'Operations Manager']), getNextInvoiceNumber);
router.get('/', authorize(['Super Admin', 'Admin', 'Operations Manager', 'Customer Support']), listInvoices);
router.get('/:id', authorize(['Super Admin', 'Admin', 'Operations Manager', 'Customer Support']), getInvoice);
router.get('/:id/pdf', authorize(['Super Admin', 'Admin', 'Operations Manager', 'Customer Support']), getInvoicePdf);
router.post('/', authorize(['Super Admin', 'Admin', 'Operations Manager']), createInvoice);
router.put('/:id', authorize(['Super Admin', 'Admin', 'Operations Manager']), updateInvoice);
router.patch('/:id/status', authorize(['Super Admin', 'Admin', 'Operations Manager']), updatePaymentStatus);
router.post('/:id/send', authorize(['Super Admin', 'Admin', 'Operations Manager']), sendInvoiceEmail);
router.post('/:id/log-action', authorize(['Super Admin', 'Admin', 'Operations Manager', 'Customer Support']), logInvoiceClientAction);
router.delete('/:id', authorize(['Super Admin', 'Admin']), deleteInvoice);

module.exports = router;