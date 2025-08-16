import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Place } from '../../core/service/model.service';

@Component({
  selector: 'app-places-list',
  templateUrl: './places-list.component.html',
  styleUrls: ['./places-list.component.scss']
})
export class PlacesListComponent {
  @Input() places: Place[] = [];
  @Output() placeSelected = new EventEmitter<Place>();

  filters = ['Food Spot', 'Sightseeing', 'Stay', 'Other'];
  selectedFilter = '';

  selectFilter(filter: string) {
    this.selectedFilter = filter;
  }

  onCardClick(place: Place) {
    this.placeSelected.emit(place);
  }
}
