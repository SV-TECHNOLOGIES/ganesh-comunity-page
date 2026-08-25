import { Metadata } from 'next';
import { EventItem, BlogPost } from './types';

export const BASE_URL = 'https://www.ukta.org.uk';

export function constructMetadata({
  title = 'UK Telugu Association (UKTA) | Official Website',
  description = 'The premier UK non-profit organization promoting Telugu language, culture, arts, community welfare, student counselling, and high-impact charitable programs across Great Britain.',
  image = '/assets/poster.jpg',
  canonical = '/',
  noIndex = false,
}: {
  title?: string;
  description?: string;
  image?: string;
  canonical?: string;
  noIndex?: boolean;
} = {}): Metadata {
  return {
    title: `${title} | UKTA`,
    description,
    keywords: [
      'UK Telugu Association',
      'UKTA',
      'Telugu Community UK',
      'London Telugu Events',
      'Ugadi Celebrations UK',
      'Telugu Charity UK',
      'Kuchipudi Dance London',
      'Telugu Student Help London',
    ],
    authors: [{ name: 'UK Telugu Association IT Committee' }],
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'UK Telugu Association (UKTA)',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_GB',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      creator: '@ukta_official',
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function generateOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: 'UK Telugu Association',
    alternateName: 'UKTA',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    sameAs: [
      'https://twitter.com/ukta_official',
      'https://linkedin.com/company/ukta-official',
      'https://facebook.com/ukteluguassociation',
      'https://youtube.com/@uktaofficial',
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Chiswick Park, 566 Chiswick High Rd',
      addressLocality: 'London',
      postalCode: 'W4 5YA',
      addressCountry: 'GB',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+44-20-8123-4567',
      contactType: 'customer service',
      email: 'info@ukta.org.uk',
    },
  };
}

export function generateEventJsonLd(event: EventItem) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    startDate: `${event.date}T16:00:00+00:00`,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venue,
      address: event.address,
    },
    image: [event.bannerUrl],
    organizer: {
      '@type': 'Organization',
      name: 'UK Telugu Association',
      url: BASE_URL,
    },
    offers: {
      '@type': 'Offer',
      price: event.ticketPrice,
      priceCurrency: 'GBP',
      availability: 'https://schema.org/InStock',
      url: `${BASE_URL}/events/${event.id}`,
    },
  };
}
