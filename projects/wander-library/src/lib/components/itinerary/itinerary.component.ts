import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ApiService } from '../../provider/api.service';

interface Event {
  time: string;
  title: string;
  description: string;
  location: string;
  photos: string[];
}

interface Review {
  text: string;
  rating: number;
}

interface RelatedTrip {
  title: string;
  thumbnail: string;
}

@Component({
  selector: 'lib-itinerary',
  templateUrl: './itinerary.component.html',
  styleUrl: './itinerary.component.scss'
})
export class ItineraryComponent implements OnInit {

  locations = [
    {
      image: 'assets/shangrila.jpg',
      title: 'Shangri-La Singapore',
      rating: '4.6',
      address: '22 Orange Grove Rd, Singapore 258350',
      description: 'Upscale, palatial hotel offering fine dining options & bars, plus a posh spa & an outdoor pool.',
      transport: '🚗',
      duration: '0h 11m',
      distance: '4.4 mi'
    },
    {
      image: 'assets/merlion.jpg',
      title: 'Merlion',
      rating: '4.7',
      address: 'Singapore',
      description: 'Iconic, 8.5m-tall statue with the body of a fish & head of a lion, shooting water from its mouth.',
      transport: '🚴',
      duration: '0h 4m',
      distance: '1.4 mi'
    },
    {
      image: 'assets/maxwell.jpg',
      title: 'Maxwell Food Centre',
      rating: '4.3',
      address: '1 Kadayanallur St, Singapore 069184',
      description: 'Chinatown hawker center with stands selling local street food favorites.',
      transport: '🚗',
      duration: '0h 4m',
      distance: '1.4 mi'
    }
  ];

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.locations, event.previousIndex, event.currentIndex);
  }
  // Sample data for timeline events
  events: Event[] = [
    {
      time: '10:00 AM',
      title: 'Flight Arrival in Bangkok',
      description: 'Arrived at Bangkok airport from Chennai.',
      location: 'Bangkok Airport',
      photos: ['assets/event1.jpg', 'assets/event2.jpg']
    },
    {
      time: '3:00 PM',
      title: 'Massage in Pattaya',
      description: 'Relaxing massage session at a popular spa in Pattaya.',
      location: 'Pattaya Spa',
      photos: ['assets/massage1.jpg', 'assets/massage2.jpg']
    },
    {
      time: '10:00 PM',
      title: 'Dinner at Local Restaurant',
      description: 'Dinner at a renowned Thai restaurant.',
      location: 'Bangkok Restaurant',
      photos: ['assets/dinner.jpg']
    },
    {
      time: '7:00 AM',
      title: 'Coral Island Tour',
      description: 'A day trip to Coral Island with activities like snorkeling and beach sports.',
      location: 'Coral Island',
      photos: ['assets/coral1.jpg', 'assets/coral2.jpg']
    }
  ];

  // Sample data for reviews
  reviews: Review[] = [
    { text: 'Amazing experience! The itinerary was well planned and smooth.', rating: 5 },
    { text: 'Loved the massage and beach activities. Great service!', rating: 4 }
  ];

  // Sample data for related trips
  relatedTrips: RelatedTrip[] = [
    { title: 'Bangkok City Highlights', thumbnail: 'assets/related-trip1.jpg' },
    { title: 'Thailand Beach Adventure', thumbnail: 'assets/related-trip2.jpg' },
    { title: 'Cultural Tour of Bangkok', thumbnail: 'assets/related-trip3.jpg' }
  ];

  constructor(
    private ApiService:
    ApiService
  ) { }

  ngOnInit(): void {
    console.log('11111');
    
    // Load additional data if necessary on component initialization
    this.ApiService.getUsers().subscribe(users => {
      console.log('Users loaded:', users);
    }
    );
  }

  bookService(service: string): void {
    // Function to book a service (massage, dinner, etc.)
    console.log(`Booking service: ${service}`);
    // Implement booking functionality here
  }

  shareTrip(): void {
    // Function to share trip details
    console.log('Trip shared!');
    // Implement share functionality here
  }

  saveTrip(): void {
    // Function to save trip to favorites
    console.log('Trip saved!');
    // Implement save functionality here
  }

  followOrganizer(): void {
    // Function to follow the trip organizer
    console.log('Following organizer');
    // Implement follow functionality here
  }
}