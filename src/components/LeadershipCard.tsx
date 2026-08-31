'use client';

import { useState } from 'react';
import { LeadershipMember } from '@/lib/types';
import { Mail, Linkedin, Twitter, User, Info, X } from 'lucide-react';

export default function LeadershipCard({ member }: { member: LeadershipMember }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState(member.imageUrl || '/assets/poster.jpg');

  return (
    <>
      <div className="temple-card bg-white rounded-3xl p-6 border border-[#E65C00]/25 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col items-center text-center group">
        <div className="relative w-28 h-28 mb-4 rounded-full overflow-hidden border-4 border-[#E65C00]/30 group-hover:border-[#E65C00] transition-colors shadow-sm bg-[#FFF0E0] flex items-center justify-center">
          <img
            src={imgSrc}
            alt={member.name}
            onError={() => setImgSrc('/assets/poster.jpg')}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>

        <span className="bg-[#FFF0E0] text-[#E65C00] border border-[#E65C00]/30 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider mb-2 shadow-xs">
          {member.category}
        </span>

        <h3 className="text-base sm:text-lg font-black font-cinzel text-[#3D1A00] leading-snug">
          {member.name}
        </h3>
        <p className="text-xs font-bold text-[#E65C00] mb-2 mt-0.5">
          {member.designation}
        </p>

        {member.bio && (
          <p className="text-xs text-[#6B3A2A] line-clamp-3 leading-relaxed mb-4">
            {member.bio}
          </p>
        )}

        <div className="mt-auto flex items-center gap-3 pt-2">
          {member.bio && (
            <button
              onClick={() => setModalOpen(true)}
              className="text-xs font-bold text-[#E65C00] hover:underline flex items-center gap-1"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Bio</span>
            </button>
          )}
          
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className="text-[#6B3A2A] hover:text-[#E65C00] transition-colors p-1 rounded-lg hover:bg-[#FFF0E0]"
              title="Email"
            >
              <Mail className="w-4 h-4" />
            </a>
          )}
          {member.linkedin && (
            <a
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6B3A2A] hover:text-[#E65C00] transition-colors p-1 rounded-lg hover:bg-[#FFF0E0]"
              title="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
          )}
          {member.twitter && (
            <a
              href={member.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6B3A2A] hover:text-[#E65C00] transition-colors p-1 rounded-lg hover:bg-[#FFF0E0]"
              title="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Modal Profile View */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="temple-card bg-[#FFF8F0] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border-2 border-[#E65C00]/40 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-[#6B3A2A] hover:text-[#E65C00] p-1.5 rounded-full hover:bg-[#FFF0E0] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center space-y-3">
              <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#E65C00] shadow-md bg-[#FFF0E0]">
                <img
                  src={imgSrc}
                  alt={member.name}
                  onError={() => setImgSrc('/assets/poster.jpg')}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="bg-[#FFF0E0] text-[#E65C00] border border-[#E65C00]/30 text-xs font-black px-3 py-1 rounded-full uppercase">
                {member.category}
              </span>
              <h2 className="text-xl font-black font-cinzel text-[#3D1A00]">
                {member.name}
              </h2>
              <p className="text-sm font-bold text-[#E65C00]">
                {member.designation}
              </p>
              {member.bio && (
                <p className="text-xs text-[#6B3A2A] leading-relaxed text-left pt-3 border-t border-[#E65C00]/15">
                  {member.bio}
                </p>
              )}
              
              {member.email && (
                <div className="pt-2 text-xs text-[#6B3A2A]">
                  Email: <a href={`mailto:${member.email}`} className="text-[#E65C00] font-semibold underline">{member.email}</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
