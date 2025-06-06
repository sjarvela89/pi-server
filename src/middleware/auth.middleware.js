const jwt = require('jsonwebtoken');
const { dbConnectionConfig } = require('../config');

function verifyToken(req, res, next) {
  // Extract token from Authorization header (expects 'Bearer <token>')
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  try {
    req.user = jwt.verify(token, dbConnectionConfig.Jwt.Key);
    next();
  } catch (err) {
    console.error('JWT error:', err);
    res.status(401).json({ message: 'Unauthorized or expired token' });
  }
}

module.exports = {
  verifyToken
};