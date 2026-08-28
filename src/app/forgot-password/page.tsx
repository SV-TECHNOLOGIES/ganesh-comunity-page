'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, KeyRound, ShieldCheck, Sparkles, EyeOff, Eye } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'FORGOT_PASSWORD' }),
      });
      const data = await res.json();

      if (data.success) {
        setOtpSent(true);
      } else {
        setError(data.error || 'Failed to send OTP.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.error || 'Failed to reset password.');
      }
    } catch {
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
          <h2 className="text-3xl font-black font-cinzel gold-foil-text">Password Reset!</h2>
          <p className="text-[#C9B79C] text-sm">
            Your password has been successfully updated. Redirecting you to login...
          </p>
          <div className="w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0705] text-[#F7EFE1] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#7A1620]/30 via-[#0D0705]/90 to-[#0D0705] z-0 pointer-events-none" />

      <div className="relative z-10 max-w-md w-full temple-card p-8 rounded-3xl border-2 border-[#D4AF37] space-y-6 shadow-[0_0_50px_rgba(212,175,55,0.2)]">
        
        <div className="flex justify-between items-center border-b border-[#D4AF37]/30 pb-4">
          <Link href="/login" className="text-xs font-bold text-[#F4C542] hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </Link>
          <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-wider font-cinzel">PASSWORD RECOVERY</span>
        </div>

        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black font-cinzel gold-foil-text">
            Forgot Password
          </h1>
          <p className="text-xs text-[#C9B79C]">
            {!otpSent 
              ? 'Enter your registered email to receive a secure One-Time Password.'
              : 'Enter the OTP sent to your email along with your new password.'}
          </p>
        </div>

        {error && (
          <div className="bg-[#7A1620]/60 border border-rose-500/50 text-rose-200 text-xs p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOTP} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#C9B79C] font-semibold mb-1">Registered Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="member@mitra.org.uk"
                  className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl pl-10 pr-4 py-2.5 text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="gold-button w-full py-3.5 rounded-full font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 mt-2"
            >
              <Sparkles className="w-4 h-4 text-[#0D0705]" />
              <span>{loading ? 'Sending OTP...' : 'Send Recovery OTP'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#C9B79C] font-semibold mb-1">6-Digit OTP</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-center tracking-widest font-bold text-lg text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#C9B79C] font-semibold mb-1">New Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl pl-10 pr-10 py-2.5 text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#D4AF37] hover:text-[#F4C542]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[#C9B79C] font-semibold mb-1">Confirm New Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl pl-10 pr-4 py-2.5 text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !otp || !newPassword || !confirmPassword}
              className="gold-button w-full py-3.5 rounded-full font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 mt-2"
            >
              <ShieldCheck className="w-4 h-4 text-[#0D0705]" />
              <span>{loading ? 'Resetting Password...' : 'Reset Password'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
