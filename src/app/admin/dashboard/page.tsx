'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { EVENTS_DATA } from '@/data/events';
import { INITIAL_MEMBERS } from '@/data/members';
import { INITIAL_CHARITY_CASES } from '@/data/charity';
import { Users, Calendar, ShieldAlert, Heart, TrendingUp, Sparkles, Plus } from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    membersCount: INITIAL_MEMBERS.length,
    eventsCount: EVENTS_DATA.filter(e => e.status === 'Upcoming').length,
    charityCasesCount: INITIAL_CHARITY_CASES.filter(c => c.status !== 'Resolved').length,
    donationsTotal: 750,
    analyticsCount: 12,
  });

  const [recentLogs] = useState<any[]>([
    { id: '1', eventName: 'page_view', path: '/', timestamp: '12:00 PM, Today' },
    { id: '2', eventName: 'event_rsvp', path: '/events/evt-ganesh-chaturthi', timestamp: '11:45 AM, Today' },
    { id: '3', eventName: 'donation_completed', path: '/donate', timestamp: '10:30 AM, Today' },
    { id: '4', eventName: 'membership_signup', path: '/membership', timestamp: '09:15 AM, Today' },
  ]);

  const [rsvpsCount, setRsvpsCount] = useState(0);

  useEffect(() => {
    // Fetch live counts from API if available
    Promise.allSettled([
      fetch('/api/admin/members').then(r => r.json()),
      fetch('/api/admin/events').then(r => r.json()),
      fetch('/api/admin/charity-cases').then(r => r.json()),
      fetch('/api/admin/rsvps').then(r => r.json()),
    ]).then(([membersRes, eventsRes, casesRes, rsvpsRes]) => {
      setStats(prev => ({
        ...prev,
        membersCount: membersRes.status === 'fulfilled' && membersRes.value.data ? membersRes.value.data.length : prev.membersCount,
        eventsCount: eventsRes.status === 'fulfilled' && eventsRes.value.data ? eventsRes.value.data.length : prev.eventsCount,
        charityCasesCount: casesRes.status === 'fulfilled' && casesRes.value.data ? casesRes.value.data.length : prev.charityCasesCount,
      }));
      if (rsvpsRes.status === 'fulfilled' && Array.isArray(rsvpsRes.value.data)) {
        setRsvpsCount(rsvpsRes.value.data.length);
      }
    });
  }, []);

  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">MITRA Executive CMS Dashboard</h1>
          <p className="text-xs text-slate-400">
            Real-time metric summary across membership, live events, confidential welfare tickets, and analytics tracking.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/payments"
            className="bg-[#7A1620] hover:bg-[#9C1F2E] text-[#F4C542] border border-[#D4AF37]/50 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
          >
            <Sparkles className="w-4 h-4 text-[#F4C542]" />
            <span>Stripe Payments & Keys</span>
          </Link>
          <Link
            href="/admin/events"
            className="bg-mitra-red hover:bg-mitra-red-dark text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Event</span>
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-mitra-gold">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Members</span>
            <Users className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-white">{stats.membersCount}</div>
          <span className="text-[10px] text-emerald-400 font-semibold block">+12% growth this month</span>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-mitra-gold">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Upcoming Events</span>
            <Calendar className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-white">{stats.eventsCount} Events</div>
          <span className="text-[10px] text-emerald-400 font-semibold block">{rsvpsCount} Total RSVP Registrations in DB</span>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-mitra-red">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Welfare Cases</span>
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-white">{stats.charityCasesCount}</div>
          <span className="text-[10px] text-mitra-gold font-semibold block">Confidential Queue</span>
        </div>

        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Donations Raised</span>
            <Heart className="w-5 h-5" />
          </div>
          <div className="text-3xl font-black text-white">£{stats.donationsTotal}</div>
          <span className="text-[10px] text-slate-400 block">Student Welfare Fund</span>
        </div>

      </div>

      {/* Analytics & Event Stream Preview */}
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-mitra-gold" />
            <h2 className="text-base font-bold text-white">Real-Time Site Analytics Stream</h2>
          </div>
          <Link href="/admin/seo-analytics" className="text-xs text-mitra-gold hover:underline">
            View Live SEO Stream &rarr;
          </Link>
        </div>

        <div className="space-y-2">
          {recentLogs.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No recent tracked events.</p>
          ) : (
            recentLogs.map((log) => (
              <div key={log.id} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="bg-mitra-red/20 text-mitra-gold font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                    {log.eventName}
                  </span>
                  <span className="text-slate-300 font-semibold">{log.path}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}
