"use client";

import { useState } from 'react';
import axios from 'axios';

const Chat = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');

  const playAudio = (audioContent: string) => {
    const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
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

  const sendMessage = async () => {
    if (input.trim()) {
      const userMessage = { role: 'user', content: input };
      setMessages([...messages, userMessage]);
      setInput('');

      try {
        const response = await axios.post('/api/chatbot', { message: input });
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#000' }}>
      <div style={{ width: '40%', padding: '20px', color: '#fff', display: 'flex', flexDirection: 'column', fontSize: '1.2rem' }}>
        <div style={{ flexGrow: 1, overflowY: 'auto', border: '1px solid #fff', marginBottom: '15px', padding: '15px', borderRadius: '10px' }}>
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
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
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
      </div>
    </div>
  );
};

export default Chat;
