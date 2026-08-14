import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Heart, Users, Phone } from "lucide-react";
import "../Style/About.css";

export default function About() {

  const navigate = useNavigate();

  return (
    <div className="about-page">

      <div className="about-header">

        <button onClick={() => navigate("/setting")}>
          <ArrowLeft size={22}/>
        </button>

        <h2>About ZENRIXA</h2>

      </div>


      <div className="about-card">


        <div className="logo-section">

          <ShieldCheck size={55} color="#6C3EF4"/>

          <h1>ZENRIXA</h1>

          <p>
            Smart Protection. Safer Journeys.
          </p>

        </div>



        <h3>About Our App</h3>

        <p>
          ZENRIXA is a women safety application designed to provide quick
          assistance during emergency situations. It helps users stay
          connected with trusted contacts through SOS alerts, live location
          sharing, and safety features.
        </p>



        <h3>Our Mission</h3>

        <p>
          Our mission is to create a safer environment for women by using
          technology that provides instant support, confidence, and security
          anytime and anywhere.
        </p>



        <div className="feature-box">


          <div>
            <ShieldCheck color="#6C3EF4"/>
            <span>
              Emergency SOS
            </span>
          </div>


          <div>
            <Users color="#6C3EF4"/>
            <span>
              Trusted Contacts
            </span>
          </div>


          <div>
            <Heart color="#6C3EF4"/>
            <span>
              User Safety
            </span>
          </div>


          <div>
            <Phone color="#6C3EF4"/>
            <span>
              Quick Support
            </span>
          </div>


        </div>



        <h3>Version</h3>

        <p>
          ZENRIXA Version 1.0.0
        </p>



        <h3>Contact Us</h3>

        <p>
          For any questions, suggestions, or support,
          please visit the Help & Support section.
        </p>


        <p className="copyright">
          © 2026 ZENRIXA. All Rights Reserved.
        </p>


      </div>


    </div>
  );
}