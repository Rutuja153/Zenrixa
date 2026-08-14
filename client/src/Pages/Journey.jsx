import { useEffect, useState } from "react";

import { API_URL } from "../config.js";

import {
  ArrowLeft,
  MapPin,
  Clock,
  Trash2,
  RefreshCw,
  Plus,
  X,
  Save,
  Image as ImageIcon,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import axios from "axios";

import "../Style/Journey.css";

function Journey() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [journeys, setJourneys] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);

  const [saving, setSaving] = useState(false);

  const [formError, setFormError] = useState("");

  const [selectedImage, setSelectedImage] = useState(null);

  const [imagePreview, setImagePreview] = useState("");

  const [formData, setFormData] = useState({
    place: "",
    message: "",
    date: "",
    time: "",
  });

  // =====================================================
  // GET USER ID
  // =====================================================

  const getUserId = () => {
    // -----------------------------------------------------
    // 1. userId
    // -----------------------------------------------------

    const savedUserId = localStorage.getItem("userId");

    if (savedUserId) {
      return savedUserId.trim();
    }

    // -----------------------------------------------------
    // 2. user
    // -----------------------------------------------------

    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);

        return (
          user.userId ||
          user._id ||
          user.name ||
          user.username ||
          ""
        )
          .toString()
          .trim();
      } catch (error) {
        console.error("Invalid user:", error);
      }
    }

    // -----------------------------------------------------
    // 3. zenrixaCurrentUser
    // -----------------------------------------------------

    const currentUser = localStorage.getItem(
      "zenrixaCurrentUser"
    );

    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);

        return (
          user.userId ||
          user._id ||
          user.name ||
          user.username ||
          ""
        )
          .toString()
          .trim();
      } catch (error) {
        console.error(
          "Invalid current user:",
          error
        );
      }
    }

    return "";
  };

  // =====================================================
  // FETCH JOURNEYS
  // =====================================================

  const fetchJourneys = async () => {
    try {
      setLoading(true);
      setError("");

      const userId = getUserId();

      console.log("Journey userId:", userId);

      // ---------------------------------------------------
      // Check User ID
      // ---------------------------------------------------

      if (!userId) {
        setJourneys([]);

        setError(
          "User ID not found. Please login again."
        );

        return;
      }

      // ---------------------------------------------------
      // API URL
      // ---------------------------------------------------

      const url =
        `${API_URL}/api/journey/${encodeURIComponent(
          userId
        )}`;

      console.log(
        "Fetching Journey from:",
        url
      );

      // ---------------------------------------------------
      // GET Journey
      // ---------------------------------------------------

      const response = await axios.get(url);

      console.log(
        "Journey response:",
        response.data
      );

      // ---------------------------------------------------
      // Success
      // ---------------------------------------------------

      if (
        response.data.success &&
        Array.isArray(response.data.journeys)
      ) {
        setJourneys(
          response.data.journeys
        );
      } else {
        setJourneys([]);

        setError(
          response.data.message ||
            "No journey history found."
        );
      }
    } catch (error) {
      console.error(
        "Journey fetch error:",
        error.response?.data ||
          error.message
      );

      setJourneys([]);

      setError(
        error.response?.data?.message ||
          "Unable to load journey history."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchJourneys();
  }, []);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // HANDLE IMAGE
  // =====================================================

  const handleImageChange = (e) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    // ---------------------------------------------------
    // Allowed image types
    // ---------------------------------------------------

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type
      )
    ) {
      setFormError(
        "Please select JPG, PNG or WEBP image."
      );

      return;
    }

    // ---------------------------------------------------
    // Image size
    // ---------------------------------------------------

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setFormError(
        "Image size must be less than 5 MB."
      );

      return;
    }

    setFormError("");

    setSelectedImage(file);

    // ---------------------------------------------------
    // Preview
    // ---------------------------------------------------

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  // =====================================================
  // OPEN ADD FORM
  // =====================================================

  const openAddForm = () => {
    setFormData({
      place: "",
      message: "",
      date: "",
      time: "",
    });

    setSelectedImage(null);

    setImagePreview("");

    setFormError("");

    setShowAddForm(true);
  };

  // =====================================================
  // CLOSE ADD FORM
  // =====================================================

  const closeAddForm = () => {
    if (saving) {
      return;
    }

    setShowAddForm(false);

    setSelectedImage(null);

    setImagePreview("");

    setFormError("");
  };

  // =====================================================
  // ADD JOURNEY
  // =====================================================

  const handleAddJourney = async (e) => {
    e.preventDefault();

    setFormError("");

    const userId = getUserId();

    console.log(
      "Add Journey userId:",
      userId
    );

    // ---------------------------------------------------
    // User ID
    // ---------------------------------------------------

    if (!userId) {
      setFormError(
        "User ID not found. Please login again."
      );

      return;
    }

    // ---------------------------------------------------
    // Place
    // ---------------------------------------------------

    if (
      !formData.place.trim()
    ) {
      setFormError(
        "Please enter journey place."
      );

      return;
    }

    // ---------------------------------------------------
    // Date
    // ---------------------------------------------------

    if (!formData.date) {
      setFormError(
        "Please select date."
      );

      return;
    }

    // ---------------------------------------------------
    // Time
    // ---------------------------------------------------

    if (!formData.time) {
      setFormError(
        "Please select time."
      );

      return;
    }

    try {
      setSaving(true);

      // -------------------------------------------------
      // FormData
      // -------------------------------------------------

      const data = new FormData();

      data.append(
        "userId",
        userId
      );

      data.append(
        "place",
        formData.place.trim()
      );

      data.append(
        "message",
        formData.message.trim()
      );

      // -------------------------------------------------
      // Format Date
      // -------------------------------------------------

      const formattedDate =
        new Date(
          formData.date
        ).toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        );

      data.append(
        "date",
        formattedDate
      );

      // -------------------------------------------------
      // Format Time
      // -------------------------------------------------

      const formattedTime =
        new Date(
          `1970-01-01T${formData.time}`
        ).toLocaleTimeString(
          "en-US",
          {
            hour: "numeric",
            minute: "2-digit",
          }
        );

      data.append(
        "time",
        formattedTime
      );

      // -------------------------------------------------
      // Status
      // -------------------------------------------------

      data.append(
        "status",
        "Completed"
      );

      // -------------------------------------------------
      // Image
      // -------------------------------------------------

      if (selectedImage) {
        data.append(
          "image",
          selectedImage
        );
      }

      // -------------------------------------------------
      // POST API
      // -------------------------------------------------

      const url =
        `${API_URL}/api/journey/add`;

      console.log(
        "Adding Journey to:",
        url
      );

      const response =
        await axios.post(
          url,
          data,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      console.log(
        "Add journey:",
        response.data
      );

      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      if (
        response.data.success
      ) {
        setShowAddForm(false);

        setFormData({
          place: "",
          message: "",
          date: "",
          time: "",
        });

        setSelectedImage(null);

        setImagePreview("");

        setFormError("");

        // Refresh list
        await fetchJourneys();
      } else {
        setFormError(
          response.data.message ||
            "Failed to add journey."
        );
      }
    } catch (error) {
      console.error(
        "Add journey error:",
        error.response?.data ||
          error.message
      );

      setFormError(
        error.response?.data?.message ||
          "Unable to add journey."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE JOURNEY
  // =====================================================

  const deleteJourney = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this journey?"
      );

    if (!confirmed) {
      return;
    }

    try {
      const url =
        `${API_URL}/api/journey/${id}`;

      console.log(
        "Deleting Journey:",
        url
      );

      const response =
        await axios.delete(url);

      console.log(
        "Delete response:",
        response.data
      );

      // -------------------------------------------------
      // Remove from UI
      // -------------------------------------------------

      setJourneys(
        (prev) =>
          prev.filter(
            (journey) =>
              journey._id !== id
          )
      );
    } catch (error) {
      console.error(
        "Delete error:",
        error.response?.data ||
          error.message
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete journey."
      );
    }
  };

  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    // ---------------------------------------------------
    // Already full URL
    // ---------------------------------------------------

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    // ---------------------------------------------------
    // Relative image path
    // ---------------------------------------------------

    return `${API_URL}${image}`;
  };

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div className="journey-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="journey-header">

        <button
          onClick={() =>
            navigate(-1)
          }
        >
          <ArrowLeft size={22} />
        </button>

        <h2>
          Journey History
        </h2>

      </div>

      {/* =================================================
          TOP ACTIONS
      ================================================= */}

      {!loading &&
        !error && (
          <div className="journey-top">

            <div className="journey-count">

              {journeys.length}{" "}

              {journeys.length === 1
                ? "completed trip"
                : "completed trips"}

            </div>

            <div className="journey-actions">

              <button
                className="refresh-btn"
                onClick={
                  fetchJourneys
                }
              >

                <RefreshCw
                  size={17}
                />

                Refresh

              </button>

              <button
                className="add-journey-btn"
                onClick={
                  openAddForm
                }
              >

                <Plus size={18} />

                Add Journey

              </button>

            </div>

          </div>
        )}

      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (
        <div className="loading-box">

          <RefreshCw size={30} />

          <p>
            Loading journeys...
          </p>

        </div>
      )}

      {/* =================================================
          ERROR
      ================================================= */}

      {!loading &&
        error && (
          <div className="empty-journey">

            <MapPin
              size={45}
            />

            <h3>
              Unable to Load Journeys
            </h3>

            <p>
              {error}
            </p>

            <button
              className="retry-btn"
              onClick={
                fetchJourneys
              }
            >

              <RefreshCw
                size={17}
              />

              Retry

            </button>

          </div>
        )}

      {/* =================================================
          EMPTY
      ================================================= */}

      {!loading &&
        !error &&
        journeys.length === 0 && (
          <div className="empty-journey">

            <MapPin
              size={45}
            />

            <h3>
              No Journey History
            </h3>

            <p>
              Your completed trips
              will appear here.
            </p>

            <button
              className="add-journey-btn"
              onClick={
                openAddForm
              }
            >

              <Plus size={18} />

              Add Your First Journey

            </button>

          </div>
        )}

      {/* =================================================
          JOURNEY LIST
      ================================================= */}

      {!loading &&
        !error &&
        journeys.length > 0 && (
          <div className="journey-list">

            {journeys.map(
              (journey) => (

                <div
                  className="journey-card"
                  key={journey._id}
                >

                  {/* IMAGE */}

                  {journey.image ? (

                    <img
                      className="journey-image"
                      src={getImageUrl(
                        journey.image
                      )}
                      alt={
                        journey.place ||
                        "Journey"
                      }
                      onError={(e) => {
                        e.currentTarget.style.display =
                          "none";
                      }}
                    />

                  ) : (

                    <div className="journey-image-placeholder">

                      <ImageIcon
                        size={30}
                      />

                    </div>

                  )}

                  {/* CONTENT */}

                  <div className="journey-content">

                    <div className="journey-route">

                      <div className="location">

                        <MapPin
                          size={21}
                        />

                        <div>

                          <small>
                            Journey
                          </small>

                          <p>
                            {
                              journey.place
                            }
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* MESSAGE */}

                    {journey.message && (
                      <div className="journey-message">

                        <span>
                          {
                            journey.message
                          }
                        </span>

                      </div>
                    )}

                    {/* INFO */}

                    <div className="journey-info">

                      <div>

                        <Clock
                          size={15}
                        />

                        <span>
                          {
                            journey.date
                          }
                        </span>

                      </div>

                      <div>

                        <Clock
                          size={15}
                        />

                        <span>
                          {
                            journey.time
                          }
                        </span>

                      </div>

                      <span className="completed">

                        {
                          journey.status ||
                          "Completed"
                        }

                      </span>

                    </div>

                  </div>

                  {/* DELETE */}

                  <button
                    className="delete-journey"
                    onClick={() =>
                      deleteJourney(
                        journey._id
                      )
                    }
                    title="Delete journey"
                  >

                    <Trash2
                      size={18}
                    />

                  </button>

                </div>
              )
            )}

          </div>
        )}

      {/* =================================================
          ADD JOURNEY MODAL
      ================================================= */}

      {showAddForm && (
        <div className="modal-overlay">

          <div className="journey-modal">

            {/* HEADER */}

            <div className="modal-header">

              <h3>
                Add Journey
              </h3>

              <button
                className="close-modal"
                onClick={
                  closeAddForm
                }
              >

                <X size={19} />

              </button>

            </div>

            {/* ERROR */}

            {formError && (
              <div className="form-error">
                {formError}
              </div>
            )}

            <form
              onSubmit={
                handleAddJourney
              }
            >

              {/* PLACE */}

              <div className="journey-form-group">

                <label>
                  Journey / Place *
                </label>

                <input
                  type="text"
                  name="place"
                  placeholder="Example: College to Home"
                  value={
                    formData.place
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

              {/* MESSAGE */}

              <div className="journey-form-group">

                <label>
                  Journey Message
                </label>

                <textarea
                  name="message"
                  placeholder="Write something about this journey..."
                  value={
                    formData.message
                  }
                  onChange={
                    handleChange
                  }
                  maxLength={500}
                  rows={4}
                />

                <small className="message-count">

                  {
                    formData.message
                      .length
                  }{" "}
                  / 500

                </small>

              </div>

              {/* IMAGE */}

              <div className="journey-form-group">

                <label>
                  Journey Image
                </label>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={
                    handleImageChange
                  }
                />

                {imagePreview && (
                  <div className="image-preview">

                    <img
                      src={
                        imagePreview
                      }
                      alt="Journey preview"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(
                          null
                        );

                        setImagePreview(
                          ""
                        );
                      }}
                    >

                      <X size={16} />

                    </button>

                  </div>
                )}

              </div>

              {/* DATE */}

              <div className="journey-form-group">

                <label>
                  Date *
                </label>

                <input
                  type="date"
                  name="date"
                  value={
                    formData.date
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

              {/* TIME */}

              <div className="journey-form-group">

                <label>
                  Time *
                </label>

                <input
                  type="time"
                  name="time"
                  value={
                    formData.time
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

              {/* SAVE */}

              <button
                type="submit"
                className="save-journey-btn"
                disabled={saving}
              >

                {saving ? (
                  <>
                    <RefreshCw
                      size={18}
                    />

                    Saving...
                  </>
                ) : (
                  <>
                    <Save
                      size={18}
                    />

                    Save Journey
                  </>
                )}

              </button>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Journey;