const assert = require('node:assert/strict');
const test = require('node:test');

process.env.JWT_SECRET = 'test-only-secret';

const { app } = require('../src/server');

test('backend exports an Express app without starting a listener', () => {
  assert.equal(typeof app, 'function');
  assert.equal(typeof app.listen, 'function');
});

test('database startup requires an explicit MongoDB URI', async () => {
  const { connectDatabase } = require('../src/utils/db');
  const previous = process.env.MONGODB_URI;
  delete process.env.MONGODB_URI;
  await assert.rejects(connectDatabase(), /MONGODB_URI is required/);
  process.env.MONGODB_URI = previous;
});
