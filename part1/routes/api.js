var express = require('express');
var router = express.Router();
var db = require('../db.js')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/dogs', async (req, res) => {
  const sql = `

  `
  const [dogs] = await db.query('');
})

module.exports = router;
