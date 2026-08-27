import { EventItem, LeadershipMember, MediaAlbum, CharityCase, Member, DonationRecord, BlogPost, AnalyticsEvent, SiteSettings } from './types';

const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'evt-ganesh-chaturthi',
    title: 'Ganesh Chaturthi — Maha Ganapathi Mahotsav 2026',
    category: 'Cultural Events',
    date: '2026-09-14',
    time: '09:00 - 21:00 BST',
    venue: 'Langley Community Mandap, Slough',
    address: 'Langley, Slough SL3 8BY, United Kingdom',
    description: 'London’s largest Maha Ganapathi Mahotsav in Langley, Slough. Featuring 6ft eco-friendly murti unveiling, 3D WebGL Darshan, Puja Sankalpam, £116 Pooja Booking, Annadanam food distribution, and Kuchipudi recitals.',
    bannerUrl: '/assets/poster-dark.jpeg',
    status: 'Upcoming',
    capacity: 5000,
    rsvpCount: 1420,
    ticketPrice: 0,
    featured: true
  },
  {
    id: 'evt-101',
    title: 'UKTA Ugadi Celebrations & Cultural Fest 2026',
    category: 'Cultural Events',
    date: '2026-04-12',
    time: '16:00 - 21:00 BST',
    venue: 'Logan Hall, University of London',
    address: '20 Bedford Way, Bloomsbury, London WC1H 0AL',
    description: 'Celebrate Telugu New Year Ugadi with authentic Panchanga Sravanam, traditional music, Kuchipudi dance recitals, Telugu folk music by renowned artists, and traditional Ugadi Pachadi.',
    bannerUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1200',
    status: 'Upcoming',
    capacity: 500,
    rsvpCount: 342,
    ticketPrice: 15,
    featured: true
  },
  {
    id: 'evt-102',
    title: 'UK-Telugu Business & Tech Leadership Summit',
    category: 'Business Networking',
    date: '2026-05-20',
    time: '18:00 - 21:30 BST',
    venue: 'Chiswick Park Conference Centre',
    address: '566 Chiswick High Rd, London W4 5YA',
    description: 'Exclusive networking forum connecting British-Telugu entrepreneurs, IT executives, healthcare founders, and investors across the United Kingdom.',
    bannerUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200',
    status: 'Upcoming',
    capacity: 200,
    rsvpCount: 158,
    ticketPrice: 25,
    featured: true
  },
  {
    id: 'evt-103',
    title: 'Nari Shakthi Women Empowerment & Leadership Forum',
    category: 'Women Empowerment',
    date: '2026-06-14',
    time: '13:00 - 17:00 BST',
    venue: 'St George’s Hotel Conference Suite',
    address: 'Wembley, London HA9 8DS',
    description: 'Empowering British-Telugu women through interactive workshops, career mentorship, health awareness, and spotlighting female leaders in STEM, medicine, and arts.',
    bannerUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1200',
    status: 'Upcoming',
    capacity: 150,
    rsvpCount: 89,
    ticketPrice: 0,
    featured: true
  },
  {
    id: 'evt-104',
    title: 'UKTA Annual Badminton & Cricket Tournament',
    category: 'Sports',
    date: '2026-07-18',
    time: '09:00 - 18:00 BST',
    venue: 'Milton Keynes Sports Complex',
    address: 'Milton Keynes MK9 3HA',
    description: 'Community sports tournament bringing together adults and youth teams for badminton singles/doubles and T20 cricket matches.',
    bannerUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80&w=1200',
    status: 'Upcoming',
    capacity: 300,
    rsvpCount: 210,
    ticketPrice: 10
  },
  {
    id: 'evt-105',
    title: 'Guinness World Record Commemorative Gala',
    category: 'World Conferences',
    date: '2025-10-15',
    time: '18:00 - 22:00 BST',
    venue: 'Royal Albert Hall',
    address: 'Kensington Gore, London SW7 2AP',
    description: 'Historic assembly celebrating the Guinness World Record set by UKTA for the largest synchronized Kuchipudi dance performance outside India.',
    bannerUrl: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&q=80&w=1200',
    status: 'Past',
    capacity: 800,
    rsvpCount: 800,
    ticketPrice: 0
  }
];

