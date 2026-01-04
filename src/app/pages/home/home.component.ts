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
        name: u.username,
        avatar: u.profileImage || `https://ui-avatars.com/api/?name=${u.username}`,
        isLive: u.isLive,
        location: [u.lastLatitude || 0, u.lastLongitude || 0],
        status: u.currentStatus || 'Online'
      }));
    });

    this.socialService.getTrendingTrips().subscribe(trips => {
      this.trendingTrips = trips.map(t => ({
        title: t.tripName,
        author: t.user?.username || 'Wander User',
        days: t.places?.length ? Math.ceil(t.places.length / 3) : 3, // Approx duration
        clones: 0, // Not in API yet
        rating: 5.0, // Mock
        image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070' // Default image
      }));
    });
  }

  openAiPlanner() {
    this.router.navigate(['/ai-planner']);
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
}
