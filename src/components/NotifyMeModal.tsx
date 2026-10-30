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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-hidden">
      <div className="temple-card max-w-md w-full rounded-3xl border-2 border-[#E65C00]/40 relative max-h-[90vh] flex flex-col overflow-hidden bg-[#FFF8F0] animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#6B3A2A] hover:text-[#E65C00] p-1.5 rounded-full hover:bg-[#FFF0E0] transition-colors z-30"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Pinned Header */}
        <div className="p-6 pb-3 text-center space-y-2 border-b border-[#E65C00]/20 shrink-0 bg-[#FFF8F0]">
          <div className="w-12 h-12 rounded-full bg-[#FFF0E0] border border-[#E65C00]/40 mx-auto flex items-center justify-center text-[#E65C00] shadow-[0_0_15px_rgba(230,92,0,0.15)]">
            <Bell className="w-6 h-6 animate-bounce" />
          </div>

          <h3 className="text-xl sm:text-2xl font-black font-cinzel gold-foil-text">GET REVEAL NOTIFICATIONS</h3>
          <p className="text-xs text-[#6B3A2A]">
            Be first to know when the live darshan stream &amp; detailed Slough schedule launch on 14 September 2026.
          </p>
        </div>

        {submitted ? (
          <div className="text-center p-6 sm:p-8 py-8 space-y-3 flex-1 overflow-y-auto">
            <CheckCircle className="w-12 h-12 text-[#E65C00] mx-auto animate-bounce" />
            <p className="text-sm font-bold text-[#3D1A00]">
              You’re on the list! Devotional alerts will be sent directly to your email/phone.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            {/* Scrollable Form Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              <div>
                <label className="block text-[#6B3A2A] font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                />
              </div>
              <div>
                <label className="block text-[#6B3A2A] font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                />
              </div>
              <div>
                <label className="block text-[#6B3A2A] font-semibold mb-1">Mobile / WhatsApp (Optional)</label>
                <input
                  type="tel"
                  placeholder="+44 7000 000000"
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                />
              </div>
            </div>

            {/* Pinned Footer */}
            <div className="p-4 sm:p-5 border-t border-[#E65C00]/15 shrink-0 bg-[#FFF8F0]">
              <button
                type="submit"
                className="gold-button w-full py-3.5 rounded-xl font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>Subscribe for Live Reveal Alerts</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
