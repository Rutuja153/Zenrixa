const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const {
  addJourney,
  getJourneys,
  deleteJourney,
} = require("../Controllers/journeyController");

// =====================================================
// CREATE UPLOAD DIRECTORY
// =====================================================

const uploadDirectory = path.join(
  __dirname,
  "..",
  "uploads",
  "journeys"
);

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// =====================================================
// MULTER STORAGE
// =====================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const extension =
      path.extname(file.originalname);

    const fileName =
      `journey-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${extension}`;

    cb(null, fileName);
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
        "Only JPG, JPEG, PNG and WEBP images are allowed"
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
    fileSize: 5 * 1024 * 1024,
  },
});

// =====================================================
// ROUTES
// =====================================================

// Add journey with optional image
router.post(
  "/add",
  upload.single("image"),
  addJourney
);

// Get journeys
router.get(
  "/:userId",
  getJourneys
);

// Delete journey
router.delete(
  "/:id",
  deleteJourney
);

module.exports = router;