/**
 * Centralized brand + deployment configuration.
 *
 * SINGLE SOURCE OF TRUTH for site name, URL, SEO defaults, and brand
 * assets. When the custom domain is purchased, change `domain` and `url`
 * below — every meta tag, canonical URL, sitemap entry, OG image link,
 * and copyright string will follow automatically on the next build.
 *
 * Future rename of the product = change `name`, `tagline`, and the SEO
 * defaults; everything else updates from there.
 */
export const BRAND = {
  // === IDENTITY ===
  name: 'Trekio',
  tagline: 'Create journeys worth sharing.',
  description:
    'Plan trips with AI, discover destinations, connect with travel agents, and book unforgettable experiences.',

  // === DEPLOYMENT ===
  // ⚠ CHANGE THESE TWO LINES when the custom domain is live.
  // Everything that needs an absolute URL reads from `url`, so a single
  // edit + rebuild rolls the new domain across the entire app.
  domain: 'wander-waypoints-u8ct.vercel.app',
  url: 'https://wander-waypoints-u8ct.vercel.app',

  // === BRAND ASSETS ===
  // Paths are relative to the deployed site root. The SeoService prepends
  // `url` automatically to produce absolute URLs for OG/Twitter cards.
  // Note: og-image.svg works for Twitter, Slack, WhatsApp, LinkedIn.
  // Convert to og-image.png for full Facebook compatibility before
  // serious launch — see public/assets/images/og-image.svg for details.
  logo: {
    icon: '/images/trekio-logo.png',
    ogImage: '/assets/images/og-image.svg',
  },
  favicon: 'favicon.ico',

  // === SEO ===
  seo: {
    // Appended to every page-specific title (e.g. "Sign in | Trekio").
    // The default title (used on the home/welcome page) is set verbatim.
    titleSuffix: ' | Trekio',
    defaultTitle: 'Trekio — AI Trip Planner & Travel Itineraries',
    defaultDescription:
      'Plan trips with AI, discover destinations, connect with travel agents, and book unforgettable experiences with Trekio.',
    // BCP-47 locale tag used by Open Graph (og:locale) and html lang attr.
    // Update if Trekio expands beyond India / English-speaking users.
    locale: 'en_IN',
    // Twitter handle (with @) for twitter:site / twitter:creator. Leave
    // empty until we have an actual account — empty values are skipped.
    twitterHandle: '',
    twitterCard: 'summary_large_image',
    // schema.org Organization data for JSON-LD on the welcome page.
    organization: {
      legalName: 'Trekio',
      foundingDate: '2026',
      // sameAs: external profiles (LinkedIn, Twitter, Instagram, etc.).
      // Add as social presence grows.
      sameAs: [] as string[],
    },
  },

  // === MISC ===
  studioName: 'Trekio Studio',
  defaultAuthor: 'Trekio User',
  copyright: `\u00A9 ${new Date().getFullYear()} Trekio. All rights reserved.`,
  social: {
    shareText: (itemName: string) => `Check out ${itemName} on Trekio!`,
  },
} as const;
