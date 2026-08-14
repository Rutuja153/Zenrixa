const User = require("../Model/User");
const Profile = require("../Model/Profile");
const fs = require("fs");
const path = require("path");

// =====================================================
// GET PROFILE
// =====================================================

const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    // -----------------------------------------------
    // VALIDATE USER ID
    // -----------------------------------------------

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // -----------------------------------------------
    // FIND USER
    // -----------------------------------------------

    const user = await User.findById(userId).select(
      "name mobile email"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // -----------------------------------------------
    // FIND PROFILE
    // -----------------------------------------------

    let profile = await Profile.findOne({
      userId: user._id,
    });

    // -----------------------------------------------
    // CREATE PROFILE IF NOT EXISTS
    // -----------------------------------------------

    if (!profile) {
      profile = await Profile.create({
        userId: user._id,
        bloodGroup: "",
        medicalInfo: "",
        profileImage: "",
      });
    }

    // -----------------------------------------------
    // RESPONSE
    // -----------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",

      profile: {
        userId: user._id,
        name: user.name || "",
        mobile: user.mobile || "",
        email: user.email || "",

        bloodGroup: profile.bloodGroup || "",

        medicalInfo: profile.medicalInfo || "",

        profileImage: profile.profileImage || "",
      },
    });
  } catch (error) {
    console.error("❌ Get Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch profile",
      error: error.message,
    });
  }
};

// =====================================================
// UPDATE PROFILE
// =====================================================

const updateProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const {
      name,
      mobile,
      bloodGroup,
      medicalInfo,
    } = req.body;

    // -----------------------------------------------
    // CHECK USER
    // -----------------------------------------------

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // -----------------------------------------------
    // UPDATE USER INFORMATION
    // -----------------------------------------------

    if (name !== undefined) {
      user.name = String(name).trim();
    }

    if (mobile !== undefined) {
      user.mobile = String(mobile).trim();
    }

    await user.save();

    // -----------------------------------------------
    // FIND OR CREATE PROFILE
    // -----------------------------------------------

    let profile = await Profile.findOne({
      userId: user._id,
    });

    if (!profile) {
      profile = new Profile({
        userId: user._id,
      });
    }

    // -----------------------------------------------
    // UPDATE PROFILE FIELDS
    // -----------------------------------------------

    if (bloodGroup !== undefined) {
      profile.bloodGroup =
        String(bloodGroup).trim();
    }

    if (medicalInfo !== undefined) {
      profile.medicalInfo =
        String(medicalInfo).trim();
    }

    // -----------------------------------------------
    // UPDATE PROFILE IMAGE
    // -----------------------------------------------

    if (req.file) {
      const oldImage = profile.profileImage;

      const newImage =
        `/uploads/profile/${req.file.filename}`;

      profile.profileImage = newImage;

      // ---------------------------------------------
      // DELETE OLD IMAGE
      // ---------------------------------------------

      if (
        oldImage &&
        oldImage.startsWith("/uploads/profile/")
      ) {
        const oldFilePath = path.join(
          __dirname,
          "..",
          oldImage
        );

        try {
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
            console.log(
              "🗑️ Old profile image deleted"
            );
          }
        } catch (deleteError) {
          console.error(
            "⚠️ Old image delete error:",
            deleteError.message
          );
        }
      }
    }

    // -----------------------------------------------
    // SAVE PROFILE
    // -----------------------------------------------

    await profile.save();

    // -----------------------------------------------
    // RESPONSE
    // -----------------------------------------------

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",

      profile: {
        userId: user._id,
        name: user.name || "",
        mobile: user.mobile || "",
        email: user.email || "",

        bloodGroup:
          profile.bloodGroup || "",

        medicalInfo:
          profile.medicalInfo || "",

        profileImage:
          profile.profileImage || "",
      },
    });
  } catch (error) {
    console.error(
      "❌ Update Profile Error:",
      error
    );

    // -----------------------------------------------
    // DELETE UPLOADED FILE IF DATABASE UPDATE FAILS
    // -----------------------------------------------

    if (req.file) {
      const uploadedFilePath = path.join(
        __dirname,
        "..",
        "uploads",
        "profile",
        req.file.filename
      );

      try {
        if (fs.existsSync(uploadedFilePath)) {
          fs.unlinkSync(uploadedFilePath);
        }
      } catch (deleteError) {
        console.error(
          "File cleanup error:",
          deleteError.message
        );
      }
    }

    return res.status(500).json({
      success: false,
      message: "Unable to update profile",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE PROFILE INFORMATION
// =====================================================

const deleteProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const profile = await Profile.findOne({
      userId: user._id,
    });

    // -----------------------------------------------
    // DELETE PROFILE IMAGE
    // -----------------------------------------------

    if (
      profile?.profileImage &&
      profile.profileImage.startsWith(
        "/uploads/profile/"
      )
    ) {
      const imagePath = path.join(
        __dirname,
        "..",
        profile.profileImage
      );

      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (deleteError) {
        console.error(
          "Image delete error:",
          deleteError.message
        );
      }
    }

    // -----------------------------------------------
    // DELETE PROFILE
    // -----------------------------------------------

    await Profile.findOneAndDelete({
      userId: user._id,
    });

    return res.status(200).json({
      success: true,
      message:
        "Profile information deleted successfully",
    });
  } catch (error) {
    console.error(
      "❌ Delete Profile Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to delete profile",
      error: error.message,
    });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  deleteProfile,
};