'use client';

import { useState } from 'react';
import Ganesha3DHero from '@/components/Ganesha3DHero';
import MitraCommunitySection from '@/components/MitraCommunitySection';
import MediaTeaserSection from '@/components/MediaTeaserSection';
import OfferingPlaques from '@/components/OfferingPlaques';
import SponsorRibbonBand from '@/components/SponsorRibbonBand';
import NotifyMeModal from '@/components/NotifyMeModal';

export default function HomePage() {
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);

  return (
    <div className="bg-[#0D0705] text-[#F7EFE1] min-h-screen">
      {/* 1. HERO — 3D VEILED GANESHA & REVEAL EXPERIENCE */}
      {/* Home page passes NO Pooja/Donate handlers → shows WhatsApp + View Event CTAs */}
      <Ganesha3DHero onNotifyClick={() => setNotifyModalOpen(true)} />

      {/* 2. MITRA UK COMMUNITY SHOWCASE & PILLARS */}
      <MitraCommunitySection />

      {/* 3. MEDIA & TEASER GALLERY */}
      <MediaTeaserSection />

      {/* 4. GET INVOLVED — OFFERING PLAQUES */}
      <OfferingPlaques />

      {/* 5. BROUGHT TO YOU BY — SPONSOR RIBBON BAND */}
      <SponsorRibbonBand />

      {/* MODAL FORMS */}
      <NotifyMeModal isOpen={notifyModalOpen} onClose={() => setNotifyModalOpen(false)} />
    </div>
  );
}
