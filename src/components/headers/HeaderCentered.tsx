'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Search, 
  UserCheck, 
  User, 
  LogOut, 
  ChevronDown, 
  LayoutDashboard,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

interface HeaderProps {
  previewMode?: boolean;
}

export default function HeaderCentered({ previewMode = false }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuth();

  const isCurrent = (path: string) => pathname === path;

  return (
    <header className={`${previewMode ? 'relative w-full' : 'sticky top-0 z-50'} bg-[#FFF8F0]/98 backdrop-blur-md border-b border-[#E65C00]/20 shadow-[0_4px_25px_rgba(61,26,0,0.06)]`}>
      
      {/* Upper Saffron Cultural Ribbon */}
      <div className="bg-gradient-to-r from-[#D44F00] via-[#E65C00] to-[#D44F00] text-white py-1 px-4 text-xs font-semibold">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-[11px]">
          <div className="flex items-center gap-2">
            <span className="bg-white text-[#E65C00] px-2 py-0.2 rounded font-black tracking-wider uppercase text-[9px]">
              London Ganesh Mahotsav 2026
            </span>
            <span className="hidden sm:inline text-white/95">
              Celebrating Telugu Roots &amp; Cultural Heritage Across the UK
            </span>
          </div>

          <div className="flex items-center space-x-3 text-[11px]">
            {isLoggedIn ? (
              <span className="text-white/90">Welcome, {user?.fullName?.split(' ')[0] || user?.username}</span>
            ) : (
              <Link href="/login" className="hover:text-white flex items-center gap-1 text-white/90">
                <UserCheck className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
            )}
            <span className="text-white/40">|</span>
            <Link href="/admin" className="hover:text-white flex items-center gap-1 text-white/90">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Symmetrical Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24 gap-2">
          
          {/* Left Wing Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center justify-end space-x-2 xl:space-x-5 text-xs font-bold uppercase tracking-wider flex-1 whitespace-nowrap">
            <Link 
              href="/" 
              className={`py-1 hover:text-[#E65C00] transition-colors ${isCurrent('/') ? 'text-[#E65C00] font-black border-b-2 border-[#E65C00]' : 'text-[#3D1A00]'}`}
            >
              Home
            </Link>
            <Link 
              href="/about" 
              className={`py-1 hover:text-[#E65C00] transition-colors ${isCurrent('/about') ? 'text-[#E65C00] font-black border-b-2 border-[#E65C00]' : 'text-[#3D1A00]'}`}
            >
              About US
            </Link>
            <Link 
              href="/leadership" 
              className={`py-1 hover:text-[#E65C00] transition-colors ${isCurrent('/leadership') ? 'text-[#E65C00] font-black border-b-2 border-[#E65C00]' : 'text-[#3D1A00]'}`}
            >
              Leadership
            </Link>
            <Link 
              href="/events" 
              className={`py-1 hover:text-[#E65C00] transition-colors ${isCurrent('/events') ? 'text-[#E65C00] font-black border-b-2 border-[#E65C00]' : 'text-[#3D1A00]'}`}
            >
              Events
            </Link>
          </nav>

          {/* Central Ornate Logo Emblem */}
          <Link href="/" className="flex flex-col items-center justify-center shrink-0 px-4 group">
            <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 ring-2 ring-[#E65C00]/40 group-hover:ring-[#E65C00] group-hover:scale-105 transition-all bg-white p-1 flex items-center justify-center shadow-md">
              <img
                src="/assets/favicon.ico"
                alt="MITRA UK Logo"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div className="text-center mt-1 shrink-0 min-w-max">
              <span className="font-black text-xl text-[#E65C00] font-cinzel tracking-widest block leading-none">
                MITRA UK
              </span>
              <span className="text-[9px] font-extrabold text-[#6B3A2A] tracking-wider uppercase block mt-0.5 whitespace-nowrap">
                Mana Indian Telugu Roots Abroad
              </span>
            </div>
          </Link>

          {/* Right Wing Navigation (Desktop) */}
          <nav className="hidden lg:flex items-center justify-start space-x-2 xl:space-x-5 text-xs font-bold uppercase tracking-wider flex-1 whitespace-nowrap">
            <Link 
              href="/media" 
              className={`py-1 hover:text-[#E65C00] transition-colors ${isCurrent('/media') ? 'text-[#E65C00] font-black border-b-2 border-[#E65C00]' : 'text-[#3D1A00]'}`}
            >
              Media
            </Link>
            <Link 
              href="/sponsors" 
              className={`py-1 hover:text-[#E65C00] transition-colors ${isCurrent('/sponsors') ? 'text-[#E65C00] font-black border-b-2 border-[#E65C00]' : 'text-[#3D1A00]'}`}
            >
              Sponsors
            </Link>
            <Link 
              href="/telugu-business" 
              className={`py-1 hover:text-[#E65C00] transition-colors ${isCurrent('/telugu-business') ? 'text-[#E65C00] font-black border-b-2 border-[#E65C00]' : 'text-[#3D1A00]'}`}
            >
              Business
            </Link>
            <Link 
              href="/contact" 
              className={`py-1 hover:text-[#E65C00] transition-colors ${isCurrent('/contact') ? 'text-[#E65C00] font-black border-b-2 border-[#E65C00]' : 'text-[#3D1A00]'}`}
            >
              Contact
            </Link>

            {/* Compact WhatsApp Button */}
            <a
              href="https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba59] text-white p-2 rounded-full shadow-md hover:scale-110 transition-transform"
              aria-label="Join WhatsApp"
              title="Join WhatsApp Group"
            >
              <img src="/assets/whatsapp.png" alt="WhatsApp" className="w-4 h-4 object-contain" />
            </a>
          </nav>

          {/* Mobile menu trigger */}
          <div className="flex lg:hidden items-center space-x-2">
            <a
              href="https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] p-2 rounded-full text-white"
            >
              <img src="/assets/whatsapp.png" alt="WhatsApp" className="w-4 h-4 object-contain" />
            </a>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#3D1A00] hover:text-[#E65C00]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FFFAF5] border-t border-[#E65C00]/20 px-6 py-4 space-y-2 text-xs font-bold uppercase animate-in slide-in-from-top duration-200">
          <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00]">Home</Link>
          <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00]">About Us</Link>
          <Link href="/leadership" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00]">Leadership</Link>
          <Link href="/events" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00]">Events</Link>
          <Link href="/media" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00]">Media &amp; Gallery</Link>
          <Link href="/sponsors" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00]">Sponsors</Link>
          <Link href="/telugu-business" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00]">Telugu Business</Link>
          <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-[#3D1A00] hover:text-[#E65C00]">Contact</Link>
        </div>
      )}

    </header>
  );
}
