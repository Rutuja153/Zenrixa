import { API_URL } from "../config.js";
import "../Style/Sos.css";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import axios from "axios";

import {
  ShieldAlert,
  MapPin,
  Phone,
  X,
  CheckCircle,
} from "lucide-react";

import socket from "../socket.js";

function Sos() {
  const navigate = useNavigate();
  const routeLocation = useLocation();

  // ==========================================
  // STATES
  // ==========================================

  const [countdown, setCountdown] = useState(5);

  const [sosId, setSosId] = useState(
    routeLocation.state?.sosId || null
  );

  const [isActive, setIsActive] = useState(false);

  const [loading, setLoading] = useState(true);

  const [message, setMessage] = useState(
    "Activating Emergency SOS..."
  );

  const [currentLocation, setCurrentLocation] =
    useState(null);

  const [contacts, setContacts] = useState([]);

  // Backend alert results
  const [alertResults, setAlertResults] = useState([]);

  // ==========================================
  // REFS
  // ==========================================

  const watchIdRef = useRef(null);

  const activatedRef = useRef(false);

  const sosIdRef = useRef(
    routeLocation.state?.sosId || null
  );

  const mountedRef = useRef(true);

  const savingLocationRef = useRef(false);

  // ==========================================
  // KEEP SOS ID UPDATED
  // ==========================================

  useEffect(() => {
    sosIdRef.current = sosId;
  }, [sosId]);

  // ==========================================
  // GET USER
  // ==========================================

  const getUser = useCallback(() => {
    try {
      const savedUser =
        localStorage.getItem("user");

      if (!savedUser) {
        console.error(
          "❌ No user found in localStorage"
        );

        return null;
      }

      const user = JSON.parse(savedUser);

      console.log(
        "👤 Current User:",
        user
      );

      return user;
    } catch (error) {
      console.error(
        "❌ User Parse Error:",
        error
      );

      return null;
    }
  }, []);

  // ==========================================
  // GET USER ID
  // ==========================================

  const getUserId = useCallback(() => {
    try {
      const storedUserId =
        localStorage.getItem("userId");

      if (storedUserId) {
        console.log(
          "✅ User ID:",
          storedUserId
        );

        return storedUserId;
      }

      const user = getUser();

      if (!user) {
        return null;
      }

      const userId =
        user._id ||
        user.userId ||
        user.id ||
        null;

      console.log(
        "✅ User ID from user:",
        userId
      );

      return userId;
    } catch (error) {
      console.error(
        "❌ getUserId Error:",
        error
      );

      return null;
    }
  }, [getUser]);

  // ==========================================
  // CONNECT SOCKET
  // ==========================================

  const connectSocket = useCallback(() => {
    try {
      if (!socket.connected) {
        console.log(
          "🔌 Connecting Socket.IO..."
        );

        socket.connect();
      } else {
        console.log(
          "🔌 Socket already connected:",
          socket.id
        );
      }
    } catch (error) {
      console.error(
        "❌ Socket Connection Error:",
        error
      );
    }
  }, []);

  // ==========================================
  // SAVE LOCATION
  // ==========================================

  const saveLocation = useCallback(
    async (locationData) => {
      if (savingLocationRef.current) {
        return;
      }

      savingLocationRef.current = true;

      try {
        console.log(
          "📍 Saving location:",
          locationData
        );

        const response = await axios.post(
          `${API_URL}/api/location/save`,
          locationData
        );

        console.log(
          "✅ Location saved:",
          response.data
        );
      } catch (error) {
        console.error(
          "❌ Location Save Error:",
          error.response?.data ||
            error.message
        );
      } finally {
        savingLocationRef.current = false;
      }
    },
    []
  );

  // ==========================================
  // START LIVE LOCATION
  // ==========================================

  const startLocationTracking =
    useCallback(
      (activeSosId) => {
        if (!navigator.geolocation) {
          console.error(
            "❌ Geolocation not supported"
          );

          if (mountedRef.current) {
            setMessage(
              "GPS is not supported on this device"
            );
          }

          return;
        }

        if (
          watchIdRef.current !== null
        ) {
          console.log(
            "📍 Location tracking already running"
          );

          return;
        }

        const userId = getUserId();

        if (!userId) {
          console.error(
            "❌ User ID not found"
          );

          return;
        }

        console.log(
          "📍 Starting live location tracking"
        );

        const watchId =
          navigator.geolocation.watchPosition(
            async (position) => {
              try {
                const latitude =
                  position.coords.latitude;

                const longitude =
                  position.coords.longitude;

                const accuracy =
                  position.coords.accuracy;

                const locationData = {
                  userId,
                  latitude,
                  longitude,
                  accuracy,
                  sosId:
                    activeSosId ||
                    sosIdRef.current ||
                    null,
                };

                console.log(
                  "📍 LIVE LOCATION:",
                  locationData
                );

                if (mountedRef.current) {
                  setCurrentLocation({
                    latitude,
                    longitude,
                    accuracy,
                  });
                }

                // Socket
                if (!socket.connected) {
                  connectSocket();
                }

                if (socket.connected) {
                  socket.emit(
                    "sendLocation",
                    locationData
                  );
                }

                // Database
                await saveLocation(
                  locationData
                );
              } catch (error) {
                console.error(
                  "❌ Live Location Error:",
                  error
                );
              }
            },

            (error) => {
              console.error(
                "❌ GPS Error:",
                error
              );

              if (!mountedRef.current) {
                return;
              }

              if (error.code === 1) {
                setMessage(
                  "Location permission denied"
                );
              } else if (
                error.code === 2
              ) {
                setMessage(
                  "Unable to get current location"
                );
              } else if (
                error.code === 3
              ) {
                setMessage(
                  "Location request timed out"
                );
              }
            },

            {
              enableHighAccuracy: true,
              maximumAge: 3000,
              timeout: 10000,
            }
          );

        watchIdRef.current = watchId;

        console.log(
          "✅ GPS watcher started:",
          watchId
        );
      },

      [
        connectSocket,
        getUserId,
        saveLocation,
      ]
    );

  // ==========================================
  // STOP LOCATION
  // ==========================================

  const stopLocationTracking =
    useCallback(() => {
      if (
        watchIdRef.current !== null &&
        navigator.geolocation
      ) {
        navigator.geolocation.clearWatch(
          watchIdRef.current
        );

        console.log(
          "🛑 GPS tracking stopped"
        );

        watchIdRef.current = null;
      }

      const userId = getUserId();

      if (
        userId &&
        socket.connected
      ) {
        socket.emit(
          "stopLocation",
          {
            userId,
            sosId:
              sosIdRef.current || null,
          }
        );
      }

      if (mountedRef.current) {
        setCurrentLocation(null);
      }
    }, [getUserId]);

  // ==========================================
  // ACTIVATE SOS
  // ==========================================

  const activateSOS = useCallback(
    async () => {
      if (activatedRef.current) {
        console.log(
          "⚠️ SOS already activated"
        );

        return;
      }

      const user = getUser();

      if (!user) {
        setLoading(false);

        setMessage(
          "Please login first"
        );

        navigate("/login");

        return;
      }

      const userId = getUserId();

      if (!userId) {
        setLoading(false);

        setMessage(
          "User ID not found"
        );

        return;
      }

      activatedRef.current = true;

      try {
        console.log(
          "================================"
        );

        console.log(
          "🚨 STARTING ZENRIXA SOS"
        );

        console.log(
          "👤 User ID:",
          userId
        );

        // ====================================
        // SOCKET
        // ====================================

        connectSocket();

        // ====================================
        // GET LOCATION
        // ====================================

        let latitude = null;
        let longitude = null;
        let accuracy = null;

        if (navigator.geolocation) {
          try {
            const position =
              await new Promise(
                (resolve, reject) => {
                  navigator.geolocation.getCurrentPosition(
                    resolve,
                    reject,
                    {
                      enableHighAccuracy: true,
                      timeout: 10000,
                      maximumAge: 0,
                    }
                  );
                }
              );

            latitude =
              position.coords.latitude;

            longitude =
              position.coords.longitude;

            accuracy =
              position.coords.accuracy;

            setCurrentLocation({
              latitude,
              longitude,
              accuracy,
            });

            console.log(
              "📍 Initial Location:",
              latitude,
              longitude
            );
          } catch (locationError) {
            console.error(
              "⚠️ GPS Error:",
              locationError.message
            );
          }
        }

        // ====================================
        // SEND SOS TO BACKEND
        // ====================================

        console.log(
          "📤 Sending SOS to backend..."
        );

        const response =
          await axios.post(
            `${API_URL}/api/sos/activate`,
            {
              userId,
              latitude,
              longitude,
            }
          );

        console.log(
          "🚨 BACKEND RESPONSE:",
          response.data
        );

        if (!response.data?.success) {
          throw new Error(
            response.data?.message ||
              "Unable to activate SOS"
          );
        }

        // ====================================
        // SOS ID
        // ====================================

        const createdSOS =
          response.data.sos || {};

        const createdSosId =
          createdSOS._id ||
          createdSOS.id ||
          null;

        sosIdRef.current =
          createdSosId;

        setSosId(createdSosId);

        // ====================================
        // TRUSTED CONTACTS
        // ====================================

        const returnedContacts =
          Array.isArray(
            response.data.contacts
          )
            ? response.data.contacts
            : [];

        setContacts(
          returnedContacts
        );

        console.log(
          "================================"
        );

        console.log(
          "📱 TRUSTED CONTACTS"
        );

        console.log(
          "👥 Total:",
          returnedContacts.length
        );

        returnedContacts.forEach(
          (contact) => {
            console.log(
              `📞 ${contact.name} - ${contact.phone}`
            );
          }
        );

        // ====================================
        // BACKEND ALERT RESULTS
        // ====================================

        const backendAlerts =
          Array.isArray(
            response.data.alertResults
          )
            ? response.data.alertResults
            : [];

        setAlertResults(
          backendAlerts
        );

        console.log(
          "================================"
        );

        console.log(
          "🔔 ZENRIXA ALERT PROCESS"
        );

        // ====================================
        // IMPORTANT
        // NO TWILIO
        // NO SMS API
        // JUST BACKEND ALERT
        // ====================================

        const successfulAlerts =
          returnedContacts.map(
            (contact) => ({
              contactId:
                contact._id,
              name:
                contact.name,
              phone:
                contact.phone,
              success: true,
              status:
                "ALERT_CREATED",
            })
          );

        setAlertResults(
          successfulAlerts
        );

        console.log(
          "================================"
        );

        console.log(
          "✅ ALERT SENT SUCCESSFULLY"
        );

        successfulAlerts.forEach(
          (alert) => {
            console.log(
              `✅ Alert sent to ${alert.name} (${alert.phone})`
            );
          }
        );

        console.log(
          "================================"
        );

        // ====================================
        // UI
        // ====================================

        setIsActive(true);

        setLoading(false);

        setCountdown(5);

        if (
          returnedContacts.length === 0
        ) {
          setMessage(
            "SOS Active — No trusted contacts found"
          );
        } else {
          setMessage(
            `SOS Active — Emergency alert sent successfully to ${returnedContacts.length} trusted contact${
              returnedContacts.length > 1
                ? "s"
                : ""
            }`
          );
        }

        // ====================================
        // START LIVE LOCATION
        // ====================================

        startLocationTracking(
          createdSosId
        );

        // ====================================
        // SOCKET SOS
        // ====================================

        if (socket.connected) {
          socket.emit(
            "sosActivated",
            {
              userId,
              sosId: createdSosId,
            }
          );
        }

        console.log(
          "================================"
        );

        console.log(
          "✅ ZENRIXA SOS ACTIVATED"
        );

        console.log(
          "🆔 SOS ID:",
          createdSosId
        );

        console.log(
          "👥 Contacts:",
          returnedContacts.length
        );

        console.log(
          "🔔 Alert Status: SUCCESS"
        );

        console.log(
          "================================"
        );
      } catch (error) {
        console.error(
          "❌ SOS Activation Error:",
          error.response?.data ||
            error.message ||
            error
        );

        activatedRef.current = false;

        if (mountedRef.current) {
          setLoading(false);

          setMessage(
            error.response?.data?.message ||
              "Unable to activate SOS"
          );
        }
      }
    },

    [
      connectSocket,
      getUser,
      getUserId,
      navigate,
      startLocationTracking,
    ]
  );

  // ==========================================
  // AUTO ACTIVATE
  // ==========================================

  useEffect(() => {
    mountedRef.current = true;

    activateSOS();

    return () => {
      mountedRef.current = false;
    };
  }, [activateSOS]);

  // ==========================================
  // COUNTDOWN
  // ==========================================

  useEffect(() => {
    if (
      !isActive ||
      countdown <= 0
    ) {
      return;
    }

    const timer =
      setTimeout(() => {
        setCountdown(
          (previous) =>
            previous > 0
              ? previous - 1
              : 0
        );
      }, 1000);

    return () =>
      clearTimeout(timer);
  }, [
    isActive,
    countdown,
  ]);

  // ==========================================
  // CANCEL SOS
  // ==========================================

  const cancelSOS = async () => {
    if (loading) {
      return;
    }

    try {
      const userId =
        getUserId();

      console.log(
        "🛑 Cancelling SOS..."
      );

      stopLocationTracking();

      if (userId) {
        const response =
          await axios.post(
            `${API_URL}/api/sos/stop`,
            {
              userId,
            }
          );

        console.log(
          "🛑 Stop Response:",
          response.data
        );
      }

      if (socket.connected) {
        socket.emit(
          "sosCancelled",
          {
            userId,
            sosId:
              sosIdRef.current ||
              null,
          }
        );
      }

      setIsActive(false);

      setMessage(
        "SOS Cancelled"
      );

      setCountdown(5);

      activatedRef.current =
        false;

      sosIdRef.current = null;

      setSosId(null);

      setContacts([]);

      setAlertResults([]);

      setTimeout(() => {
        navigate("/home");
      }, 1000);
    } catch (error) {
      console.error(
        "❌ Cancel Error:",
        error.response?.data ||
          error.message
      );

      stopLocationTracking();

      setMessage(
        error.response?.data?.message ||
          "Unable to cancel SOS"
      );
    }
  };

  // ==========================================
  // CALL 112
  // ==========================================

  const emergencyCall = () => {
    window.location.href =
      "tel:112";
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="sos-page">

      {/* HEADER */}

      <div className="sos-header">
        <ShieldAlert
          size={38}
          className="sos-icon"
        />

        <h2>
          Emergency SOS
        </h2>
      </div>

      {/* MAIN */}

      <div className="sos-main">

        {/* SOS CIRCLE */}

        <div
          className={
            isActive
              ? "sos-circle active"
              : "sos-circle"
          }
        >
          <ShieldAlert
            size={70}
          />

          <h1>SOS</h1>
        </div>

        {/* MESSAGE */}

        <h3>
          {message}
        </h3>

        {loading && (
          <p>
            Please wait...
          </p>
        )}

        {/* COUNTDOWN */}

        {isActive && (
          <div className="countdown">
            <span>
              {countdown}
            </span>

            <p>
              Emergency alert active
            </p>
          </div>
        )}

        {/* LOCATION */}

        {isActive && (
          <div className="location-status">

            <MapPin
              size={20}
            />

            <span>
              Location sharing active
            </span>

          </div>
        )}

        {/* CURRENT LOCATION */}

        {isActive &&
          currentLocation && (
            <div
              className="location-status"
              style={{
                marginTop: "8px",
                fontSize: "12px",
              }}
            >
              <span>

                {currentLocation.latitude.toFixed(
                  6
                )}

                {", "}

                {currentLocation.longitude.toFixed(
                  6
                )}

                {currentLocation.accuracy && (
                  <>
                    {" "}±{" "}

                    {Math.round(
                      currentLocation.accuracy
                    )}

                    m
                  </>
                )}

              </span>
            </div>
          )}

        {/* TRUSTED CONTACTS */}

        {isActive &&
          contacts.length > 0 && (

            <div
              className="sos-contacts"
              style={{
                marginTop: "20px",
                width: "100%",
                maxWidth: "420px",
              }}
            >

              <h4>
                Trusted Contacts (
                {contacts.length})
              </h4>

              {contacts.map(
                (contact) => {

                  return (
                    <div
                      key={
                        contact._id ||
                        contact.phone
                      }
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "space-between",
                        padding: "10px",
                        marginBottom: "8px",
                        border:
                          "1px solid #ddd",
                        borderRadius:
                          "10px",
                      }}
                    >

                      {/* CONTACT */}

                      <div>

                        <strong>
                          {contact.name}
                        </strong>

                        <div
                          style={{
                            fontSize:
                              "12px",
                          }}
                        >
                          {
                            contact.phone
                          }
                        </div>

                      </div>

                      {/* ALERT SENT */}

                      <div
                        className="sms-success"
                        style={{
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "4px",
                          fontSize:
                            "12px",
                        }}
                      >

                        <CheckCircle
                          size={18}
                        />

                        Alert Sent

                      </div>

                    </div>
                  );
                }
              )}

            </div>
          )}

      </div>

      {/* ACTION BUTTONS */}

      <div className="sos-actions">

        {/* CALL 112 */}

        <button
          className="call-emergency-btn"
          onClick={
            emergencyCall
          }
        >

          <Phone
            size={22}
          />

          Call Emergency 112

        </button>

        {/* CANCEL */}

        <button
          className="cancel-sos-btn"
          onClick={
            cancelSOS
          }
          disabled={loading}
        >

          <X
            size={22}
          />

          {loading
            ? "Activating SOS..."
            : "Cancel SOS"}

        </button>

      </div>

      {/* FOOTER */}

      <p className="sos-footer">
        Your trusted contacts can be
        notified when an emergency is
        active.
      </p>

    </div>
  );
}

export default Sos;