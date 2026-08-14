import { API_URL } from "../config.js";

import {
  useState,
  useEffect,
} from "react";

import {
  ArrowLeft,
  MapPin,
  Upload,
  FileText,
  X,
  CheckCircle,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import "../Style/ReportIssue.css";

function ReportIssue() {
  const navigate = useNavigate();

  // =====================================================
  // GET CURRENT USER
  // =====================================================

  const savedUser =
    localStorage.getItem(
      "zenrixaCurrentUser"
    );

  let currentUser = null;

  try {
    currentUser = savedUser
      ? JSON.parse(savedUser)
      : null;
  } catch (error) {
    console.error(
      "User parse error:",
      error
    );
  }

  const userId =
    currentUser?.userId ||
    localStorage.getItem(
      "userId"
    );

  const userName =
    currentUser?.name ||
    currentUser?.userName ||
    "User";

  // =====================================================
  // FORM STATES
  // =====================================================

  const [title, setTitle] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [category, setCategory] =
    useState("Safety Issue");

  const [file, setFile] =
    useState(null);

  const [preview, setPreview] =
    useState("");

  const [location, setLocation] =
    useState({
      latitude: null,
      longitude: null,
    });

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  // =====================================================
  // GET LOCATION
  // =====================================================

  useEffect(() => {
    if (
      !navigator.geolocation
    ) {
      console.log(
        "Geolocation not supported"
      );

      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude:
            position.coords
              .latitude,

          longitude:
            position.coords
              .longitude,
        });
      },

      (error) => {
        console.log(
          "Location Error:",
          error
        );
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // =====================================================
  // FILE SELECT
  // =====================================================

  const handleFileChange = (
    e
  ) => {
    const selectedFile =
      e.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    // Maximum 5 MB
    if (
      selectedFile.size >
      5 * 1024 * 1024
    ) {
      alert(
        "File size must be less than 5 MB."
      );

      e.target.value = "";

      return;
    }

    // Allowed file types
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (
      !allowedTypes.includes(
        selectedFile.type
      )
    ) {
      alert(
        "Only JPG, PNG, WEBP and PDF files are allowed."
      );

      e.target.value = "";

      return;
    }

    setFile(selectedFile);

    // Image preview
    if (
      selectedFile.type.startsWith(
        "image/"
      )
    ) {
      const objectUrl =
        URL.createObjectURL(
          selectedFile
        );

      setPreview(objectUrl);
    } else {
      setPreview("");
    }
  };

  // =====================================================
  // REMOVE FILE
  // =====================================================

  const removeFile = () => {
    if (preview) {
      URL.revokeObjectURL(
        preview
      );
    }

    setFile(null);
    setPreview("");
  };

  // =====================================================
  // SUBMIT REPORT
  // =====================================================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    // Login check
    if (!userId) {
      alert(
        "Please login first."
      );

      navigate("/login");

      return;
    }

    // Validation
    if (!title.trim()) {
      alert(
        "Please enter report title."
      );

      return;
    }

    if (
      !description.trim()
    ) {
      alert(
        "Please describe the issue."
      );

      return;
    }

    try {
      setLoading(true);

      const formData =
        new FormData();

      // User
      formData.append(
        "userId",
        String(userId)
      );

      formData.append(
        "userName",
        userName
      );

      // Report
      formData.append(
        "title",
        title.trim()
      );

      formData.append(
        "description",
        description.trim()
      );

      formData.append(
        "category",
        category
      );

      // Location
      if (
        location.latitude !==
        null
      ) {
        formData.append(
          "latitude",
          String(
            location.latitude
          )
        );
      }

      if (
        location.longitude !==
        null
      ) {
        formData.append(
          "longitude",
          String(
            location.longitude
          )
        );
      }

      // File
      if (file) {
        formData.append(
          "file",
          file
        );
      }

      console.log(
        "Submitting report..."
      );

      const response =
        await axios.post(
          `${API_URL}/api/report/create`,
          formData
        );

      console.log(
        "Report response:",
        response.data
      );

      if (
        response.data.success
      ) {
        setSuccess(true);

        // Clear form
        setTitle("");
        setDescription("");

        setCategory(
          "Safety Issue"
        );

        removeFile();
      }
    } catch (error) {
      console.error(
        "❌ Report Error:",
        error
      );

      alert(
        error.response?.data
          ?.message ||
          "Unable to submit report."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SUCCESS SCREEN
  // =====================================================

  if (success) {
    return (
      <div className="report-page">

        <div className="report-success">

          <CheckCircle
            size={70}
            className="success-icon"
          />

          <h2>
            Report Submitted!
          </h2>

          <p>
            Thank you for reporting
            this issue. Your report
            has been successfully
            submitted to Zenrixa.
          </p>

          <button
            onClick={() =>
              navigate("/home")
            }
          >
            Back to Home
          </button>

          <button
            className="another-report"
            onClick={() =>
              setSuccess(false)
            }
          >
            Submit Another Report
          </button>

          <button
            className="view-reports-btn"
            onClick={() =>
              navigate("/reports")
            }
          >
            View My Reports
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="report-page">

      {/* HEADER */}

      <div className="report-header">

        <ArrowLeft
          size={24}
          onClick={() =>
            navigate("/home")
          }
          className="report-back"
        />

        <div>
          <h2>
            Report an Issue
          </h2>

          <p>
            Help make your area safer
          </p>
        </div>

      </div>

      {/* FORM */}

      <form
        className="report-form"
        onSubmit={
          handleSubmit
        }
      >

        {/* TITLE */}

        <div className="form-group">

          <label>
            Issue Title
          </label>

          <input
            type="text"
            placeholder="Enter issue title"
            value={title}
            onChange={(e) =>
              setTitle(
                e.target.value
              )
            }
          />

        </div>

        {/* CATEGORY */}

        <div className="form-group">

          <label>
            Category
          </label>

          <select
            value={category}
            onChange={(e) =>
              setCategory(
                e.target.value
              )
            }
          >
            <option>
              Safety Issue
            </option>

            <option>
              Harassment
            </option>

            <option>
              Unsafe Area
            </option>

            <option>
              Suspicious Activity
            </option>

            <option>
              Road/Transport
            </option>

            <option>
              Other
            </option>
          </select>

        </div>

        {/* DESCRIPTION */}

        <div className="form-group">

          <label>
            Description
          </label>

          <textarea
            placeholder="Describe the issue in detail..."
            rows="6"
            value={
              description
            }
            onChange={(e) =>
              setDescription(
                e.target.value
              )
            }
          />

        </div>

        {/* LOCATION */}

        <div className="location-box">

          <MapPin size={22} />

          <div>

            <strong>
              Current Location
            </strong>

            {location.latitude !==
              null ? (
              <p>
                Location captured
                successfully
              </p>
            ) : (
              <p>
                Location not available
              </p>
            )}

          </div>

        </div>

        {/* FILE */}

        <div className="form-group">

          <label>
            Attach File
            <span>
              {" "}
              (Optional)
            </span>
          </label>

          {!file ? (

            <label
              htmlFor="file-upload"
              className="upload-box"
            >

              <Upload
                size={28}
              />

              <span>
                Click to upload
              </span>

              <small>
                JPG, PNG, WEBP or PDF
                • Max 5 MB
              </small>

              <input
                id="file-upload"
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                onChange={
                  handleFileChange
                }
                hidden
              />

            </label>

          ) : (

            <div className="file-preview">

              {preview ? (

                <img
                  src={preview}
                  alt="Preview"
                />

              ) : (

                <div className="pdf-preview">

                  <FileText
                    size={40}
                  />

                  <span>
                    {file.name}
                  </span>

                </div>

              )}

              <button
                type="button"
                className="remove-file"
                onClick={
                  removeFile
                }
              >
                <X size={18} />
              </button>

            </div>

          )}

        </div>

        {/* SUBMIT */}

        <button
          type="submit"
          className="submit-report"
          disabled={loading}
        >
          {loading
            ? "Submitting..."
            : "Submit Report"}
        </button>

      </form>

    </div>
  );
}

export default ReportIssue;