import { useEffect, useState } from "react";

import {
  ArrowLeft,
  FileText,
  Calendar,
  MapPin,
  Eye,
  Trash2,
  X,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import axios from "axios";

import { API_URL } from "../config";

import "../Style/Reports.css";


function Reports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedReport, setSelectedReport] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  const userId = localStorage.getItem("userId");


  // =====================================================
  // IMAGE URL
  // =====================================================

  const getFileUrl = (fileUrl) => {
    if (!fileUrl) return "";

    // Already full URL
    if (
      fileUrl.startsWith("http://") ||
      fileUrl.startsWith("https://")
    ) {
      return fileUrl;
    }

    // Remove starting slash
    const cleanPath = fileUrl.startsWith("/")
      ? fileUrl.substring(1)
      : fileUrl;

    return `${API_URL}/${cleanPath}`;
  };


  // =====================================================
  // LOAD REPORTS
  // =====================================================

  const loadReports = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/api/report/user/${userId}`
      );

      if (response.data.success) {
        setReports(response.data.reports || []);
      } else {
        setReports([]);
        setError(
          response.data.message ||
            "Unable to load reports."
        );
      }

    } catch (err) {
      console.error(
        "Reports load error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load reports."
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadReports();
  }, [userId]);


  // =====================================================
  // DELETE REPORT
  // =====================================================

  const handleDelete = async (reportId) => {

    const confirmed = window.confirm(
      "Are you sure you want to delete this report?"
    );

    if (!confirmed) {
      return;
    }

    try {

      setDeletingId(reportId);

      const response = await axios.delete(
        `${API_URL}/api/report/${reportId}`,
        {
          data: {
            userId: userId,
          },
        }
      );

      if (response.data.success) {

        // Remove report from frontend immediately
        setReports((previousReports) =>
          previousReports.filter(
            (report) =>
              report._id !== reportId
          )
        );

        // Close modal if deleted from modal
        if (
          selectedReport?._id === reportId
        ) {
          setSelectedReport(null);
        }

        alert("Report deleted successfully.");

      } else {

        alert(
          response.data.message ||
            "Unable to delete report."
        );

      }

    } catch (err) {

      console.error(
        "Delete report error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Unable to delete report."
      );

    } finally {

      setDeletingId(null);

    }
  };


  // =====================================================
  // STATUS CLASS
  // =====================================================

  const getStatusClass = (status) => {

    switch (status) {

      case "Resolved":
        return "status-resolved";

      case "In Review":
        return "status-review";

      case "Pending":
      default:
        return "status-pending";

    }
  };


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {

    if (!date) {
      return "Date unavailable";
    }

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };


  // =====================================================
  // NO LOGIN
  // =====================================================

  if (!userId) {

    return (
      <div className="reports-page">

        <div className="reports-header">

          <ArrowLeft
            onClick={() =>
              navigate("/profile")
            }
          />

          <div>
            <h2>My Reports</h2>
            <p>Your submitted reports</p>
          </div>

        </div>

        <div className="reports-error">

          <AlertCircle size={50} />

          <h3>Please Login</h3>

          <p>
            Please login to view your
            submitted reports.
          </p>

          <button
            onClick={() =>
              navigate("/login")
            }
          >
            Login
          </button>

        </div>

      </div>
    );
  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <div className="reports-page">

        <div className="reports-header">

          <ArrowLeft
            onClick={() =>
              navigate("/profile")
            }
          />

          <div>
            <h2>My Reports</h2>
            <p>Your submitted reports</p>
          </div>

        </div>

        <div className="reports-loading">

          <Loader2
            size={45}
            className="reports-loader"
          />

          <h3>Loading Reports...</h3>

          <p>
            Please wait while we load
            your reports.
          </p>

        </div>

      </div>
    );
  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {

    return (
      <div className="reports-page">

        <div className="reports-header">

          <ArrowLeft
            onClick={() =>
              navigate("/profile")
            }
          />

          <div>
            <h2>My Reports</h2>
            <p>Your submitted reports</p>
          </div>

        </div>

        <div className="reports-error">

          <AlertCircle size={50} />

          <h3>Unable to Load Reports</h3>

          <p>{error}</p>

          <button
            onClick={loadReports}
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="reports-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="reports-header">

        <ArrowLeft
          size={24}
          onClick={() =>
            navigate("/profile")
          }
        />

        <div>
          <h2>My Reports</h2>

          <p>
            {reports.length}{" "}
            {reports.length === 1
              ? "report"
              : "reports"}{" "}
            submitted
          </p>
        </div>

      </div>


      {/* =================================================
          EMPTY
      ================================================= */}

      {reports.length === 0 ? (

        <div className="empty-report">

          <div className="empty-report-icon">
            <FileText size={45} />
          </div>

          <h3>No Reports Found</h3>

          <p>
            Your submitted reports will
            appear here.
          </p>

          <button
            onClick={() =>
              navigate("/report-issue")
            }
          >
            Submit a Report
          </button>

        </div>

      ) : (

        <div className="reports-list">

          {reports.map((report) => {

            const fileUrl =
              getFileUrl(
                report.fileUrl
              );

            const isImage =
              report.fileName &&
              /\.(jpg|jpeg|png|webp)$/i.test(
                report.fileName
              );

            return (

              <div
                className="report-card"
                key={report._id}
              >

                {/* =================================================
                    IMAGE
                ================================================= */}

                {fileUrl && isImage ? (

                  <div className="report-image-container">

                    <img
                      src={fileUrl}
                      alt={report.title}
                      className="report-image"
                      onError={(e) => {
                        e.currentTarget.style.display =
                          "none";

                        const errorBox =
                          e.currentTarget
                            .parentElement
                            .querySelector(
                              ".image-error"
                            );

                        if (errorBox) {
                          errorBox.style.display =
                            "flex";
                        }
                      }}
                    />

                    <div
                      className="image-error"
                      style={{
                        display: "none",
                      }}
                    >
                      <ImageIcon size={35} />

                      <span>
                        Image unavailable
                      </span>
                    </div>

                  </div>

                ) : (

                  <div className="report-icon">

                    <FileText size={55} />

                  </div>

                )}


                {/* =================================================
                    INFORMATION
                ================================================= */}

                <div className="report-info">

                  <div className="report-title-row">

                    <div>

                      <h3>
                        {report.title}
                      </h3>

                      <div className="report-category">
                        {report.category}
                      </div>

                    </div>

                    <span
                      className={`report-status ${getStatusClass(
                        report.status
                      )}`}
                    >
                      {report.status ||
                        "Pending"}
                    </span>

                  </div>


                  {/* DESCRIPTION */}

                  <p className="report-description">
                    {report.description}
                  </p>


                  {/* META */}

                  <div className="report-meta">

                    <span>
                      <Calendar
                        size={14}
                      />

                      {formatDate(
                        report.createdAt
                      )}
                    </span>


                    {report.latitude !== null &&
                      report.longitude !== null && (

                        <span>
                          <MapPin
                            size={14}
                          />

                          Location
                        </span>

                      )}

                  </div>


                  {/* FILE */}

                  {report.fileName && (

                    <div className="report-file-name">

                      <FileText
                        size={15}
                      />

                      <span>
                        {report.fileName}
                      </span>

                    </div>

                  )}


                  {/* ACTIONS */}

                  <div className="report-actions">

                    <button
                      className="view-report-btn"
                      onClick={() =>
                        setSelectedReport(
                          report
                        )
                      }
                    >

                      <Eye size={16} />

                      View Details

                    </button>


                    <button
                      className="delete-report-btn"
                      disabled={
                        deletingId ===
                        report._id
                      }
                      onClick={() =>
                        handleDelete(
                          report._id
                        )
                      }
                    >

                      {deletingId ===
                      report._id ? (

                        <Loader2
                          size={16}
                          className="delete-loader"
                        />

                      ) : (

                        <Trash2
                          size={16}
                        />

                      )}

                      {deletingId ===
                      report._id
                        ? "Deleting..."
                        : "Delete"}

                    </button>

                  </div>

                </div>

              </div>

            );
          })}

        </div>

      )}


      {/* =====================================================
          DETAILS MODAL
      ===================================================== */}

      {selectedReport && (

        <div
          className="report-modal-overlay"
          onClick={() =>
            setSelectedReport(null)
          }
        >

          <div
            className="report-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <span>
                  Report Details
                </span>

                <h2>
                  {selectedReport.title}
                </h2>

              </div>

              <button
                className="close-modal"
                onClick={() =>
                  setSelectedReport(null)
                }
              >
                <X size={20} />
              </button>

            </div>


            {/* STATUS */}

            <div className="modal-status-row">

              <span
                className={`report-status ${getStatusClass(
                  selectedReport.status
                )}`}
              >
                {selectedReport.status ||
                  "Pending"}
              </span>

              <span className="modal-category">
                {selectedReport.category}
              </span>

            </div>


            {/* DESCRIPTION */}

            <div className="detail-section">

              <h4>
                <FileText size={17} />

                Description
              </h4>

              <p>
                {selectedReport.description}
              </p>

            </div>


            {/* DATE + USER */}

            <div className="detail-grid">

              <div className="detail-item">

                <Calendar size={20} />

                <div>

                  <span>
                    Submitted
                  </span>

                  <strong>
                    {formatDate(
                      selectedReport.createdAt
                    )}
                  </strong>

                </div>

              </div>


              <div className="detail-item">

                <FileText size={20} />

                <div>

                  <span>
                    Category
                  </span>

                  <strong>
                    {selectedReport.category}
                  </strong>

                </div>

              </div>

            </div>


            {/* LOCATION */}

            <div className="detail-section">

              <h4>
                <MapPin size={17} />

                Location
              </h4>


              {selectedReport.latitude !==
                null &&
              selectedReport.longitude !==
                null ? (

                <>

                  <p className="coordinates">

                    Latitude:{" "}
                    {selectedReport.latitude}

                    <br />

                    Longitude:{" "}
                    {selectedReport.longitude}

                  </p>


                  <a
                    href={`https://www.google.com/maps?q=${selectedReport.latitude},${selectedReport.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-link"
                  >

                    <ExternalLink
                      size={15}
                    />

                    Open in Google Maps

                  </a>

                </>

              ) : (

                <div className="no-location">

                  <MapPin size={16} />

                  Location not available

                </div>

              )}

            </div>


            {/* ATTACHMENT */}

            {selectedReport.fileUrl && (

              <div className="detail-section">

                <h4>
                  <FileText size={17} />

                  Attachment
                </h4>


                {/\.(jpg|jpeg|png|webp)$/i.test(
                  selectedReport.fileName ||
                    selectedReport.fileUrl
                ) ? (

                  <img
                    src={getFileUrl(
                      selectedReport.fileUrl
                    )}
                    alt={
                      selectedReport.fileName ||
                      "Report attachment"
                    }
                    className="modal-report-image"
                  />

                ) : (

                  <div className="pdf-file">

                    <FileText size={35} />

                    <span>
                      {selectedReport.fileName ||
                        "Attached file"}
                    </span>

                  </div>

                )}


                <a
                  href={getFileUrl(
                    selectedReport.fileUrl
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="attachment-link"
                >

                  <ExternalLink
                    size={15}
                  />

                  Open Attachment

                </a>

              </div>

            )}


            {/* MODAL ACTIONS */}

            <div className="modal-actions">

              <button
                className="modal-delete-btn"
                disabled={
                  deletingId ===
                  selectedReport._id
                }
                onClick={() =>
                  handleDelete(
                    selectedReport._id
                  )
                }
              >

                {deletingId ===
                selectedReport._id ? (

                  <Loader2
                    size={17}
                    className="delete-loader"
                  />

                ) : (

                  <Trash2 size={17} />

                )}

                {deletingId ===
                selectedReport._id
                  ? "Deleting..."
                  : "Delete Report"}

              </button>


              <button
                className="modal-close-btn"
                onClick={() =>
                  setSelectedReport(null)
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}


export default Reports;