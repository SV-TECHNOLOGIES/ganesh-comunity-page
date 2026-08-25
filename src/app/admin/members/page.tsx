'use client';

import { useState, useEffect } from 'react';
import { DataStore } from '@/lib/data-store';
import { Member } from '@/lib/types';
import MembershipCardModal from '@/components/MembershipCardModal';
import { Users, Search, Download, ShieldCheck, QrCode } from 'lucide-react';

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [query, setQuery] = useState('');
  const [passModalMember, setPassModalMember] = useState<Member | null>(null);

  useEffect(() => {
    DataStore.init();
    setMembers(DataStore.getMembers());
  }, []);

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.email.toLowerCase().includes(query.toLowerCase()) ||
      m.id.toLowerCase().includes(query.toLowerCase()) ||
      m.tier.toLowerCase().includes(query.toLowerCase())
  );

  const exportMembersCSV = () => {
    let csv = 'Member ID,Full Name,Email,Phone,Tier,Status,Start Date,Expiry Date\n';
    filteredMembers.forEach((m) => {
      csv += `"${m.id}","${m.name}","${m.email}","${m.phone}","${m.tier}","${m.status}","${m.startDate}","${m.expiryDate}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `UKTA_Members_List_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Membership Database Manager</h1>
          <p className="text-xs text-slate-400">
            Search member records, verify digital passes, and export membership lists to CSV.
          </p>
        </div>

        <button
          onClick={exportMembersCSV}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow"
        >
          <Download className="w-4 h-4" />
          <span>Export All Members (CSV)</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by ID, name, email, or tier..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500"
        />
      </div>

      {/* Members Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="p-4">Member ID</th>
              <th className="p-4">Full Name & Email</th>
              <th className="p-4">Tier</th>
              <th className="p-4">Status</th>
              <th className="p-4">Expiry Date</th>
              <th className="p-4 text-right">Digital Pass</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredMembers.map((mem) => (
              <tr key={mem.id} className="hover:bg-slate-900/50">
                <td className="p-4 font-mono font-bold text-ukta-gold">{mem.id}</td>
                <td className="p-4">
                  <div className="font-bold text-white">{mem.name}</div>
                  <div className="text-[11px] text-slate-400">{mem.email}</div>
                </td>
                <td className="p-4">
                  <span className="bg-ukta-navy text-ukta-gold border border-ukta-gold/30 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                    {mem.tier}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{mem.status}</span>
                  </span>
                </td>
                <td className="p-4">{mem.expiryDate}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => setPassModalMember(mem)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg font-semibold text-[11px] inline-flex items-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5 text-ukta-gold" />
                    <span>Pass</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {passModalMember && (
        <MembershipCardModal member={passModalMember} onClose={() => setPassModalMember(null)} />
      )}

    </div>
  );
}
