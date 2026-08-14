const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  createReport,
  getReports,
  getUserReports,
  updateReportStatus,
  deleteReport,
} = require("../Controllers/reportControllers");

const router = express.Router();

// =====================================================
// CREATE UPLOAD DIRECTORY
// =====================================================

const uploadDirectory = path.join(
  __dirname,
  "../uploads/reports"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });

  console.log(
    "✅ Created uploads/reports directory"
  );
}

// =====================================================
// MULTER STORAGE
// =====================================================

const storage =
  multer.diskStorage({
    destination: (
      req,
      file,
      cb
    ) => {
      cb(
        null,
        uploadDirectory
      );
    },

    filename: (
      req,
      file,
      cb
    ) => {
      const extension =
        path.extname(
          file.originalname
        );

      const uniqueName =
        Date.now() +
        "-" +
        Math.round(
          Math.random() * 1e9
        ) +
        extension;

      cb(
        null,
        uniqueName
      );
    },
  });

// =====================================================
// FILE FILTER
// =====================================================

const fileFilter = (
  req,
  file,
  cb
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (
    allowedTypes.includes(
      file.mimetype
    )
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, PNG, WEBP and PDF files are allowed"
      )
    );
  }
};

// =====================================================
// MULTER
// =====================================================

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize:
      5 * 1024 * 1024,
  },
});

// =====================================================
// CREATE REPORT
// =====================================================

router.post(
  "/create",
  upload.single("file"),
  createReport
);

// =====================================================
// GET ALL REPORTS
// =====================================================

router.get(
  "/all",
  getReports
);

// =====================================================
// GET USER REPORTS
// =====================================================

router.get(
  "/user/:userId",
  getUserReports
);

// =====================================================
// UPDATE STATUS
// =====================================================

router.put(
  "/status/:id",
  updateReportStatus
);

// =====================================================
// DELETE REPORT
// =====================================================

router.delete(
  "/:id",
  deleteReport
);

module.exports = router;