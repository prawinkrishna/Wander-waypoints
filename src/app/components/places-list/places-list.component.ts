import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-places-list',
  templateUrl: './places-list.component.html',
  styleUrls: ['./places-list.component.scss']
})
export class PlacesListComponent {
  @Input() places: any[] = [
    { image: 'https://picsum.photos/200/120?1', title: 'Golden Gate Park', location: 'San Francisco' },
    { image: 'https://picsum.photos/200/120?2', title: 'Fisherman\'s Wharf', location: 'San Francisco' },
    { image: 'https://picsum.photos/200/120?3', title: 'Alcatraz Island', location: 'San Francisco' },
    { image: 'https://picsum.photos/200/120?4', title: 'Chinatown', location: 'San Francisco' },
  ];
  filters = ['Food Spot', 'Sightseeing', 'Stay', 'Other'];
  selectedFilter = '';

  selectFilter(filter: string) {
    this.selectedFilter = filter;
  }
}
