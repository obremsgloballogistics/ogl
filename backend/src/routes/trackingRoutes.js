const express = require('express');
const { getTrackingByNumber, createTrackingEvent } = require('../controllers/trackingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
router.get('/:trackingNumber', getTrackingByNumber);
router.post('/:trackingNumber/events', protect, authorize(['Super Admin', 'Admin', 'Operations Manager', 'Shipment Officer', 'Dispatcher', 'Ghana Manager', 'China Manager']), createTrackingEvent);

module.exports = router;