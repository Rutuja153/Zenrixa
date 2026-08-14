const crypto = require("crypto");

const Location = require("../Model/Location");
const Contact = require("../Model/Contact");

// =====================================================
// SAVE LOCATION
// =====================================================

const saveLocation = async (req, res) => {
  try {
    const {
      userId,
      latitude,
      longitude,
      accuracy,
      sosId,
      sharing,
      shareId,
    } = req.body;

    if (
      !userId ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "userId, latitude and longitude are required",
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      Number.isNaN(lat) ||
      Number.isNaN(lng)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid latitude or longitude",
      });
    }

    const location = await Location.create({
      userId: String(userId).trim(),

      latitude: lat,
      longitude: lng,

      accuracy:
        accuracy !== undefined &&
        accuracy !== null &&
        !Number.isNaN(Number(accuracy))
          ? Number(accuracy)
          : null,

      sosId: sosId || null,

      sharing: Boolean(sharing),

      shareId: shareId || null,

      timestamp: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Location saved successfully",
      location,
    });
  } catch (error) {
    console.error(
      "❌ Save Location Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to save location",
      error: error.message,
    });
  }
};

// =====================================================
// START LOCATION SHARING
// =====================================================

const startLocationSharing = async (
  req,
  res
) => {
  try {
    const {
      userId,
      latitude,
      longitude,
      accuracy,
    } = req.body;

    if (
      !userId ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "userId, latitude and longitude are required",
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      Number.isNaN(lat) ||
      Number.isNaN(lng)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid location",
      });
    }

    // Unique ID for this sharing session
    const shareId =
      crypto.randomUUID();

    // Get trusted contacts
    const contacts = await Contact.find({
      userId: String(userId).trim(),
    }).sort({
      createdAt: -1,
    });

    const location = await Location.create({
      userId: String(userId).trim(),

      latitude: lat,
      longitude: lng,

      accuracy:
        accuracy !== undefined &&
        accuracy !== null &&
        !Number.isNaN(Number(accuracy))
          ? Number(accuracy)
          : null,

      sharing: true,

      shareId,

      timestamp: new Date(),
    });

    const mapsUrl =
      `https://www.google.com/maps?q=${lat},${lng}`;

    return res.status(201).json({
      success: true,

      message:
        "Location sharing started successfully",

      shareId,

      location,

      mapsUrl,

      contacts: contacts.map(
        (contact) => ({
          id: contact._id,
          name: contact.name,
          phone: contact.phone,
          image: contact.image || "",
        })
      ),

      contactCount: contacts.length,
    });
  } catch (error) {
    console.error(
      "❌ Start Location Sharing Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to start location sharing",
      error: error.message,
    });
  }
};

// =====================================================
// STOP LOCATION SHARING
// =====================================================

const stopLocationSharing = async (
  req,
  res
) => {
  try {
    const {
      userId,
      shareId,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const filter = {
      userId: String(userId).trim(),
      sharing: true,
    };

    if (shareId) {
      filter.shareId = shareId;
    }

    const result =
      await Location.updateMany(
        filter,
        {
          $set: {
            sharing: false,
          },
        }
      );

    return res.json({
      success: true,

      message:
        "Location sharing stopped successfully",

      modifiedCount:
        result.modifiedCount || 0,
    });
  } catch (error) {
    console.error(
      "❌ Stop Location Sharing Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to stop location sharing",
      error: error.message,
    });
  }
};

// =====================================================
// GET SHARING STATUS
// =====================================================

const getSharingStatus = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const location =
      await Location.findOne({
        userId: String(userId).trim(),
        sharing: true,
      }).sort({
        timestamp: -1,
      });

    return res.json({
      success: true,

      sharing: Boolean(location),

      location: location || null,

      shareId:
        location?.shareId || null,
    });
  } catch (error) {
    console.error(
      "❌ Sharing Status Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to get sharing status",
    });
  }
};

// =====================================================
// GET LATEST LOCATION
// =====================================================

const getLatestLocation = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;

    const location =
      await Location.findOne({
        userId,
      }).sort({
        timestamp: -1,
      });

    if (!location) {
      return res.status(404).json({
        success: false,
        message: "No location found",
      });
    }

    return res.json({
      success: true,
      location,
    });
  } catch (error) {
    console.error(
      "❌ Latest Location Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to get location",
    });
  }
};

// =====================================================
// LOCATION HISTORY
// =====================================================

const getLocationHistory = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;

    const locations =
      await Location.find({
        userId,
      })
        .sort({
          timestamp: -1,
        })
        .limit(100);

    return res.json({
      success: true,
      locations,
    });
  } catch (error) {
    console.error(
      "❌ Location History Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to get location history",
    });
  }
};

module.exports = {
  saveLocation,
  startLocationSharing,
  stopLocationSharing,
  getSharingStatus,
  getLatestLocation,
  getLocationHistory,
};