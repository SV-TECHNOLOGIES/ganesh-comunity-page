'use client';

import { Calendar, Award, Globe, Users, Heart } from 'lucide-react';

export default function HistoryPage() {
  const timeline = [
    {
      year: '2012',
      title: 'Foundation of Mana Indian Telugu Roots Abroad',
      desc: 'Established by Dr. Venkat S. Chary and founding members in London to bring together families across the UK for Ugadi and cultural preservation.'
    },
    {
      year: '2016',
      title: 'Expansion of Student Counselling & Charity Services',
      desc: 'Introduced formal student helpline, housing guidance, and emergency support for postgraduate students coming from Andhra Pradesh & Telangana.'
    },
    {
      year: '2019',
      title: 'Guinness World Record Achievement in London',
      desc: 'Organized the largest synchronized Kuchipudi dance performance outside India, featuring over 500 performers at Logan Hall, London.'
    },
    {
      year: '2022',
      title: 'TTD Srinivasa Kalyanam European Celestial Tour',
      desc: 'Hosted Tirumala Tirupati Devasthanams celestial wedding ceremony across major British venues, attended by over 10,000 devotees.'
    },
    {
      year: '2025',
      title: 'Launch of Nari Shakthi Helpline & Digital Member Portal',
      desc: 'Formed specialized women empowerment council providing career mentorship, domestic advisory, and emergency assistance.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="bg-mitra-gold/20 text-mitra-gold-dark dark:text-mitra-gold text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
          Our Heritage
        </span>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">
          MITRA History & Key Milestones
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          From a modest gathering in London to an internationally recognized community organization.
        </p>
      </div>

      <div className="relative border-l-2 border-mitra-gold/40 ml-4 sm:ml-32 space-y-10 py-6">
        {timeline.map((item, idx) => (
          <div key={idx} className="relative pl-8 sm:pl-12 group">
            {/* Year Badge */}
            <div className="absolute -left-[17px] top-1 w-8 h-8 rounded-full bg-mitra-red border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-md">
              <div className="w-2 h-2 rounded-full bg-mitra-gold" />
            </div>

            <div className="sm:absolute -left-32 top-1 text-sm font-black text-mitra-red dark:text-mitra-gold">
              {item.year}
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow space-y-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {item.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
