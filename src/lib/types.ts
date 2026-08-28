export type Role = 'Super Admin' | 'Media Secretary' | 'Events Coordinator' | 'Membership Officer' | 'Charity Officer' | 'Committee Viewer';

export interface EventItem {
  id: string;
  title: string;
  category: 'Cultural Events' | 'Business Networking' | 'Sports' | 'Women Empowerment' | 'World Conferences';
  date: string; // YYYY-MM-DD
  time: string;
  venue: string;
  address: string;
  description: string;
  bannerUrl: string;
  status: 'Upcoming' | 'Past';
  capacity: number;
  rsvpCount: number;
  ticketPrice: number; // 0 for free
  featured?: boolean;
}

export interface LeadershipMember {
  id: string;
  name: string;
  designation: string;
  category: 'Founders' | 'Patrons' | 'Trustees' | 'Executive Committee' | 'Nari Shakthi';
  bio: string;
  imageUrl: string;
  email?: string;
  linkedin?: string;
  twitter?: string;
  displayOrder: number;
}

export interface MediaAlbum {
  id: string;
  title: string;
  category: 'Photo Gallery' | 'Video Gallery' | 'Press Releases' | 'MITRA Patrika' | 'MITRA Souvenir';
  date: string;
  coverImage: string;
  itemCount: number;
  pdfUrl?: string;
  youtubeId?: string;
  description?: string;
}

export interface CharityCase {
  id: string; // MITRA-HELP-XXXX
  name: string;
  email: string;
  phone: string;
  category: 'Student Counselling' | 'Repatriation Support' | 'Women Helpline' | 'Community Service' | 'Emergency Assistance';
  details: string;
  status: 'New' | 'In Progress' | 'Resolved';
  assignedTo?: string;
  createdAt: string;
  isConfidential: boolean;
  notes: string[];
}

export interface Member {
  id: string; // MITRA-MEM-XXXX
  name: string;
  email: string;
  phone: string;
  tier: 'Life Member' | 'Annual Member' | 'Volunteer';
  status: 'Active' | 'Pending Review' | 'Expired';
  startDate: string;
  expiryDate: string;
  address: string;
  profession?: string;
}

export interface DonationRecord {
  id: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: string;
  cause: string;
  date: string;
  paymentMethod: 'Card' | 'PayPal' | 'Bank Transfer';
  receiptNo: string;
  status?: 'Completed' | 'Pending' | 'Failed';
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  coverImage: string;
  tags: string[];
}

export interface AnalyticsEvent {
  id: string;
  timestamp: string;
  eventName: string; // page_view, event_rsvp, membership_signup, donation_completed, help_request_submitted, search_executed
  path: string;
  details?: Record<string, any>;
}

export interface SiteSettings {
  siteTitle: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  twitterUrl: string;
  linkedinUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  googleAnalyticsId: string;
  enableTracking: boolean;
}
