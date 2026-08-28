'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserCheck, ShieldAlert, Lock, Mail, KeyRound, ArrowLeft, Sparkles } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site-config';
import { useAuth } from '@/lib/auth-context';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '';
  const { login, isLoggedIn } = useAuth();

  const [activeTab, setActiveTab] = useState<'member' | 'admin'>('member');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect
  useEffect(() => {
    if (isLoggedIn) {
      router.replace(redirectTo || '/membership/portal');
    }
  }, [isLoggedIn, redirectTo, router]);

  const fillDemo = () => {
    if (activeTab === 'member') {
      setEmail(SITE_CONFIG.DEMO_MEMBER_EMAIL);
      setPassword(SITE_CONFIG.DEMO_MEMBER_PASSWORD);
    } else {
      setEmail(SITE_CONFIG.DEMO_ADMIN_EMAIL);
      setPassword(SITE_CONFIG.DEMO_ADMIN_PASSWORD);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, loginType: activeTab }),
      });
      const data = await res.json();

      if (data.success) {
        login(data.user);
        if (activeTab === 'admin') {
          router.push('/admin');
        } else {
          router.push(redirectTo || '/membership/portal');
        }
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0705] text-[#F7EFE1] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Devotional Background Light Rays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#7A1620]/30 via-[#0D0705]/90 to-[#0D0705] z-0 pointer-events-none" />

      <div className="relative z-10 max-w-md w-full temple-card p-8 rounded-3xl border-2 border-[#D4AF37] space-y-6 shadow-[0_0_50px_rgba(212,175,55,0.2)]">
        
        {/* Header Link */}
        <div className="flex justify-between items-center border-b border-[#D4AF37]/30 pb-4">
          <Link href="/" className="text-xs font-bold text-[#F4C542] hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Live Mahotsav</span>
          </Link>
          <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-wider font-cinzel">UKTA PORTAL</span>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-[#160B08] p-1.5 rounded-2xl border border-[#D4AF37]/30">
          <button
            type="button"
            onClick={() => { setActiveTab('member'); setError(''); }}
            className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              activeTab === 'member'
                ? 'bg-[#7A1620] text-[#F4C542] shadow-md border border-[#D4AF37]/40'
                : 'text-[#C9B79C] hover:text-[#F7EFE1]'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Member Login</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('admin'); setError(''); }}
            className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              activeTab === 'admin'
                ? 'bg-[#7A1620] text-[#F4C542] shadow-md border border-[#D4AF37]/40'
                : 'text-[#C9B79C] hover:text-[#F7EFE1]'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Admin CMS</span>
          </button>
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-black font-cinzel gold-foil-text">
            {activeTab === 'member' ? 'MEMBER PORTAL LOGIN' : 'ADMIN CMS LOGIN'}
          </h1>
          <p className="text-xs text-[#C9B79C]">
            {activeTab === 'member'
              ? 'Access your digital membership card & event benefits.'
              : 'Authorized UKTA committee officers & event managers.'}
          </p>
        </div>

        {/* Demo Credentials Quick Fill */}
        {SITE_CONFIG.SHOW_DEMO_CREDENTIALS && (
          <div className="bg-[#160B08] p-3 rounded-2xl border border-[#D4AF37]/20 text-[11px] space-y-2 text-center">
            <div className="flex justify-between items-center px-1">
              <span className="text-[#F4C542] font-bold">Quick Demo Credentials:</span>
              <button
                type="button"
                onClick={fillDemo}
                className="text-[10px] bg-[#7A1620] text-[#F4C542] px-2 py-0.5 rounded-full font-extrabold hover:bg-[#D4AF37] hover:text-[#0D0705] transition-colors"
              >
                Auto-Fill Demo
              </button>
            </div>
            {activeTab === 'member' ? (
              <div className="flex justify-center gap-3 text-[#C9B79C]">
                <span>Email: <code className="text-[#F7EFE1]">{SITE_CONFIG.DEMO_MEMBER_EMAIL}</code></span>
                <span>Pass: <code className="text-[#F7EFE1]">{SITE_CONFIG.DEMO_MEMBER_PASSWORD}</code></span>
              </div>
            ) : (
              <div className="flex justify-center gap-3 text-[#C9B79C]">
                <span>Email: <code className="text-[#F7EFE1]">{SITE_CONFIG.DEMO_ADMIN_EMAIL}</code></span>
                <span>Pass: <code className="text-[#F7EFE1]">{SITE_CONFIG.DEMO_ADMIN_PASSWORD}</code></span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="bg-[#7A1620]/60 border border-rose-500/50 text-rose-200 text-xs p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#C9B79C] font-semibold mb-1">Email / Username</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={activeTab === 'member' ? 'member@ukta.org.uk' : 'admin@ukta.org.uk'}
                className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl pl-10 pr-4 py-2.5 text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[#C9B79C] font-semibold">Password</label>
              {activeTab === 'member' && (
                <Link href="/forgot-password" className="text-[10px] text-[#F4C542] hover:underline">
                  Forgot Password?
                </Link>
              )}
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-[#D4AF37] absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl pl-10 pr-4 py-2.5 text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="gold-button w-full py-3.5 rounded-full font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 text-[#0D0705]" />
            <span>{loading ? 'Authenticating...' : `Sign In to ${activeTab === 'member' ? 'Member Portal' : 'Admin CMS'}`}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-[#D4AF37]/20 text-[11px] text-[#C9B79C] space-y-1">
          <div>
            <span>Not a member yet? </span>
            <Link href="/membership" className="text-[#F4C542] font-bold hover:underline">
              Register for Membership →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0D0705] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
