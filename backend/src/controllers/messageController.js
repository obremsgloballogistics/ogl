const ContactMessage = require('../models/ContactMessage');
const Customer = require('../models/Customer');
const { sendBroadcastEmail } = require('../utils/emailService');

async function sendSms(to, message) {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.log(`[SmsService] Twilio not configured. Simulating delivery to: ${to}`);
    return { simulated: true };
  }

  const twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  return twilio.messages.create({ body: message, from: TWILIO_PHONE_NUMBER, to });
}

async function broadcast(req, res) {
  const { channel, customerIds, subject, message } = req.body;
  if (!['email', 'sms', 'both'].includes(channel) || !message?.trim()) {
    return res.status(400).json({ success: false, message: 'A valid channel and message are required' });
  }
  if (['email', 'both'].includes(channel) && !subject?.trim()) {
    return res.status(400).json({ success: false, message: 'An email subject is required' });
  }

  const query = Array.isArray(customerIds) && customerIds.length ? { _id: { $in: customerIds } } : {};
  const customers = await Customer.find(query);
  const results = { email: { sent: 0, failed: 0, skipped: 0 }, sms: { sent: 0, failed: 0, skipped: 0 } };

  await Promise.all(customers.map(async (customer) => {
    if (['email', 'both'].includes(channel)) {
      if (!customer.email) results.email.skipped += 1;
      else {
        try { await sendBroadcastEmail({ to: customer.email, customerName: customer.name, subject: subject.trim(), message: message.trim() }); results.email.sent += 1; }
        catch (error) { results.email.failed += 1; console.error(`[Broadcast] Email failed for ${customer.email}: ${error.message}`); }
      }
    }
    if (['sms', 'both'].includes(channel)) {
      const phone = customer.phone || customer.whatsapp;
      if (!phone) results.sms.skipped += 1;
      else {
        try { await sendSms(phone, message.trim()); results.sms.sent += 1; }
        catch (error) { results.sms.failed += 1; console.error(`[Broadcast] SMS failed for ${phone}: ${error.message}`); }
      }
    }
  }));

  res.json({ success: true, data: { recipients: customers.length, ...results } });
}

async function listMessages(req, res) {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  res.json({ success: true, data: messages });
}

async function getMessage(req, res) {
  const message = await ContactMessage.findById(req.params.id);
  if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
  res.json({ success: true, data: message });
}

async function createMessage(req, res) {
  const message = await ContactMessage.create(req.body);
  res.status(201).json({ success: true, data: message });
}

async function updateMessage(req, res) {
  const message = await ContactMessage.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
  res.json({ success: true, data: message });
}

async function deleteMessage(req, res) {
  const message = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
  res.json({ success: true, message: 'Message deleted' });
}

module.exports = { listMessages, getMessage, createMessage, updateMessage, deleteMessage, broadcast };