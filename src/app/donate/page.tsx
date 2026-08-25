'use client';

import { useState } from 'react';
import DonationModal from '@/components/DonationModal';
import { Heart, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

export default function DonatePage() {
  const [modalOpen, setModalOpen] = useState(true);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-8">
      <div className="space-y-3">
        <span className="bg-ukta-red/10 text-ukta-red dark:bg-ukta-gold/10 dark:text-ukta-gold text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
          Support UKTA Charity Fund
        </span>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">
          Make a Difference in Our Community
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Your donations support student emergency welfare, repatriation assistance, and preserving Telugu cultural heritage across the UK.
        </p>
      </div>

      <button
        onClick={() => setModalOpen(true)}
        className="bg-ukta-red hover:bg-ukta-red-dark text-white font-extrabold px-8 py-4 rounded-2xl text-sm shadow-xl transition-all inline-flex items-center gap-2"
      >
        <Heart className="w-5 h-5 fill-white" />
        <span>Open Donation Gateway</span>
      </button>

      <DonationModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
