importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCjl9tVencJkDxVhNEypzQrgF1tNoPbwUs",
  authDomain: "zenrixa-68ede.firebaseapp.com",
  projectId: "zenrixa-68ede",
  storageBucket: "zenrixa-68ede.firebasestorage.app",
  messagingSenderId: "438588615707",
  appId: "1:438588615707:web:bc82a3fe042c56af6a9cbe",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Zenrixa Emergency Alert";
  const options = {
    body: payload.notification?.body || "An emergency SOS alert has been received.",
    icon: "/favicon.svg",
    data: payload.data || {},
  };
  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.location || "/";
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
    for (const client of clientList) {
      if ("focus" in client) {
        client.focus();
        return client;
      }
    }
    if (clients.openWindow) return clients.openWindow(target);
  }));
});