const INITIAL_LEADERSHIP: LeadershipMember[] = [
  {
    id: 'lead-1',
    name: 'Dr. Venkat S. Chary',
    designation: 'Founder President & Chief Patron',
    category: 'Founders',
    bio: 'Pioneered UKTA to preserve Telugu heritage, advocate for the community in the UK, and foster philanthropic initiatives across London and Andhra/Telangana.',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    email: 'president@ukta.org.uk',
    linkedin: 'https://linkedin.com/in/ukta',
    twitter: 'https://twitter.com/ukta_official',
    displayOrder: 1
  },
  {
    id: 'lead-2',
    name: 'Smt. Radhika Prasad',
    designation: 'Chairperson & Nari Shakthi Lead',
    category: 'Trustees',
    bio: 'Prominent community advocate leading women empowerment, student mentorship, and international cultural exchange projects.',
    imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400',
    email: 'chair@ukta.org.uk',
    linkedin: 'https://linkedin.com/in/ukta',
    displayOrder: 2
  },
  {
    id: 'lead-3',
    name: 'Ramesh Babu Kondapalli',
    designation: 'General Secretary',
    category: 'Executive Committee',
    bio: 'Oversees organizational operations, administrative communications, event planning, and parliamentary liaison in the UK.',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    email: 'secretary@ukta.org.uk',
    displayOrder: 3
  },
  {
    id: 'lead-4',
    name: 'Anil Kumar Varma',
    designation: 'Treasurer & Finance Director',
    category: 'Executive Committee',
    bio: 'Chartered Accountant overseeing non-profit financial governance, charity accounts, and donor transparency.',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    email: 'finance@ukta.org.uk',
    displayOrder: 4
  },
  {
    id: 'lead-5',
    name: 'Dr. Sunitha Reddy',
    designation: 'Head of Student Counselling & Welfare',
    category: 'Nari Shakthi',
    bio: 'Senior academic helping international students with housing, academic guidance, mental well-being, and career orientation.',
    imageUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    email: 'counselling@ukta.org.uk',
    displayOrder: 5
  },
  {
    id: 'lead-6',
    name: 'Sri Krishna Mohan',
    designation: 'Patron & Senior Advisor',
    category: 'Patrons',
    bio: 'Philanthropist supporting Telugu literature, classical arts patronage, and repatriation support for families in distress.',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
    displayOrder: 6
  }
];

const INITIAL_MEDIA: MediaAlbum[] = [
  {
    id: 'med-1',
    title: 'Guinness World Record Kuchipudi Performance Highlights',
    category: 'Video Gallery',
    date: '2025-10-15',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600',
    itemCount: 1,
    youtubeId: 'dQw4w9WgXcQ',
    description: 'Official recording of the historic Kuchipudi performance in London.'
  },
  {
    id: 'med-2',
    title: 'UKTA Patrika - Ugadi Special Edition 2026 (PDF)',
    category: 'UKTA Patrika',
    date: '2026-03-01',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
    itemCount: 24,
    pdfUrl: '#',
    description: 'Features community news, Telugu poetry, student accomplishments, and event photo spreads.'
  },
  {
    id: 'med-3',
    title: 'TTD Srinivasa Kalyanam Tour in the UK - Photo Album',
    category: 'Photo Gallery',
    date: '2025-11-20',
    coverImage: 'https://images.unsplash.com/photo-1545232979-fbf34fe37b38?auto=format&fit=crop&q=80&w=600',
    itemCount: 45,
    description: 'Photographs from Tirumala Tirupati Devasthanams celestial wedding ceremony hosted across UK cities.'
  },
  {
    id: 'med-4',
    title: 'UKTA 10th Anniversary Souvenir Magazine',
    category: 'UKTA Souvenir',
    date: '2025-06-10',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=600',
    itemCount: 68,
    pdfUrl: '#',
    description: 'Comprehensive souvenir chronicling UKTA journey, founder messages, and letters from 10 Downing Street.'
  }
];

