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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="temple-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border-2 border-[#E65C00]/40 relative space-y-6 shadow-lg">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#6B3A2A] hover:text-[#E65C00] p-2 rounded-full hover:bg-[#FFF0E0] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!confirmed ? (
          <>
            {/* Modal Header */}
            <div className="space-y-2 border-b border-[#E65C00]/25 pb-4 pr-8">
              <div className="inline-flex items-center gap-1.5 bg-[#FFF0E0] text-[#E65C00] px-3 py-1 rounded-full text-[10px] font-black uppercase border border-[#E65C00]/30 shadow-sm">
                <Ticket className="w-3.5 h-3.5" />
                <span>CONFIRM YOUR ENTRY PASS</span>
              </div>
              <h3 className="text-xl font-black text-[#3D1A00] font-cinzel leading-tight">
                {event.title}
              </h3>
              <div className="text-xs text-[#6B3A2A] flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#E65C00]" />
                  <span>{event.date} · {event.time}</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#E65C00]" />
                  <span>{event.venue}</span>
                </span>
              </div>
            </div>

            {/* RSVP Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#6B3A2A] font-semibold mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#E65C00] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    placeholder="e.g. Ramesh Varma"
                    className="w-full bg-white border border-[#E65C00]/30 rounded-xl pl-10 pr-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#6B3A2A] font-semibold mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#E65C00] absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={attendeeEmail}
                      onChange={(e) => setAttendeeEmail(e.target.value)}
                      placeholder="ramesh@example.co.uk"
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl pl-10 pr-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#6B3A2A] font-semibold mb-1">UK Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#E65C00] absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      required
                      value={attendeePhone}
                      onChange={(e) => setAttendeePhone(e.target.value)}
                      placeholder="+44 7900 123456"
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl pl-10 pr-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#6B3A2A] font-semibold mb-1">Number of Passes Needed</label>
                <select
                  value={ticketsCount}
                  onChange={(e) => setTicketsCount(Number(e.target.value))}
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none font-bold"
                >
                  <option value={1}>1 Ticket Pass</option>
                  <option value={2}>2 Ticket Passes (Family)</option>
                  <option value={3}>3 Ticket Passes</option>
                  <option value={4}>4 Ticket Passes</option>
                  <option value={5}>5 Ticket Passes (Group)</option>
                </select>
              </div>

              <div className="bg-[#FFF0E0] p-4 rounded-2xl border border-[#E65C00]/20 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[#6B3A2A] block">Ticket Price:</span>
                  <span className="font-extrabold text-[#E65C00] text-sm">
                    {event.ticketPrice ? `£${event.ticketPrice * ticketsCount}` : 'FREE (Complimentary)'}
                  </span>
                </div>
                <span className="text-[10px] text-[#6B3A2A] italic font-semibold">Mahaprasadam included</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="gold-button w-full py-3.5 rounded-full font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>{submitting ? 'Confirming Pass...' : 'Confirm RSVP & Issue Pass'}</span>
              </button>
            </form>
          </>
        ) : (
          /* RSVP Pass Confirmation Card */
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-full bg-[#FFF0E0] border-2 border-[#E65C00]/40 flex items-center justify-center mx-auto text-[#E65C00] shadow-sm">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-black font-cinzel text-[#E65C00] tracking-widest uppercase block">
                RSVP CONFIRMED!
              </span>
              <h3 className="text-xl font-black text-[#3D1A00] font-cinzel">
                {event.title}
              </h3>
              <p className="text-xs text-[#6B3A2A]">
                Your entry pass has been registered and emailed to <strong className="text-[#3D1A00]">{attendeeEmail}</strong>.
              </p>
            </div>

            {/* Digital Pass Stub */}
            <div className="bg-[#FFF0E0] p-5 rounded-2xl border-2 border-dashed border-[#E65C00]/30 text-left space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-[#E65C00]/15 pb-2">
                <span className="text-[#6B3A2A]">Pass Reference:</span>
                <span className="font-bold text-[#E65C00]">{ticketDetails?.rsvpId || 'MITRA-PASS-108'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B3A2A]">Attendee:</span>
                <span className="font-bold text-[#3D1A00]">{attendeeName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B3A2A]">Pass Quantity:</span>
                <span className="font-bold text-[#E65C00]">{ticketsCount} Pass(es)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B3A2A]">Date &amp; Venue:</span>
                <span className="text-right text-[#3D1A00]">{event.date} · {event.venue}</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="gold-button w-full py-3 rounded-full font-black uppercase tracking-wider text-xs"
            >
              Done &amp; Return to Events
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
