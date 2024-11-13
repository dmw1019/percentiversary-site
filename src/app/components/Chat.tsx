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
    onstart: () => void;
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
      setInput('');

      try {
        const response = await axios.post('/api/chatbot', { message: contentToSend });
        const reply = response.data.reply;

        setMessages((prevMessages) => [
          ...prevMessages,
          { role: 'assistant', content: reply },
        ]);

        await requestGoogleTTS(reply);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleTextSubmit = () => {
    if (input.trim()) {
      sendMessage(input);
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
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#1e1e1e',
      color: '#ffffff',
      fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '95%',
        maxWidth: '800px',
        height: '90%',
        backgroundColor: '#2a2a2a',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      }}>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: '15px',
          padding: '15px',
          borderRadius: '10px',
          backgroundColor: '#1e1e1e',
        }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{
              backgroundColor: msg.role === 'user' ? '#4CAF50' : '#3a3a3a',
              borderRadius: '10px',
              padding: '10px 15px',
              marginBottom: '10px',
              color: '#fff',
              maxWidth: '75%',
              alignSelf: msg.role === 'user' ? 'flex-start' : 'flex-end',
              fontSize: '1rem'
            }}>
              {msg.content}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: '15px',
              backgroundColor: '#333',
              color: '#ffffff',
              border: '1px solid #555',
              borderRadius: '5px',
              fontSize: '1rem',
              resize: 'none',
              height: '60px'
            }}
          ></textarea>
          <button
            onClick={handleTextSubmit}
            style={{
              padding: '15px 20px',
              backgroundColor: '#4CAF50',
              color: '#ffffff',
              border: 'none',
              borderRadius: '5px',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Submit
          </button>
        </div>
        <button
          onClick={startPressToTalk}
          style={{
            width: '100%',
            marginTop: '10px',
            padding: '15px',
            backgroundColor: isListening ? '#d32f2f' : '#4CAF50',
            color: '#ffffff',
            border: 'none',
            borderRadius: '5px',
            fontSize: '1rem',
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
