const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  listDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
} = require('../controllers/documentController');

const router = express.Router();
router.use(protect);
router.get('/', authorize(['Super Admin', 'Admin', 'Operations Manager', 'Shipment Officer']), listDocuments);
router.get('/:id', authorize(['Super Admin', 'Admin', 'Operations Manager', 'Shipment Officer']), getDocument);
router.post('/', authorize(['Super Admin', 'Admin', 'Operations Manager']), createDocument);
router.put('/:id', authorize(['Super Admin', 'Admin', 'Operations Manager']), updateDocument);
router.delete('/:id', authorize(['Super Admin', 'Admin']), deleteDocument);

module.exports = router;