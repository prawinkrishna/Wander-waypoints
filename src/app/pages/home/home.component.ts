import { Component, OnInit } from '@angular/core';
import { Place } from 'projects/wander-library/src/lib/models/place.model';
import { MockDataService } from '../../core/service/mock-data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  places: Place[] = [];
  selectedPlace: Place | null = null;

  constructor(private mockDataService: MockDataService) {}

  ngOnInit(): void {
    this.mockDataService.getPlaces().subscribe(places => {
      this.places = places;
    });
  }

  onPlaceSelected(place: Place): void {
    this.selectedPlace = place;
  }
}
