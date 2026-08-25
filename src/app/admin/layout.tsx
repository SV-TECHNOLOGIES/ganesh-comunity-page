'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Role } from '@/lib/types';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  ShieldAlert, 
  Image as ImageIcon, 
  TrendingUp, 
  LogOut, 
  UserCheck, 
  Settings,
  ChevronRight,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [currentRole, setCurrentRole] = useState<Role>('Super Admin');

  const roles: Role[] = [
    'Super Admin',
    'Media Secretary',
    'Events Coordinator',
    'Membership Officer',
    'Charity Officer'
  ];

  const navItems = [
    { label: 'Dashboard & Stats', href: '/admin/dashboard', icon: LayoutDashboard, roleAccess: ['Super Admin', 'Media Secretary', 'Events Coordinator', 'Membership Officer', 'Charity Officer'] },
    { label: 'Events Manager', href: '/admin/events', icon: Calendar, roleAccess: ['Super Admin', 'Events Coordinator'] },
    { label: 'Membership Database', href: '/admin/members', icon: Users, roleAccess: ['Super Admin', 'Membership Officer'] },
    { label: 'Charity Case Queue', href: '/admin/charity-cases', icon: ShieldAlert, roleAccess: ['Super Admin', 'Charity Officer'] },
    { label: 'Media & Patrika', href: '/admin/media', icon: ImageIcon, roleAccess: ['Super Admin', 'Media Secretary'] },
    { label: 'SEO & Analytics Stream', href: '/admin/seo-analytics', icon: TrendingUp, roleAccess: ['Super Admin'] },
  ];

  const isCurrent = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          
          <div className="space-y-2">
            <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-ukta-gold hover:underline">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Website</span>
            </Link>
            <div className="flex items-center gap-3 pt-2">
              <div className="w-9 h-9 rounded-full bg-ukta-gold text-ukta-navy font-black flex items-center justify-center text-sm shadow">
                CMS
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white leading-tight">UKTA Admin</h2>
                <span className="text-[10px] text-slate-400">Control Panel v2.0</span>
              </div>
            </div>
          </div>

          {/* Role Switcher */}
          <div className="bg-slate-900 p-3 rounded-2xl border border-ukta-gold/30 space-y-1">
            <label className="text-[10px] font-bold uppercase text-ukta-gold block">
              Simulate Active RBAC Role:
            </label>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as Role)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-ukta-gold"
            >
              {roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1 text-xs font-semibold">
            {navItems.map((item) => {
              const IconComp = item.icon;
              const hasAccess = item.roleAccess.includes(currentRole);
              return (
                <Link
                  key={item.href}
                  href={hasAccess ? item.href : '#'}
                  onClick={(e) => {
                    if (!hasAccess) {
                      e.preventDefault();
                      alert(`Access Restricted: Role "${currentRole}" does not have permission to manage ${item.label}.`);
                    }
                  }}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                    isCurrent(item.href)
                      ? 'bg-ukta-red text-white font-bold shadow'
                      : hasAccess
                      ? 'text-slate-300 hover:bg-slate-900 hover:text-white'
                      : 'text-slate-600 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComp className="w-4 h-4 text-ukta-gold" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                </Link>
              );
            })}
          </nav>

        </div>

        {/* Footer info */}
        <div className="pt-6 border-t border-slate-800 text-[10px] text-slate-500 space-y-1">
          <div className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SEO & Analytics Engine Online</span>
          </div>
          <div>Audit Logging: ACTIVE</div>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {children}
      </main>

    </div>
  );
}
