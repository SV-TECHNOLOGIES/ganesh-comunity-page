'use client';

import { SPONSORS_DATA } from '@/data/sponsors';

export default function SponsorRibbonBand() {
  return (
    <section className="py-16 bg-gradient-to-r from-[#FFF3E0] via-[#FFF8F0] to-[#FFF3E0] border-t-2 border-[#E65C00]/30 text-[#3D1A00] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="mb-8 text-center space-y-2">
          <span className="inline-block bg-[#E65C00]/10 border border-[#E65C00]/30 text-[#CC4000] px-4 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-[0.3em]">
            Our Sponsors &amp; Partners
          </span>
          <h3 className="text-xl sm:text-2xl font-black font-cinzel text-[#3D1A00] tracking-wide">
            POWERING MITRA &amp; LONDON GANESH MAHOTSAV 2026
          </h3>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {SPONSORS_DATA.map((sponsor) => {
            const isPdf = sponsor.logoUrl.toLowerCase().endsWith('.pdf');
            const logoFrameClass = sponsor.blackLogoBg ? 'bg-black' : 'bg-white';

            return (
              <div
                key={sponsor.id || sponsor.name}
                style={{ background: sponsor.gradient || 'linear-gradient(135deg, #E65C00 0%, #FF7A00 100%)' }}
                className="border border-white/20 hover:border-white/40 px-4 py-3.5 rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center gap-4 min-h-[92px]"
              >
                <div className={`w-20 h-20 rounded-full shadow-md overflow-hidden flex items-center justify-center shrink-0 p-1.5 ${logoFrameClass}`}>
                  {isPdf ? (
                    <div className="w-full h-full rounded-full bg-[#F8FAFC] text-[#0F172A] font-black tracking-[0.18em] uppercase text-[9px] flex items-center justify-center text-center px-2 leading-tight">
                      {sponsor.name}
                    </div>
                  ) : (
                    <img
                      src={sponsor.logoUrl}
                      alt={sponsor.name}
                      className="w-full h-full object-contain rounded-full"
                    />
                  )}
                </div>
                <div className="min-w-0 pr-2">
                  <span className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-white/90 block mb-0.5 drop-shadow-sm">
                    {sponsor.tier}
                  </span>
                  <span className="text-sm font-black font-cinzel text-white tracking-wider block truncate drop-shadow-md">
                    {sponsor.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

