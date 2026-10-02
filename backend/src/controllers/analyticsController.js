const Shipment = require('../models/Shipment');
const Quote = require('../models/Quote');
const Customer = require('../models/Customer');

async function getAnalytics(req, res) {
  try {
    const now = new Date();
    const monthWindowStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));

    const [
      totalShipments,
      totalCustomers,
      totalQuotes,
      pendingQuotes,
      monthlyShipments,
      byRoute,
      byMethod,
      statusDistribution,
      recentShipmentDocs,
      recentQuotes,
      topCustomerCounts,
    ] = await Promise.all([
      Shipment.countDocuments(),
      Customer.countDocuments(),
      Quote.countDocuments(),
      Quote.countDocuments({ status: 'Pending' }),
      Shipment.aggregate([
        { $match: { createdAt: { $gte: monthWindowStart, $lte: now } } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Shipment.aggregate([
        {
          $group: {
            _id: {
              $ifNull: [
                '$route',
                {
                  $concat: [
                    { $ifNull: ['$origin', 'Unknown'] },
                    ' → ',
                    { $ifNull: ['$destination', 'Unknown'] },
                  ],
                },
              ],
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1, _id: 1 } },
      ]),
      Shipment.aggregate([
        {
          $group: {
            _id: { $ifNull: ['$shippingMethod', 'Unknown'] },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1, _id: 1 } },
      ]),
      Shipment.aggregate([
        {
          $group: {
            _id: { $ifNull: ['$status', 'Unknown'] },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1, _id: 1 } },
      ]),
      Shipment.find()
        .populate('customer', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Quote.find().sort({ createdAt: -1 }).limit(5).lean(),
      Shipment.aggregate([
        { $match: { customer: { $exists: true, $ne: null } } },
        { $group: { _id: '$customer', shipmentCount: { $sum: 1 } } },
        { $sort: { shipmentCount: -1, _id: 1 } },
        { $limit: 5 },
      ]),
    ]);

    const topCustomerDocs = topCustomerCounts.length
      ? await Customer.find({
          _id: { $in: topCustomerCounts.map((entry) => entry._id) },
        })
          .select('name email')
          .lean()
      : [];
    const topCustomersById = new Map(
      topCustomerDocs.map((customer) => [String(customer._id), customer]),
    );
    const topCustomers = topCustomerCounts.flatMap((entry) => {
      const customer = topCustomersById.get(String(entry._id));
      return customer
        ? [{
            _id: customer._id,
            name: customer.name || customer.email || 'Customer',
            email: customer.email || '',
            shipmentCount: entry.shipmentCount,
          }]
        : [];
    });

    const recentShipments = recentShipmentDocs.map((shipment) => ({
      _id: shipment._id,
      trackingNumber: shipment.trackingNumber || '',
      customer: shipment.customer || null,
      origin: shipment.origin || '',
      destination: shipment.destination || '',
      route: shipment.route || '',
      status: shipment.status || 'Unknown',
      createdAt: shipment.createdAt || null,
      updatedAt: shipment.updatedAt || shipment.createdAt || null,
    }));

    res.json({
      success: true,
      data: {
        totalShipments,
        totalCustomers,
        totalQuotes,
        pendingQuotes,
        monthlyShipments,
        byRoute,
        topRoutes: byRoute.slice(0, 5),
        byMethod,
        statusDistribution,
        recentShipments,
        recentQuotes,
        topCustomers,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = { getAnalytics };
