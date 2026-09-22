const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  listShipments,
  getShipment,
  createShipment,
  updateShipment,
  deleteShipment,
  searchShipments,
} = require('../controllers/shipmentController');

const router = express.Router();
router.use(protect);

router.get('/', authorize(['Super Admin', 'Admin', 'Operations Manager', 'Shipment Officer']), listShipments);
router.get('/search', authorize(['Super Admin', 'Admin', 'Operations Manager', 'Shipment Officer']), searchShipments);
router.get('/:id', authorize(['Super Admin', 'Admin', 'Operations Manager', 'Shipment Officer']), getShipment);
router.post('/', authorize(['Super Admin', 'Admin', 'Operations Manager', 'Shipment Officer']), createShipment);
router.put('/:id', authorize(['Super Admin', 'Admin', 'Operations Manager', 'Shipment Officer']), updateShipment);
router.delete('/:id', authorize(['Super Admin', 'Admin']), deleteShipment);

module.exports = router;