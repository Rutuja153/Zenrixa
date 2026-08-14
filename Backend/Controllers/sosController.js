const SOS = require("../Model/SOS");
const Contact = require("../Model/Contact");
const Location = require("../Model/Location");
const User = require("../Model/User");
const Notification = require("../Model/Notification");

const {
  sendSOSMessage,
} = require("../Services/smsService");

const {
  sendPushNotification,
} = require("../Services/fcmServices");

// ======================================================
// START / ACTIVATE SOS
// ======================================================

const startSOS = async (req, res) => {
  try {
    const {
      userId,
      latitude = null,
      longitude = null,
    } = req.body;

    // ==================================================
    // VALIDATE USER ID
    // ==================================================

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const userIdString = String(userId);

    // ==================================================
    // VALIDATE LOCATION
    // ==================================================

    const lat =
      latitude === null ||
      latitude === undefined
        ? null
        : Number(latitude);

    const lng =
      longitude === null ||
      longitude === undefined
        ? null
        : Number(longitude);

    if (
      lat !== null &&
      Number.isNaN(lat)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude",
      });
    }

    if (
      lng !== null &&
      Number.isNaN(lng)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid longitude",
      });
    }

    console.log(
      "======================================"
    );

    console.log(
      "🚨 STARTING ZENRIXA SOS"
    );

    console.log(
      "👤 User ID:",
      userIdString
    );

    console.log(
      "📍 Latitude:",
      lat
    );

    console.log(
      "📍 Longitude:",
      lng
    );

    console.log(
      "======================================"
    );

    // ==================================================
    // FIND USER
    // ==================================================

    const user = await User.findById(
      userIdString
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log(
      "👤 User:",
      user.name
    );

    console.log(
      "📱 User Mobile:",
      user.mobile
    );

    // ==================================================
    // CHECK EXISTING ACTIVE SOS
    // ==================================================

    let sos = await SOS.findOne({
      userId: userIdString,
      status: "ACTIVE",
    });

    // ==================================================
    // CREATE NEW SOS
    // ==================================================

    if (!sos) {
      sos = await SOS.create({
        userId: userIdString,
        status: "ACTIVE",
        latitude: lat,
        longitude: lng,
      });

      console.log(
        "🚨 New SOS Created:",
        sos._id
      );
    } else {
      console.log(
        "⚠️ Existing ACTIVE SOS:",
        sos._id
      );
    }

    // ==================================================
    // GET TRUSTED CONTACTS
    // ==================================================

    const contacts =
      await Contact.find({
        userId: userIdString,
      }).sort({
        createdAt: -1,
      });

    console.log(
      "======================================"
    );

    console.log(
      "📱 TRUSTED CONTACTS"
    );

    console.log(
      "👥 Total:",
      contacts.length
    );

    contacts.forEach((contact) => {
      console.log(
        `📞 ${contact.name} - ${contact.phone}`
      );
    });

    console.log(
      "======================================"
    );

    // ==================================================
    // SAVE INITIAL LOCATION
    // ==================================================

    if (
      lat !== null &&
      lng !== null
    ) {
      await Location.create({
        userId: userIdString,
        latitude: lat,
        longitude: lng,
        sosId: sos._id,
      });

      console.log(
        "📍 Initial SOS location saved"
      );
    }

    // ==================================================
    // GOOGLE MAP LOCATION
    // ==================================================

    const locationUrl =
      lat !== null &&
      lng !== null
        ? `https://www.google.com/maps?q=${lat},${lng}`
        : "";

    // ==================================================
    // RESULTS
    // ==================================================

    const smsResults = [];
    const pushResults = [];

    // ==================================================
    // IN-APP NOTIFICATION
    // ==================================================

    try {
      await Notification.create({
        title: "🚨 SOS Activated",

        message:
          `Emergency SOS is active.` +
          (
            locationUrl
              ? ` Location: ${locationUrl}`
              : ""
          ),

        userMobile: user.mobile,
      });

      console.log(
        "🔔 In-app notification created"
      );
    } catch (notificationError) {
      console.error(
        "⚠️ Notification Error:",
        notificationError.message
      );
    }

    // ==================================================
    // SIMULATED SMS ALERT
    // ==================================================

    console.log(
      "======================================"
    );

    console.log(
      "📱 STARTING EMERGENCY ALERT PROCESS"
    );

    console.log(
      "👥 RECIPIENTS:",
      contacts.length
    );

    console.log(
      "======================================"
    );

    for (const contact of contacts) {
      try {
        console.log(
          "======================================"
        );

        console.log(
          "📱 SENDING EMERGENCY ALERT"
        );

        console.log(
          "👤 Contact:",
          contact.name
        );

        console.log(
          "📞 Phone:",
          contact.phone
        );

        console.log(
          "📍 Location:",
          lat,
          lng
        );

        console.log(
          "🚨 SOS:",
          String(sos._id)
        );

        console.log(
          "======================================"
        );

        const result =
          await sendSOSMessage({
            phone: contact.phone,

            contactName:
              contact.name,

            userName:
              user.name,

            latitude: lat,

            longitude: lng,

            sosId:
              String(sos._id),
          });

        smsResults.push({
          contactId:
            contact._id,

          name:
            contact.name,

          phone:
            contact.phone,

          success:
            result.success,

          simulated:
            result.simulated,

          message:
            result.message,

          status:
            result.status,

          sid:
            result.sid,

          error:
            result.error,
        });

        if (result.success) {
          console.log(
            `✅ ALERT SENT TO ${contact.name}`
          );
        } else {
          console.log(
            `❌ ALERT FAILED TO ${contact.name}`
          );
        }
      } catch (smsError) {
        console.error(
          `❌ Alert exception for ${contact.name}:`,
          smsError.message
        );

        smsResults.push({
          contactId:
            contact._id,

          name:
            contact.name,

          phone:
            contact.phone,

          success: false,

          simulated: true,

          message:
            "Unable to create alert",

          status:
            "FAILED",

          sid: null,

          error:
            smsError.message,
        });
      }
    }

    // ==================================================
    // PUSH NOTIFICATION
    // ==================================================

    for (const contact of contacts) {
      try {
        const cleanPhone =
          String(
            contact.phone || ""
          ).replace(
            /^\+91/,
            ""
          );

        const contactUser =
          await User.findOne({
            mobile: cleanPhone,
          }).select(
            "fcmTokens mobile"
          );

        if (
          contactUser &&
          Array.isArray(
            contactUser.fcmTokens
          ) &&
          contactUser.fcmTokens.length > 0
        ) {
          const result =
            await sendPushNotification({
              tokens:
                contactUser.fcmTokens,

              title:
                "🚨 Zenrixa Emergency SOS",

              body:
                `${user.name} has activated an emergency SOS.`,

              data: {
                type: "SOS",

                sosId:
                  String(sos._id),

                latitude:
                  lat !== null
                    ? String(lat)
                    : "",

                longitude:
                  lng !== null
                    ? String(lng)
                    : "",

                location:
                  locationUrl,
              },
            });

          pushResults.push({
            contactId:
              contact._id,

            name:
              contact.name,

            phone:
              contact.phone,

            ...result,
          });
        } else {
          pushResults.push({
            contactId:
              contact._id,

            name:
              contact.name,

            phone:
              contact.phone,

            success: false,

            error:
              "Contact does not have a registered FCM token",
          });
        }
      } catch (pushError) {
        pushResults.push({
          contactId:
            contact._id,

          name:
            contact.name,

          phone:
            contact.phone,

          success: false,

          error:
            pushError.message,
        });
      }
    }

    // ==================================================
    // SUMMARY
    // ==================================================

    const successCount =
      smsResults.filter(
        (item) =>
          item.success === true
      ).length;

    const failedCount =
      smsResults.filter(
        (item) =>
          item.success !== true
      ).length;

    console.log(
      "======================================"
    );

    console.log(
      "🚨 SOS ACTIVATION COMPLETED"
    );

    console.log(
      "🆔 SOS ID:",
      String(sos._id)
    );

    console.log(
      "👥 Contacts:",
      contacts.length
    );

    console.log(
      "✅ Alerts Sent:",
      successCount
    );

    console.log(
      "❌ Alerts Failed:",
      failedCount
    );

    console.log(
      "📱 SMS Results:",
      smsResults
    );

    console.log(
      "📲 Push Results:",
      pushResults
    );

    console.log(
      "======================================"
    );

    // ==================================================
    // FINAL RESPONSE
    // ==================================================

    return res.status(201).json({
      success: true,

      message:
        "SOS activated successfully",

      sos,

      contacts,

      // IMPORTANT
      // Frontend reads this
      smsResults,

      pushResults,

      alertResults:
        smsResults,

      summary: {
        totalContacts:
          contacts.length,

        alertsSent:
          successCount,

        alertsFailed:
          failedCount,
      },
    });
  } catch (error) {
    console.error(
      "======================================"
    );

    console.error(
      "❌ START SOS ERROR:",
      error
    );

    console.error(
      "======================================"
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to activate SOS",

      error:
        error.message,
    });
  }
};

