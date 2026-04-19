import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';
import { SeoService } from '../../core/services/seo.service';
import { environment } from '../../../environments/environment';

declare global {
  interface Window {
    google?: any;
  }
}

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss']
})
export class AuthPage implements OnInit {
  loading = false;
  errorMessage = '';
  successMessage = '';
  // Google SSO is gated on having a configured Client ID. When it's
  // empty (placeholder state) the button hides itself and a fallback
  // message renders instead, preventing a confusing dead-button state.
  googleSsoEnabled = !!environment.googleClientId;

  constructor(
    private authService: AuthService,
    private router: Router,
    private seo: SeoService,
  ) { }

  ngOnInit() {
    this.seo.setMetaTags({
      title: 'Sign in',
      description: 'Sign in to Trekio with Google to plan trips with AI, browse curated itineraries, and connect with travel agents.',
      path: '/login',
      type: 'website',
    });
    this.initGoogleSso();
  }

  private initGoogleSso() {
    if (!this.googleSsoEnabled) return;

    const tryInit = (attempt = 0) => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: (response: any) => this.onGoogleCredential(response),
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        return;
      }
      // GIS script may still be loading. Retry up to ~5s; give up after.
      if (attempt < 25) {
        setTimeout(() => tryInit(attempt + 1), 200);
      }
    };
    tryInit();
  }

  signInWithGoogle() {
    if (!this.googleSsoEnabled || !window.google?.accounts?.id) {
      this.errorMessage = 'Google sign-in is not available right now. Please try again later.';
      return;
    }
    window.google.accounts.id.prompt();
  }

  private onGoogleCredential(response: { credential: string }) {
    if (!response?.credential) {
      this.errorMessage = 'Google sign-in was cancelled. Please try again.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.googleLogin(response.credential).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Signed in with Google. Redirecting...';
        const route = this.authService.getDefaultRoute();
        setTimeout(() => this.router.navigate([route]), 600);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Could not sign in with Google. Please try again.';
      },
    });
  }
}
