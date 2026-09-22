const SiteSettings = require('../models/SiteSettings');
const { createAuditLogEntry } = require('./auditController');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const { v2: cloudinary } = require('cloudinary');

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
    const allowedExtensions = new Set(['.jpeg', '.jpg', '.png', '.gif', '.webp']);
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, allowedTypes.has(file.mimetype) && allowedExtensions.has(extension));
  },
});

const defaultSettings = {
  companyName: 'OBREMS GLOBAL LOGISTICS',
  registrationNumber: 'OGL-REG-847291',
  website: 'https://www.obremsglobal.com',
  logoUrl: '',
  faviconUrl: '',
  primaryEmail: 'info@obremsgloballogistics.com',
  billingEmail: 'billing@obremsgloballogistics.com',
  supportEmail: 'support@obremsgloballogistics.com',
  contactPhone: '+44 7460 554358',
  contactWhatsApp: '+44 7460 554358',
  officeUk: '123 Logistics Way, London, UK',
  officeChina: 'Guangzhou, China',
  officeGhana: 'Accra, Greater Accra Region, Ghana',
  companyAddress: '123 Logistics Way, London, UK',
  companyCity: 'London',
  companyCountry: 'United Kingdom',
  businessHours: 'Mon - Fri, 08:00 - 18:00',
  timezone: 'UTC',
  currency: 'GBP',
  currencyRates: {
    GBP_GHS: 15.2, GBP_CNY: 9.1, GBP_USD: 1.27, GBP_EUR: 1.17,
    GHS_CNY: 0.6, GHS_USD: 0.084, GHS_EUR: 0.077,
    CNY_GHS: 1.67, CNY_GBP: 0.11, CNY_EUR: 0.129,
    USD_GHS: 11.9, USD_GBP: 0.79, USD_EUR: 0.92,
    EUR_GBP: 0.85, EUR_GHS: 12.95, EUR_CNY: 7.78,
  },
  shippingRates: {
    GBP: { perKg: 0, perCbm: 0 },
    GHS: { perKg: 0, perCbm: 0 },
    CNY: { perKg: 0, perCbm: 0 },
    USD: { perKg: 0, perCbm: 0 },
    EUR: { perKg: 0, perCbm: 0 },
  },
  shippingPreferences: { currency: 'GBP', weightUnit: 'kg', dimensionUnit: 'cm' },
  paymentSettings: {
    bankName: 'Barclays Bank UK',
    accountName: 'OBREMS GLOBAL LOGISTICS LTD',
    accountNumber: '20491823',
    sortCode: '20-04-15',
    iban: 'GB29BARC20041520491823',
    swiftBic: 'BARCGB22',
    mobileMoneyName: 'OBREMS LOGISTICS GH',
    mobileMoneyNumber: '+233 24 555 9900 (MTN MoMo / Telecel Cash)',
    paymentInstructions:
      'Please use your Invoice Number (e.g., OGL-INV-2026-000001) as the payment reference to ensure prompt reconciliation.',
  },
  socialLinks: [
    { platform: 'Facebook', url: 'https://facebook.com/obremsglobal', enabled: true },
    { platform: 'Instagram', url: 'https://instagram.com/obremsglobal', enabled: true },
    { platform: 'LinkedIn', url: 'https://linkedin.com/company/obremsglobal', enabled: true },
    { platform: 'X', url: 'https://x.com/obremsglobal', enabled: true },
    { platform: 'YouTube', url: 'https://youtube.com/obremsglobal', enabled: true },
    { platform: 'TikTok', url: 'https://tiktok.com/@obremsglobal', enabled: true },
  ],
  facebookUrl: 'https://facebook.com/obremsglobal',
  instagramUrl: 'https://instagram.com/obremsglobal',
  linkedinUrl: 'https://linkedin.com/company/obremsglobal',
  twitterUrl: 'https://x.com/obremsglobal',
  youtubeUrl: 'https://youtube.com/obremsglobal',
  tiktokUrl: 'https://tiktok.com/@obremsglobal',
  snapchatUrl: 'https://snapchat.com/add/obremsglobal',
  contactEmail: 'info@obremsgloballogistics.com',
  homepageHero: {
    headline: 'Expert Shipping Services You Can Trust',
    subtitle: 'RELIABLE. FAST. GLOBAL.',
    description: 'UK → Ghana, Ghana → UK and China → Ghana freight solutions with secure tracking and customs support.',
    buttonText: 'Track Shipment',
    buttonLink: '/tracking',
    secondaryButtonText: 'Get a Quote',
    secondaryButtonLink: '/quote',
    imageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1600&q=80',
    secondaryImageUrl: 'https://images.pexels.com/photos/358319/pexels-photo-358319.jpeg?auto=compress&cs=tinysrgb&w=1600',
    trustText: 'Trusted by businesses and families across Ghana and the UK.',
    stats: [
      { value: '500+', label: 'Shipments Delivered', icon: 'Package', active: true, order: 1 },
      { value: '20+', label: 'Countries Served', icon: 'Globe', active: true, order: 2 },
      { value: '10+', label: 'Years Experience', icon: 'Users', active: true, order: 3 },
      { value: '98%', label: 'Customer Satisfaction', icon: 'ShieldCheck', active: true, order: 4 },
    ],
  },
  about: {
    title: 'Delivering Excellence Across Oceans & Skies',
    intro: 'OBREMS GLOBAL LOGISTICS provides reliable shipping solutions from the UK and China to Ghana.',
    description: 'We manage every aspect of the supply chain from warehouse consolidation to customs documentation and door-to-door services across Ghana.',
    mission: 'To deliver dependable, transparent global logistics services for businesses and individuals.',
    vision: 'To become the most reliable freight forwarding brand in West Africa.',
    story: 'Founded to simplify international logistics between the UK, China and Ghana.',
    ctaText: 'Ready to ship with OBREMS?',
    buttonText: 'Get a Quote',
    imageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1600&q=80',
  },
  servicesPage: {
    title: 'Expert Shipping Solutions',
    description: 'Air freight, sea cargo, customs clearance and door-to-door delivery for UK and China to Ghana routes.',
    ctaText: 'Get Quote',
  },
  contact: {
    title: 'Get in Touch With Our Team',
    description: 'Questions about freight and customs support? We are ready to help.',
    email: 'info@obremsgloballogistics.com',
    phone: '+44 7460 554358',
    whatsapp: '+44 7460 554358',
    address: 'London, UK',
    businessHours: 'Mon - Fri, 08:00 - 18:00',
    mapUrl: '',
    formTitle: 'Send Us a Message',
    ctaText: 'Send Message',
  },
  footer: {
    description: 'Reliable international shipping and freight forwarding from the UK and China to Ghana.',
    copyright: '© 2026 OBREMS GLOBAL LOGISTICS. All Rights Reserved.',
    ctaText: 'Subscribe',
    navigation: [
      { label: 'Home', url: '/' },
      { label: 'About', url: '/about' },
      { label: 'Services', url: '/services' },
      { label: 'Tracking', url: '/tracking' },
      { label: 'Quote', url: '/quote' },
      { label: 'Contact', url: '/contact' },
    ],
  },
  seo: {
    siteTitle: 'OBREMS GLOBAL LOGISTICS',
    metaTitle: 'OBREMS GLOBAL LOGISTICS | UK & China to Ghana Shipping',
    metaDescription: 'Reliable international shipping and freight forwarding from the UK and China to Ghana.',
    keywords: ['freight', 'shipping', 'ghana', 'logistics', 'air freight', 'sea freight'],
    ogTitle: 'OBREMS GLOBAL LOGISTICS',
    ogDescription: 'Trusted international shipping solutions for UK, China and Ghana.',
    ogImage: '',
    twitterImage: '',
    canonicalUrl: 'https://www.obremsglobal.com',
    robots: 'index,follow',
  },
  announcement: {
    enabled: false,
    text: 'Now shipping from the UK to Ghana.',
    buttonText: 'Learn More',
    buttonUrl: '/services',
    startsAt: null,
    endsAt: null,
  },
  officeLocations: [],
  contactMethods: [],
  advertBanner: { enabled: false, title: '', text: '', imageUrl: '', buttonText: '', buttonUrl: '' },
  isUnderMaintenance: false,
  maintenanceMessage: '',
  enabledModules: ['home', 'about', 'services', 'tracking', 'blog', 'faq', 'contact'],
  heroImageUrl: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1600&q=80',
  heroImageUrl2: 'https://images.pexels.com/photos/358319/pexels-photo-358319.jpeg?auto=compress&cs=tinysrgb&w=1600',
  heroImageUrl3: 'https://images.pexels.com/photos/1554646/pexels-photo-1554646.jpeg?auto=compress&cs=tinysrgb&w=1600',
  heroImageUrl4: 'https://images.pexels.com/photos/4391470/pexels-photo-4391470.jpeg?auto=compress&cs=tinysrgb&w=1600',
  ctaBannerImageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1600&q=80',
  contactHeroImageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1600&q=80',
  contactAccraOfficeImageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
  contactKumasiOfficeImageUrl: 'https://images.unsplash.com/photo-1578315853201-44cd7ed7e025?auto=format&fit=crop&w=800&q=80',
  aboutHeroImageUrl: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1600&q=80',
  missionImageUrl: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80',
  visionImageUrl: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80',
  aboutCtaImageUrl: 'https://images.pexels.com/photos/4391470/pexels-photo-4391470.jpeg?auto=compress&cs=tinysrgb&w=1600',
  quoteHeroImageUrl: 'https://images.pexels.com/photos/1554646/pexels-photo-1554646.jpeg?auto=compress&cs=tinysrgb&w=1600',
  trackHeroImageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80',
  heroHeadline: 'Expert Shipping Services You Can Trust',
  heroSubtitle: 'From the UK and China to Ghana by Air, Sea & Air.',
  footerText: 'Reliable international shipping and freight forwarding from the UK and China to Ghana.',
  aboutText: 'OBREMS GLOBAL LOGISTICS is a leading international shipping and freight forwarding company.',
};

