const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

module.exports = function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // { sub, role, ... }
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};