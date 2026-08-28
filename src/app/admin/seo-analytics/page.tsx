'use client';

import { useState, useEffect } from 'react';
import { DataStore } from '@/lib/data-store';
import { AnalyticsEvent } from '@/lib/types';
import { TrendingUp, Search, ShieldCheck, CheckCircle2, RefreshCw, BarChart3, Globe } from 'lucide-react';

export default function AdminSeoAnalyticsPage() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);

  const refreshLogs = () => {
    DataStore.init();
    setEvents(DataStore.getAnalytics());
  };

  useEffect(() => {
    refreshLogs();
    const interval = setInterval(refreshLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">SEO & Conversion Tracking Inspector</h1>
          <p className="text-xs text-slate-400">
            Real-time event logging framework tracking RSVPs, membership conversions, donation triggers, and search queries.
          </p>
        </div>

        <button
          onClick={refreshLogs}
          className="bg-slate-800 hover:bg-slate-700 text-mitra-gold px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-mitra-gold/30"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Refresh Stream</span>
        </button>
      </div>

      {/* SEO Health Audit Card */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-mitra-navy p-6 rounded-3xl border-2 border-mitra-gold/50 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-mitra-gold" />
            <h2 className="text-base font-extrabold text-white">Next.js SEO & OpenGraph Audit Status</h2>
          </div>
          <span className="bg-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/40">
            SCORE: 100/100 LIGHTHOUSE READY
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Structured Data Schemas</span>
            <span className="font-bold text-white block mt-0.5">schema.org / NGO & Event</span>
          </div>
          <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Canonical & Meta Titles</span>
            <span className="font-bold text-white block mt-0.5">Dynamic Next.js Metadata API</span>
          </div>
          <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Tracking Measurement ID</span>
            <span className="font-bold text-mitra-gold block mt-0.5">G-MITRA2026SEO (Active)</span>
          </div>
        </div>
      </div>

      {/* Live Log Stream Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase text-slate-300">Live Tracked Client Events Stream ({events.length})</h3>
          <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            Live Polling
          </span>
        </div>

        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/50 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4">Timestamp</th>
              <th className="p-4">Event Type</th>
              <th className="p-4">Route Path</th>
              <th className="p-4">Event Payload / Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 font-mono">
            {events.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500 font-sans text-xs">
                  No tracking events recorded yet. Navigate around the site to generate live event logs!
                </td>
              </tr>
            ) : (
              events.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-900/50">
                  <td className="p-4 text-slate-400 text-[11px]">{evt.timestamp}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      evt.eventName === 'event_rsvp' ? 'bg-purple-500/20 text-purple-300' :
                      evt.eventName === 'donation_completed' ? 'bg-emerald-500/20 text-emerald-300' :
                      evt.eventName === 'membership_signup' ? 'bg-mitra-gold/20 text-mitra-gold' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {evt.eventName}
                    </span>
                  </td>
                  <td className="p-4 text-white font-sans font-semibold">{evt.path}</td>
                  <td className="p-4 text-[11px] text-slate-400">
                    {evt.details ? JSON.stringify(evt.details) : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
