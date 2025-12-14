import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TripDetailsRoutingModule } from './trip-details-routing.module';
import { TripDetailsPage } from './trip-details.page';
import { SharedModule } from '../../components/shared/shared.module';
import { WanderLibraryModule } from 'wander-library';
import { ItineraryTimelineComponent } from '../../components/itinerary-timeline/itinerary-timeline.component';

@NgModule({
  declarations: [TripDetailsPage, ItineraryTimelineComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    DragDropModule,
    TripDetailsRoutingModule,
    SharedModule,
    WanderLibraryModule
  ],
})
export class TripDetailsModule { }
