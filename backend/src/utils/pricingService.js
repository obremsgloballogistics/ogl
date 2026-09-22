const roundMoney = (value) => Math.round((Number(value) || 0) * 100) / 100;

const WEIGHT_TO_KG = { kg: 1, KG: 1, lb: 0.45359237, LB: 0.45359237, g: 0.001, G: 0.001 };
const DIMENSION_TO_METERS = {
  cm: 0.01, CM: 0.01,
  m: 1, M: 1,
  in: 0.0254, IN: 0.0254,
  ft: 0.3048, FT: 0.3048,
};

function normalizeWeight(weight, unit = 'KG') {
  const multiplier = WEIGHT_TO_KG[unit] || WEIGHT_TO_KG[String(unit).toLowerCase()];
  if (!multiplier) throw new Error(`Unsupported weight unit: ${unit}`);
  return (Number(weight) || 0) * multiplier;
}

function normalizeCbm(volumeCbm, dimensions = {}, dimensionUnit = 'CM') {
  if (Number(volumeCbm) > 0) return Number(volumeCbm);
  const multiplier = DIMENSION_TO_METERS[dimensionUnit] || DIMENSION_TO_METERS[String(dimensionUnit).toLowerCase()];
  if (!multiplier) throw new Error(`Unsupported dimension unit: ${dimensionUnit}`);
  const { length = 0, width = 0, height = 0 } = dimensions;
  return Number(length) * Number(width) * Number(height) * multiplier ** 3;
}

function validatePreset(preset) {
  if (!preset?.name || !preset.origin || !preset.destination || !preset.shippingMethod) {
    throw new Error('Preset name, origin, destination, and shipping method are required.');
  }
  const pricingMethod = preset.pricingMethod;
  if (!['Per KG', 'Per CBM', 'Fixed Delivery Fee', 'Per Shipment'].includes(pricingMethod)) {
    throw new Error('Invalid pricing method.');
  }
  const rate = Number(preset.rate) || 0;
  const fixedDeliveryFee = Number(preset.fixedDeliveryFee) || 0;
  const fees = ['minimumCharge', 'additionalHandlingFee', 'insuranceFee', 'customsFee', 'tax', 'discount'];
  if (rate < 0 || fixedDeliveryFee < 0 || fees.some((key) => Number(preset[key]) < 0)) {
    throw new Error('Rates and fees cannot be negative.');
  }
  if (pricingMethod === 'Per KG' && !preset.weightUnit) throw new Error('Per KG presets require a weight unit.');
  if (pricingMethod === 'Per CBM' && !preset.volumeUnit) throw new Error('Per CBM presets require CBM as the volume unit.');
  if (pricingMethod === 'Fixed Delivery Fee' && fixedDeliveryFee <= 0) throw new Error('Fixed Delivery Fee presets require a fixed fee.');
  if (pricingMethod !== 'Fixed Delivery Fee' && rate <= 0) throw new Error('This pricing method requires a positive rate.');
  return preset;
}

function calculateShipping(preset, shipment = {}) {
  validatePreset(preset);
  const weightKg = normalizeWeight(shipment.weight, shipment.weightUnit || preset.weightUnit || 'KG');
  const cbm = normalizeCbm(shipment.volumeCbm, shipment.dimensions, shipment.dimensionUnit || preset.dimensionUnit || 'CM');
  const rate = Number(preset.rate) || 0;
  const baseAmount = preset.pricingMethod === 'Per KG'
    ? weightKg * rate
    : preset.pricingMethod === 'Per CBM'
      ? cbm * rate
      : preset.pricingMethod === 'Fixed Delivery Fee'
        ? Number(preset.fixedDeliveryFee) || 0
        : rate;
  const minimumCharge = Number(preset.minimumCharge) || 0;
  const subtotal = Math.max(baseAmount, minimumCharge);
  const handlingFee = Number(preset.additionalHandlingFee) || 0;
  const insuranceFee = Number(preset.insuranceFee) || 0;
  const customsFee = Number(preset.customsFee) || 0;
  const tax = Number(preset.tax) || 0;
  const discount = Number(preset.discount) || 0;
  const total = roundMoney(subtotal + handlingFee + insuranceFee + customsFee + tax - discount);
  return {
    currency: preset.currency,
    pricingMethod: preset.pricingMethod,
    weightKg: roundMoney(weightKg),
    volumeCbm: roundMoney(cbm),
    rate,
    baseAmount: roundMoney(baseAmount),
    minimumCharge: roundMoney(minimumCharge),
    handlingFee: roundMoney(handlingFee),
    insuranceFee: roundMoney(insuranceFee),
    customsFee: roundMoney(customsFee),
    tax: roundMoney(tax),
    discount: roundMoney(discount),
    subtotal: roundMoney(subtotal),
    total,
  };
}

function createPresetSnapshot(preset) {
  return {
    id: preset._id,
    name: preset.name,
    origin: preset.origin,
    destination: preset.destination,
    shippingMethod: preset.shippingMethod,
    currency: preset.currency,
    measurementType: preset.measurementType,
    weightUnit: preset.weightUnit,
    dimensionUnit: preset.dimensionUnit,
    volumeUnit: preset.volumeUnit,
    pricingMethod: preset.pricingMethod,
    rate: Number(preset.rate) || 0,
    minimumCharge: Number(preset.minimumCharge) || 0,
    fixedDeliveryFee: Number(preset.fixedDeliveryFee) || 0,
    additionalHandlingFee: Number(preset.additionalHandlingFee) || 0,
    insuranceFee: Number(preset.insuranceFee) || 0,
    customsFee: Number(preset.customsFee) || 0,
    tax: Number(preset.tax) || 0,
    discount: Number(preset.discount) || 0,
    capturedAt: new Date().toISOString(),
  };
}

module.exports = { validatePreset, calculateShipping, createPresetSnapshot, normalizeWeight, normalizeCbm, roundMoney };
