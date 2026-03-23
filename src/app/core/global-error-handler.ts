import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    // Log to console in development
    console.error('Unhandled error:', error);

    // Extract useful error info
    const message = error?.message || error?.toString() || 'Unknown error';
    const stack = error?.stack || '';

    // Avoid logging chunk loading errors (these happen during deployments)
    if (message.includes('ChunkLoadError') || message.includes('Loading chunk')) {
      // Reload on chunk errors (stale deployment)
      window.location.reload();
      return;
    }

    // Could send to an error tracking service here in production
    // e.g., Sentry, LogRocket, etc.
  }
}
