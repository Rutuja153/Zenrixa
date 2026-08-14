const User = require("../Model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const safeUser = (user) => {
  const obj = user.toObject ? user.toObject() : { ...user };
  delete obj.password;
  return obj;
};

const makeToken = (user) =>
  jwt.sign({ id: String(user._id), mobile: user.mobile }, process.env.JWT_SECRET || "zenrixa-dev-secret", { expiresIn: "30d" });

const signup = async (req, res) => {
  try {
    const { name, mobile, email, password } = req.body;
    if (!name || !mobile || !email || !password) return res.status(400).json({ success: false, message: "All fields are required" });
    if (!/^\d{10}$/.test(String(mobile))) return res.status(400).json({ success: false, message: "Enter a valid 10 digit mobile number" });
    if (String(password).length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { mobile: String(mobile) }] });
    if (existing) return res.status(409).json({ success: false, message: "User already exists" });

    const user = await User.create({
      name: name.trim(),
      mobile: String(mobile),
      email: email.toLowerCase().trim(),
      password: await bcrypt.hash(password, 10),
    });

    res.status(201).json({ success: true, message: "Account created successfully", user: safeUser(user), token: makeToken(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile) return res.status(400).json({ success: false, message: "Please enter your mobile number" });

    const user = await User.findOne({ mobile: String(mobile) });
    if (!user) return res.status(404).json({ success: false, message: "User not found. Please Sign Up." });

    // Existing UI logs in with mobile only. Password remains optional for compatibility.
    if (password && !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Incorrect password" });
    }

    res.json({ success: true, message: "Login Successful", user: safeUser(user), token: makeToken(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ mobile: req.params.mobile }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

const firebaseLogin = async (req, res) => {
  try {
    const { uid, name, email, provider } = req.body;
    if (!uid || !email) return res.status(400).json({ success: false, message: "Firebase uid and email are required" });

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await User.create({
        name: name || "User",
        mobile: `firebase-${uid}`,
        email: email.toLowerCase(),
        password: `firebase-${uid}-${Date.now()}`,
      });
    } else if (name && user.name !== name) {
      user.name = name;
      await user.save();
    }

    res.json({ success: true, message: `${provider || "Firebase"} login successful`, user: safeUser(user), token: makeToken(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: "Firebase login sync failed", error: error.message });
  }
};

module.exports = { signup, login, getProfile, firebaseLogin };
