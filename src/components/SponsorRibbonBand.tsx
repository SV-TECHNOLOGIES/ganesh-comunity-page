'use client';

import { Award, Sparkles } from 'lucide-react';

export default function SponsorRibbonBand() {
  return (
    <section className="py-16 bg-gradient-to-r from-[#0D0705] via-[#160B08] to-[#0D0705] border-t-2 border-[#D4AF37]/50 text-[#F7EFE1] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        
        {/* Poster Bottom Band Layout */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 text-center lg:text-left">
          
          {/* Left Ribbon: Brought To You By */}
          <div className="flex-1 w-full flex justify-center lg:justify-start">
            <div className="bg-gradient-to-r from-[#7A1620] to-[#9C1F2E] border border-[#D4AF37]/60 px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-4 max-w-sm group hover:scale-105 transition-transform">
              <div className="w-10 h-10 rounded-full bg-[#F4C542] text-[#0D0705] flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                B&M
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FFD87A] block">
                  PRESENTED BY
                </span>
                <span className="text-sm font-black font-cinzel text-[#F7EFE1] tracking-wider block">
                  Biryanis and more!
                </span>
              </div>
            </div>
          </div>

          {/* Center Emblem Seal */}
          <div className="shrink-0 flex flex-col items-center justify-center space-y-2">
            <div className="w-20 h-20 rounded-full border-2 border-[#D4AF37] p-1 shadow-[0_0_30px_rgba(212,175,55,0.4)] bg-[#160B08] flex items-center justify-center relative overflow-hidden">
              <img
                src="/assets/poster.jpg"
                alt="MITRA UK Emblem"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <span className="text-xs font-black font-cinzel text-[#F4C542] tracking-widest uppercase">
              MITRA UK
            </span>
            <span className="text-[10px] text-[#C9B79C] tracking-tight">
              Mana Indian Telugu Roots Abroad
            </span>
          </div>

          {/* Right Ribbon: In Association With */}
          <div className="flex-1 w-full flex justify-center lg:justify-end">
            <div className="bg-gradient-to-r from-[#9C1F2E] to-[#7A1620] border border-[#D4AF37]/60 px-6 py-3.5 rounded-2xl shadow-xl flex items-center gap-4 max-w-sm group hover:scale-105 transition-transform">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37] text-[#0D0705] flex items-center justify-center font-black text-xs shrink-0 shadow-md">
                ELE
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FFD87A] block">
                  IN ASSOCIATION WITH
                </span>
                <span className="text-sm font-black font-cinzel text-[#F7EFE1] tracking-wider block">
                  ELE Entertainments
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Subtext Line */}
        <div className="mt-12 text-center pt-6 border-t border-[#D4AF37]/20 text-xs text-[#C9B79C]">
          <span>Official Event Platform Partner: </span>
          <span className="font-extrabold text-[#F4C542] font-cinzel">UK Telugu Association (MITRA)</span>
          <span> · Langley, Slough 2026</span>
        </div>
      </div>
    </section>
  );
}
