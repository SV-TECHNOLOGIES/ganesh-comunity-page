'use client';

import React from 'react';
import { MapPin, Calendar, Clock, Download, ExternalLink, Sparkles, Flame, Heart, Utensils, Star, CheckCircle } from 'lucide-react';
import { POOJA_DATES } from '@/components/PoojaBookingModal';

interface EventDetailsSectionProps {
  onOpenPoojaBooking?: (dateId?: string) => void;
  onOpenDonation?: (cat?: 'Annadanam' | 'Event Donations') => void;
}

export default function EventDetailsSection({
  onOpenPoojaBooking,
  onOpenDonation,
}: EventDetailsSectionProps) {

  const dailySchedule = [
    { time: '09:00 AM', event: 'Daily Ganapathi Abhishekam & Archana', desc: 'Vedic chants and ritual sanctum offerings.' },
    { time: '12:30 PM', event: 'Grand Afternoon Aarti & Mahaprasadam', desc: 'Devotional bhajans and community lunch distribution.' },
    { time: '05:30 PM', event: 'Cultural Performances & Kuchipudi Showcase', desc: 'Classical dance and Telugu devotional songs by UK youth.' },
    { time: '08:00 PM', event: 'Maha Mangala Aarti & Evening Darshan', desc: 'Illumination ceremony with hundreds of oil lamps.' },
  ];

  return (
    <section className="py-20 bg-[#160B08] text-[#F7EFE1] border-b border-[#D4AF37]/30">
      <div className="max-w-6xl mx-auto px-4 space-y-16">
        
        {/* Section Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-[#7A1620]/60 border border-[#D4AF37]/40 px-4 py-1 rounded-full text-xs font-extrabold text-[#F4C542] uppercase tracking-widest">
            <Calendar className="w-4 h-4" />
            <span>GANESH MAHOTSAV 2026 SCHEDULE & SEVA</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black font-cinzel gold-foil-text tracking-wider">
            7-DAY MAHOTSAV & POOJA CALENDAR
          </h2>

          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-[#C9B79C] leading-relaxed">
            Experience 7 divine days of Darshan, Vedic rituals, and cultural celebrations from 13th to 19th September 2026 in Langley, Slough.
          </p>
        </div>

        {/* 7-DAY FESTIVAL SCHEDULE GRID */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#D4AF37]/30 pb-3">
            <div>
              <span className="text-xs font-black font-cinzel text-[#F4C542] uppercase tracking-widest block">
                SACRED RITUAL SCHEDULE (13TH – 19TH SEP 2026)
              </span>
              <h3 className="text-xl sm:text-2xl font-black font-cinzel text-[#F7EFE1]">
                CHOOSE YOUR AUSPICIOUS POOJA DAY
              </h3>
            </div>
            <span className="text-xs text-[#C9B79C]">
              Each pooja includes personalized family Sankalpam & Prasadam box (£116)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {POOJA_DATES.map((dayItem, idx) => (
              <div
                key={dayItem.id}
                className={`temple-card rounded-3xl p-6 border-2 flex flex-col justify-between space-y-5 relative transition-all duration-300 hover:scale-[1.02] ${
                  dayItem.id === 'day-2'
                    ? 'border-[#D4AF37] bg-gradient-to-b from-[#7A1620]/70 to-[#160B08] shadow-[0_0_25px_rgba(212,175,55,0.3)]'
                    : 'border-[#D4AF37]/40 bg-[#0D0705]/90 hover:border-[#F4C542]'
                }`}
              >
                {/* Header Badge */}
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-black uppercase text-[#F4C542] font-cinzel tracking-wider">
                      {dayItem.day}
                    </span>
                    <h4 className="text-xl font-black text-[#F7EFE1] font-cinzel">
                      {dayItem.date}
                    </h4>
                  </div>

                  {dayItem.badge ? (
                    <span className="bg-[#D4AF37] text-[#0D0705] text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                      {dayItem.badge}
                    </span>
                  ) : (
                    <span className="bg-[#7A1620] text-[#F4C542] border border-[#D4AF37]/30 text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                      DAY {idx + 1}
                    </span>
                  )}
                </div>

                {/* Day Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-[#F4C542] shrink-0" />
                    <h5 className="text-base font-bold text-[#F4C542] font-cinzel leading-tight">
                      {dayItem.title}
                    </h5>
                  </div>
                  <p className="text-xs font-semibold text-[#F7EFE1]">
                    {dayItem.theme}
                  </p>
                  <p className="text-[11px] text-[#C9B79C] leading-relaxed italic">
                    ✦ {dayItem.blessing}
                  </p>
                </div>

                {/* Card Action */}
                <button
                  onClick={() => onOpenPoojaBooking?.(dayItem.id)}
                  className="gold-button w-full py-2.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Flame className="w-3.5 h-3.5 fill-current text-[#0D0705]" />
                  <span>Book Pooja (£116)</span>
                </button>
              </div>
            ))}
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
              Easy access via Elizabeth Line (Langley Station) & M4 Junction 5. Ample parking available for families.
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

        {/* Daily Program Aarti Schedule & Map Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Daily Schedule List */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xl font-bold font-cinzel text-[#F4C542] flex items-center gap-2 uppercase tracking-wider">
              <Flame className="w-5 h-5 text-[#F4C542]" />
              <span>Daily Mahotsav Aarti & Puja Timings</span>
            </h3>

            <div className="space-y-3">
              {dailySchedule.map((item, idx) => (
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
    </section>
  );
}
