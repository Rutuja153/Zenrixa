import { io } from "socket.io-client";
import { SOCKET_URL } from "./config";

const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});

socket.on("connect", () => {
  const userId = localStorage.getItem("userId");
  if (userId) socket.emit("registerUser", { userId });
});

socket.on("sosAlert", (data) => {
  window.dispatchEvent(new CustomEvent("zenrixaSosAlert", { detail: data }));
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("🚨 Zenrixa Emergency SOS", {
      body: data.message || "Emergency SOS has been activated.",
    });
  }
});

socket.on("receiveLocation", (data) =>
  window.dispatchEvent(new CustomEvent("zenrixaLocation", { detail: data }))
);
socket.on("locationStopped", (data) =>
  window.dispatchEvent(new CustomEvent("zenrixaLocationStopped", { detail: data }))
);
socket.on("sosCancelled", (data) =>
  window.dispatchEvent(new CustomEvent("zenrixaSosCancelled", { detail: data }))
);

export default socket;
