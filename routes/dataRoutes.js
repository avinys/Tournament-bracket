const express = require('express');
const dataController = require('../controllers/dataController.js');

const router = express.Router();

router.get("/view-groups", dataController.getViewGroups)
router.get("/upload-group", dataController.getUploadGroup)
router.get("/delete-group", dataController.getDeleteGroup);
router.post("/upload-group", dataController.postUploadGroup)
router.post("/delete-group", dataController.postDeleteGroup);

module.exports = router;