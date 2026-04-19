import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
        dataLayer?: any[];
    }
}

/**
 * Centralized analytics wrapper. The gtag.js loader script lives in
 * `src/index.html` and pushes calls into `window.dataLayer` until the
 * real GA4 Measurement ID is configured (currently a placeholder).
 *
 * Why a wrapper instead of calling gtag() directly from components:
 *   1. One place to swap providers (GA4 → Plausible/Mixpanel/PostHog)
 *      without touching call sites.
 *   2. Typed event taxonomy — avoid typo'd event names that silently
 *      break dashboards.
 *   3. Disabled-in-dev guard so analytics noise doesn't pollute the
 *      live dashboard during local development.
 *
 * To enable: replace `G-XXXXXXXXXX` in `src/index.html` with the real
 * Measurement ID and the events below start landing in GA4 immediately.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
    /** Set to true once the real GA4 ID is wired into index.html. */
    private readonly enabled = true;

    constructor(private router: Router) {}

    /**
     * Wire automatic page-view tracking. Call once from the AppComponent
     * constructor — Angular's NavigationEnd fires per SPA route change.
     */
    initRouteTracking(): void {
        this.router.events
            .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
            .subscribe((event) => {
                this.trackPageView(event.urlAfterRedirects);
            });
    }

    /**
     * Manually track a page view. Used by `initRouteTracking`; safe to
     * call from components if you need a synthetic page view (e.g., a
     * modal-based "page" that doesn't change the route).
     */
    trackPageView(path: string): void {
        if (!this.enabled || typeof window.gtag !== 'function') return;
        window.gtag('event', 'page_view', {
            page_path: path,
            page_location: window.location.href,
            page_title: document.title,
        });
    }

    /**
     * Fire a custom event. The `name` parameter is type-narrowed to the
     * known event taxonomy below — adding a new event means adding it
     * here too, which forces every event to be deliberate.
     */
    trackEvent(name: AnalyticsEventName, params: Record<string, unknown> = {}): void {
        if (!this.enabled || typeof window.gtag !== 'function') return;
        window.gtag('event', name, params);
    }

    /**
     * Identify the current user. GA4 uses `user_id` for cross-device
     * stitching when the same user signs in on multiple devices. Pass
     * the Trekio userId — never the email or any PII.
     */
    identifyUser(userId: string | null): void {
        if (!this.enabled || typeof window.gtag !== 'function') return;
        window.gtag('set', { user_id: userId || undefined });
    }
}

/**
 * Canonical event taxonomy. Add new events here as the product grows.
 * Keep names snake_case to match GA4 conventions and avoid mixing
 * naming styles in the dashboard.
 */
export type AnalyticsEventName =
    | 'signup_completed'
    | 'login_completed'
    | 'login_failed'
    | 'google_sso_completed'
    | 'logout'
    | 'trip_created'
    | 'trip_viewed'
    | 'trip_liked'
    | 'trip_shared'
    | 'ai_generation_started'
    | 'ai_generation_completed'
    | 'ai_generation_failed'
    | 'pdf_exported'
    | 'agency_upgrade_completed'
    | 'booking_attempted'
    | 'feedback_submitted';
