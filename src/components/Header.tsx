'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Calendar, 
  Search, 
  Menu, 
  X, 
  ChevronDown, 
  ShieldAlert, 
  UserCheck, 
  Sparkles,
  Heart,
  MessageCircle,
  Flame
} from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdown, setAboutDropdown] = useState(false);
  const [mediaDropdown, setMediaDropdown] = useState(false);
  const pathname = usePathname();

  const isCurrent = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#0D0705]/95 backdrop-blur-md border-b border-[#D4AF37]/30 shadow-2xl transition-all">
      {/* Top Devotional Ribbon Bar */}
      <div className="bg-gradient-to-r from-[#7A1620] via-[#9C1F2E] to-[#7A1620] text-[#F7EFE1] py-1.5 px-4 text-xs font-semibold">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="bg-[#D4AF37] text-[#0D0705] font-black px-2 py-0.5 rounded text-[10px] uppercase">
              LONDON GANESH MAHOTSAV 2026
            </span>
            <span className="hidden sm:inline text-[#FFD87A]">
              14th September 2026 · Langley, Slough
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <a
              href="https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#F4C542] hover:text-white transition-colors flex items-center gap-1 font-bold text-[11px]"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp Group</span>
            </a>
            <span className="text-[#D4AF37]/40">|</span>
            <Link href="/admin" className="hover:text-[#F4C542] transition-colors flex items-center gap-1 text-[11px]">
              <ShieldAlert className="w-3.5 h-3.5 text-[#F4C542]" />
              <span className="hidden sm:inline">Admin CMS</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-14 h-14 rounded-full border-2 border-[#D4AF37] p-0.5 shadow-[0_0_15px_rgba(212,175,55,0.4)] group-hover:scale-105 transition-transform bg-[#160B08] overflow-hidden shrink-0">
              <img
                src="/assets/poster-dark.jpeg"
                alt="Maha Ganapathi Logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <span className="font-black text-lg text-[#F4C542] font-cinzel tracking-wider block leading-none">
                MAHA GANAPATHI
              </span>
              <span className="text-[10px] font-extrabold text-[#C9B79C] tracking-widest uppercase block mt-0.5">
                MITRA UK · SLOUGH MAHOTSAV
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-bold uppercase tracking-wider">
            <Link 
              href="/" 
              className={`transition-colors hover:text-[#F4C542] ${isCurrent('/') ? 'text-[#F4C542] font-black border-b-2 border-[#F4C542] pb-1' : 'text-[#F7EFE1]'}`}
            >
              Mahotsav Reveal
            </Link>

            {/* About Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setAboutDropdown(true)}
              onMouseLeave={() => setAboutDropdown(false)}
            >
              <button className="flex items-center gap-1 text-[#F7EFE1] hover:text-[#F4C542] py-2">
                <span>About & Organizers</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {aboutDropdown && (
                <div className="absolute top-full left-0 w-56 bg-[#160B08] shadow-2xl rounded-2xl py-2 border border-[#D4AF37]/40">
                  <Link href="/about" className="block px-4 py-2 text-xs text-[#F7EFE1] hover:bg-[#7A1620] hover:text-[#F4C542]">MITRA UK & UKTA Mission</Link>
                  <Link href="/history" className="block px-4 py-2 text-xs text-[#F7EFE1] hover:bg-[#7A1620] hover:text-[#F4C542]">Guinness World Record</Link>
                  <Link href="/chairman-message" className="block px-4 py-2 text-xs text-[#F7EFE1] hover:bg-[#7A1620] hover:text-[#F4C542]">Chairman's Address</Link>
                </div>
              )}
            </div>

            <Link 
              href="/leadership" 
              className={`transition-colors hover:text-[#F4C542] ${isCurrent('/leadership') ? 'text-[#F4C542] font-black' : 'text-[#F7EFE1]'}`}
            >
              Leadership
            </Link>

            <Link 
              href="/events" 
              className={`transition-colors hover:text-[#F4C542] ${isCurrent('/events') ? 'text-[#F4C542] font-black' : 'text-[#F7EFE1]'}`}
            >
              Events Calendar
            </Link>

            {/* Media Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setMediaDropdown(true)}
              onMouseLeave={() => setMediaDropdown(false)}
            >
              <button className="flex items-center gap-1 text-[#F7EFE1] hover:text-[#F4C542] py-2">
                <span>Media & Teaser</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {mediaDropdown && (
                <div className="absolute top-full left-0 w-56 bg-[#160B08] shadow-2xl rounded-2xl py-2 border border-[#D4AF37]/40">
                  <Link href="/media?tab=photos" className="block px-4 py-2 text-xs text-[#F7EFE1] hover:bg-[#7A1620] hover:text-[#F4C542]">Photo Gallery</Link>
                  <Link href="/media?tab=videos" className="block px-4 py-2 text-xs text-[#F7EFE1] hover:bg-[#7A1620] hover:text-[#F4C542]">Teaser Reel & Videos</Link>
                  <Link href="/media?tab=patrika" className="block px-4 py-2 text-xs text-[#F7EFE1] hover:bg-[#7A1620] hover:text-[#F4C542]">Souvenir & Patrika</Link>
                </div>
              )}
            </div>

            <Link 
              href="/membership" 
              className={`transition-colors hover:text-[#F4C542] ${isCurrent('/membership') ? 'text-[#F4C542] font-black' : 'text-[#F7EFE1]'}`}
            >
              Membership
            </Link>

            <Link 
              href="/sponsors" 
              className={`transition-colors hover:text-[#F4C542] ${isCurrent('/sponsors') ? 'text-[#F4C542] font-black' : 'text-[#F7EFE1]'}`}
            >
              Sponsors
            </Link>

            <Link 
              href="/contact" 
              className={`transition-colors hover:text-[#F4C542] ${isCurrent('/contact') ? 'text-[#F4C542] font-black' : 'text-[#F7EFE1]'}`}
            >
              Contact
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link 
              href="/search" 
              aria-label="Search Website"
              className="p-2 text-[#C9B79C] hover:text-[#F4C542] transition-colors rounded-full hover:bg-[#160B08]"
            >
              <Search className="w-4 h-4" />
            </Link>
            
            <a
              href="https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd"
              target="_blank"
              rel="noopener noreferrer"
              className="gold-button px-5 py-2.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg hover:scale-105 transition-transform"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Join WhatsApp</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[#F7EFE1] hover:text-[#F4C542] focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#160B08] border-b border-[#D4AF37]/30 px-6 pt-4 pb-8 space-y-4 font-bold text-xs uppercase">
          <Link 
            href="/" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#F4C542]"
          >
            Mahotsav Reveal Experience
          </Link>
          <Link 
            href="/about" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#F7EFE1]"
          >
            About MITRA UK & UKTA
          </Link>
          <Link 
            href="/events" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#F7EFE1]"
          >
            Events Calendar
          </Link>
          <Link 
            href="/media" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#F7EFE1]"
          >
            Teaser & Photo Gallery
          </Link>
          <a
            href="https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="block w-full text-center gold-button py-3 rounded-full font-black shadow-xl"
          >
            Join WhatsApp Group
          </a>
        </div>
      )}
    </header>
  );
}
