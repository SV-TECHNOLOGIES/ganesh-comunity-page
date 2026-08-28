'use client';

import { useState } from 'react';
import { Calendar, Ticket, User, Mail, Phone, CheckCircle, X, MapPin, Sparkles, Download } from 'lucide-react';

interface EventRSVPModalProps {
  event: {
    id: string;
    title: string;
    date: string;
    time: string;
    venue: string;
    ticketPrice?: number;
  };
  onClose: () => void;
  onSuccess?: () => void;
}

export default function EventRSVPModal({ event, onClose, onSuccess }: EventRSVPModalProps) {
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [attendeePhone, setAttendeePhone] = useState('');
  const [ticketsCount, setTicketsCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [ticketDetails, setTicketDetails] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/events/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          attendeeName,
          attendeeEmail,
          attendeePhone,
          ticketsCount,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setTicketDetails(data.data);
        setConfirmed(true);
        if (onSuccess) onSuccess();
      }
    } catch {
      alert('Failed to process RSVP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="temple-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border-2 border-[#D4AF37] relative space-y-6 shadow-[0_0_50px_rgba(212,175,55,0.3)]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#C9B79C] hover:text-[#F4C542] p-2 rounded-full hover:bg-[#160B08] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!confirmed ? (
          <>
            {/* Modal Header */}
            <div className="space-y-2 border-b border-[#D4AF37]/30 pb-4 pr-8">
              <div className="inline-flex items-center gap-1.5 bg-[#7A1620] text-[#F4C542] px-3 py-1 rounded-full text-[10px] font-black uppercase border border-[#D4AF37]/30">
                <Ticket className="w-3.5 h-3.5" />
                <span>CONFIRM YOUR ENTRY PASS</span>
              </div>
              <h3 className="text-xl font-black font-cinzel text-[#F7EFE1] leading-tight">
                {event.title}
              </h3>
              <div className="text-xs text-[#C9B79C] flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#F4C542]" />
                  <span>{event.date} · {event.time}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#F4C542]" />
                  <span>{event.venue}</span>
                </span>
              </div>
            </div>

            {/* RSVP Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#C9B79C] font-semibold mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    placeholder="e.g. Ramesh Varma"
                    className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl pl-10 pr-4 py-2.5 text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#C9B79C] font-semibold mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={attendeeEmail}
                      onChange={(e) => setAttendeeEmail(e.target.value)}
                      placeholder="ramesh@example.co.uk"
                      className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl pl-10 pr-4 py-2.5 text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#C9B79C] font-semibold mb-1">UK Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={attendeePhone}
                      onChange={(e) => setAttendeePhone(e.target.value)}
                      placeholder="+44 7900 123456"
                      className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl pl-10 pr-4 py-2.5 text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#C9B79C] font-semibold mb-1">Number of Passes Needed</label>
                <select
                  value={ticketsCount}
                  onChange={(e) => setTicketsCount(Number(e.target.value))}
                  className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none font-bold"
                >
                  <option value={1}>1 Ticket Pass</option>
                  <option value={2}>2 Ticket Passes (Family)</option>
                  <option value={3}>3 Ticket Passes</option>
                  <option value={4}>4 Ticket Passes</option>
                  <option value={5}>5 Ticket Passes (Group)</option>
                </select>
              </div>

              <div className="bg-[#160B08] p-4 rounded-2xl border border-[#D4AF37]/30 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[#C9B79C] block">Ticket Price:</span>
                  <span className="font-extrabold text-[#F4C542] text-sm">
                    {event.ticketPrice ? `£${event.ticketPrice * ticketsCount}` : 'FREE (Complimentary)'}
                  </span>
                </div>
                <span className="text-[10px] text-[#C9B79C] italic">Mahaprasadam included</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="gold-button w-full py-3.5 rounded-full font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#0D0705]" />
                <span>{submitting ? 'Confirming Pass...' : 'Confirm RSVP & Issue Pass'}</span>
              </button>
            </form>
          </>
        ) : (
          /* RSVP Pass Confirmation Card */
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-full bg-[#7A1620] border-2 border-[#D4AF37] flex items-center justify-center mx-auto text-[#F4C542]">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black font-cinzel text-[#F4C542] tracking-widest uppercase block">
                RSVP CONFIRMED!
              </span>
              <h3 className="text-xl font-black font-cinzel text-[#F7EFE1]">
                {event.title}
              </h3>
              <p className="text-xs text-[#C9B79C]">
                Your entry pass has been registered and emailed to <strong className="text-[#F7EFE1]">{attendeeEmail}</strong>.
              </p>
            </div>

            {/* Digital Pass Stub */}
            <div className="bg-[#160B08] p-5 rounded-2xl border-2 border-dashed border-[#D4AF37]/50 text-left space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-[#D4AF37]/20 pb-2">
                <span className="text-[#C9B79C]">Pass Reference:</span>
                <span className="font-bold text-[#F4C542]">{ticketDetails?.rsvpId || 'MITRA-PASS-108'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C9B79C]">Attendee:</span>
                <span className="font-bold text-[#F7EFE1]">{attendeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C9B79C]">Pass Quantity:</span>
                <span className="font-bold text-[#F4C542]">{ticketsCount} Pass(es)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C9B79C]">Date & Venue:</span>
                <span className="text-right text-[#F7EFE1]">{event.date} · {event.venue}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="gold-button w-full py-3 rounded-full font-black uppercase tracking-wider text-xs"
            >
              Done & Return to Events
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
