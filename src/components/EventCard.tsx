'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { EventItem } from '@/lib/types';
import { Calendar, MapPin, Clock, Users, CheckCircle, Share2, Ticket, Flame, HeartHandshake } from 'lucide-react';
import EventRSVPModal from '@/components/EventRSVPModal';
import DonationModal from '@/components/DonationModal';
import PoojaBookingModal from '@/components/PoojaBookingModal';

export default function EventCard({ event, onRSVP }: { event: EventItem; onRSVP?: () => void }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [poojaModalOpen, setPoojaModalOpen] = useState(false);
  const [count, setCount] = useState(event.rsvpCount);
  const [copied, setCopied] = useState(false);

  const displayPrice = (() => {
    if (Array.isArray(event.ticketTiers) && event.ticketTiers.length > 0) {
      const active = event.ticketTiers.filter((t) => t.isActive !== false && t.allowDirectBooking !== false);
      const prices = active.map((t) => Number(t.price));
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (maxPrice === 0) return 'FREE ADMISSION';
      if (minPrice === 0) {
        const paidMin = prices.filter((p) => p > 0);
        return paidMin.length > 0 ? `From £${Math.min(...paidMin)}` : 'FREE ADMISSION';
      }
      if (minPrice === maxPrice) return `£${minPrice}`;
      return `From £${minPrice}`;
    }
    return event.ticketPrice === 0 ? 'FREE ADMISSION' : `£${event.ticketPrice}`;
  })();

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.origin + `/events/${event.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/events/${event.id}`;
      const text = `🌸 *${event.title}*\n📅 ${event.date} • ${event.time}\n📍 ${event.venue}\n\nJoin us! Event passes & details:\n${shareUrl}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  return (
    <>
      <div className="bg-white rounded-3xl overflow-hidden border border-[#E65C00]/20 shadow-md hover:shadow-[0_12px_40px_rgba(230,92,0,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col group">
        
        {/* Full Event Poster (745:1024 Portrait Poster Ratio) */}
        <Link
          href={`/events/${event.id}`}
          className="relative aspect-[745/1024] w-full overflow-hidden bg-[#1A0A00] block"
        >
          {/* Ambient blurred backdrop so any slight ratio variation blends seamlessly */}
          <Image
            src={event.bannerUrl}
            alt=""
            fill
            aria-hidden="true"
            className="object-cover blur-xl opacity-40 scale-110 pointer-events-none"
          />
          <Image
            src={event.bannerUrl}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain group-hover:scale-[1.02] transition-transform duration-500 z-10"
          />
        </Link>

        {/* Details */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2.5">
            {/* Category, Featured & Price Pills */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="bg-[#FFF0E0] text-[#E65C00] font-black text-[10px] uppercase px-3 py-1 rounded-full border border-[#E65C00]/30 shadow-sm">
                  {event.category}
                </span>
                {event.featured && (
                  <span className="bg-[#E65C00] text-white font-black text-[10px] uppercase px-2.5 py-1 rounded-full shadow-sm">
                    FEATURED
                  </span>
                )}
              </div>
              <span className="bg-[#FFF8F0] text-[#E65C00] font-black text-xs px-3 py-1 rounded-full border border-[#E65C00]/30 shadow-sm">
                {displayPrice}
              </span>
            </div>

            <h3 className="text-lg font-bold text-[#3D1A00] group-hover:text-[#E65C00] transition-colors line-clamp-2 font-cinzel">
              <Link href={`/events/${event.id}`}>
                {event.title}
              </Link>
            </h3>
            <p className="text-xs text-[#6B3A2A] mt-2 line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          </div>

          <div className="space-y-2 text-xs text-[#6B3A2A] border-t border-[#E65C00]/15 pt-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#E65C00] shrink-0" />
              <span className="font-semibold text-[#3D1A00]">
                {event.date}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-[#E65C00] shrink-0 mt-0.5" />
              <span className="leading-snug">{event.time}</span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#E65C00] shrink-0 mt-0.5" />
              <div className="leading-snug">
                <span className="font-medium text-[#3D1A00]">{event.venue}</span>
                {event.address && (
                  <span className="block text-[11px] text-[#6B3A2A]/80">{event.address}</span>
                )}
              </div>
            </div>
            {/* <div className="flex items-center gap-2 pt-1 text-[11px]">
              <Users className="w-3.5 h-3.5 text-[#E65C00] shrink-0" />
              <span>{count} / {event.capacity} Confirmed Attendees</span>
            </div> */}
          </div>

          {/* Card Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center gap-2">
              {event.status === 'Past' ? (
                <span className="w-full text-center bg-[#FFF0E0] text-[#6B3A2A] py-2 rounded-xl text-xs font-semibold border border-[#E65C00]/20">
                  Past Event Archived
                </span>
              ) : (
                event.enableRsvp !== false && (
                  <button
                    onClick={() => setModalOpen(true)}
                    className="gold-button flex-1 py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
                  >
                    <Ticket className="w-4 h-4 text-white" />
                    <span>Buy now</span>
                  </button>
                )
              )}

              <button
                onClick={handleWhatsAppShare}
                className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300/60 rounded-xl text-xs transition-colors flex items-center justify-center shrink-0"
                title="Share Event on WhatsApp"
              >
                <img src="/assets/whatsapp.png" alt="WhatsApp" className="w-4 h-4 object-contain" />
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 bg-[#FFF0E0] hover:bg-[#E65C00]/10 text-[#E65C00] border border-[#E65C00]/25 rounded-xl text-xs transition-colors relative"
                title="Copy Event Link"
              >
                <Share2 className="w-4 h-4" />
                {copied && (
                  <span className="absolute -top-8 right-0 bg-[#E65C00] text-white text-[10px] px-2 py-1 rounded border border-[#E65C00]/30 shadow whitespace-nowrap">
                    Link Copied!
                  </span>
                )}
              </button>
            </div>

            {/* Donation & Book Pooja Row */}
            {event.status !== 'Past' && (event.enableSupportPayment !== false || event.enablePooja !== false) && (
              <div className="flex items-center gap-2">
                {event.enableSupportPayment !== false && (
                  <button
                    onClick={() => setDonationModalOpen(true)}
                    className="gold-button flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
                  >
                    <HeartHandshake className="w-3.5 h-3.5 fill-current text-white animate-pulse" />
                    <span>Event Support Payment</span>
                  </button>
                )}
                {event.enablePooja !== false && (
                  <button
                    onClick={() => setPoojaModalOpen(true)}
                    className="gold-button flex-1 py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
                  >
                    <Flame className="w-3.5 h-3.5 fill-current text-white animate-pulse" />
                    <span>Book Pooja</span>
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Event RSVP Modal */}
      {modalOpen && (
        <EventRSVPModal
          event={{
            ...event,
            rsvpCount: count,
          }}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setCount(prev => prev + 1);
            if (onRSVP) onRSVP();
          }}
        />
      )}

      {/* Donation Modal */}
      {donationModalOpen && (
        <DonationModal
          isOpen={donationModalOpen}
          onClose={() => setDonationModalOpen(false)}
          initialCategory="Event Donations"
        />
      )}

      {/* Pooja Booking Modal */}
      {poojaModalOpen && (
        <PoojaBookingModal
          isOpen={poojaModalOpen}
          onClose={() => setPoojaModalOpen(false)}
          event={event}
        />
      )}
    </>
  );
}

