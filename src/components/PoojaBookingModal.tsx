'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { trackDonation } from '@/lib/analytics';
import {
  Flame,
  CheckCircle2,
  Lock,
  X,
  Calendar,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Sparkles,
  Users,
  Phone,
  Mail,
  User,
  HeartHandshake
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DonationRecord } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';
import { loadStripe, Stripe as StripeType } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// ── 7 Sacred Pooja Days ──────────────────────────────────────────────────────

export interface PoojaDateOption {
  id: string;
  date: string;
  day: string;
  title: string;
  theme: string;
  blessing: string;
  badge?: string;
}

export const POOJA_DATES: PoojaDateOption[] = [
  {
    id: 'day-1',
    date: '13th Sep',
    day: 'Sunday',
    title: 'Ganapathi Agamana',
    theme: 'Ganapathi Agamana & Mandapam Preparation',
    blessing: 'Divine Welcome, Sanctum Purification & Auspicious Beginnings',
    badge: 'DAY 1'
  },
  {
    id: 'day-2',
    date: '14th Sep',
    day: 'Monday',
    title: 'Maha Ganapati Prathista',
    theme: 'Ganesh Chaturthi The Grand Beginning',
    blessing: 'Prana Pratishtha, Sacred Maha Sankalpam & Grand Illumination',
    badge: 'GRAND CHATURTHI'
  },
  {
    id: 'day-3',
    date: '15th Sep',
    day: 'Tuesday',
    title: 'Vidya & Arogya Ganapati',
    theme: 'For Wisdom, Education, Health & Wellbeing',
    blessing: 'Academic Success, Mental Clarity, Vitality & Radiant Health',
  },
  {
    id: 'day-4',
    date: '16th Sep',
    day: 'Wednesday',
    title: 'Lakshmi Ganapati',
    theme: 'For Prosperity, Abundance & Success',
    blessing: 'Financial Growth, Business Auspiciousness & Abundance',
  },
  {
    id: 'day-5',
    date: '17th Sep',
    day: 'Thursday',
    title: 'Korikala Ganapati',
    theme: 'For Wishes, Aspirations & Fulfillment',
    blessing: 'Sankalpa Siddhi, Career Milestones & Desire Fulfillment',
  },
  {
    id: 'day-6',
    date: '18th Sep',
    day: 'Friday',
    title: 'Bhakti Ganapati',
    theme: 'For Devotion, Peace & Spiritual Strength',
    blessing: 'Inner Serenity, Family Harmony & Spiritual Elevation',
  },
  {
    id: 'day-7',
    date: '19th Sep',
    day: 'Saturday',
    title: 'Utsava Ganapati & Nimajjanam',
    theme: 'Celebration, Gratitude & Farewell to Bappa',
    blessing: 'Maha Visarjan Blessings, Victory & Eternal Divine Grace',
    badge: 'MAHA VISARJAN'
  }
];

type Step = 'guest-details' | 'details' | 'payment' | 'success';

interface CheckoutFormProps {
  clientSecret: string;
  amount: number;
  devoteeName: string;
  devoteeEmail: string;
  cause: string;
  onSuccess: (receiptId: string) => void;
  onBack: () => void;
}

// ── Inner Stripe Checkout Form ────────────────────────────────────────────────

