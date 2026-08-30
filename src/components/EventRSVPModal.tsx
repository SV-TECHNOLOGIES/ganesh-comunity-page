'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Calendar, Ticket, User, Mail, Phone, CheckCircle, X, MapPin, Sparkles, Clock, Check, Users, ShieldCheck, Key } from 'lucide-react';

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

const FESTIVAL_DATES = [
  { id: '13-sep', date: '13 Sep (Sun)', title: 'Ganapathi Agamana & Sthapana' },
  { id: '14-sep', date: '14 Sep (Mon)', title: 'Maha Ganapati Chaturthi' },
  { id: '15-sep', date: '15 Sep (Tue)', title: 'Vidya & Arogya Ganapati' },
  { id: '16-sep', date: '16 Sep (Wed)', title: 'Lakshmi Ganapati' },
  { id: '17-sep', date: '17 Sep (Thu)', title: 'Korikala Ganapati' },
  { id: '18-sep', date: '18 Sep (Fri)', title: 'Bhakti Ganapati' },
  { id: '19-sep', date: '19 Sep (Sat)', title: 'Utsava Ganapati & Visarjan' },
];

export default function EventRSVPModal({ event, onClose, onSuccess }: EventRSVPModalProps) {
  const { user, login } = useAuth();

  const [attendeeName, setAttendeeName] = useState(user?.fullName || '');
  const [attendeeEmail, setAttendeeEmail] = useState(user?.email || '');
  const [attendeePhone, setAttendeePhone] = useState(user?.phone || '');
  const [travellingFrom, setTravellingFrom] = useState('');
  
  // Date selection state (supports multiple dates)
  const [selectedDates, setSelectedDates] = useState<string[]>(['14 Sep (Mon)']);
  
  // Adults & Children passes count
  const [adultsCount, setAdultsCount] = useState<number>(1);
  const [childrenCount, setChildrenCount] = useState<number>(0);

  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  const [wasNewUser, setWasNewUser] = useState(false);

  // Sync if user logs in or is already logged in
  useEffect(() => {
    if (user) {
      if (!attendeeName && user.fullName) setAttendeeName(user.fullName);
      if (!attendeeEmail && user.email) setAttendeeEmail(user.email);
      if (!attendeePhone && user.phone) setAttendeePhone(user.phone);
    }
  }, [user]);

  const totalTickets = adultsCount + childrenCount;

  const toggleDate = (dateStr: string) => {
    setSelectedDates((prev) =>
      prev.includes(dateStr)
        ? prev.filter((d) => d !== dateStr)
        : [...prev, dateStr]
    );
  };

  const selectAllDates = () => {
    if (selectedDates.length === FESTIVAL_DATES.length) {
      setSelectedDates(['14 Sep (Mon)']);
    } else {
      setSelectedDates(FESTIVAL_DATES.map((d) => d.date));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDates.length === 0) {
      alert('Please select at least one date for free Darshan.');
      return;
    }
    if (totalTickets < 1) {
      alert('Please select at least 1 attendee pass.');
      return;
    }

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
          travellingFrom,
          ticketsCount: totalTickets,
          adultsCount,
          childrenCount,
          selectedDates,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setTicketDetails(data.data);
        setWasNewUser(Boolean(data.isNewUser));

        // Automatically log in the user via AuthContext
        if (data.user) {
          login(data.user);
        }

        setConfirmed(true);
        if (onSuccess) onSuccess();
      } else {
        alert(data.error || 'Failed to process RSVP. Please try again.');
      }
    } catch {
      alert('Failed to process RSVP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="temple-card max-w-xl w-full p-6 sm:p-8 rounded-3xl border-2 border-[#E65C00]/40 relative space-y-6 shadow-xl my-8 max-h-[90vh] overflow-y-auto">
        
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
                <span>CONFIRM YOUR FREE ENTRY PASS</span>
              </div>
              <h3 className="text-xl font-black text-[#3D1A00] font-cinzel leading-tight">
                {event.title}
              </h3>
              <div className="text-xs text-[#6B3A2A] flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#E65C00]" />
                  <span>13 to 19 September 2026</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#E65C00]" />
                  <span>Mon–Fri: 6-9 PM | Sat: 11 AM-3 PM</span>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#E65C00]" />
                  <span>E Block, SLOUGH &amp; LANGLEY COLLEGE Langley Road, SL3 8GW</span>
                </span>
              </div>
            </div>

            {/* RSVP Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Select Multiple Dates */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[#6B3A2A] font-bold">
                    Select Darshan Date(s) (13th to 19th Sep) *
                  </label>
                  <button
                    type="button"
                    onClick={selectAllDates}
                    className="text-[11px] font-bold text-[#E65C00] hover:underline"
                  >
                    {selectedDates.length === FESTIVAL_DATES.length ? 'Clear All' : 'Select All 7 Days'}
                  </button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {FESTIVAL_DATES.map((item) => {
                    const isSelected = selectedDates.includes(item.date);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleDate(item.date)}
                        className={`p-2.5 rounded-xl border text-left transition-all flex items-start gap-2 ${
                          isSelected
                            ? 'bg-[#FFF0E0] border-[#E65C00] text-[#E65C00] ring-1 ring-[#E65C00] shadow-sm'
                            : 'bg-white border-[#E65C00]/25 text-[#3D1A00] hover:border-[#E65C00]/60'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-md shrink-0 flex items-center justify-center mt-0.5 border ${
                          isSelected ? 'bg-[#E65C00] border-[#E65C00] text-white' : 'border-[#6B3A2A]/40'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs leading-tight">{item.date}</p>
                          <p className="text-[9px] text-[#6B3A2A] truncate mt-0.5">{item.title}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Number of Adults and Children */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FFF0E0]/50 p-3.5 rounded-2xl border border-[#E65C00]/20">
                <div>
                  <label className="block text-[#6B3A2A] font-bold mb-1">Number of Adults *</label>
                  <select
                    value={adultsCount}
                    onChange={(e) => setAdultsCount(Number(e.target.value))}
                    className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3 py-2 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} Adult{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#6B3A2A] font-bold mb-1">Number of Children</label>
                  <select
                    value={childrenCount}
                    onChange={(e) => setChildrenCount(Number(e.target.value))}
                    className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3 py-2 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none font-bold"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num === 0 ? '0 Children (None)' : `${num} Child${num > 1 ? 'ren' : ''}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Attendee Contact Info */}
              <div>
                <label className="block text-[#6B3A2A] font-semibold mb-1">Full Name *</label>
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
                  <label className="block text-[#6B3A2A] font-semibold mb-1">Email Address *</label>
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
                  <label className="block text-[#6B3A2A] font-semibold mb-1">UK Phone Number *</label>
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

              {/* Where are you travelling from? */}
              <div>
                <label className="block text-[#6B3A2A] font-semibold mb-1">
                  Where are you travelling from? *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#E65C00] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={travellingFrom}
                    onChange={(e) => setTravellingFrom(e.target.value)}
                    placeholder="e.g. Slough, Langley, Hounslow, Reading, London"
                    className="w-full bg-white border border-[#E65C00]/30 rounded-xl pl-10 pr-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                  />
                </div>
                <p className="text-[10px] text-[#6B3A2A]/70 mt-1">
                  Please enter your town/city (e.g., Slough, Langley, Hounslow, Reading, London).
                </p>
              </div>

              {/* Account Benefit Notice */}
              <div className="bg-[#FFF0E0] p-3 rounded-xl border border-[#E65C00]/25 flex items-center gap-2 text-[11px] text-[#6B3A2A]">
                <ShieldCheck className="w-4 h-4 text-[#E65C00] shrink-0" />
                <span>
                  Automatic guest registration will activate your membership pass &amp; email your login password.
                </span>
              </div>

              {/* Pass Summary Bar */}
              <div className="bg-[#FFF0E0] p-4 rounded-2xl border border-[#E65C00]/20 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[#6B3A2A] block font-medium">Total Passes &amp; Price:</span>
                  <span className="font-extrabold text-[#E65C00] text-sm">
                    {totalTickets} Free Pass{totalTickets > 1 ? 'es' : ''} ({adultsCount} Adult{adultsCount > 1 ? 's' : ''}{childrenCount > 0 ? `, ${childrenCount} Child${childrenCount > 1 ? 'ren' : ''}` : ''})
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
                <span>{submitting ? 'Confirming Passes...' : `Confirm RSVP for ${totalTickets} Pass${totalTickets > 1 ? 'es' : ''}`}</span>
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
                Your entry pass has been registered and sent to <strong className="text-[#3D1A00]">{attendeeEmail}</strong>.
              </p>
            </div>

            {/* Auto Login & Password Notice */}
            <div className="bg-emerald-50 border border-emerald-500/30 p-3.5 rounded-2xl text-xs text-emerald-800 text-left flex items-start gap-2.5">
              <Key className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <strong className="block text-emerald-900 font-bold">
                  {wasNewUser ? '🎉 Account Created & Logged In!' : '✓ Logged in as MITRA Member'}
                </strong>
                <p className="text-[11px] text-emerald-700">
                  {wasNewUser
                    ? `Your MITRA Member Account has been activated and your temporary login password has been emailed to ${attendeeEmail}. You are now logged in.`
                    : `You are logged in with your MITRA account (${attendeeEmail}). You can view your pass anytime in your member portal.`}
                </p>
              </div>
            </div>

            {/* Digital Pass Stub */}
            <div className="bg-[#FFF0E0] p-5 rounded-2xl border-2 border-dashed border-[#E65C00]/30 text-left space-y-3 font-mono text-xs">
              <div className="flex justify-between border-b border-[#E65C00]/15 pb-2">
                <span className="text-[#6B3A2A]">Pass Reference:</span>
                <span className="font-bold text-[#E65C00]">{ticketDetails?.rsvpId || 'MITRA-PASS-108'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B3A2A]">Attendee Name:</span>
                <span className="font-bold text-[#3D1A00]">{attendeeName}</span>
              </div>
              {travellingFrom && (
                <div className="flex justify-between">
                  <span className="text-[#6B3A2A]">Travelling From:</span>
                  <span className="font-bold text-[#E65C00]">{travellingFrom}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#6B3A2A]">Pass Breakdown:</span>
                <span className="font-bold text-[#E65C00]">{adultsCount} Adult(s), {childrenCount} Child(ren) ({totalTickets} Total)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B3A2A]">Darshan Dates:</span>
                <span className="text-right text-[#3D1A00] font-semibold">{selectedDates.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B3A2A]">Venue &amp; Address:</span>
                <span className="text-right text-[#3D1A00]">E Block, SLOUGH &amp; LANGLEY COLLEGE (SL3 8GW)</span>
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
