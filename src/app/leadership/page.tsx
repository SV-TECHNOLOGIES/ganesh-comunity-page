'use client';

import { useState, useEffect } from 'react';
import { LeadershipMember } from '@/lib/types';
import LeadershipCard from '@/components/LeadershipCard';
import { Search, Users, RefreshCw, Sparkles } from 'lucide-react';

export default function LeadershipPage() {
  const [members, setMembers] = useState<LeadershipMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
// Founders 
// Patrons
// Executive committee 
// Mitra Mahila
  const categories = ['All', 'Founders', 'Patrons', 'Executive Committee', 'Mitra Mahila'];

  const fetchLeadership = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leadership', { cache: 'no-store' });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMembers(json.data);
      }
    } catch (e) {
      console.error('Failed to load leadership members:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeadership();
  }, []);

  const filteredMembers = members.filter((m) => {
    const matchesCat = categoryFilter === 'All' || m.category === categoryFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCat;

    const matchesSearch =
      m.name.toLowerCase().includes(q) ||
      m.designation.toLowerCase().includes(q) ||
      (m.bio && m.bio.toLowerCase().includes(q));

    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-[#3D1A00] py-12 px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Page Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 bg-[#FFF0E0] text-[#E65C00] px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider border border-[#E65C00]/30 shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MITRA GOVERNING BODIES</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-cinzel text-[#3D1A00] tracking-wide">
          LEADERSHIP &amp; COMMITTEE DIRECTORY
        </h1>
        <p className="text-xs sm:text-sm text-[#6B3A2A] font-semibold leading-relaxed">
          Meet our dedicated voluntary office bearers, patrons, and Nari Shakthi council leaders serving our community across the UK.
        </p>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="max-w-7xl mx-auto temple-card bg-white p-4 rounded-3xl border border-[#E65C00]/25 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 overflow-x-auto w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-[#E65C00] text-white shadow-sm border border-[#E65C00]/40'
                  : 'bg-[#FFF8F0] text-[#6B3A2A] hover:bg-[#FFF0E0] hover:text-[#E65C00] border border-[#E65C00]/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#E65C00] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FFF8F0] border border-[#E65C00]/30 rounded-xl text-xs text-[#3D1A00] placeholder:text-[#6B3A2A]/50 focus:outline-none focus:border-[#E65C00]"
          />
        </div>

      </div>

      {/* Directory Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-20 temple-card bg-white rounded-3xl border border-[#E65C00]/20 space-y-3">
            <RefreshCw className="w-8 h-8 text-[#E65C00] animate-spin mx-auto" />
            <p className="text-xs text-[#6B3A2A] font-semibold">Loading leadership directory from database...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-16 temple-card bg-white rounded-3xl border border-[#E65C00]/20 space-y-3">
            <Users className="w-12 h-12 text-[#E65C00]/40 mx-auto" />
            <p className="text-sm font-bold text-[#3D1A00]">No committee members found</p>
            <p className="text-xs text-[#6B3A2A]">
              {searchQuery || categoryFilter !== 'All'
                ? 'Try adjusting your search query or category filter.'
                : 'Leadership members will appear here once added in the database.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map((member) => (
              <LeadershipCard key={member.id} member={member} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
