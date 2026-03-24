import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface AddToTripDialogData {
  trips: any[];
  placeName: string;
}

@Component({
  selector: 'app-add-to-trip-dialog',
  template: `
    <h2 mat-dialog-title>Add to Trip</h2>
    <mat-dialog-content>
      <p class="subtitle">Add <strong>{{ data.placeName }}</strong> to one of your trips:</p>
      <mat-selection-list [multiple]="false" (selectionChange)="onSelectionChange($event)">
        <mat-list-option *ngFor="let trip of data.trips" [value]="trip">
          <mat-icon matListItemIcon>map</mat-icon>
          <div matListItemTitle>{{ trip.title }}</div>
          <div matListItemLine>{{ trip.destination || 'No destination' }}</div>
        </mat-list-option>
      </mat-selection-list>
      <div *ngIf="data.trips.length === 0" class="empty-state">
        <mat-icon>flight</mat-icon>
        <p>No trips yet. Create one first!</p>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button color="primary" [disabled]="!selectedTrip" (click)="onConfirm()">
        Add to Trip
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .subtitle {
      margin: 0 0 16px;
      color: var(--color-text-secondary);
      font-size: 14px;
    }
    .empty-state {
      text-align: center;
      padding: 32px 16px;
      color: var(--color-text-tertiary);
    }
    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      opacity: 0.5;
      margin-bottom: 8px;
    }
    mat-dialog-content {
      min-width: 350px;
    }
  `]
})
export class AddToTripDialogComponent {
  selectedTrip: any = null;

  constructor(
    public dialogRef: MatDialogRef<AddToTripDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddToTripDialogData
  ) {}

  onSelectionChange(event: any): void {
    this.selectedTrip = event.options[0]?.value || null;
  }

  onConfirm(): void {
    if (this.selectedTrip) {
      this.dialogRef.close(this.selectedTrip);
    }
  }
}
