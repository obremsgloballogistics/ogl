const Shipment = require('../models/Shipment');
const TrackingEvent = require('../models/TrackingEvent');
const { createAuditLogEntry } = require('./auditController');

const ALLOWED_STATUSES = [
  'Shipment Created', 'Received', 'Processing', 'In Transit', 'Arrived in UK', 'Arrived in Ghana',
  'Customs', 'Ready for Delivery', 'Out for Delivery', 'Delivered', 'On Hold', 'Returned',
];

async function getTrackingByNumber(req, res) {
  const trackingNumber = String(req.params.trackingNumber).trim().toUpperCase();
  const shipment = await Shipment.findOne({ trackingNumber }).populate('customer assignedOfficer');
  if (!shipment) return res.status(404).json({ success: false, message: 'Tracking record not found' });
  const requestedName = String(req.query.name || '').trim();
  const requestedPhone = String(req.query.phone || '').replace(/\D/g, '');
  if (!requestedName || !requestedPhone) {
    return res.json({ success: true, data: { requiresVerification: true, trackingNumber } });
  }
  const customerName = String(shipment.customer?.name || '').trim().toLowerCase();
  const customerPhone = String(shipment.customer?.phone || shipment.recipientPhone || '').replace(/\D/g, '');
  if (customerName !== requestedName.toLowerCase() || !customerPhone || customerPhone !== requestedPhone) {
    return res.status(403).json({ success: false, message: 'The tracking number and customer details do not match.' });
  }
  const events = await TrackingEvent.find({ shipment: shipment._id }).sort({ eventDate: 1 });
  const customer = shipment.customer;
  const safeShipment = { ...shipment, customer: customer ? { name: customer.name, company: customer.company || '' } : null, assignedOfficer: undefined };
  res.json({ success: true, data: { shipment: safeShipment, events } });
}

async function createTrackingEvent(req, res) {
  const { status, location, description, eventDate } = req.body;
  if (!ALLOWED_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid shipment status.' });
  }
  if (!location || String(location).trim().length < 2) {
    return res.status(400).json({ success: false, message: 'A valid location is required.' });
  }
  const shipment = await Shipment.findOne({ trackingNumber: String(req.params.trackingNumber).trim().toUpperCase() });
  if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found.' });
  const event = await TrackingEvent.create({
    shipment: shipment._id,
    status,
    location: String(location).trim(),
    description: String(description || '').trim(),
    updatedBy: req.user?._id || '',
    eventDate: eventDate ? new Date(eventDate).toISOString() : new Date().toISOString(),
  });
  const updatedShipment = await Shipment.findByIdAndUpdate(shipment._id, {
    status,
    currentLocation: String(location).trim(),
  }, { new: true });
  await createAuditLogEntry({
    user: req.user?._id,
    userName: req.user?.name || 'Staff',
    userRole: req.user?.role || 'Staff',
    action: 'Updated Shipment Status',
    resource: 'Shipment',
    resourceId: shipment._id,
    details: `${shipment.trackingNumber}: ${status} at ${location}`,
    newValue: { status, location, eventId: event._id },
    ipAddress: req.ip,
  });
  res.status(201).json({ success: true, data: { event, shipment: updatedShipment } });
}

module.exports = { getTrackingByNumber, createTrackingEvent, ALLOWED_STATUSES };