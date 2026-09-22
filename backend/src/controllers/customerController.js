const Customer = require('../models/Customer');
const Shipment = require('../models/Shipment');
const { populate } = require('../utils/db');

async function listCustomers(req, res) {
  const query = {};
  if (req.query.search) {
    query.name = { $regex: req.query.search, $options: 'i' };
  }
  const customers = await Customer.find(query);
  customers.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, data: customers });
}

async function getCustomer(req, res) {
  const customer = await Customer.findById(req.params.id);
  if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });

  const populated = await populate(customer, { shipments: 'trackingNumber origin destination shippingMethod weight packageType status' });
  res.json({ success: true, data: populated });
}

async function createCustomer(req, res) {
  const customer = await Customer.create(req.body);
  res.status(201).json({ success: true, data: customer });
}

async function updateCustomer(req, res) {
  const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
  res.json({ success: true, data: customer });
}

async function deleteCustomer(req, res) {
  const customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
  res.json({ success: true, message: 'Customer deleted' });
}

module.exports = { listCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
