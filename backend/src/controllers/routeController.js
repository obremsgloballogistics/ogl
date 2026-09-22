const Route = require('../models/Route');

async function listRoutes(req, res) {
  const routes = await Route.find({ active: true }).sort({ createdAt: -1 });
  res.json({ success: true, data: routes });
}

async function getRoute(req, res) {
  const route = await Route.findById(req.params.id);
  if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
  res.json({ success: true, data: route });
}

async function createRoute(req, res) {
  const route = await Route.create(req.body);
  res.status(201).json({ success: true, data: route });
}

async function updateRoute(req, res) {
  const route = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
  res.json({ success: true, data: route });
}

async function deleteRoute(req, res) {
  const route = await Route.findByIdAndDelete(req.params.id);
  if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
  res.json({ success: true, message: 'Route deleted' });
}

module.exports = { listRoutes, getRoute, createRoute, updateRoute, deleteRoute };