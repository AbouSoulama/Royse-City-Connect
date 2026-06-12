export type PostCategory =
  | 'news' | 'immigration' | 'church' | 'association' | 'fundraiser' | 'funeral' | 'alert'
  | 'hospitality' | 'realestate';

/** Includes content types shown in the community feed (not all are post DB categories). */
export type FeedCategory = PostCategory | 'event' | 'job' | 'business';

export interface Post {
  id: string;
  category: PostCategory;
  /** Badge/filter category — events, jobs, businesses use feedCategory. */
  feedCategory?: FeedCategory;
  title: string;
  body: string;
  author: string;
  city: string;
  date: string;
  pinned?: boolean;
  important?: boolean;
  status: 'approved' | 'pending' | 'rejected';
  image?: string;
  reactions?: number;
  sourceType?: 'post' | 'event' | 'job' | 'business';
  sourceId?: string;
  linkPage?: 'events' | 'opportunities' | 'businesses';
}

export interface Business {
  id: string;
  name: string;
  category: string;
  description: string;
  owner: string;
  phone: string;
  whatsapp: string;
  city: string;
  address?: string;
  emoji: string;
  color: string;
  verified: boolean;
  featured?: boolean;
  rating: number;
  createdAt: string;
  status?: 'approved' | 'pending' | 'rejected';
  image?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  city: string;
  emoji: string;
  color: string;
  featured?: boolean;
  attendees: number;
  status?: 'approved' | 'pending' | 'rejected';
  image?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  contact: string;
  expires: string;
  postedBy: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Volunteer';
  postedAgo: string;
  status?: 'approved' | 'pending' | 'rejected';
  image?: string;
}

export const posts: Post[] = [
  {
    id: 'p1',
    category: 'alert',
    title: 'Severe weather alert — North Texas',
    body: 'Strong thunderstorms expected this evening across Royse City and Rockwall County. Please stay indoors after 7pm and check on your elderly neighbors.',
    author: 'Royse City Connect Team',
    city: 'Royse City',
    date: '2026-03-18',
    pinned: true,
    important: true,
    status: 'approved',
    reactions: 84,
  },
  {
    id: 'p2',
    category: 'immigration',
    title: 'Free immigration legal clinic — Saturday',
    body: 'Free consultations with certified immigration attorneys. Bring your documents. Walk-ins welcome from 10am to 3pm at the Royse City Community Center.',
    author: 'African Legal Aid Network',
    city: 'Royse City',
    date: '2026-03-17',
    pinned: true,
    status: 'approved',
    reactions: 142,
  },
  {
    id: 'p3',
    category: 'church',
    title: 'Sunday service — Cameroonian Christian Fellowship',
    body: 'Join us this Sunday at 11am for worship, fellowship and a special message from Pastor Eyong. Children\'s Sunday school available.',
    author: 'CCF Dallas',
    city: 'Dallas',
    date: '2026-03-16',
    status: 'approved',
    reactions: 38,
  },
  {
    id: 'p4',
    category: 'fundraiser',
    title: 'Help the Nguemba family rebuild after fire',
    body: 'The Nguemba family lost everything in a house fire last week. We are raising $15,000 to help them get back on their feet. Every dollar counts.',
    author: 'Community Solidarity',
    city: 'Royse City',
    date: '2026-03-15',
    status: 'approved',
    reactions: 211,
  },
  {
    id: 'p5',
    category: 'news',
    title: 'New African grocery store opens in Rockwall',
    body: 'Mama Africa Market officially opened its doors this weekend. Fresh plantains, cassava, fufu flour, palm oil and more available now.',
    author: 'Community News',
    city: 'Rockwall',
    date: '2026-03-14',
    status: 'approved',
    reactions: 96,
  },
  {
    id: 'p6',
    category: 'association',
    title: 'Cameroonian Association monthly meeting',
    body: 'Our monthly assembly will take place on March 30th at 4pm. Agenda: summer cultural festival planning, scholarship program, member updates.',
    author: 'CAANT - Cameroonian Association',
    city: 'Dallas',
    date: '2026-03-13',
    status: 'approved',
    reactions: 27,
  },
  {
    id: 'p7',
    category: 'funeral',
    title: 'Funeral arrangements — Late Mr. Tabi',
    body: 'Wake keeping on Friday 7pm at the family residence. Funeral service Saturday at 10am. The community is invited to support the family.',
    author: 'Tabi Family',
    city: 'Royse City',
    date: '2026-03-12',
    status: 'pending',
    reactions: 0,
  },
];

