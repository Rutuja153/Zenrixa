const express = require("express");

const router =
  express.Router();

const {
  startSOS,
  stopSOS,
  getActiveSOS,
} =
  require("../Controllers/sosController");

// Activate SOS
router.post(
  "/activate",
  startSOS
);

// Start SOS
router.post(
  "/start",
  startSOS
);

// Stop SOS
router.post(
  "/stop",
  stopSOS
);

// Active SOS
router.get(
  "/active/:userId",
  getActiveSOS
);

module.exports = router;