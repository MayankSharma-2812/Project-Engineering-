
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { users } = require('../data/store');
const { signToken } = require('../auth/jwt');

router.post('/signup', async (req, res) => {
  const { email, password, role } = req.body;
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'User exists' });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = { id: Date.now().toString(), email, password: hashedPassword, role: role || 'reader' };
  users.push(user);

  const token = signToken({ userId: user.id, role: user.role }); // FIXED: Include role in payload
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signToken({ userId: user.id, role: user.role }); // FIXED: Include role in payload

  // Return role so frontend can store it (which is broken but requested)
  res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

// FIXED: Add logout endpoint to blacklist tokens
router.post('/logout', (req, res) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(400).json({ error: 'No token provided' });

  const actualToken = token.split(' ')[1];
  const { blacklist } = require('../data/store');

  // Add token to blacklist
  if (!blacklist.includes(actualToken)) {
    blacklist.push(actualToken);
  }

  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
