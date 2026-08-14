const express = require("express");
const router = express.Router();

const {
  getEmergencyNumbers,
} = require("../Controllers/emergencyController");

router.get("/", getEmergencyNumbers);

module.exports = router;