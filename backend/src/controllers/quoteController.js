const Quote = require('../models/Quote');

async function listQuotes(req, res) {
  const query = {};
  if (req.query.status) query.status = req.query.status;
  const quotes = await Quote.find(query).sort({ createdAt: -1 });
  res.json({ success: true, data: quotes });
}

async function getQuote(req, res) {
  const quote = await Quote.findById(req.params.id);
  if (!quote) return res.status(404).json({ success: false, message: 'Quote not found' });
  res.json({ success: true, data: quote });
}

async function createQuote(req, res) {
  const quote = await Quote.create(req.body);
  res.status(201).json({ success: true, data: quote });
}

async function updateQuote(req, res) {
  const quote = await Quote.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!quote) return res.status(404).json({ success: false, message: 'Quote not found' });
  res.json({ success: true, data: quote });
}

async function deleteQuote(req, res) {
  const quote = await Quote.findByIdAndDelete(req.params.id);
  if (!quote) return res.status(404).json({ success: false, message: 'Quote not found' });
  res.json({ success: true, message: 'Quote deleted' });
}

module.exports = { listQuotes, getQuote, createQuote, updateQuote, deleteQuote };