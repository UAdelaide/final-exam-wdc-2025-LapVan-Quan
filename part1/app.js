var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql2/promise');

var indexRouter = require('./routes/index');
var apiRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

let db;

(async () => {
  try {
    // Connect to MySQL without specifying a database
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '' // Set your MySQL root password
    });

    // Create the database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS DogWalkService');
    await connection.end();

    // Now connect to the created database
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'DogWalkService'
    });


    // Insert data if table is empty
    const [rows1] = await db.execute('SELECT COUNT(*) AS count FROM Users');
    if (rows1[0].count === 0) {
      await db.execute(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES
      ('alice123', 'alice@example.com', 'hashed123', 'owner'),
      ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
      ('carol123', 'carol@example.com', 'hashed789', 'owner'),
      ('jaden', 'jaden@gmail.com', 'hashed321', 'walker'),
      ('john', 'john@adelaide.com', 'hashed654', 'owner');
      `);
    }

    // Insert data if table is empty
    const [rows2] = await db.execute('SELECT COUNT(*) AS count FROM Dogs');
    if (rows2[0].count === 0) {
      await db.execute(`
      INSERT INTO Dogs (owner_id, name, size)
      VALUES
      ((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max', 'medium'),
      ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small'),
      ((SELECT user_id FROM Users WHERE username = 'carol123'), 'Rocky', 'large'),
      ((SELECT user_id FROM Users WHERE username = 'john'), 'Milo', 'small'),
      ((SELECT user_id FROM Users WHERE username = 'john'), 'Luna', 'medium');
      `);
    }

    // Insert data if table is empty
    const [rows3] = await db.execute('SELECT COUNT(*) AS count FROM WalkRequests');
    if (rows3[0].count === 0) {
      await db.execute(`
      INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status)
      VALUES
      ((SELECT dog_id FROM Dogs WHERE name = 'Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
      ((SELECT dog_id FROM Dogs WHERE name = 'Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted'),
      ((SELECT dog_id FROM Dogs WHERE name = 'Rocky'), '2025-06-11 07:00:00', 60, 'Rundle Mall', 'open'),
      ((SELECT dog_id FROM Dogs WHERE name = 'Milo'), '2025-06-11 18:00:00', 30, 'City Garden', 'completed'),
      ((SELECT dog_id FROM Dogs WHERE name = 'Luna'), '2025-06-12 10:30:00', 40, 'Central Park', 'cancelled');
      `);
    }
  } catch (err) {
    console.error('Error setting up database. Ensure Mysql is running: service mysql start', err);
  }
})();

app.use('/', indexRouter);
app.use('/api', apiRouter);

app.get('/api/dogs', async (req, res) => {
  try {
    const sql = `
      SELECT d.name AS dog_name, d.size, u.username AS owner_username
      FROM Dogs AS d
      JOIN Users AS u ON d.owner_id = u.user_id;
    `;

    const [dogs] = await db.query(sql);
    res.json(dogs);
  }
  catch {
    res.status(500).json({ error: 'Request failed' });
  }
});

app.get('/api/walkrequests/open', async (req, res) => {
  try {
    const sql = `
      SELECT wr.request_id, d.name AS dog_name, wr.requested_time, wr.duration_minutes, wr.location, u.username AS owner_username
      FROM WalkRequests wr
      JOIN Dogs d ON wr.dog_id = d.dog_id
      JOIN Users u ON d.owner_id = u.user_id
      WHERE wr.status = 'open';
    `;

    const [requests] = await db.query(sql);
    res.json(requests);
  }
  catch {
    res.status(500).json({ error: 'Request failed' });
  }
});

app.get('/api/walkers/summary', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        u.username AS walker_username,
        COUNT(wr.rating_id) AS total_ratings,
        ROUND(AVG(wr.rating), 1) AS average_rating,
        (
          SELECT COUNT(*) FROM WalkRequests wrq
          JOIN WalkApplications wa ON wrq.request_id = wa.request_id
          WHERE wa.walker_id = u.user_id AND wrq.status = 'completed'
        ) AS completed_walks
      FROM Users u
      LEFT JOIN WalkRatings wr ON u.user_id = wr.walker_id
      WHERE u.role = 'walker'
      GROUP BY u.user_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve walker summary' });
  }
});

module.exports = app;

INSERT INTO Users (username, email, password_hash, role)
VALUES
('alice123', 'alice@example.com', 'hashed123', 'owner'),
('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
('carol123', 'carol@example.com', 'hashed789', 'owner'),
('jaden', 'jaden@gmail.com', 'hashed321', 'walker'),
('john', 'john@adelaide.com', 'hashed654', 'owner');

INSERT INTO Dogs (owner_id, name, size)
VALUES
((SELECT user_id FROM Users WHERE username = 'alice123'), 'Max', 'medium'),
((SELECT user_id FROM Users WHERE username = 'carol123'), 'Bella', 'small'),
((SELECT user_id FROM Users WHERE username = 'carol123'), 'Rocky', 'large'),
((SELECT user_id FROM Users WHERE username = 'john'), 'Milo', 'small'),
((SELECT user_id FROM Users WHERE username = 'john'), 'Luna', 'medium');