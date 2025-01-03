import { Component, Input, OnInit } from '@angular/core';
import { HttpService } from '../../provider/http.service';

interface Trip {
  id: number;
  location: string;
  country: string;
  date: string;
  imageUrl?: string;
  likes: number;
  category: string;
}
@Component({
  selector: 'lib-trip-card',
  templateUrl: './trip-card.component.html',
  styleUrl: './trip-card.component.scss'
})
export class TripCardComponent implements OnInit {
  @Input() trip!: Trip;
  public cards: any = [
    {
      title: 'Eiffel Tower',
      subtitle: 'Paris, France',
      image: 'https://picsum.photos/seed/picsum/200/300',
      description: 'The Eiffel Tower is an iconic landmark in Paris, offering stunning views of the city.',
    },
    {
      title: 'Great Wall of China',
      subtitle: 'China',
      image: 'https://example.com/images/great-wall.jpg',
      description: 'The Great Wall of China is an ancient series of walls and fortifications stretching over 13,000 miles.',
    },
    {
      title: 'Grand Canyon',
      subtitle: 'Arizona, USA',
      image: 'https://example.com/images/grand-canyon.jpg',
      description: 'The Grand Canyon is a natural wonder known for its layered red rock and breathtaking vistas.',
    },
  ];
  
  constructor(
    private httpService: HttpService
  ) {}

  public async ngOnInit() {
    this.httpService.get('api/place').subscribe(data => {
      console.log("🚀 ~ TripCardComponent ~ this.httpService.get ~ data:", data)
      
    })
  }

  
}
