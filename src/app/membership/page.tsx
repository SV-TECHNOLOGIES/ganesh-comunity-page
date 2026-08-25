'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DataStore } from '@/lib/data-store';
import { trackMembership } from '@/lib/analytics';
import MembershipCardModal from '@/components/MembershipCardModal';
import { Member } from '@/lib/types';
import { ShieldCheck, Award, CheckCircle2, UserCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MembershipPage() {
  const [selectedTier, setSelectedTier] = useState<'Life Member' | 'Annual Member' | 'Volunteer'>('Life Member');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profession, setProfession] = useState('');
  const [createdMember, setCreatedMember] = useState<Member | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember = DataStore.addMember({
      name,
      email,
      phone,
      tier: selectedTier,
      address,
      profession
    });

    trackMembership(selectedTier, newMember.id);
    setCreatedMember(newMember);

    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="bg-ukta-gold/20 text-ukta-gold-dark dark:text-ukta-gold text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
          Join UKTA Family
        </span>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">
          UKTA Membership & Community Registration
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Enjoy priority festival seating, digital pass verification, student mentoring, and voting rights.
        </p>

        <div className="pt-2">
          <Link
            href="/membership/portal"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-ukta-red dark:text-ukta-gold hover:underline"
          >
            <UserCheck className="w-4 h-4" />
            <span>Already a Member? Access Member Portal & Digital Card Pass &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Tier 1: Life Member */}
        <div 
          onClick={() => setSelectedTier('Life Member')}
          className={`bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 transition-all cursor-pointer relative shadow-lg flex flex-col justify-between ${
            selectedTier === 'Life Member'
              ? 'border-ukta-gold ring-4 ring-ukta-gold/20'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <span className="bg-ukta-gold text-ukta-navy text-[10px] font-black px-3 py-1 rounded-full uppercase absolute -top-3 right-6">
            MOST POPULAR
          </span>
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Life Membership</h3>
            <div className="text-3xl font-extrabold text-ukta-red dark:text-ukta-gold">
              £100 <span className="text-xs font-normal text-slate-500">/ One-time fee</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Lifetime voting rights at AGM</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> VIP priority seating at Ugadi & Events</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Digital Membership ID Card Pass</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Complimentary printed UKTA Patrika</li>
            </ul>
          </div>
        </div>

        {/* Tier 2: Annual Member */}
        <div 
          onClick={() => setSelectedTier('Annual Member')}
          className={`bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 transition-all cursor-pointer shadow-lg flex flex-col justify-between ${
            selectedTier === 'Annual Member'
              ? 'border-ukta-gold ring-4 ring-ukta-gold/20'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Annual Membership</h3>
            <div className="text-3xl font-extrabold text-ukta-red dark:text-ukta-gold">
              £25 <span className="text-xs font-normal text-slate-500">/ per year</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Discounted tickets for all cultural events</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Member directory access</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Digital Pass issued annually</li>
            </ul>
          </div>
        </div>

        {/* Tier 3: Volunteer */}
        <div 
          onClick={() => setSelectedTier('Volunteer')}
          className={`bg-white dark:bg-slate-900 rounded-3xl p-8 border-2 transition-all cursor-pointer shadow-lg flex flex-col justify-between ${
            selectedTier === 'Volunteer'
              ? 'border-ukta-gold ring-4 ring-ukta-gold/20'
              : 'border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="space-y-4">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">Volunteer Sign-up</h3>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              FREE <span className="text-xs font-normal text-slate-500">/ Community Contributor</span>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Event execution & coordination roles</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Student counselling network access</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Volunteer certificate of recognition</li>
            </ul>
          </div>
        </div>

      </div>

      {/* Application Form */}
      <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl mx-auto">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
          Apply for {selectedTier}
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Fill out your details to receive your instant UKTA Membership Reference ID and digital pass.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Naidu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@example.co.uk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                UK Phone Number
              </label>
              <input
                type="tel"
                required
                placeholder="+44 7890 000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              UK Address / City
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Chiswick, London W4"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Profession / Occupation (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. IT Architect, NHS Doctor, Student"
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-ukta-red hover:bg-ukta-red-dark text-white font-extrabold py-3.5 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-4"
          >
            <Sparkles className="w-4 h-4 text-ukta-gold" />
            <span>Complete Registration & Issue Pass</span>
          </button>
        </form>
      </div>

      {createdMember && (
        <MembershipCardModal member={createdMember} onClose={() => setCreatedMember(null)} />
      )}
    </div>
  );
}
