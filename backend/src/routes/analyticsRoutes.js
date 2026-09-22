const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getAnalytics } = require('../controllers/analyticsController');

const router = express.Router();
router.use(protect);
router.get('/', authorize(['Super Admin', 'Admin', 'Operations Manager']), getAnalytics);

module.exports = router;