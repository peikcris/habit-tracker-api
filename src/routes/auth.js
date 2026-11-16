const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

const createToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', async (req, res) => {
  const email = req.body?.email?.trim().toLowerCase();
  const password = req.body?.password;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email is required' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email is already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = db
    .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
    .run(email, passwordHash);

  res.status(201).json({
    token: createToken(result.lastInsertRowid),
    user: { id: result.lastInsertRowid, email },
  });
});

router.post('/login', async (req, res) => {
  const email = req.body?.email?.trim().toLowerCase();
  const password = req.body?.password;

  const user = email && db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  const valid = user && password && (await bcrypt.compare(password, user.password_hash));

  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({
    token: createToken(user.id),
    user: { id: user.id, email: user.email },
  });
});

module.exports = router;