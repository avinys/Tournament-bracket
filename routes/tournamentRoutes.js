const express = require('express');
const { getMain} = require('../controllers/tournamentController');

const router = express.Router();

router.get('/', getMain);
// router.post('/tournaments', createTournament);
// router.get('/tournaments/:id', getTournament);

module.exports = router;
