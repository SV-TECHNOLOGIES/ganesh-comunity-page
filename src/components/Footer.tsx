'use client';

import Link from 'next/link';
import { MessageCircle, Heart, Instagram, Facebook, Youtube, Mail, MapPin, Phone, Sparkles } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site-config';

export default function Footer() {
  return (
    <footer className="bg-[#0D0705] text-[#F7EFE1] border-t-2 border-[#D4AF37]/40 relative overflow-hidden">
      {/* Devotional Dark Pattern Overlay */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10 space-y-12">
        
        {/* Top Highlight Banner: "Coming Soon" Script & WhatsApp Prompt */}
        <div className="temple-card rounded-3xl p-8 border-2 border-[#D4AF37]/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <span className="font-script text-4xl sm:text-5xl text-[#F4C542] block tracking-wide">
              Coming Soon...
            </span>
            <h3 className="text-xl sm:text-2xl font-black font-cinzel text-[#F7EFE1] tracking-wider uppercase">
              LONDON’S LARGEST MAHA GANAPATHI MAHOTSAV 2026
            </h3>
            <p className="text-xs text-[#C9B79C] max-w-xl">
              14th September 2026 · Langley, Slough. Join thousands of devotees celebrating culture, unity, and tradition.
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-xs">
          
          {/* Column 1: Organizers Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border border-[#D4AF37] overflow-hidden shrink-0">
                <img
                  src="/assets/poster.jpg"
                  alt="MITRA UK Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="font-black text-lg font-cinzel text-[#F4C542] tracking-wider">
                MITRA UK
              </span>
            </div>
            <p className="text-[#C9B79C] leading-relaxed">
              Mana Indian Telugu Roots Abroad (MITRA UK) in association with ELE Entertainments and UK Telugu Association (MITRA), hosting the biggest Maha Ganapathi Mahotsav in Slough, Langley.
            </p>
            <div className="flex items-center space-x-3 text-[#F4C542]">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-[#D4AF37]/30 hover:border-[#F4C542] hover:bg-[#160B08] transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-[#D4AF37]/30 hover:border-[#F4C542] hover:bg-[#160B08] transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full border border-[#D4AF37]/30 hover:border-[#F4C542] hover:bg-[#160B08] transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Event Quick Links */}
          <div className="space-y-3">
            <h4 className="font-black font-cinzel text-sm text-[#F4C542] uppercase tracking-wider">
              Mahotsav Highlights
            </h4>
            <ul className="space-y-2 text-[#C9B79C]">
              <li><a href="#ritual-clock" className="hover:text-[#F4C542] transition-colors">Ritual Countdown Clock</a></li>
              <li><Link href="/events" className="hover:text-[#F4C542] transition-colors">Slough Langley Venue Schedule</Link></li>
              <li><Link href="/media?tab=videos" className="hover:text-[#F4C542] transition-colors">Official Teaser Reel</Link></li>
              <li><Link href="/about" className="hover:text-[#F4C542] transition-colors">6ft Bappa Artisan Specs</Link></li>
            </ul>
          </div>

          {/* Column 3: Community Services */}
          <div className="space-y-3">
            <h4 className="font-black font-cinzel text-sm text-[#F4C542] uppercase tracking-wider">
              Get Involved
            </h4>
            <ul className="space-y-2 text-[#C9B79C]">
              <li><a href="https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd" target="_blank" rel="noopener noreferrer" className="hover:text-[#F4C542] transition-colors">Official WhatsApp Community</a></li>
              {SITE_CONFIG.ENABLE_VOLUNTEER && (
                <li><Link href="/membership" className="hover:text-[#F4C542] transition-colors">Volunteer Seva Registration</Link></li>
              )}
              <li><Link href="/sponsors" className="hover:text-[#F4C542] transition-colors">Sponsorship & Offerings</Link></li>
              <li><Link href="/charity" className="hover:text-[#F4C542] transition-colors">Student & Community Welfare</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact & Venue */}
          <div className="space-y-3">
            <h4 className="font-black font-cinzel text-sm text-[#F4C542] uppercase tracking-wider">
              Venue & Contact
            </h4>
            <div className="space-y-2 text-[#C9B79C]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#F4C542] shrink-0 mt-0.5" />
                <span>Langley, Slough, Berkshire, United Kingdom</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#F4C542] shrink-0" />
                <span>info@mitra.org.uk</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#F4C542] shrink-0" />
                <span>+44 20 8000 1080</span>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright Bar */}
        <div className="pt-8 border-t border-[#D4AF37]/20 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#C9B79C] gap-4">
          <p>© 2026 MITRA UK & UK Telugu Association (MITRA). All Rights Reserved.</p>
          <p className="text-[#F4C542] font-semibold">
            Presented by Biryanis and more! · In association with ELE Entertainments
          </p>
        </div>

      </div>
    </footer>
  );
}
