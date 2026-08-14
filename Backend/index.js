// =====================================================
// ZENRIXA BACKEND - index.js
// =====================================================

require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const http = require("http");
const { Server } = require("socket.io");


// =====================================================
// APP SETUP
// =====================================================

const app = express();

const server = http.createServer(app);


// =====================================================
// CREATE UPLOAD DIRECTORIES
// =====================================================

const uploadsPath = path.join(
  __dirname,
  "uploads"
);

const journeyUploadsPath = path.join(
  uploadsPath,
  "journeys"
);


// Create uploads folder if it doesn't exist
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, {
    recursive: true,
  });
}


// Create journey image folder
if (!fs.existsSync(journeyUploadsPath)) {
  fs.mkdirSync(journeyUploadsPath, {
    recursive: true,
  });
}


console.log(
  "📁 Upload directory:",
  uploadsPath
);

console.log(
  "📁 Journey images directory:",
  journeyUploadsPath
);


// =====================================================
// CORS
// =====================================================

const allowedOrigins = (
  process.env.CLIENT_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((v) => v.trim())
  .filter(Boolean);


app.use(
  cors({
    origin: (origin, callback) => {

      // Allow requests such as Postman
      if (!origin) {
        return callback(null, true);
      }

      // Allow all origins
      if (allowedOrigins.includes("*")) {
        return callback(null, true);
      }

      // Allow configured frontend
      if (
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      console.error(
        "❌ CORS blocked:",
        origin
      );

      return callback(
        new Error(
          "CORS origin not allowed"
        )
      );
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: true,
  })
);


// =====================================================
// BODY PARSERS
// =====================================================

app.use(
  express.json({
    limit: "2mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  })
);


// =====================================================
// STATIC UPLOAD FILES
// =====================================================
//
// Important for Journey images:
//
// Database:
// /uploads/journeys/example.jpg
//
// Browser:
// http://localhost:5000/uploads/journeys/example.jpg
//
// =====================================================

app.use(
  "/uploads",
  express.static(uploadsPath)
);


// =====================================================
// SOCKET.IO
// =====================================================

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
    ],
  },

  transports: [
    "websocket",
    "polling",
  ],
});


// =====================================================
// ROUTES
// =====================================================

const userRoutes =
  require("./Route/userRoutes");

const notificationRoutes =
  require("./Route/notificationRoutes");

const settingRoutes =
  require("./Route/settingRoutes");

const journeyRoutes =
  require("./Route/journeyRoutes");

const emergencyRoutes =
  require("./Route/emergencyRoutes");

const contactRoutes =
  require("./Route/contactRoutes");

const profileRoute =
  require("./Route/profileRoute");

const alertRoutes =
  require("./Route/alertRoutes");

const sosRoutes =
  require("./Route/sosRoutes");

const smsRoutes =
  require("./Route/smsRoutes");

const chatRoutes =
  require("./Route/chatRoutes");

const locationRoutes =
  require("./Route/locationRoutes");

const reportRoutes =
  require("./Route/reportRoutes");


// =====================================================
// API ROUTES
// =====================================================

app.use(
  "/api/user",
  userRoutes
);

app.use(
  "/api/notification",
  notificationRoutes
);

app.use(
  "/api/settings",
  settingRoutes
);

app.use(
  "/api/journey",
  journeyRoutes
);

app.use(
  "/api/emergency",
  emergencyRoutes
);

app.use(
  "/api/contact",
  contactRoutes
);

app.use(
  "/api/profile",
  profileRoute
);

app.use(
  "/api/alert",
  alertRoutes
);

app.use(
  "/api/sos",
  sosRoutes
);

app.use(
  "/api/sms",
  smsRoutes
);

app.use(
  "/api/chat",
  chatRoutes
);

app.use(
  "/api/location",
  locationRoutes
);

app.use(
  "/api/report",
  reportRoutes
);


// =====================================================
// HOME
// =====================================================

app.get(
  "/",
  (req, res) => {

    res.json({
      success: true,
      message:
        "Zenrixa Backend is Running",
    });

  }
);


// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
  "/api/health",
  (req, res) => {

    res.json({
      success: true,

      database:
        mongoose.connection
          .readyState === 1,

      uploads: fs.existsSync(
        uploadsPath
      ),

      journeyUploads:
        fs.existsSync(
          journeyUploadsPath
        ),
    });

  }
);


// =====================================================
// TEST JOURNEY UPLOAD DIRECTORY
// =====================================================

app.get(
  "/api/journey-upload-test",
  (req, res) => {

    res.json({
      success: true,

      uploadsPath,

      journeyUploadsPath,

      exists:
        fs.existsSync(
          journeyUploadsPath
        ),
    });

  }
);


// =====================================================
// SOCKET.IO
// =====================================================

