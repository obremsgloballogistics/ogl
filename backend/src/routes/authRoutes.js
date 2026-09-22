const express = require('express');
const { login, getProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiters');
const router = express.Router();

router.post('/login', loginLimiter, login);
router.get('/profile', protect, getProfile);

module.exports = router;