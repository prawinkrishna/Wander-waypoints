/**
 * Centralized brand configuration.
 * Future rename = change this one file, rebuild, done.
 */
export const BRAND = {
  name: 'Trekio',
  tagline: 'Create journeys worth sharing.',
  description: 'Plan trips with AI, discover destinations, connect with travel agents, and book unforgettable experiences.',
  domain: 'trekio.com',
  url: 'https://trekio.com',
  logo: {
    icon: 'images/trekio-logo.png',
    ogImage: 'assets/images/og-image.jpg',
  },
  favicon: 'favicon.ico',
  studioName: 'Trekio Studio',
  defaultAuthor: 'Trekio User',
  copyright: `\u00A9 ${new Date().getFullYear()} Trekio. All rights reserved.`,
  social: {
    shareText: (itemName: string) => `Check out ${itemName} on Trekio!`,
  },
} as const;
