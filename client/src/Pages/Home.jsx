// Home.jsx

import { API_URL } from "../config.js";
import "../Style/Home.css";
import avatar from "../assets/avatar.jpeg";

import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import axios from "axios";

import {
  Bell,
  Shield,
  Phone,
  MapPinned,
  Users,
  MessageCircle,
  BookOpen,
  AlertTriangle,
  Home as HomeIcon,
  User,
} from "lucide-react";


function Home() {

  const navigate = useNavigate();


  // =====================================================
  // STATE
  // =====================================================

  const [showNotification, setShowNotification] =
    useState(false);

  const [userName, setUserName] =
    useState("User");

  const [profileImage, setProfileImage] =
    useState(avatar);

  const [notifications, setNotifications] =
    useState([]);


  // =====================================================
  // IMAGE URL
  // =====================================================

  const getImageUrl = (image) => {

    if (!image) {
      return avatar;
    }


    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:")
    ) {

      return image;

    }


    return `${API_URL}${image}`;
  };


  // =====================================================
  // LOAD PROFILE
  // =====================================================

  const loadProfile = async () => {

    try {

      const userId =
        localStorage.getItem("userId");


      if (!userId) {

        console.log(
          "No userId found"
        );

        return;

      }


      console.log(
        "Home loading profile:",
        userId
      );


      const profileRes =
        await axios.get(
          `${API_URL}/api/profile/${userId}`
        );


      console.log(
        "Home Profile Response:",
        profileRes.data
      );


      if (
        profileRes.data.success
      ) {

        const profile =
          profileRes.data.profile;


        // -----------------------------------------------
        // NAME
        // -----------------------------------------------

        setUserName(
          profile.name || "User"
        );


        // -----------------------------------------------
        // PROFILE IMAGE
        // -----------------------------------------------

        setProfileImage(
          getImageUrl(
            profile.profileImage
          )
        );


        // -----------------------------------------------
        // SAVE PROFILE
        // -----------------------------------------------

        localStorage.setItem(
          "profile",
          JSON.stringify(profile)
        );


        // -----------------------------------------------
        // UPDATE USER
        // -----------------------------------------------

        const oldUser =
          JSON.parse(
            localStorage.getItem(
              "user"
            ) || "{}"
          );


        localStorage.setItem(
          "user",
          JSON.stringify({

            ...oldUser,

            userId:
              profile.userId || userId,

            _id:
              profile.userId || userId,

            name:
              profile.name || "",

            mobile:
              profile.mobile || "",

            email:
              profile.email || "",

            profileImage:
              profile.profileImage || "",
          })
        );

      }


    } catch (error) {

      console.error(
        "Home Profile API Error:",
        error
      );


      // -----------------------------------------------
      // FALLBACK FROM LOCAL STORAGE
      // -----------------------------------------------

      try {

        const savedProfile =
          JSON.parse(
            localStorage.getItem(
              "profile"
            ) || "null"
          );


        if (savedProfile) {

          setUserName(
            savedProfile.name || "User"
          );


          setProfileImage(
            getImageUrl(
              savedProfile.profileImage
            )
          );

        }

      } catch (storageError) {

        console.error(
          "Local storage error:",
          storageError
        );

      }

    }

  };


  // =====================================================
  // FETCH PROFILE + NOTIFICATIONS
  // =====================================================

  useEffect(() => {

    loadProfile();


    // ===================================================
    // NOTIFICATION API
    // ===================================================

    const fetchNotifications =
      async () => {

        try {

          const user =
            JSON.parse(
              localStorage.getItem(
                "user"
              ) || "null"
            );


          if (!user?.mobile) {
            return;
          }


          const notificationRes =
            await axios.get(
              `${API_URL}/api/notification/${user.mobile}`
            );


          if (
            notificationRes.data.success
          ) {

            setNotifications(
              notificationRes.data.notifications
            );

          }

        } catch (error) {

          console.log(
            "Notification API Error:",
            error
          );

        }

      };


    fetchNotifications();


    // ===================================================
    // PROFILE UPDATE EVENT
    // ===================================================

    const handleProfileUpdated =
      () => {

        console.log(
          "Profile updated → reloading Home profile"
        );

        loadProfile();

      };


    window.addEventListener(
      "profileUpdated",
      handleProfileUpdated
    );


    // ===================================================
    // CLEANUP
    // ===================================================

    return () => {

      window.removeEventListener(
        "profileUpdated",
        handleProfileUpdated
      );

    };

  }, []);


  // =====================================================
  // SOS
  // =====================================================

  const handleSOS = () => {

    navigate("/sos");

  };


  // =====================================================
  // NOTIFICATION
  // =====================================================

  const handleNotification = () => {

    setShowNotification(
      !showNotification
    );

  };


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="home">


      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="navbar">


        <div className="welcome-section">

          <h2>
            Hello, {userName} 👋
          </h2>

          <p>
            Stay Safe, Stay Strong
          </p>

        </div>


        <div className="nav-right">


          {/* NOTIFICATION */}

          <div className="notification-box">

            <Bell
              className="icon"
              onClick={
                handleNotification
              }
            />


            {showNotification && (

              <div className="notification-popup">

                <h4>
                  Notifications
                </h4>


                {notifications.length === 0 ? (

                  <p>
                    No Notifications Available
                  </p>

                ) : (

                  notifications.map(
                    (item) => (

                      <div
                        key={item._id}
                        className="notification-item"
                      >

                        <strong>
                          {item.title}
                        </strong>

                        <p>
                          {item.message}
                        </p>

                      </div>

                    )
                  )

                )}

              </div>

            )}

          </div>


          {/* =================================================
              PROFILE IMAGE
          ================================================= */}

          <img
            src={profileImage}
            alt="Profile"
            className="avatar"
            onClick={() =>
              navigate("/profile")
            }
            onError={(event) => {

              if (
                event.currentTarget.src !==
                avatar
              ) {

                event.currentTarget.src =
                  avatar;

              }

            }}
          />

        </div>

      </header>


      {/* =================================================
          SAFETY CARD
      ================================================= */}

      <div className="safety-card">

        <Shield
          size={40}
          color="#6C3EF4"
        />

        <div>

          <h3>
            Your Safety is Our Priority
          </h3>

          <p>
            Zenrixa is always ready to help you.
          </p>

        </div>

      </div>


      {/* =================================================
          SOS
      ================================================= */}

      <div className="sos-section">

        <button
          className="sos-btn"
          onClick={handleSOS}
        >
          SOS
        </button>

        <p>
          Tap in Emergency
        </p>

      </div>


      {/* =================================================
          FEATURE CARDS
      ================================================= */}

      <div className="grid">


        <div
          className="card"
          onClick={() =>
            navigate("/emergency")
          }
        >

          <Phone size={35} />

          <h4>
            Emergency Call
          </h4>

        </div>


        <div
          className="card"
          onClick={() =>
            navigate("/tracking")
          }
        >

          <MapPinned size={35} />

          <h4>
            Live Location
          </h4>

        </div>


        <div
          className="card"
          onClick={() =>
            navigate("/contact")
          }
        >

          <Users size={35} />

          <h4>
            Trusted Contacts
          </h4>

        </div>


        <div
          className="card"
          onClick={() =>
            navigate("/chat")
          }
        >

          <MessageCircle size={35} />

          <h4>
            AI Safety Chat
          </h4>

        </div>


        <div
          className="card"
          onClick={() =>
            navigate("/safety")
          }
        >

          <BookOpen size={35} />

          <h4>
            Safety Tips
          </h4>

        </div>


        <div
          className="card"
          onClick={() =>
            navigate("/reportissue")
          }
        >

          <AlertTriangle size={35} />

          <h4>
            Report Issue
          </h4>

        </div>

      </div>


      {/* =================================================
          BOTTOM NAVIGATION
      ================================================= */}

      <footer className="bottom-nav">


        <div
          className="nav-item"
          onClick={() =>
            navigate("/home")
          }
        >

          <HomeIcon />

          <span>
            Home
          </span>

        </div>


        <div
          className="nav-item"
          onClick={() =>
            navigate("/map")
          }
        >

          <MapPinned />

          <span>
            Map
          </span>

        </div>


        <div
          className="nav-item sos-menu"
          onClick={handleSOS}
        >

          <Phone />

          <span>
            SOS
          </span>

        </div>


        <div
          className="nav-item"
          onClick={() =>
            navigate("/profile")
          }
        >

          <User />

          <span>
            Profile
          </span>

        </div>

      </footer>

    </div>

  );

}


export default Home;