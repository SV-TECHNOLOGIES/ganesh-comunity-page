'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Check, 
  Monitor, 
  Laptop, 
  Tablet, 
  Smartphone, 
  Maximize2, 
  Sparkles, 
  Layers, 
  Compass, 
  Crown, 
  Layout, 
  CheckCircle2, 
  ExternalLink,
  Info
} from 'lucide-react';

import HeaderTwoTier from '@/components/headers/HeaderTwoTier';
import HeaderGrouped from '@/components/headers/HeaderGrouped';
import HeaderFloating from '@/components/headers/HeaderFloating';
import HeaderCentered from '@/components/headers/HeaderCentered';
import HeaderMegaMenu from '@/components/headers/HeaderMegaMenu';
import HeaderFixedOriginal from '@/components/headers/HeaderFixedOriginal';
import { HEADER_VARIANTS, HeaderVariantId } from '@/components/headers/header-types';

type ViewportSize = 'full' | 'desktop' | 'laptop' | 'tablet' | 'mobile';

const VIEWPORT_WIDTHS: Record<ViewportSize, string> = {
  full: 'w-full',
  desktop: 'max-w-[1440px]',
  laptop: 'max-w-[1200px]',
  tablet: 'max-w-[1024px]',
  mobile: 'max-w-[390px]',
};

