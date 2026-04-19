import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { trigger, transition, style, animate, query, group } from '@angular/animations';
import { Subscription } from 'rxjs';
import { ThemeService } from './core/services/theme.service';
import { AnalyticsService } from './core/services/analytics.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [
    trigger('routeAnimation', [
      transition('* <=> *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(8px)' })
        ], { optional: true }),
        group([
          query(':leave', [
            animate('150ms ease-out', style({ opacity: 0 }))
          ], { optional: true }),
          query(':enter', [
            animate('250ms 100ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ], { optional: true })
        ])
      ])
    ])
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Trekio';
  isLoading = false;
  isOffline = false;

  private routerSub!: Subscription;
  private onlineSub = () => { this.isOffline = false; };
  private offlineSub = () => { this.isOffline = true; };

  constructor(
    private router: Router,
    private themeService: ThemeService,
    private analytics: AnalyticsService,
  ) {}

  ngOnInit(): void {
    // Per-route GA4 page_view events. The gtag config in index.html sets
    // send_page_view: false so we get accurate SPA navigation tracking
    // here instead of one initial page view.
    this.analytics.initRouteTracking();

    // Loading bar on route navigation
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
      }
      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        this.isLoading = false;

        // Screen reader announcement for route changes
        if (event instanceof NavigationEnd) {
          this.announceRouteChange(event.urlAfterRedirects || event.url);
        }
      }
    });

    // Offline detection
    this.isOffline = !navigator.onLine;
    window.addEventListener('online', this.onlineSub);
    window.addEventListener('offline', this.offlineSub);
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    window.removeEventListener('online', this.onlineSub);
    window.removeEventListener('offline', this.offlineSub);
  }

  private announceRouteChange(url: string): void {
    const announcer = document.getElementById('route-announcer');
    if (announcer) {
      const pageName = this.getPageName(url);
      announcer.textContent = `Navigated to ${pageName}`;
    }
  }

  private getPageName(url: string): string {
    const segment = url.split('/').filter(s => s)[0] || 'home';
    return segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }
}
