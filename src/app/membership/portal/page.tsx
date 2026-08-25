'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DataStore } from '@/lib/data-store';
import { Member } from '@/lib/types';
import MembershipCardModal from '@/components/MembershipCardModal';
import { ShieldCheck, User, QrCode, Search, Award, Download, ArrowLeft, Sparkles, CheckCircle2, Ticket } from 'lucide-react';

export default function MemberPortalPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [passModal, setPassModal] = useState<Member | null>(null);

  useEffect(() => {
    DataStore.init();
    const list = DataStore.getMembers();
    setMembers(list);

    // Check if session cookie exists or default to first member
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/ukta_member_session=([^;]+)/);
      if (match) {
        try {
          const session = JSON.parse(decodeURIComponent(match[1]));
          const found = list.find(m => m.email === session.email || m.id === session.id);
          if (found) {
            setSelectedMember(found);
            return;
          }
        } catch {}
      }
    }

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
    <div className="min-h-screen bg-[#0D0705] text-[#F7EFE1] py-12 px-4 sm:px-6 lg:px-8 space-y-10">
      
      {/* Portal Header */}
      <div className="max-w-4xl mx-auto text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-[#F4C542] hover:underline mb-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Live Mahotsav</span>
        </Link>
        <span className="bg-[#7A1620] text-[#F4C542] border border-[#D4AF37]/40 text-xs font-black px-4 py-1.5 rounded-full uppercase block max-w-fit mx-auto shadow-md">
          UKTA MEMBER SELF-SERVICE PORTAL
        </span>
        <h1 className="text-3xl sm:text-4xl font-black font-cinzel gold-foil-text">
          MY DIGITAL MEMBERSHIP DASHBOARD
        </h1>
        <p className="text-xs text-[#C9B79C] max-w-xl mx-auto">
          Manage your UKTA digital pass, event discounts, volunteer credentials, and annual renewal details.
        </p>
      </div>

      {/* Member Lookup Bar */}
      <div className="temple-card p-6 rounded-3xl border-2 border-[#D4AF37]/50 max-w-xl mx-auto shadow-xl">
        <form onSubmit={handleSearch} className="space-y-3">
          <label className="block text-xs font-bold text-[#F4C542] uppercase tracking-wider">
            Lookup Membership ID or Email
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              required
              placeholder="e.g. UKTA-MEM-5001 or member@ukta.org.uk"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="flex-1 bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-xs text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
            />
            <button
              type="submit"
              className="gold-button font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-1 shadow"
            >
              <Search className="w-4 h-4 text-[#0D0705]" />
              <span>Lookup</span>
            </button>
          </div>
        </form>
      </div>

      {/* Active Member Digital Card */}
      {selectedMember && (
        <div className="max-w-4xl mx-auto temple-card p-8 rounded-3xl border-2 border-[#D4AF37] shadow-[0_0_40px_rgba(212,175,55,0.2)] grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37] bg-[#160B08] p-0.5 shadow-md shrink-0 overflow-hidden">
                <img src="/assets/poster-dark.jpeg" alt="Member Avatar" className="w-full h-full object-cover rounded-full" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-[#F4C542] tracking-wider block">{selectedMember.id}</span>
                <h2 className="text-2xl font-black font-cinzel text-[#F7EFE1]">{selectedMember.name}</h2>
                <span className="bg-[#7A1620] text-[#FFD87A] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30 inline-block mt-1">
                  {selectedMember.tier}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs pt-4 border-t border-[#D4AF37]/20">
              <div>
                <span className="text-[#C9B79C] block text-[10px] uppercase font-bold">Membership Tier</span>
                <span className="font-extrabold text-[#F4C542] text-sm">{selectedMember.tier}</span>
              </div>
              <div>
                <span className="text-[#C9B79C] block text-[10px] uppercase font-bold">Status</span>
                <span className="font-extrabold text-emerald-400 text-sm flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{selectedMember.status}</span>
                </span>
              </div>
              <div>
                <span className="text-[#C9B79C] block text-[10px] uppercase font-bold">Valid Until</span>
                <span className="font-bold text-[#F7EFE1] text-sm">{selectedMember.expiryDate}</span>
              </div>
            </div>

            {/* Exclusive Member Benefits List */}
            <div className="space-y-2 pt-2 border-t border-[#D4AF37]/20 text-xs">
              <span className="text-xs font-black font-cinzel text-[#F4C542] uppercase tracking-wider block">YOUR ACTIVE MEMBER BENEFITS</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#C9B79C] text-[11px]">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#F4C542]" />
                  <span>Priority VIP Seating at Slough Mahotsav</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#F4C542]" />
                  <span>Free Admission to Ugadi Cultural Fest</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#F4C542]" />
                  <span>Voting Rights at UKTA AGM Meetings</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#F4C542]" />
                  <span>Student & Welfare Mentorship Helpline</span>
                </div>
              </div>
            </div>

          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-[#160B08] rounded-2xl border border-[#D4AF37]/40 space-y-4 text-center">
            <div className="p-3 bg-white rounded-xl shadow-lg border-2 border-[#D4AF37]">
              <QrCode className="w-20 h-20 text-[#0D0705]" />
            </div>
            <button
              onClick={() => setPassModal(selectedMember)}
              className="gold-button w-full py-3 rounded-full font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
            >
              <Download className="w-4 h-4 text-[#0D0705]" />
              <span>Download Digital Pass</span>
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
