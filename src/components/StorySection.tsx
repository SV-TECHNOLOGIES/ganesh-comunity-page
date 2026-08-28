'use client';

import { Sparkles, ScrollText, Heart } from 'lucide-react';

export default function StorySection() {
  return (
    <section className="relative py-24 bg-[#FFF8F0] text-[#3D1A00] overflow-hidden border-b border-[#E65C00]/25">
      {/* Parallax / Blend Background: Big Ben & Temple Silhouette Composite from assets */}
      <div className="absolute inset-0 z-0 opacity-10 bg-[url('/assets/poster.jpg')] bg-cover bg-center filter contrast-125" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#FFF8F0] via-[#FFF8F0]/85 to-[#FFF8F0] z-0" />

      <div className="max-w-4xl mx-auto px-4 relative z-10 text-center space-y-8">
        <div className="inline-flex items-center gap-2 bg-[#FFF0E0] border border-[#E65C00]/30 px-4 py-1 rounded-full text-xs font-extrabold text-[#E65C00] uppercase tracking-widest shadow-sm">
          <ScrollText className="w-4 h-4" />
          <span>THE DEVOTIONAL JOURNEY</span>
        </div>

        <blockquote className="text-2xl sm:text-4xl font-bold font-cinzel gold-foil-text leading-relaxed tracking-wide italic">
          “From Lalbaugcha Raja in Mumbai to Khairatabad Ganesh in Hyderabad… now London's own iconic Ganesha arrives in Slough.”
        </blockquote>

        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#E65C00] to-transparent mx-auto" />

        <p className="text-xs sm:text-base text-[#6B3A2A] leading-relaxed max-w-2xl mx-auto font-medium">
          Organized by MITRA UK in association with ELE Entertainments and presented by Biryanis and more!, the Maha Ganapathi Mahotsav represents a historic cultural milestone for the UK diaspora. Step into the sanctum, offer your prayers, and experience the divine presence of Bappa in Great Britain.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-xs">
          <div className="temple-card bg-white p-5 rounded-2xl border border-[#E65C00]/20 space-y-1 shadow-sm">
            <span className="text-2xl font-black font-cinzel text-[#E65C00] block">5,000+</span>
            <span className="text-[#6B3A2A] uppercase font-bold tracking-wider">Expected Devotees</span>
          </div>

          <div className="temple-card bg-white p-5 rounded-2xl border border-[#E65C00]/20 space-y-1 shadow-sm">
            <span className="text-2xl font-black font-cinzel text-[#E65C00] block">100%</span>
            <span className="text-[#6B3A2A] uppercase font-bold tracking-wider">Eco-Friendly Clay Murti</span>
          </div>

          <div className="temple-card bg-white p-5 rounded-2xl border border-[#E65C00]/20 space-y-1 shadow-sm">
            <span className="text-2xl font-black font-cinzel text-[#E65C00] block">Grand Aarti</span>
            <span className="text-[#6B3A2A] uppercase font-bold tracking-wider">Daily Mahaprasadam</span>
          </div>
        </div>
      </div>
    </section>
  );
}
