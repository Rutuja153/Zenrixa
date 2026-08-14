# Zenrixa — working frontend + backend setup

This package keeps the existing frontend pages/CSS and adds backend persistence for Settings, FCM registration, in-app notifications, Socket.IO, profile editing, and SOS notification delivery.

## 1. Install

Open two terminals.

### Backend

```bash
cd Backend
npm install
copy .env.example .env
npm run dev
```

Linux/macOS:

```bash
cp .env.example .env
```

### Frontend

```bash
cd client
npm install
copy .env.example .env
npm run dev
```

Linux/macOS:

```bash
cp .env.example .env
```

## 2. MongoDB

Put your MongoDB connection string in `Backend/.env` as `MONGO_URI`.

Do not commit the password or connection string.

## 3. Firebase Web

In Firebase Console → Project settings → Your apps → Web app, copy:

- API key
- Auth domain
- Project ID
- Storage bucket
- Messaging sender ID
- App ID

Put them in `client/.env`.

For browser push, Firebase Console → Cloud Messaging → Web configuration → Web Push certificates → generate/copy the VAPID key and put it in:

```env
VITE_FIREBASE_VAPID_KEY=...
```

The service worker is already included at `client/public/firebase-messaging-sw.js` for the current Zenrixa Firebase project. If you change Firebase projects, update its `firebase.initializeApp(...)` values too.

## 4. Firebase Admin / FCM from backend

Do NOT put a private service-account JSON file in GitHub or in a public zip.

You can either use environment variables or place a downloaded Firebase service-account key at:

```text
Backend/firebase-service-account.json
```

Use `Backend/firebase-service-account.example.json` only as the format reference. Never commit the real JSON key.

The backend uses these environment variables if the JSON file is not present:

```env
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Copy these values from Firebase Console → Project settings → Service accounts → Generate new private key.

If your old service-account key was ever uploaded/shared, revoke/delete that key in Google Cloud/Firebase and generate a new one.

## 5. What now works

- Login/signup returns a JWT and stores the user.
- Google/GitHub Firebase login syncs the Firebase user to MongoDB.
- Profile and Edit Profile use MongoDB.
- Settings are stored in MongoDB, not only localStorage.
- Dark mode, notifications, auto-location and language settings persist.
- Browser notification permission can be enabled from Settings.
- FCM token is registered in MongoDB.
- Foreground FCM messages are forwarded to the app.
- Background FCM notifications are displayed by the service worker.
- Socket.IO uses the same `VITE_SOCKET_URL` as the backend.
- SOS creates/updates MongoDB records and saves initial location.
- SOS creates an in-app notification.
- SOS sends FCM to trusted contacts who are also Zenrixa users.
- SOS sends SMS when Twilio is configured.
- Live location continues through Socket.IO + MongoDB.
- Existing frontend CSS/UI files are retained.

## 6. Important browser limitation

Web push requires `localhost` during local development or HTTPS in production. A normal HTTP IP address is not enough for FCM web push.

Geolocation also requires a secure context (`localhost` or HTTPS).

## 7. Test backend

Open:

```text
http://localhost:5000/
http://localhost:5000/api/health
```

Expected health response contains:

```json
{"success":true,"database":true}
```

## 8. Packages

Do not copy the old `node_modules` folder. Always install from the package files:

```bash
cd Backend && npm install
cd ../client && npm install
```

## 9. Security

The original uploaded archive contained credentials/private configuration. This cleaned package does not include the old private service-account key or the old `.env` secrets. Rotate any credentials that were previously exposed.