// ======================================================
// STOP SOS
// ======================================================

const stopSOS = async (
  req,
  res
) => {
  try {
    const { userId } =
      req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message:
          "userId is required",
      });
    }

    const sos =
      await SOS.findOneAndUpdate(
        {
          userId:
            String(userId),

          status:
            "ACTIVE",
        },

        {
          status:
            "COMPLETED",

          endedAt:
            new Date(),
        },

        {
          returnDocument:
            "after",
        }
      );

    if (!sos) {
      return res.status(404).json({
        success: false,

        message:
          "No active SOS found",
      });
    }

    console.log(
      "🛑 SOS stopped:",
      sos._id
    );

    return res.json({
      success: true,

      message:
        "SOS stopped successfully",

      sos,
    });
  } catch (error) {
    console.error(
      "❌ STOP SOS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to stop SOS",

      error:
        error.message,
    });
  }
};

// ======================================================
// GET ACTIVE SOS
// ======================================================

const getActiveSOS = async (
  req,
  res
) => {
  try {
    const userId =
      String(
        req.params.userId
      );

    const sos =
      await SOS.findOne({
        userId,

        status:
          "ACTIVE",
      });

    const contacts =
      await Contact.find({
        userId,
      }).sort({
        createdAt: -1,
      });

    return res.json({
      success: true,

      active:
        Boolean(sos),

      sos:
        sos || null,

      contacts,
    });
  } catch (error) {
    console.error(
      "❌ GET ACTIVE SOS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to check active SOS",

      error:
        error.message,
    });
  }
};

module.exports = {
  startSOS,
  stopSOS,
  getActiveSOS,
};