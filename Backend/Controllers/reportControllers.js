const Report = require("../Model/Report");
const fs = require("fs");
const path = require("path");

// =====================================================
// CREATE REPORT
// =====================================================

const createReport = async (req, res) => {
  try {
    const {
      userId,
      userName,
      title,
      description,
      category,
      latitude,
      longitude,
    } = req.body;

    // Validation
    if (
      !userId ||
      !title?.trim() ||
      !description?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "userId, title and description are required",
      });
    }

    // Create report
    const report = await Report.create({
      userId: String(userId),

      userName:
        userName?.trim() || "User",

      title: title.trim(),

      description:
        description.trim(),

      category:
        category?.trim() ||
        "Safety Issue",

      latitude:
        latitude === undefined ||
        latitude === null ||
        latitude === ""
          ? null
          : Number(latitude),

      longitude:
        longitude === undefined ||
        longitude === null ||
        longitude === ""
          ? null
          : Number(longitude),

      fileUrl: req.file
        ? `/uploads/reports/${req.file.filename}`
        : "",

      fileName: req.file
        ? req.file.originalname
        : "",

      status: "Pending",
    });

    return res.status(201).json({
      success: true,
      message:
        "Report submitted successfully",
      report,
    });
  } catch (error) {
    console.error(
      "❌ CREATE REPORT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to submit report",
      error: error.message,
    });
  }
};

// =====================================================
// GET ALL REPORTS
// =====================================================

const getReports = async (req, res) => {
  try {
    const reports =
      await Report.find()
        .sort({
          createdAt: -1,
        });

    return res.json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error(
      "❌ GET REPORTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load reports",
      error: error.message,
    });
  }
};

// =====================================================
// GET USER REPORTS
// =====================================================

const getUserReports = async (
  req,
  res
) => {
  try {
    const userId = String(
      req.params.userId
    );

    const reports =
      await Report.find({
        userId,
      }).sort({
        createdAt: -1,
      });

    return res.json({
      success: true,
      reports,
    });
  } catch (error) {
    console.error(
      "❌ GET USER REPORTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load user reports",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE REPORT STATUS
// =====================================================

const updateReportStatus = async (
  req,
  res
) => {
  try {
    const allowedStatuses = [
      "Pending",
      "In Review",
      "Resolved",
    ];

    const { status } = req.body;

    if (
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid report status",
      });
    }

    const report =
      await Report.findByIdAndUpdate(
        req.params.id,
        {
          status,
        },
        {
          new: true,
        }
      );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.json({
      success: true,
      message:
        "Report status updated",
      report,
    });
  } catch (error) {
    console.error(
      "❌ UPDATE REPORT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update report",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE REPORT
// =====================================================

const deleteReport = async (
  req,
  res
) => {
  try {
    const reportId = req.params.id;

    // Find report
    const report =
      await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // =================================================
    // DELETE UPLOADED FILE
    // =================================================

    if (report.fileUrl) {
      try {
        // fileUrl:
        // /uploads/reports/filename.jpg
        //
        // Convert it into:
        // Backend/uploads/reports/filename.jpg

        const relativeFilePath =
          report.fileUrl.replace(
            /^\/+/,
            ""
          );

        const filePath =
          path.join(
            __dirname,
            "..",
            relativeFilePath
          );

        if (
          fs.existsSync(filePath)
        ) {
          fs.unlinkSync(filePath);

          console.log(
            "✅ Uploaded report file deleted:",
            filePath
          );
        } else {
          console.log(
            "⚠️ Report file not found:",
            filePath
          );
        }
      } catch (fileError) {
        console.error(
          "⚠️ File delete error:",
          fileError.message
        );

        // Continue deleting MongoDB record
      }
    }

    // =================================================
    // DELETE MONGODB REPORT
    // =================================================

    await Report.findByIdAndDelete(
      reportId
    );

    return res.status(200).json({
      success: true,
      message:
        "Report deleted successfully",
    });
  } catch (error) {
    console.error(
      "❌ DELETE REPORT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete report",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createReport,
  getReports,
  getUserReports,
  updateReportStatus,
  deleteReport,
};