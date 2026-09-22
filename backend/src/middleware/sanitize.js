function sanitizeObject(value) {
  if (Array.isArray(value)) {
    value.forEach(sanitizeObject);
    return;
  }

  if (value && typeof value === 'object') {
    Object.keys(value).forEach((key) => {
      if (key.startsWith('$') || key.includes('.')) {
        delete value[key];
      } else {
        sanitizeObject(value[key]);
      }
    });
  }
}

function sanitizeRequest(req, res, next) {
  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);
  next();
}

module.exports = { sanitizeRequest };