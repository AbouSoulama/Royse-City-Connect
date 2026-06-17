/** Hero backgrounds bundled in /public/hero — reliable in production (no external CDN) */
export const heroBackgrounds = {
  welcome: '/hero/welcome.jpg',
  businesses: '/hero/businesses.jpg',
  events: '/hero/events.jpg',
  jobs: '/hero/jobs.jpg',
} as const;

export type HeroBackgroundKey = keyof typeof heroBackgrounds;
