const express = require("express");

const router = express.Router();

const authMiddleware = require("../Middleware/authMiddleware");

const {
sendAlert,
getAlertHistory
}=require("../Controllers/alertController");


router.post(
    "/send",
    authMiddleware,
    sendAlert
);

router.get(
"/history",
authMiddleware,
getAlertHistory
);


module.exports = router;