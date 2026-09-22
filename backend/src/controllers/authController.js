const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

function createToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return jwt.sign({ id: userId }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

async function login(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }
  const user = await User.findOne({ email: String(email).trim().toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  if (user.active === false || user.status === 'Inactive' || user.status === 'Suspended') {
    return res.status(403).json({ success: false, message: 'This account is inactive. Contact an administrator.' });
  }
  const token = createToken(user._id);
  res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role, permissions: user.permissions || [], mustChangePassword: !!user.mustChangePassword } });
}

function getProfile(req, res) {
  res.json({ success: true, user: req.user });
}

module.exports = { login, getProfile };