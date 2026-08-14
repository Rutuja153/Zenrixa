import { useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";
import { messaging, onMessage, requestFcmToken } from "../firebase";

export default function NotificationBootstrap() {
  useEffect(() => {
    let unsubscribe;

    const setup = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        const userId = localStorage.getItem("userId");
        if (!user || !userId) return;
        if (localStorage.getItem("notification") === "false") return;
        if ("Notification" in window && Notification.permission !== "granted") return;

        const token = await requestFcmToken();
        if (token) {
          localStorage.setItem("fcmToken", token);
          await axios.post(`${API_URL}/api/notification/token/register`, {
            userId,
            token,
          });
        }

        const instance = await messaging;
        if (instance) {
          unsubscribe = onMessage(instance, (payload) => {
            window.dispatchEvent(
              new CustomEvent("zenrixaNotification", { detail: payload })
            );
          });
        }
      } catch (error) {
        console.warn("Notification setup skipped:", error.message);
      }
    };

    setup();
    const handleLogin = () => setup();
    window.addEventListener("zenrixaLogin", handleLogin);
    return () => {
      unsubscribe?.();
      window.removeEventListener("zenrixaLogin", handleLogin);
    };
  }, []);

  return null;
}
