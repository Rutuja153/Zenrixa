import { useState } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import "../Style/Language.css";

export default function Language() {
  const navigate = useNavigate();

  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem("language") || "English"
  );

  const languages = [
    "English",
    "मराठी",
    "हिन्दी",
    "ગુજરાતી",
    "தமிழ்",
    "తెలుగు",
    "ಕನ್ನಡ",
    "বাংলা",
  ];

  const handleSelect = (language) => {
    setSelectedLanguage(language);
    localStorage.setItem("language", language);
  };

  const handleSave = async () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      try {
        await axios.put(`${API_URL}/api/settings/${userId}`, {
          language: selectedLanguage,
        });
      } catch (error) {
        console.error("Language save error:", error.message);
        alert("Unable to save language to server.");
        return;
      }
    }
    navigate("/setting");
  };

  return (
    <div className="language-page">
      <div className="language-header">
        <button onClick={() => navigate("/setting")}>
          <ArrowLeft size={22} />
        </button>

        <h2>Select Language</h2>
      </div>

      <div className="language-card">
        {languages.map((language) => (
          <div
            key={language}
            className={`language-item ${
              selectedLanguage === language ? "active" : ""
            }`}
            onClick={() => handleSelect(language)}
          >
            <span>{language}</span>

            {selectedLanguage === language && (
              <Check color="#6C3EF4" size={22} />
            )}
          </div>
        ))}
      </div>

      <button
        className="save-btn"
        onClick={handleSave}
      >
        Save
      </button>
    </div>
  );
}