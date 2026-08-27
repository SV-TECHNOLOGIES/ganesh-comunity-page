'use client';

import { useState } from 'react';
import { MapPin, Calendar, Clock, Download, ExternalLink, Sparkles, Flame, Heart, Utensils } from 'lucide-react';
import DonationModal from '@/components/DonationModal';

export default function EventDetailsSection() {
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [selectedDonationCategory, setSelectedDonationCategory] = useState<'Annadanam' | 'Pooja Booking' | 'Event Donations'>('Pooja Booking');

  const openDonation = (cat: 'Annadanam' | 'Pooja Booking' | 'Event Donations') => {
    setSelectedDonationCategory(cat);
    setDonateModalOpen(true);
  };

  const schedule = [
    { time: '09:00 AM', event: 'Ganapathi Sthapana & Prana Pratishtha', desc: 'Ritual installation of the 6ft Maha Ganapathi idol.' },
    { time: '12:30 PM', event: 'Grand Afternoon Aarti & Mahaprasadam', desc: 'Devotional bhajans and community lunch distribution.' },
    { time: '05:30 PM', event: 'Cultural Performances & Kuchipudi Showcase', desc: 'Classical dance performances by UK youth.' },
    { time: '08:00 PM', event: 'Maha Mangala Aarti & Visarjan Procession Prep', desc: 'Evening grand illumination and devotional prayer.' },
  ];

  return (
    <section className="py-20 bg-[#160B08] text-[#F7EFE1] border-b border-[#D4AF37]/30">
      <div className="max-w-6xl mx-auto px-4 space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#7A1620]/60 border border-[#D4AF37]/40 px-4 py-1 rounded-full text-xs font-extrabold text-[#F4C542] uppercase tracking-widest">
            <Calendar className="w-4 h-4" />
            <span>GANESH MAHOTSAV 2026 DETAILS</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black font-cinzel gold-foil-text tracking-wider">
            GANESH MAHOTSAV EVENT & SEVA
          </h2>

          <p className="max-w-xl mx-auto text-xs sm:text-sm text-[#C9B79C]">
            Join us on 14th September 2026 in Langley, Slough for a day of divine darshan, cultural festivities, and sacred Poojas.
          </p>
        </div>

        {/* MAKE A DONATION OR BOOK A POOJA CARD FOR GANESH MAHOTSAV */}
        <div className="temple-card p-6 sm:p-8 rounded-3xl border-2 border-[#D4AF37] space-y-6 shadow-[0_0_35px_rgba(212,175,55,0.25)]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#D4AF37]/30 pb-4">
            <div className="space-y-1">
              <span className="text-xs font-black font-cinzel text-[#F4C542] uppercase tracking-widest block">
                GANESH MAHOTSAV SEVA REGISTRY
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-cinzel text-[#F7EFE1]">
                MAKE A DONATION OR BOOK A POOJA FOR GANESH MAHOTSAV
              </h3>
              <p className="text-xs text-[#C9B79C]">
                Book your sacred Maha Ganapathi Pooja (£116 fixed) or sponsor Annadanam Prasadam for thousands of devotees.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Annadanam */}
            <button
              onClick={() => openDonation('Annadanam')}
              className="bg-[#0D0705] border border-[#D4AF37]/40 hover:border-[#F4C542] p-5 rounded-2xl text-left space-y-2 hover:scale-[1.02] transition-transform group"
            >
              <div className="flex items-center gap-2 text-[#F4C542] font-black text-sm font-cinzel">
                <Utensils className="w-5 h-5 text-[#F4C542]" />
                <span>ANNADANAM SEVA</span>
              </div>
              <p className="text-xs text-[#C9B79C]">
                Sponsor Mahaprasadam food distribution for thousands of devotees during Ganesh Mahotsav. (Any amount)
              </p>
              <span className="gold-button px-4 py-1.5 rounded-full text-[10px] font-black uppercase inline-block mt-2">
                Donate Annadanam &rarr;
              </span>
            </button>

            {/* Pooja Booking */}
            <button
              onClick={() => openDonation('Pooja Booking')}
              className="bg-gradient-to-r from-[#7A1620] to-[#9C1F2E] border-2 border-[#D4AF37] p-5 rounded-2xl text-left space-y-2 hover:scale-[1.02] transition-transform shadow-xl relative"
            >
              <span className="absolute -top-3 right-4 bg-[#D4AF37] text-[#0D0705] text-[10px] font-black px-2 py-0.5 rounded-full uppercase shadow">
                £116 FIXED SEVA
              </span>
              <div className="flex items-center gap-2 text-[#F4C542] font-black text-sm font-cinzel">
                <Flame className="w-5 h-5 text-[#F4C542]" />
                <span>POOJA BOOKING</span>
              </div>
              <p className="text-xs text-[#F7EFE1]">
                Personalized Maha Ganapathi Archana, Priest Sankalpam with family name, and sacred Prasadam box.
              </p>
              <span className="gold-button px-4 py-1.5 rounded-full text-[10px] font-black uppercase inline-block mt-2">
                Book Pooja (£116) &rarr;
              </span>
            </button>

            {/* Event Donations */}
            <button
              onClick={() => openDonation('Event Donations')}
              className="bg-[#0D0705] border border-[#D4AF37]/40 hover:border-[#F4C542] p-5 rounded-2xl text-left space-y-2 hover:scale-[1.02] transition-transform group"
            >
              <div className="flex items-center gap-2 text-[#F4C542] font-black text-sm font-cinzel">
                <Heart className="w-5 h-5 text-[#F4C542]" />
                <span>EVENT DONATION</span>
              </div>
              <p className="text-xs text-[#C9B79C]">
                Support Ganesh Mahotsav 6ft Idol installation, Mandap decoration, sound systems, and cultural stage.
              </p>
              <span className="gold-button px-4 py-1.5 rounded-full text-[10px] font-black uppercase inline-block mt-2">
                Donate to Event &rarr;
              </span>
            </button>
          </div>
        </div>

        {/* Venue Info & Add to Calendar Bar */}
        <div className="temple-card rounded-3xl p-8 border-2 border-[#D4AF37]/50 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-[#F4C542] font-black text-sm uppercase tracking-wider font-cinzel">
              <MapPin className="w-5 h-5" />
              <span>Langley Community Mandap, Slough</span>
            </div>
            <p className="text-xs text-[#C9B79C]">
              Easy access via Elizabeth Line (Langley Station) & M4 Junction 5. Ample parking available.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="https://maps.google.com/?q=Langley+Slough+UK"
              target="_blank"
              rel="noopener noreferrer"
              className="maroon-button px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2"
            >
              <span>Get Directions</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Program Schedule & Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Schedule List */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xl font-bold font-cinzel text-[#F4C542] flex items-center gap-2 uppercase tracking-wider">
              <Flame className="w-5 h-5 text-[#F4C542]" />
              <span>Mahotsav Aarti & Puja Schedule</span>
            </h3>

            <div className="space-y-3">
              {schedule.map((item, idx) => (
                <div key={idx} className="temple-card p-5 rounded-2xl border border-[#D4AF37]/30 flex items-start gap-4">
                  <div className="bg-[#7A1620] text-[#F4C542] px-3 py-1.5 rounded-xl font-black text-xs shrink-0 font-cinzel border border-[#D4AF37]/40">
                    {item.time}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[#F7EFE1]">{item.event}</h4>
                    <p className="text-xs text-[#C9B79C]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Styled Dark Map Card */}
          <div className="lg:col-span-5 temple-card p-6 rounded-3xl border border-[#D4AF37]/40 space-y-4">
            <h3 className="text-lg font-bold font-cinzel text-[#F4C542] flex items-center gap-2 uppercase">
              <MapPin className="w-5 h-5" />
              <span>Interactive Venue Map</span>
            </h3>

            <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-[#D4AF37]/30 bg-[#0D0705] flex items-center justify-center">
              <iframe
                title="Langley Slough Venue Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d19842.14810237912!2d-0.5484865000000001!3d51.5074218!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48767b4c9b33a595%3A0x6b772b1d3d62fa22!2sLangley%2C%20Slough!5e0!3m2!1sen!2suk!4v1700000000000"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                allowFullScreen={false}
                loading="lazy"
              />
            </div>
          </div>

        </div>

      </div>

      {/* DONATION & POOJA MODAL */}
      <DonationModal
        isOpen={donateModalOpen}
        onClose={() => setDonateModalOpen(false)}
        initialCategory={selectedDonationCategory}
      />
    </section>
  );
}
