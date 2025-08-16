import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TripFeedPage } from './trip-feed.page';

const routes: Routes = [
  { path: '', component: TripFeedPage }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TripFeedRoutingModule {}
