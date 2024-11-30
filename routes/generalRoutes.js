const express = require('express');
const generalController = require('../controllers/generalController');

const router = express.Router();

router.get('/', generalController.getHome);

module.exports = router;