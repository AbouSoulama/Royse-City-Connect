export const BUSINESS_CATEGORIES = [
  'Restaurant',
  'Coffee Shop',
  'Bakery',
  'Grocery',
  'Retail Store',
  'Clothing',
  'Home Services',
  'HVAC',
  'Plumbing',
  'Electrical',
  'Roofing',
  'Lawn Care',
  'Cleaning Services',
  'Auto Repair',
  'Car Wash',
  'Real Estate',
  'Mortgage',
  'Insurance',
  'Medical',
  'Dental',
  'Chiropractic',
  'Salon',
  'Barber',
  'Nail Salon',
  'Gym',
  'Childcare',
  'Pet Services',
  'Photography',
  'Event Services',
  'Professional Services',
  'Nonprofit',
  'Church',
  'Other',
] as const;

export const CONTACT_METHODS = ['Phone', 'Email', 'SMS', 'WhatsApp'] as const;

export const SERVICE_AREAS = [
  'Rockwall',
  'Fate',
  'Caddo Mills',
  'Greenville',
  'Garland',
  'Dallas',
  'Mobile Service',
  'Entire DFW',
] as const;

export const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export const WEEKDAY_LABELS: Record<(typeof WEEKDAYS)[number], string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export const PRICE_RANGES = ['<25$', '25-50$', '50-100$', '100-250$', '250$+'] as const;

export const COMMERCIAL_OPTIONS = [
  'Online Booking',
  'Delivery',
  'Pickup',
  'Gift Cards',
  'Mobile Service',
  'Financing',
  'Free Consultation',
] as const;

export const PROMO_CHANNELS = [
  'Website',
  'Facebook',
  'Instagram',
  'TikTok',
  'Newsletter',
  'New Resident Guide',
] as const;

export const IDEAL_FOR_OPTIONS = [
  'New homeowners',
  'Families',
  'Pets',
  'Seniors',
  'Students',
] as const;

export const PHOTO_SLOTS = [
  { key: 'logo', label: 'Logo' },
  { key: 'facade', label: 'Storefront' },
  { key: 'interior', label: 'Interior' },
  { key: 'team', label: 'Team' },
  { key: 'products', label: 'Products' },
  { key: 'services', label: 'Services' },
] as const;

export const LANGUAGE_SUGGESTIONS = [
  'English',
  'French',
  'Spanish',
  'Arabic',
  'Portuguese',
  'Swahili',
  'Mandarin',
] as const;

export const PAYMENT_SUGGESTIONS = [
  'Cash',
  'Credit / Debit',
  'Apple Pay',
  'Google Pay',
  'Zelle',
  'Cash App',
  'Check',
  'Financing',
] as const;

export const EMPLOYEE_COUNTS = [
  '1 (Solo)',
  '2-5',
  '6-10',
  '11-25',
  '26-50',
  '50+',
] as const;

export const WIZARD_STEPS = [
  { id: 1, title: 'Business', short: 'Business' },
  { id: 2, title: 'Owner', short: 'Owner' },
  { id: 3, title: 'Address', short: 'Address' },
  { id: 4, title: 'Hours', short: 'Hours' },
  { id: 5, title: 'Online', short: 'Online' },
  { id: 6, title: 'Photos', short: 'Photos' },
  { id: 7, title: 'Commercial', short: 'Offer' },
  { id: 8, title: 'Advanced', short: 'Details' },
  { id: 9, title: 'Partnership', short: 'Partner' },
] as const;

export const CATEGORY_META: Record<string, { emoji: string; color: string }> = {
  Restaurant: { emoji: '🍲', color: 'from-crimson to-crimson-dark' },
  'Coffee Shop': { emoji: '☕', color: 'from-amber-700 to-amber-900' },
  Bakery: { emoji: '🥐', color: 'from-orange-400 to-amber-600' },
  Grocery: { emoji: '🛒', color: 'from-amber-500 to-orange-600' },
  'Retail Store': { emoji: '🛍️', color: 'from-violet-500 to-purple-700' },
  Clothing: { emoji: '👗', color: 'from-purple-600 to-indigo-700' },
  'Home Services': { emoji: '🏡', color: 'from-sky-600 to-blue-800' },
  HVAC: { emoji: '❄️', color: 'from-cyan-600 to-blue-700' },
  Plumbing: { emoji: '🔧', color: 'from-slate-600 to-slate-800' },
  Electrical: { emoji: '⚡', color: 'from-yellow-500 to-amber-700' },
  Roofing: { emoji: '🏠', color: 'from-stone-600 to-stone-800' },
  'Lawn Care': { emoji: '🌿', color: 'from-emerald-500 to-green-700' },
  'Cleaning Services': { emoji: '✨', color: 'from-teal-500 to-cyan-700' },
  'Auto Repair': { emoji: '🚗', color: 'from-slate-600 to-slate-900' },
  'Car Wash': { emoji: '💧', color: 'from-blue-400 to-cyan-600' },
  'Real Estate': { emoji: '🔑', color: 'from-blue-600 to-indigo-700' },
  Mortgage: { emoji: '🏦', color: 'from-emerald-700 to-teal-900' },
  Insurance: { emoji: '🛡️', color: 'from-navy to-navy-dark' },
  Medical: { emoji: '🏥', color: 'from-rose-500 to-red-700' },
  Dental: { emoji: '😁', color: 'from-sky-400 to-blue-600' },
  Chiropractic: { emoji: '🦴', color: 'from-teal-600 to-emerald-800' },
  Salon: { emoji: '💇', color: 'from-pink-500 to-fuchsia-600' },
  Barber: { emoji: '💈', color: 'from-red-600 to-navy' },
  'Nail Salon': { emoji: '💅', color: 'from-fuchsia-500 to-pink-700' },
  Gym: { emoji: '💪', color: 'from-orange-600 to-red-700' },
  Childcare: { emoji: '🧸', color: 'from-yellow-400 to-orange-500' },
  'Pet Services': { emoji: '🐾', color: 'from-amber-600 to-orange-800' },
  Photography: { emoji: '📷', color: 'from-violet-600 to-indigo-800' },
  'Event Services': { emoji: '🎉', color: 'from-crimson to-pink-700' },
  'Professional Services': { emoji: '💼', color: 'from-navy-light to-navy-dark' },
  Nonprofit: { emoji: '🤝', color: 'from-emerald-600 to-teal-800' },
  Church: { emoji: '✝️', color: 'from-navy to-navy-dark' },
  Other: { emoji: '🏪', color: 'from-navy to-navy-light' },
};

export const DRAFT_STORAGE_KEY = 'rc_business_register_draft_v1';
export const TOTAL_STEPS = WIZARD_STEPS.length;
