import { Component, OnInit } from '@angular/core';
import { Place } from '../../../../projects/wander-library/src/lib/models/place.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  selectedPlace: Place | null = null;
  public filteredPlaces: Place[] = [];

  constructor() {}

  ngOnInit(): void {
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
