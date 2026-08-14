const Journey = require("../Model/Journey");
const fs = require("fs");
const path = require("path");

// =====================================================
// ADD JOURNEY
// POST /api/journey/add
// =====================================================
const addJourney = async (req, res) => {
  try {
    const {
      userId,
      place,
      message,
      date,
      time,
      status,
    } = req.body;

    console.log("=================================");
    console.log("ADD JOURNEY");
    console.log("Body:", req.body);
    console.log("File:", req.file);
    console.log("=================================");

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    if (!userId || !place || !date || !time) {
      return res.status(400).json({
        success: false,
        message:
          "userId, place, date and time are required",
      });
    }

    // -------------------------------------------------
    // IMAGE URL
    // -------------------------------------------------

    let image = "";

    if (req.file) {
      image = `/uploads/journeys/${req.file.filename}`;
    }

    // -------------------------------------------------
    // CREATE JOURNEY
    // -------------------------------------------------

    const journey = await Journey.create({
      userId: userId.trim(),

      place: place.trim(),

      message: message
        ? message.trim()
        : "",

      image,

      date: date.trim(),

      time: time.trim(),

      status:
        status || "Completed",
    });

    console.log(
      "Journey created:",
      journey
    );

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Journey added successfully",
      journey,
    });

  } catch (error) {

    console.error(
      "ADD JOURNEY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to add journey",
      error: error.message,
    });
  }
};


// =====================================================
// GET JOURNEYS
// GET /api/journey/:userId
// =====================================================
const getJourneys = async (req, res) => {
  try {

    const userId = req.params.userId;

    console.log(
      "GET JOURNEYS:",
      userId
    );

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const journeys =
      await Journey.find({
        userId,
      }).sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      journeys,
    });

  } catch (error) {

    console.error(
      "GET JOURNEYS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load journey history",
      error: error.message,
    });
  }
};


// =====================================================
// DELETE JOURNEY
// DELETE /api/journey/:id
// =====================================================
const deleteJourney = async (req, res) => {
  try {

    const { id } = req.params;

    const journey =
      await Journey.findById(id);

    if (!journey) {
      return res.status(404).json({
        success: false,
        message: "Journey not found",
      });
    }

    // -------------------------------------------------
    // DELETE IMAGE FROM SERVER
    // -------------------------------------------------

    if (journey.image) {

      const imagePath =
        path.join(
          __dirname,
          "..",
          journey.image
        );

      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    // -------------------------------------------------
    // DELETE DATABASE RECORD
    // -------------------------------------------------

    await Journey.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message:
        "Journey deleted successfully",
    });

  } catch (error) {

    console.error(
      "DELETE JOURNEY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete journey",
      error: error.message,
    });
  }
};


module.exports = {
  addJourney,
  getJourneys,
  deleteJourney,
};