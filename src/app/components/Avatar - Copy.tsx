// src/app/components/Avatar.tsx

"use client";

import { useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader';

const Avatar = () => {
  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement); // Attach to body directly

    camera.position.z = 2;

    // GLTFLoader to Load the Avatar Model
    const loader = new GLTFLoader();
    loader.load(
      'https://models.readyplayer.me/670346cf093a7eb2d0288995.glb', // Replace with your model URL
      (gltf: GLTF) => {
        const model = gltf.scene;
        model.position.set(1, 1, 1); // Center at the origin
        model.scale.set(2, 2, 2);    // Set the scale factor as needed
        scene.add(model);
      },
      (progress) => {
        console.log(`Loading progress: ${(progress.loaded / progress.total) * 100}%`);
      },
      (error) => {
        console.error('Error loading avatar model:', error);
      }
    );
    

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };

    animate();

    // Clean up when component unmounts
    return () => {
      renderer.dispose();
      document.body.removeChild(renderer.domElement);
    };
  }, []);

  return null;
};

export default Avatar;
