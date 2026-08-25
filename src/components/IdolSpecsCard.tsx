'use client';

import { Award, Shield, Sparkles, HeartHandshake, Feather } from 'lucide-react';

export default function IdolSpecsCard() {
  return (
    <section className="py-20 bg-[#0D0705] text-[#F7EFE1] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 bg-[#7A1620]/60 border border-[#D4AF37]/40 px-4 py-1 rounded-full text-xs font-extrabold text-[#F4C542] uppercase tracking-widest">
            <Award className="w-4 h-4 text-[#F4C542]" />
            <span>IDOL SPECIFICATIONS & ARTISTRY</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black font-cinzel gold-foil-text tracking-wider">
            THE MAHA GANAPATHI MURTI
          </h2>

          <p className="max-w-xl mx-auto text-xs sm:text-sm text-[#C9B79C] leading-relaxed">
            Hand-sculpted by master artisans with traditional devotion, designed specifically for the historic Slough Mahotsav.
          </p>
        </div>

        {/* Central Ornate Medallion Plaque */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Specs List */}
          <div className="lg:col-span-4 space-y-6">
            <div className="temple-card p-6 rounded-2xl border border-[#D4AF37]/30 space-y-2">
              <div className="flex items-center gap-3 text-[#F4C542]">
                <Feather className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-wider font-cinzel">Artisan Craftsmanship</h3>
              </div>
              <p className="text-xs text-[#C9B79C] leading-relaxed">
                Sculpted from 100% eco-friendly natural clay, adorned with intricate gold-foil work and non-toxic natural dyes.
              </p>
            </div>

            <div className="temple-card p-6 rounded-2xl border border-[#D4AF37]/30 space-y-2">
              <div className="flex items-center gap-3 text-[#F4C542]">
                <Shield className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-wider font-cinzel">Eco-Conscious Visarjan</h3>
              </div>
              <p className="text-xs text-[#C9B79C] leading-relaxed">
                Designed for ceremonial eco-immersion, upholding pristine environmental standards across the UK.
              </p>
            </div>
          </div>

          {/* Central Medallion Plaque (Poster Style Badge) */}
          <div className="lg:col-span-4 flex justify-center">
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full border-4 border-[#D4AF37] p-3 shadow-[0_0_50px_rgba(212,175,55,0.3)] bg-gradient-to-br from-[#7A1620] via-[#160B08] to-[#0D0705] flex flex-col items-center justify-center text-center group hover:scale-105 transition-transform duration-500 overflow-hidden">
              <img src="/assets/poster.jpg" alt="Poster Overlay" className="absolute inset-0 w-full h-full object-cover opacity-20 filter contrast-125" />
              
              {/* Outer Decorative Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#F4C542]/60 animate-spin" style={{ animationDuration: '30s' }} />

              <div className="relative z-10 space-y-2 px-6">
                <span className="bg-[#D4AF37] text-[#0D0705] font-black text-[10px] uppercase px-3 py-1 rounded-full tracking-widest inline-block">
                  OFFICIAL SPECIFICATION
                </span>
                
                <div className="text-5xl sm:text-6xl font-black font-cinzel gold-foil-text tracking-tighter">
                  06 FT
                </div>

                <div className="text-xs sm:text-sm font-black font-cinzel text-[#F7EFE1] tracking-widest uppercase border-t border-b border-[#D4AF37]/40 py-1.5">
                  VISUALLY STUNNING BAPPA
                </div>

                <p className="text-[11px] text-[#C9B79C] font-semibold">
                  Maha Ganapathi Idol · Langley Slough 2026
                </p>
              </div>
            </div>
          </div>

          {/* Right Specs List */}
          <div className="lg:col-span-4 space-y-6">
            <div className="temple-card p-6 rounded-2xl border border-[#D4AF37]/30 space-y-2">
              <div className="flex items-center gap-3 text-[#F4C542]">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-wider font-cinzel">London Journey</h3>
              </div>
              <p className="text-xs text-[#C9B79C] leading-relaxed">
                Specially transported to London under the stewardship of MITRA UK & UKTA to unite the British Indian diaspora.
              </p>
            </div>

            <div className="temple-card p-6 rounded-2xl border border-[#D4AF37]/30 space-y-2">
              <div className="flex items-center gap-3 text-[#F4C542]">
                <HeartHandshake className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-wider font-cinzel">Public Darshan & Aarti</h3>
              </div>
              <p className="text-xs text-[#C9B79C] leading-relaxed">
                Open to all devotees with daily morning/evening Aartis, cultural offerings, and Mahaprasadam distribution.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
