import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Place } from '../../../../projects/wander-library/src/lib/models/place.model';
import { MapService, SearchLocation } from '../../core/service/map.service';
import { GpsComponent } from '../../../../projects/wander-library/src/lib/components/gps/gps.component';
import { SocialService } from '../../core/service/social.service';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  @ViewChild(GpsComponent) gpsComponent!: GpsComponent;

  selectedPlace: Place | null = null;
  filteredPlaces: Place[] = [];
  mapSearchFn = (query: string) => this.mapService.searchPlaces(query).toPromise();

  friends: any[] = [];
  trendingTrips: any[] = [];

  private rawTrendingTrips: any[] = [];
  activeTripFilter: string | null = null;

  constructor(
    private mapService: MapService,
    private router: Router,
    private socialService: SocialService,
    private seo: SeoService,
  ) { }

  ngOnInit(): void {
    this.seo.setMetaTags({
      title: 'Discover Trips',
      description: 'Explore trending trips, follow travelers, and discover new destinations on Trekio.',
      path: '/home',
      type: 'website',
    });

    this.mapService.locationSelected$.pipe(takeUntil(this.destroy$)).subscribe((location: SearchLocation) => {
      if (this.gpsComponent && location) {
        this.gpsComponent.flyToLocation(location.y, location.x);
      }
    });

    this.loadSocialData();
  }

  loadSocialData() {
    this.socialService.getFriendFootprints().subscribe(users => {
      this.friends = users.map(u => ({
        id: u.userId,
        name: u.username,
        // Pass the raw image URL through; the <app-avatar> component
        // handles missing/failed images by rendering an inline SVG
        // initials fallback (no external network call).
        avatar: u.profileImage || null,
        isLive: u.isPublicProfile,
        location: [u.lastLatitude || 0, u.lastLongitude || 0],
        status: u.currentStatus || 'Online'
      }));
    });

    this.socialService.getTrendingTrips().subscribe(trips => {
      this.rawTrendingTrips = trips;
      // Pre-populate the map with all trending trips' places (TripPlace[] with coords)
      this.filteredPlaces = trips.flatMap((t: any) => t.tripPlaces || []);

      this.trendingTrips = trips.map(t => ({
        id: t.tripId,
        title: t.title,
        author: t.user?.username || 'Trekio User',
        days: this.calculateDays(t),
        clones: 0,
        rating: 5.0,
        image: t.tripPlaces?.[0]?.place?.imageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070'
      }));
    });
  }

  calculateDays(trip: any): number {
    if (trip.startDate && trip.endDate) {
      const start = new Date(trip.startDate);
      const end = new Date(trip.endDate);
      return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }
    return 3;
  }

  viewProfile(id: string) {
    if (id) {
      this.router.navigate(['/profile', id]);
    }
  }

  viewTrip(id: string) {
    if (id) {
      this.router.navigate(['/trip-details', id]);
    }
  }

  showTripOnMap(tripId: string) {
    const trip = this.rawTrendingTrips.find((t: any) => t.tripId === tripId);
    if (!trip) return;
    this.activeTripFilter = tripId;
    this.filteredPlaces = trip.tripPlaces || [];
    document.getElementById('explore-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  resetMapToAll() {
    this.activeTripFilter = null;
    this.filteredPlaces = this.rawTrendingTrips.flatMap((t: any) => t.tripPlaces || []);
  }

  openAiPlanner() {
    this.router.navigate(['/create-trip']);
  }

  onPlaceSelected(place: Place): void {
    this.selectedPlace = place;
  }

  onPlacesFetched(places: Place[]): void {
    this.filteredPlaces = places;
  }

  onMarkerClicked(placeId: string): void {
    this.selectedPlace = this.filteredPlaces.find(p => p.placeId === placeId) || null;
  }

  onMapMoved(bounds: [[number, number], [number, number]]) {
    this.mapService.updateBounds(bounds);
  }

  trackByFriendId(index: number, friend: any): string {
    return friend.id;
  }

  trackByTripId(index: number, trip: any): string {
    return trip.id;
  }

  scrollToMap() {
    document.getElementById('explore-map')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
