const express = require('express');
const matchController = require('../controllers/matchController');

const router = express.Router();

router.get('/bracket', matchController.getMatches);
router.get('/bracket/next', matchController.getNextMatch)
router.post('/bracket/next', matchController.postMatch)

module.exports = router;