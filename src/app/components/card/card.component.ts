import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss'
})
export class CardComponent {
  public cards: any = [
    {
      title: 'Shiba Inu',
      subtitle: 'Dog Breed',
      image: 'https://material.angular.io/assets/img/examples/shiba2.jpg',
      description: 'The Shiba Inu is the smallest of the six original spitz breeds of dog from Japan.',
    },
    {
      title: '22222',
      subtitle: 'Dog Breed',
      image: 'https://material.angular.io/assets/img/examples/shiba2.jpg',
      description: 'The Shiba Inu is the smallest of the six original spitz breeds of dog from Japan.',
    }, {
      title: '33333',
      subtitle: 'Dog Breed',
      image: 'https://material.angular.io/assets/img/examples/shiba2.jpg',
      description: 'The Shiba Inu is the smallest of the six original spitz breeds of dog from Japan.',
    },
    // Add more cards here if needed
  ];
  // constructor(private testservice: TestserviceService, private model: ModalService) {
  //   const message = this.testservice.getMessage();
  //   console.log("🚀 ~ CardComponent ~ constructor ~ message:", message)

  // }

  // cards = [
  //   {
  //     title: 'Shiba Inu',
  //     subtitle: 'Dog Breed',
  //     image: 'https://material.angular.io/assets/img/examples/shiba2.jpg',
  //     description: 'The Shiba Inu is the smallest of the six original spitz breeds of dog from Japan.',
  //   },
  //   {
  //     title: '22222',
  //     subtitle: 'Dog Breed',
  //     image: 'https://material.angular.io/assets/img/examples/shiba2.jpg',
  //     description: 'The Shiba Inu is the smallest of the six original spitz breeds of dog from Japan.',
  //   }, {
  //     title: '33333',
  //     subtitle: 'Dog Breed',
  //     image: 'https://material.angular.io/assets/img/examples/shiba2.jpg',
  //     description: 'The Shiba Inu is the smallest of the six original spitz breeds of dog from Japan.',
  //   },
  //   // Add more cards here if needed
  // ];
  // public   async openModal() {
  //   console.log(PlacesComponent);
    
  //   // await this.modalService.presentModal(PlacesComponent, { data: 'Hello from AppComponent' });
  // }
  // public drop(event: CdkDragDrop<string[]>) {
  //   moveItemInArray(this.cards, event.previousIndex, event.currentIndex);
  // }
}
