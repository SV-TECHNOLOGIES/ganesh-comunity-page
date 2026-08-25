'use client';

import { useState } from 'react';
import { Bell, X, CheckCircle, Sparkles } from 'lucide-react';

interface NotifyMeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotifyMeModal({ isOpen, onClose }: NotifyMeModalProps) {
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="temple-card max-w-md w-full p-8 rounded-3xl border-2 border-[#D4AF37] relative space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#C9B79C] hover:text-[#F4C542] transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#7A1620] border border-[#D4AF37] mx-auto flex items-center justify-center text-[#F4C542] shadow-[0_0_15px_rgba(212,175,55,0.4)]">
            <Bell className="w-6 h-6 animate-bounce" />
          </div>

          <h3 className="text-2xl font-black font-cinzel gold-foil-text">GET REVEAL NOTIFICATIONS</h3>
          <p className="text-xs text-[#C9B79C]">
            Be first to know when the live darshan stream & detailed Slough schedule launch on 14 September 2026.
          </p>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-3">
            <CheckCircle className="w-12 h-12 text-[#F4C542] mx-auto animate-bounce" />
            <p className="text-sm font-bold text-[#F7EFE1]">
              You’re on the list! Devotional alerts will be sent directly to your email/phone.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#C9B79C] font-semibold mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Your name"
                className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#C9B79C] font-semibold mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[#C9B79C] font-semibold mb-1">Mobile / WhatsApp (Optional)</label>
              <input
                type="tel"
                placeholder="+44 7000 000000"
                className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="gold-button w-full py-3.5 rounded-xl font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#0D0705]" />
              <span>Subscribe for Live Reveal Alerts</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
