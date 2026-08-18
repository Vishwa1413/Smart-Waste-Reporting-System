const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'smart_waste_secret_key_123';

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization') || req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token, authorization denied' });

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return res.status(401).json({ message: 'Token is empty, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid: ' + error.message });
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
  next();
};

module.exports = { authMiddleware, adminMiddleware };
