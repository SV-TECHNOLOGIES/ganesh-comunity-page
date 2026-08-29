'use client';

import { useState } from 'react';
import { MessageCircle, Heart, HandHeart, Sparkles, X, CheckCircle } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site-config';
import SponsorInquiryModal from '@/components/SponsorInquiryModal';

interface OfferingPlaquesProps {
  onSponsorClick?: () => void;
}

export default function OfferingPlaques({ onSponsorClick }: OfferingPlaquesProps) {
  const [volunteerModalOpen, setVolunteerModalOpen] = useState(false);
  const [sponsorModalOpen, setSponsorModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setVolunteerModalOpen(false);
    }, 2000);
  };

  const handleSponsorButton = () => {
    if (onSponsorClick) {
      onSponsorClick();
    } else {
      setSponsorModalOpen(true);
    }
  };

  return (
    <>
      <section className="py-20 bg-gradient-to-b from-[#FFF8F0] to-[#FFF3E0] text-[#3D1A00] relative">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          
          {/* Section Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#FFF0E0] border border-[#E65C00]/30 px-4 py-1 rounded-full text-xs font-extrabold text-[#E65C00] uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>COMMUNITY SEVA &amp; PARTICIPATION</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black font-cinzel gold-foil-text tracking-wider">
              GET INVOLVED IN MAHOTSAV SEVA
            </h2>

            <p className="max-w-xl mx-auto text-xs sm:text-sm text-[#6B3A2A]">
              Be an active part of London's biggest Maha Ganapathi celebration through Seva, Sponsorship, or Community Outreach.
            </p>
          </div>

          {/* Temple Offering Plaques Grid */}
          <div className={`grid grid-cols-1 ${SITE_CONFIG.ENABLE_VOLUNTEER ? 'md:grid-cols-3' : 'md:grid-cols-2 max-w-4xl mx-auto'} gap-8`}>
            
            {/* Plaque 1: WhatsApp Community */}
            <div className="temple-card temple-card-hover rounded-3xl p-8 border-2 border-[#E65C00]/25 flex flex-col justify-between space-y-6 text-center group">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#FFF0E0] border-2 border-[#E65C00]/40 flex items-center justify-center text-[#E65C00] shadow-[0_0_20px_rgba(230,92,0,0.15)] group-hover:scale-110 group-hover:bg-[#E65C00] group-hover:text-white transition-all">
                  <MessageCircle className="w-8 h-8 fill-current" />
                </div>

                <h3 className="text-xl font-bold font-cinzel text-[#3D1A00] uppercase">
                  JOIN WHATSAPP GROUP
                </h3>

                <p className="text-xs text-[#6B3A2A] leading-relaxed">
                  Receive instant announcements, Aarti schedules, live updates, and direct community links on WhatsApp.
                </p>
              </div>

              <a
                href="https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd"
                target="_blank"
                rel="noopener noreferrer"
                className="gold-button w-full py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <span>Join Official WhatsApp</span>
              </a>
            </div>

            {/* Plaque 2: Volunteer Seva (Toggle Controlled) */}
            {SITE_CONFIG.ENABLE_VOLUNTEER && (
              <div className="temple-card temple-card-hover rounded-3xl p-8 border-2 border-[#E65C00]/25 flex flex-col justify-between space-y-6 text-center group">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#FFF0E0] border-2 border-[#E65C00]/40 flex items-center justify-center text-[#E65C00] shadow-[0_0_20px_rgba(230,92,0,0.15)] group-hover:scale-110 group-hover:bg-[#E65C00] group-hover:text-white transition-all">
                    <HandHeart className="w-8 h-8" />
                  </div>

                  <h3 className="text-xl font-bold font-cinzel text-[#3D1A00] uppercase">
                    VOLUNTEER FOR SEVA
                  </h3>

                  <p className="text-xs text-[#6B3A2A] leading-relaxed">
                    Offer your time and service for Prasad distribution, venue management, crowd coordination, and cultural programs.
                  </p>
                </div>

                <button
                  onClick={() => setVolunteerModalOpen(true)}
                  className="maroon-button w-full py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <span>Register as Volunteer</span>
                </button>
              </div>
            )}

            {/* Plaque 3: Sponsor & Support */}
            <div className="temple-card temple-card-hover rounded-3xl p-8 border-2 border-[#E65C00]/25 flex flex-col justify-between space-y-6 text-center group">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#FFF0E0] border-2 border-[#E65C00]/40 flex items-center justify-center text-[#E65C00] shadow-[0_0_20px_rgba(230,92,0,0.15)] group-hover:scale-110 group-hover:bg-[#E65C00] group-hover:text-white transition-all">
                  <Heart className="w-8 h-8 fill-current" />
                </div>

                <h3 className="text-xl font-bold font-cinzel text-[#3D1A00] uppercase">
                  SPONSOR THE MAHOTSAV
                </h3>

                <p className="text-xs text-[#6B3A2A] leading-relaxed">
                  Support the 6ft Maha Ganapathi event through Mahaprasadam sponsorship, flower decoration, or brand partner banners.
                </p>
              </div>

              <button
                onClick={handleSponsorButton}
                className="gold-button w-full py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <span>Sponsor / Support Seva</span>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Volunteer Modal */}
      {volunteerModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#3D1A00]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="temple-card max-w-lg w-full p-8 rounded-3xl border-2 border-[#E65C00]/40 relative space-y-6 shadow-2xl">
            <button
              onClick={() => setVolunteerModalOpen(false)}
              className="absolute top-4 right-4 text-[#6B3A2A] hover:text-[#E65C00]"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black font-cinzel gold-foil-text">VOLUNTEER SEVA REGISTRATION</h3>
              <p className="text-xs text-[#6B3A2A]">Join the MITRA UK volunteer team for Slough Mahotsav 2026.</p>
            </div>

            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle className="w-12 h-12 text-[#E65C00] mx-auto animate-bounce" />
                <p className="text-sm font-bold text-[#3D1A00]">Thank you! Your volunteer application has been submitted.</p>
              </div>
            ) : (
              <form onSubmit={handleVolunteerSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#6B3A2A] font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    className="w-full bg-[#FFF8F0] border border-[#E65C00]/30 rounded-xl px-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/50"
                  />
                </div>
                <div>
                  <label className="block text-[#6B3A2A] font-semibold mb-1">Phone / WhatsApp Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+44 7000 000000"
                    className="w-full bg-[#FFF8F0] border border-[#E65C00]/30 rounded-xl px-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/50"
                  />
                </div>
                <div>
                  <label className="block text-[#6B3A2A] font-semibold mb-1">Preferred Seva Area</label>
                  <select className="w-full bg-[#FFF8F0] border border-[#E65C00]/30 rounded-xl px-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none">
                    <option>Mahaprasadam Distribution</option>
                    <option>Crowd &amp; Gate Welcome</option>
                    <option>Cultural Program Assistance</option>
                    <option>Decoration &amp; Mandap Maintenance</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="gold-button w-full py-3 rounded-xl font-bold uppercase tracking-wider text-xs"
                >
                  Submit Seva Form
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Sponsor Email Inquiry Modal */}
      <SponsorInquiryModal
        isOpen={sponsorModalOpen}
        onClose={() => setSponsorModalOpen(false)}
      />
    </>
  );
}
