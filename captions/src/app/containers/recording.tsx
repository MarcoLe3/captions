"use client";

import { useState, useEffect, useRef } from "react";
import Start from "../components/buttons/startMicrophone";
import Stop from "../components/buttons/stopMicrophone";
import Input from "../components/cards/input";
import SaveRecording from "../components/cards/saveRecording";

// ---- Minimal TS declarations for Web Speech API ----
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }

  interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
  }

  interface SpeechRecognitionResult {
    isFinal: boolean;
    length: number;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionEvent extends Event {
    resultIndex: number;
    results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onend: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  }
}
// ----------------------------------------------------

const Recording = () => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [saveTranscript, setSaveTranscript] = useState<string[]>([]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const listeningRef = useRef(false);

  // keep ref in sync with state (so onend sees the latest value)
  useEffect(() => {
    listeningRef.current = listening;
  }, [listening]);

  // init SpeechRecognition ONCE
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition: SpeechRecognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        }
      }
      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
      }
    };

    recognition.onend = () => {
      // auto-restart only if user still wants to listen
      if (listeningRef.current) {
        try {
          recognition.start();
        } catch (e) {
          // ignore "already started" style errors
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, []); // <-- important: run once

  const handleStart = () => {
    if (!recognitionRef.current) return;
    setTranscript(""); // clear current view
    try {
      recognitionRef.current.start();
      setListening(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStop = () => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
    if (transcript.trim() !== "") {
      setSaveTranscript((prev) => [...prev, transcript]);
    }
    setListening(false);
  };

  return (
    <div className="p-4 flex gap-6">
      <div className="flex flex-col gap-3 h-[50vh]">
        <h2 className="text-xl font-bold text-white">Live Captions</h2>
        <Input word={transcript || "Waiting for speech"} />
        {listening ? (
          <Stop onClick={handleStop} />
        ) : (
          <Start onClick={handleStart} />
        )}
      </div>

      {/* SaveRecording should accept { word: string[] } and map them */}
      <SaveRecording word={saveTranscript} />
    </div>
  );
};

export default Recording;
