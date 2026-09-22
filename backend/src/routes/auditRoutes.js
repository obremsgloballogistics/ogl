const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { listAuditLogs } = require('../controllers/auditController');

const router = express.Router();
router.use(protect);
router.get('/', authorize(['Super Admin', 'Admin']), listAuditLogs);

module.exports = router;