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
  Flame,
  LogOut,
  User,
  LayoutDashboard,
} from 'lucide-react';

import { SITE_CONFIG } from '@/config/site-config';
import { useAuth } from '@/lib/auth-context';

// STATIC NAVIGATION CONFIGURATION (Read directly from src/config/site-config.json)
const NAV_CONFIG = {
  SHOW_TOP_RIBBON: SITE_CONFIG.ENABLE_TOP_RIBBON,
  SHOW_ABOUT_DROPDOWN: SITE_CONFIG.ENABLE_ABOUT_DROPDOWN,
  SHOW_LEADERSHIP: SITE_CONFIG.ENABLE_LEADERSHIP,
  SHOW_MEMBERSHIP: SITE_CONFIG.ENABLE_MEMBERSHIP,
  SHOW_MEMBER_PORTAL: SITE_CONFIG.ENABLE_MEMBER_PORTAL,
  SHOW_LOGIN: SITE_CONFIG.ENABLE_LOGIN,
  SHOW_SEARCH: SITE_CONFIG.ENABLE_SEARCH,
};

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [aboutDropdown, setAboutDropdown] = useState(false);
  const [mediaDropdown, setMediaDropdown] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const pathname = usePathname();

  const { user, isLoggedIn, logout } = useAuth();

  const isCurrent = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#0D0705]/95 backdrop-blur-md border-b border-[#D4AF37]/30 shadow-2xl transition-all">
      
      {/* Optional Top Ribbon Bar */}
      {NAV_CONFIG.SHOW_TOP_RIBBON && (
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

            <div className="flex items-center space-x-3.5">
              <a
                href="https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#F4C542] hover:text-white transition-colors flex items-center gap-1.5 font-bold text-[11px]"
              >
                <img src="/assets/whatsapp.png" alt="WhatsApp" className="w-3.5 h-3.5 object-contain" />
                <span>WhatsApp Group</span>
              </a>
              {NAV_CONFIG.SHOW_LOGIN && !isLoggedIn && (
                <>
                  <span className="text-[#D4AF37]/40">|</span>
                  <Link href="/login" className="hover:text-[#F4C542] transition-colors flex items-center gap-1 text-[11px] font-semibold">
                    <UserCheck className="w-3.5 h-3.5 text-[#F4C542]" />
                    <span>Member Login</span>
                  </Link>
                </>
              )}
              <span className="text-[#D4AF37]/40">|</span>
              <Link href="/admin" className="hover:text-[#F4C542] transition-colors flex items-center gap-1 text-[11px] font-semibold">
                <ShieldAlert className="w-3.5 h-3.5 text-[#F4C542]" />
                <span className="hidden sm:inline">Admin CMS</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-16 h-16 rounded-full overflow-hidden shrink-0">
              <img
                src="/assets/poster.jpg"
                alt="MITRA UK Logo"
                className="w-full h-full object-cover rounded-full scale-110"
              />
            </div>
            <div>
              <span className="font-black text-xl text-[#F4C542] font-cinzel tracking-wider block leading-none">
                MITRA UK
              </span>
              <span className="text-[10px] font-extrabold text-[#C9B79C] tracking-widest uppercase block mt-1">
                Mana Indian Telugu Roots Abroad
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-3 xl:space-x-5 text-[11px] xl:text-xs font-bold uppercase tracking-wider whitespace-nowrap pl-4">
            <Link 
              href="/" 
              className={`transition-colors whitespace-nowrap hover:text-[#F4C542] ${isCurrent('/') ? 'text-[#F4C542] font-black border-b-2 border-[#F4C542] pb-1' : 'text-[#F7EFE1]'}`}
            >
              Home
            </Link>

            {/* About US Link / Dropdown Toggle */}
            {NAV_CONFIG.SHOW_ABOUT_DROPDOWN ? (
              <div 
                className="relative"
                onMouseEnter={() => setAboutDropdown(true)}
                onMouseLeave={() => setAboutDropdown(false)}
              >
                <button className="flex items-center gap-1 text-[#F7EFE1] hover:text-[#F4C542] py-2 whitespace-nowrap">
                  <span>About US</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                {aboutDropdown && (
                  <div className="absolute top-full left-0 w-56 bg-[#160B08] shadow-2xl rounded-2xl py-2 border border-[#D4AF37]/40 z-50">
                    <Link href="/about" className="block px-4 py-2 text-xs text-[#F7EFE1] hover:bg-[#7A1620] hover:text-[#F4C542] whitespace-nowrap">MITRA UK Mission</Link>
                    <Link href="/history" className="block px-4 py-2 text-xs text-[#F7EFE1] hover:bg-[#7A1620] hover:text-[#F4C542] whitespace-nowrap">Guinness World Record</Link>
                    <Link href="/chairman-message" className="block px-4 py-2 text-xs text-[#F7EFE1] hover:bg-[#7A1620] hover:text-[#F4C542] whitespace-nowrap">Chairman's Address</Link>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href="/about" 
                className={`transition-colors whitespace-nowrap hover:text-[#F4C542] ${isCurrent('/about') ? 'text-[#F4C542] font-black border-b-2 border-[#F4C542] pb-1' : 'text-[#F7EFE1]'}`}
              >
                About US
              </Link>
            )}

            {/* Leadership Toggle */}
            {NAV_CONFIG.SHOW_LEADERSHIP && (
              <Link 
                href="/leadership" 
                className={`transition-colors whitespace-nowrap hover:text-[#F4C542] ${isCurrent('/leadership') ? 'text-[#F4C542] font-black' : 'text-[#F7EFE1]'}`}
              >
                Leadership
              </Link>
            )}

            <Link 
              href="/events" 
              className={`transition-colors whitespace-nowrap hover:text-[#F4C542] ${isCurrent('/events') ? 'text-[#F4C542] font-black' : 'text-[#F7EFE1]'}`}
            >
              Events
            </Link>

            {/* Media Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setMediaDropdown(true)}
              onMouseLeave={() => setMediaDropdown(false)}
            >
              <button className="flex items-center gap-1 text-[#F7EFE1] hover:text-[#F4C542] py-2 whitespace-nowrap">
                <span>Media &amp; photo graphics</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {mediaDropdown && (
                <div className="absolute top-full left-0 w-56 bg-[#160B08] shadow-2xl rounded-2xl py-2 border border-[#D4AF37]/40 z-50">
                  <Link href="/media?tab=photos" className="block px-4 py-2 text-xs text-[#F7EFE1] hover:bg-[#7A1620] hover:text-[#F4C542] whitespace-nowrap">Photo Gallery</Link>
                  <Link href="/media?tab=videos" className="block px-4 py-2 text-xs text-[#F7EFE1] hover:bg-[#7A1620] hover:text-[#F4C542] whitespace-nowrap">Teaser Reel &amp; Videos</Link>
                  <Link href="/media?tab=patrika" className="block px-4 py-2 text-xs text-[#F7EFE1] hover:bg-[#7A1620] hover:text-[#F4C542] whitespace-nowrap">Souvenir &amp; Patrika</Link>
                </div>
              )}
            </div>

            {/* Membership Toggle */}
            {NAV_CONFIG.SHOW_MEMBERSHIP && (
              <Link 
                href="/membership" 
                className={`transition-colors whitespace-nowrap hover:text-[#F4C542] ${isCurrent('/membership') ? 'text-[#F4C542] font-black' : 'text-[#F7EFE1]'}`}
              >
                Membership
              </Link>
            )}

            <Link 
              href="/sponsors" 
              className={`transition-colors whitespace-nowrap hover:text-[#F4C542] ${isCurrent('/sponsors') ? 'text-[#F4C542] font-black' : 'text-[#F7EFE1]'}`}
            >
              Sponsors
            </Link>

            <Link 
              href="/contact" 
              className={`transition-colors whitespace-nowrap hover:text-[#F4C542] ${isCurrent('/contact') ? 'text-[#F4C542] font-black' : 'text-[#F7EFE1]'}`}
            >
              Contact
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-3 shrink-0">
            
            {/* ── Auth-aware area ── */}
            {NAV_CONFIG.SHOW_LOGIN && (
              isLoggedIn ? (
                /* Logged-in user avatar + dropdown */
                <div
                  className="relative"
                  onMouseEnter={() => setUserDropdown(true)}
                  onMouseLeave={() => setUserDropdown(false)}
                >
                  <button className="flex items-center gap-2 bg-[#160B08] border border-[#D4AF37]/40 rounded-full px-3 py-1.5 hover:border-[#D4AF37] transition-colors">
                    <div className="w-7 h-7 rounded-full bg-[#7A1620] border border-[#D4AF37]/60 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-[#F4C542]" />
                    </div>
                    <span className="text-[11px] font-bold text-[#F4C542] max-w-[90px] truncate">
                      {user?.fullName?.split(' ')[0] || user?.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 text-[#D4AF37]" />
                  </button>

                  {userDropdown && (
                    <div className="absolute top-full right-0 mt-1 w-52 bg-[#160B08] shadow-2xl rounded-2xl py-2 border border-[#D4AF37]/40 z-50">
                      <div className="px-4 py-2 border-b border-[#D4AF37]/20 mb-1">
                        <p className="text-[10px] text-[#C9B79C] uppercase font-bold tracking-wider">Signed in as</p>
                        <p className="text-xs text-[#F4C542] font-black truncate">{user?.email}</p>
                        <span className="text-[10px] bg-[#7A1620] text-[#FFD87A] px-2 py-0.5 rounded-full font-bold inline-block mt-1">
                          {user?.tier || user?.role}
                        </span>
                      </div>
                      {NAV_CONFIG.SHOW_MEMBER_PORTAL && (
                        <Link
                          href="/membership/portal"
                          className="flex items-center gap-2 px-4 py-2 text-xs text-[#F7EFE1] hover:bg-[#7A1620] hover:text-[#F4C542] transition-colors"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5" />
                          <span>My Profile</span>
                        </Link>
                      )}
                      {user?.role === 'Admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-2 px-4 py-2 text-xs text-[#F7EFE1] hover:bg-[#7A1620] hover:text-[#F4C542] transition-colors"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Admin CMS</span>
                        </Link>
                      )}
                      <button
                        onClick={() => logout()}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 transition-colors w-full text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Not logged in → show Login link */
                <Link 
                  href="/login" 
                  className="text-[#F4C542] hover:underline font-bold text-xs px-2 flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
              )
            )}

            {NAV_CONFIG.SHOW_SEARCH && (
              <Link 
                href="/search" 
                aria-label="Search Website"
                className="p-2 text-[#C9B79C] hover:text-[#F4C542] transition-colors rounded-full hover:bg-[#160B08]"
              >
                <Search className="w-4 h-4" />
              </Link>
            )}
            
            <a
              href="https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd"
              target="_blank"
              rel="noopener noreferrer"
              className="gold-button px-4 xl:px-5 py-2.5 rounded-full text-[11px] xl:text-xs font-black flex items-center gap-2 shadow-lg hover:scale-105 transition-transform whitespace-nowrap shrink-0"
            >
              <img src="/assets/whatsapp.png" alt="WhatsApp" className="w-4 h-4 object-contain" />
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
          
          {/* Mobile Auth Status */}
          {isLoggedIn ? (
            <div className="bg-[#0D0705] border border-[#D4AF37]/30 rounded-2xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#7A1620] border border-[#D4AF37]/60 flex items-center justify-center">
                  <User className="w-4 h-4 text-[#F4C542]" />
                </div>
                <div>
                  <p className="text-[#F4C542] text-xs font-black">{user?.fullName || user?.email}</p>
                  <span className="text-[10px] bg-[#7A1620] text-[#FFD87A] px-2 py-0.5 rounded-full font-bold inline-block">
                    {user?.tier || user?.role}
                  </span>
                </div>
              </div>
              {NAV_CONFIG.SHOW_MEMBER_PORTAL && (
                <Link
                  href="/membership/portal"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 text-[#F7EFE1] hover:text-[#F4C542] py-1"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>My Profile</span>
                </Link>
              )}
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="flex items-center gap-2 text-rose-400 py-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : NAV_CONFIG.SHOW_LOGIN ? (
            <Link 
              href="/login" 
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-[#F4C542]"
            >
              <UserCheck className="w-4 h-4" />
              <span>Member Login</span>
            </Link>
          ) : null}

          <Link 
            href="/" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#F4C542]"
          >
            Home (Maha Mahotsav 2026)
          </Link>
          <Link 
            href="/about" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#F7EFE1]"
          >
            About US
          </Link>
          {NAV_CONFIG.SHOW_LEADERSHIP && (
            <Link 
              href="/leadership" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#F7EFE1]"
            >
              Leadership
            </Link>
          )}
          <Link 
            href="/events" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#F7EFE1]"
          >
            Events
          </Link>
          <Link 
            href="/media" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#F7EFE1]"
          >
            Media &amp; photo graphics
          </Link>
          {NAV_CONFIG.SHOW_MEMBERSHIP && (
            <Link 
              href="/membership" 
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-[#F7EFE1]"
            >
              Membership
            </Link>
          )}
          <Link 
            href="/sponsors" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#F7EFE1]"
          >
            Sponsors
          </Link>
          <Link 
            href="/contact" 
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-[#F7EFE1]"
          >
            Contact
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
