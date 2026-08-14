
import "../Style/EmergencyCall.css";
import {
  ArrowLeft,
  Phone,
  Ambulance,
  ShieldAlert,
  Flame,
  HeartPulse,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function EmergencyCall() {
  const navigate = useNavigate();

  const makeCall = (number) => {
    window.location.href = `tel:${number}`;
  };

  const services = [
    {
      name: "Police",
      number: "100",
      icon: <ShieldAlert size={30} />,
      className: "police",
    },
    {
      name: "Ambulance",
      number: "108",
      icon: <Ambulance size={30} />,
      className: "ambulance",
    },
    {
      name: "Fire Brigade",
      number: "101",
      icon: <Flame size={30} />,
      className: "fire",
    },
    {
      name: "Women Helpline",
      number: "1091",
      icon: <HeartPulse size={30} />,
      className: "women",
    },
    {
      name: "Emergency",
      number: "112",
      icon: <Phone size={30} />,
      className: "emergency",
    },
  ];

  return (
    <div className="emergency-page">

      {/* Header */}
      <div className="emergency-header">
        <ArrowLeft
          className="back"
          size={25}
          onClick={() => navigate("/home")}
        />

        <div>
          <h2>Emergency Calls</h2>
          <p>Quick access to emergency services</p>
        </div>
      </div>

      {/* Emergency Banner */}
      <div className="emergency-banner">
        <div className="banner-icon">
          <Phone size={28} />
        </div>

        <div>
          <h3>Need Immediate Help?</h3>
          <p>Tap any service below to call instantly.</p>
        </div>
      </div>

      {/* Service List */}
      <div className="service-list">
        {services.map((service, index) => (
          <div
            className={`service-card ${service.className}`}
            key={index}
          >
            <div className="service-left">

              <div className="service-icon">
                {service.icon}
              </div>

              <div className="service-info">
                <h3>{service.name}</h3>
                <p>{service.number}</p>
              </div>

            </div>

            <button
              className="call-btn"
              onClick={() => makeCall(service.number)}
            >
              <Phone size={17} />
              Call
            </button>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="emergency-note">
        <Phone size={17} />
        <span>
          Emergency calls may connect you to local emergency services.
        </span>
      </div>

    </div>
  );
}

export default EmergencyCall;

