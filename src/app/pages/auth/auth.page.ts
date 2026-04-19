import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';
import { SeoService } from '../../core/services/seo.service';
import { AnalyticsService } from '../../core/services/analytics.service';
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
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  selectedTab = 0;
  loading = false;
  errorMessage = '';
  successMessage = '';
  hidePassword = true;
  hideConfirmPassword = true;
  // Google SSO is gated on having a configured Client ID. When it's
  // empty (placeholder state) the button hides itself instead of
  // throwing a confusing error on click.
  googleSsoEnabled = !!environment.googleClientId;

  roles = [
    { value: 'traveler', label: 'Traveler' },
    { value: 'agency', label: 'Travel Agency' },
    { value: 'driver', label: 'Cab Driver' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private seo: SeoService,
    private analytics: AnalyticsService,
  ) { }

  ngOnInit() {
    this.initForms();
    this.checkQueryParams();
    this.applyMetaTags();
    this.initGoogleSso();
  }

  /**
   * Initialize Google Identity Services. Called on init; the GIS script
   * is loaded async from index.html so we poll briefly until it's ready.
   * Once ready, we register the callback that runs after the user picks
   * a Google account in the popup.
   */
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

  /** Triggered by the "Continue with Google" button. Opens the GIS popup. */
  signInWithGoogle() {
    if (!this.googleSsoEnabled || !window.google?.accounts?.id) {
      this.errorMessage = 'Google sign-in is not available right now. Please try email instead.';
      return;
    }
    // The official Google button uses `prompt()` for the One Tap UI.
    // We trigger it programmatically from our own button so the styling
    // matches the rest of the auth page.
    window.google.accounts.id.prompt();
  }

  /** Callback after the user successfully picks a Google account. */
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
        this.analytics.trackEvent('google_sso_completed');
        const currentUser = this.authService.getCurrentUser();
        this.analytics.identifyUser(currentUser?.userId || null);
        const route = this.authService.getDefaultRoute();
        setTimeout(() => this.router.navigate([route]), 600);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Could not sign in with Google. Please try again.';
      },
    });
  }

  private applyMetaTags() {
    const isRegister = this.selectedTab === 1;
    this.seo.setMetaTags({
      title: isRegister ? 'Create your account' : 'Sign in',
      description: isRegister
        ? 'Create your free Trekio account to plan trips with AI, follow travelers, and start sharing journeys worth sharing.'
        : 'Sign in to Trekio to plan trips with AI, browse curated itineraries, and connect with travel agents.',
      path: '/login',
      type: 'website',
      // Auth pages are public so they should be indexable, but the
      // canonical points at /login regardless of which tab is active so
      // Google doesn't index two URLs with near-identical content.
    });
  }

  private checkQueryParams() {
    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'register') {
        this.selectedTab = 1;
      }
    });
  }

  initForms() {
    // Login Form
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Register Form
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['traveler', [Validators.required]],
      bio: ['']
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Welcome back! Redirecting...';
        this.analytics.trackEvent('login_completed', { method: 'password' });
        const currentUser = this.authService.getCurrentUser();
        this.analytics.identifyUser(currentUser?.userId || null);
        const route = this.authService.getDefaultRoute();
        setTimeout(() => {
          this.router.navigate([route]);
        }, 800);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Invalid email or password. Please try again.';
        this.analytics.trackEvent('login_failed', { reason: error.status || 'unknown' });
      }
    });
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { confirmPassword, ...registerData } = this.registerForm.value;

    this.authService.register(registerData).subscribe({
      next: () => {
        this.loading = false;
        this.analytics.trackEvent('signup_completed', { method: 'password' });
        const currentUser = this.authService.getCurrentUser();
        this.analytics.identifyUser(currentUser?.userId || null);
        this.router.navigate([this.authService.getDefaultRoute()]);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  // PHASE 2: Restore guest login when social features are enabled
  // onGuestLogin() {
  //   this.loading = true;
  //   this.errorMessage = '';
  //   this.successMessage = '';
  //
  //   this.authService.anonymousLogin().subscribe({
  //     next: (response) => {
  //       this.successMessage = 'Continuing as guest...';
  //       setTimeout(() => {
  //         this.router.navigate(['/studio/dashboard']);
  //       }, 500);
  //     },
  //     error: (error) => {
  //       this.loading = false;
  //       this.errorMessage = error.error?.message || 'Failed to continue as guest. Please try again.';
  //     },
  //     complete: () => {
  //       this.loading = false;
  //     }
  //   });
  // }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(formGroup: FormGroup, fieldName: string): string {
    const control = formGroup.get(fieldName);

    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email';
    }
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} must be at least ${minLength} characters`;
    }

    return '';
  }

  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      role: 'Role'
    };
    return labels[fieldName] || fieldName;
  }

  onTabChange(index: number) {
    this.selectedTab = index;
    this.errorMessage = '';
    this.successMessage = '';
    // Refresh title/description so the document title reflects the
    // active tab (Sign in vs Create your account).
    this.applyMetaTags();
  }
}

