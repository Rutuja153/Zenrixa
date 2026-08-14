const express = require("express");

const router = express.Router();

const {
  saveLocation,
  startLocationSharing,
  stopLocationSharing,
  getSharingStatus,
  getLatestLocation,
  getLocationHistory,
} = require("../Controllers/locationController");

// Save GPS location
router.post(
  "/save",
  saveLocation
);

// Start sharing
router.post(
  "/share/start",
  startLocationSharing
);

// Stop sharing
router.post(
  "/share/stop",
  stopLocationSharing
);

// Check sharing
router.get(
  "/share/status/:userId",
  getSharingStatus
);

// Latest location
router.get(
  "/latest/:userId",
  getLatestLocation
);

// Location history
router.get(
  "/history/:userId",
  getLocationHistory
);

module.exports = router;