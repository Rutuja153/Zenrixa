const express = require("express");

const router = express.Router();

const {
  sendSOSMessage,
} = require("../Services/smsService");

// ==========================================
// TEST SMS
// ==========================================

router.post("/test", async (req, res) => {
  try {
    const {
      phone,
      latitude,
      longitude,
    } = req.body;

    console.log("=================================");
    console.log("📱 SMS TEST REQUEST");
    console.log("📞 Phone:", phone);
    console.log("📍 Latitude:", latitude);
    console.log("📍 Longitude:", longitude);
    console.log("=================================");

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "phone is required",
      });
    }

    const result = await sendSOSMessage({
      phone,
      contactName: "Test Contact",
      userName: "Zenrixa User",
      latitude:
        latitude !== undefined
          ? Number(latitude)
          : 18.5204,
      longitude:
        longitude !== undefined
          ? Number(longitude)
          : 73.8567,
      sosId: "TEST-SOS",
    });

    console.log("📱 SMS RESULT:", result);

    return res.json(result);

  } catch (error) {
    console.error(
      "❌ SMS TEST ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;