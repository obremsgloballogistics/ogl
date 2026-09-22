const Shipment = require('../models/Shipment');
const Quote = require('../models/Quote');
const Customer = require('../models/Customer');

async function getAnalytics(req, res) {
  try {
    const totalShipments = await Shipment.countDocuments();
    const allShipments = await Shipment.find();

    const monthlyMap = {};
    for (const s of allShipments) {
      if (s.createdAt) {
        const d = new Date(s.createdAt);
        const y = d.getFullYear();
        const m = d.getMonth() + 1;
        const key = `${y}-${m}`;
        if (!monthlyMap[key]) monthlyMap[key] = { _id: { year: y, month: m }, count: 0 };
        monthlyMap[key].count++;
      }
    }
    const monthlyShipments = Object.values(monthlyMap)
      .sort((a, b) => (b._id.year - a._id.year) || (b._id.month - a._id.month))
      .slice(0, 12);

    const routeMap = {};
    for (const s of allShipments) {
      const o = s.origin || 'Unknown';
      routeMap[o] = (routeMap[o] || 0) + 1;
    }
    const byRoute = Object.keys(routeMap).map(k => ({ _id: k, count: routeMap[k] }));

    const methodMap = {};
    for (const s of allShipments) {
      const o = s.shippingMethod || 'Unknown';
      methodMap[o] = (methodMap[o] || 0) + 1;
    }
    const byMethod = Object.keys(methodMap).map(k => ({ _id: k, count: methodMap[k] }));

    const statusMap = {};
    for (const s of allShipments) {
      const o = s.status || 'Unknown';
      statusMap[o] = (statusMap[o] || 0) + 1;
    }
    const statusDistribution = Object.keys(statusMap).map(k => ({ _id: k, count: statusMap[k] }));

    const totalQuotes = await Quote.countDocuments();
    const totalCustomers = await Customer.countDocuments();

    res.json({
      success: true,
      data: { totalShipments, monthlyShipments, byRoute, byMethod, statusDistribution, totalQuotes, totalCustomers },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getAnalytics };