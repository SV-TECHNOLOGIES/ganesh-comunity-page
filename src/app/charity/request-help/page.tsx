'use client';

import { useState } from 'react';
import CharityTicketModal from '@/components/CharityTicketModal';

export default function RequestHelpPage() {
  const [open, setOpen] = useState(true);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
        Confidential Welfare Ticket System
      </h1>
      <p className="text-xs text-slate-500">
        If the modal does not appear automatically, click below to open the ticket form.
      </p>
      <button
        onClick={() => setOpen(true)}
        className="bg-mitra-red text-white font-bold px-6 py-3 rounded-xl text-xs"
      >
        Open Help Request Ticket Form
      </button>

      <CharityTicketModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}
