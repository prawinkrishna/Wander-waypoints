import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { debounceTime, switchMap } from 'rxjs/operators';
import { MapService, SearchLocation } from '../core/service/map.service';

export interface AddPlaceDialogData {
  tripId: string;
  totalDays: number;
}

@Component({
  selector: 'app-add-place-dialog',
  templateUrl: './add-place-dialog.component.html',
  styleUrls: ['./add-place-dialog.component.scss']
})
export class AddPlaceDialogComponent implements OnInit {
  searchControl = new FormControl();
  searchResults: SearchLocation[] = [];
  selectedPlace: SearchLocation | null = null;
  selectedDay = 1;
  selectedTimeSlot = 'morning';
  searching = false;

  timeSlots = [
    { value: 'morning', label: 'Morning', icon: 'wb_sunny' },
    { value: 'afternoon', label: 'Afternoon', icon: 'light_mode' },
    { value: 'evening', label: 'Evening', icon: 'nights_stay' }
  ];

  days: number[] = [];

  constructor(
    public dialogRef: MatDialogRef<AddPlaceDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddPlaceDialogData,
    private mapService: MapService
  ) {
    // Generate days array
    this.days = Array.from({ length: Math.max(data.totalDays, 7) }, (_, i) => i + 1);
  }

  ngOnInit() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      switchMap(async (value) => {
        if (typeof value !== 'string' || value.length < 3) return [];
        this.searching = true;
        try {
          return await this.mapService.searchPlaces(value).toPromise();
        } catch (error) {
          return [];
        }
      })
    ).subscribe((results: any) => {
      this.searchResults = results || [];
      this.searching = false;
    });
  }

  selectPlace(place: SearchLocation) {
    this.selectedPlace = place;
    this.searchControl.setValue(place.label);
    this.searchResults = [];
  }

  onConfirm() {
    if (!this.selectedPlace) return;

    this.dialogRef.close({
      place: {
        name: this.selectedPlace.label.split(',')[0],
        latitude: this.selectedPlace.y,
        longitude: this.selectedPlace.x,
        address: this.selectedPlace.label,
        raw: this.selectedPlace.raw
      },
      dayNumber: this.selectedDay,
      timeSlot: this.selectedTimeSlot
    });
  }

  onCancel() {
    this.dialogRef.close(null);
  }
}
