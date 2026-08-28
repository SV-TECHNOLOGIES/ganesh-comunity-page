'use client';

import Link from 'next/link';
import { CheckCircle, Download, ExternalLink, Copy } from 'lucide-react';
import { useState } from 'react';

interface PaymentData {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customerName: string;
  customerEmail: string;
  description: string;
  paymentMethod: string;
  createdAt: string;
}

interface TicketClientProps {
  payment: PaymentData;
  qrDataUrl: string;
  ticketUrl: string;
}

export default function TicketClient({ payment, qrDataUrl, ticketUrl }: TicketClientProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(ticketUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handlePrint = () => window.print();

  const dateStr = new Date(payment.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .ticket-wrapper { box-shadow: none !important; border: 2px solid #D4AF37 !important; }
        }
      `}</style>

      <div className="min-h-screen bg-[#0D0705] flex flex-col items-center justify-start py-10 px-4">

        {/* Top Nav — hidden on print */}
        <div className="no-print w-full max-w-2xl mb-6 flex items-center justify-between">
          <Link href="/" className="text-xs font-bold text-[#F4C542] hover:underline flex items-center gap-1">
            ← Back to MITRA UK
          </Link>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-xs text-[#C9B79C] hover:text-[#F4C542] border border-[#D4AF37]/30 px-3 py-1.5 rounded-full transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-xs text-[#0D0705] bg-[#D4AF37] hover:bg-[#F4C542] px-4 py-1.5 rounded-full font-black transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Ticket Card */}
        <div
          className="ticket-wrapper w-full max-w-2xl rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(212,175,55,0.3)] border-2 border-[#D4AF37]"
          style={{ fontFamily: "'Cinzel', 'Georgia', serif" }}
        >
          {/* Header Band */}
          <div className="bg-gradient-to-r from-[#7A1620] via-[#9C1F2E] to-[#7A1620] px-8 py-6 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, #D4AF37 0%, transparent 50%), radial-gradient(circle at 80% 50%, #D4AF37 0%, transparent 50%)'
            }} />
            <div className="relative">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#D4AF37] shrink-0">
                  <img src="/assets/poster.jpg" alt="MITRA UK" className="w-full h-full object-cover scale-[1.75]" />
                </div>
                <div className="text-left">
                  <p className="text-[#F4C542] font-black text-lg tracking-widest">MITRA UK</p>
                  <p className="text-[#FFD87A] text-[9px] font-bold uppercase tracking-widest">Official Donation Receipt</p>
                </div>
              </div>
              <div className="h-px bg-[#D4AF37]/40 my-3" />
              <p className="text-[#FFD87A] text-[10px] font-bold uppercase tracking-[0.3em]">
                Mana Indian Telugu Roots Abroad · London, UK
              </p>
            </div>
          </div>

          {/* Main Body */}
          <div className="bg-[#0D0705] px-8 py-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">

              {/* Left — Details */}
              <div className="flex-1 space-y-5">

                {/* Receipt No */}
                <div>
                  <p className="text-[9px] text-[#C9B79C] uppercase font-bold tracking-widest mb-1">Receipt / Ticket No.</p>
                  <p className="font-mono text-[#F4C542] font-black text-sm tracking-wider">{payment.id.toUpperCase()}</p>
                </div>

                {/* Donor */}
                <div>
                  <p className="text-[9px] text-[#C9B79C] uppercase font-bold tracking-widest mb-1">Donor Name</p>
                  <p className="text-[#F7EFE1] font-bold text-base">{payment.customerName}</p>
                </div>

                {/* Description */}
                <div>
                  <p className="text-[9px] text-[#C9B79C] uppercase font-bold tracking-widest mb-1">Purpose / Description</p>
                  <p className="text-[#F7EFE1] text-sm leading-relaxed">{payment.description}</p>
                </div>

                {/* Amount */}
                <div className="bg-[#160B08] border border-[#D4AF37]/30 rounded-2xl p-4 inline-block">
                  <p className="text-[9px] text-[#C9B79C] uppercase font-bold tracking-widest mb-1">Amount Paid</p>
                  <p className="text-3xl font-black text-[#F4C542]">
                    £{payment.amount.toFixed(2)}
                    <span className="text-sm font-bold text-[#C9B79C] ml-1">{payment.currency}</span>
                  </p>
                </div>

                {/* Grid of meta info */}
                <div className="grid grid-cols-2 gap-4 text-xs border-t border-[#D4AF37]/20 pt-4">
                  <div>
                    <p className="text-[9px] text-[#C9B79C] uppercase font-bold tracking-widest mb-0.5">Payment Method</p>
                    <p className="text-[#F7EFE1] font-semibold">{payment.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-[#C9B79C] uppercase font-bold tracking-widest mb-0.5">Status</p>
                    <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-400 font-bold px-2 py-0.5 rounded-full text-[10px] border border-emerald-500/30">
                      <CheckCircle className="w-3 h-3" />
                      {payment.status}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[9px] text-[#C9B79C] uppercase font-bold tracking-widest mb-0.5">Date & Time</p>
                    <p className="text-[#F7EFE1] font-semibold">{dateStr}</p>
                  </div>
                </div>
              </div>

              {/* Right — QR Code */}
              <div className="flex flex-col items-center gap-3 shrink-0">
                <div className="p-3 bg-white rounded-2xl border-2 border-[#D4AF37] shadow-lg">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrDataUrl} alt="Scan to verify ticket" width={160} height={160} />
                </div>
                <p className="text-[9px] text-[#C9B79C] text-center font-bold uppercase tracking-wider max-w-[140px] leading-tight">
                  Scan to verify this donation receipt
                </p>
                <a
                  href={ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-print flex items-center gap-1 text-[10px] text-[#F4C542] hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open ticket link</span>
                </a>
              </div>
            </div>
          </div>

          {/* Footer Band */}
          <div className="bg-[#160B08] border-t border-[#D4AF37]/30 px-8 py-4 text-center">
            <p className="text-[9px] text-[#C9B79C] uppercase tracking-wider">
              This is an official computer-generated receipt. No signature required. · MITRA UK (MITRA) · Registered UK Community Organisation
            </p>
            <p className="text-[9px] text-[#C9B79C] mt-1">
              Verify online: <span className="text-[#F4C542] font-mono">{ticketUrl}</span>
            </p>
          </div>

          {/* Perforation effect */}
          <div className="bg-[#D4AF37] h-0.5 w-full opacity-30" />
        </div>

        {/* Action buttons — hidden on print */}
        <div className="no-print mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={handlePrint}
            className="gold-button flex items-center gap-2 px-8 py-3 rounded-full font-black text-sm uppercase tracking-wider shadow-xl hover:scale-105 transition-transform"
          >
            <Download className="w-5 h-5 text-[#0D0705]" />
            <span>Download / Print Ticket</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider border border-[#D4AF37]/50 text-[#F4C542] hover:bg-[#D4AF37]/10 transition-colors"
          >
            <Copy className="w-5 h-5" />
            <span>{copied ? '✓ Link Copied!' : 'Copy Shareable Link'}</span>
          </button>
        </div>

        <p className="no-print mt-6 text-[10px] text-[#C9B79C] text-center max-w-md">
          This ticket link is publicly accessible — share it with anyone to verify this donation.
        </p>
      </div>
    </>
  );
}
