'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataStore } from '@/lib/data-store';
import { trackDonation } from '@/lib/analytics';
import {
  Heart,
  CheckCircle2,
  Lock,
  X,
  Utensils,
  Calendar,
  ArrowLeft,
  AlertCircle,
  Loader2,
  User,
  Mail,
  Phone,
  Sparkles,
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

// ── Types ────────────────────────────────────────────────────────────────────

type Category = 'Annadanam' | 'Event Donations';
type Step = 'guest-details' | 'details' | 'payment' | 'success';

interface CheckoutFormProps {
  clientSecret: string;
  amount: number;
  donorName: string;
  donorEmail: string;
  cause: string;
  onSuccess: (receiptId: string) => void;
  onBack: () => void;
}

// ── Inner Stripe Checkout Form ────────────────────────────────────────────────

function CheckoutForm({
  clientSecret,
  amount,
  donorName,
  donorEmail,
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

    // please include the logged in member id as well hear 
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: typeof window !== 'undefined'
          ? `${window.location.origin}/donate?payment=success`
          : 'https://mitra.org.uk/donate?payment=success',
        payment_method_data: {
          billing_details: {
            name: donorName,
            email: donorEmail,
          },
        },
      },
      redirect: 'if_required', // Avoid page redirect for card payments
    });

    if (error) {
      setPaymentError(error.message || 'Payment failed. Please try again.');
      setProcessing(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}

      // Record locally for the receipt screen (DB will be updated via webhook)
      const newDonation = DataStore.addDonation({
        donorName,
        donorEmail,
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
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        disabled={processing}
        className="flex items-center gap-1.5 text-xs text-[#C9B79C] hover:text-[#F4C542] transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Change details</span>
      </button>

      {/* Amount summary */}
      <div className="bg-[#160B08] border border-[#D4AF37]/40 rounded-2xl p-4 flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="block text-xs font-bold text-[#F4C542]">Total Payment</span>
          <span className="block text-[11px] text-[#C9B79C] truncate max-w-[200px]">{cause}</span>
        </div>
        <span className="text-2xl font-black font-cinzel text-[#F4C542]">£{amount}.00</span>
      </div>

      {/* Stripe Payment Element */}
      <PaymentElement
        options={{
          layout: 'tabs',
          paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
        }}
      />

      {/* Error message */}
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
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <Heart className="w-4 h-4 fill-current text-[#0D0705]" />
            <span>Pay £{amount}.00 Securely</span>
          </>
        )}
      </button>
    </form>
  );
}

// ── Main DonationModal ────────────────────────────────────────────────────────

