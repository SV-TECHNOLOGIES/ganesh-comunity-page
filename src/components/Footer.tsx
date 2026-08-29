'use client';

import Link from 'next/link';
import { MessageCircle, Heart, Instagram, Facebook, Youtube, Mail, MapPin, Phone, Sparkles } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site-config';

export default function Footer() {
  return (
    <footer className="bg-[#3D1A00] text-[#FFF8F0] border-t-2 border-[#E65C00]/40 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 space-y-12">
        
        {/* Top Highlight Banner */}
        <div className="bg-gradient-to-r from-[#4A2200] via-[#5A2A00] to-[#4A2200] border-2 border-[#E65C00]/40 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="font-script text-4xl sm:text-5xl text-[#FF9A3C] block tracking-wide">
              Coming Soon...
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-cinzel text-[#FFF8F0] tracking-wider uppercase">
              LONDON'S LARGEST MAHA GANAPATHI MAHOTSAV 2026
            </h3>
            <p className="text-xs text-[#FFD4A0] max-w-xl">
              13th – 19th September 2026 · E Block, SLOUGH &amp; LANGLEY COLLEGE, Langley Road, SL3 8GW. Join thousands of devotees celebrating culture, unity, and tradition.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <a
              href="https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd"
              target="_blank"
              rel="noopener noreferrer"
              className="gold-button px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-transform"
            >
              <img src="/assets/whatsapp.png" alt="WhatsApp" className="w-5 h-5 object-contain" />
              <span>Join WhatsApp Group</span>
            </a>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 text-xs ">
          
          {/* Column 1: Organizers Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border border-[#E65C00]/60 overflow-hidden shrink-0 bg-white p-0.5 flex items-center justify-center">
                <img
                  src="/assets/favicon.ico"
                  alt="MITRA UK Logo"
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <span className="font-black text-lg font-cinzel text-[#FF9A3C] tracking-wider">
                MITRA UK
              </span>
            </div>
            <p className="text-[#FFD4A0] leading-relaxed">
              Mana Indian Telugu Roots Abroad (MITRA UK) hosting the biggest Maha Ganapathi Mahotsav in UK.
            </p>
            <div className="flex items-center space-x-3 text-[#FF9A3C]">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-[#E65C00]/30 hover:border-[#FF9A3C] hover:bg-[#E65C00]/20 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-[#E65C00]/30 hover:border-[#FF9A3C] hover:bg-[#E65C00]/20 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-[#E65C00]/30 hover:border-[#FF9A3C] hover:bg-[#E65C00]/20 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          

          {/* Column 3: Community Services */}
          <div className="space-y-3">
            <h4 className="font-black font-cinzel text-sm text-[#FF9A3C] uppercase tracking-wider">
              Get Involved
            </h4>
            <ul className="space-y-2 text-[#FFD4A0]">
              <li><a href="https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF9A3C] transition-colors">Official WhatsApp Community</a></li>
              {SITE_CONFIG.ENABLE_VOLUNTEER && (
                <li><Link href="/membership" className="hover:text-[#FF9A3C] transition-colors">Volunteer Seva Registration</Link></li>
              )}
              <li><Link href="/sponsors" className="hover:text-[#FF9A3C] transition-colors">Sponsorship & Offerings</Link></li>
              <li><Link href="/charity" className="hover:text-[#FF9A3C] transition-colors">Student & Community Welfare</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Venue */}
          <div className="space-y-3">
            <h4 className="font-black font-cinzel text-sm text-[#FF9A3C] uppercase tracking-wider">
              Contact Us
            </h4>
            <div className="space-y-2 text-[#FFD4A0]">
              
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#FF9A3C] shrink-0" />
                <span>contactus@mitrauk.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#FF9A3C] shrink-0" />
                <span>+447404530041</span>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright Bar */}
        <div className="pt-8 border-t border-[#E65C00]/20 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#FFD4A0] gap-4">
          <p>© 2026 MITRA UK &amp; Mana Indian Telugu Roots Abroad (MITRA). All Rights Reserved.</p>
        </div>

      </div>
    </footer>
  );
}
