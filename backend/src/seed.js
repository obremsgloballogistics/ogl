const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require('./models/User');
const Customer = require('./models/Customer');
const Shipment = require('./models/Shipment');
const Quote = require('./models/Quote');
const Service = require('./models/Service');
const Route = require('./models/Route');
const FAQ = require('./models/FAQ');
const BlogPost = require('./models/BlogPost');
const Testimonial = require('./models/Testimonial');
const Media = require('./models/Media');
const SiteSettings = require('./models/SiteSettings');

const Invoice = require('./models/Invoice');
const AuditLog = require('./models/AuditLog');
const ShippingPreset = require('./models/ShippingPreset');
const { connectDatabase, disconnectDatabase } = require('./utils/db');

dotenv.config();

async function seed() {
  await connectDatabase();

  await Promise.all([
    User.deleteMany({}),
    Customer.deleteMany({}),
    Shipment.deleteMany({}),
    Quote.deleteMany({}),
    Service.deleteMany({}),
    Route.deleteMany({}),
    FAQ.deleteMany({}),
    BlogPost.deleteMany({}),
    Testimonial.deleteMany({}),
    Media.deleteMany({}),
    SiteSettings.deleteMany({}),
    Invoice.deleteMany({}),
    AuditLog.deleteMany({}),
    ShippingPreset.deleteMany({}),
  ]);

  await ShippingPreset.create([
    { name: 'UK → Ghana Air', origin: 'UK', destination: 'Ghana', shippingMethod: 'Air', currency: 'GBP', measurementType: 'Weight', weightUnit: 'KG', volumeUnit: 'CBM', pricingMethod: 'Per KG', rate: 8.5, isActive: true },
    { name: 'China → Ghana Air', origin: 'China', destination: 'Ghana', shippingMethod: 'Air', currency: 'USD', measurementType: 'Weight', weightUnit: 'KG', volumeUnit: 'CBM', pricingMethod: 'Per KG', rate: 10, isActive: true },
    { name: 'China → Ghana Sea', origin: 'China', destination: 'Ghana', shippingMethod: 'Sea', currency: 'USD', measurementType: 'Volume', weightUnit: 'KG', volumeUnit: 'CBM', pricingMethod: 'Per CBM', rate: 150, isActive: true },
    { name: 'Ghana Local Delivery', origin: 'Ghana', destination: 'Ghana', shippingMethod: 'Local Delivery', currency: 'GHS', measurementType: 'Weight', weightUnit: 'KG', volumeUnit: 'CBM', pricingMethod: 'Per KG', rate: 20, isActive: true },
  ]);

  const adminEmail = String(process.env.ADMIN_EMAIL || 'admin@obrems.com').trim().toLowerCase();
  if (!process.env.ADMIN_PASSWORD) {
    throw new Error('ADMIN_PASSWORD is required to seed the administrator');
  }
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
  const superAdmin = await User.create({
    name: 'John Mensah',
    email: adminEmail,
    password: adminPassword,
    role: 'Super Admin',
  });

  const customers = await Customer.create([
    { name: 'Ama Boateng', email: 'ama.boateng@example.com', phone: '+44 7700 900123', company: 'Boateng Importers', address: '14 Dover Road, London, UK', country: 'United Kingdom' },
    { name: 'Kofi Agyeman', email: 'kofi.agyeman@example.com', phone: '+233 24 555 9900', company: 'Accra Distributors', address: '8 Osu Street, Accra, Ghana', country: 'Ghana' },
    { name: 'Grace Bediako', email: 'grace.bediako@yahoo.com', phone: '+44 7911 123456', company: 'GB Electronics', address: '22 Victoria Square, Birmingham, UK', country: 'United Kingdom' },
  ]);

  const services = await Service.create([
    { title: 'Air Freight', description: 'Fast and reliable shipping from the UK to Ghana.', features: ['Priority air transport', 'Customs clearance support', 'Dedicated cargo handling'], route: 'UK → Ghana', transitTime: '3 - 5 Days', imageUrl: '/images/service-air.jpg', seoTitle: 'Air Freight UK to Ghana', seoDescription: 'Fast air freight service from the UK to Ghana.' },
    { title: 'Sea & Air Freight', description: 'Cost-effective shipping from China to Ghana.', features: ['Competitive rates', 'Combined shipment options', 'Flexible transit planning'], route: 'China → Ghana', transitTime: '15 - 25 Days', imageUrl: '/images/service-sea.jpg', seoTitle: 'Sea & Air Freight China to Ghana', seoDescription: 'Reliable sea and air freight from China to Ghana.' },
  ]);

  const routes = await Route.create([
    { origin: 'UK', destination: 'Ghana', shippingMethod: 'Air Freight', transitTime: '3 - 5 Days', description: 'Priority air cargo from London to Accra.' },
    { origin: 'China', destination: 'Ghana', shippingMethod: 'Sea & Air Freight', transitTime: '15 - 25 Days', description: 'Optimized sea and air route for China to Ghana shipments.' },
  ]);

  const faqs = await FAQ.create([
    { question: 'How can I track my shipment?', answer: 'Enter the tracking number on our Track Shipment page to get the latest status and location updates.' },
    { question: 'What documents are required for customs clearance?', answer: 'Standard paperwork includes commercial invoice, packing list, bill of lading, and any applicable permits for your cargo.' },
  ]);

  const blogPosts = await BlogPost.create([
    { title: 'Preparing Your Cargo for International Transport', slug: 'preparing-cargo-international-transport', excerpt: 'Learn how to prepare shipments for smooth customs clearance and reliable transport.', content: 'Content for blog post 1.', categories: ['Shipping'], featuredImage: '/images/blog-cargo.jpg', seoTitle: 'Preparing Cargo for International Transport', seoDescription: 'Tips for preparing cargo for international freight.' , published: true, publishedAt: new Date() },
    { title: 'Why Choose Door-to-Door Delivery in Ghana?', slug: 'door-to-door-delivery-ghana', excerpt: 'Door-to-door delivery ensures a seamless local final mile for your imported goods.', content: 'Content for blog post 2.', categories: ['Logistics'], featuredImage: '/images/blog-delivery.jpg', seoTitle: 'Door-to-Door Delivery in Ghana', seoDescription: 'Benefits of door-to-door delivery for international shipments.' , published: true, publishedAt: new Date() },
  ]);

  const testimonials = await Testimonial.create([
    { name: 'Linda Osei', company: 'Osei Retail', text: 'OBREMS provided excellent support and fast delivery for our UK imports.', rating: 5, photoUrl: '/images/testimonial-linda.jpg', published: true },
    { name: 'Michael Chen', company: 'Chen Trading', text: 'The China to Ghana route was managed efficiently with clear communication.', rating: 5, photoUrl: '/images/testimonial-michael.jpg', published: true },
  ]);

  const media = await Media.create([
    { label: 'Hero imagery', url: '/images/hero-media.jpg', type: 'image' },
  ]);

  const siteSettings = await SiteSettings.create({
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
    currency: 'GBP',
    timezone: 'UTC',
    paymentSettings: {
      bankName: 'Barclays Bank UK',
      accountName: 'OBREMS GLOBAL LOGISTICS LTD',
      accountNumber: '20491823',
      sortCode: '20-04-15',
      iban: 'GB29BARC20041520491823',
      swiftBic: 'BARCGB22',
      mobileMoneyName: 'OBREMS LOGISTICS GH',
      mobileMoneyNumber: '+233 24 555 9900 (MTN MoMo / Telecel Cash)',
      paymentInstructions: 'Please include your Invoice Number (e.g., OGL-INV-2026-000001) as the payment reference to ensure prompt reconciliation.',
    },
    socialLinks: [
      { platform: 'LinkedIn', url: 'https://www.linkedin.com', enabled: true },
      { platform: 'Facebook', url: 'https://www.facebook.com', enabled: true },
    ],
    homepageHero: {
      headline: 'Expert Shipping Services You Can Trust',
      subtitle: 'From the UK and China to Ghana by Air, Sea & Air.',
      description: 'Fast, reliable international shipping with customs support and real-time tracking.',
      buttonText: 'Track Shipment',
      buttonLink: '/tracking',
      secondaryButtonText: 'Get a Quote',
      secondaryButtonLink: '/quote',
      imageUrl: '/images/hero-media.jpg',
      secondaryImageUrl: '/images/hero-slide-2.jpg',
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
      imageUrl: '/images/freight-warehouse.jpg',
    },
    footer: {
      description: 'Reliable international shipping and freight forwarding for UK and China to Ghana.',
      copyright: '© 2026 OBREMS GLOBAL LOGISTICS. All Rights Reserved.',
      ctaText: 'Subscribe',
      navigation: [{ label: 'Home', url: '/' }, { label: 'About', url: '/about' }, { label: 'Services', url: '/services' }, { label: 'Tracking', url: '/tracking' }, { label: 'Quote', url: '/quote' }, { label: 'Contact', url: '/contact' }],
    },
    seo: {
      siteTitle: 'OBREMS GLOBAL LOGISTICS',
      metaTitle: 'OBREMS GLOBAL LOGISTICS | UK & China to Ghana Shipping',
      metaDescription: 'Reliable international shipping and freight forwarding from the UK and China to Ghana.',
      keywords: ['freight', 'shipping', 'ghana', 'logistics', 'air freight', 'sea freight'],
      ogTitle: 'OBREMS GLOBAL LOGISTICS',
      ogDescription: 'Trusted international shipping solutions for UK, China and Ghana.',
      canonicalUrl: 'https://www.obremsglobal.com',
    },
  });

  const shipments = await Shipment.create([
    {
      trackingNumber: 'OGL245678912UK',
      customer: customers[0]._id,
      assignedOfficer: superAdmin._id,
      origin: 'UK',
      destination: 'Ghana',
      shippingMethod: 'Air Freight',
      packageType: 'Electronics & Gadgets',
      weight: 12.5,
      dimensions: { length: 40, width: 30, height: 20 },
      shippingCost: 55,
      estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      currentLocation: 'London Heathrow Warehouse',
      status: 'In Transit',
      internalNotes: 'Priority customs clearance pre-filed.',
    },
    {
      trackingNumber: 'OGL245678913CN',
      customer: customers[1]._id,
      assignedOfficer: superAdmin._id,
      origin: 'China',
      destination: 'Ghana',
      shippingMethod: 'Sea & Air Freight',
      packageType: 'Commercial Machinery Parts',
      weight: 420,
      dimensions: { length: 200, width: 120, height: 140 },
      shippingCost: 650,
      estimatedDelivery: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      currentLocation: 'Guangzhou Port',
      status: 'Departed Origin',
      internalNotes: 'Documentation uploaded and customs pre-clearance started.',
    },
  ]);

  // Seed sample production-ready invoices
  const invoices = await Invoice.create([
    {
      invoiceNumber: 'OGL-INV-2026-000001',
      customer: customers[0]._id,
      shipment: shipments[0]._id,
      trackingNumber: shipments[0].trackingNumber,
      currency: 'GBP',
      items: [
        { description: 'Air Freight Shipment UK-Ghana (New Laptop x1)', quantity: 1, unitPrice: 55.0, amount: 55.0 },
        { description: 'Packaging/Handling Fee', quantity: 1, unitPrice: 0.0, amount: 0.0 },
      ],
      subtotal: 55.0,
      shippingFee: 0,
      handlingFee: 0,
      customsFee: 0,
      insuranceFee: 0,
      tax: 0,
      discount: 0,
      total: 55.0,
      amountPaid: 55.0,
      amountDue: 0,
      issueDate: new Date('2026-08-01'),
      dueDate: new Date('2026-08-15'),
      paymentMethod: 'Bank Transfer',
      paymentStatus: 'Paid',
      notes: 'Thank you for choosing OBREMS GLOBAL LOGISTICS. Shipment is currently in transit to Accra.',
      companyDetails: {
        companyName: 'OBREMS GLOBAL LOGISTICS',
        logoUrl: '',
        address: '123 Logistics Way, London',
        city: 'London',
        country: 'United Kingdom',
        registrationNumber: 'OGL-REG-847291',
        phone: '+44 7460 554358',
        whatsapp: '+44 7460 554358',
        email: 'billing@obremsgloballogistics.com',
        website: 'https://www.obremsglobal.com',
      },
      paymentDetails: {
        bankName: 'Barclays Bank UK',
        accountName: 'OBREMS GLOBAL LOGISTICS LTD',
        accountNumber: '20491823',
        sortCode: '20-04-15',
        iban: 'GB29BARC20041520491823',
        swiftBic: 'BARCGB22',
        mobileMoneyName: 'OBREMS LOGISTICS GH',
        mobileMoneyNumber: '+233 24 555 9900 (MTN MoMo / Telecel Cash)',
        paymentInstructions: 'Please include your Invoice Number as payment reference for fast clearance.',
      },
      shipmentDetails: {
        trackingNumber: 'OGL245678912UK',
        origin: 'UK',
        destination: 'Ghana',
        shippingMethod: 'Air Freight',
        packageDescription: 'Electronics & Gadgets (New Laptop x1)',
        weight: 12.5,
      },
      createdBy: superAdmin._id,
    },
    {
      invoiceNumber: 'OGL-INV-2026-000002',
      customer: customers[1]._id,
      shipment: shipments[1]._id,
      trackingNumber: shipments[1].trackingNumber,
      currency: 'USD',
      items: [
        { description: 'Sea Freight Cargo Transport (Guangzhou - Tema Port)', quantity: 1, unitPrice: 580.0, amount: 580.0 },
        { description: 'Port Handling & Storage Fee', quantity: 1, unitPrice: 70.0, amount: 70.0 },
      ],
      subtotal: 650.0,
      shippingFee: 0,
      handlingFee: 0,
      customsFee: 50.0,
      insuranceFee: 20.0,
      tax: 0,
      discount: 0,
      total: 720.0,
      amountPaid: 0,
      amountDue: 720.0,
      issueDate: new Date('2026-08-05'),
      dueDate: new Date('2026-08-25'),
      paymentMethod: 'Bank Transfer',
      paymentStatus: 'Pending',
      notes: 'Customs pre-clearance documents attached. Payment due upon arrival notification.',
      companyDetails: {
        companyName: 'OBREMS GLOBAL LOGISTICS',
        logoUrl: '',
        address: '123 Logistics Way, London',
        city: 'London',
        country: 'United Kingdom',
        registrationNumber: 'OGL-REG-847291',
        phone: '+44 7460 554358',
        whatsapp: '+44 7460 554358',
        email: 'billing@obremsgloballogistics.com',
        website: 'https://www.obremsglobal.com',
      },
      paymentDetails: {
        bankName: 'Barclays Bank UK',
        accountName: 'OBREMS GLOBAL LOGISTICS LTD',
        accountNumber: '20491823',
        sortCode: '20-04-15',
        iban: 'GB29BARC20041520491823',
        swiftBic: 'BARCGB22',
        mobileMoneyName: 'OBREMS LOGISTICS GH',
        mobileMoneyNumber: '+233 24 555 9900 (MTN MoMo / Telecel Cash)',
        paymentInstructions: 'Please include your Invoice Number as payment reference for fast clearance.',
      },
      shipmentDetails: {
        trackingNumber: 'OGL245678913CN',
        origin: 'China',
        destination: 'Ghana',
        shippingMethod: 'Sea & Air Freight',
        packageDescription: 'Commercial Machinery Parts',
        weight: 420,
      },
      createdBy: superAdmin._id,
    },
  ]);

  // Seed Audit Logs
  await AuditLog.create([
    {
      user: superAdmin._id,
      userName: 'John Mensah',
      userRole: 'Super Admin',
      action: 'Created Invoice',
      resource: 'Invoice',
      resourceId: invoices[0]._id.toString(),
      details: 'Generated invoice OGL-INV-2026-000001 for Ama Boateng (£55.00)',
      ipAddress: '197.251.18.90',
      createdAt: new Date('2026-08-01T10:15:00Z'),
    },
    {
      user: superAdmin._id,
      userName: 'John Mensah',
      userRole: 'Super Admin',
      action: 'Marked Invoice as Paid',
      resource: 'Invoice',
      resourceId: invoices[0]._id.toString(),
      details: 'Changed payment status of OGL-INV-2026-000001 to "Paid" via Bank Transfer',
      ipAddress: '197.251.18.90',
      createdAt: new Date('2026-08-02T14:30:00Z'),
    },
    {
      user: superAdmin._id,
      userName: 'John Mensah',
      userRole: 'Super Admin',
      action: 'Created Invoice',
      resource: 'Invoice',
      resourceId: invoices[1]._id.toString(),
      details: 'Generated invoice OGL-INV-2026-000002 for Kofi Agyeman ($720.00)',
      ipAddress: '197.251.18.90',
      createdAt: new Date('2026-08-05T09:20:00Z'),
    },
  ]);

  console.log('Database seeded successfully.');
  await disconnectDatabase();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
