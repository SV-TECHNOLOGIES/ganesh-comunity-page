'use client';

import { useState, useEffect } from 'react';
import { DataStore } from '@/lib/data-store';
import { Member } from '@/lib/types';
import MembershipCardModal from '@/components/MembershipCardModal';
import { ShieldCheck, User, QrCode, Search, Award, Download } from 'lucide-react';

export default function MemberPortalPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [passModal, setPassModal] = useState<Member | null>(null);

  useEffect(() => {
    DataStore.init();
    const list = DataStore.getMembers();
    setMembers(list);
    if (list.length > 0) {
      setSelectedMember(list[0]);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = members.find(m => m.email.toLowerCase() === searchEmail.toLowerCase() || m.id.toLowerCase() === searchEmail.toLowerCase());
    if (found) {
      setSelectedMember(found);
    } else {
      alert('No active membership found with that ID or Email.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Portal Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="bg-ukta-navy text-ukta-gold border border-ukta-gold/30 text-xs font-black px-3 py-1 rounded-full uppercase">
          Member Self-Service Portal
        </span>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">
          My UKTA Membership Dashboard
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          View your membership status, download digital passes for events, and manage renewals.
        </p>
      </div>

      {/* Member Lookup Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md max-w-xl mx-auto">
        <form onSubmit={handleSearch} className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Sign In / Lookup Membership ID or Email
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              placeholder="e.g. UKTA-MEM-5001 or email..."
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white"
            />
            <button
              type="submit"
              className="bg-ukta-red hover:bg-ukta-red-dark text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1 shadow"
            >
              <Search className="w-4 h-4" />
              <span>Lookup</span>
            </button>
          </div>
        </form>
      </div>

      {/* Active Member Display */}
      {selectedMember && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-ukta-gold/20 text-ukta-gold-dark font-black flex items-center justify-center text-lg">
                <User className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-ukta-red dark:text-ukta-gold">{selectedMember.id}</span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">{selectedMember.name}</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs pt-4 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block">Tier</span>
                <span className="font-extrabold text-ukta-red dark:text-ukta-gold">{selectedMember.tier}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Status</span>
                <span className="font-extrabold text-emerald-500">{selectedMember.status}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Expiry Date</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedMember.expiryDate}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <QrCode className="w-12 h-12 text-ukta-navy dark:text-ukta-gold" />
            <button
              onClick={() => setPassModal(selectedMember)}
              className="w-full bg-ukta-navy text-ukta-gold hover:bg-slate-900 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
            >
              <Download className="w-4 h-4" />
              <span>View Digital Pass</span>
            </button>
          </div>

        </div>
      )}

      {passModal && (
        <MembershipCardModal member={passModal} onClose={() => setPassModal(null)} />
      )}
    </div>
  );
}
