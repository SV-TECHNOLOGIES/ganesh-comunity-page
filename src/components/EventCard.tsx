'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { EventItem } from '@/lib/types';
import { Calendar, MapPin, Clock, Users, CheckCircle, Share2, Ticket } from 'lucide-react';
import EventRSVPModal from '@/components/EventRSVPModal';

export default function EventCard({ event, onRSVP }: { event: EventItem; onRSVP?: () => void }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [count, setCount] = useState(event.rsvpCount);
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.origin + `/events/${event.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <div className="bg-[#160B08] rounded-3xl overflow-hidden border border-[#D4AF37]/40 shadow-xl hover:shadow-[0_0_30px_rgba(212,175,55,0.2)] transition-all duration-300 flex flex-col group">
        {/* Banner & Category Pill */}
        <div className="relative h-48 w-full overflow-hidden bg-[#0D0705]">
          <Image
            src={event.bannerUrl}
            alt={event.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0705] via-[#0D0705]/30 to-transparent" />
          
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="bg-[#7A1620] text-[#F4C542] font-black text-[10px] uppercase px-3 py-1 rounded-full border border-[#D4AF37]/40 shadow">
              {event.category}
            </span>
            {event.featured && (
              <span className="bg-[#D4AF37] text-[#0D0705] font-black text-[10px] uppercase px-2.5 py-1 rounded-full shadow">
                FEATURED
              </span>
            )}
          </div>

          <div className="absolute bottom-3 right-3 bg-[#0D0705]/90 backdrop-blur text-[#F4C542] font-black text-xs px-3 py-1 rounded-full border border-[#D4AF37]/50">
            {event.ticketPrice === 0 ? 'FREE ADMISSION' : `£${event.ticketPrice}`}
          </div>
        </div>

        {/* Details */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-lg font-bold text-[#F7EFE1] group-hover:text-[#F4C542] transition-colors line-clamp-2 font-cinzel">
              <Link href={`/events/${event.id}`}>{event.title}</Link>
            </h3>
            <p className="text-xs text-[#C9B79C] mt-2 line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          </div>

          <div className="space-y-2 text-xs text-[#C9B79C] border-t border-[#D4AF37]/20 pt-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#F4C542] shrink-0" />
              <span className="font-semibold text-[#F7EFE1]">
                {new Date(event.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#F4C542] shrink-0" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#F4C542] shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
            <div className="flex items-center gap-2 pt-1 text-[11px]">
              <Users className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span>{count} / {event.capacity} Confirmed Attendees</span>
            </div>
          </div>

          {/* Card Buttons */}
          <div className="flex items-center gap-2 pt-2">
            {event.status === 'Past' ? (
              <span className="w-full text-center bg-[#0D0705] text-[#C9B79C] py-2 rounded-xl text-xs font-semibold border border-[#D4AF37]/20">
                Past Event Archived
              </span>
            ) : (
              <button
                onClick={() => setModalOpen(true)}
                className="gold-button flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
              >
                <Ticket className="w-4 h-4 text-[#0D0705]" />
                <span>Register / RSVP Now</span>
              </button>
            )}

            <button
              onClick={handleShare}
              className="p-2.5 bg-[#0D0705] hover:bg-[#7A1620]/40 text-[#F4C542] border border-[#D4AF37]/30 rounded-xl text-xs transition-colors relative"
              title="Share Event Link"
            >
              <Share2 className="w-4 h-4" />
              {copied && (
                <span className="absolute -top-8 right-0 bg-[#7A1620] text-[#F4C542] text-[10px] px-2 py-1 rounded border border-[#D4AF37]/40 shadow whitespace-nowrap">
                  Link Copied!
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Event RSVP Modal */}
      {modalOpen && (
        <EventRSVPModal
          event={{
            id: event.id,
            title: event.title,
            date: event.date,
            time: event.time,
            venue: event.venue,
            ticketPrice: event.ticketPrice,
          }}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setCount(prev => prev + 1);
            if (onRSVP) onRSVP();
          }}
        />
      )}
    </>
  );
}

