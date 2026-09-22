const FAQ = require('../models/FAQ');

async function listFaqs(req, res) {
  const faqs = await FAQ.find({ active: true }).sort({ createdAt: -1 });
  res.json({ success: true, data: faqs });
}

async function getFaq(req, res) {
  const faq = await FAQ.findById(req.params.id);
  if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });
  res.json({ success: true, data: faq });
}

async function createFaq(req, res) {
  const faq = await FAQ.create(req.body);
  res.status(201).json({ success: true, data: faq });
}

async function updateFaq(req, res) {
  const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });
  res.json({ success: true, data: faq });
}

async function deleteFaq(req, res) {
  const faq = await FAQ.findByIdAndDelete(req.params.id);
  if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found' });
  res.json({ success: true, message: 'FAQ deleted' });
}

module.exports = { listFaqs, getFaq, createFaq, updateFaq, deleteFaq };