const express = require('express');

const router = express.Router();

router.post('/add', (req, res, next) => {
  req.app.get('recordsService').add(req.body)
    .then((id) => {
      res.json({ id });
    })
    .catch(next);
});

router.get('/move', (req, res, next) => {
  res.json({ id: 'someid' });
});

module.exports = router;
