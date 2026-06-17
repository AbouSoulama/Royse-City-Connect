/** HD hero backgrounds — Unsplash, optimized for mobile carousel (1200px, q=90) */
const q = 'auto=format&fit=crop&w=1200&h=800&q=90';

export const heroBackgrounds = {
  welcome: `https://images.unsplash.com/photo-1529156069898-49953e39b3ac?${q}`,
  businesses: `https://images.unsplash.com/photo-1555939594-58d7cb561ad1?${q}`,
  events: `https://images.unsplash.com/photo-1492684223066-81342ee5ff30?${q}`,
  jobs: `https://images.unsplash.com/photo-1521737711867-e3b97375f902?${q}`,
} as const;

export type HeroBackgroundKey = keyof typeof heroBackgrounds;
