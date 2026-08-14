import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import "../Style/Term.css";

export default function Term() {
  const navigate = useNavigate();

  return (
    <div className="term-page">

      <div className="term-header">
        <button onClick={() => navigate("/setting")}>
          <ArrowLeft size={22} />
        </button>

        <h2>Terms & Conditions</h2>
      </div>

      <div className="term-card">

        <div className="term-title">
          <FileText size={32} color="#6C3EF4" />
          <h3>ZENRIXA Terms & Conditions</h3>
        </div>

        <p>
          Welcome to <strong>ZENRIXA</strong>. By using this application, you
          agree to comply with the following Terms and Conditions. Please read
          them carefully before using the app.
        </p>

        <h4>1. Acceptance of Terms</h4>

        <p>
          By creating an account or using ZENRIXA, you accept these Terms &
          Conditions. If you do not agree, please discontinue using the
          application.
        </p>

        <h4>2. User Responsibilities</h4>

        <ul>
          <li>Provide accurate personal information.</li>
          <li>Keep your login credentials secure.</li>
          <li>Use the SOS feature only during genuine emergencies.</li>
          <li>Do not misuse or attempt to damage the application.</li>
        </ul>

        <h4>3. Emergency Services</h4>

        <p>
          ZENRIXA provides tools to help users during emergencies. However, the
          application does not guarantee immediate assistance from emergency
          responders or contacts.
        </p>

        <h4>4. Location Services</h4>

        <p>
          The application requires location access for live tracking, SOS
          alerts, and journey monitoring. You may disable location access in
          your device settings at any time.
        </p>

        <h4>5. Account Security</h4>

        <p>
          You are responsible for maintaining the confidentiality of your
          account information and any activities performed using your account.
        </p>

        <h4>6. Prohibited Activities</h4>

        <ul>
          <li>Providing false emergency alerts.</li>
          <li>Using the app for illegal activities.</li>
          <li>Attempting to hack or modify the application.</li>
          <li>Sharing harmful or misleading information.</li>
        </ul>

        <h4>7. Updates</h4>

        <p>
          ZENRIXA may update these Terms & Conditions at any time. Continued
          use of the application after updates means you accept the revised
          terms.
        </p>

        <h4>8. Contact</h4>

        <p>
          If you have any questions regarding these Terms & Conditions, please
          contact us through the Help & Support section within the app.
        </p>

        <p className="last-update">
          Last Updated: August 2026
        </p>

      </div>

    </div>
  );
}