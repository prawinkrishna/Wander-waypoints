import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../core/service/auth.service';
import { SocialService } from '../core/service/social.service';
import { UserService } from '../core/service/user.service';
import { ConfirmDialogComponent } from '../components/shared/confirm-dialog/confirm-dialog.component';
import { environment } from '../../environments/environment';

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

  // Pending Follow Requests
  pendingRequests: any[] = [];
  loadingRequests = false;

  // Agent upgrade
  isConsumerUser = false;
  upgradingToAgent = false;

  // Privacy Settings
  privacySettings = {
    isPublicProfile: true,
    defaultTripPublic: false,
    showOnMap: true,
  };

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
    { key: 'requests', label: 'Follow Requests', icon: 'person_add' },
    { key: 'notifications', label: 'Notifications', icon: 'notifications' },
    { key: 'privacy', label: 'Privacy', icon: 'lock' },
    { key: 'about', label: 'About', icon: 'info' }
  ];

  constructor(
    private authService: AuthService,
    private socialService: SocialService,
    private userService: UserService,
    private http: HttpClient,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.isConsumerUser = this.authService.isConsumerUser();
    this.loadUserData();
    this.loadPendingRequests();
  }

  loadUserData() {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();

    if (currentUser?.userId && currentUser.userId !== 'guest') {
      this.socialService.getPublicProfile(currentUser.userId).subscribe({
        next: (data) => {
          this.user = data;
          this.loading = false;

          // Load notification preferences from user data
          if (data.notificationPreferences) {
            for (const setting of this.notificationSettings) {
              if (data.notificationPreferences[setting.key] !== undefined) {
                setting.enabled = data.notificationPreferences[setting.key];
              }
            }
          }

          // Load privacy settings from user data
          this.privacySettings.isPublicProfile = data.isPublicProfile ?? true;
          this.privacySettings.defaultTripPublic = data.defaultTripPublic ?? false;
          this.privacySettings.showOnMap = data.showOnMap ?? true;
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

  onToggleNotification(setting: NotificationSetting) {
    setting.enabled = !setting.enabled;
    this.saveNotificationPreferences();
  }

  private saveNotificationPreferences() {
    const prefs: Record<string, boolean> = {};
    for (const s of this.notificationSettings) {
      prefs[s.key] = s.enabled;
    }

    const userId = this.user?.userId || this.user?.id;
    if (!userId) return;

    this.userService.updateProfile(userId, { notificationPreferences: prefs }).subscribe({
      next: () => {
        this.successMessage = 'Notification preferences saved.';
        setTimeout(() => this.clearMessages(), 2000);
      },
      error: () => {
        this.errorMessage = 'Failed to save notification preferences.';
      }
    });
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }

  onDeleteAccount() {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Account',
        message: 'Are you sure you want to delete your account? This action cannot be undone.',
        type: 'danger',
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        const userId = this.user?.userId || this.user?.id;
        if (!userId) return;

        this.userService.deleteUser(userId).subscribe({
          next: () => {
            this.snackBar.open('Account deleted successfully.', 'Close', { duration: 3000 });
            this.authService.logout();
            this.router.navigate(['/welcome']);
          },
          error: () => {
            this.snackBar.open('Failed to delete account. Please try again.', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  loadPendingRequests() {
    this.loadingRequests = true;
    this.socialService.getPendingRequests().subscribe({
      next: (data) => {
        this.pendingRequests = data;
        this.loadingRequests = false;
      },
      error: () => {
        this.pendingRequests = [];
        this.loadingRequests = false;
      }
    });
  }

  acceptRequest(requestId: string) {
    this.socialService.acceptFollowRequest(requestId).subscribe({
      next: () => {
        this.pendingRequests = this.pendingRequests.filter(r => r.id !== requestId);
        this.successMessage = 'Request accepted!';
      },
      error: () => {
        this.errorMessage = 'Failed to accept request';
      }
    });
  }

  rejectRequest(requestId: string) {
    this.socialService.rejectFollowRequest(requestId).subscribe({
      next: () => {
        this.pendingRequests = this.pendingRequests.filter(r => r.id !== requestId);
      },
      error: () => {
        this.errorMessage = 'Failed to reject request';
      }
    });
  }

  upgradeToAgent() {
    if (this.upgradingToAgent) return;
    this.upgradingToAgent = true;
    this.clearMessages();

    const userId = this.user?.userId || this.user?.id;
    if (!userId) {
      this.errorMessage = 'User not found. Please try again.';
      this.upgradingToAgent = false;
      return;
    }

    // Step 1: Update role to agency_admin
    this.userService.updateProfile(userId, { role: 'agency_admin' }).subscribe({
      next: (updatedUser) => {
        // Step 2: Create default agency
        this.http.post(`${environment.apiUrl}/agency`, {
          name: (this.user?.username || 'My') + "'s Travel Agency",
          userId: userId
        }).subscribe({
          next: () => {
            // Step 3: Refresh user data in auth service using current auth user as base
            const currentAuthUser = this.authService.getCurrentUser();
            this.authService.refreshUser({ ...currentAuthUser, role: 'agency_admin' });
            this.isConsumerUser = false;
            this.upgradingToAgent = false;
            this.successMessage = 'You are now a travel agent! Redirecting to Studio...';
            setTimeout(() => {
              this.router.navigate(['/studio/dashboard']);
            }, 1500);
          },
          error: () => {
            // Agency creation failed but role was updated — still redirect
            const currentAuthUser = this.authService.getCurrentUser();
            this.authService.refreshUser({ ...currentAuthUser, role: 'agency_admin' });
            this.isConsumerUser = false;
            this.upgradingToAgent = false;
            this.successMessage = 'Role upgraded! Redirecting to Studio...';
            setTimeout(() => {
              this.router.navigate(['/studio/dashboard']);
            }, 1500);
          }
        });
      },
      error: () => {
        this.errorMessage = 'Failed to upgrade account. Please try again.';
        this.upgradingToAgent = false;
      }
    });
  }

  clearMessages() {
    this.successMessage = '';
    this.errorMessage = '';
  }

  onTogglePrivacy(key: string) {
    (this.privacySettings as any)[key] = !(this.privacySettings as any)[key];
    this.savePrivacySettings();
  }

  private savePrivacySettings() {
    const userId = this.user?.userId || this.user?.id;
    if (!userId) return;

    this.userService.updateProfile(userId, this.privacySettings).subscribe({
      next: () => {
        this.successMessage = 'Privacy settings saved.';
        setTimeout(() => this.clearMessages(), 2000);
      },
      error: () => {
        this.errorMessage = 'Failed to save privacy settings.';
      }
    });
  }

  goBack() {
    this.router.navigate(['/profile']);
  }
}
