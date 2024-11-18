const express = require('express');
const matchController = require('../controllers/matchController');

const router = express.Router();

router.get('/bracket', matchController.getMatches);
router.get('/bracket/next', matchController.getNextMatch)
router.post('/bracket/next', matchController.postMatch)

router.get('/bracket-kata-points', matchController.getMatchesKataPoints);
router.get('/bracket-kata-points/next', matchController.getNextMatchKataPoints);
router.post('/bracket-kata-points/next', matchController.postMatchKataPoints);

module.exports = router;