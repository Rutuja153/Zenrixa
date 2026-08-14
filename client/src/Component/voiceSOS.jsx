import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

function VoiceSOS() {

  const navigate = useNavigate();

  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState("");

  const recognitionRef = useRef(null);

  useEffect(() => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

      setMessage(
        "Voice recognition is not supported in this browser."
      );

      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;


    // When microphone starts
    recognition.onstart = () => {

      setListening(true);

      setMessage(
        "Listening... Say 'Zenrixa SOS'"
      );

    };


    // When voice is detected
    recognition.onresult = (event) => {

      const spokenText =
        event.results[0][0].transcript
          .toLowerCase()
          .trim();

      console.log("Voice:", spokenText);


      if (
        spokenText.includes("zenrixa sos") ||
        spokenText.includes("zenrixa emergency") ||
        spokenText.includes("help me")
      ) {

        setMessage("SOS command detected!");

        navigate("/sos");

      } else {

        setMessage(
          `Heard: "${spokenText}"`
        );

      }

    };


    // Error
    recognition.onerror = (event) => {

      console.log(
        "Voice Error:",
        event.error
      );

      if (event.error === "not-allowed") {

        setMessage(
          "Please allow microphone permission."
        );

      } else {

        setMessage(
          "Could not understand. Try again."
        );

      }

      setListening(false);

    };


    // Recognition stopped
    recognition.onend = () => {

      setListening(false);

    };


    recognitionRef.current = recognition;


    return () => {

      recognition.stop();

    };

  }, [navigate]);


  // Start microphone
  const startListening = () => {

    if (!recognitionRef.current) {

      alert(
        "Voice recognition is not supported."
      );

      return;

    }

    try {

      recognitionRef.current.start();

    } catch (error) {

      console.log(error);

    }

  };


  // Stop microphone
  const stopListening = () => {

    if (recognitionRef.current) {

      recognitionRef.current.stop();

    }

    setListening(false);

    setMessage(
      "Voice recognition stopped."
    );

  };


  return (

    <div className="voice-sos-container">

      <button
        className={
          listening
            ? "voice-sos-btn listening"
            : "voice-sos-btn"
        }

        onClick={
          listening
            ? stopListening
            : startListening
        }
      >

        {listening ? (
          <MicOff size={25} />
        ) : (
          <Mic size={25} />
        )}

      </button>


      <p className="voice-status">

        {message ||
          "Tap microphone and say 'Zenrixa SOS'"}

      </p>

    </div>

  );

}

export default VoiceSOS;