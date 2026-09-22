const Shipment = require('../models/Shipment');
const TrackingEvent = require('../models/TrackingEvent');
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const { generateInvoicePDF, formatCurrency, formatDate } = require('../utils/pdfService');
const { sendInvoicePdfEmail } = require('../utils/emailService');
const ShippingPreset = require('../models/ShippingPreset');
const { calculateShipping, createPresetSnapshot } = require('../utils/pricingService');

async function applyPresetPricing(body) {
  if (!body.shippingPresetId) return body;
  const preset = await ShippingPreset.findById(body.shippingPresetId);
  if (!preset || !preset.isActive) throw new Error('The selected shipping preset is inactive or unavailable.');
  const pricing = calculateShipping(preset, body);
  return {
    ...body,
    currency: preset.currency,
    shippingMethod: body.shippingMethod || preset.shippingMethod,
    weightUnit: body.weightUnit || preset.weightUnit,
    dimensionUnit: body.dimensionUnit || preset.dimensionUnit,
    volumeCbm: pricing.volumeCbm,
    shippingCost: pricing.total,
    amountDue: body.amountDue || pricing.total,
    cbmRate: preset.pricingMethod === 'Per CBM' ? preset.rate : 0,
    weightRate: preset.pricingMethod === 'Per KG' ? preset.rate : 0,
    pricingBreakdown: pricing,
    shippingPresetSnapshot: createPresetSnapshot(preset),
  };
}

async function emailInvoiceAfterDelivery(shipment) {
  const invoice = await Invoice.findOne({ shipment: shipment._id });
  if (!invoice || invoice.invoiceDeliveryEmailSentAt) return;

  const customer = invoice.customer ? await Customer.findById(invoice.customer) : null;
  const customerEmail = customer?.email;
  if (!customerEmail) {
    console.warn(`[Shipment] Delivered shipment ${shipment.trackingNumber} has no customer email for invoice ${invoice.invoiceNumber}`);
    return;
  }

  const invoiceForPdf = { ...invoice, customer, shipment };
  const pdfBuffer = await generateInvoicePDF(invoiceForPdf);
  await sendInvoicePdfEmail({
    to: customerEmail,
    customerName: customer.name || 'Valued Customer',
    invoiceNumber: invoice.invoiceNumber,
    amountDue: formatCurrency(invoice.amountDue ?? invoice.total, invoice.currency),
    dueDate: formatDate(invoice.dueDate),
    pdfBuffer,
    deliveryNotice: true,
  });
  await Invoice.findByIdAndUpdate(invoice._id, { invoiceDeliveryEmailSentAt: new Date().toISOString() });
}

async function listShipments(req, res) {
  const query = {};
  if (req.query.status) query.status = req.query.status;
  if (req.query.search) query.trackingNumber = { $regex: req.query.search, $options: 'i' };
  const shipments = await Shipment.find(query).populate('customer assignedOfficer').sort({ createdAt: -1 });
  res.json({ success: true, data: shipments });
}

async function getShipment(req, res) {
  const shipment = await Shipment.findById(req.params.id)
    .populate('customer assignedOfficer documents')
    .lean();
  if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });
  const events = await TrackingEvent.find({ shipment: shipment._id }).sort({ eventDate: 1 });
  res.json({ success: true, data: { ...shipment, events } });
}

async function createShipment(req, res) {
  let body = { ...req.body };
  try { body = await applyPresetPricing(body); } catch (error) { return res.status(400).json({ success: false, message: error.message }); }

  // Auto-generate OGL tracking number if not provided
  if (!body.trackingNumber) {
    const origin = (body.origin || '').toLowerCase();
    let suffix = 'UK';
    if (origin.includes('china') || origin.includes('guangzhou') || origin.includes('shanghai') || origin.includes('beijing') || origin.includes('shenzhen') || origin.includes('yiwu')) {
      suffix = 'CN';
    } else if (origin.includes('ghana') || origin.includes('accra') || origin.includes('kumasi') || origin.includes('tema') || origin.includes('takoradi')) {
      suffix = 'GH';
    }
    const digits = Math.floor(10000000 + Math.random() * 90000000).toString();
    body.trackingNumber = `OGL${digits}${suffix}`;
  }

  const shipment = await Shipment.create(body);
  await shipment.populate('customer assignedOfficer');
  res.status(201).json({ success: true, data: shipment });
}

async function updateShipment(req, res) {
  const previous = await Shipment.findById(req.params.id);
  let body = { ...req.body };
  try { body = await applyPresetPricing(body); } catch (error) { return res.status(400).json({ success: false, message: error.message }); }
  const shipment = await Shipment.findByIdAndUpdate(req.params.id, body, { new: true });
  if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });
  await shipment.populate('customer assignedOfficer');

  const becameDelivered = shipment.status === 'Delivered' && previous?.status !== 'Delivered';
  if (becameDelivered) {
    emailInvoiceAfterDelivery(shipment).catch((error) => {
      console.error('[Shipment] Delivery invoice email failed:', error.message);
    });
  }

  res.json({ success: true, data: shipment });
}

async function deleteShipment(req, res) {
  const shipment = await Shipment.findByIdAndDelete(req.params.id);
  if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });
  res.json({ success: true, message: 'Shipment deleted' });
}

async function searchShipments(req, res) {
  const search = req.query.q || '';
  const shipments = await Shipment.find({ trackingNumber: { $regex: search, $options: 'i' } }).limit(25);
  res.json({ success: true, data: shipments });
}

module.exports = { listShipments, getShipment, createShipment, updateShipment, deleteShipment, searchShipments };