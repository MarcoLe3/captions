"use client";

import { useState, useEffect, useRef } from "react";
import Start from "../components/buttons/startMicrophone";
import Stop from "../components/buttons/stopMicrophone";
import Input from "../components/cards/input"

const Recording = () => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript((prev) => prev + finalTranscript);
      };

      recognition.onend = () => {
        if (listening) {
          recognition.start();
        }
      };

      recognition.onerror = (event) => {
        const e = event as SpeechRecognitionErrorEvent;
        console.error("Speech recognition error:", e.error);
        setListening(false);
        };


      recognitionRef.current = recognition;
        return () => {
        recognition.removeEventListener("result", handleResult);
        recognition.removeEventListener("end", handleEnd);
        recognition.removeEventListener("error", handleError);
        recognition.stop();
        recognitionRef.current = null;
        };
    } else {
        alert("Speech recognition not supported in this browser.");
    }
  }, []);

  const handleStart = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const handleStop = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-white">Live Captions</h2>
      <Input word={transcript || "Waiting for speech"} />
      {listening ? (
        <Stop onClick={handleStop} />
      ) : (
        <Start onClick={handleStart} />
      )}
    </div>
  );
};

export default Recording;