const express = require('express');
const db = require('../db');

const router = express.Router();

// Get all habits
router.get('/', (req, res) => {
  const habits = db.prepare('SELECT * FROM habits ORDER BY id DESC').all();
  res.json(habits);
});

// Create a habit
router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const result = db.prepare('INSERT INTO habits (name) VALUES (?)').run(name.trim());
  const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(habit);
});

// Update a habit
router.put('/:id', (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const result = db.prepare('UPDATE habits SET name = ? WHERE id = ?').run(name.trim(), req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Habit not found' });
  }
  const habit = db.prepare('SELECT * FROM habits WHERE id = ?').get(req.params.id);
  res.json(habit);
});

// Delete a habit
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM habits WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Habit not found' });
  }
  res.status(204).send();
});

module.exports = router;