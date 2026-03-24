import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Place } from '../../../../projects/wander-library/src/lib/models/place.model';
import { MapService, SearchLocation } from '../../core/service/map.service';
import { GpsComponent } from '../../../../projects/wander-library/src/lib/components/gps/gps.component';
import { SocialService } from '../../core/service/social.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  @ViewChild(GpsComponent) gpsComponent!: GpsComponent;

  selectedPlace: Place | null = null;
  filteredPlaces: Place[] = [];
  mapSearchFn = (query: string) => this.mapService.searchPlaces(query).toPromise();

  friends: any[] = [];
  trendingTrips: any[] = [];

  constructor(
    private mapService: MapService,
    private router: Router,
    private socialService: SocialService
  ) { }

  ngOnInit(): void {
    this.mapService.locationSelected$.subscribe((location: SearchLocation) => {
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
        avatar: u.profileImage || `https://ui-avatars.com/api/?name=${u.username}`,
        isLive: u.isPublicProfile,
        location: [u.lastLatitude || 0, u.lastLongitude || 0],
        status: u.currentStatus || 'Online'
      }));
    });

    this.socialService.getTrendingTrips().subscribe(trips => {
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
}
