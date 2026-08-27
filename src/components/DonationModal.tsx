'use client';

import { useState, useEffect } from 'react';
import { DataStore } from '@/lib/data-store';
import { trackDonation } from '@/lib/analytics';
import Link from 'next/link';
import { Heart, CheckCircle2, DollarSign, Download, Lock, X, Sparkles, Flame, Utensils, Calendar, UserCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DonationRecord } from '@/lib/types';
import { SITE_CONFIG } from '@/config/site-config';
import { useAuth } from '@/lib/auth-context';

export default function DonationModal({ 
  isOpen, 
  onClose, 
  initialCategory = 'Annadanam' 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  initialCategory?: 'Annadanam' | 'Pooja Booking' | 'Event Donations';
}) {
  const { user, isLoggedIn } = useAuth();
  const [category, setCategory] = useState<'Annadanam' | 'Pooja Booking' | 'Event Donations'>(initialCategory);
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'PayPal' | 'Bank Transfer'>('Card');
  const [receipt, setReceipt] = useState<DonationRecord | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      if (user.fullName && !donorName) setDonorName(user.fullName);
      if (user.email && !donorEmail) setDonorEmail(user.email);
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (category === 'Pooja Booking') {
      setAmount(116);
      setCustomAmount('');
    } else if (amount === 116 && !customAmount) {
      setAmount(50);
    }
  }, [category]);

  if (!isOpen) return null;

  const getFinalAmount = () => {
    if (category === 'Pooja Booking') return 116;
    return customAmount ? parseFloat(customAmount) : amount;
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = getFinalAmount();
    if (!finalAmount || finalAmount < 1) return;

    const causeName = category === 'Pooja Booking' 
      ? 'Sacred Mahotsav Pooja Booking (£116 Fixed)' 
      : category === 'Annadanam'
      ? 'Annadanam Community Prasadam Fund'
      : 'Slough Mahotsav Event & Cultural Support Fund';

    try {
      const res = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          customerName: donorName || 'Devotee Supporter',
          customerEmail: donorEmail,
          description: causeName,
          paymentMethod: `Stripe ${paymentMethod}`,
        }),
      });

      await res.json();

      const newDonation = DataStore.addDonation({
        donorName: donorName || 'Devotee Supporter',
        donorEmail,
        amount: finalAmount,
        currency: 'GBP',
        cause: causeName,
        paymentMethod: paymentMethod,
      });

      trackDonation(finalAmount, causeName);
      setReceipt(newDonation);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    } catch {
      alert('Failed to process transaction. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-ukta-gold/40 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
        >
          <X className="w-6 h-6" />
        </button>

        {receipt ? (
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Thank You For Your Generosity!
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Your contribution directly empowers the Telugu community across the United Kingdom.
            </p>

            <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-slate-500">Official Receipt No:</span>
                <span className="font-mono font-bold text-ukta-red dark:text-ukta-gold">{receipt.receiptNo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Donor Name:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{receipt.donorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Donation Amount:</span>
                <span className="font-black text-base text-emerald-600 dark:text-emerald-400">£{receipt.amount}.00 GBP</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Selected Cause:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{receipt.cause}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Date:</span>
                <span>{receipt.date}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setReceipt(null);
                onClose();
              }}
              className="w-full bg-ukta-red hover:bg-ukta-red-dark text-white font-bold py-3 rounded-xl text-sm shadow transition-all"
            >
              Done / Return to Portal
            </button>
          </div>
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

            {/* Quick Demo Credentials Box */}
            {SITE_CONFIG.SHOW_DEMO_CREDENTIALS && (
              <div className="bg-[#160B08] p-4 rounded-2xl border border-[#D4AF37]/30 text-xs space-y-1 text-center">
                <span className="text-[#F4C542] font-bold block">Quick Demo Member Credentials:</span>
                <div className="text-[#C9B79C] text-[11px]">
                  Email: <code className="text-[#F7EFE1]">{SITE_CONFIG.DEMO_MEMBER_EMAIL}</code> | Password: <code className="text-[#F7EFE1]">{SITE_CONFIG.DEMO_MEMBER_PASSWORD}</code>
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
        ) : (
          <form onSubmit={handleDonate} className="space-y-5">
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

            {/* 3 Categories Selection Tabs */}
            <div>
              <label className="block text-xs font-bold text-[#F4C542] uppercase tracking-wider mb-2">
                Select Donation / Seva Category
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setCategory('Annadanam')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 ${
                    category === 'Annadanam'
                      ? 'bg-[#7A1620] text-[#F4C542] border-[#D4AF37] shadow-lg'
                      : 'bg-[#160B08] text-[#C9B79C] border-[#D4AF37]/20 hover:border-[#F4C542]'
                  }`}
                >
                  <Utensils className="w-4 h-4 text-[#F4C542]" />
                  <span>Annadanam</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('Pooja Booking')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 relative ${
                    category === 'Pooja Booking'
                      ? 'bg-[#7A1620] text-[#F4C542] border-[#D4AF37] shadow-lg'
                      : 'bg-[#160B08] text-[#C9B79C] border-[#D4AF37]/20 hover:border-[#F4C542]'
                  }`}
                >
                  <span className="absolute -top-2 bg-[#D4AF37] text-[#0D0705] text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                    £116 FIXED
                  </span>
                  <Flame className="w-4 h-4 text-[#F4C542]" />
                  <span>Pooja Booking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCategory('Event Donations')}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border flex flex-col items-center gap-1 ${
                    category === 'Event Donations'
                      ? 'bg-[#7A1620] text-[#F4C542] border-[#D4AF37] shadow-lg'
                      : 'bg-[#160B08] text-[#C9B79C] border-[#D4AF37]/20 hover:border-[#F4C542]'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-[#F4C542]" />
                  <span>Event Donations</span>
                </button>
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
                  Select Amount (GBP £ &bull; Min £1)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[21, 51, 108, 251].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => {
                        setAmount(amt);
                        setCustomAmount('');
                      }}
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

            <div>
              <label className="block text-xs font-bold text-[#C9B79C] mb-1">
                Payment Option (Stripe Encrypted)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Card', 'PayPal', 'Bank Transfer'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 rounded-xl text-xs font-semibold border ${
                      paymentMethod === method
                        ? 'bg-[#7A1620] text-[#F4C542] border-[#D4AF37]'
                        : 'bg-[#160B08] text-[#C9B79C] border-[#D4AF37]/20'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-[#C9B79C] flex items-center justify-center gap-1.5 pt-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>PCI-DSS Encrypted & Managed via Stripe Gateway</span>
            </div>

            <button
              type="submit"
              className="gold-button w-full py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl"
            >
              <Heart className="w-4 h-4 fill-current text-[#0D0705]" />
              <span>
                {category === 'Pooja Booking'
                  ? 'Confirm & Pay £116 Pooja Seva'
                  : `Complete ${category} of £${getFinalAmount()}.00`}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
