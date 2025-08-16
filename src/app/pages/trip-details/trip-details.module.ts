import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripDetailsRoutingModule } from './trip-details-routing.module';
import { TripDetailsPage } from './trip-details.page';

@NgModule({
  declarations: [TripDetailsPage],
  imports: [CommonModule, TripDetailsRoutingModule],
})
export class TripDetailsModule {}
