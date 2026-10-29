import { prisma } from './prisma';
import { getPreferencesForEvent } from './config-preferences';

/**
 * Server-only utility to fetch the currently active home event
 * for dynamic OpenGraph / Twitter metadata on the homepage (/).
 * Returns the event ONLY when an active event is featured on home;
 * otherwise returns null so standard MITRA website metadata is used.
 */
export async function getFeaturedEventForMetadata() {
  try {
    const activePref = await prisma.config.findFirst({
      where: { preference: 'home.activeHomeEventId' },
    });

    const activeId = activePref?.value?.trim();
    if (!activeId || activeId === 'default-home' || activeId === 'none') {
      return null;
    }

    const event = await prisma.event.findUnique({
      where: { id: activeId },
    });

    if (
      event &&
      event.status !== 'Completed' &&
      event.status !== 'Past' &&
      event.status !== 'Cancelled'
    ) {
      try {
        const prefData = await getPreferencesForEvent(event.id);
        const heroBanner = prefData?.templateConfig?.hero?.bannerImageUrl;
        if (heroBanner && heroBanner !== '/assets/poster.jpg') {
          return { ...event, bannerUrl: heroBanner };
        }
      } catch {
        // Ignore preference lookup error and use event.bannerUrl
      }
      return event;
    }
  } catch (error) {
    console.error('[SEO SERVER LOOKUP ERROR]:', error);
  }

  return null;
}
