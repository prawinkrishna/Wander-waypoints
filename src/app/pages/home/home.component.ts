import { Component, OnInit, ViewChild } from '@angular/core';
import { Place } from '../../../../projects/wander-library/src/lib/models/place.model';
import { GpsComponent } from '../../../../projects/wander-library/src/lib/components/gps/gps.component';
import { MapService, SearchLocation } from '../../core/service/map.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild(GpsComponent) gpsComponent!: GpsComponent;
  selectedPlace: Place | null = null;
  public filteredPlaces: Place[] = [];
  public mapSearchFn = (query: string) => this.mapService.searchPlaces(query).toPromise();

  constructor(private mapService: MapService) { }

  onMapMoved(bounds: [[number, number], [number, number]]) {
    this.mapService.updateBounds(bounds);
  }

  ngOnInit(): void {
    this.mapService.locationSelected$.subscribe((location: SearchLocation) => {
      if (this.gpsComponent && location) {
        this.gpsComponent.flyToLocation(location.y, location.x);
      }
    });
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
}
