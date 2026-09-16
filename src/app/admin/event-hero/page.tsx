'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Save, 
  Eye, 
  Box, 
  Image as ImageIcon, 
  Video, 
  Home, 
  Flame, 
  Heart, 
  Check, 
  RefreshCw, 
  Palette, 
  ExternalLink,
  Layers,
  Calendar,
  AlertCircle,
  Plus,
  Play,
  Award,
  Feather,
  Compass,
  RotateCw,
} from 'lucide-react';
import { EventTemplateConfig, EventHeroConfig, HeroType, EventHeroStorageConfig } from '@/types/event-template';

interface EventItemOption {
  id: string;
  title: string;
  category?: string;
  date?: string;
}

const COLOR_PRESETS = [
  { name: 'Saffron & Gold (Ganesh)', primary: '#E65C00', accent: '#CC4000', bg: '#FFF8F0' },
  { name: 'Diwali Festive Amber', primary: '#D97706', accent: '#B45309', bg: '#FFFBEB' },
  { name: 'Temple Royal Maroon', primary: '#881337', accent: '#9F1239', bg: '#FFF1F2' },
  { name: 'Ugadi Emerald Green', primary: '#047857', accent: '#065F46', bg: '#F0FDF4' },
  { name: 'Midnight Navy & Gold', primary: '#1E3A8A', accent: '#1D4ED8', bg: '#F8FAFC' },
];

const HERO_VARIANTS: Record<
  HeroType,
  Array<{
    id: string;
    name: string;
    badge: string;
    desc: string;
    icon: any;
  }>
> = {
  '3d-model': [
    {
      id: '3d-sanctum',
      name: 'Classic Sanctum',
      badge: 'V1 Centered',
      desc: 'Full-width centered temple sanctum with particle dust & divine golden rays',
      icon: Flame,
    },
    {
      id: '3d-split',
      name: 'Interactive Split',
      badge: 'V2 Side-by-Side',
      desc: '2-column layout with left typography & right 360° interactive 3D stage',
      icon: Layers,
    },
    {
      id: '3d-pedestal',
      name: 'Exhibition Pedestal',
      badge: 'V3 Spotlight',
      desc: 'Spotlight showcase with glowing pedestal disc & floating specs HUD cards',
      icon: Award,
    },
    {
      id: '3d-floating',
      name: 'Holographic Island',
      badge: 'V4 Cosmic Rings',
      desc: 'Celestial floating idol with concentric energy rings & highlight chips',
      icon: Sparkles,
    },
  ],
  'image': [
    {
      id: 'image-split',
      name: 'Modern Split Stage',
      badge: 'V1 2-Column',
      desc: 'Left typography & CTAs, right framed interactive visual card with ambient glow',
      icon: Layers,
    },
    {
      id: 'image-fullscreen',
      name: 'Cinematic Fullscreen',
      badge: 'V2 Full-Bleed',
      desc: 'Full-bleed edge-to-edge photography with dark vignette & gold-foil title',
      icon: ImageIcon,
    },
    {
      id: 'image-card-showcase',
      name: 'Elevated 3D Card',
      badge: 'V3 3D Card',
      desc: 'Floating showcase card with perspective lift, category badge & integrated CTA bar',
      icon: Box,
    },
    {
      id: 'image-editorial',
      name: 'Editorial Magazine',
      badge: 'V4 Editorial',
      desc: 'Asymmetrical masthead with overlapping photo frame & cultural highlights ticker',
      icon: Feather,
    },
  ],
  'video': [
    {
      id: 'video-cinema',
      name: 'Cinematic Backdrop',
      badge: 'V1 Fullscreen Loop',
      desc: 'Full-bleed looping video background with dark gradient scrim & centered gold text',
      icon: Video,
    },
    {
      id: 'video-split',
      name: 'Split Media Stage',
      badge: 'V2 2-Column Video',
      desc: 'Left event details & registration, right framed 16:9 HD video player',
      icon: Layers,
    },
    {
      id: 'video-theater',
      name: 'Ambilight Theater',
      badge: 'V3 Theater Stage',
      desc: 'Centered cinema screen with ambient theme glow radiating behind it',
      icon: Play,
    },
    {
      id: 'video-banner-strip',
      name: '21:9 Cinema Scope',
      badge: 'V4 Panoramic Strip',
      desc: 'Ultra-widescreen cinema scope banner with floating overlay pill bar',
      icon: Compass,
    },
  ],
};

