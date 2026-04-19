import { ErrorHandler, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

/**
 * Global error handler. Catches every uncaught exception in the Angular
 * runtime (component lifecycle errors, unhandled rejected observables,
 * etc.) and centralizes the response.
 *
 * Sentry integration is *prepared but not active*: the
 * `reportToSentry` hook below is a no-op until you:
 *
 *   1. Create a Sentry project at sentry.io (free tier).
 *   2. Run: `npm install @sentry/angular`
 *   3. Set `environment.sentryDsn` in environment.prod.ts to the DSN
 *      from your Sentry project.
 *   4. Uncomment the Sentry init lines in `main.ts` (search for SENTRY).
 *   5. Replace the body of `reportToSentry` below with
 *      `Sentry.captureException(error, { extra });`
 *
 * Until then, errors are still logged to console and chunk-load errors
 * trigger a reload — the original behavior is preserved.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    const message = error?.message || error?.toString() || 'Unknown error';
    const stack = error?.stack || '';

    // Stale-deploy recovery: when a user has the old chunk hash cached
    // and we ship a new build, lazy-loaded modules fail to load.
    // Reloading pulls the fresh manifest and the user's next nav works.
    if (message.includes('ChunkLoadError') || message.includes('Loading chunk')) {
      window.location.reload();
      return;
    }

    // Always log to the browser console — useful both in dev and for
    // power users who file bug reports with screenshots.
    console.error('[GlobalErrorHandler]', error);

    // Hook for the eventual Sentry integration.
    this.reportToSentry(error, {
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      message,
      stack,
    });
  }

  /**
   * Stub. When Sentry is wired up, replace this method's body with:
   *   import * as Sentry from '@sentry/angular';
   *   Sentry.captureException(error, { extra });
   *
   * Kept as a no-op until the DSN is configured so the rest of the app
   * doesn't pay the cost of bundling the Sentry SDK before it's needed.
   */
  private reportToSentry(_error: any, _extra: Record<string, unknown>): void {
    if (!environment.sentryDsn) return;
    // Sentry not yet installed. See class doc above for setup steps.
  }
}
