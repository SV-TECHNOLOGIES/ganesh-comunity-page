'use client';

import React from 'react';
import EventHero from './EventHero';

interface Ganesha3DHeroProps {
  onBookPoojaClick?: () => void;
  onDonateClick?: () => void;
  onNotifyClick?: () => void;
}

/**
 * Ganesha3DHero
 * Legacy wrapper around generalized EventHero with default Ganesh 2026 3D sanctum settings.
 */
export default function Ganesha3DHero({
  onBookPoojaClick,
  onDonateClick,
  onNotifyClick,
}: Ganesha3DHeroProps) {
  const isHomeMode = !onBookPoojaClick && !onDonateClick;

  return (
    <EventHero
      mode={isHomeMode ? 'home' : 'event'}
      eventSlug="ganesh-event-2026"
      onBookPoojaClick={onBookPoojaClick}
      onDonateClick={onDonateClick}
      onNotifyClick={onNotifyClick}
    />
  );
}
