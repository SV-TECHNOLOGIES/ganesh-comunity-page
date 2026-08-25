'use client';

import { useState } from 'react';
import { DataStore } from '@/lib/data-store';
import { trackHelpRequest } from '@/lib/analytics';
import { ShieldAlert, CheckCircle2, Lock, Sparkles, X } from 'lucide-react';
import { CharityCase } from '@/lib/types';

export default function CharityTicketModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [category, setCategory] = useState<CharityCase['category']>('Student Counselling');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [details, setDetails] = useState('');
  const [isConfidential, setIsConfidential] = useState(true);
  const [createdCase, setCreatedCase] = useState<CharityCase | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCase = DataStore.submitCharityHelp({
      name,
      email,
      phone,
      category,
      details,
      isConfidential
    });
    trackHelpRequest(category, newCase.id);
    setCreatedCase(newCase);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-ukta-gold/40 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
        >
          <X className="w-6 h-6" />
        </button>

        {createdCase ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Help Request Submitted
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Your ticket has been logged into the UKTA Charity Case Queue. A committee welfare officer will reach out confidentially.
            </p>
            <div className="bg-ukta-navy/5 dark:bg-slate-800 p-4 rounded-2xl border border-ukta-gold/30">
              <span className="text-xs font-semibold text-slate-500 uppercase block mb-1">Your Ticket Reference Number</span>
              <span className="text-2xl font-black text-ukta-red dark:text-ukta-gold tracking-widest">{createdCase.id}</span>
            </div>
            <div className="text-xs text-slate-500 flex items-center justify-center gap-1">
              <Lock className="w-3.5 h-3.5" />
              <span>Confidentiality Protocol Active</span>
            </div>
            <button
              onClick={() => {
                setCreatedCase(null);
                onClose();
              }}
              className="mt-4 bg-ukta-red hover:bg-ukta-red-dark text-white font-bold px-8 py-3 rounded-xl text-sm shadow transition-all"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2.5 bg-ukta-red/10 text-ukta-red rounded-2xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Request for Help / Welfare Support
                </h2>
                <p className="text-xs text-slate-500">
                  Confidential support provided by UKTA Committee Welfare Officers.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category of Assistance
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
              >
                <option value="Student Counselling">Student Counselling & Academic Guidance</option>
                <option value="Repatriation Support">Repatriation Support & Emergency Logistics</option>
                <option value="Women Helpline">Women Helpline & Legal Advisory</option>
                <option value="Community Service">Community Service & Healthcare Navigation</option>
                <option value="Emergency Assistance">Emergency Financial Relief Assistance</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Venkat Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                UK Contact Phone Number
              </label>
              <input
                type="tel"
                required
                placeholder="+44 7700 900000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Details of your Situation / Request
              </label>
              <textarea
                rows={4}
                required
                placeholder="Please describe your situation in detail so our welfare officer can assist..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="conf"
                checked={isConfidential}
                onChange={(e) => setIsConfidential(e.target.checked)}
                className="w-4 h-4 text-ukta-red rounded border-slate-300 focus:ring-ukta-red"
              />
              <label htmlFor="conf" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                Strictly Confidential (Restricted to Welfare Committee Lead only)
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-ukta-red hover:bg-ukta-red-dark text-white font-bold py-3 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-4"
            >
              <Sparkles className="w-4 h-4 text-ukta-gold" />
              <span>Submit Help Ticket</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
