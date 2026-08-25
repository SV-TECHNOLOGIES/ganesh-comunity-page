'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { EventItem } from '@/lib/types';
import { DataStore } from '@/lib/data-store';
import { trackRSVP } from '@/lib/analytics';
import { Calendar, MapPin, Clock, Users, CheckCircle, Share2 } from 'lucide-react';

export default function EventCard({ event, onRSVP }: { event: EventItem; onRSVP?: () => void }) {
  const [rsvped, setRsvped] = useState(false);
  const [count, setCount] = useState(event.rsvpCount);
  const [copied, setCopied] = useState(false);

  const handleRSVP = (e: React.MouseEvent) => {
    e.preventDefault();
    if (rsvped) return;
    const updatedCount = DataStore.rsvpEvent(event.id);
    setCount(updatedCount);
    setRsvped(true);
    trackRSVP(event.id, event.title);
    if (onRSVP) onRSVP();
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.origin + `/events/${event.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group">
      {/* Banner & Category Pill */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Image
          src={event.bannerUrl}
          alt={event.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-ukta-red text-white font-bold text-xs px-3 py-1 rounded-full shadow">
            {event.category}
          </span>
          {event.featured && (
            <span className="bg-ukta-gold text-ukta-navy font-black text-xs px-2.5 py-1 rounded-full shadow">
              FEATURED
            </span>
          )}
        </div>

        <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-ukta-navy/90 backdrop-blur text-ukta-red dark:text-ukta-gold font-black text-xs px-3 py-1 rounded-full border border-ukta-gold/30">
          {event.ticketPrice === 0 ? 'FREE ADMISSION' : `£${event.ticketPrice}`}
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-ukta-red dark:group-hover:text-ukta-gold transition-colors line-clamp-2">
            <Link href={`/events/${event.id}`}>{event.title}</Link>
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-ukta-red dark:text-ukta-gold shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">{new Date(event.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-ukta-red dark:text-ukta-gold shrink-0" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-ukta-red dark:text-ukta-gold shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Users className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{count} / {event.capacity} RSVPs Confirmed</span>
          </div>
        </div>

        {/* Card Buttons */}
        <div className="flex items-center gap-2 pt-2">
          {event.status === 'Past' ? (
            <span className="w-full text-center bg-slate-100 dark:bg-slate-800 text-slate-500 py-2 rounded-xl text-xs font-semibold">
              Past Event Archived
            </span>
          ) : (
            <button
              onClick={handleRSVP}
              disabled={rsvped}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow ${
                rsvped
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-ukta-red hover:bg-ukta-red-dark text-white'
              }`}
            >
              {rsvped ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>RSVP Confirmed</span>
                </>
              ) : (
                <span>Register / RSVP Now</span>
              )}
            </button>
          )}

          <button
            onClick={handleShare}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs transition-colors relative"
            title="Share Event Link"
          >
            <Share2 className="w-4 h-4" />
            {copied && (
              <span className="absolute -top-8 right-0 bg-black text-white text-[10px] px-2 py-1 rounded shadow whitespace-nowrap">
                Link Copied!
              </span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
