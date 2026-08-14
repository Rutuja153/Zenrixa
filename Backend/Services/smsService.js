// Services/smsService.js

const sendSOSMessage = async ({
  phone,
  contactName,
  userName,
  latitude,
  longitude,
  sosId,
}) => {
  try {
    console.log("======================================");
    console.log("📱 ZENRIXA SIMULATED SMS");
    console.log("👤 Contact:", contactName);
    console.log("📞 Contact Number:", phone);
    console.log("👤 SOS User:", userName);
    console.log("📍 Latitude:", latitude);
    console.log("📍 Longitude:", longitude);
    console.log("🚨 SOS ID:", sosId);
    console.log("======================================");

    const locationUrl =
      latitude !== null &&
      longitude !== null
        ? `https://www.google.com/maps?q=${latitude},${longitude}`
        : "";

    const message =
      `🚨 Zenrixa Emergency Alert\n\n` +
      `${userName} has activated an emergency SOS.\n\n` +
      `Contact: ${contactName}\n` +
      `Location: ${locationUrl}\n` +
      `SOS ID: ${sosId}`;

    // ==========================================
    // NO REAL SMS IS SENT
    // ==========================================

    console.log("📨 SIMULATED MESSAGE:");
    console.log(message);

    console.log(
      `✅ Emergency alert sent to ${contactName}`
    );

    return {
      success: true,

      // This is only a simulated ID.
      // It is NOT a real SMS ID.
      simulated: true,

      message: `Emergency alert sent to ${contactName}`,

      contactName,
      phone,

      smsBody: message,

      status: "SIMULATED_SENT",

      sid: null,

      error: null,
    };
  } catch (error) {
    console.error(
      "❌ Simulated SMS Error:",
      error.message
    );

    return {
      success: false,
      simulated: true,
      message: "Unable to create emergency alert",
      contactName,
      phone,
      status: "FAILED",
      sid: null,
      error: error.message,
    };
  }
};

module.exports = {
  sendSOSMessage,
};