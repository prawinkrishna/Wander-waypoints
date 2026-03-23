import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { BRAND } from '../brand.config';

interface SeoConfig {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly defaultTitle = `${BRAND.name} — Plan, Share & Book Travel Experiences`;
  private readonly defaultDescription = BRAND.description;
  private readonly defaultImage = `${BRAND.url}/${BRAND.logo.ogImage}`;

  constructor(
    private meta: Meta,
    private titleService: Title
  ) {}

  updateMetaTags(config: SeoConfig): void {
    const title = config.title ? `${config.title} | ${BRAND.name}` : this.defaultTitle;
    const description = config.description || this.defaultDescription;
    const image = config.image || this.defaultImage;
    const url = config.url || '';
    const type = config.type || 'website';

    this.titleService.setTitle(title);

    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:type', content: type });
    if (url) {
      this.meta.updateTag({ property: 'og:url', content: url });
    }
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
  }

  resetMetaTags(): void {
    this.updateMetaTags({});
  }
}
