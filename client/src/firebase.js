import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import { getMessaging, getToken, isSupported, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCjl9tVencKjDxVhNEypzqrgF1tNoPbwUs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "zenrixa-68ede.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "zenrixa-68ede",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "zenrixa-68ede.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "438588615707",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:438588615707:web:bc82a3fe042c56af6a9cbe",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

export const messaging = isSupported().then((supported) => {
  if (!supported) return null;
  return getMessaging(app);
});

export async function requestFcmToken() {
  if (!("Notification" in window)) return null;

  const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
  if (!vapidKey) {
    console.warn("VITE_FIREBASE_VAPID_KEY is missing; push notifications are disabled.");
    return null;
  }

  const permission =
    Notification.permission === "granted"
      ? "granted"
      : await Notification.requestPermission();

  if (permission !== "granted") return null;

  const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
  const messagingInstance = await messaging;
  if (!messagingInstance) return null;

  return getToken(messagingInstance, { vapidKey, serviceWorkerRegistration: registration });
}

export { onMessage };