export const businesses: Business[] = [
  {
    id: 'b1',
    name: 'Mama Africa Market',
    category: 'Grocery',
    description: 'Authentic African groceries: plantains, cassava, fufu, palm oil, dried fish, spices and more. Family-owned since 2024.',
    owner: 'Sarah Eyong',
    phone: '+1 (469) 555-0142',
    whatsapp: '+14695550142',
    city: 'Rockwall',
    address: '1240 N Goliad St, Rockwall, TX',
    emoji: '🛒',
    color: 'from-amber-500 to-orange-600',
    verified: true,
    featured: true,
    rating: 4.8,
    createdAt: '2024-08-12',
  },
  {
    id: 'b2',
    name: 'Chez Tantine Restaurant',
    category: 'Restaurant',
    description: 'Authentic Cameroonian cuisine. Ndolè, eru, achu, pepper soup, grilled fish. Catering available for events.',
    owner: 'Marie Ngono',
    phone: '+1 (469) 555-0188',
    whatsapp: '+14695550188',
    city: 'Dallas',
    address: '3402 Forest Ln, Dallas, TX',
    emoji: '🍲',
    color: 'from-crimson to-crimson-dark',
    verified: true,
    featured: true,
    rating: 4.9,
    createdAt: '2023-11-04',
  },
  {
    id: 'b3',
    name: 'Royse City Auto Repair',
    category: 'Automotive',
    description: 'Honest, affordable car repair by a trusted African mechanic. Oil change, brakes, diagnostics, body work.',
    owner: 'Jean-Paul Mbarga',
    phone: '+1 (214) 555-0199',
    whatsapp: '+12145550199',
    city: 'Royse City',
    address: '801 E Main St, Royse City, TX',
    emoji: '🔧',
    color: 'from-slate-600 to-slate-800',
    verified: true,
    rating: 4.7,
    createdAt: '2024-02-20',
  },
  {
    id: 'b4',
    name: 'Afro Beauty Salon',
    category: 'Beauty',
    description: 'Braids, twists, locs, weaves and natural hair care. Specialist in African hairstyles for women and children.',
    owner: 'Aissatou Diallo',
    phone: '+1 (972) 555-0166',
    whatsapp: '+19725550166',
    city: 'Dallas',
    emoji: '💇🏾‍♀️',
    color: 'from-pink-500 to-fuchsia-600',
    verified: true,
    rating: 4.9,
    createdAt: '2024-05-08',
  },
  {
    id: 'b5',
    name: 'Sankofa Tax & Accounting',
    category: 'Services',
    description: 'Tax filing, ITIN applications, small business bookkeeping. Bilingual French/English service.',
    owner: 'Kwame Asante',
    phone: '+1 (469) 555-0173',
    whatsapp: '+14695550173',
    city: 'Royse City',
    emoji: '📊',
    color: 'from-emerald-600 to-teal-700',
    verified: true,
    featured: true,
    rating: 4.8,
    createdAt: '2023-09-15',
  },
  {
    id: 'b6',
    name: 'African Fashion House',
    category: 'Fashion',
    description: 'Custom-made African wear: kaba, agbada, kente, ankara dresses. Tailoring and alterations.',
    owner: 'Fatou Sow',
    phone: '+1 (214) 555-0155',
    whatsapp: '+12145550155',
    city: 'Dallas',
    emoji: '👗',
    color: 'from-purple-600 to-indigo-700',
    verified: false,
    rating: 4.6,
    createdAt: '2024-10-01',
  },
];

export const events: Event[] = [
  {
    id: 'e1',
    title: 'African Cultural Festival 2026',
    description: 'A full day celebration of African culture: music, dance, food, fashion show and kids activities. Free entry for the community.',
    date: '2026-04-12',
    time: '11:00 AM',
    location: 'Royse City Park, Main Pavilion',
    organizer: 'Royse City African Community',
    city: 'Royse City',
    emoji: '🎉',
    color: 'from-crimson to-amber-500',
    featured: true,
    attendees: 184,
  },
  {
    id: 'e2',
    title: 'Immigration legal clinic',
    description: 'Free consultations with certified immigration attorneys. Bring your documents. Translation in French available.',
    date: '2026-03-22',
    time: '10:00 AM',
    location: 'Royse City Community Center',
    organizer: 'African Legal Aid Network',
    city: 'Royse City',
    emoji: '⚖️',
    color: 'from-navy to-navy-light',
    featured: true,
    attendees: 56,
  },
  {
    id: 'e3',
    title: 'Youth mentorship program launch',
    description: 'Mentorship program for African youth aged 14-22. Career guidance, college prep, leadership skills.',
    date: '2026-03-29',
    time: '2:00 PM',
    location: 'Dallas Public Library, Room 204',
    organizer: 'African Youth Network',
    city: 'Dallas',
    emoji: '🎓',
    color: 'from-emerald-600 to-teal-700',
    attendees: 32,
  },
  {
    id: 'e4',
    title: 'Women entrepreneurs networking',
    description: 'Monthly networking for African women business owners. Guest speaker: founder of Sankofa Tax.',
    date: '2026-04-05',
    time: '6:30 PM',
    location: 'Chez Tantine Restaurant',
    organizer: 'African Women Business Network',
    city: 'Dallas',
    emoji: '👩🏾‍💼',
    color: 'from-purple-600 to-pink-600',
    attendees: 48,
  },
];

