import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { PlaceDetailsPage } from './place-details.page';
import { PlaceDetailsRoutingModule } from './place-details-routing.module';
import { SharedModule } from '../../components/shared/shared.module';
import { WanderLibraryModule } from 'wander-library';
import { AddToTripDialogComponent } from '../../components/add-to-trip-dialog/add-to-trip-dialog.component';

@NgModule({
  declarations: [PlaceDetailsPage, AddToTripDialogComponent],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatListModule,
    PlaceDetailsRoutingModule,
    SharedModule,
    WanderLibraryModule
  ],
})
export class PlaceDetailsModule { }
