'use client';

import { useState } from 'react';
import Ganesha3DHero from '@/components/Ganesha3DHero';
import RitualCountdown from '@/components/RitualCountdown';
import MitraCommunitySection from '@/components/MitraCommunitySection';
import StorySection from '@/components/StorySection';
import IdolSpecsCard from '@/components/IdolSpecsCard';
import EventDetailsSection from '@/components/EventDetailsSection';
import MediaTeaserSection from '@/components/MediaTeaserSection';
import OfferingPlaques from '@/components/OfferingPlaques';
import SponsorRibbonBand from '@/components/SponsorRibbonBand';
import NotifyMeModal from '@/components/NotifyMeModal';
import SoundManager from '@/components/SoundManager';
import DonationModal from '@/components/DonationModal';

export default function HomePage() {
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [donateModalOpen, setDonateModalOpen] = useState(false);

  return (
    <div className="bg-[#0D0705] text-[#F7EFE1] min-h-screen">
      {/* 1. HERO — 3D VEILED GANESHA & REVEAL EXPERIENCE */}
      <Ganesha3DHero onNotifyClick={() => setNotifyModalOpen(true)} />

      {/* 2. RITUAL COUNTDOWN CLOCK */}
      <RitualCountdown />

      {/* 3. MITRA UK COMMUNITY SHOWCASE & PILLARS */}
      <MitraCommunitySection />

      {/* 4. THE DEVOTIONAL STORY */}
      <StorySection />

      {/* 4. THE IDOL SPECS PLAQUE */}
      <IdolSpecsCard />

      {/* 5. EVENT & VENUE DETAILS */}
      <EventDetailsSection />

      {/* 6. MEDIA & TEASER GALLERY */}
      <MediaTeaserSection />

      {/* 7. GET INVOLVED — OFFERING PLAQUES */}
      <OfferingPlaques onSponsorClick={() => setDonateModalOpen(true)} />

      {/* 8. BROUGHT TO YOU BY — SPONSOR RIBBON BAND */}
      <SponsorRibbonBand />

      {/* OPT-IN TEMPLE SOUND MANAGER */}
      {/* <SoundManager /> */}

      {/* MODAL FORMS */}
      <NotifyMeModal isOpen={notifyModalOpen} onClose={() => setNotifyModalOpen(false)} />
      <DonationModal isOpen={donateModalOpen} onClose={() => setDonateModalOpen(false)} />
    </div>
  );
}