function CheckoutForm({
  clientSecret,
  amount,
  devoteeName,
  devoteeEmail,
  cause,
  onSuccess,
  onBack,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setPaymentError(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: typeof window !== 'undefined'
          ? `${window.location.origin}/ganesh-event-2026?payment=success`
          : 'https://mitra.org.uk/ganesh-event-2026?payment=success',
        payment_method_data: {
          billing_details: {
            name: devoteeName,
            email: devoteeEmail,
          },
        },
      },
      redirect: 'if_required',
    });

    if (error) {
      setPaymentError(error.message || 'Payment failed. Please try again.');
      setProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
      } catch {}

      const receiptNo = `MITRA-REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      trackDonation(amount, cause);
      onSuccess(receiptNo);
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleConfirm} className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        disabled={processing}
        className="flex items-center gap-1.5 text-xs text-[#6B3A2A] hover:text-[#E65C00] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Change booking details</span>
      </button>

      <div className="bg-[#FFF0E0] border border-[#E65C00]/25 rounded-2xl p-4 flex items-center justify-between">
        <div className="space-y-0.5 max-w-[220px]">
          <span className="block text-xs font-bold text-[#E65C00]">Pooja Seva Booking</span>
          <span className="block text-[11px] text-[#6B3A2A] truncate">{cause}</span>
        </div>
        <span className="text-2xl font-black font-cinzel text-[#E65C00]">£{amount}.00</span>
      </div>

      <PaymentElement
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
        }}
      />

      {paymentError && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-xs p-3 rounded-xl flex items-start gap-2 font-semibold">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{paymentError}</span>
        </div>
      )}

      <div className="text-[11px] text-[#6B3A2A] flex items-center justify-center gap-1.5 font-semibold">
        <Lock className="w-3.5 h-3.5 text-emerald-600" />
        <span>PCI-DSS Encrypted · Powered by Stripe</span>
      </div>

      <button
        type="submit"
        disabled={!stripe || !elements || processing}
        className="gold-button w-full py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 text-white animate-spin" />
            <span>Confirming Sacred Booking...</span>
          </>
        ) : (
          <>
            <Flame className="w-4 h-4 fill-current text-white" />
            <span>Complete Pooja Seva (£{amount}.00)</span>
          </>
        )}
      </button>
    </form>
  );
}

// ── Main PoojaBookingModal ────────────────────────────────────────────────────

export default function PoojaBookingModal({
  isOpen,
  onClose,
  initialDateId,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialDateId?: string;
}) {
  const { user, isLoggedIn, login } = useAuth();

  const [selectedDateId, setSelectedDateId] = useState<string>(initialDateId || 'day-1');
  const [devoteeName, setDevoteeName] = useState('');
  const [gotram, setGotram] = useState('');
  const [familyMembers, setFamilyMembers] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialWishes, setSpecialWishes] = useState('');

  // ── Guest capture state ──────────────────────────────────────────────────
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestSubmitting, setGuestSubmitting] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>('details');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<StripeType | null> | null>(null);
  const [receipt, setReceipt] = useState<DonationRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [dbCounts, setDbCounts] = useState<Record<string, number>>({});

  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch('/api/payments/booking-counts', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.counts) {
        setDbCounts(data.counts);
      }
    } catch (e) {
      console.error('Error fetching booking counts:', e);
    }
  }, []);

  const getBookingCount = useCallback((dateStr: string) => {
    return dbCounts[dateStr] || 0;
  }, [dbCounts]);

  // Sync initial date if passed
  useEffect(() => {
    if (initialDateId) {
      setSelectedDateId(initialDateId);
    }
  }, [initialDateId]);

  // Auto-select first available date if selected one is full
  useEffect(() => {
    if (isOpen && Object.keys(dbCounts).length > 0) {
      const currentSelectedDate = POOJA_DATES.find(d => d.id === selectedDateId);
      if (currentSelectedDate) {
        const count = getBookingCount(currentSelectedDate.date);
        if (count >= 10) {
          // Find first date that is not fully booked
          const availableDate = POOJA_DATES.find(d => getBookingCount(d.date) < 10);
          if (availableDate) {
            setSelectedDateId(availableDate.id);
          }
        }
      }
    }
  }, [isOpen, dbCounts, selectedDateId, getBookingCount]);

  useEffect(() => {
    if (isOpen) {
      fetchCounts();
    }
  }, [isOpen, fetchCounts]);

  // On open: decide starting step based on auth
  useEffect(() => {
    if (isOpen) {
      if (isLoggedIn && user) {
        if (user.fullName) setDevoteeName(user.fullName);
        if (user.email) setEmail(user.email);
        if (user.phone) setPhone(user.phone);
        setStep('details');
      } else {
        setStep('guest-details');
      }
    }
  }, [isOpen, isLoggedIn]);

  // Reset modal state on close
  useEffect(() => {
    if (!isOpen) {
      setStep('details');
      setClientSecret(null);
      setSessionError(null);
      setReceipt(null);
      setGuestError(null);
    }
  }, [isOpen]);

  // Initialise Stripe publishable key
  useEffect(() => {
    if (isOpen && !stripePromise) {
      fetch('/api/payments/get-publishable-key')
        .then((r) => r.json())
        .then((data) => {
          if (data.publishableKey && !data.publishableKey.includes('REPLACE_WITH')) {
            setStripePromise(loadStripe(data.publishableKey));
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  // ── Guest details submit ──────────────────────────────────────────────────
  const handleGuestSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setGuestSubmitting(true);
    setGuestError(null);

    try {
      const res = await fetch('/api/auth/guest-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: guestName.trim(),
          email: guestEmail.trim(),
          phone: guestPhone.trim(),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setGuestError(data.error || 'Could not create your account. Please try again.');
        return;
      }

      // Silently log in
      login(data.user);

      // Pre-fill devotee details
      setDevoteeName(guestName.trim());
      setEmail(guestEmail.trim());
      setPhone(guestPhone.trim());

      // Move to pooja booking details
      setStep('details');
    } catch {
      setGuestError('Network error. Please check your connection and try again.');
    } finally {
      setGuestSubmitting(false);
    }
  }, [guestName, guestEmail, guestPhone, login]);

  const selectedDateObj = POOJA_DATES.find((d) => d.id === selectedDateId) || POOJA_DATES[1];
  const poojaAmount = 116;

  const getCauseDescription = useCallback(() => {
    let desc = `Pooja Booking: ${selectedDateObj.date} (${selectedDateObj.title}) - £116 Fixed | Devotee: ${devoteeName}`;
    if (gotram) desc += ` | Gotram: ${gotram}`;
    if (familyMembers) desc += ` | Priest Sankalpam: ${familyMembers}`;
    return desc;
  }, [selectedDateObj, gotram, devoteeName, familyMembers]);

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devoteeName || !email) return;

    // Double check limit before proceeding to pay
    const count = getBookingCount(selectedDateObj.date);
    if (count >= 10) {
      setSessionError(`Sorry, ${selectedDateObj.date} is now fully booked. Please choose another date.`);
      return;
    }

    setSubmitting(true);
    setSessionError(null);

    try {
      const res = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: poojaAmount,
          customerName: devoteeName,
          customerEmail: email,
          customerPhone: phone,
          description: getCauseDescription(),
          paymentMethod: 'Stripe Card',
          eventId: 'evt-ganesh-chaturthi',
          eventName: 'London Ganesh Mahotsav 2026',
          donationType: 'pooja',
          poojaDate: selectedDateObj.date,
          poojaDay: selectedDateObj.day,
          poojaTitle: selectedDateObj.title,
          gotram: gotram ? gotram.trim() : null,
          familyMembers: familyMembers ? familyMembers.trim() : null,
          specialWishes: specialWishes ? specialWishes.trim() : null,
          primaryDevoteeName: devoteeName ? devoteeName.trim() : null,
        }),
      });

      const data = await res.json();

      if (!data.success || !data.clientSecret) {
        setSessionError(data.error || 'Could not initialise payment. Please try again.');
        return;
      }

      setClientSecret(data.clientSecret);
      setStep('payment');
    } catch {
      setSessionError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = (receiptNo: string) => {
    const syntheticReceipt: DonationRecord = {
      id: `pooja-${Date.now()}`,
      receiptNo,
      donorName: devoteeName,
      donorEmail: email,
      amount: poojaAmount,
      currency: 'GBP',
      cause: `${selectedDateObj.date} ${selectedDateObj.title} Pooja Seva`,
      paymentMethod: 'Card',
      date: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      status: 'Completed',
    };
    setReceipt(syntheticReceipt);
    setStep('success');
  };

  const stripeAppearance = {
    theme: 'flat' as const,
    variables: {
      colorPrimary: '#E65C00',
      colorBackground: '#FFFFFF',
      colorText: '#3D1A00',
      colorDanger: '#ef4444',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      borderRadius: '12px',
    },
    rules: {
      '.Input': { border: '1px solid rgba(230,92,0,0.3)', padding: '10px 14px' },
      '.Input:focus': { border: '1px solid #E65C00', boxShadow: '0 0 0 2px rgba(230,92,0,0.15)' },
      '.Tab': { border: '1px solid rgba(230,92,0,0.2)', backgroundColor: '#FFF0E0' },
      '.Tab--selected': { border: '1px solid #E65C00', backgroundColor: '#FFF0E0' },
      '.Label': { color: '#6B3A2A', fontWeight: '600', fontSize: '11px' },
    },
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className="temple-card rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-xl border-2 border-[#E65C00]/30 relative max-h-[92vh] overflow-y-auto"
        style={{ background: '#FFF8F0' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#6B3A2A] hover:text-[#E65C00] p-1.5 rounded-full hover:bg-white/5 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── SUCCESS ───────────────────────────────────────────────────── */}
        {step === 'success' && receipt ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-[#3D1A00] font-cinzel">
              Pooja Seva Confirmed!
            </h2>
            <p className="text-xs text-[#6B3A2A]">
              May Lord Ganesha shower your family with health, wealth, and obstacles removal.
            </p>

            <div className="bg-[#FFF0E0] p-5 rounded-2xl border border-[#E65C00]/25 text-left space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-[#E65C00]/15 pb-2">
                <span className="text-[#6B3A2A]">Pooja Booking Receipt:</span>
                <span className="font-mono font-bold text-[#E65C00]">{receipt.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B3A2A]">Selected Day:</span>
                <span className="font-bold text-[#E65C00]">{selectedDateObj.date} ({selectedDateObj.day})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B3A2A]">Ritual Deity:</span>
                <span className="font-semibold text-[#3D1A00]">{selectedDateObj.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B3A2A]">Devotee / Yajamani:</span>
                <span className="font-semibold text-[#3D1A00]">{receipt.donorName}</span>
              </div>
              {gotram && (
                <div className="flex justify-between">
                  <span className="text-[#6B3A2A]">Gotram:</span>
                  <span className="font-semibold text-[#3D1A00]">{gotram}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-[#E65C00]/15 pt-2">
                <span className="text-[#6B3A2A]">Pooja Seva Amount:</span>
                <span className="font-black text-base text-emerald-600">£{receipt.amount}.00 GBP</span>
              </div>
            </div>

            <p className="text-[11px] text-[#6B3A2A]">
              A confirmation email with virtual Darshan details has been sent to{' '}
              <strong className="text-[#E65C00]">{receipt.donorEmail}</strong>
            </p>

            <button
              onClick={() => { setReceipt(null); setStep('details'); onClose(); }}
              className="w-full bg-[#E65C00] hover:bg-[#FF7A00] text-white font-bold py-3 rounded-xl text-sm transition-all"
            >
              Done / Return to Portal
            </button>
          </div>

        /* ── GUEST DETAILS (not logged in) ─────────────────────────────── */
        ) : step === 'guest-details' ? (
          <form onSubmit={handleGuestSubmit} className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[#E65C00]/25 pb-3">
              <div className="p-3 bg-[#FFF0E0] text-[#E65C00] rounded-2xl shadow-sm border border-[#E65C00]/30">
                <Flame className="w-6 h-6 fill-current text-[#E65C00]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black font-cinzel gold-foil-text">SACRED POOJA BOOKING</h2>
                  <span className="bg-[#E65C00] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">£116 SEVA</span>
                </div>
                <p className="text-xs text-[#6B3A2A]">Quick details — no account needed</p>
              </div>
            </div>

            {/* Info banner */}
            <div className="bg-[#FFF0E0] border border-[#E65C00]/25 rounded-xl p-3 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#E65C00] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#6B3A2A] leading-relaxed">
                Enter your details below. We'll create your free MITRA account instantly and email your login credentials — then take you straight to your Pooja booking.
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-[#6B3A2A] mb-1.5">
                <User className="w-3.5 h-3.5 text-[#E65C00]" />
                <span>Full Name / Yajamani Name *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Suresh Kumar"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-white border border-[#E65C00]/30 rounded-xl p-2.5 text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
              />
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-[#6B3A2A] mb-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#E65C00]" />
                  <span>Email Address *</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="devotee@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl p-2.5 text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-[#6B3A2A] mb-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#E65C00]" />
                  <span>Phone / WhatsApp *</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+44 7000 000000"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl p-2.5 text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                />
              </div>
            </div>

            {/* Guest error */}
            {guestError && (
              <div className="bg-red-50 border border-red-300 text-red-700 text-xs p-3 rounded-xl flex items-start gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{guestError}</span>
              </div>
            )}

            <div className="text-[11px] text-[#6B3A2A] flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Your details are kept private · PCI-DSS Encrypted</span>
            </div>

            <button
              type="submit"
              disabled={guestSubmitting}
              className="gold-button w-full py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {guestSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                  <span>Setting up your account...</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 fill-current text-white" />
                  <span>Continue to Pooja Booking →</span>
                </>
              )}
            </button>
          </form>

        /* ── STEP 1: POOJA DETAILS FORM ─────────────────────────────────── */
        ) : step === 'details' ? (
          <form onSubmit={handleDetailsSubmit} className="space-y-4 sm:space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[#E65C00]/25 pb-3">
              <div className="p-3 bg-[#FFF0E0] text-[#E65C00] rounded-2xl shadow-sm border border-[#E65C00]/30">
                <Flame className="w-6 h-6 fill-current text-[#E65C00]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black font-cinzel text-[#3D1A00]">
                    SACRED POOJA BOOKING
                  </h2>
                  <span className="bg-[#E65C00] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                    £116 SEVA
                  </span>
                </div>
                <p className="text-xs text-[#6B3A2A]">
                  London Ganesh Mahotsav 2026 · Slough Langley
                </p>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[#E65C00] uppercase tracking-wider flex items-center gap-1.5 font-cinzel">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>1. Select Festival Pooja Date</span>
                </label>
                <span className="text-[10px] text-[#6B3A2A] font-semibold">7 Divine Days</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {POOJA_DATES.map((item) => {
                  const isSelected = selectedDateId === item.id;
                  const count = getBookingCount(item.date);
                  const isFullyBooked = count >= 10;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={isFullyBooked}
                      onClick={() => !isFullyBooked && setSelectedDateId(item.id)}
                      className={`p-3 rounded-2xl text-left transition-all border relative flex flex-col justify-between ${
                        isFullyBooked
                          ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'bg-gradient-to-r from-[#E65C00] to-[#FF7A00] border-[#E65C00] shadow-md ring-1 ring-[#E65C00]'
                          : 'bg-white hover:bg-[#FFF8F0] border-[#E65C00]/20 hover:border-[#E65C00]'
                      }`}
                    >
                      {isFullyBooked ? (
                        <span className="absolute top-2 right-2 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase bg-red-600 text-white">
                          FULLY BOOKED
                        </span>
                      ) : item.badge ? (
                        <span className={`absolute top-2 right-2 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase ${
                          isSelected ? 'bg-white text-[#E65C00]' : 'bg-[#E65C00] text-white'
                        }`}>
                          {item.badge}
                        </span>
                      ) : (
                        <span className={`absolute top-2 right-2 text-[8px] font-bold px-1.5 py-0.5 rounded-md ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-[#E65C00]/10 text-[#E65C00]'
                        }`}>
                          {10 - count} slots left
                        </span>
                      )}
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-xs font-black font-cinzel ${isFullyBooked ? 'text-slate-400 line-through' : isSelected ? 'text-white' : 'text-[#3D1A00]'}`}>
                            {item.date}
                          </span>
                          <span className={`text-[10px] font-medium ${isFullyBooked ? 'text-slate-400' : 'text-[#6B3A2A]'}`}>
                            ({item.day})
                          </span>
                        </div>
                        <h4 className={`text-xs font-bold mt-0.5 leading-snug ${isFullyBooked ? 'text-slate-400' : isSelected ? 'text-white' : 'text-[#3D1A00]'}`}>
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-[#6B3A2A] line-clamp-1 mt-0.5">
                          {isFullyBooked ? 'Bookings Closed' : item.theme}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Day Banner */}
              <div className="mt-2 bg-[#FFF0E0] border border-[#E65C00]/25 rounded-xl p-2.5 text-[11px] flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-[#6B3A2A]">Selected Ritual: </span>
                  <strong className="text-[#E65C00]">{selectedDateObj.date} · {selectedDateObj.title}</strong>
                  <div className="text-[10px] text-[#6B3A2A] italic">{selectedDateObj.blessing}</div>
                </div>
                <span className="text-xs font-black text-[#E65C00] font-cinzel shrink-0">£116.00</span>
              </div>
            </div>

            {/* Devotee Details */}
            <div className="space-y-3 pt-1">
              <label className="block text-xs font-bold text-[#E65C00] uppercase tracking-wider flex items-center gap-1.5 font-cinzel">
                <User className="w-3.5 h-3.5" />
                <span>2. Sankalpam &amp; Devotee Information</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B3A2A] mb-1">
                    Primary Devotee / Yajamani Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suresh Kumar"
                    value={devoteeName}
                    onChange={(e) => setDevoteeName(e.target.value)}
                    className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3 py-2 text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6B3A2A] mb-1">
                    Family Gotram (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kasyapa, Bharadwaja"
                    value={gotram}
                    onChange={(e) => setGotram(e.target.value)}
                    className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3 py-2 text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#6B3A2A] mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#E65C00]" />
                  <span>Family Member Names &amp; Nakshatrams for Priest Sankalpam (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Priya (Rohini), Aryan (Revathi)"
                  value={familyMembers}
                  onChange={(e) => setFamilyMembers(e.target.value)}
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3 py-2 text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6B3A2A] mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#E65C00]" />
                    <span>Email Address (for Receipt) *</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="devotee@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3 py-2 text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#6B3A2A] mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#E65C00]" />
                    <span>Phone / WhatsApp (for Updates) *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+44 7000 000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3 py-2 text-xs text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                  />
                </div>
              </div>
            </div>

            {/* Inclusions Note */}
            <div className="bg-[#FFF0E0] p-3 rounded-xl border border-[#E65C00]/25 text-[11px] text-[#6B3A2A] space-y-1">
              <div className="font-bold text-[#E65C00] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pooja Seva Includes:</span>
              </div>
              <p className="text-[10px] leading-relaxed">
                Personalized Archana with your Gotram/Names chanted by Head Vedic Priests, special sanctum Darshan badge, and consecrated Maha Prasadam box.
              </p>
            </div>

            {/* Session Error */}
            {sessionError && (
              <div className="bg-red-50 border border-red-300 text-red-700 text-xs p-3 rounded-xl flex items-start gap-2 font-semibold">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{sessionError}</span>
              </div>
            )}

            <div className="text-[11px] text-[#6B3A2A] flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>PCI-DSS Encrypted · Powered by Stripe</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="gold-button w-full py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 text-white animate-spin" />
                  <span>Preparing Secure Payment...</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 fill-current text-white" />
                  <span>Proceed to Pay £116 for {selectedDateObj.date}</span>
                </>
              )}
            </button>
          </form>

        /* ── STEP 2: STRIPE PAYMENT ELEMENT ────────────────────────────── */
        ) : step === 'payment' && clientSecret && stripePromise ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: stripeAppearance,
            }}
          >
            <CheckoutForm
              clientSecret={clientSecret}
              amount={poojaAmount}
              devoteeName={devoteeName}
              devoteeEmail={email}
              cause={`${selectedDateObj.date} ${selectedDateObj.title} Pooja Seva (£116)`}
              onSuccess={handlePaymentSuccess}
              onBack={() => { setStep('details'); setClientSecret(null); }}
            />
          </Elements>
        ) : (
          /* Fallback: Stripe not configured */
          <div className="text-center py-8 space-y-4">
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
            <h3 className="text-lg font-black text-[#E65C00]">Stripe Not Configured</h3>
            <p className="text-xs text-[#6B3A2A]">
              Please add your Stripe API keys in{' '}
              <strong className="text-[#E65C00]">Admin → Payments → Stripe Account Config</strong>, then restart the server.
            </p>
            <button
              onClick={onClose}
              className="text-xs text-[#6B3A2A] hover:text-[#E65C00] underline"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
