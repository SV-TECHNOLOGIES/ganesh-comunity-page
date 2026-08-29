'use client';

import { useState } from 'react';
import { LEADERSHIP_DATA } from '@/data/leadership';
import { LeadershipMember } from '@/lib/types';
import LeadershipCard from '@/components/LeadershipCard';
import { Search, Users } from 'lucide-react';

export default function LeadershipPage() {
  const [members] = useState<LeadershipMember[]>(LEADERSHIP_DATA);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Founders', 'Patrons', 'Trustees', 'Executive Committee', 'Nari Shakthi'];

  const filteredMembers = members.filter((m) => {
    const matchesCat = categoryFilter === 'All' || m.category === categoryFilter;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.bio.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="bg-mitra-red/10 text-mitra-red dark:bg-mitra-gold/10 dark:text-mitra-gold text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
          MITRA Governing Bodies
        </span>
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">
          Leadership & Committee Directory
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Meet our dedicated voluntary office bearers, patrons, trustees, and Nari Shakthi council leaders.
        </p>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 overflow-x-auto w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-mitra-red text-white shadow'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-mitra-gold"
          />
        </div>

      </div>

      {/* Directory Grid */}
      {filteredMembers.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-500">No committee members match your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredMembers.map((member) => (
            <LeadershipCard key={member.id} member={member} />
          ))}
        </div>
      )}

    </div>
  );
}
