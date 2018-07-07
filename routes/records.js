const express = require('express');

const router = express.Router();

router.post('/add', (req, res, next) => {
  req.app.get('recordsService').add(req.body)
    .then((id) => {
      res.json({ id });
    })
    .catch(next);
});

router.post('/delete/:id', (req, res, next) => {
  req.app.get('recordsService').delete(req.params.id)
    .then((id) => {
      res.json({ id });
    })
    .catch(next);
});

router.post('/delete-undo/:id', (req, res, next) => {
  req.app.get('recordsService').deleteUndo(req.params.id)
    .then((rec) => {
      res.json(rec);
    })
    .catch(next);
});

router.get('/get/:id', (req, res, next) => {
  req.app.get('recordsService').get(req.params.id)
    .then((rec) => {
      res.json(rec);
    })
    .catch(next);
});

module.exports = router;
