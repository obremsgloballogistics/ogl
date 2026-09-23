const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');
const customerRoutes = require('./routes/customerRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const routeRoutes = require('./routes/routeRoutes');
const faqRoutes = require('./routes/faqRoutes');
const blogRoutes = require('./routes/blogRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const siteSettingsRoutes = require('./routes/siteSettingsRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const messageRoutes = require('./routes/messageRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const documentRoutes = require('./routes/documentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const auditRoutes = require('./routes/auditRoutes');
const userRoutes = require('./routes/userRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const shippingPresetRoutes = require('./routes/shippingPresetRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const { protect } = require('./middleware/auth');
const { sanitizeRequest } = require('./middleware/sanitize');
const { models, connectDatabase } = require('./utils/db');

dotenv.config();

const app = express();
app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: false,
}));
app.use(
  cors({
    origin: (origin, callback) => {
      const configuredOrigins = (process.env.CORS_ORIGINS || '').split(',').map((value) => value.trim()).filter(Boolean);
      if (!origin || configuredOrigins.includes(origin) || (process.env.NODE_ENV !== 'production' && configuredOrigins.length === 0)) return callback(null, true);
      return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(sanitizeRequest);
app.use(morgan('dev'));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads'), {
  maxAge: '1y',
  immutable: true,
}));

const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  max: Number(process.env.RATE_LIMIT_MAX) || 60,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/settings', siteSettingsRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/shipping-presets', shippingPresetRoutes);

// Apply section permissions after each protected route has populated req.user.

app.use(errorHandler);

const PORT = process.env.PORT || 4000;

// Initialize default data
async function startServer() {
  await connectDatabase();
  const settings = await models.SiteSettings.findOne();
  if (!settings) await models.SiteSettings.create({});

  const adminEmail = String(process.env.ADMIN_EMAIL || 'admin@obrems.com').trim().toLowerCase();
  const admin = await models.User.findOne({ email: adminEmail });
  if (!admin) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('ADMIN_PASSWORD is required to bootstrap the first administrator');
      }
      console.warn(`Admin account ${adminEmail} was not created because ADMIN_PASSWORD is not configured.`);
    } else {
      const bcrypt = require('bcrypt');
      const hashed = await bcrypt.hash(adminPassword, 12);
      await models.User.create({ name: 'John Mensah', email: adminEmail, password: hashed, role: 'Super Admin', active: true, status: 'Active' });
      console.log(`Bootstrap administrator created: ${adminEmail}`);
    }
  }
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error(`Backend startup failed: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = { app, startServer };
