'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, Plus, Trash2, ExternalLink, ShieldAlert, ArrowLeft, CheckCircle, Sparkles } from 'lucide-react';

interface SponsorItem {
  id: string;
  name: string;
  tier: string;
  logoUrl: string;
  websiteUrl?: string;
  order: number;
}

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<SponsorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    tier: 'Partner',
    logoUrl: '/assets/organizers-poster.jpg',
    websiteUrl: '',
    order: 0,
  });

  const fetchSponsors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/sponsors');
      const data = await res.json();
      if (data.success) {
        setSponsors(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  const handleAddSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/sponsors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        setFormData({ name: '', tier: 'Partner', logoUrl: '/assets/organizers-poster.jpg', websiteUrl: '', order: 0 });
        fetchSponsors();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this sponsor?')) return;
    try {
      await fetch(`/api/admin/sponsors?id=${id}`, { method: 'DELETE' });
      setSponsors(sponsors.filter(s => s.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-[#3D1A00] p-6 sm:p-10 space-y-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E65C00]/25 pb-6">
        <div className="space-y-1">
          <Link href="/admin" className="text-xs font-bold text-[#E65C00] hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Portal</span>
          </Link>
          <h1 className="text-3xl font-black font-cinzel text-[#3D1A00]">
            SPONSORS &amp; PARTNERS MANAGER
          </h1>
          <p className="text-xs text-[#6B3A2A] font-semibold">Manage Mahotsav sponsors, tiers, and logo branding on the live site.</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="gold-button px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Add New Sponsor</span>
        </button>
      </div>

      {/* Sponsors Table / Cards */}
      <div className="max-w-7xl mx-auto space-y-6">
        {loading ? (
          <div className="text-center py-12 text-[#6B3A2A]">Loading sponsors data...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sponsors.map((sp) => (
              <div key={sp.id} className="temple-card bg-white p-6 rounded-3xl border border-[#E65C00]/25 flex flex-col justify-between space-y-4 relative group shadow-sm">
                <button
                  onClick={() => handleDelete(sp.id)}
                  className="absolute top-4 right-4 text-rose-500 hover:text-rose-700 p-2 rounded-full hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl border border-[#E65C00]/20 overflow-hidden bg-[#FFF0E0] shrink-0">
                    <img src={sp.logoUrl} alt={sp.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="bg-[#FFF0E0] text-[#E65C00] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-[#E65C00]/25 inline-block">
                      {sp.tier}
                    </span>
                    <h3 className="text-base font-bold text-[#3D1A00] mt-1">{sp.name}</h3>
                  </div>
                </div>

                {sp.websiteUrl && sp.websiteUrl !== '#' && (
                  <a
                    href={sp.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#E65C00] hover:underline flex items-center gap-1 font-bold"
                  >
                    <span>Visit Website</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Sponsor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="temple-card bg-white max-w-lg w-full p-8 rounded-3xl border-2 border-[#E65C00]/30 relative space-y-6 shadow-xl">
            <h3 className="text-xl font-black font-cinzel text-[#3D1A00]">ADD NEW SPONSOR</h3>
            <form onSubmit={handleAddSponsor} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#6B3A2A] font-bold mb-1">Sponsor / Brand Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Biryanis and more!"
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                />
              </div>

              <div>
                <label className="block text-[#6B3A2A] font-bold mb-1">Sponsorship Tier</label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none"
                >
                  <option value="Presented By">Presented By (Title Sponsor)</option>
                  <option value="In Association With">In Association With</option>
                  <option value="Platinum Partner">Platinum Partner</option>
                  <option value="Gold Sponsor">Gold Sponsor</option>
                  <option value="Partner">General Partner</option>
                </select>
              </div>

              <div>
                <label className="block text-[#6B3A2A] font-bold mb-1">Logo Asset URL</label>
                <input
                  type="text"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="/assets/organizers-poster.jpg"
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                />
              </div>

              <div>
                <label className="block text-[#6B3A2A] font-bold mb-1">Website URL (Optional)</label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://sponsor.com"
                  className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-4 py-2.5 text-[#3D1A00] focus:border-[#E65C00] focus:outline-none placeholder:text-[#6B3A2A]/40"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#E65C00]/30 text-[#6B3A2A] hover:bg-[#FFF0E0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-button px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs shadow"
                >
                  Save Sponsor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
