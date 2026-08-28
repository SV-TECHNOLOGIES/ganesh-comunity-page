import Link from 'next/link';
import { XCircle, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';

interface TicketBlockedProps {
  status: string;
  customerName: string;
  description: string;
  amount: number;
  currency: string;
  paymentId: string;
}

export default function TicketBlocked({
  status,
  customerName,
  description,
  amount,
  currency,
  paymentId,
}: TicketBlockedProps) {
  const isFailed = status === 'Failed';
  const isPending = status === 'Pending';

  const statusConfig = isFailed
    ? {
        icon: <XCircle className="w-14 h-14 text-rose-500" />,
        label: 'Payment Failed',
        labelClass: 'bg-rose-950 text-rose-400 border-rose-500/40',
        borderColor: 'border-rose-500/30',
        glowColor: 'shadow-[0_0_60px_rgba(239,68,68,0.15)]',
        headline: 'This ticket is not available.',
        subtext:
          'The payment for this transaction did not go through. No ticket or receipt has been issued.',
        hint: 'If you believe this is an error, please contact us or try donating again.',
      }
    : isPending
    ? {
        icon: <Clock className="w-14 h-14 text-amber-400" />,
        label: 'Payment Pending',
        labelClass: 'bg-amber-950 text-amber-400 border-amber-500/40',
        borderColor: 'border-amber-500/30',
        glowColor: 'shadow-[0_0_60px_rgba(251,191,36,0.12)]',
        headline: 'Payment is still processing.',
        subtext:
          'Your payment has not yet been confirmed. The ticket will be available once the payment is completed.',
        hint: 'This usually takes a few seconds. Please refresh the page or check back shortly.',
      }
    : {
        icon: <AlertTriangle className="w-14 h-14 text-orange-400" />,
        label: `Status: ${status}`,
        labelClass: 'bg-orange-950 text-orange-400 border-orange-500/40',
        borderColor: 'border-orange-500/30',
        glowColor: 'shadow-[0_0_60px_rgba(251,146,60,0.12)]',
        headline: 'Ticket unavailable.',
        subtext: `The payment status is "${status}". Tickets are only issued for completed payments.`,
        hint: 'Please contact support if you have questions about this transaction.',
      };

  return (
    <div
      className="min-h-screen bg-[#0D0705] flex flex-col items-center justify-center py-12 px-4"
      style={{ fontFamily: "'Cinzel', 'Georgia', serif" }}
    >
      {/* Back link */}
      <div className="w-full max-w-lg mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F4C542] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to MITRA UK
        </Link>
      </div>

      {/* Card */}
      <div
        className={`w-full max-w-lg rounded-3xl border-2 ${statusConfig.borderColor} ${statusConfig.glowColor} overflow-hidden`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#160B08] via-[#1C0E0B] to-[#160B08] px-8 py-6 text-center border-b border-[#D4AF37]/20">
          <div className="flex items-center justify-center gap-3">
            <img
              src="/assets/poster.jpg"
              alt="MITRA UK"
              className="w-9 h-9 rounded-full object-cover border-2 border-[#D4AF37]"
            />
            <div className="text-left">
              <p className="text-[#F4C542] font-black text-base tracking-widest">MITRA UK</p>
              <p className="text-[#FFD87A] text-[9px] font-bold uppercase tracking-widest">
                Donation Ticket
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="bg-[#0D0705] px-8 py-10 flex flex-col items-center text-center gap-5">
          {/* Icon */}
          <div className="w-24 h-24 rounded-full bg-[#160B08] border border-[#D4AF37]/20 flex items-center justify-center">
            {statusConfig.icon}
          </div>

          {/* Status badge */}
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${statusConfig.labelClass}`}
          >
            {statusConfig.label}
          </span>

          {/* Headline */}
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-[#F7EFE1]">{statusConfig.headline}</h1>
            <p className="text-sm text-[#C9B79C] leading-relaxed max-w-sm">{statusConfig.subtext}</p>
          </div>

          {/* Payment details */}
          <div className="w-full bg-[#160B08] border border-[#D4AF37]/20 rounded-2xl p-5 space-y-3 text-left">
            <div>
              <p className="text-[9px] text-[#C9B79C] uppercase font-bold tracking-widest mb-0.5">
                Transaction ID
              </p>
              <p className="font-mono text-[#F4C542] text-xs font-black tracking-wider">
                {paymentId.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-[9px] text-[#C9B79C] uppercase font-bold tracking-widest mb-0.5">
                Name
              </p>
              <p className="text-[#F7EFE1] text-sm font-bold">{customerName}</p>
            </div>
            <div>
              <p className="text-[9px] text-[#C9B79C] uppercase font-bold tracking-widest mb-0.5">
                Description
              </p>
              <p className="text-[#F7EFE1] text-sm">{description}</p>
            </div>
            <div>
              <p className="text-[9px] text-[#C9B79C] uppercase font-bold tracking-widest mb-0.5">
                Amount
              </p>
              <p className="text-[#F4C542] font-black text-xl">
                £{amount.toFixed(2)}{' '}
                <span className="text-sm font-bold text-[#C9B79C]">{currency}</span>
              </p>
            </div>
          </div>

          {/* Hint */}
          <p className="text-[11px] text-[#C9B79C]/70 max-w-sm leading-relaxed">{statusConfig.hint}</p>
        </div>

        {/* Footer */}
        <div className="bg-[#160B08] border-t border-[#D4AF37]/20 px-8 py-4 text-center">
          <p className="text-[9px] text-[#C9B79C] uppercase tracking-wider">
            MITRA UK (MITRA) · Registered UK Community Organisation
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
        <Link
          href="/donate"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-black text-sm uppercase tracking-wider text-[#0D0705] bg-[#D4AF37] hover:bg-[#F4C542] transition-colors shadow-xl"
        >
          Try Again
        </Link>
        <Link
          href="/membership/portal/donations"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider border border-[#D4AF37]/40 text-[#F4C542] hover:bg-[#D4AF37]/10 transition-colors"
        >
          My Donations
        </Link>
      </div>
    </div>
  );
}
