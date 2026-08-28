'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataStore } from '@/lib/data-store';
import { trackDonation } from '@/lib/analytics';
import Link from 'next/link';
import {
  Flame,
  CheckCircle2,
  Lock,
  X,
  Calendar,
  UserCheck,
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
import { SITE_CONFIG } from '@/config/site-config';
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

type Step = 'details' | 'payment' | 'success';

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

      const newDonation = DataStore.addDonation({
        donorName: devoteeName,
        donorEmail: devoteeEmail,
        amount,
        currency: 'GBP',
        cause,
        paymentMethod: 'Card',
      });
      trackDonation(amount, cause);
      onSuccess(newDonation.receiptNo);
    }

    setProcessing(false);
  };

  return (
    <form onSubmit={handleConfirm} className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        disabled={processing}
        className="flex items-center gap-1.5 text-xs text-[#C9B79C] hover:text-[#F4C542] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Change booking details</span>
      </button>

      <div className="bg-[#160B08] border border-[#D4AF37]/40 rounded-2xl p-4 flex items-center justify-between">
        <div className="space-y-0.5 max-w-[220px]">
          <span className="block text-xs font-bold text-[#F4C542]">Pooja Seva Booking</span>
          <span className="block text-[11px] text-[#C9B79C] truncate">{cause}</span>
        </div>
        <span className="text-2xl font-black font-cinzel text-[#F4C542]">£{amount}.00</span>
      </div>

      <PaymentElement
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
        }}
      />

      {paymentError && (
        <div className="bg-red-950/80 border border-red-500/50 text-red-200 text-xs p-3 rounded-xl flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{paymentError}</span>
        </div>
      )}

      <div className="text-[11px] text-[#C9B79C] flex items-center justify-center gap-1.5">
        <Lock className="w-3.5 h-3.5 text-emerald-400" />
        <span>PCI-DSS Encrypted · Powered by Stripe</span>
      </div>

      <button
        type="submit"
        disabled={!stripe || !elements || processing}
        className="gold-button w-full py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 text-[#0D0705] animate-spin" />
            <span>Confirming Sacred Booking...</span>
          </>
        ) : (
          <>
            <Flame className="w-4 h-4 fill-current text-[#0D0705]" />
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
  const { user, isLoggedIn } = useAuth();

  const [selectedDateId, setSelectedDateId] = useState<string>(initialDateId || 'day-2');
  const [devoteeName, setDevoteeName] = useState('');
  const [gotram, setGotram] = useState('');
  const [familyMembers, setFamilyMembers] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [specialWishes, setSpecialWishes] = useState('');

  const [step, setStep] = useState<Step>('details');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<StripeType | null> | null>(null);
  const [receipt, setReceipt] = useState<DonationRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Sync initial date if passed
  useEffect(() => {
    if (initialDateId) {
      setSelectedDateId(initialDateId);
    }
  }, [initialDateId]);

  // Pre-fill user data from session
  useEffect(() => {
    if (isOpen && user) {
      if (user.fullName && !devoteeName) setDevoteeName(user.fullName);
      if (user.email && !email) setEmail(user.email);
      if (user.phone && !phone) setPhone(user.phone);
    }
  }, [isOpen, user]);

  // Reset modal state on close
  useEffect(() => {
    if (!isOpen) {
      setStep('details');
      setClientSecret(null);
      setSessionError(null);
      setReceipt(null);
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

  const selectedDateObj = POOJA_DATES.find((d) => d.id === selectedDateId) || POOJA_DATES[1];
  const poojaAmount = 116;

  const getCauseDescription = useCallback(() => {
    return `Pooja Booking: ${selectedDateObj.date} (${selectedDateObj.title}) - £116 Fixed | Gotram: ${gotram || 'N/A'} | Devotee: ${devoteeName}`;
  }, [selectedDateObj, gotram, devoteeName]);

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!devoteeName || !email) return;

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
    theme: 'night' as const,
    variables: {
      colorPrimary: '#F4C542',
      colorBackground: '#0D0705',
      colorText: '#F7EFE1',
      colorDanger: '#ef4444',
      fontFamily: 'ui-sans-serif, system-ui, sans-serif',
      borderRadius: '12px',
    },
    rules: {
      '.Input': { border: '1px solid rgba(212,175,55,0.4)', padding: '10px 14px' },
      '.Input:focus': { border: '1px solid #F4C542', boxShadow: '0 0 0 2px rgba(244,197,66,0.2)' },
      '.Tab': { border: '1px solid rgba(212,175,55,0.3)', backgroundColor: '#160B08' },
      '.Tab--selected': { border: '1px solid #D4AF37', backgroundColor: '#7A1620' },
      '.Label': { color: '#C9B79C', fontWeight: '600', fontSize: '11px' },
    },
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div
        className="rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl border-2 border-[#D4AF37]/50 relative max-h-[92vh] overflow-y-auto"
        style={{ background: '#0D0705' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#C9B79C] hover:text-[#F4C542] p-1.5 rounded-full hover:bg-white/5 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── SUCCESS ───────────────────────────────────────────────────── */}
        {step === 'success' && receipt ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-emerald-950/80 text-emerald-400 border border-emerald-500/50 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black font-cinzel gold-foil-text">
                Pooja Booking Confirmed!
              </h2>
              <p className="text-xs text-[#C9B79C]">
                May Lord Maha Ganapathi bestow eternal blessings, health, and prosperity upon your family.
              </p>
            </div>

            <div className="bg-[#160B08] p-5 rounded-2xl border border-[#D4AF37]/30 text-left space-y-2.5 text-xs">
              <div className="flex justify-between border-b border-[#D4AF37]/20 pb-2">
                <span className="text-[#C9B79C]">Pooja Booking Receipt:</span>
                <span className="font-mono font-bold text-[#F4C542]">{receipt.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C9B79C]">Selected Day:</span>
                <span className="font-bold text-[#F4C542]">{selectedDateObj.date} ({selectedDateObj.day})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C9B79C]">Ritual Deity:</span>
                <span className="font-semibold text-[#F7EFE1]">{selectedDateObj.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C9B79C]">Devotee / Yajamani:</span>
                <span className="font-semibold text-[#F7EFE1]">{receipt.donorName}</span>
              </div>
              {gotram && (
                <div className="flex justify-between">
                  <span className="text-[#C9B79C]">Gotram:</span>
                  <span className="font-semibold text-[#F7EFE1]">{gotram}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-[#D4AF37]/20 pt-2">
                <span className="text-[#C9B79C]">Pooja Seva Amount:</span>
                <span className="font-black text-base text-emerald-400">£{receipt.amount}.00 GBP</span>
              </div>
            </div>

            <p className="text-[11px] text-[#C9B79C]">
              A formal Priest Sankalpam confirmation and Stripe invoice have been emailed to{' '}
              <strong className="text-[#F4C542]">{receipt.donorEmail}</strong>
            </p>

            <button
              onClick={() => { setReceipt(null); setStep('details'); onClose(); }}
              className="gold-button w-full py-3.5 rounded-full text-xs font-black uppercase tracking-wider"
            >
              Done / Return to Portal
            </button>
          </div>

        /* ── NOT LOGGED IN ──────────────────────────────────────────────── */
        ) : !isLoggedIn ? (
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 bg-[#7A1620] text-[#F4C542] rounded-full flex items-center justify-center mx-auto border-2 border-[#D4AF37] shadow-xl">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black font-cinzel gold-foil-text">
                LOGIN REQUIRED FOR POOJA BOOKING
              </h2>
              <p className="text-xs text-[#C9B79C] max-w-sm mx-auto leading-relaxed">
                Please sign in to your MITRA UK Member account to complete your sacred Maha Ganapathi Pooja Booking (£116) and record your Gotram Sankalpam.
              </p>
            </div>

            {SITE_CONFIG.SHOW_DEMO_CREDENTIALS && (
              <div className="bg-[#160B08] p-4 rounded-2xl border border-[#D4AF37]/30 text-xs space-y-1 text-center">
                <span className="text-[#F4C542] font-bold block">Quick Demo Member Credentials:</span>
                <div className="text-[#C9B79C] text-[11px]">
                  Email: <code className="text-[#F7EFE1]">{SITE_CONFIG.DEMO_MEMBER_EMAIL}</code> | Password:{' '}
                  <code className="text-[#F7EFE1]">{SITE_CONFIG.DEMO_MEMBER_PASSWORD}</code>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Link
                href="/login"
                onClick={onClose}
                className="gold-button w-full py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl"
              >
                <UserCheck className="w-4 h-4 text-[#0D0705]" />
                <span>Go to Member Login &rarr;</span>
              </Link>
            </div>
          </div>

        /* ── STEP 1: POOJA DETAILS FORM ─────────────────────────────────── */
        ) : step === 'details' ? (
          <form onSubmit={handleDetailsSubmit} className="space-y-4 sm:space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[#D4AF37]/30 pb-3">
              <div className="p-3 bg-[#7A1620] text-[#F4C542] rounded-2xl shadow border border-[#D4AF37]/40">
                <Flame className="w-6 h-6 fill-current text-[#F4C542]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black font-cinzel gold-foil-text">
                    SACRED POOJA BOOKING
                  </h2>
                  <span className="bg-[#D4AF37] text-[#0D0705] text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                    £116 SEVA
                  </span>
                </div>
                <p className="text-xs text-[#C9B79C]">
                  London Ganesh Mahotsav 2026 · Slough Langley
                </p>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-[#F4C542] uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>1. Select Festival Pooja Date</span>
                </label>
                <span className="text-[10px] text-[#C9B79C]">7 Divine Days</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                {POOJA_DATES.map((item) => {
                  const isSelected = selectedDateId === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedDateId(item.id)}
                      className={`p-3 rounded-2xl text-left transition-all border relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#7A1620] to-[#9C1F2E] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.3)] ring-1 ring-[#F4C542]'
                          : 'bg-[#160B08] hover:bg-[#1f100c] border-[#D4AF37]/20 hover:border-[#F4C542]/50'
                      }`}
                    >
                      {item.badge && (
                        <span className={`absolute top-2 right-2 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase ${
                          isSelected ? 'bg-[#D4AF37] text-[#0D0705]' : 'bg-[#7A1620] text-[#F4C542] border border-[#D4AF37]/30'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className={`text-xs font-black font-cinzel ${isSelected ? 'text-[#F4C542]' : 'text-[#F7EFE1]'}`}>
                            {item.date}
                          </span>
                          <span className="text-[10px] font-medium text-[#C9B79C]">
                            ({item.day})
                          </span>
                        </div>
                        <h4 className={`text-xs font-bold mt-0.5 leading-snug ${isSelected ? 'text-white' : 'text-[#F7EFE1]'}`}>
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-[#C9B79C] line-clamp-1 mt-0.5">
                          {item.theme}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Day Banner */}
              <div className="mt-2 bg-[#160B08]/90 border border-[#D4AF37]/40 rounded-xl p-2.5 text-[11px] flex items-center justify-between">
                <div>
                  <span className="text-[#C9B79C]">Selected Ritual: </span>
                  <strong className="text-[#F4C542]">{selectedDateObj.date} · {selectedDateObj.title}</strong>
                  <div className="text-[10px] text-[#C9B79C] italic">{selectedDateObj.blessing}</div>
                </div>
                <span className="text-xs font-black text-[#F4C542] font-cinzel shrink-0">£116.00</span>
              </div>
            </div>

            {/* Devotee Details */}
            <div className="space-y-3 pt-1">
              <label className="block text-xs font-bold text-[#F4C542] uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" />
                <span>2. Sankalpam & Devotee Information</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#C9B79C] mb-1">
                    Primary Devotee / Yajamani Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suresh Kumar"
                    value={devoteeName}
                    onChange={(e) => setDevoteeName(e.target.value)}
                    className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#C9B79C] mb-1">
                    Family Gotram (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kasyapa, Bharadwaja"
                    value={gotram}
                    onChange={(e) => setGotram(e.target.value)}
                    className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#C9B79C] mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#F4C542]" />
                  <span>Family Member Names & Nakshatrams for Priest Sankalpam (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Priya (Rohini), Aryan (Revathi)"
                  value={familyMembers}
                  onChange={(e) => setFamilyMembers(e.target.value)}
                  className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#C9B79C] mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#F4C542]" />
                    <span>Email Address (for Receipt) *</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="devotee@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#C9B79C] mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#F4C542]" />
                    <span>Phone / WhatsApp (for Updates) *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+44 7000 000000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl px-3 py-2 text-xs text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Inclusions Note */}
            <div className="bg-[#160B08] p-3 rounded-xl border border-[#D4AF37]/30 text-[11px] text-[#C9B79C] space-y-1">
              <div className="font-bold text-[#F4C542] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pooja Seva Includes:</span>
              </div>
              <p className="text-[10px] leading-relaxed">
                Personalized Archana with your Gotram/Names chanted by Head Vedic Priests, special sanctum Darshan badge, and consecrated Maha Prasadam box.
              </p>
            </div>

            {/* Session Error */}
            {sessionError && (
              <div className="bg-red-950/80 border border-red-500/50 text-red-200 text-xs p-3 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{sessionError}</span>
              </div>
            )}

            <div className="text-[11px] text-[#C9B79C] flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>PCI-DSS Encrypted · Powered by Stripe</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="gold-button w-full py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 text-[#0D0705] animate-spin" />
                  <span>Preparing Secure Payment...</span>
                </>
              ) : (
                <>
                  <Flame className="w-4 h-4 fill-current text-[#0D0705]" />
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
            <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="text-lg font-black text-[#F4C542]">Stripe Not Configured</h3>
            <p className="text-xs text-[#C9B79C]">
              Please add your Stripe API keys in{' '}
              <strong className="text-[#F4C542]">Admin → Payments → Stripe Account Config</strong>, then restart the server.
            </p>
            <button
              onClick={onClose}
              className="text-xs text-[#C9B79C] hover:text-[#F4C542] underline"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
