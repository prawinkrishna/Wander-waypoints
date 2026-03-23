import { Component } from '@angular/core';

@Component({
  selector: 'app-not-found',
  template: `
    <app-navbar></app-navbar>
    <div class="not-found-page">
      <div class="not-found-content">
        <mat-icon class="not-found-icon">explore_off</mat-icon>
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The destination you're looking for doesn't exist or has been moved.</p>
        <div class="not-found-actions">
          <button mat-flat-button color="primary" routerLink="/home">
            <mat-icon>home</mat-icon>
            Go Home
          </button>
          <button mat-stroked-button routerLink="/trip-feed">
            <mat-icon>map</mat-icon>
            Discover Trips
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .not-found-page {
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-8);
      background: var(--color-background);
    }

    .not-found-content {
      text-align: center;
      max-width: 480px;
    }

    .not-found-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: var(--primary);
      opacity: 0.5;
      margin-bottom: var(--space-4);
    }

    h1 {
      font-size: 5rem;
      font-weight: 800;
      color: var(--primary);
      line-height: 1;
      margin-bottom: var(--space-2);
    }

    h2 {
      font-size: var(--text-h2);
      color: var(--color-text-primary);
      margin-bottom: var(--space-4);
    }

    p {
      font-size: var(--text-body-lg);
      color: var(--color-text-secondary);
      margin-bottom: var(--space-8);
    }

    .not-found-actions {
      display: flex;
      gap: var(--space-4);
      justify-content: center;
      flex-wrap: wrap;
    }
  `]
})
export class NotFoundComponent {}
