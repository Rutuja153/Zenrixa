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
    localStorage.getItem(
      "zenrixaCurrentUser"
    );

  const currentUser = savedUser
    ? JSON.parse(savedUser)
    : null;

  const userId =
    currentUser?.userId;

  const userName =
    currentUser?.name || "User";


  // =====================================================
  // STATES
  // =====================================================

  const [messages, setMessages] =
    useState([
      {
        type: "bot",

        text:
          `👋 Hi ${userName}!\n` +
          `I am Zenrixa AI.\n` +
          `How can I help you today?`,
      },

      {
        type: "bot",

        text:
          "✔️ Safety tips\n" +
          "✔️ Safe route suggestions\n" +
          "✔️ Nearby help\n" +
          "✔️ Emergency guidance\n" +
          "✔️ Any safety question",
      },
    ]);


  const [input, setInput] =
    useState("");


  const [loading, setLoading] =
    useState(false);


  // Microphone state

  const [listening, setListening] =
    useState(false);


  // Speech recognition reference

  const recognitionRef =
    useRef(null);


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


    recognitionRef.current =
      recognition;


    // ===================================================
    // MICROPHONE STARTED
    // ===================================================

    recognition.onstart = () => {

      setListening(true);

      console.log(
        "🎤 Microphone started"
      );
    };


    // ===================================================
    // VOICE → TEXT
    // ===================================================

    recognition.onresult =
      (event) => {

        const transcript =
          event.results[0][0]
            .transcript;


        console.log(
          "Voice:",
          transcript
        );


        setInput(
          (previousText) => {

            if (
              previousText.trim()
            ) {

              return (
                previousText +
                " " +
                transcript
              );
            }

            return transcript;
          }
        );
      };


    // ===================================================
    // MICROPHONE STOPPED
    // ===================================================

    recognition.onend = () => {

      setListening(false);

      console.log(
        "🎤 Microphone stopped"
      );
    };


    // ===================================================
    // MICROPHONE ERROR
    // ===================================================

    recognition.onerror =
      (event) => {

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


    // ===================================================
    // START MICROPHONE
    // ===================================================

    recognition.start();
  };


  // =====================================================
  // SEND MESSAGE TO AI
  // =====================================================

  const sendMessage = async () => {

    // ===================================================
    // DON'T SEND EMPTY MESSAGE
    // ===================================================

    if (!input.trim()) {
      return;
    }


    // ===================================================
    // CHECK LOGIN
    // ===================================================

    if (!userId) {

      alert(
        "Please login first."
      );

      navigate("/login");

      return;
    }


    // ===================================================
    // SAVE USER MESSAGE
    // ===================================================

    const userText =
      input.trim();


    const userMessage = {
      type: "user",
      text: userText,
    };


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


    // ===================================================
    // CALL BACKEND
    // ===================================================

    try {

      console.log(
        "📡 Sending message to:",
        `${API_URL}/api/chat`
      );


      const response =
        await axios.post(
          `${API_URL}/api/chat`,
          {
            message: userText,

            userId: userId,

            userName: userName,
          },
          {
            timeout: 130000,
          }
        );


      console.log(
        "✅ Backend response:",
        response.data
      );


      // =================================================
      // SUCCESS
      // =================================================

      if (
        response.data?.success
      ) {

        const botMessage = {

          type: "bot",

          text:
            response.data.reply ||
            "Sorry, I couldn't generate a response.",
        };


        setMessages(
          (previousMessages) => [
            ...previousMessages,
            botMessage,
          ]
        );


        return;
      }


      // =================================================
      // BACKEND RETURNED ERROR
      // =================================================

      let errorMessage =
        "⚠️ Zenrixa AI could not respond. Please try again.";


      if (
        response.data?.code ===
        "OLLAMA_NOT_CONFIGURED"
      ) {

        errorMessage =
          "⚠️ Zenrixa AI is not configured on the server.";
      }


      if (
        response.data?.code ===
        "OLLAMA_UNAVAILABLE"
      ) {

        errorMessage =
          "⚠️ Zenrixa AI is currently unavailable. Please try again later.";
      }


      if (
        response.data?.code ===
        "OLLAMA_TIMEOUT"
      ) {

        errorMessage =
          "⚠️ Zenrixa AI is taking too long to respond. Please try again.";
      }


      if (
        response.data?.code ===
        "OLLAMA_ERROR"
      ) {

        errorMessage =
          "⚠️ Zenrixa AI could not process your request.";
      }


      setMessages(
        (previousMessages) => [
          ...previousMessages,

          {
            type: "bot",
            text: errorMessage,
          },
        ]
      );

    } catch (error) {

      console.error(
        "❌ Chat Error:",
        error
      );


      // =================================================
      // ERROR MESSAGE
      // =================================================

      let errorMessage =
        "⚠️ Unable to connect to Zenrixa AI. Please try again.";


      // =================================================
      // BACKEND 503
      // =================================================

      if (
        error.response?.status ===
        503
      ) {

        errorMessage =
          error.response?.data?.message ||
          "⚠️ Zenrixa AI is currently unavailable. Please try again later.";
      }


      // =================================================
      // BACKEND 400
      // =================================================

      else if (
        error.response?.status ===
        400
      ) {

        errorMessage =
          error.response?.data?.message ||
          "⚠️ Invalid request.";
      }


      // =================================================
      // BACKEND 500
      // =================================================

      else if (
        error.response?.status ===
        500
      ) {

        errorMessage =
          "⚠️ Zenrixa server encountered an error. Please try again.";
      }


      // =================================================
      // NETWORK ERROR
      // =================================================

      else if (
        error.code ===
        "ERR_NETWORK"
      ) {

        errorMessage =
          "⚠️ Cannot connect to Zenrixa server. Please check your backend deployment.";
      }


      // =================================================
      // TIMEOUT
      // =================================================

      else if (
        error.code ===
        "ECONNABORTED"
      ) {

        errorMessage =
          "⚠️ Zenrixa AI is taking too long to respond. Please try again.";
      }


      // =================================================
      // SHOW ERROR IN CHAT
      // =================================================

      setMessages(
        (previousMessages) => [
          ...previousMessages,

          {
            type: "bot",
            text: errorMessage,
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

    if (
      e.key === "Enter"
    ) {

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

              {/* AI AVATAR */}

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

          onClick={
            sendMessage
          }

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