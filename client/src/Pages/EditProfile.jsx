// EditProfile.jsx

import {
  useEffect,
  useRef,
  useState,
} from "react";

import axios from "axios";

import { API_URL } from "../config.js";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Camera,
  Save,
  User,
  Phone,
  Droplets,
  Heart,
  Loader2,
} from "lucide-react";

import "../Style/EditProfile.css";

import avatar from "../assets/avatar.jpeg";


function EditProfile() {

  const navigate = useNavigate();

  const fileInputRef = useRef(null);


  // =====================================================
  // USER ID
  // =====================================================

  const userId = localStorage.getItem("userId");


  // =====================================================
  // STATE
  // =====================================================

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);

  const [profile, setProfile] = useState({
    name: "",
    mobile: "",
    bloodGroup: "",
    medicalInfo: "",
    profileImage: "",
  });

  const [previewImage, setPreviewImage] = useState("");


  // =====================================================
  // IMAGE URL HELPER
  // =====================================================

  const getImageUrl = (image) => {

    if (!image) {
      return avatar;
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:") ||
      image.startsWith("blob:")
    ) {
      return image;
    }

    // Prevent double slash
    if (image.startsWith("/")) {
      return `${API_URL}${image}`;
    }

    return `${API_URL}/${image}`;
  };


  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {

    const loadProfile = async () => {

      if (!userId) {

        alert("Please login again.");

        navigate("/login");

        return;
      }

      try {

        setLoading(true);

        console.log(
          "Edit Profile User ID:",
          userId
        );

        const response = await axios.get(
          `${API_URL}/api/profile/${userId}`
        );

        console.log(
          "Edit Profile API Response:",
          response.data
        );


        if (!response.data.success) {

          throw new Error(
            response.data.message ||
            "Unable to load profile"
          );
        }


        const data = response.data.profile;


        const image = data.profileImage || "";


        setProfile({

          name: data.name || "",

          mobile: data.mobile || "",

          bloodGroup: data.bloodGroup || "",

          medicalInfo: data.medicalInfo || "",

          profileImage: image,

        });


        setPreviewImage(
          getImageUrl(image)
        );


      } catch (error) {

        console.error(
          "❌ Profile Load Error:",
          error
        );

        console.error(
          "Backend Error:",
          error.response?.data
        );


        alert(
          error.response?.data?.message ||
          error.message ||
          "Unable to load profile"
        );

      } finally {

        setLoading(false);

      }

    };


    loadProfile();

  }, [userId, navigate]);


  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (event) => {

    const {
      name,
      value,
    } = event.target;


    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


  // =====================================================
  // HANDLE IMAGE CHANGE
  // =====================================================

  const handleImageChange = (event) => {

    const file = event.target.files?.[0];


    if (!file) {
      return;
    }


    // ===================================================
    // IMAGE TYPE
    // ===================================================

    if (!file.type.startsWith("image/")) {

      alert(
        "Please select a valid image file."
      );

      event.target.value = "";

      return;
    }


    // ===================================================
    // IMAGE SIZE
    // ===================================================

    if (file.size > 2 * 1024 * 1024) {

      alert(
        "Image size must be less than 2 MB."
      );

      event.target.value = "";

      return;
    }


    // ===================================================
    // SAVE FILE
    // ===================================================

    setSelectedImage(file);


    // ===================================================
    // CREATE PREVIEW
    // ===================================================

    const previewUrl =
      URL.createObjectURL(file);

    setPreviewImage(previewUrl);

  };


  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSave = async () => {

    if (!userId) {

      alert(
        "Please login again."
      );

      navigate("/login");

      return;
    }


    // ===================================================
    // NAME VALIDATION
    // ===================================================

    if (!profile.name.trim()) {

      alert(
        "Please enter your name."
      );

      return;
    }


    // ===================================================
    // MOBILE VALIDATION
    // ===================================================

    if (
      !/^\d{10}$/.test(
        profile.mobile.trim()
      )
    ) {

      alert(
        "Please enter a valid 10 digit mobile number."
      );

      return;
    }


    try {

      setSaving(true);


      // =================================================
      // FORM DATA
      // =================================================

      const formData = new FormData();


      formData.append(
        "name",
        profile.name.trim()
      );


      formData.append(
        "mobile",
        profile.mobile.trim()
      );


      formData.append(
        "bloodGroup",
        profile.bloodGroup || ""
      );


      formData.append(
        "medicalInfo",
        profile.medicalInfo.trim()
      );


      // =================================================
      // ADD NEW IMAGE
      // =================================================

      if (selectedImage) {

        formData.append(
          "profileImage",
          selectedImage
        );

      }


      // =================================================
      // API UPDATE
      // =================================================

      console.log(
        "Updating profile..."
      );


      const response = await axios.put(
        `${API_URL}/api/profile/${userId}`,
        formData
      );


      console.log(
        "Update Profile Response:",
        response.data
      );


      if (!response.data.success) {

        throw new Error(
          response.data.message ||
          "Profile update failed"
        );
      }


      // =================================================
      // UPDATED PROFILE
      // =================================================

      const updated =
        response.data.profile;


      console.log(
        "Updated Profile:",
        updated
      );


      // =================================================
      // GET FINAL IMAGE
      // =================================================

      const updatedImage =
        updated.profileImage || "";


      // =================================================
      // UPDATE REACT STATE
      // =================================================

      setProfile({

        name:
          updated.name || "",

        mobile:
          updated.mobile || "",

        bloodGroup:
          updated.bloodGroup || "",

        medicalInfo:
          updated.medicalInfo || "",

        profileImage:
          updatedImage,

      });


      setPreviewImage(
        getImageUrl(updatedImage)
      );


      setSelectedImage(null);


      // =================================================
      // UPDATE LOCAL STORAGE - USER
      // =================================================

      const oldUser =
        JSON.parse(
          localStorage.getItem("user") ||
          "{}"
        );


      const updatedUser = {

        ...oldUser,

        _id:
          updated.userId ||
          userId,

        userId:
          updated.userId ||
          userId,

        name:
          updated.name || "",

        mobile:
          updated.mobile || "",

        email:
          updated.email ||
          oldUser.email ||
          "",

        profileImage:
          updatedImage,

      };


      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );


      // =================================================
      // UPDATE USER ID
      // =================================================

      localStorage.setItem(
        "userId",
        String(
          updated.userId ||
          userId
        )
      );


      // =================================================
      // UPDATE PROFILE STORAGE
      // =================================================

      localStorage.setItem(
        "profile",
        JSON.stringify(updated)
      );


      // =================================================
      // UPDATE ZENRIXA CURRENT USER
      // =================================================

      const currentUser =
        JSON.parse(
          localStorage.getItem(
            "zenrixaCurrentUser"
          ) || "{}"
        );


      const updatedCurrentUser = {

        ...currentUser,

        userId:
          updated.userId ||
          userId,

        name:
          updated.name || "",

        mobile:
          updated.mobile || "",

        email:
          updated.email ||
          currentUser.email ||
          "",

        profileImage:
          updatedImage,

      };


      localStorage.setItem(
        "zenrixaCurrentUser",
        JSON.stringify(
          updatedCurrentUser
        )
      );


      // =================================================
      // IMPORTANT
      // SEND PROFILE IMAGE TO OTHER PAGES
      // =================================================

      window.dispatchEvent(
        new Event("profileUpdated")
      );


      // =================================================
      // SUCCESS
      // =================================================

      alert(
        "Profile updated successfully."
      );


      // =================================================
      // GO PROFILE
      // =================================================

      navigate("/profile");


    } catch (error) {

      console.error(
        "❌ Update Profile Error:",
        error
      );


      console.error(
        "Backend Error:",
        error.response?.data
      );


      alert(
        error.response?.data?.message ||
        error.message ||
        "Unable to update profile"
      );

    } finally {

      setSaving(false);

    }

  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="edit-profile">

        <div className="edit-loading">

          <Loader2
            size={30}
            className="loading-icon"
          />

          <p>
            Loading profile...
          </p>

        </div>

      </div>

    );

  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="edit-profile">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="edit-header">

        <button
          className="back-btn"
          onClick={() =>
            navigate("/profile")
          }
          disabled={saving}
        >

          <ArrowLeft size={22} />

        </button>


        <div>

          <h2>
            Edit Profile
          </h2>

          <p>
            Update your personal information
          </p>

        </div>

      </div>


      {/* =================================================
          PROFILE IMAGE
      ================================================= */}

      <div className="edit-image-section">

        <div className="edit-image-wrapper">

          <img
            src={
              previewImage ||
              avatar
            }
            alt="Profile"
            className="edit-profile-image"
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


          {/* CAMERA BUTTON */}

          <button
            type="button"
            className="camera-btn"
            onClick={() =>
              fileInputRef.current?.click()
            }
            disabled={saving}
          >

            <Camera size={18} />

          </button>

        </div>


        <h3>
          Profile Photo
        </h3>


        <p>
          Choose a clear profile picture
        </p>


        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={
            handleImageChange
          }
          style={{
            display: "none",
          }}
        />

      </div>


      {/* =================================================
          FORM
      ================================================= */}

      <div className="edit-form">


        {/* =================================================
            NAME
        ================================================= */}

        <div className="form-group">

          <label>

            <User size={17} />

            Full Name

          </label>


          <input
            type="text"
            name="name"
            value={
              profile.name
            }
            onChange={
              handleChange
            }
            placeholder="Enter your full name"
            disabled={saving}
          />

        </div>


        {/* =================================================
            MOBILE
        ================================================= */}

        <div className="form-group">

          <label>

            <Phone size={17} />

            Mobile Number

          </label>


          <input
            type="tel"
            name="mobile"
            value={
              profile.mobile
            }
            maxLength={10}
            onChange={(event) => {

              const value =
                event.target.value.replace(
                  /\D/g,
                  ""
                );

              setProfile(
                (previous) => ({
                  ...previous,
                  mobile: value,
                })
              );

            }}
            placeholder="Enter 10 digit mobile number"
            disabled={saving}
          />

        </div>


        {/* =================================================
            BLOOD GROUP
        ================================================= */}

        <div className="form-group">

          <label>

            <Droplets size={17} />

            Blood Group

          </label>


          <select
            name="bloodGroup"
            value={
              profile.bloodGroup
            }
            onChange={
              handleChange
            }
            disabled={saving}
          >

            <option value="">
              Select Blood Group
            </option>

            <option value="A+">
              A+
            </option>

            <option value="A-">
              A-
            </option>

            <option value="B+">
              B+
            </option>

            <option value="B-">
              B-
            </option>

            <option value="AB+">
              AB+
            </option>

            <option value="AB-">
              AB-
            </option>

            <option value="O+">
              O+
            </option>

            <option value="O-">
              O-
            </option>

          </select>

        </div>


        {/* =================================================
            MEDICAL INFORMATION
        ================================================= */}

        <div className="form-group">

          <label>

            <Heart size={17} />

            Medical Information

          </label>


          <textarea
            name="medicalInfo"
            value={
              profile.medicalInfo
            }
            onChange={
              handleChange
            }
            placeholder="Enter any important medical information"
            rows={4}
            disabled={saving}
          />

        </div>


        {/* =================================================
            SAVE BUTTON
        ================================================= */}

        <button
          className="save-btn"
          onClick={
            handleSave
          }
          disabled={saving}
        >

          {saving ? (

            <>

              <Loader2
                size={19}
                className="loading-icon"
              />

              Saving...

            </>

          ) : (

            <>

              <Save size={19} />

              Save Changes

            </>

          )}

        </button>

      </div>

    </div>

  );

}


export default EditProfile;