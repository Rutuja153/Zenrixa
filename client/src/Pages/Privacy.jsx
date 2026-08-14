import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import "../Style/Privacy.css";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="privacy-page">

      <div className="privacy-header">
        <button onClick={() => navigate("/setting")}>
          <ArrowLeft size={22} />
        </button>

        <h2>Privacy Policy</h2>
      </div>

      <div className="privacy-card">

        <div className="privacy-title">
          <ShieldCheck size={32} color="#6C3EF4" />
          <h3>ZENRIXA Privacy Policy</h3>
        </div>

        <p>
          Your privacy and safety are important to us. ZENRIXA is committed to
          protecting your personal information while providing reliable women
          safety services.
        </p>

        <h4>1. Information We Collect</h4>

        <ul>
          <li>Name and mobile number.</li>
          <li>Emergency contact details.</li>
          <li>Live location (only when permission is granted).</li>
          <li>Journey history and safety reports.</li>
        </ul>

        <h4>2. How We Use Your Information</h4>

        <ul>
          <li>Send SOS alerts to emergency contacts.</li>
          <li>Share your live location during emergencies.</li>
          <li>Improve safety features and app performance.</li>
          <li>Provide customer support.</li>
        </ul>

        <h4>3. Location Access</h4>

        <p>
          Your location is accessed only when you enable location permission.
          It is used to provide accurate live tracking and emergency assistance.
        </p>

        <h4>4. Data Security</h4>

        <p>
          We use secure methods to protect your information from unauthorized
          access, loss, or misuse.
        </p>

        <h4>5. Third-Party Services</h4>

        <p>
          We do not sell your personal information. Trusted third-party
          services may be used only to improve app functionality.
        </p>

        <h4>6. Your Rights</h4>

        <ul>
          <li>Update your profile information.</li>
          <li>Delete your account.</li>
          <li>Disable location permission anytime.</li>
          <li>Manage notification preferences.</li>
        </ul>

        <h4>7. Contact Us</h4>

        <p>
          For privacy-related questions or concerns, contact the ZENRIXA
          support team through the Help & Support section of the application.
        </p>

        <p className="last-update">
          Last Updated: August 2026
        </p>

      </div>

    </div>
  );
}