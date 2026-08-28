'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DataStore } from '@/lib/data-store';
import { trackDonation } from '@/lib/analytics';
import Link from 'next/link';
import {
  Heart,
  CheckCircle2,
  Lock,
  X,
  Flame,
  Utensils,
  Calendar,
  UserCheck,
  ArrowLeft,
  AlertCircle,
  Loader2,
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

// ── Types ────────────────────────────────────────────────────────────────────

type Category = 'Annadanam' | 'Pooja Booking' | 'Event Donations';
type Step = 'details' | 'payment' | 'success';

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
          : 'https://ukta.org.uk/donate?payment=success',
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
      {/* <div className="rounded-2xl overflow-hidden border border-[#D4AF37]/30"> */}
        <PaymentElement
          options={{
            layout: 'tabs',
            paymentMethodOrder: ['card', 'apple_pay', 'google_pay'],
          }}
        />
      {/* </div> */}

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
  const { user, isLoggedIn } = useAuth();

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

  // Pre-fill from auth context
  useEffect(() => {
    if (isOpen && user) {
      if (user.fullName && !donorName) setDonorName(user.fullName);
      if (user.email && !donorEmail) setDonorEmail(user.email);
    }
  }, [isOpen, user]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('details');
      setClientSecret(null);
      setSessionError(null);
      setReceipt(null);
    }
  }, [isOpen]);

  // Auto-select amount for Pooja Booking
  useEffect(() => {
    if (category === 'Pooja Booking') {
      setAmount(116);
      setCustomAmount('');
    } else if (amount === 116 && !customAmount) {
      setAmount(50);
    }
  }, [category]);

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
    if (category === 'Pooja Booking') return 116;
    return customAmount ? parseFloat(customAmount) : amount;
  }, [category, customAmount, amount]);

  const getCauseName = useCallback(() => {
    if (category === 'Pooja Booking') return 'Sacred Mahotsav Pooja Booking (£116 Fixed)';
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
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-ukta-gold/40 relative max-h-[90vh] overflow-y-auto"
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

        /* ── NOT LOGGED IN ──────────────────────────────────────────────── */
        ) : !isLoggedIn ? (
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 bg-[#7A1620] text-[#F4C542] rounded-full flex items-center justify-center mx-auto border-2 border-[#D4AF37] shadow-xl">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black font-cinzel gold-foil-text">
                LOGIN REQUIRED FOR POOJA & DONATIONS
              </h2>
              <p className="text-xs text-[#C9B79C] max-w-sm mx-auto leading-relaxed">
                Please sign in to your MITRA UK Member account to complete your sacred Pooja Booking (£116) or Annadanam donation.
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
                  DONATION & POOJA SEVA
                </h2>
                <p className="text-xs text-[#C9B79C]">
                  MITRA UK & Mahotsav Seva Contributions
                </p>
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-xs font-bold text-[#F4C542] uppercase tracking-wider mb-2">
                Select Donation / Seva Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { key: 'Annadanam' as Category, label: 'Annadanam Donation', icon: <Utensils className="w-4 h-4 text-[#F4C542]" />, badge: undefined },
                    { key: 'Pooja Booking' as Category, label: 'Pooja Booking', icon: <Flame className="w-4 h-4 text-[#F4C542]" />, badge: '£116 FIXED' },
                    { key: 'Event Donations' as Category, label: 'Event Donations', icon: <Calendar className="w-4 h-4 text-[#F4C542]" />, badge: undefined },
                  ] as Array<{ key: Category; label: string; icon: React.ReactNode; badge?: string }>
                ).map(({ key, label, icon, badge }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCategory(key)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 relative ${
                      category === key
                        ? 'bg-[#7A1620] text-[#F4C542] border-[#D4AF37] shadow-lg'
                        : 'bg-[#160B08] text-[#C9B79C] border-[#D4AF37]/20 hover:border-[#F4C542]'
                    }`}
                  >
                    {badge && (
                      <span className="absolute -top-2 bg-[#D4AF37] text-[#0D0705] text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                        {badge}
                      </span>
                    )}
                    {icon}
                    <span>{label}</span>
                  </button>
                ))}

              </div>
            </div>

            {/* Amount Selection */}
            {category === 'Pooja Booking' ? (
              <div className="bg-[#160B08] p-4 rounded-2xl border-2 border-[#D4AF37]/60 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#C9B79C]">Pooja Booking Sankalpam:</span>
                  <span className="text-xl font-black font-cinzel text-[#F4C542]">£116.00 GBP</span>
                </div>
                <p className="text-[11px] text-[#C9B79C] italic">
                  Fixed Pooja Seva includes Special Archana, Name in Priest Sankalpam registry, and Mahaprasadam box.
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-[#C9B79C] mb-2">
                  Select Amount (GBP £ · Min £1)
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
                  placeholder="Or enter any amount above £1"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl p-2.5 text-xs text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
                />
              </div>
            )}

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
                    {category === 'Pooja Booking'
                      ? 'Proceed to Pay £116 Pooja Seva'
                      : `Proceed to Pay £${getFinalAmount()}.00`}
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
