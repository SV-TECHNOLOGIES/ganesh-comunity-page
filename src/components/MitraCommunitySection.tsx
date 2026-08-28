'use client';

import { Users, Heart, Award, ShieldCheck, Globe, GraduationCap, Building2, Sparkles, PhoneCall, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function MitraCommunitySection() {
  return (
    <section className="py-20 bg-gradient-to-b from-[#FFF8F0] via-[#FFF3E0] to-[#FFF8F0] text-[#3D1A00] relative overflow-hidden border-t border-b border-[#E65C00]/20">
      
      {/* Warm saffron radial glow watermark */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#E65C00]/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#FFF0E0] text-[#E65C00] border border-[#E65C00]/30 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm">
            <Sparkles className="w-4 h-4 text-[#E65C00] animate-pulse" />
            <span>MANA INDIAN TELUGU ROOTS ABROAD</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black font-cinzel gold-foil-text leading-tight">
            ABOUT MITRA UK COMMUNITY
          </h2>

          <p className="text-xs sm:text-sm text-[#6B3A2A] leading-relaxed">
            <strong className="text-[#3D1A00]">MITRA UK</strong> (Mana Indian Telugu Roots Abroad) is the unified apex community platform serving thousands of Telugu families, students, professionals, and artists across the United Kingdom. We bridge cultural heritage with welfare empowerment.
          </p>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Pillar 1 */}
          <div className="temple-card p-6 rounded-3xl border border-[#E65C00]/25 space-y-4 hover:border-[#E65C00]/70 transition-all group hover:shadow-[0_12px_40px_rgba(230,92,0,0.15)] hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF0E0] text-[#E65C00] border border-[#E65C00]/30 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-[#E65C00] group-hover:text-white transition-all">
              <Globe className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black font-cinzel text-[#3D1A00] group-hover:text-[#E65C00] transition-colors">
              Cultural Heritage
            </h3>
            <p className="text-xs text-[#6B3A2A] leading-relaxed">
              Organizing grand annual celebrations including Ugadi Fest, London's largest Maha Ganapathi Mahotsav in Slough, Bathukamma, and classical Kuchipudi dance academies.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="temple-card p-6 rounded-3xl border border-[#E65C00]/25 space-y-4 hover:border-[#E65C00]/70 transition-all group hover:shadow-[0_12px_40px_rgba(230,92,0,0.15)] hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF0E0] text-[#E65C00] border border-[#E65C00]/30 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-[#E65C00] group-hover:text-white transition-all">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black font-cinzel text-[#3D1A00] group-hover:text-[#E65C00] transition-colors">
              Student Welfare
            </h3>
            <p className="text-xs text-[#6B3A2A] leading-relaxed">
              Dedicated student helpline offering housing orientation, academic guidance, part-time work compliance, and emergency assistance for international Telugu students in the UK.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="temple-card p-6 rounded-3xl border border-[#E65C00]/25 space-y-4 hover:border-[#E65C00]/70 transition-all group hover:shadow-[0_12px_40px_rgba(230,92,0,0.15)] hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF0E0] text-[#E65C00] border border-[#E65C00]/30 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-[#E65C00] group-hover:text-white transition-all">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black font-cinzel text-[#3D1A00] group-hover:text-[#E65C00] transition-colors">
              Family &amp; Senior Care
            </h3>
            <p className="text-xs text-[#6B3A2A] leading-relaxed">
              Healthcare orientation for NHS access, Nari Shakthi women empowerment forums, senior citizen well-being meets, and consular repatriation support during bereavement.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="temple-card p-6 rounded-3xl border border-[#E65C00]/25 space-y-4 hover:border-[#E65C00]/70 transition-all group hover:shadow-[0_12px_40px_rgba(230,92,0,0.15)] hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF0E0] text-[#E65C00] border border-[#E65C00]/30 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-[#E65C00] group-hover:text-white transition-all">
              <Building2 className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-black font-cinzel text-[#3D1A00] group-hover:text-[#E65C00] transition-colors">
              Business Network
            </h3>
            <p className="text-xs text-[#6B3A2A] leading-relaxed">
              Connecting British-Telugu entrepreneurs, IT architects, NHS consultants, and venture founders across London, Slough, Midlands, and Scotland.
            </p>
          </div>

        </div>

        {/* Highlight Banner & CTA */}
        <div className="rounded-3xl p-8 border-2 border-[#E65C00]/30 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-[#FFF0E0] via-[#FFFAF5] to-[#FFF0E0] shadow-[0_4px_30px_rgba(230,92,0,0.1)]">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-black font-cinzel text-[#E65C00] uppercase tracking-widest block">
              JOIN THE MITRA UK FAMILY
            </span>
            <h3 className="text-2xl font-black font-cinzel text-[#3D1A00]">
              Preserving Telugu Roots &amp; Empowering Communities Across the UK
            </h3>
            <p className="text-xs text-[#6B3A2A] max-w-2xl">
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
              className="px-6 py-3.5 rounded-full border-2 border-[#E65C00] text-[#E65C00] hover:bg-[#E65C00] hover:text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
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
