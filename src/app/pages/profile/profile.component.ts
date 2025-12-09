import { Component, OnInit } from '@angular/core';
import { UserService } from '../../core/service/user.service';
import { TripService } from '../../core/service/trip.service';
import { AuthService } from '../../core/service/auth.service';
import { Place } from '../../../../projects/wander-library/src/lib/models/place.model';
import { MatDialog } from '@angular/material/dialog';
import { CreateTripDialogComponent } from '../../components/create-trip-dialog/create-trip-dialog.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: any = null;
  trips: any[] = [];
  isLoading = false;
  error: string | null = null;

  constructor(
    private userService: UserService,
    private tripService: TripService,
    private authService: AuthService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  openCreateTripDialog() {
    const dialogRef = this.dialog.open(CreateTripDialogComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Trip created successfully, refresh the list
        if (this.user) {
          this.loadUserTrips(this.user.userId);
        }
      }
    });
  }

  loadProfile() {
    this.isLoading = true;
    this.error = null;

    this.userService.getProfile().subscribe({
      next: (user) => {
        this.user = user;
        this.loadUserTrips(user.userId);
      },
      error: (err) => {
        console.error('Error loading profile:', err);
        this.error = 'Failed to load profile. Please try again.';
        this.isLoading = false;
      }
    });
  }

  loadUserTrips(userId: string) {
    // Skip loading trips for guest users
    if (userId === 'guest') {
      this.trips = [];
      this.isLoading = false;
      return;
    }

    this.tripService.getTrips({ userId }).subscribe({
      next: (trips) => {
        this.trips = trips;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading trips:', err);
        // Don't block profile view if trips fail, just show empty or error in trips section
        this.isLoading = false;
      }
    });
  }

  onLogout() {
    this.authService.logout();
    // Router navigation should be handled by AuthService or component if needed, 
    // but usually AuthService.logout() clears state. 
    // We might want to redirect to /auth here.
    window.location.href = '/auth';
  }
}
