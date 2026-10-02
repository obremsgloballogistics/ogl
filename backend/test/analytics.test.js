const assert = require('node:assert/strict');
const test = require('node:test');

const Shipment = require('../src/models/Shipment');
const Quote = require('../src/models/Quote');
const Customer = require('../src/models/Customer');
const { getAnalytics } = require('../src/controllers/analyticsController');

function queryResult(items) {
  const query = {
    populate() { return query; },
    sort() { return query; },
    limit() { return query; },
    select() { return query; },
    lean() { return Promise.resolve(items); },
  };
  return query;
}

test('analytics returns dashboard data mapped from database records and aggregates', async () => {
  const originalMethods = {
    shipmentCountDocuments: Shipment.countDocuments,
    shipmentAggregate: Shipment.aggregate,
    shipmentFind: Shipment.find,
    quoteCountDocuments: Quote.countDocuments,
    quoteFind: Quote.find,
    customerCountDocuments: Customer.countDocuments,
    customerFind: Customer.find,
  };

  const customerId = 'customer-1';
  const shipmentId = 'shipment-1';
  const quoteId = 'quote-1';
  const aggregateResults = {
    monthly: [{ _id: { year: 2026, month: 10 }, count: 2 }],
    routes: [{ _id: 'London, UK → Accra, Ghana', count: 2 }],
    methods: [{ _id: 'Air Freight', count: 2 }],
    statuses: [{ _id: 'In Transit', count: 2 }],
    customers: [{ _id: customerId, shipmentCount: 2 }],
  };

  try {
    Shipment.countDocuments = async () => 2;
    Shipment.aggregate = async (pipeline) => {
      const groupId = pipeline.find((stage) => stage.$group)?.$group?._id;
      if (groupId?.year) return aggregateResults.monthly;
      if (JSON.stringify(groupId).includes('$concat')) return aggregateResults.routes;
      if (groupId === '$customer') return aggregateResults.customers;
      if (JSON.stringify(groupId).includes('$shippingMethod')) return aggregateResults.methods;
      if (JSON.stringify(groupId).includes('$status')) return aggregateResults.statuses;
      return [];
    };
    Shipment.find = () => queryResult([{
      _id: shipmentId,
      trackingNumber: 'OGL12345678UK',
      customer: { _id: customerId, name: 'Ama Mensah', email: 'ama@example.com' },
      origin: 'London, UK',
      destination: 'Accra, Ghana',
      status: 'In Transit',
      createdAt: new Date('2026-10-01T10:00:00.000Z'),
      updatedAt: new Date('2026-10-02T10:00:00.000Z'),
    }]);
    Quote.countDocuments = async (filter) => filter?.status === 'Pending' ? 1 : 3;
    Quote.find = () => queryResult([{
      _id: quoteId,
      fullName: 'Kofi Boateng',
      email: 'kofi@example.com',
      route: 'China → Ghana (Sea)',
      status: 'Pending',
      createdAt: new Date('2026-10-02T09:00:00.000Z'),
    }]);
    Customer.countDocuments = async () => 1;
    Customer.find = () => queryResult([{
      _id: customerId,
      name: 'Ama Mensah',
      email: 'ama@example.com',
    }]);

    let responseBody;
    const response = {
      status() { return this; },
      json(body) { responseBody = body; return this; },
    };

    await getAnalytics({}, response);

    assert.equal(responseBody.success, true);
    assert.equal(responseBody.data.totalShipments, 2);
    assert.equal(responseBody.data.totalCustomers, 1);
    assert.equal(responseBody.data.totalQuotes, 3);
    assert.equal(responseBody.data.pendingQuotes, 1);
    assert.deepEqual(responseBody.data.monthlyShipments, aggregateResults.monthly);
    assert.deepEqual(responseBody.data.byRoute, aggregateResults.routes);
    assert.deepEqual(responseBody.data.topRoutes, aggregateResults.routes);
    assert.deepEqual(responseBody.data.byMethod, aggregateResults.methods);
    assert.deepEqual(responseBody.data.statusDistribution, aggregateResults.statuses);
    assert.equal(responseBody.data.recentShipments[0].trackingNumber, 'OGL12345678UK');
    assert.equal(responseBody.data.recentShipments[0].customer.name, 'Ama Mensah');
    assert.equal(responseBody.data.recentQuotes[0].fullName, 'Kofi Boateng');
    assert.equal(responseBody.data.topCustomers[0].shipmentCount, 2);
  } finally {
    Shipment.countDocuments = originalMethods.shipmentCountDocuments;
    Shipment.aggregate = originalMethods.shipmentAggregate;
    Shipment.find = originalMethods.shipmentFind;
    Quote.countDocuments = originalMethods.quoteCountDocuments;
    Quote.find = originalMethods.quoteFind;
    Customer.countDocuments = originalMethods.customerCountDocuments;
    Customer.find = originalMethods.customerFind;
  }
});
