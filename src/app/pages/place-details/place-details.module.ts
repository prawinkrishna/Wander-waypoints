import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PlaceDetailsPage } from './place-details.page';
import { PlaceDetailsRoutingModule } from './place-details-routing.module';
import { SharedModule } from '../../components/shared/shared.module';
import { WanderLibraryModule } from 'wander-library';

@NgModule({
  declarations: [PlaceDetailsPage],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    PlaceDetailsRoutingModule,
    SharedModule,
    WanderLibraryModule
  ],
})
export class PlaceDetailsModule { }
