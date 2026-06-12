// Lightweight inline SVG icons (stroke style)
type P = { className?: string; size?: number };
const base = (size = 22, className = '') => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const, className,
});

export const HomeIcon = ({ size, className }: P) => (
  <svg {...base(size, className)}><path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/></svg>
);
export const StoreIcon = ({ size, className }: P) => (
  <svg {...base(size, className)}><path d="M3 9l1.5-4.5h15L21 9"/><path d="M4 9v11h16V9"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M9 22v-6h6v6"/></svg>
);
export const CalIcon = ({ size, className }: P) => (
  <svg {...base(size, className)}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
);
export const BriefIcon = ({ size, className }: P) => (
  <svg {...base(size, className)}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/></svg>
);
export const NewsIcon = ({ size, className }: P) => (
  <svg {...base(size, className)}><path d="M4 4h16v16H4z"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>
);
export const UserIcon = ({ size, className }: P) => (
  <svg {...base(size, className)}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>
);
export const BellIcon = ({ size, className }: P) => (
  <svg {...base(size, className)}><path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg>
);
export const SearchIcon = ({ size, className }: P) => (
  <svg {...base(size, className)}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
);
export const ChevronRight = ({ size, className }: P) => (
  <svg {...base(size, className)}><path d="m9 6 6 6-6 6"/></svg>
);
export const ChevronLeft = ({ size, className }: P) => (
  <svg {...base(size, className)}><path d="m15 6-6 6 6 6"/></svg>
);
export const ChevronDown = ({ size, className }: P) => (
  <svg {...base(size, className)}><path d="m6 9 6 6 6-6"/></svg>
);
export const PinIcon = ({ size, className }: P) => (
  <svg {...base(size, className)}><path d="M12 2v6l3 3-3 3v8M9 11h6"/></svg>
);
export const CheckCircle = ({ size, className }: P) => (
  <svg {...base(size, className)}><circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/></svg>
);
export const PhoneIcon = ({ size, className }: P) => (
  <svg {...base(size, className)}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.37 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.33 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>
);
export const MapPin = ({ size, className }: P) => (
  <svg {...base(size, className)}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);
export const ClockIcon = ({ size, className }: P) => (
  <svg {...base(size, className)}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
);
export const FilterIcon = ({ size, className }: P) => (
  <svg {...base(size, className)}><path d="M3 6h18M6 12h12M10 18h4"/></svg>
);
export const PlusIcon = ({ size, className }: P) => (
  <svg {...base(size, className)}><path d="M12 5v14M5 12h14"/></svg>
);
export const FlagIcon = ({ size, className }: P) => (
  <svg {...base(size, className)}><path d="M4 22V4M4 4h13l-2 5 2 5H4"/></svg>
);
export const ShareIcon = ({ size, className }: P) => (
  <svg {...base(size, className)}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>
);
export const SettingsIcon = ({ size, className }: P) => (
  <svg {...base(size, className)}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>
);
export const LogoutIcon = ({ size, className }: P) => (
  <svg {...base(size, className)}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
);
export const GlobeIcon = ({ size, className }: P) => (
  <svg {...base(size, className)}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/></svg>
);
export const BookmarkIcon = ({ size, className }: P) => (
  <svg {...base(size, className)}><path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
);
export const HeartIcon = ({ size, className }: P) => (
  <svg {...base(size, className)}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
);
export const ShieldIcon = ({ size, className }: P) => (
  <svg {...base(size, className)}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>
);
export const HelpIcon = ({ size, className }: P) => (
  <svg {...base(size, className)}><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4"/><path d="M12 17h.01"/></svg>
);
export const XIcon = ({ size, className }: P) => (
  <svg {...base(size, className)}><path d="M18 6 6 18M6 6l12 12"/></svg>
);
export const StarIcon = ({ size, className }: P) => (
  <svg {...base(size, className)} fill="currentColor" stroke="none"><path d="m12 2 3.1 6.3 7 1-5 4.9 1.1 6.8L12 17.8 5.8 21l1.1-6.8-5-4.9 7-1z"/></svg>
);