const INITIAL_CHARITY_CASES: CharityCase[] = [
  {
    id: 'UKTA-HELP-1092',
    name: 'Srinivas Rao',
    email: 'srinivas.r@gmail.com',
    phone: '+44 7700 900123',
    category: 'Student Counselling',
    details: 'Urgent assistance requested for university accommodation guidance and part-time work compliance in London.',
    status: 'In Progress',
    assignedTo: 'Dr. Sunitha Reddy',
    createdAt: '2026-08-20',
    isConfidential: false,
    notes: ['Initial call conducted on Aug 21. Connected student with UKTA London student mentor network.']
  },
  {
    id: 'UKTA-HELP-1093',
    name: 'Confidential Beneficiary',
    email: 'help.welfare@ukta.org.uk',
    phone: '+44 7700 900456',
    category: 'Women Helpline',
    details: 'Domestic support request and legal advisory referral.',
    status: 'New',
    assignedTo: 'Smt. Radhika Prasad',
    createdAt: '2026-08-23',
    isConfidential: true,
    notes: ['Case assigned to Women Helpline Lead. High confidentiality protocol applied.']
  },
  {
    id: 'UKTA-HELP-1091',
    name: 'Family of Late K. Sharma',
    email: 'sharma.family@outlook.com',
    phone: '+44 7700 900789',
    category: 'Repatriation Support',
    details: 'Consular documentation assistance and emergency flights logistics to Hyderabad.',
    status: 'Resolved',
    assignedTo: 'Ramesh Babu Kondapalli',
    createdAt: '2026-08-10',
    isConfidential: false,
    notes: ['All consular permits obtained. Flights arranged with Indian High Commission UK support. Case closed successfully.']
  }
];

const INITIAL_MEMBERS: Member[] = [
  {
    id: 'UKTA-MEM-5001',
    name: 'Mahesh Babu G',
    email: 'mahesh.g@example.co.uk',
    phone: '+44 7890 123456',
    tier: 'Life Member',
    status: 'Active',
    startDate: '2024-01-15',
    expiryDate: 'Lifetime',
    address: 'Chiswick, London W4 2AB',
    profession: 'Senior Software Architect'
  },
  {
    id: 'UKTA-MEM-5002',
    name: 'Priyanka Reddy',
    email: 'priyanka.reddy@example.co.uk',
    phone: '+44 7890 654321',
    tier: 'Annual Member',
    status: 'Active',
    startDate: '2026-02-10',
    expiryDate: '2027-02-10',
    address: 'Birmingham B1 1AA',
    profession: 'NHS Consultant Physician'
  },
  {
    id: 'UKTA-MEM-5003',
    name: 'Venkatesh Naidu',
    email: 'v.naidu@example.co.uk',
    phone: '+44 7890 987654',
    tier: 'Volunteer',
    status: 'Pending Review',
    startDate: '2026-08-22',
    expiryDate: '2027-08-22',
    address: 'Manchester M1 2WD',
    profession: 'Postgraduate Student'
  }
];

const INITIAL_DONATIONS: DonationRecord[] = [
  {
    id: 'DON-801',
    donorName: 'Anonymous Supporter',
    donorEmail: 'donor@ukta.org.uk',
    amount: 250,
    currency: 'GBP',
    cause: 'Student Emergency Welfare Fund',
    date: '2026-08-22',
    paymentMethod: 'Card',
    receiptNo: 'UKTA-REC-2026-0801'
  },
  {
    id: 'DON-802',
    donorName: 'Siva & Lakshmi Prasad',
    donorEmail: 'sl.prasad@example.co.uk',
    amount: 500,
    currency: 'GBP',
    cause: 'Telugu Cultural Preservation & Kuchipudi Academy',
    date: '2026-08-18',
    paymentMethod: 'PayPal',
    receiptNo: 'UKTA-REC-2026-0802'
  }
];

