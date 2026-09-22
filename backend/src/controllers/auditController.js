const AuditLog = require('../models/AuditLog');

async function listAuditLogs(req, res) {
  try {
    const { resource, limit = 100 } = req.query;
    const query = {};
    if (resource && resource !== 'All') {
      query.resource = resource;
    }
    const logs = await AuditLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

async function createAuditLogEntry(data) {
  try {
    return await AuditLog.create(data);
  } catch (err) {
    console.error('Failed to write audit log:', err);
    return null;
  }
}

module.exports = { listAuditLogs, createAuditLogEntry };