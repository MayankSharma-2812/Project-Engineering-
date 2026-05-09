
const { verifyToken } = require('../auth/jwt');
const { blacklist } = require('../data/store');

const auth = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  const actualToken = token.split(' ')[1];

  // FIXED: Check if token is blacklisted
  if (blacklist.includes(actualToken)) {
    return res.status(401).json({ error: 'Token has been invalidated' });
  }

  try {
    const decoded = verifyToken(actualToken);
    req.user = decoded; // FIXED: Now includes role from JWT payload
    next();
  } catch (err) {
    res.status(401).json({ error: 'Auth failed' });
  }
};

module.exports = auth;