const INITIAL_NEWS: BlogPost[] = [
  {
    id: 'news-1',
    slug: 'ukta-announces-ugadi-fest-2026',
    title: 'UKTA Announces Grand Ugadi Cultural Celebrations 2026 in London',
    excerpt: 'Join us at Logan Hall, London for an unforgettable evening of Telugu classical music, dance, and authentic Panchanga Sravanam.',
    content: `The UK Telugu Association (UKTA) is thrilled to announce its flagship annual event, the Ugadi Cultural Fest 2026, scheduled to take place on Sunday, 12th April 2026 at Logan Hall, University of London.

This year's celebrations will feature special guest performances by acclaimed playback singers from Telangana and Andhra Pradesh, traditional Kuchipudi recitals by UK youth troupes, and the sacred Panchanga Sravanam.

"Ugadi is a moment of reflection, gratitude, and community bonding for all Telugus living across Great Britain," said Dr. Venkat S. Chary, UKTA Founder President. "We cordially invite all families and friends to join us in full traditional attire."`,
    category: 'Events & Culture',
    author: 'UKTA Media Cell',
    date: '2026-03-01',
    coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800',
    tags: ['Ugadi', 'London', 'Culture', 'Kuchipudi']
  },
  {
    id: 'news-2',
    slug: 'guinness-world-record-recognition',
    title: 'UKTA Recognized by Parliament for Guinness World Record Cultural Achievement',
    excerpt: 'Members of the UK Parliament praise UKTA for fostering cultural integration and promoting South Asian classical arts.',
    content: `In a historic parliamentary motion, the UK Telugu Association was commended for organizing the largest synchronized Kuchipudi ensemble outside India, bringing together over 500 performers from across Europe.`,
    category: 'Achievements',
    author: 'UKTA PR Officer',
    date: '2025-11-05',
    coverImage: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&q=80&w=800',
    tags: ['Guinness World Record', 'Parliament', 'Achievement']
  }
];

const INITIAL_SETTINGS: SiteSettings = {
  siteTitle: 'UK Telugu Association (UKTA)',
  tagline: 'Serving and Connecting the Telugu Community in the United Kingdom',
  contactEmail: 'info@ukta.org.uk',
  contactPhone: '+44 20 8123 4567',
  address: 'UKTA Centre, Chiswick Park, 566 Chiswick High Rd, London W4 5YA, United Kingdom',
  twitterUrl: 'https://twitter.com/ukta_official',
  linkedinUrl: 'https://linkedin.com/company/ukta-official',
  facebookUrl: 'https://facebook.com/ukteluguassociation',
  instagramUrl: 'https://instagram.com/ukta_official',
  youtubeUrl: 'https://youtube.com/@uktaofficial',
  googleAnalyticsId: 'G-UKTA2026SEO',
  enableTracking: true
};

export class DataStore {
  private static STORAGE_KEY = 'ukta_app_data_v1';

  private static getStoredData() {
    if (typeof window === 'undefined') return null;
    try {
      const item = localStorage.getItem(DataStore.STORAGE_KEY);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  }

  private static saveData(data: any) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(DataStore.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  public static init() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(DataStore.STORAGE_KEY)) {
      const defaultState = {
        events: INITIAL_EVENTS,
        leadership: INITIAL_LEADERSHIP,
        media: INITIAL_MEDIA,
        charityCases: INITIAL_CHARITY_CASES,
        members: INITIAL_MEMBERS,
        donations: INITIAL_DONATIONS,
        news: INITIAL_NEWS,
        analytics: [],
        settings: INITIAL_SETTINGS
      };
      DataStore.saveData(defaultState);
    }
  }

  // --- EVENTS CRUD ---
  public static getEvents(): EventItem[] {
    const data = DataStore.getStoredData();
    return data?.events || INITIAL_EVENTS;
  }

  public static addEvent(event: Omit<EventItem, 'id' | 'rsvpCount'>): EventItem {
    const data = DataStore.getStoredData() || { events: INITIAL_EVENTS };
    const newEvent: EventItem = {
      ...event,
      id: `evt-${Date.now()}`,
      rsvpCount: 0
    };
    data.events = [newEvent, ...data.events];
    DataStore.saveData(data);
    return newEvent;
  }

  public static rsvpEvent(eventId: string): number {
    const data = DataStore.getStoredData() || { events: INITIAL_EVENTS };
    let newCount = 0;
    data.events = data.events.map((evt: EventItem) => {
      if (evt.id === eventId) {
        newCount = evt.rsvpCount + 1;
        return { ...evt, rsvpCount: newCount };
      }
      return evt;
    });
    DataStore.saveData(data);
    return newCount;
  }

  // --- LEADERSHIP CRUD ---
  public static getLeadership(): LeadershipMember[] {
    const data = DataStore.getStoredData();
    return data?.leadership || INITIAL_LEADERSHIP;
  }

  public static addLeadershipMember(member: Omit<LeadershipMember, 'id'>): LeadershipMember {
    const data = DataStore.getStoredData() || { leadership: INITIAL_LEADERSHIP };
    const newMember: LeadershipMember = {
      ...member,
      id: `lead-${Date.now()}`
    };
    data.leadership = [...data.leadership, newMember];
    DataStore.saveData(data);
    return newMember;
  }

