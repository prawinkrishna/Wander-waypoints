import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/service/auth.service';
import { SocialService } from '../core/service/social.service';

interface NotificationSetting {
  key: string;
  label: string;
  description: string;
  enabled: boolean;
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  activeSection: string = 'account';
  user: any;
  loading = true;
  saving = false;
  successMessage = '';
  errorMessage = '';

  // Password Change Form
  passwordForm!: FormGroup;
  showCurrentPassword = false;
  showNewPassword = false;

  // Notification Settings
  notificationSettings: NotificationSetting[] = [
    { key: 'followRequests', label: 'Follow Requests', description: 'When someone requests to follow you', enabled: true },
    { key: 'newFollowers', label: 'New Followers', description: 'When someone starts following you', enabled: true },
    { key: 'tripLikes', label: 'Trip Likes', description: 'When someone likes your trip', enabled: true },
    { key: 'tripComments', label: 'Trip Comments', description: 'When someone comments on your trip', enabled: true },
    { key: 'tripShares', label: 'Trip Shares', description: 'When someone shares your trip', enabled: false },
    { key: 'emailDigest', label: 'Weekly Digest', description: 'Weekly summary of activity', enabled: false },
  ];

  sections = [
    { key: 'account', label: 'Account', icon: 'person' },
    { key: 'notifications', label: 'Notifications', icon: 'notifications' },
    { key: 'privacy', label: 'Privacy', icon: 'lock' },
    { key: 'about', label: 'About', icon: 'info' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private socialService: SocialService,
    private router: Router
  ) { }

  ngOnInit() {
    this.initForms();
    this.loadUserData();
  }

  initForms() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup) {
    const newPass = group.get('newPassword')?.value;
    const confirmPass = group.get('confirmPassword')?.value;
    return newPass === confirmPass ? null : { passwordMismatch: true };
  }

  loadUserData() {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();

    if (currentUser?.userId && currentUser.userId !== 'guest') {
      this.socialService.getPublicProfile(currentUser.userId).subscribe({
        next: (data) => {
          this.user = data;
          this.loading = false;
        },
        error: () => {
          this.user = currentUser;
          this.loading = false;
        }
      });
    } else {
      this.router.navigate(['/auth']);
    }
  }

  setActiveSection(section: string) {
    this.activeSection = section;
    this.clearMessages();
  }

  onChangePassword() {
    if (this.passwordForm.invalid) return;

    this.saving = true;
    this.clearMessages();

    // TODO: Connect to backend password change endpoint
    setTimeout(() => {
      this.saving = false;
      this.successMessage = 'Password changed successfully!';
      this.passwordForm.reset();
    }, 1000);
  }

  onToggleNotification(setting: NotificationSetting) {
    setting.enabled = !setting.enabled;
    // TODO: Save to backend
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  onDeleteAccount() {
    const confirmed = confirm('Are you sure you want to delete your account? This action cannot be undone.');
    if (confirmed) {
      // TODO: Connect to backend delete account endpoint
      alert('Account deletion is not yet implemented.');
    }
  }

  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }

  goBack() {
    this.router.navigate(['/profile']);
  }
}
