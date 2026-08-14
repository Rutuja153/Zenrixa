const Setting = require("../Model/Setting");

const getSettings = async (req, res) => {
  try {
    const settings = await Setting.findOneAndUpdate(
      { userId: String(req.params.userId) },
      { $setOnInsert: { userId: String(req.params.userId) } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to load settings", error: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const allowed = ["darkMode", "notifications", "autoStartLocation", "language"];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    const settings = await Setting.findOneAndUpdate(
      { userId: String(req.params.userId) },
      { $set: update, $setOnInsert: { userId: String(req.params.userId) } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, message: "Settings saved", settings });
  } catch (error) {
    res.status(500).json({ success: false, message: "Unable to save settings", error: error.message });
  }
};

module.exports = { getSettings, updateSettings };
