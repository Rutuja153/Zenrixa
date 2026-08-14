const express = require("express");

const router = express.Router();

const {
  getAllContacts,
  addContact,
  deleteContact,
} = require("../Controllers/contactController");

// =====================================================
// GET ALL CONTACTS
// GET /api/contact/all?userId=USER_ID
// =====================================================

router.get(
  "/all",
  getAllContacts
);

// =====================================================
// ADD CONTACT
// POST /api/contact/add
// =====================================================

router.post(
  "/add",
  addContact
);

// =====================================================
// DELETE CONTACT
// DELETE /api/contact/:id?userId=USER_ID
// =====================================================

router.delete(
  "/:id",
  deleteContact
);

module.exports = router;