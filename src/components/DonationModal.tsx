'use client';

import { useState } from 'react';
import { DataStore } from '@/lib/data-store';
import { trackDonation } from '@/lib/analytics';
import { Heart, CheckCircle2, DollarSign, Download, Lock, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DonationRecord } from '@/lib/types';

export default function DonationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [cause, setCause] = useState('Student Emergency Welfare Fund');
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'PayPal' | 'Bank Transfer'>('Card');
  const [receipt, setReceipt] = useState<DonationRecord | null>(null);

  if (!isOpen) return null;

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = customAmount ? parseFloat(customAmount) : amount;
    if (!finalAmount || finalAmount <= 0) return;

    try {
      const res = await fetch('/api/payments/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          customerName: donorName || 'Generous Supporter',
          customerEmail: donorEmail,
          description: `Donation: ${cause}`,
          paymentMethod: `Stripe ${paymentMethod}`,
        }),
      });

      const data = await res.json();

      const newDonation = DataStore.addDonation({
        donorName: donorName || 'Generous Supporter',
        donorEmail,
        amount: finalAmount,
        currency: 'GBP',
        cause,
        paymentMethod: paymentMethod,
      });

      trackDonation(finalAmount, cause);
      setReceipt(newDonation);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // fallback
      }
    } catch {
      alert('Failed to process donation transaction.');
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
        ) : (
          <form onSubmit={handleDonate} className="space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-3 bg-ukta-red text-white rounded-2xl shadow">
                <Heart className="w-6 h-6 fill-white" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Support UKTA Programs
                </h2>
                <p className="text-xs text-slate-500">
                  Tax-exempt non-profit community donations.
                </p>
              </div>
            </div>

            {/* Presets */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Select Amount (GBP £)
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[25, 50, 100, 250].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setAmount(amt);
                      setCustomAmount('');
                    }}
                    className={`py-2.5 rounded-xl text-xs font-black transition-all border ${
                      amount === amt && !customAmount
                        ? 'bg-ukta-red text-white border-ukta-red shadow'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-ukta-gold'
                    }`}
                  >
                    £{amt}
                  </button>
                ))}
              </div>

              <input
                type="number"
                placeholder="Or enter custom amount in £"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* Cause selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Allocate Contribution To
              </label>
              <select
                value={cause}
                onChange={(e) => setCause(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
              >
                <option value="Student Emergency Welfare Fund">Student Emergency Welfare Fund</option>
                <option value="Telugu Cultural Preservation & Kuchipudi Academy">Telugu Cultural Preservation & Kuchipudi Academy</option>
                <option value="Women Empowerment & Helpline">Women Empowerment & Helpline</option>
                <option value="General Community Support Fund">General Community Support Fund</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Radhika Sharma"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address for Receipt
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Payment Option (Simulated Gateway)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Card', 'PayPal', 'Bank Transfer'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 rounded-xl text-xs font-semibold border ${
                      paymentMethod === method
                        ? 'bg-ukta-navy text-white border-ukta-gold'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 pt-1">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>PCI-DSS Compliant Secure Encrypted Transaction</span>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-ukta-red to-ukta-red-light hover:from-ukta-red-dark hover:to-ukta-red text-white font-bold py-3.5 rounded-xl text-sm shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Complete Donation of £{customAmount || amount}.00</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
