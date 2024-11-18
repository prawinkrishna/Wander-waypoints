import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from './components/profile/profile.component';
import { WanderLibraryComponent } from './wander-library.component';
import { TripCardComponent } from './components/trip-card/trip-card.component';
import { ItineraryComponent } from './components/itinerary/itinerary.component';
import { MatCardModule } from '@angular/material/card';
import { IonicModule } from '@ionic/angular';


@NgModule({
  declarations: [ProfileComponent,WanderLibraryComponent,TripCardComponent,ItineraryComponent],
  imports: [
    CommonModule,
    MatCardModule,
    IonicModule.forRoot(),

  ],
  exports: [ProfileComponent,WanderLibraryComponent,TripCardComponent,ItineraryComponent]
})
export class WanderLibraryModule { }
