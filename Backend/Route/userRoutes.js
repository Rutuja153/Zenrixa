const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  getProfile,
  firebaseLogin,
} = require("../Controllers/userController");

router.post("/firebase", firebaseLogin);
router.post("/signup", signup);
router.post("/login", login);
router.get("/profile/:mobile", getProfile);

module.exports = router;
