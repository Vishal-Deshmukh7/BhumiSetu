const express = require('express');
const router = express.Router();

const LANDOWNER_ACCOUNTS = [
  {
    id: 'LO-001',
    username: 'ramesh',
    password: 'ramesh123',
    name: 'Ramesh Vitthal Kelvekar',
    role: 'landowner',
    village: 'Kelve',
    district: 'Palghar',
    state: 'Maharashtra',
    parcelIds: ['PAR-1000', 'PAR-1001', 'PAR-1010'],
  },
  {
    id: 'LO-002',
    username: 'kudankulam',
    password: 'kudankulam123',
    name: 'Kudankulam Nuclear Power Project Units 3 & 4',
    role: 'landowner',
    village: 'Kudankulam',
    district: 'Tirunelveli',
    state: 'Tamil Nadu',
    parcelIds: ['PAR-2000', 'PAR-2001'],
  },
];

router.post('/auth/login', (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const account = LANDOWNER_ACCOUNTS.find(
    (a) => a.username === username && a.password === password
  );

  if (!account) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  const { password: _, ...safe } = account;
  return res.json({
    token: `lo-demo-${account.id}-${Date.now()}`,
    user: safe,
  });
});

router.get('/auth/me', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  if (!token || !token.startsWith('lo-demo-')) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  const parts = token.split('-');
  const accountId = parts.slice(2, 4).join('-');
  const account = LANDOWNER_ACCOUNTS.find((a) => a.id === accountId);

  if (!account) {
    return res.status(401).json({ message: 'Invalid session.' });
  }

  const { password: _, ...safe } = account;
  return res.json({ user: safe });
});

module.exports = router;
