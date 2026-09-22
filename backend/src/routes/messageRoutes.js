const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  listMessages,
  getMessage,
  createMessage,
  updateMessage,
  deleteMessage,
  broadcast,
} = require('../controllers/messageController');

const router = express.Router();
router.post('/', createMessage);
router.use(protect);
router.post('/broadcast', authorize(['Super Admin', 'Admin']), broadcast);
router.get('/', authorize(['Super Admin', 'Admin', 'Customer Support']), listMessages);
router.get('/:id', authorize(['Super Admin', 'Admin', 'Customer Support']), getMessage);
router.put('/:id', authorize(['Super Admin', 'Admin', 'Customer Support']), updateMessage);
router.delete('/:id', authorize(['Super Admin', 'Admin']), deleteMessage);

module.exports = router;