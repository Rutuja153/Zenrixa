const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const {
  getProfile,
  updateProfile,
  deleteProfile,
} = require("../Controllers/profileControllers");

// =====================================================
// CREATE PROFILE UPLOAD DIRECTORY
// =====================================================

const uploadDirectory = path.join(
  __dirname,
  "..",
  "uploads",
  "profile"
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
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },

  filename: function (req, file, cb) {
    const extension =
      path.extname(file.originalname);

    const fileName =
      `profile-${req.params.userId}-${Date.now()}${extension}`;

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
  if (
    file.mimetype.startsWith("image/")
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only image files are allowed"
      ),
      false
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
    fileSize: 2 * 1024 * 1024,
  },
});

// =====================================================
// GET PROFILE
// =====================================================

router.get(
  "/:userId",
  getProfile
);

// =====================================================
// UPDATE PROFILE
// =====================================================

router.put(
  "/:userId",
  upload.single("profileImage"),
  updateProfile
);

// =====================================================
// DELETE PROFILE
// =====================================================

router.delete(
  "/:userId",
  deleteProfile
);

// =====================================================
// MULTER ERROR HANDLER
// =====================================================

router.use(
  (error, req, res, next) => {
    if (
      error instanceof multer.MulterError
    ) {
      if (
        error.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Profile image must be less than 2 MB",
        });
      }

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next();
  }
);

module.exports = router;