function mergeDefaults(settings = {}) {
  return {
    ...defaultSettings,
    ...settings,
    paymentSettings: {
      ...defaultSettings.paymentSettings,
      ...(settings.paymentSettings || {}),
    },
    shippingRates: Object.keys(defaultSettings.shippingRates).reduce((rates, currency) => ({
      ...rates,
      [currency]: {
        ...defaultSettings.shippingRates[currency],
        ...((settings.shippingRates || {})[currency] || {}),
      },
    }), {}),
    shippingPreferences: {
      ...defaultSettings.shippingPreferences,
      ...(settings.shippingPreferences || {}),
    },
    homepageHero: { ...defaultSettings.homepageHero, ...(settings.homepageHero || {}) },
    about: { ...defaultSettings.about, ...(settings.about || {}) },
    servicesPage: { ...defaultSettings.servicesPage, ...(settings.servicesPage || {}) },
    contact: { ...defaultSettings.contact, ...(settings.contact || {}) },
    footer: { ...defaultSettings.footer, ...(settings.footer || {}) },
    seo: { ...defaultSettings.seo, ...(settings.seo || {}) },
    announcement: { ...defaultSettings.announcement, ...(settings.announcement || {}) },
    advertBanner: { ...defaultSettings.advertBanner, ...(settings.advertBanner || {}) },
    officeLocations: Array.isArray(settings.officeLocations) ? settings.officeLocations : defaultSettings.officeLocations,
    contactMethods: Array.isArray(settings.contactMethods) ? settings.contactMethods : defaultSettings.contactMethods,
    socialLinks: Array.isArray(settings.socialLinks) ? settings.socialLinks : defaultSettings.socialLinks,
  };
}

