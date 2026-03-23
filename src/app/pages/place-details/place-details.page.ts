import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlaceService } from '../../core/service/place.service';
import { TripService } from '../../core/service/trip.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Place } from '../../../../projects/wander-library/src/lib/models/place.model';
import { AddToTripDialogComponent } from '../../components/add-to-trip-dialog/add-to-trip-dialog.component';

@Component({
  selector: 'app-place-details',
  templateUrl: './place-details.page.html',
  styleUrls: ['./place-details.page.scss']
})
export class PlaceDetailsPage implements OnInit {
  placeId: string = '';
  place: Place | null = null;
  isLoading = true;
  error: string | null = null;
  userTrips: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private placeService: PlaceService,
    private tripService: TripService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.placeId = this.route.snapshot.paramMap.get('id') || '';

    if (this.placeId) {
      this.loadPlaceDetails();
      this.loadUserTrips();
    } else {
      this.error = 'Invalid place ID';
      this.isLoading = false;
    }
  }

  loadPlaceDetails() {
    this.isLoading = true;
    this.error = null;

    this.placeService.getPlace(this.placeId).subscribe({
      next: (place) => {
        this.place = place;
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Failed to load place details. The place may not exist.';
        this.isLoading = false;
      }
    });
  }

  loadUserTrips() {
    // Load user's trips for "Add to Trip" functionality
    this.tripService.getTrips().subscribe({
      next: (trips) => {
        this.userTrips = trips;
      },
      error: () => {}
    });
  }

  onAddToTrip() {
    if (this.userTrips.length === 0) {
      this.snackBar.open('You need to create a trip first before adding places.', 'Close', { duration: 3000 });
      this.router.navigate(['/create-trip']);
      return;
    }

    const dialogRef = this.dialog.open(AddToTripDialogComponent, {
      width: '450px',
      maxWidth: '95vw',
      data: {
        trips: this.userTrips,
        placeName: this.place?.name || 'this place'
      }
    });

    dialogRef.afterClosed().subscribe((selectedTrip: any) => {
      if (selectedTrip && this.place) {
        this.tripService.addPlace(selectedTrip.tripId, {
          placeId: this.place.placeId,
          placeName: this.place.name,
          latitude: this.place.latitude,
          longitude: this.place.longitude,
          address: this.place.address,
          order: 1
        }).subscribe({
          next: () => {
            this.snackBar.open(`Place added to "${selectedTrip.title}"!`, 'Close', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Failed to add place to trip.', 'Close', { duration: 3000 });
          }
        });
      }
    });
  }

  onViewOnMap() {
    if (!this.place) return;
    // Navigate to home page with this place selected
    this.router.navigate(['/home'], {
      queryParams: { placeId: this.place.placeId }
    });
  }

  onShare() {
    if (!this.place) return;

    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: this.place.name,
        text: `Check out ${this.place.name} on Trekio!`,
        url: url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        this.snackBar.open('Link copied to clipboard!', 'Close', { duration: 2000 });
      });
    }
  }

  getCategoryIcon(): string {
    if (!this.place) return 'place';

    const category = this.place.category?.toLowerCase() || '';
    if (category.includes('food') || category.includes('restaurant')) return 'restaurant';
    if (category.includes('sight') || category.includes('view')) return 'landscape';
    if (category.includes('stay') || category.includes('hotel')) return 'hotel';
    if (category.includes('activity') || category.includes('adventure')) return 'hiking';
    return 'place';
  }

  getCategoryColor(): string {
    if (!this.place) return '#667eea';

    const category = this.place.category?.toLowerCase() || '';
    if (category.includes('food') || category.includes('restaurant')) return '#f59e0b';
    if (category.includes('sight') || category.includes('view')) return '#10b981';
    if (category.includes('stay') || category.includes('hotel')) return '#3b82f6';
    if (category.includes('activity') || category.includes('adventure')) return '#ef4444';
    return '#667eea';
  }
}
