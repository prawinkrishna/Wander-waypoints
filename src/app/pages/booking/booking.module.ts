import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingRoutingModule } from './booking-routing.module';
import { BookingPage } from './booking.page';

@NgModule({
  declarations: [BookingPage],
  imports: [CommonModule, BookingRoutingModule],
})
export class BookingModule {}
