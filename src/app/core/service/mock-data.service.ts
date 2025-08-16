import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { Place } from './model.service';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private places: Place[] = [
    {
      id: 1,
      name: 'Golden Gate Park',
      location: 'San Francisco',
      description: 'A large urban park consisting of public grounds.',
      image: 'https://picsum.photos/200/120?1',
      lat: 37.7694,
      lng: -122.4862
    },
    {
      id: 2,
      name: 'Fisherman\'s Wharf',
      location: 'San Francisco',
      description: 'A popular tourist attraction and a neighborhood of San Francisco.',
      image: 'https://picsum.photos/200/120?2',
      lat: 37.8080,
      lng: -122.4177
    },
    {
      id: 3,
      name: 'Alcatraz Island',
      location: 'San Francisco',
      description: 'A small island in San Francisco Bay, a former federal prison.',
      image: 'https://picsum.photos/200/120?3',
      lat: 37.8270,
      lng: -122.4230
    },
    {
      id: 4,
      name: 'Chinatown',
      location: 'San Francisco',
      description: 'The oldest Chinatown in North America and one of the largest Chinese enclaves outside Asia.',
      image: 'https://picsum.photos/200/120?4',
      lat: 37.7941,
      lng: -122.4078
    }
  ];

  getPlaces() {
    return of(this.places);
  }
}
