import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Place } from '../../core/service/model.service';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  @Input() place!: Place;
  @Output() cardClick = new EventEmitter<Place>();

  onCardClick(): void {
    this.cardClick.emit(this.place);
  }
}
