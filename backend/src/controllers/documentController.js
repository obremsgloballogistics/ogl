const Document = require('../models/Document');

async function listDocuments(req, res) {
  const documents = await Document.find().sort({ createdAt: -1 });
  res.json({ success: true, data: documents });
}

async function getDocument(req, res) {
  const document = await Document.findById(req.params.id);
  if (!document) return res.status(404).json({ success: false, message: 'Document not found' });
  res.json({ success: true, data: document });
}

async function createDocument(req, res) {
  const document = await Document.create(req.body);
  res.status(201).json({ success: true, data: document });
}

async function updateDocument(req, res) {
  const document = await Document.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!document) return res.status(404).json({ success: false, message: 'Document not found' });
  res.json({ success: true, data: document });
}

async function deleteDocument(req, res) {
  const document = await Document.findByIdAndDelete(req.params.id);
  if (!document) return res.status(404).json({ success: false, message: 'Document not found' });
  res.json({ success: true, message: 'Document deleted' });
}

module.exports = { listDocuments, getDocument, createDocument, updateDocument, deleteDocument };