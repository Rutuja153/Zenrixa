const express = require("express");

const router = express.Router();

const {
  chatWithAI,
} = require("../Controllers/chatControllers");

router.post("/", chatWithAI);

module.exports = router;