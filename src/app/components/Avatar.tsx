// src/app/components/Avatar.tsx

"use client";

import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

const Avatar = () => {
  const [zPosition, setZPosition] = useState(2); // Initial z-position

  useEffect(() => {
    const container = document.getElementById('three-container');
    if (!container) {
      console.error('Three.js container not found');
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    camera.position.z = 5;

    const loader = new GLTFLoader();
    loader.load(
      'https://models.readyplayer.me/670346cf093a7eb2d0288995.glb', // Ready Player Me Avatar URL
      (gltf: GLTF) => {
        const model = gltf.scene;
        model.position.set(0, 0, zPosition);
        model.scale.set(1, 1, 1);
        scene.add(model);

        const animate = () => {
          model.position.z = zPosition; // Update based on slider
          requestAnimationFrame(animate);
          renderer.render(scene, camera);
        };
        animate();
      },
      (progress) => {
        console.log(`Loading progress: ${(progress.loaded / progress.total) * 100}%`);
      },
      (error) => {
        console.error('Error loading avatar model:', error);
      }
    );

    return () => {
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [zPosition]);

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Slider at the Top */}
      <div style={{ margin: '20px 0' }}>
        <label htmlFor="position-slider" style={{ display: 'block', marginBottom: '10px' }}>
          Adjust Z-Position:
        </label>
        <input
          id="position-slider"
          type="range"
          min="-10"
          max="10"
          step="0.1"
          value={zPosition}
          onChange={(e) => setZPosition(parseFloat(e.target.value))}
          style={{ width: '80%', padding: '5px' }}
        />
      </div>

      {/* Three.js Container */}
      <div id="three-container" style={{ width: '100%', height: '400px', backgroundColor: '#000' }}></div>
    </div>
  );
};

export default Avatar;
