const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const controller = require('../controllers/shippingPresetController');

const router = express.Router();
const manage = authorize(['Super Admin', 'Admin', 'Operations Manager']);
router.get('/', protect, controller.listPresets);
router.get('/:id', protect, controller.getPreset);
router.post('/', protect, manage, controller.createPreset);
router.put('/:id', protect, manage, controller.updatePreset);
router.delete('/:id', protect, manage, controller.deletePreset);

module.exports = router;
