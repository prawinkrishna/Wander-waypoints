import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { BRAND } from '../brand.config';

/**
 * Per-page SEO config. All fields are optional — anything you don't pass
 * falls back to the brand defaults from `brand.config.ts`.
 */
export interface SeoConfig {
  /** Page-specific title. The brand suffix (`| Trekio`) is added automatically. */
  title?: string;
  /** ~155 char meta description. Falls back to `BRAND.seo.defaultDescription`. */
  description?: string;
  /** Image URL — relative or absolute. Relative paths are resolved against `BRAND.url`. */
  image?: string;
  /** Route path (e.g. `/welcome`, `/trip-details/123`). Used to build the canonical URL. */
  path?: string;
  /** Open Graph type. Defaults to `website`. Use `article` for trip-details. */
  type?: 'website' | 'article' | 'profile';
  /** Add `<meta name="robots" content="noindex,nofollow">` for private pages. */
  noIndex?: boolean;
}

/**
 * Centralized SEO + social-card management. Wraps Angular's Title and
 * Meta services and adds canonical URL handling, OG/Twitter cards,
 * locale, and JSON-LD structured data.
 *
 * Usage in a component:
 *
 *   constructor(private seo: SeoService) {}
 *   ngOnInit() {
 *     this.seo.setMetaTags({
 *       title: 'Sign in',
 *       description: 'Sign in to your Trekio account.',
 *       path: '/login',
 *     });
 *   }
 *
 * For dynamic pages (trip-details, profile), call `setMetaTags` again
 * once the data has loaded so the title/description reflect the actual
 * content.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private titleService: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  /**
   * Apply a complete set of meta tags for the current page. Call from
   * each route component's `ngOnInit` (and again after data loads for
   * dynamic pages).
   */
  setMetaTags(config: SeoConfig = {}): void {
    const title = this.buildTitle(config.title);
    const description = config.description || BRAND.seo.defaultDescription;
    const image = this.absoluteUrl(config.image || BRAND.logo.ogImage);
    const url = this.absoluteUrl(config.path || '/');
    const type = config.type || 'website';

    // === Document title ===
    this.titleService.setTitle(title);

    // === Standard meta ===
    this.upsertNameTag('description', description);

    // === Robots ===
    if (config.noIndex) {
      this.upsertNameTag('robots', 'noindex,nofollow');
    } else {
      this.upsertNameTag('robots', 'index,follow');
    }

    // === Canonical link ===
    this.setCanonical(url);

    // === Open Graph ===
    this.upsertPropertyTag('og:title', title);
    this.upsertPropertyTag('og:description', description);
    this.upsertPropertyTag('og:image', image);
    this.upsertPropertyTag('og:url', url);
    this.upsertPropertyTag('og:type', type);
    this.upsertPropertyTag('og:site_name', BRAND.name);
    this.upsertPropertyTag('og:locale', BRAND.seo.locale);

    // === Twitter Card ===
    this.upsertNameTag('twitter:card', BRAND.seo.twitterCard);
    this.upsertNameTag('twitter:title', title);
    this.upsertNameTag('twitter:description', description);
    this.upsertNameTag('twitter:image', image);
    if (BRAND.seo.twitterHandle) {
      this.upsertNameTag('twitter:site', BRAND.seo.twitterHandle);
      this.upsertNameTag('twitter:creator', BRAND.seo.twitterHandle);
    }
  }

  /**
   * Inject a JSON-LD structured-data script into the document head.
   * Pass a schema.org-shaped object; this method handles serialization
   * and replaces any prior JSON-LD on the page.
   *
   * Example: `seo.setStructuredData({ '@context': 'https://schema.org', '@type': 'WebSite', ... })`
   */
  setStructuredData(jsonLd: Record<string, unknown>): void {
    const head = this.document.head;
    const existing = head.querySelector('script[type="application/ld+json"][data-seo="true"]');
    if (existing) {
      existing.remove();
    }
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo', 'true');
    script.text = JSON.stringify(jsonLd);
    head.appendChild(script);
  }

  /** Reset to brand defaults — useful when leaving a dynamic page. */
  reset(): void {
    this.setMetaTags();
  }

  // ────────────────────────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────────────────────────

  /** Build a full document title with the brand suffix. */
  private buildTitle(pageTitle?: string): string {
    if (!pageTitle) {
      return BRAND.seo.defaultTitle;
    }
    return `${pageTitle}${BRAND.seo.titleSuffix}`;
  }

  /**
   * Convert a relative path or asset reference into an absolute URL
   * rooted at `BRAND.url`. Already-absolute URLs (http/https) pass
   * through unchanged.
   */
  private absoluteUrl(maybeRelative: string): string {
    if (/^https?:\/\//i.test(maybeRelative)) {
      return maybeRelative;
    }
    const base = BRAND.url.replace(/\/$/, '');
    const path = maybeRelative.startsWith('/') ? maybeRelative : `/${maybeRelative}`;
    return `${base}${path}`;
  }

  /**
   * Insert or update `<link rel="canonical">` in the head. Manual DOM
   * manipulation is necessary because Angular's Meta service only
   * handles `<meta>` tags.
   */
  private setCanonical(url: string): void {
    const head = this.document.head;
    let link = head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private upsertNameTag(name: string, content: string): void {
    this.meta.updateTag({ name, content });
  }

  private upsertPropertyTag(property: string, content: string): void {
    this.meta.updateTag({ property, content });
  }
}
