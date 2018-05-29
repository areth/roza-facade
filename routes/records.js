var express = require('express');
var router = express.Router();

router.get('/add', function(req, res, next) {
  res.json({id: "someid"});
});

router.get('/move', function(req, res, next) {
  res.json({id: "someid"});
});

module.exports = router;