const mongoose = require('mongoose');

const { Schema } = mongoose;
const models = {};
let memoryServer = null;

const baseOptions = {
  strict: false,
  timestamps: true,
  minimize: false,
};

const objectId = () => ({ type: Schema.Types.ObjectId });

const definitions = {
  User: {
    name: String,
    email: { type: String, index: true },
    password: String,
    phone: String,
    role: String,
    permissions: [String],
    status: String,
    active: Boolean,
    mustChangePassword: Boolean,
    temporaryPassword: String,
  },
  Customer: {
    name: String,
    email: { type: String, index: true },
    phone: String,
    whatsapp: String,
    shipments: [{ type: Schema.Types.ObjectId, ref: 'Shipment' }],
  },
  Shipment: {
    trackingNumber: { type: String, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    assignedOfficer: { type: Schema.Types.ObjectId, ref: 'User' },
    documents: [{ type: Schema.Types.ObjectId, ref: 'Document' }],
  },
  Invoice: {
    invoiceNumber: { type: String, index: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    shipment: { type: Schema.Types.ObjectId, ref: 'Shipment' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  TrackingEvent: {
    shipment: { type: Schema.Types.ObjectId, ref: 'Shipment' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  Document: {
    shipment: { type: Schema.Types.ObjectId, ref: 'Shipment' },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  AuditLog: {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  Notification: {
    recipient: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  Media: {
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  SiteSettings: {},
  Quote: {},
  Service: {},
  Route: {},
  FAQ: {},
  BlogPost: {},
  Testimonial: {},
  ShippingPreset: {},
  ContactMessage: {},
};

for (const [name, definition] of Object.entries(definitions)) {
  const schema = new Schema(definition, baseOptions);
  if (name === 'User') schema.index({ email: 1 }, { unique: true, sparse: true });
  if (name === 'Shipment') schema.index({ trackingNumber: 1 }, { unique: true, sparse: true });
  if (name === 'Invoice') schema.index({ invoiceNumber: 1 }, { unique: true, sparse: true });
  models[name] = mongoose.models[name] || mongoose.model(name, schema);
}

const refs = {
  customer: 'Customer',
  assignedOfficer: 'User',
  documents: 'Document',
  shipment: 'Shipment',
  createdBy: 'User',
  uploadedBy: 'User',
  updatedBy: 'User',
  user: 'User',
  recipient: 'User',
};

async function populate(document, selects = {}) {
  if (!document) return document;
  const paths = Object.entries(selects).map(([path, select]) => ({
    path,
    select,
    model: refs[path],
  }));
  if (!paths.length) return document;
  return models.User.populate(document, paths);
}

async function connectDatabase() {
  let uri = process.env.MONGODB_URI;
  if (process.env.USE_MEMORY_MONGO === 'true') {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri();
  }
  if (!uri) throw new Error('MONGODB_URI is required. The server will not start without MongoDB.');
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) || 10000,
  });
  return mongoose.connection;
}

async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}

module.exports = {
  mongoose,
  models,
  getModel: (name) => {
    if (!models[name]) throw new Error(`Model ${name} not found`);
    return models[name];
  },
  populate,
  connectDatabase,
  disconnectDatabase,
};