export default function HeadersShowcasePage() {
  const [activeSiteVariant, setActiveSiteVariant] = useState<HeaderVariantId>('two-tier');
  const [selectedViewport, setSelectedViewport] = useState<ViewportSize>('full');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('mitra_header_variant') as HeaderVariantId | null;
    if (saved) {
      setActiveSiteVariant(saved);
    }
  }, []);

  const handleApplyVariant = (id: HeaderVariantId) => {
    setActiveSiteVariant(id);
    localStorage.setItem('mitra_header_variant', id);
    window.dispatchEvent(new CustomEvent('headerVariantChange', { detail: id }));
  };

  const copyVariantName = (id: string, name: string) => {
    navigator.clipboard.writeText(`Selected Header Variant: ${name} (${id})`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const renderVariantComponent = (id: HeaderVariantId) => {
    switch (id) {
      case 'two-tier':
        return <HeaderTwoTier previewMode />;
      case 'grouped':
        return <HeaderGrouped previewMode />;
      case 'floating':
        return <HeaderFloating previewMode />;
      case 'centered':
        return <HeaderCentered previewMode />;
      case 'mega-menu':
        return <HeaderMegaMenu previewMode />;
      case 'default-fixed':
        return <HeaderFixedOriginal previewMode />;
      default:
        return <HeaderTwoTier previewMode />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] via-[#FFF4E6] to-[#FFF8F0] text-[#3D1A00] pb-24">
      
      {/* ── Showcase Header / Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#3D1A00] via-[#5A2500] to-[#E65C00] text-white py-14 px-4 sm:px-6 lg:px-8 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(#FF7A00_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
        
        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#FFD8A8]">
            <Sparkles className="w-3.5 h-3.5 text-[#FFD8A8]" />
            <span>Client Design Showcase · Header Architecture</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold font-cinzel tracking-wide leading-tight">
            Select the Ideal Header for MITRA UK
          </h1>

          <p className="text-sm sm:text-base text-[#FFF0DD] max-w-3xl mx-auto leading-relaxed">
            We engineered <strong>multiple distinct header variants</strong> to resolve the text squishing and navigation crowding issue on laptop screens. Review each option below, test responsiveness, and click <span className="text-[#FFD8A8] font-bold">"Apply to Live Site"</span> to preview it across the whole portal!
          </p>

          {/* Active Header Status Chip */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-2.5 flex items-center gap-3">
              <span className="text-xs text-white/80">Currently Active on Site:</span>
              <span className="bg-[#E65C00] text-white text-xs font-black px-3 py-1 rounded-full shadow">
                {HEADER_VARIANTS.find(v => v.id === activeSiteVariant)?.title || 'Executive Two-Tier'}
              </span>
            </div>
            <Link 
              href="/" 
              className="bg-white text-[#E65C00] hover:bg-[#FFF0E0] text-xs font-black px-4 py-2.5 rounded-2xl shadow transition-all flex items-center gap-1.5"
            >
              <span>View On Homepage</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Viewport Testing Controls ── */}
      <section className="sticky top-20 z-40 bg-[#FFF8F0]/95 backdrop-blur-md border-b border-[#E65C00]/20 py-3.5 px-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-2 text-xs font-bold text-[#6B3A2A]">
            <Info className="w-4 h-4 text-[#E65C00]" />
            <span>Simulate Device Resolution (Test for zero text wrapping):</span>
          </div>

          {/* Device toggle buttons */}
          <div className="flex items-center bg-[#FFF0E0] p-1 rounded-2xl border border-[#E65C00]/20 gap-1 text-xs font-bold">
            <button
              onClick={() => setSelectedViewport('full')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                selectedViewport === 'full' ? 'bg-[#E65C00] text-white shadow' : 'text-[#6B3A2A] hover:text-[#E65C00]'
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Full (100%)</span>
            </button>

            <button
              onClick={() => setSelectedViewport('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                selectedViewport === 'desktop' ? 'bg-[#E65C00] text-white shadow' : 'text-[#6B3A2A] hover:text-[#E65C00]'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop (1440px)</span>
            </button>

            <button
              onClick={() => setSelectedViewport('laptop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                selectedViewport === 'laptop' ? 'bg-[#E65C00] text-white shadow' : 'text-[#6B3A2A] hover:text-[#E65C00]'
              }`}
              title="Screen width where original issue occurred"
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>Laptop (1200px)</span>
            </button>

            <button
              onClick={() => setSelectedViewport('tablet')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                selectedViewport === 'tablet' ? 'bg-[#E65C00] text-white shadow' : 'text-[#6B3A2A] hover:text-[#E65C00]'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet (1024px)</span>
            </button>

            <button
              onClick={() => setSelectedViewport('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                selectedViewport === 'mobile' ? 'bg-[#E65C00] text-white shadow' : 'text-[#6B3A2A] hover:text-[#E65C00]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile (390px)</span>
            </button>
          </div>

        </div>
      </section>

      {/* ── Variants Showcase List ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-14">
        
        {HEADER_VARIANTS.map((variant, index) => {
          const isActive = activeSiteVariant === variant.id;

          return (
            <div 
              key={variant.id}
              id={`variant-${variant.id}`}
              className={`rounded-3xl border-2 transition-all duration-200 overflow-hidden bg-white shadow-xl ${
                isActive ? 'border-[#E65C00] ring-4 ring-[#E65C00]/20' : 'border-[#E65C00]/20 hover:border-[#E65C00]/50'
              }`}
            >
              {/* Card Meta Top Bar */}
              <div className="bg-[#FFF8F0] border-b border-[#E65C00]/15 p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#E65C00] text-white text-xs font-black flex items-center justify-center">
                      {index + 1}
                    </span>
                    <h2 className="text-xl font-bold font-cinzel text-[#3D1A00]">
                      {variant.title}
                    </h2>
                    <span className="bg-[#E65C00]/10 text-[#E65C00] text-[11px] font-black px-2.5 py-0.5 rounded-full border border-[#E65C00]/25">
                      {variant.badge}
                    </span>
                    {isActive && (
                      <span className="bg-emerald-100 text-emerald-800 text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Active On Site</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6B3A2A]">
                    {variant.tagline}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => copyVariantName(variant.id, variant.title)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[#E65C00]/30 text-[#6B3A2A] hover:text-[#E65C00] hover:bg-[#FFF0E0] transition-colors"
                  >
                    {copiedId === variant.id ? 'Copied to Clipboard!' : 'Share with Client'}
                  </button>

                  <button
                    onClick={() => handleApplyVariant(variant.id)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow ${
                      isActive 
                        ? 'bg-emerald-600 text-white cursor-default' 
                        : 'bg-[#E65C00] hover:bg-[#D44F00] text-white hover:scale-105'
                    }`}
                  >
                    {isActive ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Currently Active</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Apply to Live Site</span>
                      </>
                    )}
                  </button>
                </div>

              </div>

              {/* Live Sandbox Container with Viewport Resizer */}
              <div className="p-4 sm:p-6 bg-[#FAFAF7] border-b border-[#E65C00]/10 overflow-x-auto flex justify-center">
                <div className={`${VIEWPORT_WIDTHS[selectedViewport]} transition-all duration-300 w-full shadow-md rounded-2xl overflow-hidden border border-amber-200/50`}>
                  {renderVariantComponent(variant.id)}
                </div>
              </div>

              {/* Analysis & Value Breakdown */}
              <div className="p-5 sm:p-6 bg-white grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div>
                  <h3 className="font-bold text-[#3D1A00] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#E65C00]" />
                    <span>How it Solves the Screen Issue</span>
                  </h3>
                  <p className="text-[#6B3A2A] leading-relaxed mb-3">
                    {variant.description}
                  </p>
                  <div className="bg-[#FFF0E0] p-2.5 rounded-xl text-[#8C3600] font-semibold">
                    <span className="font-bold">Best suited for: </span>
                    {variant.bestFor}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-[#3D1A00] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 text-[#E65C00]" />
                    <span>Key Strengths &amp; Benefits</span>
                  </h3>
                  <ul className="space-y-1.5">
                    {variant.benefits.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2 text-[#3D1A00]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          );
        })}

        {/* ── Comparison Matrix for Client Decision ── */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E65C00]/20 shadow-xl space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold font-cinzel text-[#3D1A00]">
              Quick Comparison Guide
            </h2>
            <p className="text-xs text-[#6B3A2A]">
              Present this matrix to your client to help them choose based on their organizational priorities.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b-2 border-[#E65C00]/20 text-[#3D1A00] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Variant</th>
                  <th className="py-3 px-4">Layout Style</th>
                  <th className="py-3 px-4">Laptop (1200px) Space</th>
                  <th className="py-3 px-4">Announcement Bar</th>
                  <th className="py-3 px-4">Brand Presence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E65C00]/10 text-[#6B3A2A]">
                <tr className="hover:bg-[#FFF8F0]">
                  <td className="py-3 px-4 font-bold text-[#E65C00]">1. Executive Two-Tier</td>
                  <td className="py-3 px-4">Double Decker</td>
                  <td className="py-3 px-4 font-semibold text-emerald-700">Exceptional (Zero Competition)</td>
                  <td className="py-3 px-4">Included (Top Deck)</td>
                  <td className="py-3 px-4">Maximum Prominence</td>
                </tr>
                <tr className="hover:bg-[#FFF8F0]">
                  <td className="py-3 px-4 font-bold text-[#E65C00]">2. Smart Grouped</td>
                  <td className="py-3 px-4">Categorical Dropdowns</td>
                  <td className="py-3 px-4 font-semibold text-emerald-700">Very Spacious (5 Top Links)</td>
                  <td className="py-3 px-4">Compact Top Ribbon</td>
                  <td className="py-3 px-4">Clean &amp; Professional</td>
                </tr>
                <tr className="hover:bg-[#FFF8F0]">
                  <td className="py-3 px-4 font-bold text-[#E65C00]">3. Floating Glass Island</td>
                  <td className="py-3 px-4">Pill Header with "More ▾"</td>
                  <td className="py-3 px-4 font-semibold text-emerald-700">Spacious (Overflow Hidden)</td>
                  <td className="py-3 px-4">Hidden in Pill</td>
                  <td className="py-3 px-4">Ultra-Modern &amp; Trendy</td>
                </tr>
                <tr className="hover:bg-[#FFF8F0]">
                  <td className="py-3 px-4 font-bold text-[#E65C00]">4. Centered Symmetrical</td>
                  <td className="py-3 px-4">Cultural Symmetrical</td>
                  <td className="py-3 px-4 font-semibold text-emerald-700">Balanced 50/50 Split</td>
                  <td className="py-3 px-4">Included (Top Ribbon)</td>
                  <td className="py-3 px-4">Majestic Center Crest</td>
                </tr>
                <tr className="hover:bg-[#FFF8F0]">
                  <td className="py-3 px-4 font-bold text-[#E65C00]">5. Adaptive Mega-Menu</td>
                  <td className="py-3 px-4">Slide-down Mega Drawer</td>
                  <td className="py-3 px-4 font-semibold text-emerald-700">Unlimited / Future-Proof</td>
                  <td className="py-3 px-4">Included (Top Ribbon)</td>
                  <td className="py-3 px-4">Sleek &amp; Uncluttered</td>
                </tr>
                <tr className="hover:bg-[#FFF8F0]">
                  <td className="py-3 px-4 font-bold text-[#E65C00]">6. Refined Fixed Original</td>
                  <td className="py-3 px-4">Single Row Repaired</td>
                  <td className="py-3 px-4 font-semibold text-amber-700">Fits with Adaptive Scaling</td>
                  <td className="py-3 px-4">Included (Top Ribbon)</td>
                  <td className="py-3 px-4">Original Branding</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

      </main>

    </div>
  );
}
