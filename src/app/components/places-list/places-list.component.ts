import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Place } from '../../../../projects/wander-library/src/lib/models/place.model';
import { PlaceService } from '../../core/service/place.service';

@Component({
  selector: 'app-places-list',
  templateUrl: './places-list.component.html',
  styleUrls: ['./places-list.component.scss']
})
export class PlacesListComponent implements OnInit {
  places: Place[] = [];
  filteredPlaces: Place[] = [];
  @Input() selectedPlaceId: any;
  @Output() placeSelected = new EventEmitter<Place>();
  @Output() placesFetched = new EventEmitter<Place[]>();

  filters = ['Food Spot', 'Sightseeing', 'Stay', 'Other'];
  selectedFilter = '';
  searchQuery = '';

  constructor(private placeService: PlaceService) { }

  ngOnInit(): void {
    this.placeService.getPlaces().subscribe(places => {
      this.places = places;
      this.filteredPlaces = places;
      this.placesFetched.emit(places);
    });
  }

  selectFilter(filter: string) {
    this.selectedFilter = filter;
    this.filterPlaces();
  }

  filterPlaces() {
    let tempPlaces = this.places;

    if (this.searchQuery) {
      tempPlaces = tempPlaces.filter(place =>
        place.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }

    if (this.selectedFilter) {
      tempPlaces = tempPlaces.filter(place => place.category === this.selectedFilter);
    }

    this.filteredPlaces = tempPlaces;
  }

  onCardClick(place: Place) {
    this.placeSelected.emit(place);
  }
}
