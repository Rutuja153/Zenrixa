import {
  ArrowLeft,
  Search,
  MapPin,
  Navigation,
  Share2,
  Square,
  Users,
  Loader2,
} from "lucide-react";

import {
  useEffect,
  useState,
  useRef,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import axios from "axios";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import "../Style/Tracking.css";

import socket from "../socket";

import { API_URL } from "../config.js";

// =====================================================
// MARKER
// =====================================================

const markerIcon =
  new L.Icon({
    iconUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

    iconSize: [25, 41],

    iconAnchor: [12, 41],

    popupAnchor: [1, -34],

    shadowSize: [41, 41],
  });

// =====================================================
// CHANGE MAP VIEW
// =====================================================

function ChangeView({
  center,
  zoom = 16,
}) {
  const map = useMap();

  useEffect(() => {
    if (
      Array.isArray(center) &&
      center.length === 2 &&
      Number.isFinite(center[0]) &&
      Number.isFinite(center[1])
    ) {
      map.flyTo(
        center,
        zoom,
        {
          duration: 0.7,
        }
      );
    }
  }, [
    center,
    zoom,
    map,
  ]);

  return null;
}

// =====================================================
// TRACKING
// =====================================================

function Tracking() {
  const navigate = useNavigate();

  // ===================================================
  // USER
  // ===================================================

  const getCurrentUserId = () => {
    const userId =
      localStorage.getItem(
        "userId"
      );

    if (
      userId &&
      userId.trim() !== ""
    ) {
      return userId.trim();
    }

    try {
      const savedUser =
        localStorage.getItem(
          "user"
        );

      if (savedUser) {
        const parsedUser =
          JSON.parse(
            savedUser
          );

        const backupUserId =
          parsedUser?._id ||
          parsedUser?.id ||
          parsedUser?.userId;

        if (backupUserId) {
          return String(
            backupUserId
          ).trim();
        }
      }
    } catch (error) {
      console.error(
        "❌ User read error:",
        error
      );
    }

    return null;
  };

  // ===================================================
  // LOCATION
  // ===================================================

  const [location, setLocation] =
    useState([
      18.5204,
      73.8567,
    ]);

  const [accuracy, setAccuracy] =
    useState(null);

  // ===================================================
  // SEARCH
  // ===================================================

  const [searchText, setSearchText] =
    useState("");

  const [searchResults, setSearchResults] =
    useState([]);

  const [searching, setSearching] =
    useState(false);

  const [selectedPlace, setSelectedPlace] =
    useState(null);

  // ===================================================
  // SHARING
  // ===================================================

  const [sharing, setSharing] =
    useState(false);

  const [shareId, setShareId] =
    useState(null);

  const [startingShare, setStartingShare] =
    useState(false);

  const [stoppingShare, setStoppingShare] =
    useState(false);

  const watchIdRef =
    useRef(null);

  // ===================================================
  // CONTACTS
  // ===================================================

  const [contacts, setContacts] =
    useState([]);

  const [loadingContacts, setLoadingContacts] =
    useState(true);

  // ===================================================
  // GET CONTACTS
  // ===================================================

  const getContacts =
    async () => {
      try {
        setLoadingContacts(true);

        const userId =
          getCurrentUserId();

        if (!userId) {
          setContacts([]);
          return;
        }

        const response =
          await axios.get(
            `${API_URL}/api/contact/all`,
            {
              params: {
                userId,
              },
            }
          );

        if (
          response.data?.success
        ) {
          setContacts(
            Array.isArray(
              response.data.contacts
            )
              ? response.data.contacts
              : []
          );
        } else {
          setContacts([]);
        }
      } catch (error) {
        console.error(
          "❌ Contacts error:",
          error.response?.data ||
            error.message
        );

        setContacts([]);
      } finally {
        setLoadingContacts(false);
      }
    };

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    getContacts();
  }, []);

  // ===================================================
  // REGISTER SOCKET
  // ===================================================

  useEffect(() => {
    const userId =
      getCurrentUserId();

    if (!userId) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit(
      "registerUser",
      userId
    );

    console.log(
      "🔌 Tracking registered:",
      userId
    );

    return () => {
      socket.off(
        "receiveLocation"
      );

      socket.off(
        "locationShared"
      );

      socket.off(
        "locationStopped"
      );
    };
  }, []);

  // ===================================================
  // RECEIVE LIVE LOCATION
  // ===================================================

  useEffect(() => {
    const handleLocation =
      (data) => {
        if (!data) return;

        const lat =
          Number(
            data.latitude
          );

        const lng =
          Number(
            data.longitude
          );

        if (
          Number.isFinite(lat) &&
          Number.isFinite(lng)
        ) {
          setLocation([
            lat,
            lng,
          ]);

          if (
            data.accuracy !==
              undefined &&
            data.accuracy !== null
          ) {
            setAccuracy(
              Number(
                data.accuracy
              )
            );
          }
        }
      };

    const handleShared =
      (data) => {
        console.log(
          "📤 Location shared:",
          data
        );
      };

    const handleStopped =
      (data) => {
        console.log(
          "🛑 Location stopped:",
          data
        );
      };

    socket.on(
      "receiveLocation",
      handleLocation
    );

    socket.on(
      "locationShared",
      handleShared
    );

    socket.on(
      "locationStopped",
      handleStopped
    );

    return () => {
      socket.off(
        "receiveLocation",
        handleLocation
      );

      socket.off(
        "locationShared",
        handleShared
      );

      socket.off(
        "locationStopped",
        handleStopped
      );
    };
  }, []);

  // ===================================================
  // GET CURRENT GPS
  // ===================================================

  const getCurrentLocation =
    () => {
      return new Promise(
        (
          resolve,
          reject
        ) => {
          if (
            !navigator.geolocation
          ) {
            reject(
              new Error(
                "Geolocation is not supported by this browser."
              )
            );

            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lat =
                position.coords
                  .latitude;

              const lng =
                position.coords
                  .longitude;

              const acc =
                position.coords
                  .accuracy;

              setLocation([
                lat,
                lng,
              ]);

              setAccuracy(acc);

              resolve({
                latitude: lat,
                longitude: lng,
                accuracy: acc,
              });
            },
            (error) => {
              console.error(
                "❌ GPS error:",
                error
              );

              reject(error);
            },
            {
              enableHighAccuracy: true,

              timeout: 15000,

              maximumAge: 0,
            }
          );
        }
      );
    };

  // ===================================================
  // SEARCH LOCATION
  // ===================================================

  const searchLocation =
    async () => {
      const query =
        searchText.trim();

      if (!query) {
        return;
      }

      try {
        setSearching(true);

        setSearchResults([]);

        const response =
          await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
              params: {
                q: query,
                format: "json",
                addressdetails: 1,
                limit: 5,
              },

              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        const results =
          Array.isArray(
            response.data
          )
            ? response.data
            : [];

        setSearchResults(
          results
        );

        if (
          results.length === 0
        ) {
          window.alert(
            "No location found. Please try another search."
          );
        }
      } catch (error) {
        console.error(
          "❌ Location search error:",
          error
        );

        window.alert(
          "Unable to search location."
        );
      } finally {
        setSearching(false);
      }
    };

  // ===================================================
  // SELECT SEARCH RESULT
  // ===================================================

  const selectSearchResult =
    (place) => {
      const lat =
        Number(place.lat);

      const lng =
        Number(place.lon);

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)
      ) {
        return;
      }

      setLocation([
        lat,
        lng,
      ]);

      setSelectedPlace(
        place
      );

      setSearchResults([]);

      setSearchText(
        place.display_name
      );
    };

  // ===================================================
  // SEARCH ENTER
  // ===================================================

  const handleSearchKeyDown =
    (event) => {
      if (
        event.key ===
        "Enter"
      ) {
        searchLocation();
      }
    };

  // ===================================================
  // USE MY LOCATION
  // ===================================================

  const handleUseMyLocation =
    async () => {
      try {
        const current =
          await getCurrentLocation();

        setSelectedPlace({
          display_name:
            "Your current location",
        });

        setSearchText(
          "My Current Location"
        );

        console.log(
          "📍 Current location:",
          current
        );
      } catch (error) {
        window.alert(
          "Unable to get your current location. Please allow location permission."
        );
      }
    };

  // ===================================================
  // SAVE LOCATION
  // ===================================================

  const saveCurrentLocation =
    async (
      current,
      currentShareId
    ) => {
      try {
        const userId =
          getCurrentUserId();

        if (!userId) {
          throw new Error(
            "User ID not found."
          );
        }

        await axios.post(
          `${API_URL}/api/location/save`,
          {
            userId,

            latitude:
              current.latitude,

            longitude:
              current.longitude,

            accuracy:
              current.accuracy,

            sharing: true,

            shareId:
              currentShareId,
          }
        );

        return true;
      } catch (error) {
        console.error(
          "❌ Save live location error:",
          error.response?.data ||
            error.message
        );

        return false;
      }
    };

  // ===================================================
  // START GPS WATCH
  // ===================================================

  const startGPSWatch =
    (currentShareId) => {
      if (
        !navigator.geolocation
      ) {
        window.alert(
          "Geolocation is not supported."
        );

        return;
      }

      if (
        watchIdRef.current !==
        null
      ) {
        navigator.geolocation.clearWatch(
          watchIdRef.current
        );
      }

      watchIdRef.current =
        navigator.geolocation.watchPosition(
          async (
            position
          ) => {
            const lat =
              position.coords
                .latitude;

            const lng =
              position.coords
                .longitude;

            const acc =
              position.coords
                .accuracy;

            const current = {
              latitude: lat,
              longitude: lng,
              accuracy: acc,
            };

            // Update map
            setLocation([
              lat,
              lng,
            ]);

            setAccuracy(acc);

            // Save database
            await saveCurrentLocation(
              current,
              currentShareId
            );

            // Send live Socket.IO location
            const userId =
              getCurrentUserId();

            socket.emit(
              "sendLocation",
              {
                userId,

                latitude: lat,

                longitude: lng,

                accuracy: acc,

                shareId:
                  currentShareId,
              }
            );
          },
          (error) => {
            console.error(
              "❌ Live GPS error:",
              error
            );

            if (
              error.code === 1
            ) {
              window.alert(
                "Location permission was denied. Sharing cannot continue."
              );
            }
          },
          {
            enableHighAccuracy: true,

            maximumAge: 5000,

            timeout: 15000,
          }
        );
    };

  // ===================================================
  // SHARE LOCATION
  // ===================================================

  const handleShareLocation =
    async () => {
      if (sharing) {
        return;
      }

      if (
        contacts.length === 0
      ) {
        const shouldContinue =
          window.confirm(
            "No trusted contacts are added. Do you want to start location sharing anyway?"
          );

        if (!shouldContinue) {
          return;
        }
      }

      try {
        setStartingShare(true);

        // Get real GPS first
        const current =
          await getCurrentLocation();

        const userId =
          getCurrentUserId();

        if (!userId) {
          window.alert(
            "User ID not found. Please login again."
          );

          return;
        }

        // Start sharing in backend
        const response =
          await axios.post(
            `${API_URL}/api/location/share/start`,
            {
              userId,

              latitude:
                current.latitude,

              longitude:
                current.longitude,

              accuracy:
                current.accuracy,
            }
          );

        if (
          !response.data?.success
        ) {
          throw new Error(
            response.data?.message ||
              "Unable to start sharing"
          );
        }

        const newShareId =
          response.data.shareId;

        setShareId(
          newShareId
        );

        setSharing(true);

        // Socket notification
        socket.emit(
          "locationShared",
          {
            userId,

            shareId:
              newShareId,

            latitude:
              current.latitude,

            longitude:
              current.longitude,

            accuracy:
              current.accuracy,

            mapsUrl:
              response.data.mapsUrl,

            contacts:
              response.data.contacts ||
              [],
          }
        );

        // Start continuous GPS
        startGPSWatch(
          newShareId
        );

        // Successful alert
        window.alert(
          `✅ Location shared successfully!\n\nSent to ${response.data.contactCount || contacts.length} trusted contact(s).`
        );
      } catch (error) {
        console.error(
          "❌ Share Location Error:",
          error.response?.data ||
            error.message
        );

        window.alert(
          error.response?.data
            ?.message ||
            error.message ||
            "Unable to share location."
        );
      } finally {
        setStartingShare(false);
      }
    };

  // ===================================================
  // STOP LOCATION
  // ===================================================

  const handleStopLocation =
    async () => {
      if (stoppingShare) {
        return;
      }

      try {
        setStoppingShare(true);

        const userId =
          getCurrentUserId();

        // Stop browser GPS
        if (
          watchIdRef.current !==
          null
        ) {
          navigator.geolocation.clearWatch(
            watchIdRef.current
          );

          watchIdRef.current =
            null;
        }

        // Stop backend sharing
        if (userId) {
          await axios.post(
            `${API_URL}/api/location/share/stop`,
            {
              userId,

              shareId:
                shareId || null,
            }
          );

          // Socket notification
          socket.emit(
            "stopLocation",
            {
              userId,

              shareId:
                shareId || null,
            }
          );
        }

        setSharing(false);

        setShareId(null);

        // Actual stop
        window.alert(
          "🛑 Location sharing stopped successfully."
        );

        // Go Home
        navigate(
          "/home"
        );
      } catch (error) {
        console.error(
          "❌ Stop sharing error:",
          error.response?.data ||
            error.message
        );

        // Still stop browser GPS
        if (
          watchIdRef.current !==
          null
        ) {
          navigator.geolocation.clearWatch(
            watchIdRef.current
          );

          watchIdRef.current =
            null;
        }

        setSharing(false);

        window.alert(
          "Location sharing stopped."
        );

        navigate(
          "/home"
        );
      } finally {
        setStoppingShare(false);
      }
    };

  // ===================================================
  // CLEANUP
  // ===================================================

  useEffect(() => {
    return () => {
      if (
        watchIdRef.current !==
        null
      ) {
        navigator.geolocation.clearWatch(
          watchIdRef.current
        );

        watchIdRef.current =
          null;
      }
    };
  }, []);

  // ===================================================
  // IMAGE
  // ===================================================

  const getImage =
    (image) => {
      if (
        image &&
        typeof image ===
          "string" &&
        image.trim() !== ""
      ) {
        return image;
      }

      return "https://i.pravatar.cc/60";
    };

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="tracking-page">

      {/* =========================================
          HEADER
      ========================================== */}

      <div className="tracking-header">

        <ArrowLeft
          size={28}
          className="back-btn"
          onClick={() =>
            navigate("/home")
          }
        />

        <h2>
          Live Tracking
        </h2>

      </div>

      {/* =========================================
          SEARCH
      ========================================== */}

      <div className="tracking-search">

        <div className="search-box">

          <Search
            size={20}
          />

          <input
            type="text"
            placeholder="Search any location..."
            value={
              searchText
            }
            onChange={(event) =>
              setSearchText(
                event.target.value
              )
            }
            onKeyDown={
              handleSearchKeyDown
            }
          />

          <button
            onClick={
              searchLocation
            }
            disabled={
              searching ||
              !searchText.trim()
            }
          >
            {searching ? (
              <Loader2
                size={18}
                className="spin"
              />
            ) : (
              "Search"
            )}
          </button>

        </div>

        {/* Search results */}

        {searchResults.length >
          0 && (

          <div className="search-results">

            {searchResults.map(
              (
                place,
                index
              ) => (

                <div
                  key={
                    place.place_id ||
                    index
                  }
                  className="search-result"
                  onClick={() =>
                    selectSearchResult(
                      place
                    )
                  }
                >

                  <MapPin
                    size={18}
                  />

                  <div>

                    <strong>
                      {
                        place.display_name
                      }
                    </strong>

                    <small>
                      {
                        place.type ||
                        "Location"
                      }
                    </small>

                  </div>

                </div>

              )
            )}

          </div>
        )}

        {/* Current location */}

        <button
          className="current-location-btn"
          onClick={
            handleUseMyLocation
          }
        >
          <Navigation
            size={18}
          />

          Use My Current Location
        </button>

      </div>

      {/* =========================================
          STATUS
      ========================================== */}

      <div
        className={`tracking-status ${
          sharing
            ? "sharing-active"
            : "sharing-inactive"
        }`}
      >

        <span className="green-dot"></span>

        <p>
          {sharing
            ? "Your live location is being shared"
            : "Location sharing is stopped"}
        </p>

      </div>

      {/* =========================================
          MAP
      ========================================== */}

      <div className="map-container">

        <MapContainer
          center={location}
          zoom={16}
          style={{
            height: "100%",
            width: "100%",
          }}
        >

          <ChangeView
            center={location}
            zoom={16}
          />

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker
            position={location}
            icon={markerIcon}
          >

            <Popup>

              <strong>
                Zenrixa Location
              </strong>

              <br />

              Latitude:
              {" "}
              {location[0].toFixed(
                6
              )}

              <br />

              Longitude:
              {" "}
              {location[1].toFixed(
                6
              )}

              {accuracy && (
                <>
                  <br />

                  Accuracy:
                  {" "}
                  {Math.round(
                    accuracy
                  )}
                  m
                </>
              )}

              {selectedPlace && (
                <>
                  <br />
                  <br />

                  {selectedPlace.display_name}
                </>
              )}

            </Popup>

          </Marker>

        </MapContainer>

      </div>

      {/* =========================================
          LOCATION INFO
      ========================================== */}

      <div className="location-info">

        <div>
          <strong>
            Latitude
          </strong>

          <span>
            {location[0].toFixed(
              6
            )}
          </span>
        </div>

        <div>
          <strong>
            Longitude
          </strong>

          <span>
            {location[1].toFixed(
              6
            )}
          </span>
        </div>

        {accuracy && (
          <div>
            <strong>
              Accuracy
            </strong>

            <span>
              {Math.round(
                accuracy
              )}
              m
            </span>
          </div>
        )}

      </div>

      {/* =========================================
          TRUSTED CONTACTS
      ========================================== */}

      <div className="contacts">

        <div className="contact-header">

          <h4>

            <Users
              size={18}
            />

            Sharing with{" "}
            {contacts.length}{" "}
            Trusted{" "}
            {contacts.length ===
            1
              ? "Contact"
              : "Contacts"}

          </h4>

          <span
            onClick={() =>
              navigate(
                "/contact"
              )
            }
          >
            View &gt;
          </span>

        </div>

        <div className="contact-list">

          {loadingContacts ? (

            <p>
              Loading trusted contacts...
            </p>

          ) : contacts.length ===
            0 ? (

            <div className="no-tracking-contacts">

              <p>
                No trusted contacts added yet.
              </p>

              <button
                onClick={() =>
                  navigate(
                    "/contact"
                  )
                }
              >
                Add Trusted Contact
              </button>

            </div>

          ) : (

            contacts.map(
              (
                contact
              ) => (

                <div
                  className="contact"
                  key={
                    contact._id
                  }
                >

                  <img
                    src={getImage(
                      contact.image
                    )}
                    alt={
                      contact.name
                    }
                    onError={(
                      event
                    ) => {
                      event.currentTarget.src =
                        "https://i.pravatar.cc/60";
                    }}
                  />

                  <p>
                    {
                      contact.name
                    }
                  </p>

                </div>

              )
            )

          )}

        </div>

      </div>

      {/* =========================================
          BOTTOM BUTTONS
      ========================================== */}

      <div className="tracking-actions">

        {/* SHARE */}

        <button
          className="share-location-btn"
          onClick={
            handleShareLocation
          }
          disabled={
            sharing ||
            startingShare
          }
        >

          {startingShare ? (

            <Loader2
              size={20}
              className="spin"
            />

          ) : (

            <Share2
              size={20}
            />

          )}

          {startingShare
            ? "Sharing..."
            : sharing
            ? "Location Shared"
            : "Share Location"}

        </button>

        {/* STOP */}

        <button
          className="stop-location-btn"
          onClick={
            handleStopLocation
          }
          disabled={
            !sharing ||
            stoppingShare
          }
        >

          {stoppingShare ? (

            <Loader2
              size={20}
              className="spin"
            />

          ) : (

            <Square
              size={18}
            />

          )}

          {stoppingShare
            ? "Stopping..."
            : "Stop Location"}

        </button>

      </div>

    </div>
  );
}

export default Tracking;