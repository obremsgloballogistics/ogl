const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  listMedia,
  uploadMedia,
  deleteMedia,
} = require('../controllers/mediaController');

const router = express.Router();
router.get('/', listMedia);
router.use(protect);
router.post('/', authorize(['Super Admin', 'Admin', 'Content Manager']), uploadMedia);
router.delete('/:id', authorize(['Super Admin', 'Admin']), deleteMedia);

module.exports = router;