const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  listServices,
  getService,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');

const router = express.Router();
router.get('/', listServices);
router.get('/:id', getService);
router.use(protect);
router.post('/', authorize(['Super Admin', 'Admin', 'Content Manager']), createService);
router.put('/:id', authorize(['Super Admin', 'Admin', 'Content Manager']), updateService);
router.delete('/:id', authorize(['Super Admin', 'Admin']), deleteService);

module.exports = router;