const Notification = require("../Model/Notification");
const User = require("../Model/User");

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userMobile: req.params.mobile }).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to load notifications", error: error.message });
  }
};

const addNotification = async (req, res) => {
  try {
    const { title, message, userMobile } = req.body;
    if (!title || !message || !userMobile) {
      return res.status(400).json({ success: false, message: "title, message and userMobile are required" });
    }
    const notification = await Notification.create({ title, message, userMobile });
    res.status(201).json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to create notification", error: error.message });
  }
};

const registerToken = async (req, res) => {
  try {
    const { userId, token } = req.body;
    if (!userId || !token) return res.status(400).json({ success: false, message: "userId and token are required" });

    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { fcmTokens: token } },
      { new: true }
    ).select("_id fcmTokens");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "FCM token registered" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to register FCM token", error: error.message });
  }
};

const removeToken = async (req, res) => {
  try {
    const { userId, token } = req.body;
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { fcmTokens: token } },
      { new: true }
    ).select("_id fcmTokens");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "FCM token removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to remove FCM token", error: error.message });
  }
};

module.exports = { getNotifications, addNotification, registerToken, removeToken };