async function getSettings(req, res) {
  try {
    res.set('Cache-Control', 'no-store, max-age=0');
    const settings = await SiteSettings.findOne();
    res.json({ success: true, data: mergeDefaults(settings ? (typeof settings.toObject === 'function' ? settings.toObject() : settings) : {}) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function updateSettings(req, res) {
  try {
    const payload = { ...mergeDefaults(req.body), contentVersion: new Date().toISOString() };
    const prev = await SiteSettings.findOne();
    const settings = await SiteSettings.findOneAndUpdate({}, payload, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    await createAuditLogEntry({
      user: req.user?._id,
      userName: req.user?.name || 'Administrator',
      userRole: req.user?.role || 'Super Admin',
      action: 'Updated Business & Payment Settings',
      resource: 'Settings',
      details: 'Modified company information and payment details',
      ipAddress: req.ip || '127.0.0.1',
    });

    res.set('Cache-Control', 'no-store, max-age=0');
    res.json({ success: true, data: mergeDefaults(settings ? (typeof settings.toObject === 'function' ? settings.toObject() : settings) : {}) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function uploadImage(req, res) {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const hasCloudinary = Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
    if (hasCloudinary) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
          folder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'obrems-global-logistics',
          resource_type: 'image',
          format: 'webp',
          transformation: [{ width: 2400, height: 1600, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
        }, (error, uploaded) => error ? reject(error) : resolve(uploaded));
        stream.end(req.file.buffer);
      });
      const uploaded = result;
      res.set('Cache-Control', 'no-store, max-age=0');
      return res.json({ success: true, url: uploaded.secure_url, imageUrl: uploaded.secure_url, imagePublicId: uploaded.public_id, provider: 'cloudinary', mimeType: 'image/webp', fileSize: req.file.size });
    }
    const originalExt = path.extname(req.file.originalname).toLowerCase();
    const filename = `img_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    let outputName = `${filename}.webp`;
    let outputBuffer;
    let mimeType = 'image/webp';

    if (originalExt === '.svg') {
      outputName = `${filename}.svg`;
      outputBuffer = req.file.buffer;
      mimeType = 'image/svg+xml';
    } else {
      outputBuffer = await sharp(req.file.buffer)
        .rotate()
        .resize({ width: 2400, height: 1600, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
    }

    await fs.promises.writeFile(path.join(uploadDir, outputName), outputBuffer);
    const relativeUrl = `/uploads/${outputName}`;
    const url = process.env.BASE_URL ? `${process.env.BASE_URL}${relativeUrl}` : relativeUrl;
    res.set('Cache-Control', 'no-store, max-age=0');
    res.json({
      success: true,
      url,
      imageUrl: url,
      imagePublicId: outputName,
      mimeType,
      fileSize: outputBuffer.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = { getSettings, updateSettings, uploadImage, upload, defaultSettings };