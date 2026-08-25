'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Award, ExternalLink, Send } from 'lucide-react';

export default function SponsorsPage() {
  const [enquirySent, setEnquirySent] = useState(false);
  const [company, setCompany] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');

  const handleSponsorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEnquirySent(true);
  };

  const sponsors = [
    { tier: 'Platinum Partners', name: 'TechMahindra UK', logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300' },
    { tier: 'Platinum Partners', name: 'Apollo Hospitals International', logo: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=300' },
    { tier: 'Gold Partners', name: 'ICICI Bank UK PLC', logo: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&q=80&w=300' },
    { tier: 'Gold Partners', name: 'Sitaram Restaurant Chiswick', logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=300' },
    { tier: 'Silver Partners', name: 'Reddy Legal Solicitors London', logo: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=300' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="bg-ukta-gold/20 text-ukta-gold-dark dark:text-ukta-gold text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
          Partnerships & Support
        </span>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">
          Sponsors & Corporate Partners
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          We gratefully acknowledge our corporate sponsors who support UKTA festivals and community welfare initiatives.
        </p>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {sponsors.map((sp, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center text-center space-y-3">
            <span className="bg-ukta-navy text-ukta-gold text-[10px] font-black px-3 py-1 rounded-full uppercase">
              {sp.tier}
            </span>
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
              <Image src={sp.logo} alt={sp.name} fill className="object-cover" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{sp.name}</h3>
          </div>
        ))}
      </div>

      {/* Become a Sponsor Form */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border-2 border-ukta-gold shadow-2xl max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-black text-white">Become a UKTA Corporate Sponsor</h2>
        <p className="text-xs text-slate-300">
          Reach over 14,000 British-Telugu families and professionals through event sponsorship, banner branding, and Patrika features.
        </p>

        {enquirySent ? (
          <div className="bg-emerald-900/50 border border-emerald-500/50 p-4 rounded-2xl text-emerald-300 text-xs font-bold text-center">
            Thank you! Your sponsor enquiry has been sent to the UKTA Executive Committee.
          </div>
        ) : (
          <form onSubmit={handleSponsorSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">Company / Organization Name</label>
              <input
                type="text"
                required
                placeholder="e.g. TechCorp UK"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Contact Person Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Varma"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="corporate@company.co.uk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-ukta-gold hover:bg-ukta-gold-dark text-ukta-navy font-black py-3 rounded-xl transition-all shadow"
            >
              Submit Sponsor Lead Enquiry
            </button>
          </form>
        )}
      </div>

    </div>
  );
}
