const Media = require('../models/Media');
const path = require('path');
const fs = require('fs');

async function listMedia(req, res) {
  const media = await Media.find().sort({ createdAt: -1 });
  res.json({ success: true, data: media });
}

async function uploadMedia(req, res) {
  const item = await Media.create(req.body);
  res.status(201).json({ success: true, data: item });
}

async function deleteMedia(req, res) {
  const item = await Media.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Media item not found' });
  const candidate = item.filename || item.url || '';
  const filename = path.basename(String(candidate));
  if (filename && filename.startsWith('img_')) {
    await fs.promises.unlink(path.join(__dirname, '../../public/uploads', filename)).catch(() => {});
  }
  res.json({ success: true, message: 'Media deleted' });
}

module.exports = { listMedia, uploadMedia, deleteMedia };