"use client";

import { useState } from 'react';

const Chat = () => {
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ sender: string; text: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const speak = async (text: string) => {
    try {
      const response = await fetch('/api/google-tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
  
      const data = await response.json();
      if (data.audioContent) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        audio.play();
      } else {
        console.error('Failed to get audio content:', data.error);
      }
    } catch (error) {
      console.error('Error calling TTS API:', error);
    }
  };
  

  const sendMessage = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    setError(null);

    // Add user message to chat log
    setChatLog([...chatLog, { sender: 'User', text: message }]);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response from chatbot.');
      }

      const data = await response.json();
      const botMessage = data.reply;
      setChatLog((log) => [...log, { sender: 'Chatbot', text: botMessage }]);
      speak(botMessage); // Speak the chatbot response
    } catch (err) {
      console.error('Error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setMessage('');
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-6">
      <div className="w-full max-w-md bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Chat with the AI</h2>
        <div className="chat-log mb-4 p-3 border rounded-lg h-64 overflow-y-scroll bg-gray-50 space-y-2">
          {chatLog.map((entry, index) => (
            <div
              key={index}
              className={`flex ${entry.sender === 'User' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`p-2 rounded-lg max-w-xs ${
                  entry.sender === 'User' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                }`}
              >
                {entry.text}
              </div>
            </div>
          ))}
          {isLoading && <p className="text-gray-500">Chatbot is typing...</p>}
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message and press Enter..."
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export default Chat;
