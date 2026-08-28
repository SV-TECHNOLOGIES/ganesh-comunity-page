'use client';

import { useState } from 'react';
import { MessageCircle, Heart, HandHeart, Sparkles, X, CheckCircle } from 'lucide-react';

import { SITE_CONFIG } from '@/config/site-config';

interface OfferingPlaquesProps {
  onSponsorClick?: () => void;
}

export default function OfferingPlaques({ onSponsorClick }: OfferingPlaquesProps) {
  const [volunteerModalOpen, setVolunteerModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setVolunteerModalOpen(false);
    }, 2000);
  };

  return (
    <>
      <section className="py-20 bg-[#0D0705] text-[#F7EFE1] relative">
        <div className="max-w-6xl mx-auto px-4 space-y-12">
          
          {/* Section Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 bg-[#7A1620]/60 border border-[#D4AF37]/40 px-4 py-1 rounded-full text-xs font-extrabold text-[#F4C542] uppercase tracking-widest">
              <Sparkles className="w-4 h-4" />
              <span>COMMUNITY SEVA & PARTICIPATION</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-black font-cinzel gold-foil-text tracking-wider">
              GET INVOLVED IN MAHOTSAV SEVA
            </h2>

            <p className="max-w-xl mx-auto text-xs sm:text-sm text-[#C9B79C]">
              Be an active part of London’s biggest Maha Ganapathi celebration through Seva, Sponsorship, or Community Outreach.
            </p>
          </div>

          {/* Temple Offering Plaques Grid */}
          <div className={`grid grid-cols-1 ${SITE_CONFIG.ENABLE_VOLUNTEER ? 'md:grid-cols-3' : 'md:grid-cols-2 max-w-4xl mx-auto'} gap-8`}>
            
            {/* Plaque 1: WhatsApp Community */}
            <div className="temple-card temple-card-hover rounded-3xl p-8 border-2 border-[#D4AF37]/40 flex flex-col justify-between space-y-6 text-center group">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#160B08] border-2 border-[#D4AF37] flex items-center justify-center text-[#F4C542] shadow-[0_0_20px_rgba(212,175,55,0.3)] group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-8 h-8 fill-current" />
                </div>

                <h3 className="text-xl font-bold font-cinzel text-[#F7EFE1] uppercase">
                  JOIN WHATSAPP GROUP
                </h3>

                <p className="text-xs text-[#C9B79C] leading-relaxed">
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
              <div className="temple-card temple-card-hover rounded-3xl p-8 border-2 border-[#D4AF37]/40 flex flex-col justify-between space-y-6 text-center group">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-[#160B08] border-2 border-[#D4AF37] flex items-center justify-center text-[#F4C542] shadow-[0_0_20px_rgba(212,175,55,0.3)] group-hover:scale-110 transition-transform">
                    <HandHeart className="w-8 h-8" />
                  </div>

                  <h3 className="text-xl font-bold font-cinzel text-[#F7EFE1] uppercase">
                    VOLUNTEER FOR SEVA
                  </h3>

                  <p className="text-xs text-[#C9B79C] leading-relaxed">
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
            <div className="temple-card temple-card-hover rounded-3xl p-8 border-2 border-[#D4AF37]/40 flex flex-col justify-between space-y-6 text-center group">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#160B08] border-2 border-[#D4AF37] flex items-center justify-center text-[#F4C542] shadow-[0_0_20px_rgba(212,175,55,0.3)] group-hover:scale-110 transition-transform">
                  <Heart className="w-8 h-8 fill-current" />
                </div>

                <h3 className="text-xl font-bold font-cinzel text-[#F7EFE1] uppercase">
                  SPONSOR THE MAHOTSAV
                </h3>

                <p className="text-xs text-[#C9B79C] leading-relaxed">
                  Support the 6ft Maha Ganapathi event through Mahaprasadam sponsorship, flower decoration, or brand partner banners.
                </p>
              </div>

              <button
                onClick={onSponsorClick}
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="temple-card max-w-lg w-full p-8 rounded-3xl border-2 border-[#D4AF37] relative space-y-6">
            <button
              onClick={() => setVolunteerModalOpen(false)}
              className="absolute top-4 right-4 text-[#C9B79C] hover:text-[#F4C542]"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black font-cinzel gold-foil-text">VOLUNTEER SEVA REGISTRATION</h3>
              <p className="text-xs text-[#C9B79C]">Join the MITRA UK volunteer team for Slough Mahotsav 2026.</p>
            </div>

            {submitted ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle className="w-12 h-12 text-[#F4C542] mx-auto animate-bounce" />
                <p className="text-sm font-bold text-[#F7EFE1]">Thank you! Your volunteer application has been submitted.</p>
              </div>
            ) : (
              <form onSubmit={handleVolunteerSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#C9B79C] font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#C9B79C] font-semibold mb-1">Phone / WhatsApp Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+44 7000 000000"
                    className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#C9B79C] font-semibold mb-1">Preferred Seva Area</label>
                  <select className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none">
                    <option>Mahaprasadam Distribution</option>
                    <option>Crowd & Gate Welcome</option>
                    <option>Cultural Program Assistance</option>
                    <option>Decoration & Mandap Maintenance</option>
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
    </>
  );
}
