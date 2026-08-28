'use client';

import { useState } from 'react';
import Image from 'next/image';
import { LeadershipMember } from '@/lib/types';
import { Mail, Linkedin, Twitter, User, Info, X } from 'lucide-react';

export default function LeadershipCard({ member }: { member: LeadershipMember }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center group">
        <div className="relative w-28 h-28 mb-4 rounded-full overflow-hidden border-4 border-mitra-gold/40 group-hover:border-mitra-red transition-colors shadow-md">
          <Image
            src={member.imageUrl}
            alt={member.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform"
          />
        </div>

        <span className="bg-mitra-red/10 text-mitra-red dark:bg-mitra-gold/10 dark:text-mitra-gold text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
          {member.category}
        </span>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          {member.name}
        </h3>
        <p className="text-xs font-semibold text-mitra-red dark:text-mitra-gold mb-3">
          {member.designation}
        </p>
        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-4">
          {member.bio}
        </p>

        <div className="mt-auto flex items-center gap-3 pt-2">
          <button
            onClick={() => setModalOpen(true)}
            className="text-xs font-bold text-mitra-red dark:text-mitra-gold hover:underline flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Full Profile</span>
          </button>
          
          {member.email && (
            <a href={`mailto:${member.email}`} className="text-slate-400 hover:text-mitra-red dark:hover:text-mitra-gold transition-colors" title="Email">
              <Mail className="w-4 h-4" />
            </a>
          )}
          {member.linkedin && (
            <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-mitra-red dark:hover:text-mitra-gold transition-colors" title="LinkedIn">
              <Linkedin className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Modal Profile View */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-mitra-gold/30 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-full"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-mitra-gold shadow-lg">
                <Image src={member.imageUrl} alt={member.name} fill className="object-cover" />
              </div>
              <span className="bg-mitra-red text-white text-xs font-bold px-3 py-1 rounded-full">
                {member.category}
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {member.name}
              </h2>
              <p className="text-sm font-semibold text-mitra-red dark:text-mitra-gold">
                {member.designation}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed text-left pt-2 border-t border-slate-100 dark:border-slate-800">
                {member.bio}
              </p>
              
              {member.email && (
                <div className="pt-2 text-xs text-slate-500">
                  Contact Email: <a href={`mailto:${member.email}`} className="text-mitra-red font-semibold underline">{member.email}</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
