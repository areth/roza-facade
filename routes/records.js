const express = require('express');

const router = express.Router();

router.get('/add', (req, res, next) => {
  res.json({ id: 'someid' });
});

router.get('/move', (req, res, next) => {
  res.json({ id: 'someid' });
});

module.exports = router;
