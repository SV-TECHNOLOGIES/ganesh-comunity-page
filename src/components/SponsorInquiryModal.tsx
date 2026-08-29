'use client';

import { useState } from 'react';
import { Building2, User, Mail, Phone, MessageSquare, Send, CheckCircle2, X, Sparkles, Award } from 'lucide-react';

interface SponsorInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SponsorInquiryModal({ isOpen, onClose }: SponsorInquiryModalProps) {
  const [company, setCompany] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [tier, setTier] = useState('Brand Partner / Banner Sponsor');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/sponsors/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company,
          contactName,
          email,
          phone,
          tier,
          message,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setErrorMessage(data.error || 'Failed to send inquiry. Please try again.');
      }
    } catch {
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setCompany('');
    setContactName('');
    setEmail('');
    setPhone('');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="temple-card max-w-lg w-full p-6 sm:p-8 rounded-3xl border-2 border-[#E65C00]/40 relative space-y-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto bg-[#FFF8F0]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#6B3A2A] hover:text-[#E65C00] p-2 rounded-full hover:bg-[#FFF0E0] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <>
            {/* Header */}
            <div className="space-y-2 border-b border-[#E65C00]/25 pb-4 pr-8">
              <div className="inline-flex items-center gap-1.5 bg-[#FFF0E0] text-[#E65C00] px-3 py-1 rounded-full text-[10px] font-black uppercase border border-[#E65C00]/30 shadow-sm">
                <Award className="w-3.5 h-3.5" />
                <span>SPONSORSHIP &amp; PARTNERSHIP INQUIRY</span>
              </div>
              <h3 className="text-xl font-black text-[#3D1A00] font-cinzel leading-tight">
                Partner with MITRA UK
              </h3>
              <p className="text-xs text-[#6B3A2A]">
                Reach over 14,000 British-Telugu families &amp; professionals. Submit your details and our team will email you our official sponsorship package.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Company / Sponsor Name */}
              <div>
                <label className="block text-[#6B3A2A] font-semibold mb-1">
                  Company / Organization Name
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-[#E65C00] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. TechCorp UK / Family Trust"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full bg-white border border-[#E65C00]/30 rounded-xl pl-10 pr-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                  />
                </div>
              </div>

              {/* Contact Person Name */}
              <div>
                <label className="block text-[#6B3A2A] font-semibold mb-1">
                  Contact Person Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#E65C00] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Varma"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full bg-white border border-[#E65C00]/30 rounded-xl pl-10 pr-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#6B3A2A] font-semibold mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#E65C00] absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="corporate@company.co.uk"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl pl-10 pr-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#6B3A2A] font-semibold mb-1">
                    Phone / WhatsApp Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#E65C00] absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      placeholder="+44 7900 123456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl pl-10 pr-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                    />
                  </div>
                </div>
              </div>

              {/* Sponsorship Interest Tier */}
              <div>
                <label className="block text-[#6B3A2A] font-semibold mb-1">
                  Sponsorship Area of Interest
                </label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value)}
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none font-bold"
                >
                  <option value="Grand Title Event Sponsor">Grand Title Event Sponsor</option>
                  <option value="Mahaprasadam Food Sponsor">Mahaprasadam Food Sponsor</option>
                  <option value="Flower & Mandap Decoration Sponsor">Flower &amp; Mandap Decoration Sponsor</option>
                  <option value="Brand Partner / Banner Sponsor">Brand Partner / Banner Sponsor</option>
                  <option value="Cultural Showcase & Stage Sponsor">Cultural Showcase &amp; Stage Sponsor</option>
                  <option value="Souvenir / Patrika Magazine Sponsor">Souvenir / Patrika Magazine Sponsor</option>
                  <option value="General Corporate Support">General Corporate Support</option>
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[#6B3A2A] font-semibold mb-1">
                  Additional Notes / Proposal (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Share details about your organization or specific sponsorship goals..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl p-3 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="gold-button w-full py-3.5 rounded-full font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-white" />
                <span>{submitting ? 'Sending Sponsor Inquiry...' : 'Submit Sponsorship Inquiry via Email'}</span>
              </button>
            </form>
          </>
        ) : (
          /* Confirmation Screen */
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-full bg-[#FFF0E0] border-2 border-[#E65C00]/40 flex items-center justify-center mx-auto text-[#E65C00] shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black font-cinzel text-[#E65C00] tracking-widest uppercase block">
                INQUIRY EMAIL SENT!
              </span>
              <h3 className="text-xl font-black text-[#3D1A00] font-cinzel">
                Thank You, {contactName}!
              </h3>
              <p className="text-xs text-[#6B3A2A] leading-relaxed max-w-sm mx-auto">
                Your sponsorship interest for <strong>{tier}</strong> has been emailed to the MITRA UK Executive Committee. A confirmation copy has been sent to <strong>{email}</strong>.
              </p>
            </div>

            <div className="bg-[#FFF0E0] p-4 rounded-2xl border border-[#E65C00]/25 text-left text-xs space-y-1">
              <p className="text-[#3D1A00] font-bold">What happens next?</p>
              <p className="text-[#6B3A2A]">
                Our Sponsorship Lead will review your proposal and get in touch within 24 hours with our complete festival sponsorship package &amp; deliverables.
              </p>
            </div>

            <button
              onClick={handleReset}
              className="gold-button w-full py-3 rounded-full font-black uppercase tracking-wider text-xs"
            >
              Done &amp; Close
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
