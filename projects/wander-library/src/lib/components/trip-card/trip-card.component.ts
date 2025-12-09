import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Place } from '../../models/place.model';

@Component({
  selector: 'lib-trip-card',
  templateUrl: './trip-card.component.html',
  styleUrls: ['./trip-card.component.scss']
})
export class TripCardComponent {
  @Input() place!: Place;
  @Output() cardClick = new EventEmitter<Place>();

  onCardClick(): void {
    this.cardClick.emit(this.place);
  }

  getCategoryIcon(): string {
    const category = this.place.category?.toLowerCase() || '';

    if (category.includes('food') || category.includes('restaurant')) {
      return 'restaurant';
    } else if (category.includes('sight') || category.includes('view')) {
      return 'landscape';
    } else if (category.includes('stay') || category.includes('hotel')) {
      return 'hotel';
    } else if (category.includes('activity') || category.includes('adventure')) {
      return 'hiking';
    } else {
      return 'place';
    }
  }
}
