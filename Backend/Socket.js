// socket.js

const { Server } = require("socket.io");

let io;

// ==========================================
// INITIALIZE SOCKET.IO
// ==========================================

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },

    transports: [
      "websocket",
      "polling",
    ],

    pingInterval: 25000,
    pingTimeout: 60000,
  });

  // ========================================
  // SOCKET CONNECTION
  // ========================================

  io.on("connection", (socket) => {
    console.log(
      "🔌 Socket connected:",
      socket.id
    );

    // ======================================
    // REGISTER NORMAL USER
    // ======================================

    socket.on("registerUser", (userId) => {
      try {
        if (!userId) {
          console.log(
            "❌ registerUser: userId missing"
          );

          return;
        }

        const normalizedUserId =
          String(userId).trim();

        const room =
          `user_${normalizedUserId}`;

        socket.join(room);

        socket.userId =
          normalizedUserId;

        console.log(
          `👤 User registered: ${normalizedUserId}`
        );

        console.log(
          `🏠 Joined user room: ${room}`
        );

        socket.emit(
          "userRegistered",
          {
            success: true,
            userId:
              normalizedUserId,
            room,
          }
        );
      } catch (error) {
        console.error(
          "❌ registerUser Error:",
          error
        );
      }
    });

    // ======================================
    // USER LEAVES NORMAL LOCATION ROOM
    // ======================================

    socket.on(
      "leaveUserRoom",
      (userId) => {
        try {
          if (!userId) return;

          const room =
            `user_${String(
              userId
            ).trim()}`;

          socket.leave(room);

          console.log(
            `👋 Left user room: ${room}`
          );
        } catch (error) {
          console.error(
            "❌ leaveUserRoom Error:",
            error
          );
        }
      }
    );

    // ======================================
    // USER JOINS SOS ROOM
    // ======================================

    socket.on("joinSOS", (data) => {
      try {
        const {
          userId,
          sosId,
        } = data || {};

        if (!userId || !sosId) {
          console.log(
            "❌ joinSOS: userId or sosId missing"
          );

          return;
        }

        const room =
          `sos_${sosId}`;

        socket.join(room);

        socket.userId =
          String(userId);

        socket.sosId =
          String(sosId);

        console.log(
          `👤 User joined SOS room: ${room}`
        );

        console.log(
          "🆔 User ID:",
          userId
        );

        console.log(
          "🚨 SOS ID:",
          sosId
        );

        socket.emit(
          "joinedSOS",
          {
            success: true,
            room,
            userId,
            sosId,
          }
        );
      } catch (error) {
        console.error(
          "❌ joinSOS Error:",
          error
        );
      }
    });

    // ======================================
    // SOS ACTIVATED
    // ======================================

    socket.on(
      "sosActivated",
      (data) => {
        try {
          const {
            userId,
            sosId,
          } = data || {};

          if (!userId || !sosId) {
            console.log(
              "❌ sosActivated data missing"
            );

            return;
          }

          const room =
            `sos_${sosId}`;

          socket.join(room);

          socket.userId =
            String(userId);

          socket.sosId =
            String(sosId);

          console.log(
            "🚨 SOS ACTIVATED:",
            userId
          );

          console.log(
            "🚨 SOS ID:",
            sosId
          );

          console.log(
            "👥 SOS ROOM:",
            room
          );

          // Send to everyone else
          // in SOS room
          socket
            .to(room)
            .emit(
              "sosActivated",
              {
                userId,
                sosId,
                message:
                  "Emergency SOS activated",
              }
            );

          // Confirm sender
          socket.emit(
            "sosActivationConfirmed",
            {
              success: true,
              userId,
              sosId,
              room,
            }
          );
        } catch (error) {
          console.error(
            "❌ sosActivated Error:",
            error
          );
        }
      }
    );

    // ======================================
    // NORMAL LIVE LOCATION
    //
    // Used by Tracking.jsx
    //
    // IMPORTANT:
    // sosId is NOT required here.
    // ======================================

    socket.on(
      "sendLocation",
      (locationData) => {
        try {
          if (!locationData) {
            console.log(
              "❌ Location data missing"
            );

            return;
          }

          const {
            userId,
            latitude,
            longitude,
            accuracy,
            sosId,
            shareId,
          } = locationData;

          // userId required
          if (!userId) {
            console.log(
              "❌ Location userId missing"
            );

            return;
          }

          // Coordinates required
          if (
            latitude === undefined ||
            longitude === undefined
          ) {
            console.log(
              "❌ Latitude or longitude missing:",
              locationData
            );

            return;
          }

          const lat =
            Number(latitude);

          const lng =
            Number(longitude);

          if (
            !Number.isFinite(lat) ||
            !Number.isFinite(lng)
          ) {
            console.log(
              "❌ Invalid coordinates:",
              locationData
            );

            return;
          }

          const normalizedUserId =
            String(userId).trim();

          // ==================================
          // NORMAL USER ROOM
          // ==================================

          const userRoom =
            `user_${normalizedUserId}`;

          // Make sure sender belongs
          // to the room
          socket.join(userRoom);

          const mapsUrl =
            `https://www.google.com/maps?q=${lat},${lng}`;

          const locationPayload = {
            userId:
              normalizedUserId,

            latitude: lat,

            longitude: lng,

            accuracy:
              accuracy !== undefined &&
              accuracy !== null
                ? Number(accuracy)
                : null,

            sosId:
              sosId || null,

            shareId:
              shareId || null,

            mapsUrl,

            timestamp:
              new Date(),
          };

          console.log(
            "📍 Normal Live Location:",
            locationPayload
          );

          // ==================================
          // SEND TO NORMAL USER ROOM
          // ==================================

          io.to(userRoom).emit(
            "receiveLocation",
            locationPayload
          );

          console.log(
            `📡 Location sent to ${userRoom}`
          );

          console.log(
            "🗺️ Maps:",
            mapsUrl
          );

          // ==================================
          // ALSO SEND TO SOS ROOM
          //
          // If this location belongs
          // to an active SOS.
          // ==================================

          if (sosId) {
            const sosRoom =
              `sos_${sosId}`;

            socket.join(
              sosRoom
            );

            io.to(sosRoom).emit(
              "liveLocation",
              locationPayload
            );

            console.log(
              `🚨 Location also sent to ${sosRoom}`
            );
          }
        } catch (error) {
          console.error(
            "❌ sendLocation Error:",
            error
          );
        }
      }
    );

    // ======================================
    // LOCATION SHARING STARTED
    //
    // Used by Tracking.jsx
    // ======================================

    socket.on(
      "locationShared",
      (data) => {
        try {
          const {
            userId,
            shareId,
            latitude,
            longitude,
            accuracy,
            mapsUrl,
            contacts,
          } = data || {};

          if (!userId) {
            console.log(
              "❌ locationShared: userId missing"
            );

            return;
          }

          const normalizedUserId =
            String(userId).trim();

          const userRoom =
            `user_${normalizedUserId}`;

          // Make sure socket is
          // registered
          socket.join(
            userRoom
          );

          const payload = {
            userId:
              normalizedUserId,

            shareId:
              shareId || null,

            latitude:
              latitude !== undefined
                ? Number(latitude)
                : null,

            longitude:
              longitude !== undefined
                ? Number(longitude)
                : null,

            accuracy:
              accuracy !== undefined
                ? Number(accuracy)
                : null,

            mapsUrl:
              mapsUrl || null,

            contacts:
              Array.isArray(
                contacts
              )
                ? contacts
                : [],

            contactCount:
              Array.isArray(
                contacts
              )
                ? contacts.length
                : 0,

            message:
              "Live location sharing started",

            timestamp:
              new Date(),
          };

          console.log(
            "📤 LOCATION SHARING STARTED"
          );

          console.log(
            "👤 User:",
            normalizedUserId
          );

          console.log(
            "🆔 Share ID:",
            shareId
          );

          console.log(
            "👥 Contacts:",
            payload.contactCount
          );

          // ==================================
          // SEND EVENT
          // ==================================

          io.to(userRoom).emit(
            "locationShared",
            payload
          );

          // ==================================
          // SEND CONTACT NOTIFICATION EVENT
          // ==================================

          io.to(userRoom).emit(
            "locationShareAlert",
            {
              userId:
                normalizedUserId,

              shareId:
                shareId || null,

              message:
                "Location successfully shared with trusted contacts",

              contacts:
                payload.contacts,

              mapsUrl:
                mapsUrl || null,

              timestamp:
                new Date(),
            }
          );
        } catch (error) {
          console.error(
            "❌ locationShared Error:",
            error
          );
        }
      }
    );

    // ======================================
    // STOP NORMAL LOCATION
    //
    // Used by Tracking.jsx
    // ======================================

    socket.on(
      "stopLocation",
      (data) => {
        try {
          const {
            userId,
            shareId,
            sosId,
          } = data || {};

          if (!userId) {
            console.log(
              "❌ stopLocation: userId missing"
            );

            return;
          }

          const normalizedUserId =
            String(userId).trim();

          const userRoom =
            `user_${normalizedUserId}`;

          console.log(
            "🛑 NORMAL LOCATION STOPPED"
          );

          console.log(
            "👤 User:",
            normalizedUserId
          );

          console.log(
            "🆔 Share ID:",
            shareId
          );

          // ==================================
          // NOTIFY USER ROOM
          // ==================================

          io.to(userRoom).emit(
            "locationStopped",
            {
              userId:
                normalizedUserId,

              shareId:
                shareId || null,

              message:
                "Live location sharing stopped",

              timestamp:
                new Date(),
            }
          );

          // ==================================
          // ALSO STOP SOS LOCATION
          // IF sosId EXISTS
          // ==================================

          if (sosId) {
            const sosRoom =
              `sos_${sosId}`;

            io.to(sosRoom).emit(
              "locationStopped",
              {
                userId:
                  normalizedUserId,

                sosId,

                shareId:
                  shareId || null,

                message:
                  "Live location sharing stopped",

                timestamp:
                  new Date(),
              }
            );

            console.log(
              `🛑 Stop notification sent to ${sosRoom}`
            );
          }

          console.log(
            `🛑 Stop notification sent to ${userRoom}`
          );

          // IMPORTANT:
          // Do NOT leave userRoom here.
          //
          // Tracking.jsx may still need
          // normal socket communication.
        } catch (error) {
          console.error(
            "❌ stopLocation Error:",
            error
          );
        }
      }
    );

    // ======================================
    // SOS CANCELLED
    // ======================================

    socket.on(
      "sosCancelled",
      (data) => {
        try {
          const {
            userId,
            sosId,
          } = data || {};

          if (!userId || !sosId) {
            console.log(
              "❌ sosCancelled data missing"
            );

            return;
          }

          const room =
            `sos_${sosId}`;

          console.log(
            "🛑 SOS CANCELLED:",
            data
          );

          io.to(room).emit(
            "sosCancelled",
            {
              userId,
              sosId,

              message:
                "Emergency SOS cancelled",

              timestamp:
                new Date(),
            }
          );

          // Close SOS room
          io.in(
            room
          ).socketsLeave(
            room
          );

          console.log(
            `🧹 SOS room closed: ${room}`
          );
        } catch (error) {
          console.error(
            "❌ sosCancelled Error:",
            error
          );
        }
      }
    );

    // ======================================
    // JOIN CONTACT TO SOS
    // ======================================

    socket.on(
      "joinContactSOS",
      (data) => {
        try {
          const {
            contactId,
            sosId,
          } = data || {};

          if (
            !contactId ||
            !sosId
          ) {
            console.log(
              "❌ Contact SOS data missing"
            );

            return;
          }

          const room =
            `sos_${sosId}`;

          socket.join(room);

          socket.contactId =
            String(contactId);

          socket.sosId =
            String(sosId);

          console.log(
            "👥 Trusted contact joined SOS:"
          );

          console.log(
            "Contact ID:",
            contactId
          );

          console.log(
            "SOS ID:",
            sosId
          );

          console.log(
            "Room:",
            room
          );

          socket.emit(
            "contactSOSJoined",
            {
              success: true,
              contactId,
              sosId,
              room,
            }
          );
        } catch (error) {
          console.error(
            "❌ joinContactSOS Error:",
            error
          );
        }
      }
    );

    // ======================================
    // DISCONNECT
    // ======================================

    socket.on(
      "disconnect",
      (reason) => {
        console.log(
          "❌ Socket disconnected:",
          socket.id
        );

        console.log(
          "Reason:",
          reason
        );

        if (socket.userId) {
          console.log(
            "👤 Disconnected user:",
            socket.userId
          );
        }

        if (socket.sosId) {
          console.log(
            "🚨 Disconnected SOS:",
            socket.sosId
          );
        }
      }
    );

    // ======================================
    // SOCKET ERROR
    // ======================================

    socket.on(
      "error",
      (error) => {
        console.error(
          "❌ Socket Error:",
          error
        );
      }
    );
  });

  console.log(
    "✅ Socket.IO initialized"
  );

  return io;
};

// ==========================================
// GET IO INSTANCE
// ==========================================

const getIO = () => {
  if (!io) {
    throw new Error(
      "Socket.IO has not been initialized"
    );
  }

  return io;
};

// ==========================================
// EXPORT
// ==========================================

module.exports = {
  initializeSocket,
  getIO,
};