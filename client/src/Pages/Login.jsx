import { API_URL } from "../config.js";

// Login.jsx

import { useState } from "react";
import "../Style/Login.css";
import woman from "../assets/woman.jpeg";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";

import {
  auth,
  googleProvider,
  githubProvider,
} from "../firebase";


function Login() {

  const [phone, setPhone] = useState("");

  const navigate = useNavigate();


  // =====================================================
  // SAVE CURRENT USER
  // =====================================================

  const saveCurrentUser = (userData, token = "") => {

    if (!userData) {
      console.log("No user data received");
      return;
    }


    // ================================================
    // GET USER ID
    // ================================================

    const userId =
      userData._id ||
      userData.userId ||
      userData.id ||
      userData.uid ||
      "";


    const currentUser = {

      userId: userId,

      name:
        userData.name ||
        userData.displayName ||
        "User",

      email:
        userData.email ||
        "",

      mobile:
        userData.mobile ||
        userData.phoneNumber ||
        "",

    };


    // ================================================
    // SAVE USER
    // ================================================

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );


    // IMPORTANT:
    // Save MongoDB _id for Profile.jsx

    if (userId) {

      localStorage.setItem(
        "userId",
        userId
      );

    }


    if (token) localStorage.setItem("zenrixaToken", token);

    // Current user for Chat/SOS/etc.

    localStorage.setItem(
      "zenrixaCurrentUser",
      JSON.stringify(currentUser)
    );


    console.log(
      "Current Zenrixa User:",
      currentUser
    );

    console.log(
      "Saved User ID:",
      userId
    );
    window.dispatchEvent(new Event("zenrixaLogin"));

  };


  // =====================================================
  // MOBILE LOGIN
  // =====================================================

  const handleLogin = async () => {

    // Remove spaces/non-numbers

    const cleanPhone =
      phone.replace(/\D/g, "");


    if (cleanPhone.length !== 10) {

      alert(
        "Enter a valid 10 digit mobile number"
      );

      return;

    }


    try {

      console.log(
        "Login mobile:",
        cleanPhone
      );


      const res = await axios.post(

        API_URL + "/api/user/login",

        {
          mobile: cleanPhone,
        }

      );


      console.log(
        "Login response:",
        res.data
      );


      // ==============================================
      // LOGIN SUCCESS
      // ==============================================

      if (res.data.success) {

        const user =
          res.data.user;


        if (!user) {

          console.error(
            "Backend did not return user data"
          );

          alert(
            "Login failed: User data not received"
          );

          return;

        }


        // Save MongoDB user ID

        saveCurrentUser(user, res.data.token);


        alert(
          "Login Successful"
        );


        navigate("/home");

        return;

      }


      // ==============================================
      // LOGIN FAILED
      // ==============================================

      alert(
        res.data.message ||
        "Login Failed"
      );


    } catch (err) {

      console.error(
        "Login Error:",
        err
      );


      console.error(
        "Backend response:",
        err.response?.data
      );


      alert(

        err.response?.data?.message ||
        "Login Failed"

      );

    }

  };


  // =====================================================
  // GOOGLE LOGIN
  // =====================================================

  const handleGoogleLogin = async () => {

    try {

      const result =
        await signInWithPopup(
          auth,
          googleProvider
        );


      const firebaseUser =
        result.user;


      const googleUser = {

        userId:
          firebaseUser.uid,

        name:
          firebaseUser.displayName ||
          "User",

        email:
          firebaseUser.email ||
          "",

        mobile:
          firebaseUser.phoneNumber ||
          "",

      };


      const sync = await axios.post(
        API_URL + "/api/user/firebase",
        {
          uid: firebaseUser.uid,
          name: googleUser.name,
          email: googleUser.email,
          provider: "Google",
        }
      );

      saveCurrentUser(sync.data.user, sync.data.token);

      alert("Google Login Successful");


      navigate("/home");


    } catch (err) {

      console.error(
        "Google Login Error:",
        err
      );


      alert(
        "Google Login Failed"
      );

    }

  };


  // =====================================================
  // GITHUB LOGIN
  // =====================================================

  const handleGithubLogin = async () => {

    try {

      const result =
        await signInWithPopup(
          auth,
          githubProvider
        );


      const firebaseUser =
        result.user;


      const githubUser = {

        userId:
          firebaseUser.uid,

        name:
          firebaseUser.displayName ||
          firebaseUser.email?.split("@")[0] ||
          "User",

        email:
          firebaseUser.email ||
          "",

        mobile:
          firebaseUser.phoneNumber ||
          "",

      };


      const sync = await axios.post(
        API_URL + "/api/user/firebase",
        {
          uid: firebaseUser.uid,
          name: githubUser.name,
          email: githubUser.email,
          provider: "GitHub",
        }
      );

      saveCurrentUser(sync.data.user, sync.data.token);

      alert("GitHub Login Successful");


      navigate("/home");


    } catch (err) {

      console.error(
        "GitHub Login Error:",
        err
      );


      alert(
        "GitHub Login Failed"
      );

    }

  };


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="login-page">


      {/* =================================================
          TOP SECTION
      ================================================== */}

      <div className="top-section">

        <div className="text-section">

          <h3>
            Welcome to
          </h3>

          <h1>
            Zenrixa 💜
          </h1>

          <p>
            Login or Sign Up to stay safe
          </p>

        </div>


        <img
          src={woman}
          alt="Woman"
          className="woman-image"
        />

      </div>



      {/* =================================================
          FORM CARD
      ================================================== */}

      <div className="form-card">


        {/* TABS */}

        <div className="tabs">

          <button
            className="active"
          >
            Login
          </button>


          <button
            onClick={() =>
              navigate("/signup")
            }
          >
            Sign Up
          </button>

        </div>



        {/* MOBILE INPUT */}

        <input

          type="tel"

          placeholder="Enter Mobile Number"

          value={phone}

          onChange={(e) => {

            setPhone(
              e.target.value.replace(
                /\D/g,
                ""
              )
            );

          }}

          maxLength={10}

        />



        {/* LOGIN BUTTON */}

        <button
          className="otp-btn"
          onClick={handleLogin}
        >
          Login
        </button>



        {/* =================================================
            SOCIAL LOGIN
        ================================================== */}

        <div className="social-login">


          {/* GOOGLE */}

          <button
            onClick={
              handleGoogleLogin
            }
          >

            <img
              src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png"
              alt="Google"
              width="25"
            />

          </button>



          {/* GITHUB */}

          <button
            onClick={
              handleGithubLogin
            }
          >

            <img
              src="https://cdn-icons-png.flaticon.com/512/25/25231.png"
              alt="GitHub"
              width="25"
            />

          </button>



          {/* INSTAGRAM */}

          <button
            onClick={() =>
              window.open(
                "https://www.instagram.com/",
                "_blank"
              )
            }
          >

            <img
              src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png"
              alt="Instagram"
              width="25"
            />

          </button>

        </div>



        {/* POLICY */}

        <p className="policy">

          By continuing, you agree to our

          <br />

          Terms & Privacy Policy

        </p>

      </div>

    </div>

  );

}


export default Login;
