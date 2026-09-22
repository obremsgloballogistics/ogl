const ShippingPreset = require('../models/ShippingPreset');
const { createAuditLogEntry } = require('./auditController');
const { validatePreset } = require('../utils/pricingService');

const METHODS = ['Air', 'Sea', 'Local Delivery', 'Other'];
const CURRENCIES = ['GBP', 'USD', 'GHS', 'CNY', 'EUR'];
const PRICING_METHODS = ['Per KG', 'Per CBM', 'Fixed Delivery Fee', 'Per Shipment'];
const MEASUREMENT_TYPES = ['Weight', 'Volume', 'Fixed'];
const WEIGHT_UNITS = ['KG', 'LB', 'G'];
const DIMENSION_UNITS = ['CM', 'M', 'IN', 'FT'];

function numeric(value) { return Number(value) || 0; }
function normalize(body = {}) {
  return {
    name: String(body.name || '').trim(),
    origin: String(body.origin || '').trim(),
    destination: String(body.destination || '').trim(),
    shippingMethod: body.shippingMethod || 'Other',
    currency: body.currency || 'GBP',
    measurementType: body.measurementType || 'Weight',
    weightUnit: body.weightUnit || '',
    dimensionUnit: body.dimensionUnit || '',
    volumeUnit: body.volumeUnit || 'CBM',
    pricingMethod: body.pricingMethod || 'Per KG',
    rate: numeric(body.rate),
    minimumCharge: numeric(body.minimumCharge),
    fixedDeliveryFee: numeric(body.fixedDeliveryFee),
    additionalHandlingFee: numeric(body.additionalHandlingFee),
    insuranceFee: numeric(body.insuranceFee),
    customsFee: numeric(body.customsFee),
    tax: numeric(body.tax),
    discount: numeric(body.discount),
    isActive: body.isActive !== false,
    description: String(body.description || '').trim(),
  };
}
function validateInput(preset) {
  validatePreset(preset);
  if (!METHODS.includes(preset.shippingMethod)) throw new Error('Invalid shipping method.');
  if (!CURRENCIES.includes(preset.currency) && !String(preset.currency).trim()) throw new Error('Invalid currency.');
  if (!MEASUREMENT_TYPES.includes(preset.measurementType)) throw new Error('Invalid measurement type.');
  if (!PRICING_METHODS.includes(preset.pricingMethod)) throw new Error('Invalid pricing method.');
  if (preset.pricingMethod === 'Per KG' && !WEIGHT_UNITS.includes(preset.weightUnit)) throw new Error('Select a valid weight unit for Per KG.');
  if (preset.pricingMethod === 'Per CBM' && preset.volumeUnit !== 'CBM') throw new Error('Per CBM requires CBM as the volume unit.');
  if (preset.dimensionUnit && !DIMENSION_UNITS.includes(preset.dimensionUnit)) throw new Error('Invalid dimension unit.');
  return preset;
}
async function audit(req, action, preset, previousValue = {}, newValue = {}) {
  await createAuditLogEntry({ user: req.user?._id, userName: req.user?.name, userRole: req.user?.role, action, resource: 'ShippingPreset', resourceId: preset?._id, previousValue, newValue, ipAddress: req.ip });
}

async function listPresets(req, res) {
  try {
    const query = req.query.active === 'true' ? { isActive: true } : {};
    const data = await ShippingPreset.find(query).sort({ updatedAt: -1 });
    res.json({ success: true, data });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}
async function getPreset(req, res) {
  try {
    const data = await ShippingPreset.findById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Shipping preset not found.' });
    res.json({ success: true, data });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}
async function createPreset(req, res) {
  try {
    const payload = validateInput(normalize(req.body));
    const duplicate = await ShippingPreset.findOne({ name: payload.name });
    if (duplicate) return res.status(409).json({ success: false, message: 'A preset with this name already exists.' });
    payload.createdBy = req.user?._id;
    payload.updatedBy = req.user?._id;
    const preset = await ShippingPreset.create(payload);
    await audit(req, 'Created Shipping Preset', preset, {}, payload);
    res.status(201).json({ success: true, data: preset });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
}
async function updatePreset(req, res) {
  try {
    const previous = await ShippingPreset.findById(req.params.id);
    if (!previous) return res.status(404).json({ success: false, message: 'Shipping preset not found.' });
    const payload = validateInput(normalize(req.body));
    const duplicate = await ShippingPreset.findOne({ name: payload.name });
    if (duplicate && duplicate._id !== previous._id) return res.status(409).json({ success: false, message: 'A preset with this name already exists.' });
    payload.updatedBy = req.user?._id;
    const preset = await ShippingPreset.findByIdAndUpdate(req.params.id, payload, { new: true });
    await audit(req, 'Updated Shipping Preset', preset, previous, payload);
    res.json({ success: true, data: preset });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
}
async function deletePreset(req, res) {
  try {
    const preset = await ShippingPreset.findByIdAndDelete(req.params.id);
    if (!preset) return res.status(404).json({ success: false, message: 'Shipping preset not found.' });
    await audit(req, 'Deleted Shipping Preset', preset, preset, {});
    res.json({ success: true, message: 'Shipping preset deleted.' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
}
module.exports = { listPresets, getPreset, createPreset, updatePreset, deletePreset, normalize };
