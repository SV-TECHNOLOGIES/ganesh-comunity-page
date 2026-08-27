'use client';

import { useState } from 'react';
import Ganesha3DHero from '@/components/Ganesha3DHero';
import RitualCountdown from '@/components/RitualCountdown';
import StorySection from '@/components/StorySection';
import IdolSpecsCard from '@/components/IdolSpecsCard';
import EventDetailsSection from '@/components/EventDetailsSection';
import MediaTeaserSection from '@/components/MediaTeaserSection';
import OfferingPlaques from '@/components/OfferingPlaques';
import SponsorRibbonBand from '@/components/SponsorRibbonBand';
import NotifyMeModal from '@/components/NotifyMeModal';
import SoundManager from '@/components/SoundManager';
import DonationModal from '@/components/DonationModal';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Flame, Calendar, MapPin } from 'lucide-react';

export default function GaneshEvent2026Page() {
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [donationCategory, setDonationCategory] = useState<'Annadanam' | 'Pooja Booking' | 'Event Donations'>('Pooja Booking');

  const openDonation = (cat: 'Annadanam' | 'Pooja Booking' | 'Event Donations') => {
    setDonationCategory(cat);
    setDonateModalOpen(true);
  };

  return (
    <div className="bg-[#0D0705] text-[#F7EFE1] min-h-screen">
      
      {/* Top Banner Navigation Bar */}
      <div className="bg-[#160B08] border-b border-[#D4AF37]/30 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-3 text-xs">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-[#F4C542] hover:text-white font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to MITRA UK Home</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="bg-[#7A1620] text-[#F4C542] border border-[#D4AF37]/40 font-black px-3 py-1 rounded-full text-[10px] uppercase tracking-wider">
              LONDON GANESH MAHOTSAV 2026
            </span>
            <button
              onClick={() => openDonation('Pooja Booking')}
              className="gold-button px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md"
            >
              <Flame className="w-3.5 h-3.5 fill-current text-[#0D0705]" />
              <span>Book Pooja (£116)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1. HERO — 3D VEILED GANESHA & REVEAL EXPERIENCE */}
      <Ganesha3DHero onNotifyClick={() => setNotifyModalOpen(true)} />

      {/* 2. RITUAL COUNTDOWN CLOCK */}
      <RitualCountdown />

      {/* 3. DEVOTIONAL STORY OF THE MAHOTSAV */}
      <StorySection />

      {/* 4. THE IDOL SPECS PLAQUE */}
      <IdolSpecsCard />

      {/* 5. EVENT DETAILS, VENUE & 3 DONATION CATEGORIES / POOJA BOOKING (£116) */}
      <EventDetailsSection />

      {/* 6. MEDIA & TEASER GALLERY */}
      <MediaTeaserSection />

      {/* 7. GET INVOLVED — OFFERING PLAQUES & SPONSORSHIP */}
      <OfferingPlaques onSponsorClick={() => openDonation('Event Donations')} />

      {/* 8. BROUGHT TO YOU BY — SPONSOR RIBBON BAND */}
      <SponsorRibbonBand />

      {/* OPT-IN TEMPLE SOUND MANAGER */}
      {/* <SoundManager /> */}

      {/* MODAL FORMS */}
      <NotifyMeModal isOpen={notifyModalOpen} onClose={() => setNotifyModalOpen(false)} />
      <DonationModal 
        isOpen={donateModalOpen} 
        onClose={() => setDonateModalOpen(false)} 
        initialCategory={donationCategory}
      />
    </div>
  );
}
