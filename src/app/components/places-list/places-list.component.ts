import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
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

  isLoading = false;
  error: string | null = null;

  constructor(
    private placeService: PlaceService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadPlaces();
  }

  loadPlaces() {
    this.isLoading = true;
    this.error = null;

    this.placeService.getPlaces().subscribe({
      next: (places) => {
        this.places = places;
        this.filteredPlaces = places;
        this.placesFetched.emit(places);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching places:', err);
        this.error = 'Failed to load places. Please try again later.';
        this.isLoading = false;
      }
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
    // Navigate to place details page
    this.router.navigate(['/place-details', place.placeId]);
    // Also emit for backward compatibility
    this.placeSelected.emit(place);
  }
}
