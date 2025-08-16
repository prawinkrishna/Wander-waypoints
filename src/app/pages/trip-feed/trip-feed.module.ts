import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripFeedRoutingModule } from './trip-feed-routing.module';
import { TripFeedPage } from './trip-feed.page';

@NgModule({
  declarations: [TripFeedPage],
  imports: [CommonModule, TripFeedRoutingModule],
})
export class TripFeedModule {}