io.on(
  "connection",
  (socket) => {

    console.log(
      "🔌 Socket connected:",
      socket.id
    );


    // =================================================
    // REGISTER USER
    // =================================================

    socket.on(
      "registerUser",
      ({ userId } = {}) => {

        if (!userId) {
          return;
        }


        const room =
          `user_${userId}`;


        socket.join(room);

        socket.data.userId =
          String(userId);


        console.log(
          `👤 User registered: ${userId}`
        );

      }
    );


    // =================================================
    // JOIN SOS
    // =================================================

    socket.on(
      "joinSOS",
      ({ sosId } = {}) => {

        if (!sosId) {
          return;
        }


        const room =
          `sos_${sosId}`;


        socket.join(room);


        console.log(
          `🚨 Joined SOS room: ${sosId}`
        );

      }
    );


    // =================================================
    // SEND LOCATION
    // =================================================

    socket.on(
      "sendLocation",
      (data = {}) => {

        if (
          data.latitude == null ||
          data.longitude == null
        ) {
          return;
        }


        const location = {

          userId:
            data.userId ||
            null,

          latitude:
            Number(
              data.latitude
            ),

          longitude:
            Number(
              data.longitude
            ),

          accuracy:
            data.accuracy == null
              ? null
              : Number(
                  data.accuracy
                ),

          sosId:
            data.sosId ||
            null,

          timestamp:
            new Date(),
        };


        if (data.userId) {

          io.to(
            `user_${data.userId}`
          ).emit(
            "receiveLocation",
            location
          );

        }


        if (data.sosId) {

          io.to(
            `sos_${data.sosId}`
          ).emit(
            "receiveLocation",
            location
          );

        }

      }
    );


    // =================================================
    // SOS ACTIVATED
    // =================================================

    socket.on(
      "sosActivated",
      (data = {}) => {

        if (!data.userId) {
          return;
        }


        const payload = {

          ...data,

          timestamp:
            new Date(),

          message:
            "Emergency SOS activated",
        };


        io.to(
          `user_${data.userId}`
        ).emit(
          "sosAlert",
          payload
        );


        if (data.sosId) {

          io.to(
            `sos_${data.sosId}`
          ).emit(
            "sosAlert",
            payload
          );

        }

      }
    );


    // =================================================
    // STOP LOCATION
    // =================================================

    socket.on(
      "stopLocation",
      (data = {}) => {

        const payload = {

          ...data,

          timestamp:
            new Date(),

          message:
            "Live location sharing stopped",
        };


        if (data.userId) {

          io.to(
            `user_${data.userId}`
          ).emit(
            "locationStopped",
            payload
          );

        }


        if (data.sosId) {

          io.to(
            `sos_${data.sosId}`
          ).emit(
            "locationStopped",
            payload
          );

        }

      }
    );


    // =================================================
    // SOS CANCELLED
    // =================================================

    socket.on(
      "sosCancelled",
      (data = {}) => {

        const payload = {

          ...data,

          timestamp:
            new Date(),

          message:
            "Emergency SOS has been cancelled",
        };


        if (data.userId) {

          io.to(
            `user_${data.userId}`
          ).emit(
            "sosCancelled",
            payload
          );

        }


        if (data.sosId) {

          io.to(
            `sos_${data.sosId}`
          ).emit(
            "sosCancelled",
            payload
          );

        }

      }
    );


    // =================================================
    // DISCONNECT
    // =================================================

    socket.on(
      "disconnect",
      () => {

        console.log(
          "🔌 Socket disconnected:",
          socket.id
        );

      }
    );

  }
);


// =====================================================
// MONGODB
// =====================================================

if (!process.env.MONGO_URI) {

  console.error(
    "❌ MONGO_URI is missing in .env"
  );

} else {

  mongoose
    .connect(
      process.env.MONGO_URI
    )
    .then(() => {

      console.log(
        "✅ MongoDB Connected"
      );

    })
    .catch(
      (error) => {

        console.error(
          "❌ MongoDB Connection Error:",
          error.message
        );

      }
    );

}


// =====================================================
// SERVER
// =====================================================

const PORT =
  process.env.PORT || 5000;


server.listen(
  PORT,
  () => {

    console.log("");
    console.log(
      "======================================"
    );

    console.log(
      "🚀 ZENRIXA BACKEND"
    );

    console.log(
      "======================================"
    );

    console.log(
      `✅ Server: http://localhost:${PORT}`
    );

    console.log(
      `🔌 Socket.IO: Ready`
    );

    console.log(
      `📁 Uploads: http://localhost:${PORT}/uploads`
    );

    console.log(
      `🖼️ Journey Images: http://localhost:${PORT}/uploads/journeys`
    );

    console.log(
      "======================================"
    );

  }
);