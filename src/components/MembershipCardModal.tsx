'use client';

import { Member } from '@/lib/types';
import { ShieldCheck, Award, QrCode, X, Download } from 'lucide-react';

export default function MembershipCardModal({ member, onClose }: { member: Member; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-ukta-gold/40 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
        >
          <X className="w-6 h-6" />
        </button>

        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 text-center mb-4">
          Digital Membership Card
        </h3>

        {/* Digital Membership Pass Container */}
        <div className="bg-gradient-to-br from-ukta-navy via-slate-900 to-ukta-red text-white p-6 rounded-2xl border-2 border-ukta-gold shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-ukta-gold/10 rounded-full blur-2xl" />
          
          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-ukta-gold/30 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-ukta-gold text-ukta-navy font-black flex items-center justify-center text-xs">
                UKTA
              </div>
              <div>
                <span className="font-extrabold text-sm text-ukta-gold block leading-tight">UK TELUGU ASSOC</span>
                <span className="text-[10px] text-slate-300">UNITED KINGDOM</span>
              </div>
            </div>
            <span className="bg-ukta-gold text-ukta-navy text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
              {member.tier}
            </span>
          </div>

          {/* Card Body */}
          <div className="space-y-3">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Member Name</span>
              <span className="text-lg font-extrabold text-white tracking-wide">{member.name}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Membership ID</span>
                <span className="font-mono font-bold text-ukta-gold">{member.id}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Status</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{member.status}</span>
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-white/10">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Issued</span>
                <span>{member.startDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Expiry</span>
                <span className="font-semibold text-ukta-gold-light">{member.expiryDate}</span>
              </div>
            </div>

            {/* Simulated Barcode / Verification */}
            <div className="pt-3 flex items-center justify-between border-t border-ukta-gold/20">
              <div className="flex items-center gap-2">
                <QrCode className="w-8 h-8 text-ukta-gold" />
                <span className="text-[9px] text-slate-400">Scan at UKTA events for fast-track entry</span>
              </div>
              <Award className="w-6 h-6 text-ukta-gold" />
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={() => alert(`Downloading Digital Pass PDF for ${member.name} (${member.id})...`)}
            className="w-full bg-ukta-red hover:bg-ukta-red-dark text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
          >
            <Download className="w-4 h-4" />
            <span>Download Digital Pass (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
