const express = require('express');
const bcrypt = require('bcrypt');
const { models } = require('../utils/db');
const { protect, authorize } = require('../middleware/auth');
const { sendNewUserWelcomeEmail } = require('../utils/emailService');
const router = express.Router();

const VALID_PERMISSIONS = ['dashboard', 'shipments', 'qrCode', 'customers', 'quotes', 'invoices', 'content', 'contentServices', 'contentBlog', 'contentFaqs', 'contentTestimonials', 'assets', 'messages', 'analytics', 'activityLog', 'settings', 'users'];
const VALID_ROLES = ['Super Admin', 'Admin', 'UK Manager', 'Ghana Manager', 'China Manager', 'Ghana Customs Agent', 'Dispatcher', 'Operations Manager', 'Shipment Officer', 'Finance Officer', 'Customer Support', 'Content Manager', 'Media Manager'];
const cleanPermissions = (permissions) => Array.isArray(permissions)
  ? [...new Set(permissions.filter((permission) => VALID_PERMISSIONS.includes(permission)))]
  : [];
const canManageUsers = (req) => req.user.role === 'Super Admin' || (req.user.permissions || []).includes('users');
const requireUserManagement = (req, res, next) => canManageUsers(req)
  ? next()
  : res.status(403).json({ success: false, message: 'Users & Roles permission is required.' });

// Generate a random temporary password
function generateTempPassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// GET /api/users — list all staff users (admin only)
router.get('/', protect, requireUserManagement, async (req, res) => {
  try {
    const users = await models.User.find();
    const sanitized = users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      role: u.role,
      permissions: u.permissions || [],
      status: u.status || 'Active',
      mustChangePassword: u.mustChangePassword || false,
      createdAt: u.createdAt,
    }));
    res.json({ success: true, data: sanitized });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
});

// POST /api/users — create new staff user (admin only)
router.post('/', protect, requireUserManagement, async (req, res) => {
  try {
    const { name, email, phone, role, permissions } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ success: false, message: 'name, email, and role are required.' });
    }
    if (!VALID_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role assignment.' });
    }
    const existing = await models.User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'A user with this email already exists.' });
    }
    const tempPassword = generateTempPassword();
    const hashed = await bcrypt.hash(tempPassword, 10);
    const user = await models.User.create({
      name,
      email,
      phone: phone || '',
      role,
      password: hashed,
      mustChangePassword: true,
      status: 'Active',
      permissions: cleanPermissions(permissions),
    });
    let emailStatus = 'failed';
    try {
      const emailResult = await sendNewUserWelcomeEmail({
        to: user.email,
        name: user.name,
        role: user.role,
        temporaryPassword: tempPassword,
      });
      emailStatus = emailResult.simulated ? 'simulated' : 'sent';
    } catch (emailError) {
      console.error(`Failed to send welcome email to ${user.email}:`, emailError.message);
    }
    res.status(201).json({
      success: true,
      message: emailStatus === 'failed'
        ? `Staff account created for ${name}, but the welcome email could not be sent.`
        : `Staff account created for ${name}. Login details emailed successfully.`,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        permissions: user.permissions || [],
        temporaryPassword: tempPassword,
        emailStatus,
        mustChangePassword: true,
        status: 'Active',
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create user.' });
  }
});

// PATCH /api/users/:id — update role or status (admin only)
router.patch('/:id', protect, requireUserManagement, async (req, res) => {
  try {
    const { role, status, permissions } = req.body;
    const update = {};
    if (role) {
      if (!VALID_ROLES.includes(role)) return res.status(400).json({ success: false, message: 'Invalid role assignment.' });
      update.role = role;
    }
    if (status) update.status = status;
    if (permissions) update.permissions = cleanPermissions(permissions);
    const user = await models.User.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, message: 'User updated.', data: { id: user._id, role: user.role, status: user.status, permissions: user.permissions || [] } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update user.' });
  }
});

// DELETE /api/users/:id — remove user (admin only)
router.delete('/:id', protect, requireUserManagement, async (req, res) => {
  try {
    await models.User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User removed.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete user.' });
  }
});

// POST /api/users/change-password — authenticated user changes their own password
router.post('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Current password and a new password (min 8 characters) are required.' });
    }
    const user = await models.User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await models.User.findByIdAndUpdate(req.user.id, {
      password: hashed,
      temporaryPassword: null,
      mustChangePassword: false,
    }, { new: true });
    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to change password.' });
  }
});

module.exports = router;
