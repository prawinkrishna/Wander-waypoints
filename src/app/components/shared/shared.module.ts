import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ItineraryTimelineComponent } from '../../components/itinerary-timeline/itinerary-timeline.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { TripRequestCardComponent } from './trip-request-card/trip-request-card.component';
import { BidCardComponent } from './bid-card/bid-card.component';
import { AgentProfileCardComponent } from './agent-profile-card/agent-profile-card.component';
import { BidChatComponent } from './bid-chat/bid-chat.component';
import { EditTripDialogComponent } from '../edit-trip-dialog/edit-trip-dialog.component';
import { AiTripChatComponent } from '../ai-trip-chat/ai-trip-chat.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  declarations: [
    NavbarComponent,
    ItineraryTimelineComponent,
    ConfirmDialogComponent,
    TripRequestCardComponent,
    BidCardComponent,
    AgentProfileCardComponent,
    BidChatComponent,
    EditTripDialogComponent,
    AiTripChatComponent
  ],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    MatAutocompleteModule,
    DragDropModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule
  ],
  exports: [
    NavbarComponent,
    ItineraryTimelineComponent,
    ConfirmDialogComponent,
    TripRequestCardComponent,
    BidCardComponent,
    AgentProfileCardComponent,
    BidChatComponent,
    EditTripDialogComponent,
    AiTripChatComponent,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDividerModule,
    DragDropModule,
    MatDialogModule,
    MatSnackBarModule
  ]
})
export class SharedModule { }
