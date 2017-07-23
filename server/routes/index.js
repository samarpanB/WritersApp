var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
res.header("Content-Type", "text/html");
  res.render('index', { title: 'Welcome to Writers Application API' });
});

router.use('/api/v1.0', require('./v1.0/index'));

module.exports = router;