export const jobs: Job[] = [
  {
    id: 'j1',
    title: 'CDL Truck Driver',
    description: 'Looking for experienced Class A CDL driver. Local routes, home daily. Competitive pay $1,400-$1,800/week. Bilingual welcome.',
    location: 'Royse City, TX',
    contact: '+1 (469) 555-0211 — driving@texaslog.com',
    expires: '2026-04-30',
    postedBy: 'Texas Logistics LLC',
    type: 'Full-time',
    postedAgo: '2 days ago',
  },
  {
    id: 'j2',
    title: 'Home Health Aide (HHA)',
    description: 'Certified HHA needed for elderly client in Rockwall. Day shifts, weekends optional. Training provided.',
    location: 'Rockwall, TX',
    contact: '+1 (972) 555-0177',
    expires: '2026-04-15',
    postedBy: 'Caring Hands Agency',
    type: 'Part-time',
    postedAgo: '5 days ago',
  },
  {
    id: 'j3',
    title: 'Warehouse Associate — Amazon facility',
    description: 'Multiple openings. $19.50/hour starting. Health insurance after 30 days. No experience required.',
    location: 'Forney, TX',
    contact: 'apply@hireexpress.com',
    expires: '2026-05-10',
    postedBy: 'Hire Express Staffing',
    type: 'Full-time',
    postedAgo: '1 week ago',
  },
  {
    id: 'j4',
    title: 'Babysitter (French-speaking)',
    description: 'Family looking for a trusted French-speaking babysitter, 3 evenings per week. References required.',
    location: 'Dallas, TX',
    contact: '+1 (214) 555-0123 (WhatsApp)',
    expires: '2026-03-31',
    postedBy: 'Mme Nkomo',
    type: 'Part-time',
    postedAgo: '3 days ago',
  },
  {
    id: 'j5',
    title: 'Volunteer — Cultural Festival 2026',
    description: 'Volunteers needed for setup, registration and food booth on April 12th. T-shirt and meal provided.',
    location: 'Royse City, TX',
    contact: 'volunteer@rcconnect.app',
    expires: '2026-04-10',
    postedBy: 'Royse City African Community',
    type: 'Volunteer',
    postedAgo: '1 day ago',
  },
];

export const notifications = [
  { id: 'n1', type: 'alert', title: 'Severe weather alert', body: 'Storms tonight in Royse City. Stay safe.', time: '2h ago', unread: true },
  { id: 'n2', type: 'event', title: 'Cultural Festival reminder', body: 'Don\'t forget — April 12 at Royse City Park.', time: '5h ago', unread: true },
  { id: 'n3', type: 'business', title: 'New verified business', body: 'Sankofa Tax & Accounting is now verified.', time: '1d ago', unread: true },
  { id: 'n4', type: 'admin', title: 'Your post was approved', body: 'Your announcement is now visible to the community.', time: '2d ago', unread: false },
  { id: 'n5', type: 'event', title: 'Immigration clinic Saturday', body: 'Free legal consultations from 10am to 3pm.', time: '3d ago', unread: false },
];

export const categoryColors: Record<FeedCategory, string> = {
  news: 'bg-blue-100 text-blue-700',
  immigration: 'bg-indigo-100 text-indigo-700',
  church: 'bg-purple-100 text-purple-700',
  association: 'bg-emerald-100 text-emerald-700',
  fundraiser: 'bg-amber-100 text-amber-700',
  funeral: 'bg-slate-200 text-slate-700',
  alert: 'bg-red-100 text-red-700',
  hospitality: 'bg-orange-100 text-orange-700',
  realestate: 'bg-teal-100 text-teal-700',
  event: 'bg-violet-100 text-violet-700',
  job: 'bg-sky-100 text-sky-700',
  business: 'bg-rose-100 text-rose-700',
};

export const categoryEmoji: Record<FeedCategory, string> = {
  news: '📰',
  immigration: '🛂',
  church: '⛪',
  association: '🤝',
  fundraiser: '💝',
  funeral: '🕊️',
  alert: '🚨',
  hospitality: '🏨',
  realestate: '🏠',
  event: '📅',
  job: '💼',
  business: '🏪',
};

export const businessCategories = ['Grocery', 'Restaurant', 'Hospitality', 'Hotels', 'Real Estate', 'Automotive', 'Beauty', 'Services', 'Fashion', 'Health'];
export const cities = ['Royse City', 'Dallas', 'Rockwall', 'Forney', 'Garland', 'Plano'];
