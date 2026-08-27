'use client';

import { Users, Heart, Award, ShieldCheck, Globe, GraduationCap, Building2, Sparkles, PhoneCall, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function MitraCommunitySection() {
  return (
    <section className="py-20 bg-gradient-to-b from-[#0D0705] via-[#160B08] to-[#0D0705] text-[#F7EFE1] relative overflow-hidden border-t-2 border-b-2 border-[#D4AF37]/30">
      
      {/* Background Mandala Lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#7A1620]/25 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#7A1620] text-[#F4C542] border border-[#D4AF37]/40 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">
            <Sparkles className="w-4 h-4 text-[#F4C542] animate-pulse" />
            <span>MANA INDIAN TELUGU ROOTS ABROAD</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black font-cinzel gold-foil-text leading-tight">
            ABOUT MITRA UK COMMUNITY
          </h2>

          <p className="text-xs sm:text-sm text-[#C9B79C] leading-relaxed">
            <strong className="text-[#F7EFE1]">MITRA UK</strong> (Mana Indian Telugu Roots Abroad) is the unified apex community platform serving thousands of Telugu families, students, professionals, and artists across the United Kingdom. We bridge cultural heritage with welfare empowerment.
          </p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Pillar 1 */}
          <div className="temple-card p-6 rounded-3xl border border-[#D4AF37]/40 space-y-4 hover:border-[#F4C542] transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-[#7A1620] text-[#F4C542] border border-[#D4AF37]/40 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Globe className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black font-cinzel text-[#F7EFE1] group-hover:text-[#F4C542] transition-colors">
              Cultural Heritage
            </h3>
            <p className="text-xs text-[#C9B79C] leading-relaxed">
              Organizing grand annual celebrations including Ugadi Fest, London’s largest Maha Ganapathi Mahotsav in Slough, Bathukamma, and classical Kuchipudi dance academies.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="temple-card p-6 rounded-3xl border border-[#D4AF37]/40 space-y-4 hover:border-[#F4C542] transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-[#7A1620] text-[#F4C542] border border-[#D4AF37]/40 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black font-cinzel text-[#F7EFE1] group-hover:text-[#F4C542] transition-colors">
              Student Welfare
            </h3>
            <p className="text-xs text-[#C9B79C] leading-relaxed">
              Dedicated student helpline offering housing orientation, academic guidance, part-time work compliance, and emergency assistance for international Telugu students in the UK.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="temple-card p-6 rounded-3xl border border-[#D4AF37]/40 space-y-4 hover:border-[#F4C542] transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-[#7A1620] text-[#F4C542] border border-[#D4AF37]/40 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black font-cinzel text-[#F7EFE1] group-hover:text-[#F4C542] transition-colors">
              Family & Senior Care
            </h3>
            <p className="text-xs text-[#C9B79C] leading-relaxed">
              Healthcare orientation for NHS access, Nari Shakthi women empowerment forums, senior citizen well-being meets, and consular repatriation support during bereavement.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="temple-card p-6 rounded-3xl border border-[#D4AF37]/40 space-y-4 hover:border-[#F4C542] transition-all group">
            <div className="w-14 h-14 rounded-2xl bg-[#7A1620] text-[#F4C542] border border-[#D4AF37]/40 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black font-cinzel text-[#F7EFE1] group-hover:text-[#F4C542] transition-colors">
              Business Network
            </h3>
            <p className="text-xs text-[#C9B79C] leading-relaxed">
              Connecting British-Telugu entrepreneurs, IT architects, NHS consultants, and venture founders across London, Slough, Midlands, and Scotland.
            </p>
          </div>

        </div>

        {/* Highlight Banner & CTA */}
        <div className="temple-card rounded-3xl p-8 border-2 border-[#D4AF37]/50 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-[#160B08] via-[#240F13] to-[#160B08]">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-black font-cinzel text-[#F4C542] uppercase tracking-widest block">
              JOIN THE MITRA UK FAMILY
            </span>
            <h3 className="text-2xl font-black font-cinzel text-[#F7EFE1]">
              Preserving Telugu Roots & Empowering Communities Across the UK
            </h3>
            <p className="text-xs text-[#C9B79C] max-w-2xl">
              Whether you are a student arriving in London, a family seeking cultural community, or an entrepreneur looking to network — MITRA UK welcomes you.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <a
              href="https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd"
              target="_blank"
              rel="noopener noreferrer"
              className="gold-button px-6 py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-transform"
            >
              <img src="/assets/whatsapp.png" alt="WhatsApp" className="w-4 h-4 object-contain" />
              <span>Join WhatsApp Group</span>
            </a>
            <Link
              href="/membership"
              className="px-6 py-3.5 rounded-full border border-[#D4AF37] text-[#F4C542] hover:bg-[#7A1620] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
            >
              <span>Explore Membership</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}
