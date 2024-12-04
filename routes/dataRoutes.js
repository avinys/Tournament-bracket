const express = require('express');
const dataController = require('../controllers/dataController.js');

const router = express.Router();

router.get("/view-groups", dataController.getViewGroups)
router.get("/upload-group", dataController.getUploadGroup)
router.post("/upload-group", dataController.postUploadGroup)

module.exports = router;