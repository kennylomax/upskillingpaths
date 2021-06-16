const express = require('express');
const router = express.Router();

const stepService = require('./step.service');

router.put('/url', (req, res) => {
  stepService.scrapeContent(req, res);
});

router.get('/paths', (req, res) => {
  stepService.getPaths(req, res);
});

router.post('/step', (req, res) => {
  stepService.postStep(req, res);
});

router.put('/step/:uid', (req, res) => {
  stepService.putStep(req, res);
});

router.delete('/step/:uid', (req, res) => {
  stepService.deleteStep(req, res);
});

module.exports = router;
