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
    <div className="min-h-screen bg-[#0D0705] text-[#F7EFE1] p-6 sm:p-10 space-y-8">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#D4AF37]/30 pb-6">
        <div className="space-y-1">
          <Link href="/admin" className="text-xs font-bold text-[#F4C542] hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Admin Portal</span>
          </Link>
          <h1 className="text-3xl font-black font-cinzel gold-foil-text">
            SPONSORS & PARTNERS MANAGER
          </h1>
          <p className="text-xs text-[#C9B79C]">Manage Mahotsav sponsors, tiers, and logo branding on the live site.</p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="gold-button px-6 py-3 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-[#0D0705]" />
          <span>Add New Sponsor</span>
        </button>
      </div>

      {/* Sponsors Table / Cards */}
      <div className="max-w-7xl mx-auto space-y-6">
        {loading ? (
          <div className="text-center py-12 text-[#C9B79C]">Loading sponsors data...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sponsors.map((sp) => (
              <div key={sp.id} className="temple-card p-6 rounded-3xl border border-[#D4AF37]/40 flex flex-col justify-between space-y-4 relative group">
                <button
                  onClick={() => handleDelete(sp.id)}
                  className="absolute top-4 right-4 text-rose-400 hover:text-rose-600 p-2 rounded-full hover:bg-[#7A1620]/40 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl border border-[#D4AF37]/50 overflow-hidden bg-[#160B08] shrink-0">
                    <img src={sp.logoUrl} alt={sp.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="bg-[#7A1620] text-[#F4C542] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30 inline-block">
                      {sp.tier}
                    </span>
                    <h3 className="text-base font-bold text-[#F7EFE1] mt-1">{sp.name}</h3>
                  </div>
                </div>

                {sp.websiteUrl && sp.websiteUrl !== '#' && (
                  <a
                    href={sp.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#F4C542] hover:underline flex items-center gap-1 font-semibold"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="temple-card max-w-lg w-full p-8 rounded-3xl border-2 border-[#D4AF37] relative space-y-6">
            <h3 className="text-xl font-black font-cinzel gold-foil-text">ADD NEW SPONSOR</h3>
            <form onSubmit={handleAddSponsor} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#C9B79C] font-semibold mb-1">Sponsor / Brand Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Biryanis and more!"
                  className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#C9B79C] font-semibold mb-1">Sponsorship Tier</label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                  className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
                >
                  <option value="Presented By">Presented By (Title Sponsor)</option>
                  <option value="In Association With">In Association With</option>
                  <option value="Platinum Partner">Platinum Partner</option>
                  <option value="Gold Sponsor">Gold Sponsor</option>
                  <option value="Partner">General Partner</option>
                </select>
              </div>

              <div>
                <label className="block text-[#C9B79C] font-semibold mb-1">Logo Asset URL</label>
                <input
                  type="text"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="/assets/organizers-poster.jpg"
                  className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#C9B79C] font-semibold mb-1">Website URL (Optional)</label>
                <input
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                  placeholder="https://sponsor.com"
                  className="w-full bg-[#0D0705] border border-[#D4AF37]/40 rounded-xl px-4 py-2.5 text-[#F7EFE1] focus:border-[#F4C542] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#D4AF37]/40 text-[#C9B79C]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="gold-button px-6 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs"
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
