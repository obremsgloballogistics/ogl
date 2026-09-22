const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getSettings,
  updateSettings,
  uploadImage,
  upload,
} = require('../controllers/siteSettingsController');

const router = express.Router();
router.get('/', getSettings);
router.use(protect);
router.put('/', authorize(['Super Admin', 'Admin', 'Content Manager']), updateSettings);
router.post('/upload-image', authorize(['Super Admin', 'Admin', 'Content Manager']), upload.single('image'), uploadImage);

module.exports = router;