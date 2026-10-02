const assert = require('node:assert/strict');
const test = require('node:test');
const Notification = require('../src/models/Notification');
const {
  listNotifications,
  createNotification,
  deleteNotification,
} = require('../src/controllers/notificationController');

test('operations alert listing excludes legacy and customer notifications', async () => {
  const originalFind = Notification.find;
  const expectedFilter = {
    scope: 'operations',
    createdBy: { $exists: true, $ne: null },
    recipient: { $exists: false },
  };
  let actualFilter;
  let responseBody;
  const query = {
    sort() { return query; },
    lean: async () => [{ _id: 'saved-alert', scope: 'operations' }],
  };

  try {
    Notification.find = (filter) => {
      actualFilter = filter;
      return query;
    };
    await listNotifications({}, { json(body) { responseBody = body; return this; } });
    assert.deepEqual(actualFilter, expectedFilter);
    assert.equal(responseBody.success, true);
    assert.equal(responseBody.data[0]._id, 'saved-alert');
  } finally {
    Notification.find = originalFind;
  }
});

test('creating an operations alert persists its explicit scope and creator', async () => {
  const originalCreate = Notification.create;
  let createdRecord;
  let responseBody;
  let responseStatus;

  try {
    Notification.create = async (record) => {
      createdRecord = record;
      return { _id: 'saved-alert', ...record };
    };
    const response = {
      status(code) { responseStatus = code; return this; },
      json(body) { responseBody = body; return this; },
    };
    await createNotification({
      body: { title: '  Schedule update  ', message: '  Delayed arrival  ', type: 'Warning' },
      user: { _id: 'admin-1' },
    }, response);

    assert.equal(responseStatus, 201);
    assert.deepEqual(createdRecord, {
      title: 'Schedule update',
      message: 'Delayed arrival',
      type: 'Warning',
      scope: 'operations',
      createdBy: 'admin-1',
    });
    assert.equal(responseBody.data._id, 'saved-alert');
  } finally {
    Notification.create = originalCreate;
  }
});

test('invalid operations alert severity is rejected', async () => {
  const originalCreate = Notification.create;
  let responseStatus;
  let responseBody;
  try {
    Notification.create = async () => {
      throw new Error('Should not create an invalid alert');
    };
    const response = {
      status(code) { responseStatus = code; return this; },
      json(body) { responseBody = body; return this; },
    };
    await createNotification({
      body: { title: 'Update', message: 'Message', type: 'Demo' },
      user: { _id: 'admin-1' },
    }, response);
    assert.equal(responseStatus, 400);
    assert.match(responseBody.message, /Severity/);
  } finally {
    Notification.create = originalCreate;
  }
});

test('deleting an operations alert cannot delete legacy or customer notifications', async () => {
  const originalFindOneAndDelete = Notification.findOneAndDelete;
  let actualFilter;
  let responseBody;
  try {
    Notification.findOneAndDelete = async (filter) => {
      actualFilter = filter;
      return null;
    };
    const response = {
      status(code) { assert.equal(code, 404); return this; },
      json(body) { responseBody = body; return this; },
    };
    await deleteNotification({ params: { id: 'old-sample' } }, response);
    assert.deepEqual(actualFilter, {
      _id: 'old-sample',
      scope: 'operations',
      createdBy: { $exists: true, $ne: null },
      recipient: { $exists: false },
    });
    assert.equal(responseBody.success, false);
  } finally {
    Notification.findOneAndDelete = originalFindOneAndDelete;
  }
});
