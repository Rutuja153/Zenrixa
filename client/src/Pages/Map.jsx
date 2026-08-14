import {
  useEffect,
  useState,
} from "react";

import {
  ArrowLeft,
  Search,
  LocateFixed,
  MapPinned,
  Navigation,
  ExternalLink,
  Loader2,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

import "../Style/Map.css";

// =====================================================
// DEFAULT LOCATION
// Pune
// =====================================================

const DEFAULT_LOCATION = [
  18.5204,
  73.8567,
];

// =====================================================
// MARKER ICON
// =====================================================

const markerIcon =
  new L.Icon({
    iconUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

    shadowUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

    iconSize: [
      25,
      41,
    ],

    iconAnchor: [
      12,
      41,
    ],

    popupAnchor: [
      1,
      -34,
    ],

    shadowSize: [
      41,
      41,
    ],
  });

// =====================================================
// CHANGE MAP VIEW
// =====================================================

function ChangeMapView({
  location,
  zoom = 15,
}) {
  const map = useMap();

  useEffect(() => {
    if (
      Array.isArray(location) &&
      location.length === 2
    ) {
      map.flyTo(
        location,
        zoom,
        {
          duration: 0.8,
        }
      );
    }
  }, [
    location,
    zoom,
    map,
  ]);

  return null;
}

// =====================================================
// MAP CLICK HANDLER
// =====================================================

function MapClickHandler({
  onLocationSelect,
}) {
  useMapEvents({
    click(event) {
      const {
        lat,
        lng,
      } = event.latlng;

      onLocationSelect({
        lat,
        lng,
        name:
          "Selected map location",
      });
    },
  });

  return null;
}

// =====================================================
// MAP COMPONENT
// =====================================================

function Map() {
  const navigate =
    useNavigate();

  // ===================================================
  // LOCATION
  // ===================================================

  const [
    location,
    setLocation,
  ] = useState(
    DEFAULT_LOCATION
  );

  const [
    selectedLocation,
    setSelectedLocation,
  ] = useState({
    lat:
      DEFAULT_LOCATION[0],

    lng:
      DEFAULT_LOCATION[1],

    name:
      "Pune, Maharashtra",
  });

  // ===================================================
  // SEARCH
  // ===================================================

  const [
    searchText,
    setSearchText,
  ] = useState("");

  const [
    searchResults,
    setSearchResults,
  ] = useState([]);

  const [
    searching,
    setSearching,
  ] = useState(false);

  // ===================================================
  // GPS
  // ===================================================

  const [
    gettingLocation,
    setGettingLocation,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

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

        setError("");

        setSearchResults([]);

        const response =
          await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=7&q=${encodeURIComponent(
              query
            )}`,
            {
              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        if (
          !response.ok
        ) {
          throw new Error(
            "Location search failed"
          );
        }

        const data =
          await response.json();

        if (
          !Array.isArray(data) ||
          data.length === 0
        ) {
          setError(
            "No location found. Try another search."
          );

          return;
        }

        setSearchResults(
          data
        );
      } catch (err) {
        console.error(
          "Search error:",
          err
        );

        setError(
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

      const newLocation = {
        lat,
        lng,
        name:
          place.display_name,
      };

      setLocation([
        lat,
        lng,
      ]);

      setSelectedLocation(
        newLocation
      );

      setSearchText(
        place.display_name
      );

      setSearchResults([]);

      setError("");
    };

  // ===================================================
  // GET CURRENT LOCATION
  // ===================================================

  const getCurrentLocation =
    () => {
      if (
        !navigator.geolocation
      ) {
        setError(
          "Geolocation is not supported by this browser."
        );

        return;
      }

      setGettingLocation(
        true
      );

      setError("");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat =
            position.coords
              .latitude;

          const lng =
            position.coords
              .longitude;

          const newLocation = {
            lat,
            lng,
            name:
              "My Current Location",
          };

          setLocation([
            lat,
            lng,
          ]);

          setSelectedLocation(
            newLocation
          );

          setSearchText(
            "My Current Location"
          );

          setGettingLocation(
            false
          );
        },

        (geoError) => {
          console.error(
            "GPS error:",
            geoError
          );

          let message =
            "Unable to get your current location.";

          if (
            geoError.code === 1
          ) {
            message =
              "Location permission denied. Please allow location access.";
          }

          if (
            geoError.code === 2
          ) {
            message =
              "Your current location could not be determined.";
          }

          if (
            geoError.code === 3
          ) {
            message =
              "Location request timed out.";
          }

          setError(
            message
          );

          setGettingLocation(
            false
          );
        },

        {
          enableHighAccuracy: true,

          timeout: 15000,

          maximumAge: 0,
        }
      );
    };

  // ===================================================
  // MAP CLICK
  // ===================================================

  const handleMapClick =
    ({
      lat,
      lng,
      name,
    }) => {
      setLocation([
        lat,
        lng,
      ]);

      setSelectedLocation({
        lat,
        lng,
        name,
      });

      setSearchText(
        "Selected map location"
      );

      setError("");
    };

  // ===================================================
  // ENTER SEARCH
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
  // GOOGLE MAPS
  // ===================================================

  const openGoogleMaps =
    () => {
      const {
        lat,
        lng,
      } =
        selectedLocation;

      const url =
        `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );
    };

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="map-page">

      {/* =========================================
          HEADER
      ========================================== */}

      <div className="map-header">

        <ArrowLeft
          size={27}
          onClick={() =>
            navigate("/home")
          }
          className="back-btn"
        />

        <h2>
          Explore Map
        </h2>

      </div>

      {/* =========================================
          SEARCH
      ========================================== */}

      <div className="map-search-section">

        <div className="map-search-box">

          <Search
            size={20}
          />

          <input
            type="text"
            value={
              searchText
            }
            placeholder="Search any location..."
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
                className="map-spinner"
              />
            ) : (
              "Search"
            )}
          </button>

        </div>

        {/* =====================================
            SEARCH RESULTS
        ====================================== */}

        {searchResults.length >
          0 && (

          <div className="map-search-results">

            {searchResults.map(
              (
                place,
                index
              ) => (

                <div
                  className="map-search-result"
                  key={
                    place.place_id ||
                    index
                  }
                  onClick={() =>
                    selectSearchResult(
                      place
                    )
                  }
                >

                  <MapPinned
                    size={19}
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

        {/* =====================================
            CURRENT LOCATION
        ====================================== */}

        <button
          className="current-location-btn"
          onClick={
            getCurrentLocation
          }
          disabled={
            gettingLocation
          }
        >

          {gettingLocation ? (
            <Loader2
              size={19}
              className="map-spinner"
            />
          ) : (
            <LocateFixed
              size={19}
            />
          )}

          {gettingLocation
            ? "Finding location..."
            : "My Current Location"}

        </button>

      </div>

      {/* =========================================
          ERROR
      ========================================== */}

      {error && (
        <div className="map-error">
          {error}
        </div>
      )}

      {/* =========================================
          MAP
      ========================================== */}

      <div className="map-wrapper">

        <MapContainer
          center={
            DEFAULT_LOCATION
          }
          zoom={13}
          scrollWheelZoom={
            true
          }
          style={{
            height: "100%",
            width: "100%",
          }}
        >

          <ChangeMapView
            location={
              location
            }
            zoom={15}
          />

          <MapClickHandler
            onLocationSelect={
              handleMapClick
            }
          />

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker
            position={
              location
            }
            icon={
              markerIcon
            }
          >

            <Popup>

              <strong>
                {selectedLocation.name}
              </strong>

              <br />

              Latitude:
              {" "}
              {selectedLocation.lat.toFixed(
                6
              )}

              <br />

              Longitude:
              {" "}
              {selectedLocation.lng.toFixed(
                6
              )}

            </Popup>

          </Marker>

        </MapContainer>

      </div>

      {/* =========================================
          LOCATION CARD
      ========================================== */}

      <div className="location-card">

        <div className="location-card-icon">

          <MapPinned
            size={23}
          />

        </div>

        <div className="location-card-content">

          <h4>
            Selected Location
          </h4>

          <p className="selected-place">
            {
              selectedLocation.name
            }
          </p>

          <div className="coordinates">

            <span>
              <b>
                Latitude:
              </b>{" "}
              {
                selectedLocation.lat.toFixed(
                  6
                )
              }
            </span>

            <span>
              <b>
                Longitude:
              </b>{" "}
              {
                selectedLocation.lng.toFixed(
                  6
                )
              }
            </span>

          </div>

        </div>

      </div>

      {/* =========================================
          ACTIONS
      ========================================== */}

      <div className="map-actions">

        <button
          className="my-location-action"
          onClick={
            getCurrentLocation
          }
        >

          <Navigation
            size={19}
          />

          My Location

        </button>

        <button
          className="google-map-action"
          onClick={
            openGoogleMaps
          }
        >

          <ExternalLink
            size={19}
          />

          Open in Google Maps

        </button>

      </div>

      {/* =========================================
          INFO
      ========================================== */}

      <div className="map-info">

        <p>
          <b>
            Tip:
          </b>{" "}
          Search for any place or tap anywhere
          on the map to select a location.
        </p>

      </div>

    </div>
  );
}

export default Map;