export default function EventHeroAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [storageData, setStorageData] = useState<EventHeroStorageConfig | null>(null);
  const [availableEvents, setAvailableEvents] = useState<EventItemOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('evt-ganesh-chaturthi');

  // Form state for current selected event
  const [currentConfig, setCurrentConfig] = useState<EventTemplateConfig | null>(null);

  // Load storage config and DB events
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Load admin config
      const resConfig = await fetch('/api/admin/event-hero-config');
      const dataConfig = await resConfig.json();

      if (dataConfig.success && dataConfig.data) {
        setStorageData(dataConfig.data);
        const activeId = dataConfig.data.activeHomeEventId || 'evt-ganesh-chaturthi';
        const initialId = dataConfig.data.events[activeId] ? activeId : Object.keys(dataConfig.data.events)[0] || 'evt-ganesh-chaturthi';
        setSelectedEventId(initialId);
        setCurrentConfig(dataConfig.data.events[initialId] || null);
      }

      // 2. Load DB events for picker options
      const resEvents = await fetch('/api/events');
      const dataEvents = await resEvents.json();
      if (dataEvents.success && Array.isArray(dataEvents.data)) {
        setAvailableEvents(dataEvents.data);
      }
    } catch (err) {
      console.error('Failed to load event hero config:', err);
      setError('Failed to load configurations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When switching event tab
  const handleSelectEvent = (id: string) => {
    setSelectedEventId(id);
    if (storageData?.events[id]) {
      setCurrentConfig(storageData.events[id]);
    } else {
      // Create new draft config based on template
      const baseEvent = availableEvents.find((e) => e.id === id);
      const newConfig: EventTemplateConfig = {
        id,
        title: baseEvent?.title || 'New Event Celebration',
        eventSlug: baseEvent ? `events/${baseEvent.id}` : 'new-event',
        targetDate: baseEvent?.date ? `${baseEvent.date}T09:00:00.000Z` : new Date().toISOString(),
        hero: {
          heroType: 'image',
          bannerImageUrl: '/assets/poster.jpg',
          presenterBadge: 'Welcome to Mana Indian Telugu Roots Abroad (MITRA UK)',
          title: baseEvent?.title.toUpperCase() || 'GRAND COMMUNITY FESTIVAL',
          subtitle: 'UK TELUGU CELEBRATION 2026',
          tagline: 'Join the grand festivities, food stalls and cultural programs',
          loadingText: 'LOADING CELEBRATION...',
          scrollCueText: 'Explore Event Schedule',
          primaryColor: '#E65C00',
          accentColor: '#CC4000',
          backgroundColor: '#FFF8F0',
          primaryCta: { label: 'Register / RSVP', action: 'rsvp' },
          secondaryCta: { label: 'Join Community WhatsApp', action: 'whatsapp' },
          whatsAppUrl: 'https://chat.whatsapp.com/IVqirWWzM96IBNRfhSWGEd',
        },
        sections: {
          showCountdown: true,
          showEventDetails: true,
          showStory: true,
          showSpecs: false,
          showMediaGallery: true,
          showOfferings: true,
          showSponsors: true,
        },
      };
      setCurrentConfig(newConfig);
    }
  };

  // Set current event as featured on Home
  const handleSetAsHomeHero = async () => {
    if (!currentConfig || !storageData) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/event-hero-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activeHomeEventId: currentConfig.id,
          event: currentConfig,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setStorageData(resData.data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError(resData.error || 'Failed to update home hero.');
      }
    } catch {
      setError('Network error updating home hero.');
    } finally {
      setSaving(false);
    }
  };

  // Save changes
  const handleSave = async () => {
    if (!currentConfig) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/event-hero-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: currentConfig,
        }),
      });
      const resData = await res.json();
      if (resData.success) {
        setStorageData(resData.data);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError(resData.error || 'Failed to save config.');
      }
    } catch {
      setError('Network error saving configuration.');
    } finally {
      setSaving(false);
    }
  };

  const updateHero = (field: keyof EventHeroConfig, val: any) => {
    if (!currentConfig) return;
    setCurrentConfig({
      ...currentConfig,
      hero: {
        ...currentConfig.hero,
        [field]: val,
      },
    });
  };

  const handleHeroTypeChange = (type: HeroType) => {
    if (!currentConfig) return;
    const defaultVariant =
      type === '3d-model' ? '3d-sanctum' :
      type === 'image' ? 'image-split' :
      'video-split';

    setCurrentConfig({
      ...currentConfig,
      hero: {
        ...currentConfig.hero,
        heroType: type,
        heroVariant: defaultVariant,
      },
    });
  };

  const updateSectionToggle = (section: keyof EventTemplateConfig['sections'], val: boolean) => {
    if (!currentConfig) return;
    setCurrentConfig({
      ...currentConfig,
      sections: {
        ...currentConfig.sections,
        [section]: val,
      },
    });
  };

  const isCurrentHomeHero = storageData?.activeHomeEventId === currentConfig?.id;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-mitra-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-mitra-gold text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Experimental Template &amp; Hero Engine</span>
          </div>
          <h1 className="text-2xl font-black text-white mt-1">Event Hero &amp; Landing Page Manager</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure custom 3D models, image banners, theme colors, and select which event hero appears on the Public Home Page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-300 text-xs font-bold animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Configuration saved successfully and updated in JSON storage!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-950/60 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-300 text-xs font-bold">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Event Selection Tabs */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex justify-between items-center text-xs font-bold text-slate-400 px-1">
          <span>SELECT EVENT TO CUSTOMIZE:</span>
          <span className="text-[11px] text-amber-400">
            Active Home Event: <strong>{storageData?.events[storageData.activeHomeEventId]?.title || storageData?.activeHomeEventId}</strong>
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.values(storageData?.events || {}).map((evt) => {
            const isSelected = selectedEventId === evt.id;
            const isHome = storageData?.activeHomeEventId === evt.id;
            return (
              <button
                key={evt.id}
                onClick={() => handleSelectEvent(evt.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <span>{evt.title}</span>
                {isHome && (
                  <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                    Home Hero
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Add from Available Events if not yet in storage */}
          {availableEvents
            .filter((e) => !storageData?.events[e.id])
            .map((e) => (
              <button
                key={e.id}
                onClick={() => handleSelectEvent(e.id)}
                className="px-3 py-2 rounded-xl text-xs font-medium border border-dashed border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500 flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3" />
                <span>Add {e.title.slice(0, 18)}...</span>
              </button>
            ))}
        </div>
      </div>

      {currentConfig && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Controls Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Home Feature Ribbon */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${isCurrentHomeHero ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-900 text-slate-500'}`}>
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Feature on Public Home Page</h3>
                  <p className="text-xs text-slate-400">
                    {isCurrentHomeHero
                      ? 'This event hero is currently displayed on the root website page.'
                      : 'Make this event hero the centerpiece of the MITRA UK homepage.'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSetAsHomeHero}
                disabled={isCurrentHomeHero || saving}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                  isCurrentHomeHero
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md'
                }`}
              >
                {isCurrentHomeHero ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Active on Home</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Set as Home Hero</span>
                  </>
                )}
              </button>
            </div>

            {/* 1. Hero Type Selector */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                1. Hero Display Style
              </label>

              <div className="grid grid-cols-3 gap-3">
                {(['3d-model', 'image', 'video'] as HeroType[]).map((type) => {
                  const isSelected = currentConfig.hero.heroType === type;
                  const Icon = type === '3d-model' ? Box : type === 'image' ? ImageIcon : Video;
                  const label = type === '3d-model' ? '3D GLTF Model' : type === 'image' ? 'Image Banner' : 'Video Teaser';

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleHeroTypeChange(type)}
                      className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-xs font-bold">{label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Layout Variant Selector */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                    Layout Variant / Template Style
                  </label>
                  <span className="text-[10px] text-amber-400 font-bold">
                    Active: {currentConfig.hero.heroVariant || (currentConfig.hero.heroType === '3d-model' ? '3d-sanctum' : currentConfig.hero.heroType === 'image' ? 'image-split' : 'video-split')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {HERO_VARIANTS[currentConfig.hero.heroType].map((v) => {
                    const currentVariant = currentConfig.hero.heroVariant || (
                      currentConfig.hero.heroType === '3d-model' ? '3d-sanctum' :
                      currentConfig.hero.heroType === 'image' ? 'image-split' :
                      'video-split'
                    );
                    const isSelected = currentVariant === v.id;
                    const Icon = v.icon;

                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => updateHero('heroVariant', v.id)}
                        className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500/50'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex items-center gap-2">
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                            <span className="text-xs font-bold text-white">{v.name}</span>
                          </div>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                            isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {v.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight">
                          {v.desc}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conditional Controls by Hero Type */}
              {currentConfig.hero.heroType === '3d-model' && (
                <div className="pt-3 border-t border-slate-800/80 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        3D Model URL (.glb / .gltf)
                      </label>
                      <input
                        type="text"
                        value={currentConfig.hero.modelUrl || ''}
                        onChange={(e) => updateHero('modelUrl', e.target.value)}
                        placeholder="/assets/idols/Lord Ganesh.glb"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">
                        Procedural Fallback (During Loading)
                      </label>
                      <select
                        value={currentConfig.hero.proceduralFallback || 'ganesha'}
                        onChange={(e) => updateHero('proceduralFallback', e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="ganesha">Lord Ganesh Sanctum Murti</option>
                        <option value="pedestal">Ornate Lotus Pedestal Only</option>
                        <option value="none">None (Loading Spinner Only)</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 block">Background Visual Effects</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentConfig.hero.showParticles !== false && currentConfig.hero.proceduralFallback !== 'none'}
                          onChange={(e) => updateHero('showParticles', e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-amber-500 accent-amber-500"
                        />
                        <span>Floating Dust Particles</span>
                      </label>

                      <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentConfig.hero.showCornerMotifs !== false && currentConfig.hero.proceduralFallback !== 'none'}
                          onChange={(e) => updateHero('showCornerMotifs', e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-amber-500 accent-amber-500"
                        />
                        <span>Corner Lotus Motifs</span>
                      </label>

                      <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={currentConfig.hero.showRadialAura !== false && currentConfig.hero.proceduralFallback !== 'none'}
                          onChange={(e) => updateHero('showRadialAura', e.target.checked)}
                          className="w-3.5 h-3.5 rounded text-amber-500 accent-amber-500"
                        />
                        <span>Radial Center Aura</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {currentConfig.hero.heroType === 'image' && (
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Hero Banner Image URL
                  </label>
                  <input
                    type="text"
                    value={currentConfig.hero.bannerImageUrl || ''}
                    onChange={(e) => updateHero('bannerImageUrl', e.target.value)}
                    placeholder="/assets/poster.jpg or https://..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {currentConfig.hero.heroType === 'video' && (
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Hero Video URL (MP4 / WebM)
                  </label>
                  <input
                    type="text"
                    value={currentConfig.hero.videoUrl || ''}
                    onChange={(e) => updateHero('videoUrl', e.target.value)}
                    placeholder="/assets/video/teaser.mp4 or https://..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>

            {/* 2. Hero Copy & Titles */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                2. Hero Typography &amp; Copy
              </label>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Presenter Badge Text
                  </label>
                  <input
                    type="text"
                    value={currentConfig.hero.presenterBadge}
                    onChange={(e) => updateHero('presenterBadge', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Main Heading (Foil / Gradient)
                    </label>
                    <input
                      type="text"
                      value={currentConfig.hero.title}
                      onChange={(e) => updateHero('title', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={currentConfig.hero.subtitle}
                      onChange={(e) => updateHero('subtitle', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 block mb-1">
                    Tagline / Devotional Message
                  </label>
                  <input
                    type="text"
                    value={currentConfig.hero.tagline || ''}
                    onChange={(e) => updateHero('tagline', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* 3. Call To Action Configurator */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                3. Action CTAs &amp; Links
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Primary CTA */}
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-amber-400 uppercase">Primary Button</span>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Label</label>
                    <input
                      type="text"
                      value={currentConfig.hero.primaryCta.label}
                      onChange={(e) =>
                        updateHero('primaryCta', { ...currentConfig.hero.primaryCta, label: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Action Type</label>
                    <select
                      value={currentConfig.hero.primaryCta.action}
                      onChange={(e) =>
                        updateHero('primaryCta', { ...currentConfig.hero.primaryCta, action: e.target.value as any })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="pooja">Book Pooja Modal</option>
                      <option value="rsvp">RSVP / Notify Modal</option>
                      <option value="donation">Donation Modal</option>
                      <option value="link">Custom URL</option>
                    </select>
                  </div>
                </div>

                {/* Secondary CTA */}
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-amber-400 uppercase">Secondary Button</span>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Label</label>
                    <input
                      type="text"
                      value={currentConfig.hero.secondaryCta.label}
                      onChange={(e) =>
                        updateHero('secondaryCta', { ...currentConfig.hero.secondaryCta, label: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Action Type</label>
                    <select
                      value={currentConfig.hero.secondaryCta.action}
                      onChange={(e) =>
                        updateHero('secondaryCta', { ...currentConfig.hero.secondaryCta, action: e.target.value as any })
                      }
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="donation">Donation Modal</option>
                      <option value="pooja">Book Pooja Modal</option>
                      <option value="whatsapp">Join WhatsApp Group</option>
                      <option value="link">Custom URL</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">
                  Community WhatsApp Invite Link
                </label>
                <input
                  type="text"
                  value={currentConfig.hero.whatsAppUrl || ''}
                  onChange={(e) => updateHero('whatsAppUrl', e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* 4. Color Presets & Palette */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-amber-400" />
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  4. Theme Color Palette
                </label>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      updateHero('primaryColor', preset.primary);
                      updateHero('accentColor', preset.accent);
                      updateHero('backgroundColor', preset.bg);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 flex items-center gap-2"
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-white/20"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Primary Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentConfig.hero.primaryColor || '#E65C00'}
                      onChange={(e) => updateHero('primaryColor', e.target.value)}
                      className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs text-slate-300 font-mono">
                      {currentConfig.hero.primaryColor || '#E65C00'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentConfig.hero.accentColor || '#CC4000'}
                      onChange={(e) => updateHero('accentColor', e.target.value)}
                      className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs text-slate-300 font-mono">
                      {currentConfig.hero.accentColor || '#CC4000'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Background Tint</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={currentConfig.hero.backgroundColor || '#FFF8F0'}
                      onChange={(e) => updateHero('backgroundColor', e.target.value)}
                      className="w-8 h-8 rounded border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <span className="text-xs text-slate-300 font-mono">
                      {currentConfig.hero.backgroundColor || '#FFF8F0'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Column: Section Toggles & Quick Links */}
          <div className="lg:col-span-4 space-y-6">
            {/* Landing Page Section Toggles */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>Landing Page Sections</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Toggle which sections render on this event&apos;s full landing template:
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { key: 'showCountdown', label: 'Countdown Timer' },
                  { key: 'showEventDetails', label: 'Event Schedule & Timings' },
                  { key: 'showStory', label: 'Devotional / About Story' },
                  { key: 'showSpecs', label: 'Idol Specifications / Specs' },
                  { key: 'showMediaGallery', label: 'Media Teaser Gallery' },
                  { key: 'showOfferings', label: 'Community Seva & Offerings' },
                  { key: 'showSponsors', label: 'Sponsor Ribbon Band' },
                ].map(({ key, label }) => {
                  const isChecked = !!currentConfig.sections[key as keyof typeof currentConfig.sections];
                  return (
                    <label
                      key={key}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer"
                    >
                      <span className="text-xs text-slate-200 font-medium">{label}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) =>
                          updateSectionToggle(key as keyof typeof currentConfig.sections, e.target.checked)
                        }
                        className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Quick Preview & Navigation */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Live Verification
              </span>

              <div className="space-y-2">
                <Link
                  href="/"
                  target="_blank"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 flex items-center justify-between transition-colors"
                >
                  <span>Preview Home Page</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </Link>

                <Link
                  href={`/${currentConfig.eventSlug}`}
                  target="_blank"
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-bold text-amber-300 flex items-center justify-between transition-colors"
                >
                  <span>Preview Event Landing</span>
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
