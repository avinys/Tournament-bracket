const express = require('express');
//const matchController = require('../controllers/matchController');
const singleEliminationMatchController = require('../controllers/singleEliminationMatchController');
const doubleEliminationMatchController = require('../controllers/doubleEliminationMatchController');
const kataPointsMatchController = require('../controllers/kataPointsMatchController');

const router = express.Router();

router.get('/bracket-single-elimination', singleEliminationMatchController.getMatches);
router.get('/bracket-single-elimination/next', singleEliminationMatchController.getNextMatch)
router.get('/bracket-single-elimination/next-up', singleEliminationMatchController.getNextUp)
router.post('/bracket-single-elimination/next', singleEliminationMatchController.postMatch)

router.get('/bracket-double-elimination', doubleEliminationMatchController.getMatches);
router.get('/bracket-double-elimination/next', doubleEliminationMatchController.getNextMatch)
router.post('/bracket-double-elimination/next', doubleEliminationMatchController.postMatch)

router.get('/bracket-kata-points', kataPointsMatchController.getMatchesKataPoints);
router.get('/bracket-kata-points/next', kataPointsMatchController.getNextMatchKataPoints);
router.post('/bracket-kata-points/next', kataPointsMatchController.postMatchKataPoints);

module.exports = router;