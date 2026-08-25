'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Sparkles, MessageCircle, Bell, RotateCcw } from 'lucide-react';

interface Ganesha3DHeroProps {
  onNotifyClick: () => void;
}

export default function Ganesha3DHero({ onNotifyClick }: Ganesha3DHeroProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [diyasLit, setDiyasLit] = useState(0);

  useEffect(() => {
    // Diya ignition sequence timer
    const interval = setInterval(() => {
      setDiyasLit((prev) => {
        if (prev < 8) return prev + 1;
        clearInterval(interval);
        setLoaded(true);
        return 8;
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (!currentMount) return;

    // Three.js Scene Setup
    const width = currentMount.clientWidth;
    const height = currentMount.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0d0705, 0.03);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 5.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    currentMount.appendChild(renderer.domElement);

    // Group for idol assembly
    const idolGroup = new THREE.Group();
    scene.add(idolGroup);

    // Procedural Murti Group (Fallback)
    const proceduralMurtiGroup = new THREE.Group();
    idolGroup.add(proceduralMurtiGroup);

    // Custom 3D Model GLTF Loader for Lord Ganesh.glb
    const gltfLoader = new GLTFLoader();
    const modelPath = '/assets/idols/Lord Ganesh.glb';

    gltfLoader.load(
      modelPath,
      (gltf) => {
        // Hide procedural fallback when custom Lord Ganesh.glb model loads
        proceduralMurtiGroup.visible = false;
        const customModel = gltf.scene;

        // Auto-center and normalize model scale using bounding box
        const box = new THREE.Box3().setFromObject(customModel);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        // Center model origin
        customModel.position.x += customModel.position.x - center.x;
        customModel.position.y += customModel.position.y - center.y - 0.2;
        customModel.position.z += customModel.position.z - center.z;

        // Fit height into viewport (~2.8 units)
        const maxDim = Math.max(size.x, size.y, size.z);
        if (maxDim > 0) {
          const desiredScale = 2.8 / maxDim;
          customModel.scale.set(desiredScale, desiredScale, desiredScale);
        }

        customModel.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              child.material.envMapIntensity = 1.5;
            }
          }
        });

        idolGroup.add(customModel);
      },
      undefined,
      (err) => {
        console.warn('Fallback to procedural murti as model load error:', err);
      }
    );

    // 1. Ornate Multi-tiered Base / Pedestal (Lotus Peetham)
    const baseGeo = new THREE.CylinderGeometry(1.6, 1.9, 0.35, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x7a1620,
      metalness: 0.6,
      roughness: 0.3,
    });
    const pedestal = new THREE.Mesh(baseGeo, baseMat);
    pedestal.position.y = -1.1;
    pedestal.receiveShadow = true;
    proceduralMurtiGroup.add(pedestal);

    const ringGeo = new THREE.TorusGeometry(1.7, 0.06, 16, 64);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf4c542,
      metalness: 0.9,
      roughness: 0.2,
    });
    const goldRing = new THREE.Mesh(ringGeo, goldMat);
    goldRing.rotation.x = Math.PI / 2;
    goldRing.position.y = -0.92;
    proceduralMurtiGroup.add(goldRing);

    // 2. Sculpted Ganesha Form (Metallic Gold Murti)
    // Main Body / Abdomen (Modak shape / Pot belly)
    const bodyGeo = new THREE.SphereGeometry(0.85, 32, 32);
    bodyGeo.scale(1, 1.15, 0.95);
    const bodyMesh = new THREE.Mesh(bodyGeo, goldMat);
    bodyMesh.position.set(0, -0.15, 0);
    bodyMesh.castShadow = true;
    proceduralMurtiGroup.add(bodyMesh);

    // Crown / Mukut
    const mukutGeo = new THREE.ConeGeometry(0.55, 1.1, 16);
    const mukutMesh = new THREE.Mesh(mukutGeo, goldMat);
    mukutMesh.position.set(0, 1.45, 0);
    mukutMesh.castShadow = true;
    proceduralMurtiGroup.add(mukutMesh);

    // Head / Elephant Trunk
    const headGeo = new THREE.SphereGeometry(0.5, 24, 24);
    const headMesh = new THREE.Mesh(headGeo, goldMat);
    headMesh.position.set(0, 0.75, 0.1);
    headMesh.castShadow = true;
    proceduralMurtiGroup.add(headMesh);

    // Trunk Curve (Torus Curve)
    const trunkGeo = new THREE.TorusGeometry(0.35, 0.12, 16, 32, Math.PI * 1.2);
    const trunkMesh = new THREE.Mesh(trunkGeo, goldMat);
    trunkMesh.rotation.z = -Math.PI / 3;
    trunkMesh.rotation.y = Math.PI / 6;
    trunkMesh.position.set(-0.15, 0.45, 0.45);
    proceduralMurtiGroup.add(trunkMesh);

    // Ears (Left & Right)
    const earGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.05, 24);
    const leftEar = new THREE.Mesh(earGeo, goldMat);
    leftEar.rotation.z = Math.PI / 2;
    leftEar.rotation.y = -Math.PI / 6;
    leftEar.position.set(-0.65, 0.8, 0);
    proceduralMurtiGroup.add(leftEar);

    const rightEar = leftEar.clone();
    rightEar.rotation.y = Math.PI / 6;
    rightEar.position.set(0.65, 0.8, 0);
    proceduralMurtiGroup.add(rightEar);

    // Divine Prabhavali / Halo Arch behind head
    const haloGeo = new THREE.TorusGeometry(1.2, 0.08, 16, 64);
    const haloMat = new THREE.MeshStandardMaterial({
      color: 0xffd87a,
      metalness: 0.95,
      roughness: 0.1,
      emissive: 0xd4af37,
      emissiveIntensity: 0.4,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.position.set(0, 0.7, -0.4);
    proceduralMurtiGroup.add(haloMesh);

    // 4. Floating Gold Dust & Spark Particles
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      scales[i] = Math.random() * 0.05 + 0.02;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0xf4c542,
      size: 0.08,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffeedd, 0.6);
    scene.add(ambientLight);

    const goldSpotlight = new THREE.SpotLight(0xf4c542, 4);
    goldSpotlight.position.set(3, 5, 4);
    goldSpotlight.angle = Math.PI / 4;
    goldSpotlight.penumbra = 0.8;
    goldSpotlight.castShadow = true;
    scene.add(goldSpotlight);

    const redBacklight = new THREE.PointLight(0x9c1f2e, 3, 10);
    redBacklight.position.set(-3, 1, -2);
    scene.add(redBacklight);

    const divineGlow = new THREE.PointLight(0xffd87a, 2.5, 6);
    divineGlow.position.set(0, 0.8, 1);
    scene.add(divineGlow);

    // Mouse Drag / Orbit Interaction State
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      idolGroup.rotation.y += deltaX * 0.008;
      idolGroup.rotation.x += deltaY * 0.004;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Touch Support for Mobile
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;

      idolGroup.rotation.y += deltaX * 0.008;
      idolGroup.rotation.x += deltaY * 0.004;

      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    domElem.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Gentle auto-rotation when not dragging
      if (!isDragging) {
        idolGroup.rotation.y += 0.006;
      }

      // Particle floating loop
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < particleCount; i++) {
        let y = posAttr.getY(i);
        y += 0.006;
        if (y > 4) y = -3;
        posAttr.setY(i, y);
      }
      posAttr.needsUpdate = true;

      // Subtle pulse light
      divineGlow.intensity = 2.2 + Math.sin(elapsedTime * 3) * 0.5;

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!currentMount) return;
      const newW = currentMount.clientWidth;
      const newH = currentMount.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElem.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      if (currentMount.contains(renderer.domElement)) {
        currentMount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <section className="relative min-h-screen bg-[#0D0705] text-[#F7EFE1] overflow-hidden flex flex-col justify-between  pb-12">
      {/* Background Decorative Gradient Light Rays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#7A1620]/30 via-[#0D0705]/90 to-[#0D0705] z-0 pointer-events-none" />

      {/* Diya Ring Ignition Visual (First Visit Sequence) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
        
      </div>

      {/* 3D Canvas Mounting Area */}
      <div className="relative z-10 w-full h-[520px] sm:h-[600px] flex items-center justify-center">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      </div>

      {/* Hero Content Overlay */}
      <div className="relative z-20 max-w-5xl mx-auto px-4 text-center space-y-6 -mt-8">
        {/* Presenter / Association Banner */}
        <div className="inline-flex items-center gap-2 bg-[#160B08]/90 border border-[#D4AF37]/40 px-4 py-1.5 rounded-full shadow-lg">
          <Sparkles className="w-4 h-4 text-[#F4C542] animate-pulse" />
          <span className="text-xs font-extrabold text-[#F4C542] uppercase tracking-wider">
            MITRA UK · ELE Entertainments · Biryanis and more!
          </span>
        </div>

        {/* Main Title */}
        <div className="space-y-2">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-decorative tracking-wider leading-tight gold-foil-text drop-shadow-[0_4px_25px_rgba(212,175,55,0.3)]">
            THE BIGGEST MAHA GANAPATHI
          </h1>
          <h2 className="text-xl sm:text-3xl font-bold font-cinzel text-[#F7EFE1] tracking-widest uppercase">
            LONDON GANESH MAHOTSAV 2026
          </h2>
        </div>

        {/* Teaser Narrative Caption */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#C9B79C] leading-relaxed font-medium">
          A single-page devotional reveal experience — step inside the sanctum as we countdown to the iconic 6ft Maha Ganapathi arrival in Slough, Langley.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href="https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd"
            target="_blank"
            rel="noopener noreferrer"
            className="gold-button px-7 py-3.5 rounded-full text-sm flex items-center gap-2.5 shadow-xl hover:scale-105 transition-all"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>Join Official WhatsApp Group</span>
          </a>

          <button
            onClick={onNotifyClick}
            className="maroon-button px-7 py-3.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-xl hover:scale-105 transition-all"
          >
            <Bell className="w-4 h-4 text-[#F4C542]" />
            <span>Notify Me for Live Reveal</span>
          </button>
        </div>

        {/* Scroll Cue Bell */}
        <div className="pt-6 flex justify-center">
          <a
            href="#ritual-clock"
            className="inline-flex flex-col items-center gap-2 text-[#D4AF37] hover:text-[#F4C542] transition-colors group"
          >
            <span className="text-[11px] font-bold uppercase tracking-widest">Scroll to Enter Sanctum</span>
            <div className="w-10 h-10 rounded-full border border-[#D4AF37]/40 flex items-center justify-center group-hover:scale-110 group-hover:border-[#F4C542] transition-all bg-[#160B08]/80">
              <span className="text-lg animate-bounce">🔔</span>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
