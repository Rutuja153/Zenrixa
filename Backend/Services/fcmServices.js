const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

function initializeFirebaseAdmin() {
  if (admin.apps.length) return admin.app();

  const jsonPath = path.join(__dirname, "../firebase-service-account.json");
  if (fs.existsSync(jsonPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log("🔥 Firebase Admin initialized from firebase-service-account.json");
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    console.warn("⚠️ Firebase Admin is not configured. FCM sending is disabled.");
    return null;
  }

  admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
  });

  console.log("🔥 Firebase Admin initialized");
  return admin.app();
}

const getMessaging = () => {
  const app = initializeFirebaseAdmin();
  return app ? admin.messaging(app) : null;
};

const sendPushNotification = async ({ tokens = [], title, body, data = {} }) => {
  const messaging = getMessaging();
  const cleanTokens = [...new Set(tokens.filter(Boolean))];

  if (!messaging || cleanTokens.length === 0) {
    return { success: false, sent: 0, failed: 0, disabled: !messaging };
  }

  const response = await messaging.sendEachForMulticast({
    tokens: cleanTokens,
    notification: { title, body },
    data: Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, String(value ?? "")])
    ),
    webpush: {
      fcmOptions: {
        link: process.env.CLIENT_URL || "http://localhost:5173",
      },
    },
  });

  return {
    success: response.successCount > 0,
    sent: response.successCount,
    failed: response.failureCount,
  };
};

const sendSOSNotification = async ({ token, userName, latitude, longitude, sosId }) =>
  sendPushNotification({
    tokens: [token],
    title: "🚨 ZENRIXA SOS ALERT",
    body: `${userName || "Zenrixa User"} has activated an emergency SOS.`,
    data: {
      type: "SOS",
      userName: userName || "Zenrixa User",
      latitude,
      longitude,
      location:
        latitude != null && longitude != null
          ? `https://www.google.com/maps?q=${latitude},${longitude}`
          : "",
      sosId: sosId || "",
    },
  });

module.exports = {
  initializeFirebaseAdmin,
  sendPushNotification,
  sendSOSNotification,
};
