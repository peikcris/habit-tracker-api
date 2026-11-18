const express = require('express');
const db = require('../db');

const router = express.Router();

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const today = () => new Date().toISOString().slice(0, 10);

const findHabit = (id, userId) =>
  db.prepare('SELECT * FROM habits WHERE id = ? AND user_id = ?').get(id, userId);

// Count consecutive days ending today (or yesterday, if today isn't done yet)
const calcStreak = (dates, todayStr) => {
  const set = new Set(dates);
  const toStr = (d) => d.toISOString().slice(0, 10);
  const cursor = new Date(`${todayStr}T00:00:00Z`);

  if (!set.has(toStr(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);

  let streak = 0;
  while (set.has(toStr(cursor))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return streak;
};

// Get all habits for the current user, with today's status and streak
router.get('/', (req, res) => {
  const date = DATE_RE.test(req.query.date || '') ? req.query.date : today();

  const habits = db.prepare(`
    SELECT h.id, h.name, h.created_at,
      EXISTS (
        SELECT 1 FROM completions c WHERE c.habit_id = h.id AND c.date = ?
      ) AS completed_today
    FROM habits h
    WHERE h.user_id = ?
    ORDER BY h.id DESC
  `).all(date, req.user.id);

  const completions = db.prepare(`
    SELECT c.habit_id, c.date
    FROM completions c
    JOIN habits h ON h.id = c.habit_id
    WHERE h.user_id = ?
  `).all(req.user.id);

  const byHabit = {};
  for (const c of completions) {
    (byHabit[c.habit_id] ||= []).push(c.date);
  }

  res.json(
    habits.map((h) => ({
      ...h,
      streak: calcStreak(byHabit[h.id] || [], date),
    }))
  );
});

// Create a habit
router.post('/', (req, res) => {
  const name = req.body?.name?.trim();
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const result = db
    .prepare('INSERT INTO habits (user_id, name) VALUES (?, ?)')
    .run(req.user.id, name);
  res.status(201).json(findHabit(result.lastInsertRowid, req.user.id));
});

// Update a habit
router.put('/:id', (req, res) => {
  const name = req.body?.name?.trim();
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const result = db
    .prepare('UPDATE habits SET name = ? WHERE id = ? AND user_id = ?')
    .run(name, req.params.id, req.user.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Habit not found' });
  }
  res.json(findHabit(req.params.id, req.user.id));
});

// Delete a habit
router.delete('/:id', (req, res) => {
  const result = db
    .prepare('DELETE FROM habits WHERE id = ? AND user_id = ?')
    .run(req.params.id, req.user.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Habit not found' });
  }
  res.status(204).send();
});

// Mark a habit as done (defaults to today)
router.post('/:id/complete', (req, res) => {
  const habit = findHabit(req.params.id, req.user.id);
  if (!habit) {
    return res.status(404).json({ error: 'Habit not found' });
  }
  const date = req.body?.date || today();
  if (!DATE_RE.test(date)) {
    return res.status(400).json({ error: 'Date must be YYYY-MM-DD' });
  }
  db.prepare('INSERT OR IGNORE INTO completions (habit_id, date) VALUES (?, ?)').run(habit.id, date);
  res.status(201).json({ habit_id: habit.id, date });
});

// Undo a completion
router.delete('/:id/complete/:date', (req, res) => {
  const habit = findHabit(req.params.id, req.user.id);
  if (!habit) {
    return res.status(404).json({ error: 'Habit not found' });
  }
  const result = db
    .prepare('DELETE FROM completions WHERE habit_id = ? AND date = ?')
    .run(habit.id, req.params.date);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Completion not found' });
  }
  res.status(204).send();
});

// List completion dates for a habit
router.get('/:id/completions', (req, res) => {
  const habit = findHabit(req.params.id, req.user.id);
  if (!habit) {
    return res.status(404).json({ error: 'Habit not found' });
  }
  const rows = db
    .prepare('SELECT date FROM completions WHERE habit_id = ? ORDER BY date DESC')
    .all(habit.id);
  res.json(rows.map((r) => r.date));
});

module.exports = router;