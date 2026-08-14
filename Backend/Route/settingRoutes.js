const express = require("express");
const router = express.Router();
const { getSettings, updateSettings } = require("../Controllers/settingController");

router.get("/:userId", getSettings);
router.put("/:userId", updateSettings);

module.exports = router;
