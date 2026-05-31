
const jwt = require('jsonwebtoken');
require('dotenv').config();

// FIXED: Get secret from environment variable
const SECRET = process.env.JWT_SECRET;

// FIXED: Validate secret exists on startup
if (!SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required');
  process.exit(1);
}

const signToken = (payload) => {
  // FIXED: Add 1-hour expiry
  return jwt.sign(payload, SECRET, { expiresIn: '1h' });
};

const verifyToken = (token) => {
  return jwt.verify(token, SECRET);
};

module.exports = { signToken, verifyToken, SECRET };
