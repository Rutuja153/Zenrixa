import { API_URL } from "../config.js";

import { useState, useRef } from "react";
import {
  ArrowLeft,
  Mic,
  Send,
  MoreVertical,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import logo from "../assets/ai.jpeg";
import "../Style/Chat.css";

function Chat() {
  const navigate = useNavigate();

  // =====================================================
  // GET LOGGED-IN USER
  // =====================================================

  const savedUser =
    localStorage.getItem("zenrixaCurrentUser");

  const currentUser = savedUser
    ? JSON.parse(savedUser)
    : null;

  const userId = currentUser?.userId;
  const userName = currentUser?.name || "User";

  // =====================================================
  // STATES
  // =====================================================

  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: `👋 Hi ${userName}!\nI am Zenrixa AI.\nHow can I help you today?`,
    },

    {
      type: "bot",
      text:
        "✔️ Safety tips\n✔️ Safe route suggestions\n✔️ Nearby help\n✔️ Emergency guidance\n✔️ Any safety question",
    },
  ]);

  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);

  // Microphone state
  const [listening, setListening] = useState(false);

  // Speech recognition reference
  const recognitionRef = useRef(null);

  // =====================================================
  // MICROPHONE / VOICE INPUT
  // =====================================================

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    // Browser support
    if (!SpeechRecognition) {
      alert(
        "Voice input is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    // Stop microphone if already listening
    if (
      listening &&
      recognitionRef.current
    ) {
      recognitionRef.current.stop();

      setListening(false);

      return;
    }

    const recognition =
      new SpeechRecognition();

    // Indian English
    recognition.lang = "en-IN";

    // Stop after one speech
    recognition.continuous = false;

    // Only final result
    recognition.interimResults = false;

    recognitionRef.current = recognition;

    // Microphone started
    recognition.onstart = () => {
      setListening(true);

      console.log(
        "🎤 Microphone started"
      );
    };

    // Convert voice to text
    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0]
          .transcript;

      console.log(
        "Voice:",
        transcript
      );

      setInput((previousText) => {
        if (previousText.trim()) {
          return (
            previousText +
            " " +
            transcript
          );
        }

        return transcript;
      });
    };

    // Microphone stopped
    recognition.onend = () => {
      setListening(false);

      console.log(
        "🎤 Microphone stopped"
      );
    };

    // Microphone error
    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setListening(false);

      if (
        event.error ===
        "not-allowed"
      ) {
        alert(
          "Microphone permission denied. Please allow microphone access."
        );
      }

      if (
        event.error ===
        "no-speech"
      ) {
        alert(
          "No speech detected. Please try again."
        );
      }
    };

    // Start microphone
    recognition.start();
  };

  // =====================================================
  // SEND MESSAGE TO AI
  // =====================================================

  const sendMessage = async () => {
    // Don't send empty message
    if (!input.trim()) {
      return;
    }

    // Check login
    if (!userId) {
      alert("Please login first.");

      navigate("/login");

      return;
    }

    const userText =
      input.trim();

    // Create user message
    const userMessage = {
      type: "user",
      text: userText,
    };

    // Show user message
    setMessages(
      (previousMessages) => [
        ...previousMessages,
        userMessage,
      ]
    );

    // Clear input
    setInput("");

    // Start loading
    setLoading(true);

    try {
      // Send to backend
      const response =
        await axios.post(
          API_URL + "/api/chat",
          {
            message: userText,
            userId: userId,
            userName: userName,
          }
        );

      console.log(
        "AI Response:",
        response.data
      );

      // Successful AI response
      if (response.data.success) {
        const botMessage = {
          type: "bot",
          text: response.data.reply,
        };

        setMessages(
          (previousMessages) => [
            ...previousMessages,
            botMessage,
          ]
        );
      } else {
        // AI response failed
        setMessages(
          (previousMessages) => [
            ...previousMessages,
            {
              type: "bot",
              text:
                "⚠️ Sorry, I couldn't generate a response.",
            },
          ]
        );
      }
    } catch (error) {
      console.error(
        "Chat Error:",
        error
      );

      setMessages(
        (previousMessages) => [
          ...previousMessages,
          {
            type: "bot",
            text:
              "⚠️ Unable to connect to Zenrixa AI. Please make sure the backend and Ollama are running.",
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // ENTER KEY
  // =====================================================

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (
        !loading &&
        input.trim()
      ) {
        sendMessage();
      }
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="chat-container">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="chat-header">

        <ArrowLeft
          size={24}
          onClick={() =>
            navigate("/home")
          }
          className="back-icon"
        />

        {/* SMALL LOGO.JPEG */}

        <img
          src={logo}
          alt="Zenrixa AI"
          className="chat-logo"
        />

        <h2>
          Zenrixa AI
        </h2>

        <MoreVertical
          size={24}
          className="more-icon"
        />

      </div>

      {/* =================================================
          CHAT BODY
      ================================================= */}

      <div className="chat-body">

        {messages.map(
          (message, index) => (

            <div
              key={index}
              className={
                message.type ===
                "user"
                  ? "user-msg"
                  : "bot-msg"
              }
            >

              {/* SMALL LOGO FOR AI */}

              {message.type ===
                "bot" && (
                <img
                  src={logo}
                  alt="AI"
                  className="bot-avatar"
                />
              )}

              {/* MESSAGE */}

              <div className="message-text">

                {message.text
                  .split("\n")
                  .map(
                    (line, i) => (
                      <div key={i}>
                        {line}
                      </div>
                    )
                  )}

                {/* MAP BUTTON */}

                {message.text
                  .toLowerCase()
                  .includes(
                    "safest route"
                  ) && (

                  <button
                    className="map-button"
                    onClick={() =>
                      navigate(
                        "/map"
                      )
                    }
                  >
                    <MapPin
                      size={16}
                    />

                    View on Map
                  </button>
                )}

              </div>

            </div>
          )
        )}

        {/* =================================================
            AI LOADING
        ================================================= */}

        {loading && (

          <div className="bot-msg">

            <img
              src={logo}
              alt="AI"
              className="bot-avatar"
            />

            <div className="message-text">

              🤖 Zenrixa AI
              is thinking...

            </div>

          </div>
        )}

      </div>

      {/* =================================================
          INPUT AREA
      ================================================= */}

      <div className="chat-input">

        {/* MICROPHONE */}

        <button
          type="button"
          className={
            listening
              ? "mic-button listening"
              : "mic-button"
          }
          onClick={
            startVoiceInput
          }
          disabled={loading}
          title={
            listening
              ? "Stop listening"
              : "Voice input"
          }
        >
          <Mic size={24} />
        </button>

        {/* TEXT INPUT */}

        <input
          type="text"
          placeholder={
            listening
              ? "Listening..."
              : "Type a message..."
          }
          value={input}
          onChange={(e) =>
            setInput(
              e.target.value
            )
          }
          onKeyDown={
            handleKeyDown
          }
          disabled={loading}
        />

        {/* SEND BUTTON */}

        <button
          className="send-button"
          onClick={sendMessage}
          disabled={
            loading ||
            !input.trim()
          }
          title="Send message"
        >
          <Send size={18} />
        </button>

      </div>

    </div>
  );
}

export default Chat;