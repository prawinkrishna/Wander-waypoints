import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-legal',
  template: `
    <app-navbar></app-navbar>
    <div class="legal-page">
      <div class="legal-content">
        <ng-container *ngIf="page === 'privacy'">
          <h1>Privacy Policy</h1>
          <p class="updated">Last updated: March 2026</p>

          <h2>1. Information We Collect</h2>
          <p>When you create an account, we collect your username, email address, and profile information you choose to provide. We also collect trip data, places you visit, and interactions with other users.</p>

          <h2>2. How We Use Your Information</h2>
          <p>We use your information to provide and improve Trekio's services, including personalized trip recommendations, social features, and communication between users and travel agents.</p>

          <h2>3. Data Sharing</h2>
          <p>We do not sell your personal information. Your public profile and trips are visible to other users based on your privacy settings. We may share anonymized, aggregated data for analytics purposes.</p>

          <h2>4. Your Controls</h2>
          <p>You can control your profile visibility, trip default visibility, and map presence through Settings > Privacy. You can delete your account at any time through Settings > Account.</p>

          <h2>5. Contact</h2>
          <p>For privacy-related inquiries, please contact us at privacy&#64;trekio.app.</p>
        </ng-container>

        <ng-container *ngIf="page === 'terms'">
          <h1>Terms of Service</h1>
          <p class="updated">Last updated: March 2026</p>

          <h2>1. Acceptance of Terms</h2>
          <p>By using Trekio, you agree to these Terms of Service. If you do not agree, please do not use the platform.</p>

          <h2>2. User Accounts</h2>
          <p>You are responsible for maintaining the security of your account. You must provide accurate information and keep it up to date. You may not use another person's account without permission.</p>

          <h2>3. User Content</h2>
          <p>You retain ownership of content you post on Trekio. By posting content, you grant Trekio a license to display and distribute it within the platform. You are responsible for ensuring your content does not violate any laws or third-party rights.</p>

          <h2>4. Travel Agent Services</h2>
          <p>Trekio connects travelers with travel agents. We are not responsible for the quality, safety, or legality of trips offered by agents. Bookings are agreements between you and the agent.</p>

          <h2>5. Termination</h2>
          <p>We may suspend or terminate accounts that violate these terms. You may delete your account at any time.</p>
        </ng-container>

        <ng-container *ngIf="page === 'contact'">
          <h1>Contact Us</h1>

          <div class="contact-card">
            <mat-icon>email</mat-icon>
            <div>
              <h3>Email</h3>
              <p>hello&#64;trekio.app</p>
            </div>
          </div>

          <div class="contact-card">
            <mat-icon>bug_report</mat-icon>
            <div>
              <h3>Report a Bug</h3>
              <p>Found something broken? Let us know at support&#64;trekio.app</p>
            </div>
          </div>

          <div class="contact-card">
            <mat-icon>business</mat-icon>
            <div>
              <h3>Business Inquiries</h3>
              <p>For partnerships and agency onboarding: partners&#64;trekio.app</p>
            </div>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [`
    .legal-page {
      min-height: 100vh;
      background: var(--color-background);
      padding: 40px 24px 80px;
    }
    .legal-content {
      max-width: 720px;
      margin: 0 auto;
      background: var(--color-surface);
      border-radius: 12px;
      padding: 48px;
      box-shadow: var(--shadow-card);
      border: 1px solid var(--color-border);
    }
    h1 {
      font-size: 28px;
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0 0 8px;
    }
    .updated {
      color: var(--color-text-tertiary);
      font-size: 14px;
      margin: 0 0 32px;
    }
    h2 {
      font-size: 18px;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 24px 0 8px;
    }
    p {
      color: var(--color-text-secondary);
      line-height: 1.7;
      margin: 0 0 16px;
    }
    .contact-card {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 24px;
      background: var(--color-background);
      border-radius: 8px;
      margin-bottom: 16px;
    }
    .contact-card mat-icon {
      color: var(--primary);
      font-size: 28px;
      width: 28px;
      height: 28px;
      margin-top: 4px;
    }
    .contact-card h3 {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 4px;
      color: var(--color-text-primary);
    }
    .contact-card p {
      margin: 0;
      font-size: 14px;
    }
    @media (max-width: 768px) {
      .legal-content { padding: 24px; }
    }
  `]
})
export class LegalComponent {
  page = 'privacy';

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(data => {
      this.page = data['page'] || 'privacy';
    });
  }
}
