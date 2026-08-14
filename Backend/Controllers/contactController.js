const mongoose = require("mongoose");
const Contact = require("../Model/Contact");

// =====================================================
// GET USER ID
// =====================================================

const getUserId = (req) => {
  const userId =
    req.query?.userId ||
    req.body?.userId ||
    req.headers["x-user-id"];

  if (!userId) {
    return null;
  }

  return String(userId).trim();
};

// =====================================================
// GET ALL CONTACTS
// GET /api/contact/all?userId=USER_ID
// =====================================================

const getAllContacts = async (req, res) => {
  try {
    const userId = getUserId(req);

    console.log(
      "===================================="
    );

    console.log("📱 GET CONTACTS");

    console.log(
      "👤 User ID:",
      userId
    );

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    const contacts = await Contact.find({
      userId,
    }).sort({
      createdAt: -1,
    });

    console.log(
      "👥 Contacts found:",
      contacts.length
    );

    console.log(
      "===================================="
    );

    return res.status(200).json({
      success: true,
      count: contacts.length,
      contacts,
    });

  } catch (error) {
    console.error(
      "❌ Get Contacts Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch contacts",
      error: error.message,
    });
  }
};

// =====================================================
// ADD CONTACT
// POST /api/contact/add
// =====================================================

const addContact = async (req, res) => {
  try {
    const {
      userId,
      name,
      phone,
      image,
      relation,
    } = req.body;

    console.log(
      "===================================="
    );

    console.log("➕ ADD CONTACT");

    console.log(
      "👤 User ID:",
      userId
    );

    console.log(
      "👤 Name:",
      name
    );

    console.log(
      "📞 Phone:",
      phone
    );

    // =================================================
    // USER ID
    // =================================================

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // =================================================
    // NAME
    // =================================================

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Contact name is required",
      });
    }

    // =================================================
    // PHONE
    // =================================================

    if (!phone || !String(phone).trim()) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const cleanUserId =
      String(userId).trim();

    const cleanName =
      String(name).trim();

    const cleanPhone =
      String(phone).replace(
        /\s+/g,
        ""
      );

    // =================================================
    // PHONE VALIDATION
    // =================================================

    if (
      !/^\+[0-9]{10,15}$/.test(
        cleanPhone
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Phone number must be in international format, example +919876543210",
      });
    }

    // =================================================
    // CHECK DUPLICATE
    // =================================================

    const existingContact =
      await Contact.findOne({
        userId: cleanUserId,
        phone: cleanPhone,
      });

    if (existingContact) {
      return res.status(409).json({
        success: false,
        message:
          "This contact is already added",
        contact: existingContact,
      });
    }

    // =================================================
    // CREATE
    // =================================================

    const contact =
      await Contact.create({
        userId: cleanUserId,

        name: cleanName,

        phone: cleanPhone,

        image:
          image &&
          String(image).trim()
            ? String(image).trim()
            : "",

        relation:
          relation &&
          String(relation).trim()
            ? String(relation).trim()
            : "Emergency Contact",
      });

    console.log(
      "✅ Contact saved successfully"
    );

    console.log(
      "🆔 Contact ID:",
      contact._id
    );

    console.log(
      "👤 User ID:",
      contact.userId
    );

    console.log(
      "📞 Phone:",
      contact.phone
    );

    console.log(
      "===================================="
    );

    return res.status(201).json({
      success: true,
      message:
        "Contact added successfully",
      contact,
    });

  } catch (error) {
    console.error(
      "❌ ADD CONTACT ERROR:",
      error
    );

    // Duplicate MongoDB index
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This contact is already added",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to add contact",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE CONTACT
// DELETE /api/contact/:id?userId=USER_ID
// =====================================================

const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const userId = getUserId(req);

    console.log(
      "===================================="
    );

    console.log("🗑️ DELETE CONTACT");

    console.log(
      "🆔 Contact ID:",
      id
    );

    console.log(
      "👤 User ID:",
      userId
    );

    // =================================================
    // USER ID
    // =================================================

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

    // =================================================
    // ID VALIDATION
    // =================================================

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact ID",
      });
    }

    // =================================================
    // DELETE ONLY USER'S CONTACT
    // =================================================

    const contact =
      await Contact.findOneAndDelete({
        _id: id,
        userId,
      });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message:
          "Contact not found or does not belong to this user",
      });
    }

    console.log(
      "✅ Contact deleted:",
      contact.name
    );

    console.log(
      "===================================="
    );

    return res.status(200).json({
      success: true,
      message:
        "Contact deleted successfully",
      contact,
    });

  } catch (error) {
    console.error(
      "❌ DELETE CONTACT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to delete contact",
      error: error.message,
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getAllContacts,
  addContact,
  deleteContact,
};