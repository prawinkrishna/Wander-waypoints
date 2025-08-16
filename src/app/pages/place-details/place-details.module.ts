import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlaceDetailsPage } from './place-details.page';
import { PlaceDetailsRoutingModule } from './place-details-routing.module';

@NgModule({
  declarations: [PlaceDetailsPage],
  imports: [CommonModule, PlaceDetailsRoutingModule],
})
export class PlaceDetailsModule {}
