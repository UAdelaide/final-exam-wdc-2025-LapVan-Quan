var express = require('express');
var router = express.Router();
var db = require('../db.js')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/dogs', async (req, res) => {
  try {
    const sql = `
    SELECT d.name AS dog_name, d.size, u.username AS owner_username
    FROM Dogs AS d JOIN User AS u ON d.owner_id = u.user_id
    `;

    const [dogs] = await db.query(sql);
    res.json(dogs);
  }
  catch {
    res.status(500).json({ error: 'Request failed'});
  }
});

module.exports = router;
