// src/app/components/Chat.tsx

"use client";

import { useEffect, useState } from 'react';
import axios from 'axios';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

const AvatarWithChat = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    const container = document.getElementById('avatar-container');
    if (!container) {
      console.error('Avatar container not found');
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(85, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0.25, 1); 

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    camera.lookAt(0, 0, 0);

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const loader = new GLTFLoader();
    loader.load(
      '/models/670346cf093a7eb2d0288995.glb',
      (gltf: GLTF) => {
        const loadedModel = gltf.scene;
        loadedModel.position.set(0, -2, 0);
        loadedModel.rotation.y = 0;
        loadedModel.scale.set(1.5, 1.5, 1.5);
        scene.add(loadedModel);
        setModel(loadedModel);
      },
      undefined,
      (error) => {
        console.error('Error loading avatar model:', error);
      }
    );

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

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
      <div id="avatar-container" style={{ width: '60%', height: '100%' }}></div>
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

export default AvatarWithChat;
