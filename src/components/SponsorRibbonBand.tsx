'use client';

const sponsors = [
  { name: 'Biryanis', tag: 'Presented By', file: '/assets/sponsers/Biryanies.jpeg', accent: 'from-[#E65C00] to-[#FF7A00]' },
  { name: 'ELE Entertainments', tag: 'In Association With', file: '/assets/sponsers/ELE%20Enteratinments.jpeg', accent: 'from-[#9C1F2E] to-[#7A1620]' },
  { name: 'FT Light', tag: 'Partner', file: '/assets/sponsers/FT%20Light%20logo%20.png', accent: 'from-[#1A6F8D] to-[#0F4C6B]' },
  { name: 'Langley Telugu Association', tag: 'Community Partner', file: '/assets/sponsers/Langley%20Telugu%20Association.jpeg', accent: 'from-[#3F7A3A] to-[#2C5A2F]' },
  { name: 'United Core', tag: 'Partner', file: '/assets/sponsers/United%20Core.jpeg', accent: 'from-[#6A5B8D] to-[#4D446B]' },
  { name: 'Willow Pharmacy', tag: 'Partner', file: '/assets/sponsers/Willow%20Pharmacy.jpeg', accent: 'from-[#4B7A6E] to-[#335E54]' },
  { name: 'Wealthmax', tag: 'Partner', file: '/assets/sponsers/wealthmax%20logo%20High%20Resolution.%20(1).pdf', accent: 'from-[#B87F1B] to-[#8A6214]' },
];

export default function SponsorRibbonBand() {
  return (
    <section className="py-16 bg-gradient-to-r from-[#FFF3E0] via-[#FFF8F0] to-[#FFF3E0] border-t-2 border-[#E65C00]/30 text-[#3D1A00] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="mb-8 text-center">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-[#6B3A2A]">Our Sponsors</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {sponsors.map((sponsor) => {
            const isPdf = sponsor.file.toLowerCase().endsWith('.pdf');

            return (
              <div
                key={sponsor.name}
                className={`bg-gradient-to-r ${sponsor.accent} border border-[#CC4000]/40 px-4 py-3.5 rounded-2xl shadow-lg flex items-center gap-4 min-h-[90px]`}
              >
                <div className="w-20 h-20 rounded-full bg-white/95 shadow-md overflow-hidden flex items-center justify-center shrink-0 p-1">
                  {isPdf ? (
                    <div className="w-full h-full rounded-full bg-[#F8FAFC] text-[#0F172A] font-black tracking-[0.2em] uppercase text-[10px] flex items-center justify-center text-center px-2 leading-tight">
                      Wealthmax
                    </div>
                  ) : (
                    <img
                      src={sponsor.file}
                      alt={sponsor.name}
                      className="w-full h-full object-contain rounded-full"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-white/80 block">
                    {sponsor.tag}
                  </span>
                  <span className="text-sm font-black font-cinzel text-white tracking-wider block truncate">
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
