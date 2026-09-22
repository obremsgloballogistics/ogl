const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'Not authorized' });
    if (user.active === false || user.status === 'Inactive' || user.status === 'Suspended') {
      return res.status(403).json({ success: false, message: 'This account is inactive.' });
    }
    req.user = user;
    const section = SECTION_BY_API_PATH[req.baseUrl];
    if (req.baseUrl === '/api/users' && req.path === '/change-password') {
      return next();
    }
    const permissions = user.permissions || [];
    const contentPermission = section?.startsWith('content') && permissions.includes('content');
    const qrShipmentPermission = section === 'shipments' && permissions.includes('qrCode');
    if (section && user.role !== 'Super Admin' && !permissions.includes(section) && !contentPermission && !qrShipmentPermission) {
      return res.status(403).json({ success: false, message: `Access to ${section} is not permitted.` });
    }
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

function authorize(roles = []) {
  if (typeof roles === 'string') roles = [roles];
  return (req, res, next) => {
    if (!roles.length || roles.includes(req.user.role)) {
      return next();
    }
    return res.status(403).json({ success: false, message: 'Forbidden' });
  };
}

const SECTION_BY_API_PATH = {
  '/api/shipments': 'shipments',
  '/api/tracking': 'shipments',
  '/api/documents': 'shipments',
  '/api/customers': 'customers',
  '/api/quotes': 'quotes',
  '/api/invoices': 'invoices',
  '/api/services': 'contentServices',
  '/api/routes': 'contentServices',
  '/api/blog': 'contentBlog',
  '/api/faqs': 'contentFaqs',
  '/api/testimonials': 'contentTestimonials',
  '/api/media': 'assets',
  '/api/messages': 'messages',
  '/api/analytics': 'analytics',
  '/api/audit': 'activityLog',
  '/api/settings': 'settings',
  '/api/users': 'users',
  '/api/shipping-presets': 'contentServices',
};

function authorizeSection(section) {
  return (req, res, next) => {
    if (req.user.role === 'Super Admin' || (req.user.permissions || []).includes(section)) {
      return next();
    }
    return res.status(403).json({ success: false, message: `Access to ${section} is not permitted.` });
  };
}

module.exports = { protect, authorize, authorizeSection };
