'use client';

import { useState } from 'react';
import Link from 'next/link';
import CharityTicketModal from '@/components/CharityTicketModal';
import { 
  GraduationCap, 
  Plane, 
  HeartHandshake, 
  ShieldAlert, 
  Award, 
  Users, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function CharityPage() {
  const [modalOpen, setModalOpen] = useState(false);

  const services = [
    {
      icon: GraduationCap,
      title: 'Student Counselling & Academic Guidance',
      desc: 'Free assistance for international Telugu students adjusting to UK university life, housing guidance, part-time work compliance, and mental well-being support.'
    },
    {
      icon: Plane,
      title: 'Repatriation Support & Emergency Assistance',
      desc: 'Consular document guidance, logistical coordination, and emergency flight support for families dealing with sudden loss or critical medical emergencies.'
    },
    {
      icon: ShieldAlert,
      title: 'Nari Shakthi Women Helpline',
      desc: 'Strictly confidential advice, legal referral, housing guidance, and emotional support for women experiencing domestic or mental distress.'
    },
    {
      icon: HeartHandshake,
      title: 'Community Welfare & Senior Care',
      desc: 'Voluntary hospital visits, senior citizen social events, NHS health awareness drives, and food assistance for vulnerable community members.'
    },
    {
      icon: Award,
      title: 'UKTA Annual Excellence Awards',
      desc: 'Recognizing outstanding achievements by British-Telugu youth, academics, healthcare workers, and social entrepreneurs.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="bg-ukta-red/10 text-ukta-red dark:bg-ukta-gold/10 dark:text-ukta-gold text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
          Charity & Welfare Initiatives
        </span>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">
          Compassionate Support When You Need It Most
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          UKTA is dedicated to ensuring no member of our community stands alone in times of hardship or transition in the United Kingdom.
        </p>

        <div className="pt-2">
          <button
            onClick={() => setModalOpen(true)}
            className="bg-ukta-red hover:bg-ukta-red-dark text-white font-extrabold px-8 py-3.5 rounded-2xl shadow-xl transition-all inline-flex items-center gap-2 text-sm"
          >
            <Sparkles className="w-4 h-4 text-ukta-gold" />
            <span>Submit Private Request for Help</span>
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {services.map((srv, idx) => {
          const IconComp = srv.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 hover:border-ukta-gold transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-ukta-navy text-ukta-gold flex items-center justify-center font-bold shadow-md group-hover:scale-110 transition-transform">
                <IconComp className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {srv.title}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {srv.desc}
              </p>
              <button
                onClick={() => setModalOpen(true)}
                className="text-xs font-bold text-ukta-red dark:text-ukta-gold hover:underline inline-flex items-center gap-1 pt-2"
              >
                <span>Request Assistance &rarr;</span>
              </button>
            </div>
          );
        })}
      </div>

      <CharityTicketModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
