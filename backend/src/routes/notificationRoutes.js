const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  listNotifications,
  createNotification,
  deleteNotification,
} = require('../controllers/notificationController');

const router = express.Router();
router.use(protect, authorize(['Super Admin', 'Admin']));
router.get('/', listNotifications);
router.post('/', createNotification);
router.delete('/:id', deleteNotification);

module.exports = router;
