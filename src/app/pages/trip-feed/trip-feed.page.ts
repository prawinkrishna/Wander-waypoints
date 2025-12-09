import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TripService } from '../../core/service/trip.service';

interface Trip {
  tripId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  visibility: string;
  user?: {
    username: string;
  };
  places?: any[];
  likes?: number;
  comments?: number;
}

@Component({
  selector: 'app-trip-feed',
  templateUrl: './trip-feed.page.html',
  styleUrls: ['./trip-feed.page.scss']
})
export class TripFeedPage implements OnInit {
  trips: Trip[] = [];
  filteredTrips: Trip[] = [];
  isLoading = true;
  error: string | null = null;

  // Search and filters
  searchQuery = '';
  selectedSort = 'recent';
  sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'duration', label: 'Longest Duration' }
  ];

  constructor(
    private tripService: TripService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadTrips();
  }

  loadTrips() {
    this.isLoading = true;
    this.error = null;

    // Fetch only public trips
    this.tripService.getTrips({ visibility: 'public' }).subscribe({
      next: (trips) => {
        this.trips = trips;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading trips:', err);
        this.error = 'Failed to load trips. Please try again.';
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    let result = [...this.trips];

    // Apply search
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(trip =>
        trip.title.toLowerCase().includes(query) ||
        trip.description?.toLowerCase().includes(query) ||
        trip.user?.username.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    switch (this.selectedSort) {
      case 'recent':
        result.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        break;
      case 'popular':
        result.sort((a, b) => (b.likes || 0) - (a.likes || 0));
        break;
      case 'duration':
        result.sort((a, b) => {
          const aDuration = new Date(a.endDate).getTime() - new Date(a.startDate).getTime();
          const bDuration = new Date(b.endDate).getTime() - new Date(b.startDate).getTime();
          return bDuration - aDuration;
        });
        break;
    }

    this.filteredTrips = result;
  }

  onSearch() {
    this.applyFilters();
  }

  onSortChange() {
    this.applyFilters();
  }

  onTripClick(tripId: string) {
    this.router.navigate(['/trip-details', tripId]);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getTripDuration(trip: Trip): string {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days} day${days > 1 ? 's' : ''}`;
  }
}
