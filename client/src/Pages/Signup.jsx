import { API_URL } from "../config.js";

import { useState } from "react";
import "../Style/Signup.css";
import woman from "../assets/woman.jpeg";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { signInWithPopup } from "firebase/auth";

import {
  auth,
  googleProvider,
  githubProvider,
} from "../firebase";

function Signup() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    mobile: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  // ================= Save Current User =================
  const saveCurrentUser = (userData, token = "") => {
    if (!userData) return;

    const currentUser = {
      userId:
        userData.userId ||
        userData._id ||
        userData.id ||
        userData.uid ||
        userData.email ||
        userData.mobile ||
        "",

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

    if (token) localStorage.setItem("zenrixaToken", token);

    // Save original user
    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    // Save current logged-in user
    localStorage.setItem(
      "zenrixaCurrentUser",
      JSON.stringify(currentUser)
    );

    const userId = userData._id || userData.userId || userData.id || "";
    if (userId) localStorage.setItem("userId", userId);

    console.log(
      "Current Zenrixa User:",
      currentUser
    );

    window.dispatchEvent(new Event("zenrixaLogin"));
  };

  // ================= Normal Signup =================
  const handleSignup = async () => {
    const {
      name,
      mobile,
      email,
      password,
    } = user;

    if (
      !name ||
      !mobile ||
      !email ||
      !password
    ) {
      alert("Please fill all fields");
      return;
    }

    if (mobile.length !== 10) {
      alert("Enter valid mobile number");
      return;
    }

    try {
      const res = await axios.post(
        API_URL + "/api/user/signup",
        user
      );

      if (res.data.success) {
        alert(
          "Account Created Successfully"
        );

        /*
         * If backend returns the created user,
         * save it immediately.
         *
         * Otherwise the user will login normally
         * on the Login page.
         */

        if (res.data.user) {
          saveCurrentUser(
            res.data.user,
            res.data.token
          );
        }

        navigate("/login");
      }
    } catch (err) {
      console.error(
        "Signup Error:",
        err
      );

      alert(
        err.response?.data?.message ||
          "Signup Failed"
      );
    }
  };

  // ================= Google Signup =================
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(
        auth,
        googleProvider
      );

      const firebaseUser = result.user;

      const googleUser = {
        userId: firebaseUser.uid,
        name:
          firebaseUser.displayName ||
          "User",
        email:
          firebaseUser.email || "",
        mobile:
          firebaseUser.phoneNumber || "",
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

      alert("Google Signup Successful");

      navigate("/home");
    } catch (err) {
      console.error(
        "Google Signup Error:",
        err
      );

      alert(
        "Google Signup Failed"
      );
    }
  };

  // ================= GitHub Signup =================
  const handleGithubLogin = async () => {
    try {
      const result = await signInWithPopup(
        auth,
        githubProvider
      );

      const firebaseUser = result.user;

      const githubUser = {
        userId: firebaseUser.uid,
        name:
          firebaseUser.displayName ||
          firebaseUser.email?.split("@")[0] ||
          "User",
        email:
          firebaseUser.email || "",
        mobile:
          firebaseUser.phoneNumber || "",
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

      alert("GitHub Signup Successful");

      navigate("/home");
    } catch (err) {
      console.error(
        "GitHub Signup Error:",
        err
      );

      alert(
        "GitHub Signup Failed"
      );
    }
  };

  return (
    <div className="signup-page">

      <div className="top-section">

        <div className="text-section">

          <h3>Join</h3>

          <h1>
            Zenrixa 💜
          </h1>

          <p>
            Create your account and stay safe
          </p>

        </div>

        <img
          src={woman}
          alt="Woman"
          className="woman-image"
        />

      </div>

      <div className="form-card">

        <div className="tabs">

          <button
            onClick={() =>
              navigate("/login")
            }
          >
            Login
          </button>

          <button className="active">
            Sign Up
          </button>

        </div>

        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={user.name}
          onChange={handleChange}
        />

        <input
          type="tel"
          name="mobile"
          placeholder="Mobile Number"
          value={user.mobile}
          onChange={(e) =>
            setUser({
              ...user,
              mobile:
                e.target.value.replace(
                  /\D/g,
                  ""
                ),
            })
          }
          maxLength={10}
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={user.email}
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={user.password}
          onChange={handleChange}
        />

        <button
          className="otp-btn"
          onClick={handleSignup}
        >
          Create Account
        </button>

        <div className="social-login">

          {/* Google */}

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

          {/* GitHub */}

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

          {/* Instagram */}

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

        <p className="policy">

          By continuing, you agree to our

          <br />

          Terms & Privacy Policy

        </p>

      </div>

    </div>
  );
}

export default Signup;

