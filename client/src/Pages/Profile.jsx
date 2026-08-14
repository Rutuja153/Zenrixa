// Profile.jsx

import { API_URL } from "../config.js";
import "../Style/Profile.css";

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import axios from "axios";

import {
  ArrowLeft,
  Pencil,
  Home,
  MapPin,
  MessageCircle,
  User,
  ChevronRight,
  Heart,
  Droplets,
  Clock3,
  Phone,
  FileText,
  CircleHelp,
  Settings,
} from "lucide-react";

import avatar from "../assets/avatar.jpeg";


function Profile() {

  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // =====================================================
  // USER ID
  // =====================================================

  const userId = localStorage.getItem("userId");


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
  // FETCH PROFILE
  // =====================================================

  useEffect(() => {

    const fetchProfile = async () => {

      if (!userId) {

        setError(
          "User ID not found. Please login again."
        );

        setLoading(false);

        return;
      }


      try {

        setLoading(true);

        setError("");


        console.log(
          "Logged-in User ID:",
          userId
        );


        const response = await axios.get(
          `${API_URL}/api/profile/${userId}`
        );


        console.log(
          "Profile API Response:",
          response.data
        );


        if (!response.data.success) {

          setError(
            response.data.message ||
            "Profile not found"
          );

          return;
        }


        const userProfile =
          response.data.profile;


        setProfile(userProfile);


        // =================================================
        // SAVE PROFILE
        // =================================================

        localStorage.setItem(
          "profile",
          JSON.stringify(userProfile)
        );


        // =================================================
        // UPDATE USER STORAGE
        // =================================================

        const oldUser = JSON.parse(
          localStorage.getItem("user") || "{}"
        );


        const updatedUser = {

          ...oldUser,

          _id:
            userProfile.userId || userId,

          userId:
            userProfile.userId || userId,

          name:
            userProfile.name || "",

          mobile:
            userProfile.mobile || "",

          email:
            userProfile.email || "",

          profileImage:
            userProfile.profileImage || "",
        };


        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );


        // =================================================
        // CURRENT USER
        // =================================================

        const currentUser = JSON.parse(
          localStorage.getItem(
            "zenrixaCurrentUser"
          ) || "{}"
        );


        localStorage.setItem(
          "zenrixaCurrentUser",
          JSON.stringify({

            ...currentUser,

            userId:
              userProfile.userId || userId,

            name:
              userProfile.name || "",

            mobile:
              userProfile.mobile || "",

            email:
              userProfile.email || "",

            profileImage:
              userProfile.profileImage || "",
          })
        );


      } catch (error) {

        console.error(
          "❌ Profile fetch error:",
          error
        );


        console.error(
          "Backend error:",
          error.response?.data
        );


        setError(
          error.response?.data?.message ||
          "Unable to load profile"
        );


      } finally {

        setLoading(false);

      }

    };


    fetchProfile();

  }, [userId]);


  // =====================================================
  // EDIT PROFILE
  // =====================================================

  const handleEdit = () => {

    if (!profile) {
      return;
    }

    navigate("/edit-profile");
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="profile-page">

        <div className="profile-loading">

          <h3>
            Loading Profile...
          </h3>

        </div>

      </div>

    );

  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {

    return (

      <div className="profile-page">

        <div className="profile-loading">

          <h3>
            {error}
          </h3>

          <button
            onClick={() => navigate("/login")}
          >
            Go to Login
          </button>

        </div>

      </div>

    );

  }


  if (!profile) {

    return (

      <div className="profile-page">

        <div className="profile-loading">

          <h3>
            Profile not found
          </h3>

          <button
            onClick={() => navigate("/home")}
          >
            Go Home
          </button>

        </div>

      </div>

    );

  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="profile-page">


      {/* HEADER */}

      <div className="profile-header">

        <ArrowLeft
          size={24}
          onClick={() => navigate("/home")}
          style={{
            cursor: "pointer",
          }}
        />


        <h2>
          Profile
        </h2>


        <div
          className="edit-btn"
          onClick={handleEdit}
          style={{
            cursor: "pointer",
          }}
          title="Edit Profile"
        >

          <Pencil size={20} />

        </div>

      </div>


      {/* PROFILE INFO */}

      <div className="profile-info">

        <img
          src={getImageUrl(
            profile.profileImage
          )}
          alt="Profile"
          onError={(event) => {

            if (
              event.currentTarget.src !== avatar
            ) {

              event.currentTarget.src = avatar;

            }

          }}
        />


        <h2>
          {profile.name || "User"}
        </h2>


        <p>
          {profile.mobile ||
            "Mobile number not available"}
        </p>

      </div>


      {/* CARDS */}

      <div className="profile-cards">

        <div className="small-card">

          <Droplets color="red" />

          <div>

            <span>
              Blood Group
            </span>

            <h3>
              {profile.bloodGroup ||
                "Not added"}
            </h3>

          </div>

        </div>


        <div className="small-card">

          <Heart color="#00BCD4" />

          <div>

            <span>
              Medical Info
            </span>

            <h3>
              {profile.medicalInfo ||
                "None"}
            </h3>

          </div>

        </div>

      </div>


      {/* MENU */}

      <div className="menu">

        <div
          onClick={() => navigate("/journey")}
        >

          <Clock3 />

          <span>
            My Journey History
          </span>

          <ChevronRight />

        </div>


        <div
          onClick={() => navigate("/contact")}
        >

          <Phone />

          <span>
            Emergency Contacts
          </span>

          <ChevronRight />

        </div>


        <div
          onClick={() => navigate("/report")}
        >

          <FileText />

          <span>
            My Reports
          </span>

          <ChevronRight />

        </div>


        <div
          onClick={() => navigate("/support")}
        >

          <CircleHelp />

          <span>
            Help & Support
          </span>

          <ChevronRight />

        </div>


        <div
          onClick={() => navigate("/setting")}
        >

          <Settings />

          <span>
            Setting
          </span>

          <ChevronRight />

        </div>

      </div>


      {/* BOTTOM NAV */}

      <footer className="bottom-nav">

        <div
          onClick={() => navigate("/home")}
        >

          <Home />

          <span>
            Home
          </span>

        </div>


        <div
          onClick={() => navigate("/tracking")}
        >

          <MapPin />

          <span>
            Map
          </span>

        </div>


        <div
          onClick={() => navigate("/chat")}
        >

          <MessageCircle />

          <span>
            Chat
          </span>

        </div>


        <div className="active">

          <User />

          <span>
            Profile
          </span>

        </div>

      </footer>

    </div>

  );
}


export default Profile;