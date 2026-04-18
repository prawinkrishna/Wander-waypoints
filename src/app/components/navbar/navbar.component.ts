import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { debounceTime, switchMap } from 'rxjs/operators';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../core/service/auth.service';
import { MapService, SearchLocation } from '../../core/service/map.service';
import { NotificationService, Notification } from '../../core/service/notification.service';
import { ThemeService } from '../../core/services/theme.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  searchControl = new FormControl();
  filteredOptions: SearchLocation[] = [];
  provider = new OpenStreetMapProvider();
  mobileMenuOpen = false;
  notificationDropdownOpen = false;
  notifications: Notification[] = [];
  unreadCount = 0;

  constructor(
    private authService: AuthService,
    private router: Router,
    private mapService: MapService,
    private snackBar: MatSnackBar,
    public themeService: ThemeService,
    public notificationService: NotificationService
  ) {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        switchMap(async (value) => {
          if (typeof value !== 'string' || value.length < 3) return [];
          try {
            return await this.mapService.searchPlaces(value).toPromise();
          } catch (error) {
            return [];
          }
        })
      )
      .subscribe((results: any[]) => {
        this.filteredOptions = results;
      });
  }

  ngOnInit() {
    if (this.authService.isAuthenticatedUser()) {
      this.notificationService.startPolling();
      this.notificationService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
      });
    }
  }

  toggleNotificationDropdown() {
    this.notificationDropdownOpen = !this.notificationDropdownOpen;
    if (this.notificationDropdownOpen) {
      this.loadNotifications();
    }
  }

  closeNotificationDropdown() {
    this.notificationDropdownOpen = false;
  }

  loadNotifications() {
    this.notificationService.getNotifications(1, 10).subscribe({
      next: (data) => this.notifications = data,
      error: () => this.notifications = []
    });
  }

  markAsRead(notification: Notification) {
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id).subscribe();
      notification.read = true;
    }
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        for (const n of this.notifications) {
          n.read = true;
        }
      }
    });
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'follow': return 'person_add';
      case 'like': return 'favorite';
      case 'comment': return 'chat_bubble';
      case 'booking': return 'book_online';
      default: return 'notifications';
    }
  }

  get isGuest(): boolean {
    return !this.authService.isAuthenticatedUser();
  }

  get currentUser(): any {
    return this.authService.getCurrentUser();
  }

  get needsEmailVerification(): boolean {
    return this.authService.isAuthenticatedUser() && !this.authService.isEmailVerified();
  }

  get isAgencyUser(): boolean {
    return this.authService.isAgencyUser();
  }

  get isConsumerUser(): boolean {
    return this.authService.isConsumerUser();
  }

  get hasAgency(): boolean {
    return this.authService.hasAgency();
  }

  /** True for any authenticated user who can access /studio (agency_admin OR INFLUENCER+agency) */
  get canAccessStudio(): boolean {
    return this.isAgencyUser || this.hasAgency;
  }

  /** Whether booking + marketplace flows are exposed in this build. False for the public beta. */
  get bookingEnabled(): boolean {
    return environment.featureBookingEnabled;
  }

  get logoRoute(): string {
    return this.authService.getDefaultRoute();
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  displayFn(location: SearchLocation): string {
    return location && location.label ? location.label : '';
  }

  onOptionSelected(event: any) {
    const location: SearchLocation = event.option.value;
    this.mapService.selectLocation(location);

    if (this.router.url !== '/home') {
      this.router.navigate(['/home']);
    }
  }

  onCreateTrip() {
    this.closeMobileMenu();
    if (this.isGuest) {
      const snackBarRef = this.snackBar.open(
        'Please login to create a trip',
        'Login',
        {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['login-prompt-snackbar']
        }
      );
      snackBarRef.onAction().subscribe(() => {
        this.router.navigate(['/login']);
      });
    } else {
      this.router.navigate(['/create-trip']);
    }
  }

  onLogout() {
    this.closeMobileMenu();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onLogin() {
    this.closeMobileMenu();
    this.router.navigate(['/login']);
  }
}
