import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  Mail,
  CircleHelp,
  MessageCircle,
  Send,
} from "lucide-react";
import "../Style/Support.css";

function Support() {
  const navigate = useNavigate();

  const [message, setMessage] = useState("");

  const sendMessage = () => {
    if (!message.trim()) {
      alert("Please enter your message.");
      return;
    }

    alert("Message sent successfully!");
    setMessage("");
  };

  return (
    <div className="support-page">

      {/* Header */}
      <div className="support-header">
        <ArrowLeft onClick={() => navigate("/profile")} />
        <h2>Help & Support</h2>
      </div>

      {/* Support Options */}
      <div className="support-card">
        <Phone color="#6C3EF4" />
        <div>
          <h3>Call Support</h3>
          <p>+91 9876543210</p>
        </div>
      </div>

      <div className="support-card">
        <Mail color="#6C3EF4" />
        <div>
          <h3>Email Support</h3>
          <p>support@zenrixa.com</p>
        </div>
      </div>

      <div className="support-card">
        <CircleHelp color="#6C3EF4" />
        <div>
          <h3>Frequently Asked Questions</h3>
          <p>Find answers to common questions.</p>
        </div>
      </div>

      {/* Message Box */}
      <div className="message-box">
        <h3>
          <MessageCircle size={20} />
          Send us a Message
        </h3>

        <textarea
          placeholder="Describe your issue..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>

        <button onClick={sendMessage}>
          <Send size={18} />
          Send Message
        </button>
      </div>

    </div>
  );
}

export default Support;