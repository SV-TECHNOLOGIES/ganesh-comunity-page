'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { trackMembership } from '@/lib/analytics';
import { ShieldCheck, CheckCircle2, UserCheck, Sparkles, Eye, EyeOff, KeyRound } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SITE_CONFIG } from '@/config/site-config';
import { useAuth } from '@/lib/auth-context';

export default function MembershipPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [selectedTier, setSelectedTier] = useState<'Life Member' | 'Annual Member' | 'Volunteer'>('Life Member');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [profession, setProfession] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      if (!otpSent) {
        // Step 1: Send OTP
        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, type: 'REGISTER' }),
        });

        const data = await res.json();

        if (data.success) {
          setOtpSent(true);
        } else {
          setError(data.error || 'Failed to send OTP. Please try again.');
        }
      } else {
        // Step 2: Complete Registration
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: name,
            email,
            phone,
            tier: selectedTier,
            address,
            profession,
            password,
            otp,
          }),
        });

        const data = await res.json();

        if (!data.success) {
          setError(data.error || 'Registration failed. Please try again.');
          return;
        }

      // Track analytics
      trackMembership(selectedTier, data.user?.id || email);

      // Auto-login the new member
      login(data.user);

      // Celebrate!
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch {}

      setSuccess(true);

      // Redirect to portal after short delay
      setTimeout(() => {
        router.push('/membership/portal');
      }, 2500);

    }} catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#0D0705] text-[#F7EFE1] flex items-center justify-center p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500">
            <ShieldCheck className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-black font-cinzel gold-foil-text">Welcome to UKTA!</h2>
          <p className="text-[#C9B79C] text-sm">
            Your <strong className="text-[#F4C542]">{selectedTier}</strong> membership has been created. Redirecting you to your Member Dashboard…
          </p>
          <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="bg-ukta-gold/20 text-ukta-gold-dark dark:text-ukta-gold text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
          Join UKTA Family
        </span>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">
          UKTA Membership &amp; Community Registration
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Enjoy priority festival seating, digital pass verification, student mentoring, and voting rights.
        </p>

        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-ukta-red dark:text-ukta-gold hover:underline"
          >
            <UserCheck className="w-4 h-4" />
            <span>Already a Member? Login to your Portal &rarr;</span>
          </Link>
        </div>
      </div>

      {/* Tier Cards */}
      {SITE_CONFIG.ENABLE_MEMBERSHIP && <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
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
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> VIP priority seating at Ugadi &amp; Events</li>
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
        {SITE_CONFIG.ENABLE_VOLUNTEER && (
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
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Event execution &amp; coordination roles</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Student counselling network access</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Volunteer certificate of recognition</li>
              </ul>
            </div>
          </div>
        )}

      </div>}

      {/* Registration Form — controlled by ENABLE_MEMBERSHIP_REGISTRATION in site-config.json */}
      {SITE_CONFIG.ENABLE_MEMBERSHIP_REGISTRATION ? (
        <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl mx-auto">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">
            Apply for {selectedTier}
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Create your UKTA account to get your digital membership pass and access the Member Portal.
          </p>

          {error && (
            <div className="mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-700 text-rose-700 dark:text-rose-300 text-xs p-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
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
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.co.uk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                />
              </div>
              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">UK Phone Number</label>
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

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">UK Address / City</label>
              <input
                type="text"
                required
                placeholder="e.g. Chiswick, London W4"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* Profession */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Profession / Occupation (Optional)</label>
              <input
                type="text"
                placeholder="e.g. IT Architect, NHS Doctor, Student"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* Password divider */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <div className="flex items-center gap-2 mb-4">
                <KeyRound className="w-4 h-4 text-ukta-red dark:text-ukta-gold" />
                <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">Set Your Portal Password</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 pr-10 text-xs text-slate-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* OTP Input (Shown only after Send OTP) */}
            {otpSent && (
              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider">Email Verification</span>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Enter 6-digit OTP sent to your email</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-center tracking-widest text-lg font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ukta-red hover:bg-ukta-red-dark text-white font-extrabold py-3.5 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-60"
            >
              <Sparkles className="w-4 h-4 text-ukta-gold" />
              <span>
                {loading 
                  ? (otpSent ? 'Creating Account…' : 'Sending OTP…') 
                  : (otpSent ? 'Complete Registration & Get Member Pass' : 'Send Verification OTP')}
              </span>
            </button>
          </form>
        </div>
      ) : (
        /* Registration coming soon notice */
        <div className="max-w-2xl mx-auto bg-[#0D0705] border-2 border-[#D4AF37]/50 rounded-3xl p-10 text-center space-y-5 shadow-[0_0_40px_rgba(212,175,55,0.15)]">
          <div className="w-16 h-16 bg-[#7A1620]/30 rounded-full flex items-center justify-center mx-auto border-2 border-[#D4AF37]/50">
            <ShieldCheck className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <h2 className="text-2xl font-black font-cinzel text-[#F4C542]">Membership Registration</h2>
          <p className="text-sm text-[#C9B79C] leading-relaxed">
            Online membership registration is <strong className="text-[#F4C542]">coming soon</strong>. Please contact us directly to join the UKTA family.
          </p>
          <p className="text-xs text-[#C9B79C]">
            Already a member?{' '}
            <a href="/login" className="text-[#F4C542] font-bold hover:underline">Login to your portal →</a>
          </p>
        </div>
      )}

    </div>
  );
}
