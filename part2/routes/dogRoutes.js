const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all walk requests (for walkers to view)
router.get('/', async (req, res) => {
  const user_id = req.session.user;

  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }

  try {
    const [rows] = await db.query(`
      SELECT d.dog_id, d.name AS dog_name, u.username AS owner_name
      FROM Dogs d JOIN Users u
      ON d.owner_id = u.user_id
      WHERE u.user_id = ?;
    `, [user_id]);

    res.json(rows);
  } catch (error) {
    console.error('SQL Error:', error);
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

router.get('/all', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM Dogs;
    `, [user_id]);

    res.json(rows);
  } catch (error) {
    console.error('SQL Error:', error);
    res.status(500).json({ error: 'Failed to fetch walk requests' });
  }
});

module.exports = router;