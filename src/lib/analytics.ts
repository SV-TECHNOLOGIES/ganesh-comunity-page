export function trackPageView(path: string, pageTitle?: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'page_view', {
      page_path: path,
      page_title: pageTitle || document.title,
    });
  }
}

export function trackEvent(eventName: string, path: string, details?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, {
      event_category: 'Interaction',
      event_label: path,
      ...details,
    });
  }
}

export function trackRSVP(eventId: string, eventTitle: string) {
  trackEvent('event_rsvp', `/events/${eventId}`, { eventId, eventTitle });
}

export function trackDonation(amount: number, cause: string) {
  trackEvent('donation_completed', '/donate', { amount, cause });
}

export function trackHelpRequest(category: string, ticketId: string) {
  trackEvent('help_request_submitted', '/charity/request-help', { category, ticketId });
}

export function trackMembership(tier: string, memberId: string) {
  trackEvent('membership_signup', '/membership', { tier, memberId });
}
