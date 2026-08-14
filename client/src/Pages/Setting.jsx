import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft, Moon, Globe, Bell, MapPin, Shield, FileText,
  Info, LogOut, ChevronRight
} from "lucide-react";
import "../Style/Setting.css";
import { API_URL } from "../config";
import { requestFcmToken } from "../firebase";

export default function Setting() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");
  const [notification, setNotification] = useState(localStorage.getItem("notification") !== "false");
  const [location, setLocation] = useState(localStorage.getItem("location") === "true");
  const [saving, setSaving] = useState(false);

  const saveSettings = async (patch) => {
    if (!userId) return;
    try {
      setSaving(true);
      await axios.put(`${API_URL}/api/settings/${userId}`, patch);
    } catch (error) {
      console.error("Settings save error:", error.response?.data || error.message);
      alert("Unable to save settings to server.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!userId) return;
    axios.get(`${API_URL}/api/settings/${userId}`)
      .then(({ data }) => {
        if (!data.success) return;
        const s = data.settings;
        setDarkMode(Boolean(s.darkMode));
        setNotification(Boolean(s.notifications));
        setLocation(Boolean(s.autoStartLocation));
        localStorage.setItem("darkMode", String(s.darkMode));
        localStorage.setItem("notification", String(s.notifications));
        localStorage.setItem("location", String(s.autoStartLocation));
        localStorage.setItem("language", s.language || "English");
      })
      .catch((error) => console.warn("Could not load server settings:", error.message));
  }, [userId]);

  useEffect(() => {
    document.body.className = darkMode ? "dark" : "";
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = async () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("darkMode", String(next));
    await saveSettings({ darkMode: next });
  };

  const toggleNotification = async () => {
    const next = !notification;
    if (next && "Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        alert("Notification permission was not granted.");
        return;
      }
      try {
        const token = await requestFcmToken();
        if (token && userId) {
          localStorage.setItem("fcmToken", token);
          await axios.post(`${API_URL}/api/notification/token/register`, { userId, token });
        }
      } catch (error) {
        console.warn("FCM setup error:", error.message);
      }
    } else if (!next) {
      const token = localStorage.getItem("fcmToken");
      if (token && userId) {
        try {
          await axios.post(`${API_URL}/api/notification/token/remove`, { userId, token });
          localStorage.removeItem("fcmToken");
        } catch (error) {
          console.warn("FCM token removal error:", error.message);
        }
      }
    }
    setNotification(next);
    localStorage.setItem("notification", String(next));
    await saveSettings({ notifications: next });
  };

  const toggleLocation = async () => {
    const next = !location;
    if (next) {
      if (!navigator.geolocation) {
        alert("Location is not supported on this device.");
        return;
      }
      try {
        await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true, timeout: 10000
          })
        );
      } catch {
        alert("Location permission was denied.");
        return;
      }
    }
    setLocation(next);
    localStorage.setItem("location", String(next));
    await saveSettings({ autoStartLocation: next });
  };

  const logout = () => {
    localStorage.clear();
    document.body.className = "";
    navigate("/login");
  };

  return (
    <div className="setting-page">
      <div className="top">
        <button onClick={() => navigate("/profile")}><ArrowLeft /></button>
        <h2>Settings</h2>
      </div>

      <div className="card">
        <div className="row">
          <div className="left"><Moon /><span>Dark Mode</span></div>
          <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} disabled={saving} />
        </div>

        <div className="row clickable" onClick={() => navigate("/language")}>
          <div className="left"><Globe /><span>Language</span></div>
          <ChevronRight />
        </div>

        <div className="row">
          <div className="left"><Bell /><span>Notifications</span></div>
          <input type="checkbox" checked={notification} onChange={toggleNotification} disabled={saving} />
        </div>

        <div className="row">
          <div className="left"><MapPin /><span>Auto Start Location</span></div>
          <input type="checkbox" checked={location} onChange={toggleLocation} disabled={saving} />
        </div>
      </div>

      <div className="card">
        <div className="row clickable" onClick={() => navigate("/privacy")}>
          <div className="left"><Shield /><span>Privacy Policy</span></div><ChevronRight />
        </div>
        <div className="row clickable" onClick={() => navigate("/terms")}>
          <div className="left"><FileText /><span>Terms & Condition</span></div><ChevronRight />
        </div>
        <div className="row clickable" onClick={() => navigate("/about")}>
          <div className="left"><Info /><span>About ZENRIXA</span></div><ChevronRight />
        </div>
      </div>

      <button className="logout" onClick={logout}><LogOut size={18} />Logout</button>
    </div>
  );
}
