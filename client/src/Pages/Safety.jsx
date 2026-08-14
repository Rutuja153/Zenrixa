import "../Style/Safety.css";
import { ArrowLeft, Shield, Phone, MapPinned } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Safety() {

  const navigate = useNavigate();

  const tips = [
    "Always share your live location with trusted contacts.",
    "Avoid isolated roads, especially at night.",
    "Keep your phone charged before travelling.",
    "Use the SOS button immediately if you feel unsafe.",
    "Save emergency numbers in your phone.",
    "Stay alert and avoid using headphones in lonely places.",
    "Use verified transport services whenever possible.",
    "Trust your instincts and leave situations that feel unsafe."
  ];

  return (
    <div className="safety-page">

      <div className="safety-header">

        <ArrowLeft
          className="back-icon"
          onClick={() => navigate("/home")}
        />

        <h2>Safety Tips</h2>

      </div>

      <div className="safety-banner">

        <Shield size={45} color="#8e44ad" />

        <div>
          <h3>Stay Safe with Zenrixa</h3>
          <p>Your safety is our highest priority.</p>
        </div>

      </div>

      <div className="tips-list">

        {tips.map((tip, index) => (
          <div className="tip-card" key={index}>
            <span className="tip-number">{index + 1}</span>
            <p>{tip}</p>
          </div>
        ))}

      </div>

      <div className="action-buttons">

        <button onClick={() => navigate("/emergency")}>
          <Phone size={18} />
          Emergency Call
        </button>

        <button onClick={() => navigate("/tracking")}>
          <MapPinned size={18} />
          Live Location
        </button>

      </div>

    </div>
  );
}

export default Safety;