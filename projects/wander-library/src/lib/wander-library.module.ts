import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GpsComponent } from './components/gps/gps.component';
import { ProfileComponent } from './components/profile/profile.component';
import { WanderLibraryComponent } from './wander-library.component';
import { TripCardComponent } from './components/trip-card/trip-card.component';
import { ItineraryComponent } from './components/itinerary/itinerary.component';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { IonicModule } from '@ionic/angular';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { ApiService } from './provider/api.service';


@NgModule({
  declarations: [ProfileComponent,WanderLibraryComponent,TripCardComponent,ItineraryComponent,GpsComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    IonicModule.forRoot(),
    DragDropModule,
    HttpClientModule

  ],
  exports: [ProfileComponent,WanderLibraryComponent,TripCardComponent,ItineraryComponent,GpsComponent, MatIconModule],
  providers: [ApiService]
})
export class WanderLibraryModule { }
