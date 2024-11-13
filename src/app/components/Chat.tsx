"use client";

import { useState, useRef } from 'react';
import axios from 'axios';

// Define types for SpeechRecognition and SpeechRecognitionEvent to avoid using `any`
interface ISpeechRecognition {
  new (): {
    lang: string;
    interimResults: boolean;
    continuous: boolean;
    onresult: (event: ISpeechRecognitionEvent) => void;
    onerror: (event: ErrorEvent) => void;
    onend: () => void;
    onstart: () => void; // Added `onstart`
    start: () => void;
    stop: () => void;
  };
}

interface ISpeechRecognitionEvent {
  results: {
    [key: number]: {
      [key: number]: { transcript: string };
    };
  };
}

// Extend the Window interface with the new SpeechRecognition types
declare global {
  interface Window {
    SpeechRecognition: ISpeechRecognition;
    webkitSpeechRecognition: ISpeechRecognition;
  }
}

const Chat = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = (audioContent: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
    audioRef.current = audio;
    audio.play();
  };

  const requestGoogleTTS = async (text: string) => {
    try {
      const response = await axios.post('/api/google-tts', { text });
      const audioContent = response.data.audioContent;
      playAudio(audioContent);
    } catch (error) {
      console.error('Error with Google TTS API:', error);
    }
  };

  const sendMessage = async (messageContent: string) => {
    const contentToSend = messageContent || input;
    if (contentToSend.trim()) {
      const userMessage = { role: 'user', content: contentToSend };
      setMessages([...messages, userMessage]);
      setInput(''); // Clear the input field

      try {
        const response = await axios.post('/api/chatbot', { message: contentToSend });
        const reply = response.data.reply;

        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'assistant', content: reply },
        ]);

        await requestGoogleTTS(reply); // Play the response using Google TTS
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const startPressToTalk = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser. Try Chrome or Edge.");
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      sendMessage(transcript);
    };

    recognition.onerror = (error: ErrorEvent) => {
      console.error("Speech recognition error detected: " + error.message);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#000', justifyContent: 'center' }}>
      <div style={{ width: '40%', padding: '20px', color: '#fff', display: 'flex', flexDirection: 'column', fontSize: '1.2rem', margin: '0 auto' }}>
        <div style={{ flexGrow: 1, overflowY: 'auto', marginBottom: '15px', padding: '15px', borderRadius: '10px' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              backgroundColor: msg.role === 'user' ? '#2a2a2a' : '#3a3a3a',
              borderRadius: '15px',
              padding: '12px 18px',
              marginBottom: '12px',
              alignSelf: msg.role === 'user' ? 'flex-start' : 'flex-end',
              color: msg.role === 'user' ? '#00ff00' : '#fff',
              maxWidth: '80%',
              fontSize: '1.1rem'
            }}>
              {msg.content}
            </div>
          ))}
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message or press the mic button to speak..."
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: '#222',
            color: '#00ff00',
            border: '1px solid #555',
            borderRadius: '10px',
            fontSize: '1.2rem',
            height: '60px'
          }}
        ></textarea>
        <button
          onClick={startPressToTalk}
          style={{
            width: '100%',
            marginTop: '10px',
            padding: '10px 20px',
            backgroundColor: isListening ? '#f00' : '#00f',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            fontSize: '1.2rem',
            cursor: 'pointer'
          }}
        >
          {isListening ? 'Listening...' : '🎤 Press to Talk'}
        </button>
      </div>
    </div>
  );
};

export default Chat;