  // --- MEDIA ---
  public static getMedia(): MediaAlbum[] {
    const data = DataStore.getStoredData();
    return data?.media || INITIAL_MEDIA;
  }

  // --- CHARITY CASES ---
  public static getCharityCases(): CharityCase[] {
    const data = DataStore.getStoredData();
    return data?.charityCases || INITIAL_CHARITY_CASES;
  }

  public static submitCharityHelp(request: Omit<CharityCase, 'id' | 'status' | 'createdAt' | 'notes'>): CharityCase {
    const data = DataStore.getStoredData() || { charityCases: INITIAL_CHARITY_CASES };
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newCase: CharityCase = {
      ...request,
      id: `UKTA-HELP-${randomNum}`,
      status: 'New',
      createdAt: new Date().toISOString().split('T')[0],
      notes: [`Ticket created via public portal on ${new Date().toLocaleDateString()}`]
    };
    data.charityCases = [newCase, ...(data.charityCases || [])];
    DataStore.saveData(data);
    return newCase;
  }

  public static updateCharityStatus(id: string, status: CharityCase['status'], note?: string): boolean {
    const data = DataStore.getStoredData() || { charityCases: INITIAL_CHARITY_CASES };
    data.charityCases = data.charityCases.map((c: CharityCase) => {
      if (c.id === id) {
        const updatedNotes = note ? [...c.notes, note] : c.notes;
        return { ...c, status, notes: updatedNotes };
      }
      return c;
    });
    DataStore.saveData(data);
    return true;
  }

  // --- MEMBERSHIP ---
  public static getMembers(): Member[] {
    const data = DataStore.getStoredData();
    return data?.members || INITIAL_MEMBERS;
  }

  public static addMember(member: Omit<Member, 'id' | 'status' | 'startDate' | 'expiryDate'>): Member {
    const data = DataStore.getStoredData() || { members: INITIAL_MEMBERS };
    const randomNum = Math.floor(5000 + Math.random() * 4000);
    const today = new Date().toISOString().split('T')[0];
    const expiry = member.tier === 'Life Member' ? 'Lifetime' : new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0];
    
    const newMember: Member = {
      ...member,
      id: `UKTA-MEM-${randomNum}`,
      status: 'Active',
      startDate: today,
      expiryDate: expiry
    };
    data.members = [newMember, ...(data.members || [])];
    DataStore.saveData(data);
    return newMember;
  }

  // --- DONATIONS ---
  public static getDonations(): DonationRecord[] {
    const data = DataStore.getStoredData();
    return data?.donations || INITIAL_DONATIONS;
  }

  public static addDonation(donation: Omit<DonationRecord, 'id' | 'date' | 'receiptNo'>): DonationRecord {
    const data = DataStore.getStoredData() || { donations: INITIAL_DONATIONS };
    const now = new Date();
    const receipt = `UKTA-REC-${now.getFullYear()}-${Math.floor(1000 + Math.random()*9000)}`;
    const newDonation: DonationRecord = {
      ...donation,
      id: `DON-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      receiptNo: receipt
    };
    data.donations = [newDonation, ...(data.donations || [])];
    DataStore.saveData(data);
    return newDonation;
  }

  // --- BLOG / NEWS ---
  public static getNews(): BlogPost[] {
    const data = DataStore.getStoredData();
    return data?.news || INITIAL_NEWS;
  }

  // --- ANALYTICS ---
  public static getAnalytics(): AnalyticsEvent[] {
    const data = DataStore.getStoredData();
    return data?.analytics || [];
  }

  public static logAnalyticsEvent(eventName: string, path: string, details?: Record<string, any>) {
    if (typeof window === 'undefined') return;
    const data = DataStore.getStoredData() || { analytics: [] };
    const newEvent: AnalyticsEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString() + ', ' + new Date().toLocaleDateString(),
      eventName,
      path,
      details
    };
    data.analytics = [newEvent, ...(data.analytics || []).slice(0, 100)];
    DataStore.saveData(data);
  }

  // --- SETTINGS ---
  public static getSettings(): SiteSettings {
    const data = DataStore.getStoredData();
    return data?.settings || INITIAL_SETTINGS;
  }
}
