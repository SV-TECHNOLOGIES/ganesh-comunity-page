import { DataStore } from './data-store';

export function trackPageView(path: string, pageTitle?: string) {
  DataStore.logAnalyticsEvent('page_view', path, { pageTitle });
}

export function trackEvent(eventName: string, path: string, details?: Record<string, any>) {
  DataStore.logAnalyticsEvent(eventName, path, details);
}

export function trackRSVP(eventId: string, eventTitle: string) {
  DataStore.logAnalyticsEvent('event_rsvp', `/events/${eventId}`, { eventId, eventTitle });
}

export function trackDonation(amount: number, cause: string) {
  DataStore.logAnalyticsEvent('donation_completed', '/donate', { amount, cause });
}

export function trackHelpRequest(category: string, ticketId: string) {
  DataStore.logAnalyticsEvent('help_request_submitted', '/charity/request-help', { category, ticketId });
}

export function trackMembership(tier: string, memberId: string) {
  DataStore.logAnalyticsEvent('membership_signup', '/membership', { tier, memberId });
}
