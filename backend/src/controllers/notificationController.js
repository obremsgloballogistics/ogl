const Notification = require('../models/Notification');

const ALERT_TYPES = ['Info', 'Warning', 'Urgent'];

async function listNotifications(req, res) {
  const notifications = await Notification.find({
    scope: 'operations',
    createdBy: { $exists: true, $ne: null },
    recipient: { $exists: false },
  })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ success: true, data: notifications });
}

async function createNotification(req, res) {
  const { title, message, type } = req.body;
  if (typeof title !== 'string' || !title.trim() || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ success: false, message: 'A title and message are required.' });
  }
  if (!ALERT_TYPES.includes(type)) {
    return res.status(400).json({ success: false, message: 'Severity must be Info, Warning, or Urgent.' });
  }

  const notification = await Notification.create({
    title: title.trim(),
    message: message.trim(),
    type,
    scope: 'operations',
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, data: notification });
}

async function deleteNotification(req, res) {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    scope: 'operations',
    createdBy: { $exists: true, $ne: null },
    recipient: { $exists: false },
  });
  if (!notification) {
    return res.status(404).json({ success: false, message: 'Alert not found.' });
  }
  res.json({ success: true, message: 'Alert deleted.' });
}

module.exports = { listNotifications, createNotification, deleteNotification };
