'use client';

import { useState } from 'react';
import { DataStore } from '@/lib/data-store';
import { trackEvent } from '@/lib/analytics';
import { MapPin, Mail, Phone, Twitter, Linkedin, Facebook, Instagram, Youtube, Send, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [department, setDepartment] = useState('General Enquiry');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent('contact_form_submitted', '/contact', { department, email });
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="bg-ukta-red/10 text-ukta-red dark:bg-ukta-gold/10 dark:text-ukta-gold text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
          Get In Touch
        </span>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">
          Contact UK Telugu Association
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Have a query or feedback? Choose your relevant department and our committee will respond.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        
        {/* Contact Form */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Send Us a Message</h2>

          {submitted ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-500/40 p-6 rounded-2xl text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-200">Message Received</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Your enquiry has been routed to the <strong>{department}</strong> secretary. We will respond within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Department / Topic
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                >
                  <option value="General Enquiry">General Info & Public Relations</option>
                  <option value="Events & Cultural Committee">Events & Cultural Festival Team</option>
                  <option value="Student & Charity Welfare">Student Counselling & Charity Welfare Officer</option>
                  <option value="Membership Desk">Membership Desk & Pass Enquiries</option>
                  <option value="Corporate Sponsorship">Corporate Sponsorship & Media Partnership</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radhika Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Message Body</label>
                <textarea
                  rows={5}
                  required
                  placeholder="How can UKTA assist you?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-ukta-red hover:bg-ukta-red-dark text-white font-extrabold py-3.5 rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Send Department Message</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* Address & Verified Socials */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">UKTA Secretariat Address</h3>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-ukta-red shrink-0 mt-0.5" />
                <span>UKTA Centre, Chiswick Park, 566 Chiswick High Rd, London W4 5YA, United Kingdom</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-ukta-red shrink-0" />
                <a href="mailto:info@ukta.org.uk" className="font-semibold text-ukta-red dark:text-ukta-gold">info@ukta.org.uk</a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-ukta-red shrink-0" />
                <span>+44 20 8123 4567</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white p-8 rounded-3xl border-2 border-ukta-gold shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-ukta-gold">Official Social Channels</h3>
            <p className="text-xs text-slate-300">
              All UKTA social accounts are verified and updated daily with event recordings and photo albums.
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs pt-2">
              <a href="https://twitter.com/ukta_official" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-800 p-2.5 rounded-xl hover:bg-ukta-red transition-colors">
                <Twitter className="w-4 h-4 text-sky-400" />
                <span>Twitter / X</span>
              </a>
              <a href="https://linkedin.com/company/ukta-official" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-800 p-2.5 rounded-xl hover:bg-ukta-red transition-colors">
                <Linkedin className="w-4 h-4 text-blue-400" />
                <span>LinkedIn</span>
              </a>
              <a href="https://facebook.com/ukteluguassociation" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-800 p-2.5 rounded-xl hover:bg-ukta-red transition-colors">
                <Facebook className="w-4 h-4 text-blue-600" />
                <span>Facebook</span>
              </a>
              <a href="https://youtube.com/@uktaofficial" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-800 p-2.5 rounded-xl hover:bg-ukta-red transition-colors">
                <Youtube className="w-4 h-4 text-red-500" />
                <span>YouTube</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
