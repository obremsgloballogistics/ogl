const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const { models } = require('../utils/db');
const Invoice = require('../models/Invoice');
const { protect, authorize } = require('../middleware/auth');
const { paymentNotificationLimiter } = require('../middleware/rateLimiters');

function paymentCurrency(req) {
  return req.body.paymentCurrency || process.env.PAYSTACK_CURRENCY || 'GHS';
}
function exchangeRate(invoiceCurrency, paymentCurrency, settings) {
  if (invoiceCurrency === paymentCurrency) return 1;
  const rates = settings?.currencyRates || {};
  const graph = {};
  const addEdge = (from, to, rate) => {
    if (!Number.isFinite(rate) || rate <= 0) return;
    graph[from] = graph[from] || [];
    graph[from].push({ to, rate });
  };
  Object.entries(rates).forEach(([key, value]) => {
    const [from, to] = key.split('_');
    if (from && to) {
      const rate = Number(value);
      addEdge(from, to, rate);
      addEdge(to, from, 1 / rate);
    }
  });
  const queue = [{ currency: invoiceCurrency, rate: 1 }];
  const visited = new Set([invoiceCurrency]);
  while (queue.length) {
    const current = queue.shift();
    if (current.currency === paymentCurrency) return current.rate;
    for (const edge of graph[current.currency] || []) {
      if (!visited.has(edge.to)) {
        visited.add(edge.to);
        queue.push({ currency: edge.to, rate: current.rate * edge.rate });
      }
    }
  }
  throw new Error(`No configured conversion rate from ${invoiceCurrency} to ${paymentCurrency}.`);
}

router.post('/paystack/initialize', protect, authorize(['Super Admin', 'Admin', 'Finance Officer']), async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.body.invoiceId);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found.' });
    const SiteSettings = require('../models/SiteSettings');
    const settings = await SiteSettings.findOne();
    const targetCurrency = paymentCurrency(req);
    const rate = exchangeRate(invoice.currency, targetCurrency, settings);
    const paymentAmount = Math.round(Number(invoice.amountDue || invoice.total) * rate * 100);
    if (!process.env.PAYSTACK_SECRET_KEY) return res.status(503).json({ success: false, message: 'Paystack is not configured. Add PAYSTACK_SECRET_KEY to the backend environment.' });
    const response = await fetch('https://api.paystack.co/transaction/initialize', { method: 'POST', headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ email: req.body.email || 'billing@obremsgloballogistics.com', amount: paymentAmount, currency: targetCurrency, reference: `OGL-${invoice.invoiceNumber}-${Date.now()}` }) });
    const result = await response.json();
    if (!result.status) return res.status(502).json({ success: false, message: result.message || 'Paystack initialization failed.' });
    const transaction = { originalAmount: Number(invoice.amountDue || invoice.total), originalCurrency: invoice.currency, exchangeRate: rate, paymentAmount: paymentAmount / 100, paymentCurrency: targetCurrency, paystackReference: result.data.reference, paymentStatus: 'Pending' };
    await Invoice.findByIdAndUpdate(invoice._id, { paymentTransaction: transaction }, { new: true });
    res.json({ success: true, data: { ...transaction, authorizationUrl: result.data.authorization_url, accessCode: result.data.access_code } });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.get('/paystack/verify/:reference', protect, authorize(['Super Admin', 'Admin', 'Finance Officer']), async (req, res) => {
  if (!process.env.PAYSTACK_SECRET_KEY) return res.status(503).json({ success: false, message: 'Paystack is not configured.' });
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(req.params.reference)}`, { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } });
    const result = await response.json();
    if (!result.status) return res.status(502).json({ success: false, message: result.message || 'Paystack verification failed.' });
    const invoice = await Invoice.findOne({ 'paymentTransaction.paystackReference': req.params.reference });
    if (!invoice) return res.status(404).json({ success: false, message: 'Payment transaction not found.' });
    const successful = result.data.status === 'success';
    await Invoice.findByIdAndUpdate(invoice._id, { paymentStatus: successful ? 'Paid' : 'Pending', amountPaid: successful ? invoice.total : invoice.amountPaid, amountDue: successful ? 0 : invoice.amountDue, paymentTransaction: { ...invoice.paymentTransaction, paymentStatus: successful ? 'Paid' : result.data.status, verifiedAt: new Date().toISOString() } }, { new: true });
    res.json({ success: true, status: result.data.status });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

router.post('/paystack/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'];
    const expected = process.env.PAYSTACK_SECRET_KEY
      ? crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(JSON.stringify(req.body)).digest('hex')
      : '';
    if (!signature || !expected || signature !== expected) return res.status(401).json({ success: false, message: 'Invalid Paystack signature.' });
    const event = req.body;
    const reference = event.data?.reference;
    if (event.event !== 'charge.success' || !reference) return res.json({ success: true });
    const invoice = await Invoice.findOne({ 'paymentTransaction.paystackReference': reference });
    if (!invoice || invoice.paymentStatus === 'Paid') return res.json({ success: true });
    await Invoice.findByIdAndUpdate(invoice._id, {
      paymentStatus: 'Paid',
      amountPaid: invoice.total,
      amountDue: 0,
      paymentTransaction: { ...invoice.paymentTransaction, paymentStatus: 'Paid', verifiedAt: new Date().toISOString() },
    }, { new: true });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// POST /api/payments/notify — customer notifies admin of payment made
router.post('/notify', paymentNotificationLimiter, async (req, res) => {
  try {
    const { trackingNumber, method, referenceId, amountPaid, screenshotBase64, customerName } = req.body;
    if (!trackingNumber || !method || !referenceId) {
      return res.status(400).json({ success: false, message: 'trackingNumber, method, and referenceId are required.' });
    }
    await models.AuditLog.create({
      action: 'PAYMENT_NOTIFICATION',
      resource: 'Payment',
      resourceId: trackingNumber,
      userName: customerName || 'Customer',
      userRole: 'Customer',
      details: `Payment via ${method}. Ref: ${referenceId}. Amount: ${amountPaid || 'N/A'}. Screenshot: ${screenshotBase64 ? 'Yes' : 'No'}`,
      ipAddress: req.ip || '',
    });
    res.status(200).json({ success: true, message: 'Payment notification received. We will confirm within 24 hours.' });
  } catch (err) {
    console.error('Payment notification error:', err);
    res.status(500).json({ success: false, message: 'Failed to record notification.' });
  }
});

module.exports = router;
