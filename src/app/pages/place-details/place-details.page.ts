import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlaceService } from '../../core/service/place.service';
import { TripService } from '../../core/service/trip.service';
import { MatDialog } from '@angular/material/dialog';
import { Place } from '../../../../projects/wander-library/src/lib/models/place.model';

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
    private dialog: MatDialog
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
      error: (err) => {
        console.error('Error loading place:', err);
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
      error: (err) => {
        console.error('Error loading user trips:', err);
      }
    });
  }

  onAddToTrip() {
    // TODO: Implement add to trip dialog
    // For V1, we can show a simple select dialog with user's trips
    if (this.userTrips.length === 0) {
      alert('You need to create a trip first before adding places.');
      this.router.navigate(['/profile']);
      return;
    }

    // Simple implementation for V1
    const tripOptions = this.userTrips.map((t, i) => `${i + 1}. ${t.title}`).join('\n');
    const selection = prompt(`Select a trip to add this place to:\n\n${tripOptions}\n\nEnter trip number:`);

    if (selection) {
      const index = parseInt(selection) - 1;
      if (index >= 0 && index < this.userTrips.length) {
        const selectedTrip = this.userTrips[index];
        alert(`Place added to "${selectedTrip.title}"!\n\n(Note: Full implementation coming in next update)`);
      }
    }
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
        text: `Check out ${this.place.name} on Wander!`,
        url: url
      }).catch(err => console.log('Error sharing:', err));
    } else {
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!');
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
