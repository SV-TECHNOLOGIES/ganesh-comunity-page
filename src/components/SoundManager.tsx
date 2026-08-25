'use client';

import { useState, useRef } from 'react';
import { Volume2, VolumeX, Bell } from 'lucide-react';

export default function SoundManager() {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playTempleBell = (freq = 440, duration = 2.5) => {
    if (!soundEnabled || !audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Metallic overtone setup
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.98, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context fallback safeguard
    }
  };

  const toggleSound = () => {
    if (!soundEnabled) {
      initAudio();
      setSoundEnabled(true);
      setTimeout(() => playTempleBell(523.25, 3), 100);
    } else {
      setSoundEnabled(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        onClick={toggleSound}
        className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full shadow-2xl border transition-all duration-300 backdrop-blur-md ${
          soundEnabled
            ? 'bg-[#7A1620]/90 text-[#F4C542] border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.4)]'
            : 'bg-[#160B08]/90 text-[#C9B79C] border-[#D4AF37]/30 hover:border-[#D4AF37]'
        }`}
        title={soundEnabled ? 'Mute Devotional Sound' : 'Enable Temple Sound'}
      >
        {soundEnabled ? (
          <>
            <Bell className="w-4 h-4 text-[#F4C542] animate-bounce" />
            <span className="text-xs font-extrabold uppercase tracking-wider">Sound ON</span>
            <Volume2 className="w-4 h-4 text-[#F4C542]" />
          </>
        ) : (
          <>
            <VolumeX className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">🔔 Enable Sound</span>
          </>
        )}
      </button>
    </div>
  );
}
