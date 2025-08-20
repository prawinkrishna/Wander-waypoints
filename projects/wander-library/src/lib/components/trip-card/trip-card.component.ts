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
}
