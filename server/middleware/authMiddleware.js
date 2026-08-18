const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization') || req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token, authorization denied' });

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return res.status(401).json({ message: 'Token is empty, authorization denied' });

  const secrets = [
    process.env.JWT_SECRET,
    'smart_waste_secret_key_123',
    'smart_waste_reporting_jwt_secret_2026'
  ].filter(Boolean);

  let decoded = null;
  let lastError = null;

  for (const secret of secrets) {
    try {
      decoded = jwt.verify(token, secret);
      if (decoded) break;
    } catch (err) {
      lastError = err;
    }
  }

  if (decoded) {
    req.user = decoded;
    return next();
  }

  return res.status(401).json({ message: 'Token is not valid: ' + (lastError ? lastError.message : 'Invalid signature') });
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  next();
};

module.exports = { authMiddleware, adminMiddleware };
