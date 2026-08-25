'use client';

import { Sparkles, ScrollText, Heart } from 'lucide-react';

export default function StorySection() {
  return (
    <section className="relative py-24 bg-[#0D0705] text-[#F7EFE1] overflow-hidden border-b border-[#D4AF37]/30">
      {/* Parallax / Blend Background: Big Ben & Temple Silhouette Composite from assets */}
      <div className="absolute inset-0 z-0 opacity-25 bg-[url('/assets/poster.jpg')] bg-cover bg-center filter contrast-125" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D0705] via-[#0D0705]/85 to-[#0D0705] z-0" />

      <div className="max-w-4xl mx-auto px-4 relative z-10 text-center space-y-8">
        <div className="inline-flex items-center gap-2 bg-[#7A1620]/60 border border-[#D4AF37]/40 px-4 py-1 rounded-full text-xs font-extrabold text-[#F4C542] uppercase tracking-widest">
          <ScrollText className="w-4 h-4" />
          <span>THE DEVOTIONAL JOURNEY</span>
        </div>

        <blockquote className="text-2xl sm:text-4xl font-bold font-cinzel gold-foil-text leading-relaxed tracking-wide italic">
          “From Lalbaugcha Raja in Mumbai to Khairatabad Ganesh in Hyderabad… now London's own iconic Ganesha arrives in Slough.”
        </blockquote>

        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mx-auto" />

        <p className="text-xs sm:text-base text-[#C9B79C] leading-relaxed max-w-2xl mx-auto font-medium">
          Organized by MITRA UK in association with ELE Entertainments and presented by Biryanis and more!, the Maha Ganapathi Mahotsav represents a historic cultural milestone for the UK diaspora. Step into the sanctum, offer your prayers, and experience the divine presence of Bappa in Great Britain.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-xs">
          <div className="temple-card p-5 rounded-2xl border border-[#D4AF37]/30 space-y-1">
            <span className="text-2xl font-black font-cinzel text-[#F4C542] block">5,000+</span>
            <span className="text-[#C9B79C] uppercase font-bold tracking-wider">Expected Devotees</span>
          </div>

          <div className="temple-card p-5 rounded-2xl border border-[#D4AF37]/30 space-y-1">
            <span className="text-2xl font-black font-cinzel text-[#F4C542] block">100%</span>
            <span className="text-[#C9B79C] uppercase font-bold tracking-wider">Eco-Friendly Clay Murti</span>
          </div>

          <div className="temple-card p-5 rounded-2xl border border-[#D4AF37]/30 space-y-1">
            <span className="text-2xl font-black font-cinzel text-[#F4C542] block">Grand Aarti</span>
            <span className="text-[#C9B79C] uppercase font-bold tracking-wider">Daily Mahaprasadam</span>
          </div>
        </div>
      </div>
    </section>
  );
}
