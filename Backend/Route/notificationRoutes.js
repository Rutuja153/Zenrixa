const express = require("express");
const router = express.Router();
const { getNotifications, addNotification, registerToken, removeToken } = require("../Controllers/notificationController");

router.get("/:mobile", getNotifications);
router.post("/", addNotification);
router.post("/token/register", registerToken);
router.post("/token/remove", removeToken);

module.exports = router;
