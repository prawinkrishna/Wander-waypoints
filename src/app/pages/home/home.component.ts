import { Component, OnInit } from '@angular/core';
import { MockDataService } from '../../core/service/mock-data.service';
import { Place } from '../../../../projects/wander-library/src/lib/models/place.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  places: Place[] = [];
  filteredPlaces: Place[] = [];
  selectedPlace: Place | null = null;
  searchTerm: string = '';

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.mockDataService.getPlaces().subscribe(places => {
      this.places = places;
      this.filteredPlaces = places;
    });
  }

  onPlaceSelected(place: Place): void {
    this.selectedPlace = place;
  }

  filterPlaces(): void {
    if (!this.searchTerm) {
      this.filteredPlaces = this.places;
      return;
    }
    this.filteredPlaces = this.places.filter(place =>
      place.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
