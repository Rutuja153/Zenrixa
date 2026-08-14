import { API_URL } from "../config.js";
import "../Style/Contact.css";

import {
  ArrowLeft,
  Plus,
  Phone,
  X,
  Trash2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";

function Contact() {
  const navigate = useNavigate();

  // =====================================================
  // STATES
  // =====================================================

  const [showForm, setShowForm] = useState(false);
  const [contacts, setContacts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(true);

  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    image: "",
    relation: "Emergency Contact",
  });

  // =====================================================
  // GET CURRENT USER ID
  // =====================================================

  const getUserId = useCallback(() => {
    try {
      // -------------------------------------------------
      // 1. Direct userId
      // -------------------------------------------------

      const directUserId = localStorage.getItem("userId");

      if (directUserId && directUserId !== "null") {
        return String(directUserId).trim();
      }

      // -------------------------------------------------
      // 2. zenrixaCurrentUser
      // -------------------------------------------------

      const zenrixaUser = localStorage.getItem(
        "zenrixaCurrentUser"
      );

      if (zenrixaUser) {
        try {
          const user = JSON.parse(zenrixaUser);

          const id =
            user?.userId ||
            user?._id ||
            user?.id;

          if (id) {
            localStorage.setItem("userId", String(id));
            return String(id).trim();
          }
        } catch (error) {
          console.error(
            "Invalid zenrixaCurrentUser:",
            error
          );
        }
      }

      // -------------------------------------------------
      // 3. user
      // -------------------------------------------------

      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);

          const id =
            user?.userId ||
            user?._id ||
            user?.id;

          if (id) {
            localStorage.setItem("userId", String(id));
            return String(id).trim();
          }
        } catch (error) {
          console.error(
            "Invalid user object:",
            error
          );
        }
      }

      console.error("❌ User ID not found");

      return null;

    } catch (error) {
      console.error(
        "❌ getUserId error:",
        error
      );

      return null;
    }
  }, []);

  // =====================================================
  // GET CONTACTS
  // =====================================================

  const getContacts = useCallback(async () => {
    try {
      setLoadingContacts(true);

      const userId = getUserId();

      if (!userId) {
        setContacts([]);
        return;
      }

      console.log(
        "📡 Fetching contacts for:",
        userId
      );

      const response = await axios.get(
        `${API_URL}/api/contact/all`,
        {
          params: {
            userId,
          },
        }
      );

      console.log(
        "📥 Get contacts response:",
        response.data
      );

      if (
        response.data?.success &&
        Array.isArray(response.data.contacts)
      ) {
        setContacts(response.data.contacts);
      } else {
        setContacts([]);
      }

    } catch (error) {
      console.error(
        "❌ Get contacts error:",
        error.response?.data || error.message
      );

      setContacts([]);

    } finally {
      setLoadingContacts(false);
    }
  }, [getUserId]);

  // =====================================================
  // LOAD CONTACTS
  // =====================================================

  useEffect(() => {
    getContacts();
  }, [getContacts]);

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setNewContact((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // NORMALIZE PHONE NUMBER
  // =====================================================

  const normalizePhone = (phone) => {
    let value = phone.replace(/\s+/g, "");

    // 10 digit Indian number
    if (/^[6-9][0-9]{9}$/.test(value)) {
      value = `+91${value}`;
    }

    // 91XXXXXXXXXX
    if (/^91[6-9][0-9]{9}$/.test(value)) {
      value = `+${value}`;
    }

    return value;
  };

  // =====================================================
  // ADD CONTACT
  // =====================================================

  const handleAddContact = async () => {
    const userId = getUserId();

    // -------------------------------------------------
    // USER
    // -------------------------------------------------

    if (!userId) {
      alert(
        "User ID not found. Please login again."
      );

      navigate("/login");
      return;
    }

    // -------------------------------------------------
    // NAME
    // -------------------------------------------------

    const name = newContact.name.trim();

    if (!name) {
      alert("Please enter contact name.");
      return;
    }

    // -------------------------------------------------
    // PHONE
    // -------------------------------------------------

    const phoneInput =
      newContact.phone.trim();

    if (!phoneInput) {
      alert("Please enter phone number.");
      return;
    }

    const phone = normalizePhone(phoneInput);

    // -------------------------------------------------
    // PHONE VALIDATION
    // -------------------------------------------------

    if (!/^\+[0-9]{10,15}$/.test(phone)) {
      alert(
        "Please enter a valid phone number.\nExample: 9876543210"
      );
      return;
    }

    // -------------------------------------------------
    // RELATION
    // -------------------------------------------------

    const relation =
      newContact.relation.trim() ||
      "Emergency Contact";

    try {
      setLoading(true);

      const contactData = {
        userId: String(userId),
        name,
        phone,
        image: newContact.image.trim(),
        relation,
      };

      console.log(
        "📤 Sending contact:",
        contactData
      );

      const response = await axios.post(
        `${API_URL}/api/contact/add`,
        contactData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "📥 Add contact response:",
        response.data
      );

      if (response.data?.success) {
        alert(
          "Trusted contact added successfully!"
        );

        // Reset
        setNewContact({
          name: "",
          phone: "",
          image: "",
          relation: "Emergency Contact",
        });

        setShowForm(false);

        // Reload
        await getContacts();

      } else {
        alert(
          response.data?.message ||
          "Unable to add contact"
        );
      }

    } catch (error) {
      console.error(
        "❌ ADD CONTACT ERROR"
      );

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Response:",
        error.response?.data
      );

      console.error(
        "Message:",
        error.message
      );

      alert(
        error.response?.data?.message ||
        "Unable to add contact"
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE CONTACT
  // =====================================================

  const handleDeleteContact = async (contactId) => {
    if (!contactId) {
      alert("Contact ID is missing.");
      return;
    }

    const userId = getUserId();

    if (!userId) {
      alert(
        "User ID not found. Please login again."
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this trusted contact?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);

      console.log(
        "🗑️ Deleting contact:",
        contactId
      );

      const response = await axios.delete(
        `${API_URL}/api/contact/${contactId}`,
        {
          params: {
            userId,
          },
        }
      );

      console.log(
        "📥 Delete response:",
        response.data
      );

      if (response.data?.success) {
        alert(
          "Contact deleted successfully!"
        );

        await getContacts();

      } else {
        alert(
          response.data?.message ||
          "Unable to delete contact"
        );
      }

    } catch (error) {
      console.error(
        "❌ DELETE CONTACT ERROR:",
        error.response?.data ||
        error.message
      );

      alert(
        error.response?.data?.message ||
        "Unable to delete contact"
      );

    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CALL CONTACT
  // =====================================================

  const handleCall = (phone) => {
    if (!phone) {
      alert("Phone number not available.");
      return;
    }

    window.location.href = `tel:${phone}`;
  };

  // =====================================================
  // CLOSE FORM
  // =====================================================

  const closeForm = () => {
    if (loading) return;

    setShowForm(false);

    setNewContact({
      name: "",
      phone: "",
      image: "",
      relation: "Emergency Contact",
    });
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="contact-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="contact-header">

        <ArrowLeft
          className="back-icon"
          onClick={() => navigate("/home")}
        />

        <h2>Trusted Contacts</h2>

        <button
          className="plus-btn"
          onClick={() => setShowForm(true)}
          type="button"
        >
          <Plus size={28} />
        </button>

      </div>

      {/* =================================================
          ADD FORM
      ================================================= */}

      {showForm && (
        <div className="add-form">

          <div className="form-header">

            <h3>Add New Contact</h3>

            <button
              type="button"
              className="close-icon"
              onClick={closeForm}
              disabled={loading}
            >
              <X size={22} />
            </button>

          </div>

          {/* NAME */}

          <input
            type="text"
            name="name"
            placeholder="Enter Name"
            value={newContact.name}
            onChange={handleChange}
            disabled={loading}
          />

          {/* PHONE */}

          <input
            type="tel"
            name="phone"
            placeholder="Enter 10 digit phone number"
            value={newContact.phone}
            onChange={handleChange}
            disabled={loading}
          />

          {/* IMAGE */}

          <input
            type="url"
            name="image"
            placeholder="Enter Image URL (optional)"
            value={newContact.image}
            onChange={handleChange}
            disabled={loading}
          />

          {/* RELATION */}

          <input
            type="text"
            name="relation"
            placeholder="Relation"
            value={newContact.relation}
            onChange={handleChange}
            disabled={loading}
          />

          {/* SAVE */}

          <button
            type="button"
            onClick={handleAddContact}
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : "Save Contact"}
          </button>

        </div>
      )}

      {/* =================================================
          INFO CARD
      ================================================= */}

      <div className="info-card">

        <div className="shield-icon">
          🛡️
        </div>

        <div>
          <h4>Add people you trust.</h4>

          <p>
            They will be notified during
            an emergency.
          </p>
        </div>

      </div>

      {/* =================================================
          CONTACT LIST
      ================================================= */}

      <div className="contacts-container">

        {loadingContacts ? (

          <div className="no-contacts">
            <p>
              Loading trusted contacts...
            </p>
          </div>

        ) : contacts.length === 0 ? (

          <div className="no-contacts">

            <p>
              No trusted contacts added yet.
            </p>

            <button
              type="button"
              onClick={() => setShowForm(true)}
            >
              <Plus size={18} />
              Add Your First Contact
            </button>

          </div>

        ) : (

          contacts.map((item) => (

            <div
              className="contact-card"
              key={item._id}
            >

              {/* IMAGE */}

              <img
                src={
                  item.image ||
                  "https://i.pravatar.cc/80"
                }
                alt={
                  item.name ||
                  "Trusted Contact"
                }
                onError={(event) => {
                  event.currentTarget.src =
                    "https://i.pravatar.cc/80";
                }}
              />

              {/* DETAILS */}

              <div className="contact-details">

                <h3>
                  {item.name}
                </h3>

                <p>
                  {item.phone}
                </p>

                <small>
                  {item.relation ||
                    "Emergency Contact"}
                </small>

              </div>

              {/* CALL */}

              <button
                type="button"
                className="call-btn"
                onClick={() =>
                  handleCall(item.phone)
                }
                title="Call Contact"
              >
                <Phone size={20} />
              </button>

              {/* DELETE */}

              <button
                type="button"
                className="delete-btn"
                onClick={() =>
                  handleDeleteContact(
                    item._id
                  )
                }
                title="Delete Contact"
                disabled={loading}
              >
                <Trash2 size={19} />
              </button>

            </div>

          ))

        )}

      </div>

      {/* =================================================
          BOTTOM ADD BUTTON
      ================================================= */}

      <button
        type="button"
        className="add-contact-btn"
        onClick={() => setShowForm(true)}
      >
        <Plus size={22} />
        Add Contact
      </button>

    </div>
  );
}

export default Contact;