'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Building2, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  MessageCircle, 
  PlusCircle, 
  Sparkles, 
  CheckCircle2, 
  Tag, 
  Star, 
  Filter, 
  X, 
  ExternalLink,
  ChevronRight,
  Briefcase,
  ShieldCheck,
  Award,
  Users,
  Clock,
  Send,
  Instagram,
  Upload,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TeluguBusiness } from '@/lib/types';

const CATEGORIES = [
  'All',
  'IT & Software Services',
  'Restaurants & Catering',
  'Real Estate & Mortgages',
  'Legal & Immigration',
  'Accounting & Tax Services',
  'Healthcare & Dental',
  'Retail & Groceries',
  'Event Management & Photography',
  'Automobile & Logistics',
  'Education & Tutoring',
  'Other Services',
];

const POPULAR_CITIES = ['All', 'London', 'Slough', 'Milton Keynes', 'Birmingham', 'Reading', 'Manchester', 'Swindon'];

export default function TeluguBusinessPage() {
  const [businesses, setBusinesses] = useState<TeluguBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    category: 'IT & Software Services',
    tagline: '',
    description: '',
    logoUrl: '',
    coverUrl: '',
    email: '',
    phone: '',
    whatsapp: '',
    website: '',
    instagram: '',
    address: '',
    city: 'London',
    postcode: '',
    googleMapsUrl: '',
    specialOffer: '',
  });

  // Logo Upload State
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setUploadError(null);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('useCase', 'general');
      const safeId = (formData.businessName || 'biz')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      uploadData.append('identifier', `telugu-biz-${safeId || 'logo'}`);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      const data = await res.json();
      if (data.success && data.url) {
        setFormData((prev) => ({ ...prev, logoUrl: data.url }));
      } else {
        setUploadError(data.error || 'Failed to upload image. Please try again.');
      }
    } catch (err) {
      console.error('Logo upload error:', err);
      setUploadError('Network error uploading logo image.');
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/telugu-business');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBusinesses(data.data);
      }
    } catch (err) {
      console.error('Error fetching businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError('');
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const res = await fetch('/api/telugu-business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        setSubmitSuccess(true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E65C00', '#FFB800', '#2E7D32', '#FFFFFF'],
        });
        setFormData({
          businessName: '',
          ownerName: '',
          category: 'IT & Software Services',
          tagline: '',
          description: '',
          logoUrl: '',
          coverUrl: '',
          email: '',
          phone: '',
          whatsapp: '',
          website: '',
          instagram: '',
          address: '',
          city: 'London',
          postcode: '',
          googleMapsUrl: '',
          specialOffer: '',
        });
      } else {
        setFormError(data.error || 'Failed to submit business request');
      }
    } catch {
      setFormError('Failed to connect to server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter businesses
  const filteredBusinesses = businesses.filter((b) => {
    const matchesCategory = selectedCategory === 'All' || b.category === selectedCategory;
    const matchesCity = selectedCity === 'All' || b.city.toLowerCase() === selectedCity.toLowerCase();
    const q = searchQuery.toLowerCase().trim();

    if (!q) return matchesCategory && matchesCity;

    const matchesSearch =
      b.businessName.toLowerCase().includes(q) ||
      b.ownerName.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q) ||
      (b.tagline && b.tagline.toLowerCase().includes(q)) ||
      (b.description && b.description.toLowerCase().includes(q)) ||
      (b.specialOffer && b.specialOffer.toLowerCase().includes(q));

    return matchesCategory && matchesCity && matchesSearch;
  });

  const featuredBusinesses = filteredBusinesses.filter((b) => b.isFeatured);
  const regularBusinesses = filteredBusinesses.filter((b) => !b.isFeatured);

  return (
    <div className="min-h-screen bg-[#FFF8F0] text-[#3D1A00] pb-24 selection:bg-[#E65C00] selection:text-white">
      
      {/* ── HERO BANNER ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#3D1A00] via-[#4A2200] to-[#3D1A00] text-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b-4 border-[#E65C00]">
        
        {/* Background Mandala & Glows */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFB800_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#E65C00]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#FFB800]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E65C00]/20 border border-[#FFB800]/40 text-[#FFD4A0] text-xs font-black uppercase tracking-widest backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#FFB800]" />
            <span>MITRA UK Community Business Directory</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-cinzel text-[#FFF8F0] tracking-wide leading-tight">
            TELUGU BUSINESS <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9A3C] via-[#FFD4A0] to-[#FF9A3C]">NETWORK UK</span>
          </h1>

          <p className="text-sm sm:text-base text-[#FFD4A0]/90 max-w-3xl mx-auto leading-relaxed font-medium">
            Discover, support, and connect with trusted Telugu-owned businesses, service providers, and innovators across the United Kingdom. Promoting community commerce and empowering Telugu entrepreneurs abroad.
          </p>

          {/* Quick Action CTA */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => {
                setSubmitSuccess(false);
                setModalOpen(true);
              }}
              className="gold-button px-7 py-3.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-2.5 shadow-xl hover:scale-105 transition-transform"
            >
              <PlusCircle className="w-4 h-4 text-white" />
              <span>Register Your Business </span>
            </button>

            <a
              href="#directory"
              className="px-6 py-3.5 rounded-full text-xs font-bold text-[#FFD4A0] hover:text-white bg-white/10 hover:bg-white/15 border border-white/20 transition-all flex items-center gap-2 backdrop-blur-md"
            >
              <span>Explore Directory</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          {/* Search Bar in Hero */}
          <div className="pt-6 max-w-2xl mx-auto">
            <div className="relative bg-white/95 backdrop-blur-md p-2 rounded-2xl sm:rounded-full shadow-2xl border-2 border-[#E65C00]/40 flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-2 px-3 w-full sm:w-auto flex-1">
                <Search className="w-5 h-5 text-[#E65C00] shrink-0" />
                <input
                  type="text"
                  placeholder="Search by business name, IT, catering, legal, city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-[#3D1A00] placeholder:text-[#6B3A2A]/60 text-xs sm:text-sm font-semibold outline-none py-2"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* City quick filter in search bar */}
              <div className="w-full sm:w-auto flex items-center border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
                <MapPin className="w-4 h-4 text-[#E65C00] shrink-0 mr-1" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-transparent text-xs font-bold text-[#3D1A00] outline-none py-1.5 pr-4 cursor-pointer"
                >
                  <option value="All">All Cities</option>
                  {POPULAR_CITIES.filter(c => c !== 'All').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── MAIN DIRECTORY AREA ── */}
      <div id="directory" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-10">
        
        {/* Category Filter Chips */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black font-cinzel text-[#3D1A00] uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#E65C00]" />
              <span>Filter by Industry &amp; Category</span>
            </h2>
            <span className="text-xs text-[#6B3A2A] font-bold">
              Showing {filteredBusinesses.length} {filteredBusinesses.length === 1 ? 'Business' : 'Businesses'}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-gradient-to-r from-[#E65C00] to-[#FF7A00] text-white shadow-md shadow-[#E65C00]/25 scale-105'
                      : 'bg-white text-[#3D1A00] border border-[#E65C00]/20 hover:border-[#E65C00]/60 hover:bg-[#FFF0E0]'
                  }`}
                >
                  <span>{cat}</span>
                  {cat === 'All' && (
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-black">
                      {businesses.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── FEATURED BUSINESSES BANNER (if any exist in current filter) ── */}
        {featuredBusinesses.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#E65C00] text-white">
                <Star className="w-3.5 h-3.5 fill-current" />
              </span>
              <h2 className="text-lg font-black font-cinzel text-[#3D1A00] tracking-wide">
                FEATURED COMMUNITY PARTNERS
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBusinesses.map((b) => (
                <BusinessCard key={b.id} business={b} isFeatured />
              ))}
            </div>
          </div>
        )}

        {/* ── ALL / REGULAR BUSINESSES ── */}
        <div className="space-y-4">
          {featuredBusinesses.length > 0 && regularBusinesses.length > 0 && (
            <h2 className="text-base font-black font-cinzel text-[#3D1A00] tracking-wide pt-4 border-t border-[#E65C00]/20">
              ALL TELUGU BUSINESSES
            </h2>
          )}

          {filteredBusinesses.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-[#E65C00]/30 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FFF0E0] text-[#E65C00] flex items-center justify-center mx-auto">
                <Building2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-[#3D1A00]">No Businesses Found</h3>
                <p className="text-xs text-[#6B3A2A] max-w-md mx-auto">
                  No registered businesses matched your current search filters. Try changing your search keywords, category, or city.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedCity('All');
                }}
                className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#E65C00] text-white hover:bg-[#CC4000] transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularBusinesses.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>
          )}
        </div>

        {/* ── BOTTOM CALLOUT: REGISTER YOUR BUSINESS ── */}
        <div className="bg-gradient-to-r from-[#4A2200] via-[#5A2A00] to-[#4A2200] border-2 border-[#E65C00]/40 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
          <div className="space-y-3 text-center md:text-left z-10">
            <span className="bg-[#E65C00] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
              Grow with MITRA UK
            </span>
            <h3 className="text-2xl sm:text-3xl font-black font-cinzel text-[#FFF8F0]">
              Are You a Telugu Business Owner in the UK?
            </h3>
            <p className="text-xs sm:text-sm text-[#FFD4A0] max-w-xl leading-relaxed">
              Join hundreds of Telugu professionals, restaurants, service providers, and firms. Showcase your business directly to thousands of Telugu diaspora families across Great Britain.
            </p>
          </div>

          <button
            onClick={() => {
              setSubmitSuccess(false);
              setModalOpen(true);
            }}
            className="gold-button px-8 py-4 rounded-full text-xs font-black uppercase tracking-wider shrink-0 flex items-center gap-2 shadow-2xl hover:scale-105 transition-transform z-10"
          >
            <PlusCircle className="w-4 h-4 text-white" />
            <span>Submit Business Application</span>
          </button>
        </div>

      </div>

      {/* ── MODAL: REGISTER BUSINESS FORM ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-hidden">
          <div className="bg-[#FFFAF5] border-2 border-[#E65C00] rounded-3xl w-full max-w-2xl relative shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FFF0E0] text-[#E65C00] hover:bg-[#E65C00] hover:text-white flex items-center justify-center transition-colors z-30"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            {submitSuccess ? (
              <div className="text-center p-6 sm:p-8 py-8 space-y-5 flex-1 overflow-y-auto">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-500">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black font-cinzel text-[#3D1A00]">
                    Application Submitted!
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6B3A2A] max-w-md mx-auto leading-relaxed">
                    Thank you for applying to the MITRA UK Telugu Business Directory. Your listing has been submitted for administrative verification and will be published once approved.
                  </p>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 rounded-full text-xs font-black bg-[#E65C00] text-white hover:bg-[#CC4000] transition-colors cursor-pointer"
                >
                  Close &amp; Return to Directory
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="flex flex-col h-full overflow-hidden">
                
                {/* Modal Header (Pinned) */}
                <div className="p-5 sm:p-6 pb-3.5 border-b border-[#E65C00]/20 pr-12 shrink-0 bg-[#FFFAF5]">
                  <span className="text-[10px] font-black uppercase text-[#E65C00] tracking-widest block mb-0.5">
                    Self-Registration Application
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black font-cinzel text-[#3D1A00]">
                    Register Your Business
                  </h3>
                  <p className="text-xs text-[#6B3A2A] mt-0.5">
                    Fill in your business details. Submissions are reviewed by MITRA UK admins before being published.
                  </p>
                </div>

                {/* Form Fields Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                  {formError && (
                    <div className="bg-rose-50 text-rose-700 text-xs p-3 rounded-xl border border-rose-200 font-semibold">
                      {formError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                  
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      Business Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="businessName"
                      required
                      placeholder="e.g. Godavari Traditional Caterers"
                      value={formData.businessName}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      Founder / Owner Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="ownerName"
                      required
                      placeholder="e.g. Srinivas Varma"
                      value={formData.ownerName}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    >
                      {CATEGORIES.filter(c => c !== 'All').map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      Tagline / Catchphrase (Optional)
                    </label>
                    <input
                      type="text"
                      name="tagline"
                      placeholder="e.g. Authentic Andhra &amp; Telangana Feast Catering in London"
                      value={formData.tagline}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      Business Description <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      required
                      rows={3}
                      placeholder="Describe your services, specialties, and why the Telugu community should choose you..."
                      value={formData.description}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="contact@mybusiness.co.uk"
                      value={formData.email}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+44 7700 900123"
                      value={formData.phone}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      WhatsApp Direct Number (Optional)
                    </label>
                    <input
                      type="tel"
                      name="whatsapp"
                      placeholder="447700900123"
                      value={formData.whatsapp}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      Website URL (Optional)
                    </label>
                    <input
                      type="url"
                      name="website"
                      placeholder="https://mybusiness.co.uk"
                      value={formData.website}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#3D1A00] flex items-center justify-between">
                      <span>Instagram Page / Handle (Optional)</span>
                      <span className="text-[10px] text-pink-600 font-normal">e.g. @mybusiness</span>
                    </label>
                    <input
                      type="text"
                      name="instagram"
                      placeholder="@mybusiness or https://instagram.com/mybusiness"
                      value={formData.instagram}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      City / Region <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      placeholder="e.g. Slough, London, Reading"
                      value={formData.city}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      Postcode (Optional)
                    </label>
                    <input
                      type="text"
                      name="postcode"
                      placeholder="e.g. SL3 8GW"
                      value={formData.postcode}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      Address / Street Location (Optional)
                    </label>
                    <input
                      type="text"
                      name="address"
                      placeholder="e.g. Langley High Street"
                      value={formData.address}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-bold text-[#3D1A00] flex items-center justify-between">
                      <span>Google Maps Location Link / URL (Optional)</span>
                      <span className="text-[10px] text-[#E65C00] font-normal">Direct link to Google Maps</span>
                    </label>
                    <input
                      type="url"
                      name="googleMapsUrl"
                      placeholder="https://maps.google.com/?q=... or https://maps.app.goo.gl/..."
                      value={formData.googleMapsUrl}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[11px] font-bold text-[#3D1A00]">
                      Special Community Offer / Discount (Optional)
                    </label>
                    <input
                      type="text"
                      name="specialOffer"
                      placeholder="e.g. 10% off for MITRA members or Free First Consultation"
                      value={formData.specialOffer}
                      onChange={handleFormChange}
                      className="w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] focus:outline-none focus:border-[#E65C00]"
                    />
                  </div>

                  {/* Logo Image URL & Upload Option */}
                  <div className="space-y-2 sm:col-span-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-[#3D1A00]">
                        Logo Image (Upload file or paste image URL)
                      </label>
                      {formData.logoUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, logoUrl: '' })}
                          className="text-[10px] text-rose-500 hover:text-rose-700 font-bold transition-colors"
                        >
                          Remove Logo
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2.5 items-start sm:items-center">
                      {/* Logo Preview Thumbnail - Fixed 40x40 */}
                      <div 
                        className="w-10 h-10 min-w-[40px] min-h-[40px] max-w-[40px] max-h-[40px] rounded-xl bg-[#FFF8F0] border border-[#E65C00]/30 flex items-center justify-center shrink-0 overflow-hidden shadow-sm"
                        style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px' }}
                      >
                        {formData.logoUrl ? (
                          <img
                            src={formData.logoUrl}
                            alt="Logo Preview"
                            className="w-full h-full object-contain max-w-full max-h-full"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-[#E65C00]/60" />
                        )}
                      </div>

                      {/* Logo URL Input */}
                      <input
                        type="url"
                        name="logoUrl"
                        value={formData.logoUrl}
                        onChange={(e) => {
                          handleFormChange(e);
                          if (uploadError) setUploadError(null);
                        }}
                        placeholder="https://.../logo.png or upload image"
                        className="flex-1 w-full bg-white border border-[#E65C00]/30 rounded-xl px-3.5 py-2 text-xs text-[#3D1A00] placeholder-[#6B3A2A]/40 focus:outline-none focus:border-[#E65C00]"
                      />

                      {/* Upload Button */}
                      <label
                        htmlFor="public-biz-logo-upload"
                        className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          uploadingLogo
                            ? 'bg-amber-100 text-amber-700 border-amber-300 cursor-not-allowed'
                            : 'bg-[#FFF0E0] hover:bg-[#FFE0C2] text-[#E65C00] border-[#E65C00]/40 shadow-sm'
                        }`}
                      >
                        {uploadingLogo ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#E65C00]" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-[#E65C00]" />
                            <span>Upload Logo</span>
                          </>
                        )}
                        <input
                          id="public-biz-logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={uploadingLogo}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {uploadError && (
                      <p className="text-[11px] text-rose-600 font-semibold">{uploadError}</p>
                    )}
                  </div>

                  </div>
                </div>

                {/* Modal Footer (Pinned) */}
                <div className="p-4 sm:p-5 flex items-center justify-end gap-3 border-t border-[#E65C00]/20 shrink-0 bg-[#FFFAF5]">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-[#6B3A2A] hover:bg-[#FFF0E0] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="gold-button px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-white" />
                    <span>{submitting ? 'Submitting…' : 'Submit for Review'}</span>
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

// ── COMPONENT: BUSINESS CARD ──
function BusinessCard({ business, isFeatured = false }: { business: TeluguBusiness; isFeatured?: boolean }) {
  const targetWebsiteUrl = business.website
    ? (business.website.startsWith('http') ? business.website : `https://${business.website}`)
    : null;

  const instagramClean = (business.instagram || '').trim();
  const instagramUrl = instagramClean
    ? (instagramClean.startsWith('http://') || instagramClean.startsWith('https://')
        ? instagramClean
        : instagramClean.startsWith('@')
        ? `https://instagram.com/${instagramClean.slice(1)}`
        : `https://instagram.com/${instagramClean}`)
    : null;

  const whatsappCleanNumber = (business.whatsapp || business.phone || '').replace(/[^0-9]/g, '');
  const whatsappUrl = whatsappCleanNumber
    ? `https://wa.me/${whatsappCleanNumber}?text=${encodeURIComponent(`Hello ${business.businessName}, I found your business on MITRA UK Telugu Business Directory.`)}`
    : null;

  const mapsQuery = encodeURIComponent(
    [business.address, business.city, business.postcode, 'United Kingdom'].filter(Boolean).join(', ')
  );
  const googleMapsUrl = business.googleMapsUrl || (mapsQuery ? `https://www.google.com/maps/search/?api=1&query=${mapsQuery}` : null);

  return (
    <div
      className={`group relative bg-white rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between hover:shadow-xl ${
        isFeatured
          ? 'border-2 border-[#E65C00] shadow-md shadow-[#E65C00]/10 bg-gradient-to-b from-[#FFFDF9] to-white'
          : 'border border-[#E65C00]/20 hover:border-[#E65C00]/60'
      }`}
    >
      <div className="space-y-4">
        
        {/* Card Header: Category & Badges */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FFF0E0] text-[#E65C00] border border-[#E65C00]/20">
            {business.category}
          </span>
          {isFeatured && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#E65C00] to-[#FF7A00] text-white shadow-sm">
              <Star className="w-3 h-3 fill-current" />
              <span>Featured</span>
            </span>
          )}
        </div>

        {/* Logo / Avatar & Title (STRICT UNIFORM SIZE FOR ALL BUSINESSES) */}
        <div className="flex items-center gap-3">
          {targetWebsiteUrl ? (
            <a
              href={targetWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-16 h-16 min-w-[64px] min-h-[64px] max-w-[64px] max-h-[64px] rounded-2xl overflow-hidden bg-white border-2 border-[#E65C00]/30 hover:border-[#E65C00] shrink-0 relative flex items-center justify-center p-1.5 shadow-sm hover:scale-105 transition-all group/logo cursor-pointer"
              style={{ width: '64px', height: '64px', minWidth: '64px', minHeight: '64px', maxWidth: '64px', maxHeight: '64px' }}
              title={`Visit ${business.businessName} Website (Opens in new tab)`}
            >
              {business.logoUrl ? (
                <img
                  src={business.logoUrl}
                  alt={business.businessName}
                  className="w-full h-full object-contain rounded-xl max-w-full max-h-full"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <Building2 className="w-7 h-7 text-[#E65C00]" />
              )}
            </a>
          ) : (
            <div 
              className="w-16 h-16 min-w-[64px] min-h-[64px] max-w-[64px] max-h-[64px] rounded-2xl overflow-hidden bg-white border border-[#E65C00]/20 shrink-0 relative flex items-center justify-center p-1.5 shadow-sm"
              style={{ width: '64px', height: '64px', minWidth: '64px', minHeight: '64px', maxWidth: '64px', maxHeight: '64px' }}
            >
              {business.logoUrl ? (
                <img
                  src={business.logoUrl}
                  alt={business.businessName}
                  className="w-full h-full object-contain rounded-xl max-w-full max-h-full"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <Building2 className="w-7 h-7 text-[#E65C00]" />
              )}
            </div>
          )}

          <div className="min-w-0 flex-1">
            {targetWebsiteUrl ? (
              <a
                href={targetWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-base font-black font-cinzel text-[#3D1A00] leading-snug group-hover:text-[#E65C00] hover:underline transition-colors cursor-pointer"
                title={`Visit ${business.businessName} Website ↗`}
              >
                <span className="truncate">{business.businessName}</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#E65C00] shrink-0 opacity-70 group-hover:opacity-100" />
              </a>
            ) : (
              <h3 className="text-base font-black font-cinzel text-[#3D1A00] leading-snug group-hover:text-[#E65C00] transition-colors truncate">
                {business.businessName}
              </h3>
            )}
            <p className="text-[11px] font-bold text-[#6B3A2A] truncate">
              Founder: {business.ownerName}
            </p>
          </div>
        </div>

        {/* Tagline */}
        {business.tagline && (
          <p className="text-xs font-bold text-[#E65C00] italic">
            &ldquo;{business.tagline}&rdquo;
          </p>
        )}

        {/* Description */}
        <p className="text-xs text-[#6B3A2A] leading-relaxed line-clamp-3">
          {business.description}
        </p>

        {/* Special Community Offer */}
        {business.specialOffer && (
          <div className="bg-[#FFF4E6] border border-[#E65C00]/30 rounded-2xl p-2.5 flex items-start gap-2 text-xs">
            <Tag className="w-4 h-4 text-[#E65C00] shrink-0 mt-0.5" />
            <span className="font-bold text-[#3D1A00]">
              <span className="text-[#E65C00] font-black">Offer:</span> {business.specialOffer}
            </span>
          </div>
        )}

        {/* Location & Contact Meta */}
        <div className="space-y-2 pt-2.5 border-t border-slate-100 text-xs text-[#6B3A2A]">
          
          {/* Phone / Mobile Number (Display only, call option removed) */}
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-[#E65C00] shrink-0" />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-[#3D1A00]">
                {business.phone}
              </span>
              {business.whatsapp && (
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-bold">
                  WhatsApp
                </span>
              )}
            </div>
          </div>

          {/* Instagram Handle Link */}
          {instagramUrl && (
            <div className="flex items-center gap-2">
              <Instagram className="w-3.5 h-3.5 text-pink-600 shrink-0" />
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-slate-700 hover:text-pink-600 hover:underline flex items-center gap-1.5 transition-colors group/insta truncate"
                title="View Instagram Profile (Opens in new tab)"
              >
                <span className="truncate">
                  {business.instagram?.startsWith('http')
                    ? business.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '@').replace(/\/$/, '')
                    : (business.instagram?.startsWith('@') ? business.instagram : `@${business.instagram}`)}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[9px] font-black text-pink-600 bg-pink-50 border border-pink-200 px-1.5 py-0.2 rounded shrink-0">
                  <span>Instagram</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </a>
            </div>
          )}

          {/* Google Location */}
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#E65C00] shrink-0" />
            {googleMapsUrl ? (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-slate-700 hover:text-[#E65C00] hover:underline flex items-center gap-1.5 transition-colors group/map truncate"
                title="Open in Google Maps (Opens in new tab)"
              >
                <span className="truncate">
                  {business.city}{business.postcode ? `, ${business.postcode}` : ''} {business.address ? `• ${business.address}` : ''}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-[#E65C00] bg-[#FFF0E0] border border-[#E65C00]/30 px-1.5 py-0.5 rounded shrink-0">
                  <span>Google Map</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </a>
            ) : (
              <span className="font-semibold truncate">
                {business.city}{business.postcode ? `, ${business.postcode}` : ''} {business.address ? `• ${business.address}` : ''}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-[#E65C00] shrink-0" />
            <a
              href={`mailto:${business.email}`}
              className="truncate hover:text-[#E65C00] hover:underline transition-colors"
            >
              {business.email}
            </a>
          </div>

        </div>

      </div>

      {/* Action CTA Buttons (Call option removed, Instagram button added) */}
      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
        
        {/* Instagram CTA Button */}
        {instagramUrl && (
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="instagram-button flex-1 min-w-[90px] rounded-xl py-2 px-2.5 text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm group/insta cursor-pointer transition-all"
            style={{
              background: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #F77737 100%)',
              color: '#FFFFFF',
              boxShadow: '0 4px 14px rgba(253, 29, 29, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.25)'
            }}
            title={`Follow ${business.businessName} on Instagram`}
          >
            <Instagram className="w-3.5 h-3.5 shrink-0" style={{ color: '#FFFFFF', stroke: '#FFFFFF' }} />
            <span className="font-bold text-white" style={{ color: '#FFFFFF' }}>Instagram</span>
          </a>
        )}

        {/* WhatsApp CTA Button */}
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[90px] bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 px-2.5 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            title="Chat on WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 shrink-0" />
            <span>WhatsApp</span>
          </a>
        )}

        {/* Website or Email CTA Button */}
        {targetWebsiteUrl ? (
          <a
            href={targetWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[90px] border border-[#E65C00]/30 hover:border-[#E65C00] hover:bg-[#FFF0E0] text-[#3D1A00] rounded-xl py-2 px-2.5 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
            title="Visit official website"
          >
            <Globe className="w-3.5 h-3.5 text-[#E65C00] shrink-0" />
            <span>Website</span>
          </a>
        ) : (
          <a
            href={`mailto:${business.email}`}
            className="flex-1 min-w-[90px] border border-[#E65C00]/30 hover:border-[#E65C00] hover:bg-[#FFF0E0] text-[#3D1A00] rounded-xl py-2 px-2.5 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
            title="Send Email"
          >
            <Mail className="w-3.5 h-3.5 text-[#E65C00] shrink-0" />
            <span>Email</span>
          </a>
        )}
      </div>

    </div>
  );
}
