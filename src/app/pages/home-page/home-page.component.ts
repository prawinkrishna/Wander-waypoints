import { Component, OnInit } from '@angular/core';
import { ModelService } from '../../core/service/model.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent implements OnInit {

  constructor(private modelService: ModelService) {

  }

  ngOnInit() {
   this.modelService.displaystring()
  }
}
