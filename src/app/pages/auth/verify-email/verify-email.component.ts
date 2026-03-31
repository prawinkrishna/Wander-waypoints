import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../core/service/auth.service';

type VerifyState = 'pending' | 'verifying' | 'success' | 'error';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  state: VerifyState = 'pending';
  email = '';
  errorMessage = '';
  resendLoading = false;
  resendSuccess = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const token = params['token'];
      this.email = params['email'] || '';

      if (token) {
        // User clicked verification link - verify the token
        this.verifyToken(token);
      }
      // Otherwise show "check your email" pending state
    });
  }

  private verifyToken(token: string) {
    this.state = 'verifying';
    this.errorMessage = '';

    this.authService.verifyEmail(token).subscribe({
      next: (response) => {
        this.state = 'success';
        // Auto-redirect to dashboard after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/studio/dashboard']);
        }, 2000);
      },
      error: (error) => {
        this.state = 'error';
        this.errorMessage = error.error?.message || 'Verification failed. The link may have expired.';
      }
    });
  }

  resendVerification() {
    if (!this.email || this.resendLoading) return;

    this.resendLoading = true;
    this.resendSuccess = false;
    this.errorMessage = '';

    this.authService.resendVerificationEmail(this.email).subscribe({
      next: () => {
        this.resendLoading = false;
        this.resendSuccess = true;
        // Reset state to pending if was in error state
        if (this.state === 'error') {
          this.state = 'pending';
        }
      },
      error: (error) => {
        this.resendLoading = false;
        this.errorMessage = error.error?.message || 'Failed to resend. Please try again.';
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/auth']);
  }

  goToRegister() {
    this.router.navigate(['/auth'], { queryParams: { mode: 'register' } });
  }
}