export default function DonationModal({
  isOpen,
  onClose,
  initialCategory = 'Annadanam',
}: {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: Category;
}) {
  const { user, isLoggedIn, login } = useAuth();

  // ── Guest capture state ──────────────────────────────────────────────────
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestSubmitting, setGuestSubmitting] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);

  // ── Form state ───────────────────────────────────────────────────────────
  const [category, setCategory] = useState<Category>(initialCategory);
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');

  // ── Flow state ───────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('details');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripePromise, setStripePromise] = useState<Promise<StripeType | null> | null>(null);
  const [receipt, setReceipt] = useState<DonationRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // On open: decide starting step based on auth
  useEffect(() => {
    if (isOpen) {
      if (isLoggedIn && user) {
        // Already logged in — pre-fill and go straight to donation details
        if (user.fullName) setDonorName(user.fullName);
        if (user.email) setDonorEmail(user.email);
        setStep('details');
      } else {
        setStep('guest-details');
      }
    }
  }, [isOpen, isLoggedIn]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('details');
      setClientSecret(null);
      setSessionError(null);
      setReceipt(null);
      setGuestError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);

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

      // Silently log in — update AuthContext
      login(data.user);

      // Pre-fill donation details
      setDonorName(guestName.trim());
      setDonorEmail(guestEmail.trim());

      // Move to the donation details step
      setStep('details');
    } catch {
      setGuestError('Network error. Please check your connection and try again.');
    } finally {
      setGuestSubmitting(false);
    }
  }, [guestName, guestEmail, guestPhone, login]);

  // Load publishable key and initialise Stripe.js once (on first open)
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

  // ── Derived values — must be above the early return so hook order is stable ──
  const getFinalAmount = useCallback(() => {
    return customAmount ? parseFloat(customAmount) : amount;
  }, [customAmount, amount]);

  const getCauseName = useCallback(() => {
    if (category === 'Annadanam') return 'Annadanam Community Prasadam Fund';
    return 'Slough Mahotsav Event & Cultural Support Fund';
  }, [category]);

  // Step 1: Submit details → create Stripe PaymentIntent
  const handleDetailsSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = getFinalAmount();
    if (!finalAmount || finalAmount < 0.5) return;

    setSubmitting(true);
    setSessionError(null);

    try {
      const res = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          customerName: donorName || 'Devotee Supporter',
          customerEmail: donorEmail,
          description: getCauseName(),
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
  }, [donorName, donorEmail, getFinalAmount, getCauseName]);

  // Step 2 success callback
  const handlePaymentSuccess = useCallback(
    (receiptNo: string) => {
      const syntheticReceipt: DonationRecord = {
        id: `pay-${Date.now()}`,
        receiptNo,
        donorName: donorName || 'Devotee Supporter',
        donorEmail,
        amount: getFinalAmount(),
        currency: 'GBP',
        cause: getCauseName(),
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
    },
    [donorName, donorEmail, getFinalAmount, getCauseName]
  );

  // Stripe Elements appearance — matches the dark temple theme
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

  // ── Early return AFTER all hooks ──────────────────────────────────────────
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-mitra-gold/40 relative max-h-[90vh] overflow-y-auto"
           style={{ background: '#0D0705' }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* ── SUCCESS ───────────────────────────────────────────────────── */}
        {step === 'success' && receipt ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-[#F7EFE1]">
              Thank You For Your Generosity!
            </h2>
            <p className="text-xs text-[#C9B79C]">
              Your contribution directly empowers the Telugu community across the United Kingdom.
            </p>

            <div className="bg-[#160B08] p-5 rounded-2xl border border-[#D4AF37]/30 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-[#D4AF37]/20 pb-2">
                <span className="text-[#C9B79C]">Official Receipt No:</span>
                <span className="font-mono font-bold text-[#F4C542]">{receipt.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C9B79C]">Donor Name:</span>
                <span className="font-semibold text-[#F7EFE1]">{receipt.donorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C9B79C]">Donation Amount:</span>
                <span className="font-black text-base text-emerald-400">£{receipt.amount}.00 GBP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C9B79C]">Selected Cause:</span>
                <span className="font-semibold text-[#F7EFE1] text-right max-w-[200px]">{receipt.cause}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C9B79C]">Transaction Date:</span>
                <span className="text-[#F7EFE1]">{receipt.date}</span>
              </div>
            </div>

            <p className="text-[11px] text-[#C9B79C]">
              A Stripe receipt has been emailed to <strong className="text-[#F4C542]">{receipt.donorEmail}</strong>
            </p>

            <button
              onClick={() => { setReceipt(null); setStep('details'); onClose(); }}
              className="w-full bg-[#7A1620] hover:bg-[#8f1c25] text-[#F4C542] font-bold py-3 rounded-xl text-sm border border-[#D4AF37]/40 shadow transition-all"
            >
              Done / Return to Portal
            </button>
          </div>

        /* ── GUEST DETAILS (not logged in) ─────────────────────────────── */
        ) : step === 'guest-details' ? (
          <form onSubmit={handleGuestSubmit} className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[#D4AF37]/30 pb-3">
              <div className="p-3 bg-[#7A1620] text-[#F4C542] rounded-2xl shadow border border-[#D4AF37]/40">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h2 className="text-xl font-black font-cinzel gold-foil-text">MAKE A DONATION</h2>
                <p className="text-xs text-[#C9B79C]">Quick details — no account needed</p>
              </div>
            </div>

            {/* Info banner */}
            <div className="bg-[#160B08] border border-[#D4AF37]/30 rounded-xl p-3 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#F4C542] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#C9B79C] leading-relaxed">
                Enter your details below. We'll create your free MITRA account instantly and email your login credentials — then take you straight to payment.
              </p>
            </div>

            {/* Name */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-[#C9B79C] mb-1.5">
                <User className="w-3.5 h-3.5 text-[#F4C542]" />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Radhika & Family"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl p-2.5 text-xs text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
              />
            </div>

            {/* Email + Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-[#C9B79C] mb-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#F4C542]" />
                  <span>Email Address *</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="devotee@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl p-2.5 text-xs text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
                />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-[#C9B79C] mb-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#F4C542]" />
                  <span>Phone / WhatsApp *</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+44 7000 000000"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl p-2.5 text-xs text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
                />
              </div>
            </div>

            {/* Guest error */}
            {guestError && (
              <div className="bg-red-950/80 border border-red-500/50 text-red-200 text-xs p-3 rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{guestError}</span>
              </div>
            )}

            <div className="text-[11px] text-[#C9B79C] flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Your details are kept private · PCI-DSS Encrypted</span>
            </div>

            <button
              type="submit"
              disabled={guestSubmitting}
              className="gold-button w-full py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {guestSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 text-[#0D0705] animate-spin" />
                  <span>Setting up your account...</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 fill-current text-[#0D0705]" />
                  <span>Continue to Donate →</span>
                </>
              )}
            </button>
          </form>

        /* ── STEP 1: DETAILS FORM ──────────────────────────────────────── */
        ) : step === 'details' ? (
          <form onSubmit={handleDetailsSubmit} className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[#D4AF37]/30 pb-3">
              <div className="p-3 bg-[#7A1620] text-[#F4C542] rounded-2xl shadow border border-[#D4AF37]/40">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <div>
                <h2 className="text-xl font-black font-cinzel gold-foil-text">
                  MAKE A DONATION
                </h2>
                <p className="text-xs text-[#C9B79C]">
                  MITRA UK & Mahotsav Seva Contributions
                </p>
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-xs font-bold text-[#F4C542] uppercase tracking-wider mb-2">
                Select Donation Category
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { key: 'Annadanam' as Category, label: 'Annadanam Seva', icon: <Utensils className="w-4 h-4 text-[#F4C542]" />, desc: 'Sponsor Mahaprasadam food distribution' },
                    { key: 'Event Donations' as Category, label: 'Event Support Fund', icon: <Calendar className="w-4 h-4 text-[#F4C542]" />, desc: 'Support 6ft idol, mandap & stage setup' },
                  ] as Array<{ key: Category; label: string; icon: React.ReactNode; desc: string }>
                ).map(({ key, label, icon, desc }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key)}
                    className={`py-3 px-3 rounded-2xl text-xs font-bold transition-all border flex flex-col items-start gap-1 relative text-left ${
                      category === key
                        ? 'bg-[#7A1620] text-[#F4C542] border-[#D4AF37] shadow-lg ring-1 ring-[#F4C542]'
                        : 'bg-[#160B08] text-[#C9B79C] border-[#D4AF37]/20 hover:border-[#F4C542]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-cinzel font-black">
                      {icon}
                      <span className={category === key ? 'text-[#F4C542]' : 'text-[#F7EFE1]'}>{label}</span>
                    </div>
                    <p className="text-[10px] text-[#C9B79C] leading-snug">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Selection */}
            <div>
              <label className="block text-xs font-bold text-[#C9B79C] mb-2">
                Select Donation Amount (GBP £ · Min £1)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[21, 51, 108, 251].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => { setAmount(amt); setCustomAmount(''); }}
                    className={`py-2.5 rounded-xl text-xs font-black transition-all border ${
                      amount === amt && !customAmount
                        ? 'bg-[#7A1620] text-[#F4C542] border-[#D4AF37]'
                        : 'bg-[#160B08] text-[#C9B79C] border-[#D4AF37]/20 hover:border-[#F4C542]'
                    }`}
                  >
                    £{amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min="1"
                placeholder="Or enter any custom amount above £1"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl p-2.5 text-xs text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
              />
            </div>

            {/* Donor Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#C9B79C] mb-1">
                  Full Name / Gotram
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radhika & Family"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl p-2.5 text-xs text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#C9B79C] mb-1">
                  Email Address for Receipt
                </label>
                <input
                  type="email"
                  required
                  placeholder="devotee@example.com"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl p-2.5 text-xs text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
                />
              </div>
            </div>

            {/* Session error */}
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
                  <Heart className="w-4 h-4 fill-current text-[#0D0705]" />
                  <span>
                    Proceed to Pay £{getFinalAmount()}.00
                  </span>
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
              amount={getFinalAmount()}
              donorName={donorName || 'Devotee Supporter'}
              donorEmail={donorEmail}
              cause={getCauseName()}
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
